# ⚡ Quick Start - نظام الإشعارات

**تم إعداد كل شيء! ابدأ الآن بـ 5 خطوات فقط:**

---

## 🚀 خطوة 1: تثبيت المكتبات (1 دقيقة)

```bash
npm install date-fns
```

✅ تحقق من وجود `@mui/material` و `axios`:
```bash
npm list @mui/material axios
```

---

## 🔧 خطوة 2: تحديث App.js (2 دقيقة)

**افتح:** `src/App.js`

**أضف في الاستيرادات:**
```javascript
import { NotificationProvider } from './components/NotificationProvider';
```

**غيّر الـ return:**
```javascript
// من:
return <Router>...</Router>

// إلى:
return (
  <NotificationProvider authToken={authToken}>
    <Router>...</Router>
  </NotificationProvider>
);
```

✅ **تم!**

---

## 🔔 خطوة 3: تحديث Navbar.js (2 دقيقة)

**افتح:** `src/components/Navbar.js`

**أضف في الاستيرادات:**
```javascript
import NotificationBell from './NotificationBell';
```

**أضف في JSX (قبل الأيقونات الأخرى):**
```javascript
<NotificationBell authToken={authToken} />
```

✅ **تم!**

---

## 📝 خطوة 4: إعداد متغيرات البيئة (1 دقيقة)

**أنشئ ملف:** `.env` (في جذر المشروع)

```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000
```

✅ **تم!**

---

## ✅ خطوة 5: اختبار التشغيل (1 دقيقة)

```bash
npm start
```

**افتح المتصفح** وانتظر ظهور جرس الإشعارات:

- ✅ يجب أن تراه في الـ navbar
- ✅ اضغط عليه لفتح popover
- ✅ إذا لم تر "لا توجد إشعارات"، يعني كل شيء يعمل!

---

## 🎉 النتيجة

تم! لديك الآن:
- ✅ جرس إشعارات جميل
- ✅ popover مع قائمة الإشعارات
- ✅ اتصال WebSocket (عندما يعمل Backend)
- ✅ toast عند إشعار جديد

---

## 🔗 الخطوة التالية: تفعيل Backend

تأكد من تشغيل Backend:

```bash
# في folder Django
daphne -b 0.0.0.0 -p 8000 your_project.asgi:application
```

أو:
```bash
python manage.py runserver
```

---

## 🐛 إذا حدثت مشكلة

### ❌ لا تظهر الإشعارات
1. تحقق من Backend يعمل
2. افتح console (F12) وابحث عن الأخطاء
3. اقرأ `NOTIFICATIONS_README.md`

### ❌ WebSocket لا يتصل
1. تأكد من تشغيل `daphne`
2. تحقق من عنوان المنفذ (8000)
3. افتح `http://localhost:8000` للتحقق

### ❌ لا يعمل API
1. تحقق من `REACT_APP_API_URL` في `.env`
2. افتح DevTools والتحقق من Network tab
3. اقرأ `NOTIFICATIONS_README.md` قسم استكشاف الأخطاء

---

## 📚 قراءات إضافية

| الملف | الوقت | الوصف |
|------|-------|-------|
| NOTIFICATIONS_README.md | 30 دقيقة | توثيق شامل |
| NOTIFICATION_USAGE.js | 15 دقيقة | أمثلة عملية |
| NOTIFICATIONS_TIPS.md | 20 دقيقة | نصائح متقدمة |

---

## 💡 نصائح سريعة

### الاستخدام من مكون:
```javascript
import { useNotificationContext } from './components/NotificationProvider';

function MyComponent() {
  const { unreadCount, markAsRead } = useNotificationContext();
  return <div>إشعارات: {unreadCount}</div>;
}
```

### عرض toast عند إشعار جديد:
```javascript
import NotificationToast from './components/NotificationToast';

<NotificationToast 
  notification={newNotification}
  onClose={handleClose}
/>
```

### جلب من service:
```javascript
import notificationService from './services/notificationService';

const notifications = await notificationService.getNotifications(1, authToken);
```

---

## ✨ ماذا يمكنك أن تفعل الآن؟

- ✅ عرض الإشعارات
- ✅ تعيين كمقروء
- ✅ حذف إشعار
- ✅ تصفية حسب المتجر
- ✅ عرض toast عند إشعار جديد
- ✅ إعادة اتصال WebSocket تلقائياً

---

## 🎓 التعمق أكثر

انظر إلى هذه الملفات لتعلم المزيد:

```
src/components/NotificationBell.js    ← كيف يعمل الجرس
src/hooks/useNotifications.js         ← إدارة الحالة
src/services/notificationService.js   ← API calls
src/hooks/useWebSocket.js             ← اتصال real-time
```

---

## 🚀 الخطوات التالية (اختياري)

- [ ] إضافة حذف الإشعارات
- [ ] إضافة بحث وفلترة
- [ ] إضافة تنبيهات صوتية
- [ ] إضافة animations
- [ ] إضافة dark mode

---

## 📞 هل تحتاج مساعدة؟

1. **اقرأ:** `NOTIFICATIONS_README.md` - توثيق شامل
2. **ابحث:** في `NOTIFICATIONS_TIPS.md` عن حلول
3. **جرّب:** `src/utils/mockNotificationServer.js` لاختبار بدون Backend

---

**شكراً! استمتع بالإشعارات! 🎉**

تم إعداد كل شيء بعناية لك. الآن يمكنك:
- ✨ تشغيل التطبيق مباشرة
- 🚀 بدء تطوير features جديدة
- 📱 إضافة إشعارات في أي مكان في التطبيق
