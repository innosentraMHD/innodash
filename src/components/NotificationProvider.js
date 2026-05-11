import React, { createContext, useCallback, useEffect } from 'react';
import useNotifications from '../hooks/useNotifications';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children, authToken }) => {
  const notificationData = useNotifications(authToken);

  const value = {
    ...notificationData,
    // يمكن إضافة دوال مساعدة إضافية هنا
    getNotificationsByStore: (storeId) => {
      return notificationData.notifications.filter(n => n.store_id === storeId);
    },
    getUnreadByStore: (storeId) => {
      return notificationData.notifications.filter(n => n.store_id === storeId && !n.is_read);
    }
  };

  // On mount: fetch first page of notifications and unread count
  useEffect(() => {
    if (authToken) {
      // fetch notifications if none cached locally
      if (!notificationData.notifications || notificationData.notifications.length === 0) {
        notificationData.fetchNotifications(1).catch(() => {});
      }
      // ensure unread count is synced
      notificationData.fetchUnreadCount().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook مساعد لاستخدام Context
export const useNotificationContext = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext يجب أن يكون داخل NotificationProvider');
  }
  return context;
};
