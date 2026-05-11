import { useState, useEffect, useCallback, useRef } from 'react';
import notificationService from '../services/notificationService';

const useNotifications = (authToken) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // مراجع لتتبع الحالة
  const prevUnreadCountRef = useRef(0);
  const pollingIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // دالة لجلب الإشعارات
  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    if (!authToken) return;
    
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await notificationService.getNotifications(pageNum, authToken);
      
      if (!isMountedRef.current) return;

      const newNotifications = data.results || data;
      
      setNotifications(prev => {
        if (append) {
          // تجنب التكرار عند الإضافة
          const existingIds = new Set(prev.map(n => n.id));
          const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
          return [...prev, ...uniqueNew];
        } else {
          return newNotifications;
        }
      });

      setHasMore(!!data.next);
      setPage(pageNum);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch notifications');
      }
    } finally {
      if (isMountedRef.current) {
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    }
  }, [authToken]);

  // دالة لجلب العدد غير المقروء
  const fetchUnreadCount = useCallback(async () => {
    if (!authToken) return 0;
    
    try {
      const data = await notificationService.getUnreadCount(authToken);
      const count = data.count || 0;
      
      if (isMountedRef.current) {
        setUnreadCount(count);
        prevUnreadCountRef.current = count;
      }
      return count;
    } catch (err) {
      console.error('Error in fetchUnreadCount:', err);
      return 0;
    }
  }, [authToken]);

  // دالة لجلب آخر الإشعارات (للـ Polling)
  const fetchRecentNotifications = useCallback(async () => {
    if (!authToken) return [];
    
    try {
      const recent = await notificationService.getRecentNotifications(authToken);
      return recent;
    } catch (err) {
      console.error('Error fetching recent notifications:', err);
      return [];
    }
  }, [authToken]);

  // دالة لدمج الإشعارات الجديدة مع القائمة الحالية
  const mergeNewNotifications = useCallback((newNotifs) => {
    if (!newNotifs || newNotifs.length === 0) return;
    
    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const uniqueNew = newNotifs.filter(n => !existingIds.has(n.id));
      
      if (uniqueNew.length === 0) return prev;
      
      // ترتيب تنازلي حسب التاريخ (الأحدث أولاً)
      const sorted = [...uniqueNew, ...prev].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      return sorted;
    });
  }, []);

  // دالة الـ Polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      if (!authToken || !isMountedRef.current) return;

      try {
        // جلب العدد الحالي
        const currentUnread = await fetchUnreadCount();
        
        // مقارنة مع العدد السابق
        if (currentUnread > prevUnreadCountRef.current) {
          // هناك إشعارات جديدة - نجلب آخر الإشعارات
          const recent = await fetchRecentNotifications();
          
          if (recent.length > 0 && isMountedRef.current) {
            mergeNewNotifications(recent);
            
            // إظهار إشعار سطح المكتب
            if ('Notification' in window && Notification.permission === 'granted') {
              const latestNotif = recent[0];
              new Notification(latestNotif.title, {
                body: latestNotif.message,
                icon: '/logo.png',
                silent: false
              });
            }
          }
        } else if (currentUnread < prevUnreadCountRef.current) {
          // تمت قراءة إشعار من جهاز آخر - نحدث القائمة محلياً
          setNotifications(prev => 
            prev.map(n => ({ ...n, is_read: true }))
          );
        }

        prevUnreadCountRef.current = currentUnread;
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 10000); // كل 10 ثوانٍ

  }, [authToken, fetchUnreadCount, fetchRecentNotifications, mergeNewNotifications]);

  // بدء/إيقاف الـ Polling
  useEffect(() => {
    isMountedRef.current = true;

    if (authToken) {
      // جلب البيانات الأولية
      fetchNotifications(1);
      fetchUnreadCount();
      
      // بدء الـ Polling
      startPolling();
    }

    // تنظيف عند إزالة المكون
    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [authToken, fetchNotifications, fetchUnreadCount, startPolling]);

  // دالة تعليم إشعار كمقروء
  const markAsRead = useCallback(async (notificationId) => {
    if (!authToken) return;

    try {
      const result = await notificationService.markAsRead(notificationId, authToken);
      
      if (!isMountedRef.current) return;

      // تحديث القائمة محلياً
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );

      // تحديث العدد
      if (result && typeof result.unread_count === 'number') {
        setUnreadCount(result.unread_count);
        prevUnreadCountRef.current = result.unread_count;
      } else {
        setUnreadCount(prev => {
          const newCount = Math.max(prev - 1, 0);
          prevUnreadCountRef.current = newCount;
          return newCount;
        });
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [authToken]);

  // دالة تعليم الكل كمقروء
  const markAllAsRead = useCallback(async () => {
    if (!authToken) return;

    try {
      const result = await notificationService.markAllAsRead(authToken);
      
      if (!isMountedRef.current) return;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      prevUnreadCountRef.current = 0;
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [authToken]);

  // دالة حذف إشعار
  const deleteNotification = useCallback(async (notificationId) => {
    if (!authToken) return;

    try {
      await notificationService.deleteNotification(notificationId, authToken);
      
      if (!isMountedRef.current) return;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // تحديث العدد غير المقروء
      const updatedUnread = await fetchUnreadCount();
      prevUnreadCountRef.current = updatedUnread;
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [authToken, fetchUnreadCount]);

  // دالة للحصول على الإشعارات غير المقروءة
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.is_read);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    error,
    page,
    hasMore,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadNotifications,
    // دوال مساعدة (للاستخدام الداخلي)
    setUnreadCount,
    mergeNewNotifications
  };
};

export default useNotifications;