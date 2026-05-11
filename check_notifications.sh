#!/bin/bash

# 📋 قائمة التحقق - نظام الإشعارات

echo "🔍 جاري التحقق من نظام الإشعارات..."
echo ""

# الألوان
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# عداد الملفات
checked=0
found=0

# دوال مساعدة
check_file() {
    local file=$1
    local description=$2
    checked=$((checked + 1))
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $description"
        found=$((found + 1))
    else
        echo -e "${RED}❌${NC} $description (مفقود: $file)"
    fi
}

check_dir() {
    local dir=$1
    local description=$2
    checked=$((checked + 1))
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅${NC} $description"
        found=$((found + 1))
    else
        echo -e "${RED}❌${NC} $description (مفقود: $dir)"
    fi
}

echo "📁 التحقق من الملفات والمجلدات:"
echo "================================"

# التحقق من المجلدات
check_dir "src/components" "مجلد Components"
check_dir "src/hooks" "مجلد Hooks"
check_dir "src/services" "مجلد Services"
check_dir "src/types" "مجلد Types"
check_dir "src/docs" "مجلد Documentation"
check_dir "src/utils" "مجلد Utils"
check_dir "src/__tests__" "مجلد Tests"

echo ""
echo "📄 التحقق من ملفات Components:"
echo "================================"
check_file "src/components/NotificationBell.js" "NotificationBell Component"
check_file "src/components/NotificationProvider.js" "NotificationProvider Component"
check_file "src/components/NotificationToast.js" "NotificationToast Component"

echo ""
echo "🎣 التحقق من ملفات Hooks:"
echo "============================"
check_file "src/hooks/useWebSocket.js" "useWebSocket Hook"
check_file "src/hooks/useNotifications.js" "useNotifications Hook"

echo ""
echo "🔧 التحقق من ملفات Services:"
echo "==============================="
check_file "src/services/notificationService.js" "Notification Service"

echo ""
echo "📚 التحقق من ملفات Types:"
echo "============================"
check_file "src/types/notification.ts" "Notification Types"

echo ""
echo "📖 التحقق من التوثيق:"
echo "======================"
check_file "src/docs/NOTIFICATIONS_README.md" "README - التوثيق الرئيسي"
check_file "src/docs/NOTIFICATION_USAGE.js" "USAGE - الأمثلة العملية"
check_file "NOTIFICATIONS_SETUP.md" "SETUP - دليل الإعداد"

echo ""
echo "🧪 التحقق من ملفات الاختبار:"
echo "================================"
check_file "src/__tests__/notifications.test.js" "Notification Tests"

echo ""
echo "⚙️ التحقق من ملفات المساعدة:"
echo "==============================="
check_file "src/utils/mockNotificationServer.js" "Mock Server"
check_file ".env.example" "Environment Variables"

echo ""
echo "================================"
echo -e "📊 النتيجة: ${GREEN}$found${NC}/${checked} ملف/مجلد"
echo "================================"

# التحقق من حزم npm
echo ""
echo "📦 التحقق من الحزم المطلوبة:"
echo "=============================="

check_package() {
    local package=$1
    local description=$2
    
    if grep -q "\"$package\"" package.json; then
        echo -e "${GREEN}✅${NC} $description"
    else
        echo -e "${YELLOW}⚠️ ${NC}  $package قد لا يكون مثبتاً (اختياري)"
    fi
}

check_package "axios" "axios"
check_package "date-fns" "date-fns"
check_package "@mui/material" "MUI Material"
check_package "@mui/icons-material" "MUI Icons"
check_package "@emotion/react" "Emotion React"
check_package "@emotion/styled" "Emotion Styled"

echo ""
echo "✅ قائمة التحقق اكتملت!"
echo ""
echo "🚀 الخطوات التالية:"
echo "1. تأكد من تثبيت جميع المكتبات: npm install"
echo "2. أضف NotificationBell في Navbar"
echo "3. أضف NotificationProvider في App.js"
echo "4. اختبر الاتصال بـ Backend"
echo "5. اقرأ NOTIFICATIONS_SETUP.md للتفاصيل"
echo ""
