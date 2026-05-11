/**
 * مثال: استخدام نظام الإشعارات
 * يمكن نسخ هذا الملف كمرجع للتطبيق الخاص بك
 */

// ===== في App.js =====
// import NotificationProvider from './components/NotificationProvider';

// function App() {
//   const { authToken } = useAuth(); // افترضنا وجود نظام مصادقة
//
//   return (
//     <NotificationProvider authToken={authToken}>
//       <Router>
//         {/* باقي التطبيق */}
//       </Router>
//     </NotificationProvider>
//   );
// }

// ===== في Navbar.js =====
// import NotificationBell from './components/NotificationBell';
//
// function Navbar() {
//   const { authToken } = useAuth();
//
//   return (
//     <AppBar position="static">
//       <Toolbar>
//         {/* الأيقونات الأخرى */}
//         <NotificationBell authToken={authToken} />
//       </Toolbar>
//     </AppBar>
//   );
// }

// ===== استخدام الإشعارات من مكون =====
// import { useNotificationContext } from './components/NotificationProvider';
// import NotificationToast from './components/NotificationToast';
//
// function MyComponent() {
//   const {
//     notifications,
//     unreadCount,
//     fetchNotifications,
//     markAsRead,
//     deleteNotification,
//     getNotificationsByStore
//   } = useNotificationContext();
//
//   const [displayedNotification, setDisplayedNotification] = React.useState(null);
//
//   // الحصول على الإشعارات الخاصة بمتجر معين
//   const handleViewStoreNotifications = (storeId) => {
//     fetchNotifications(1, false, storeId);
//   };
//
//   // عرض إشعار كـ toast
//   const handleShowNotification = (notification) => {
//     setDisplayedNotification(notification);
//   };
//
//   return (
//     <div>
//       <p>عدد الإشعارات غير المقروءة: {unreadCount}</p>
//
//       <button onClick={() => handleViewStoreNotifications(1)}>
//         عرض إشعارات المتجر 1
//       </button>
//
//       <NotificationToast
//         notification={displayedNotification}
//         onClose={() => setDisplayedNotification(null)}
//         duration={5000}
//       />
//     </div>
//   );
// }

// ===== استخدام الخدمات مباشرة =====
// import notificationService from './services/notificationService';
//
// // جلب الإشعارات غير المقروءة فقط
// const unreadNotifications = await notificationService.getRecentNotifications(authToken);
//
// // جلب إشعارات متجر معين
// const storeNotifications = await notificationService.getNotificationsByStore(
//   storeId,
//   pageNumber,
//   authToken
// );
//
// // تعيين إشعار كمقروء
// await notificationService.markAsRead(notificationId, authToken);
//
// // تعيين جميع الإشعارات كمقروءة
// await notificationService.markAllAsRead(authToken);
//
// // الحصول على عدد الإشعارات غير المقروءة
// const count = await notificationService.getUnreadCount(authToken);

// ===== في Backend - إنشاء إشعار =====
// from notifications.services import create_notification
//
// # عند إضافة بيانات جديدة أو حدث معين
// create_notification(
//     user=request.user,
//     title='كاميرا جديدة',
//     message=f'تم إضافة كاميرا جديدة: {camera.name}',
//     notification_type='success',
//     data={'camera_id': camera.id, 'url': f'/cameras/{camera.id}'}
// )

// ===== إعدادات البيئة (.env) =====
// REACT_APP_API_URL=http://localhost:8000/api
// REACT_APP_WS_URL=ws://localhost:8000

export const NotificationUsageExample = () => {
  // هذا ملف توثيقي فقط - لا يتم تشغيله مباشرة
  return null;
};
