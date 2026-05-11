# 🔔 نظام الإشعارات - التوثيق الكامل

## 📋 نظرة عامة

نظام إشعارات متكامل يعمل بـ Real-time باستخدام WebSocket، مع دعم:
- ✅ إشعارات حقيقية الوقت
- ✅ تتبع الحالة (مقروء/غير مقروء)
- ✅ تصفية حسب المتجر
- ✅ إشعارات المتصفح
- ✅ Pagination للإشعارات

---

## 📁 هيكل الملفات

```
src/
├── components/
│   ├── NotificationBell.js          # مكون الجرس الرئيسي
│   ├── NotificationProvider.js      # Context Provider
│   └── NotificationToast.js         # إشعارات عائمة
├── hooks/
│   ├── useWebSocket.js              # Hook للـ WebSocket
│   └── useNotifications.js          # Hook لإدارة الحالة
├── services/
│   └── notificationService.js       # خدمة API
├── types/
│   └── notification.ts              # TypeScript types
└── docs/
    └── NOTIFICATION_USAGE.js        # أمثلة الاستخدام
```

---

## 🚀 التثبيت والإعداد

### 1. التبعيات المطلوبة

```bash
npm install date-fns axios
# تأكد من وجود:
npm list @mui/material @mui/icons-material @emotion/react @emotion/styled
```

### 2. إضافة البيئة (.env)

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000
```

### 3. تحديث App.js

```javascript
import { NotificationProvider } from './components/NotificationProvider';

function App() {
  const { authToken } = useAuth();
  
  return (
    <NotificationProvider authToken={authToken}>
      {/* باقي التطبيق */}
    </NotificationProvider>
  );
}
```

### 4. إضافة NotificationBell في Navbar

```javascript
import NotificationBell from './components/NotificationBell';

function Navbar() {
  const { authToken } = useAuth();
  
  return (
    <AppBar>
      <Toolbar>
        {/* أيقونات أخرى */}
        <NotificationBell authToken={authToken} />
      </Toolbar>
    </AppBar>
  );
}
```

---

## 📖 واجهات البيانات (Types)

### Notification
```typescript
{
  id: number;
  store: number;                    // معرّف المتجر
  store_id: number;                 // معرّف المتجر (تسلسلي)
  store_name: string;               // اسم المتجر
  user: number;                     // معرّف المستخدم
  user_name: string;                // اسم المستخدم
  title: string;                    // عنوان
  message: string;                  // المحتوى
  notification_type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;                 // هل تم قراءته
  timestamp: string;                // ISO date
  time_ago: string;                 // "قبل 5 دقائق"
  data?: Record<string, any>;       // بيانات إضافية
}
```

---

## 🎯 الـ Hooks المتاحة

### useNotifications(authToken)

```javascript
const {
  // البيانات
  notifications,        // قائمة الإشعارات
  unreadCount,         // عدد غير المقروءة
  loading,             // حالة التحميل
  page,                // رقم الصفحة الحالية
  hasMore,             // هل يوجد المزيد
  currentStoreId,      // معرّف المتجر الحالي

  // الدوال
  fetchNotifications,         // جلب الإشعارات
  fetchRecentNotifications,   // جلب آخر 10
  fetchUnreadCount,           // جلب عدد غير المقروءة
  markAsRead,                 // تعيين كمقروء
  markAllAsRead,              // تعيين الكل كمقروء
  addNewNotification,         // إضافة إشعار جديد
  deleteNotification,         // حذف إشعار
  getNotificationsByType,     // تصفية حسب النوع
  getUnreadNotifications      // الحصول على غير المقروءة
} = useNotifications(authToken);
```

### useWebSocket(url, options)

```javascript
const { send, ws, disconnect, isConnected } = useWebSocket(wsUrl, {
  onMessage: (data) => {},      // عند استقبال رسالة
  onOpen: () => {},              // عند الاتصال
  onClose: () => {},             // عند قطع الاتصال
  onError: (error) => {},        // عند حدوث خطأ
  shouldReconnect: true,         // محاولة إعادة الاتصال
  reconnectInterval: 5000,       // بعد كم ميلي ثانية
  maxReconnectAttempts: null     // أقصى محاولات (null = بلا حد)
});

// الاستخدام:
send({ type: 'get_unread_count' });
disconnect();
```

### useNotificationContext()

```javascript
// للاستخدام داخل NotificationProvider
const {
  notifications,
  unreadCount,
  fetchNotifications,
  // ... وجميع دوال useNotifications
  getNotificationsByStore,  // إضافي
  getUnreadByStore          // إضافي
} = useNotificationContext();
```

---

## 🔌 خدمة API (notificationService)

### الطرق المتاحة

```javascript
import notificationService from './services/notificationService';

// جلب الإشعارات (مع pagination)
await notificationService.getNotifications(page, authToken);

// جلب إشعارات متجر معين
await notificationService.getNotificationsByStore(storeId, page, authToken);

// عدد الإشعارات غير المقروءة
await notificationService.getUnreadCount(authToken);

// آخر 10 إشعارات غير مقروءة
await notificationService.getRecentNotifications(authToken);

// تعيين إشعار كمقروء
await notificationService.markAsRead(notificationId, authToken);

// تعيين جميع الإشعارات كمقروءة
await notificationService.markAllAsRead(authToken);

// حذف إشعار
await notificationService.deleteNotification(notificationId, authToken);
```

---

## 💡 أمثلة الاستخدام

### مثال 1: عرض الإشعارات في مكون

```javascript
import { useNotificationContext } from './components/NotificationProvider';

function StoreNotifications({ storeId }) {
  const { 
    notifications, 
    fetchNotifications,
    markAsRead 
  } = useNotificationContext();

  useEffect(() => {
    fetchNotifications(1, false, storeId);
  }, [storeId]);

  const storeNotifications = notifications.filter(n => n.store_id === storeId);

  return (
    <div>
      {storeNotifications.map(notif => (
        <div 
          key={notif.id} 
          onClick={() => markAsRead(notif.id)}
          style={{
            backgroundColor: notif.is_read ? 'white' : '#f0f0f0'
          }}
        >
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <small>{notif.time_ago}</small>
        </div>
      ))}
    </div>
  );
}
```

### مثال 2: عرض toast عند إشعار جديد

```javascript
import NotificationToast from './components/NotificationToast';
import { useNotificationContext } from './components/NotificationProvider';

function MyComponent() {
  const { notifications } = useNotificationContext();
  const [displayedNotif, setDisplayedNotif] = useState(null);

  // عرض أول إشعار غير مقروء كـ toast
  useEffect(() => {
    const unread = notifications.find(n => !n.is_read);
    if (unread && !displayedNotif) {
      setDisplayedNotif(unread);
    }
  }, [notifications]);

  return (
    <>
      {/* محتوى المكون */}
      <NotificationToast
        notification={displayedNotif}
        onClose={() => setDisplayedNotif(null)}
        duration={5000}
      />
    </>
  );
}
```

### مثال 3: تصفية حسب نوع الإشعار

```javascript
function NotificationsByType({ type }) {
  const { getNotificationsByType } = useNotificationContext();
  
  const filtered = getNotificationsByType(type);

  return (
    <div>
      <h2>إشعارات من نوع: {type}</h2>
      {filtered.map(notif => (
        <div key={notif.id}>{notif.title}</div>
      ))}
    </div>
  );
}
```

---

## 🔧 العمليات الشائعة

### جلب الإشعارات

```javascript
// جلب الكل
await fetchNotifications(1);

// جلب صفحة محددة
await fetchNotifications(2);

// إضافة إلى القائمة الموجودة (تحميل المزيد)
await fetchNotifications(2, true);

// جلب إشعارات متجر معين
await fetchNotifications(1, false, storeId);
```

### تعيين كمقروء

```javascript
// إشعار واحد
await markAsRead(notificationId);

// جميع الإشعارات
await markAllAsRead();
```

### الحصول على بيانات محددة

```javascript
// غير المقروءة فقط
const unread = getUnreadNotifications();

// من نوع معين
const errors = getNotificationsByType('error');

// من متجر معين
const storeNotifs = notifications.filter(n => n.store_id === storeId);
```

---

## ⚙️ الإعدادات المتقدمة

### تخصيص WebSocket

في `NotificationBell.js`:

```javascript
const wsUrl = `ws://${window.location.hostname}:${window.location.port || 8000}/ws/notifications/`;

const { send } = useWebSocket(wsUrl, {
  onMessage: (data) => {
    // معالجة مخصصة
    console.log('Received:', data);
  },
  maxReconnectAttempts: 10  // حد أقصى 10 محاولات
});
```

### تخصيص Toast

```javascript
<NotificationToast
  notification={notif}
  onClose={handleClose}
  duration={10000}  // 10 ثوان بدل 5
/>
```

---

## 🛡️ معالجة الأخطاء

جميع الدوال تتعامل مع الأخطاء بشكل آمن:

```javascript
try {
  await markAsRead(notificationId);
} catch (error) {
  console.error('خطأ في تعيين الإشعار:', error);
  // عرض رسالة خطأ للمستخدم
}
```

---

## 🔐 الأمان

- جميع الطلبات تتضمن token المصادقة
- WebSocket محمي عبر AuthMiddleware من Django
- لا يمكن الوصول للإشعارات التي لا تخص المستخدم

---

## 📱 دعم التجاوب

المكونات مبنية بـ Material-UI وتدعم:
- ✅ جميع أحجام الشاشات
- ✅ الوضع الليلي
- ✅ الاتجاه من اليمين لليسار (RTL)

---

## 🐛 استكشاف الأخطاء

### WebSocket لا يتصل
- تأكد من تشغيل backend على المنفذ الصحيح
- تحقق من إعدادات CORS والـ ASGI
- افتح console في المتصفح للتحقق من الأخطاء

### لا تظهر الإشعارات الجديدة
- تأكد من signal التسجيل في `notifications/apps.py`
- تحقق من WebSocket log

### الأداء بطيء مع إشعارات كثيرة
- استخدم Pagination
- قم بحذف الإشعارات القديمة من قاعدة البيانات

---

## 📞 الدعم والمساعدة

لأي استفسار أو مشكلة، راجع:
1. `src/docs/NOTIFICATION_USAGE.js` - أمثلة إضافية
2. الـ Backend documentation
3. Django Channels docs: https://channels.readthedocs.io/
