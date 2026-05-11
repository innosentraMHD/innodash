#!/usr/bin/env node

/**
 * Mock Notification Server
 * خادم محاكاة لتطوير واختبار نظام الإشعارات
 * 
 * الاستخدام:
 * node src/utils/mockNotificationServer.js
 */

const WebSocket = require('ws');
const http = require('http');

const PORT = 8000;
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// تخزين مؤقت للإشعارات
const notifications = [];
let notificationId = 1;

const mockNotificationTypes = [
  { type: 'info', title: 'معلومة جديدة', message: 'هناك معلومة مهمة' },
  { type: 'success', title: 'نجحت العملية', message: 'تم حفظ البيانات بنجاح' },
  { type: 'warning', title: 'تحذير', message: 'يجب الانتباه لهذه النقطة' },
  { type: 'error', title: 'حدث خطأ', message: 'حدث خطأ في النظام' }
];

// إنشاء إشعار عشوائي
function createRandomNotification() {
  const randomIndex = Math.floor(Math.random() * mockNotificationTypes.length);
  const template = mockNotificationTypes[randomIndex];

  return {
    id: notificationId++,
    store: 1,
    store_id: 1,
    store_name: 'Store 1',
    user: 1,
    user_name: 'Admin',
    title: template.title,
    message: template.message,
    notification_type: template.type,
    is_read: false,
    timestamp: new Date().toISOString(),
    time_ago: 'الآن',
    data: {}
  };
}

// معالجة الاتصالات الجديدة
wss.on('connection', (ws, req) => {
  console.log('✅ عميل جديد متصل');

  // إرسال الإشعارات الموجودة
  ws.send(JSON.stringify({
    type: 'initial_notifications',
    notifications: notifications
  }));

  // معالجة الرسائل من العميل
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 رسالة من العميل:', data);

      if (data.type === 'get_unread_count') {
        const unreadCount = notifications.filter(n => !n.is_read).length;
        ws.send(JSON.stringify({
          type: 'unread_count',
          count: unreadCount
        }));
      }
    } catch (error) {
      console.error('❌ خطأ في معالجة الرسالة:', error);
    }
  });

  ws.on('close', () => {
    console.log('❌ عميل قطع الاتصال');
  });

  ws.on('error', (error) => {
    console.error('❌ خطأ في WebSocket:', error);
  });
});

// إنشاء إشعارات عشوائية كل 10 ثواني
setInterval(() => {
  const newNotification = createRandomNotification();
  notifications.push(newNotification);

  // الاحتفاظ بـ 50 إشعار فقط
  if (notifications.length > 50) {
    notifications.shift();
  }

  // إرسال الإشعار الجديد لجميع العملاء
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'new_notification',
        notification: newNotification
      }));
    }
  });

  console.log(`📢 إشعار جديد (${newNotification.notification_type}): ${newNotification.title}`);
}, 10000);

// بدء الخادم
server.listen(PORT, () => {
  console.log(`\n🚀 خادم WebSocket يعمل على ws://localhost:${PORT}`);
  console.log(`📨 سيتم إرسال إشعارات عشوائية كل 10 ثواني\n`);
});

// التعامل مع إيقاف الخادم
process.on('SIGINT', () => {
  console.log('\n🛑 إيقاف الخادم...');
  server.close(() => {
    console.log('✅ تم إيقاف الخادم');
    process.exit(0);
  });
});
