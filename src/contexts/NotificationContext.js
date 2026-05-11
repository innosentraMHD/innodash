import React, { createContext, useContext, useEffect } from 'react';
import useNotifications from '../hooks/useNotifications';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children, authToken }) => {
  const notificationData = useNotifications(authToken);

  const value = {
    ...notificationData,
    // دوال مساعدة إضافية
    getNotificationsByStore: (storeId) => {
      return notificationData.notifications.filter(n => n.store_id === storeId);
    },
    getUnreadByStore: (storeId) => {
      return notificationData.notifications.filter(
        n => n.store_id === storeId && !n.is_read
      );
    },
    getNotificationsByType: (type) => {
      return notificationData.notifications.filter(
        n => n.notification_type === type
      );
    }
  };

  // لا حاجة لـ useEffect إضافي لأن useNotifications يتولى الجلب المبدئي

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook مساعد لاستخدام Context
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};