/**
 * types/notification.ts
 * أنواع البيانات للإشعارات
 */

export interface Notification {
  id: number;
  store: number;                    // معرّف المتجر/الجهاز
  store_id: number;                 // معرّف المتجر (من التسلسل)
  store_name: string;               // اسم المتجر
  user: number;                     // معرّف المستخدم
  user_name: string;                // اسم المستخدم
  title: string;                    // عنوان التنبيه
  message: string;                  // محتوى التنبيه
  notification_type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;                 // هل تم قراءة التنبيه
  timestamp: string;                // تاريخ وساعة التنبيه (ISO format)
  time_ago: string;                 // الوقت المضي (مثل "قبل 5 دقائق")
  data?: Record<string, any>;       // بيانات إضافية
}

export interface NotificationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationFilters {
  storeId?: number;
  isRead?: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'error';
  store_id: number;
  data?: Record<string, any>;
}
