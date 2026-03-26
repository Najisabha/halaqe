# Halaqe - Barber Booking System

نظام حجز حلاقين متكامل مع React + Node.js + PostgreSQL

## 📁 هيكل المشروع

```
halaqe.com/
├── backend/              # Backend API (Node.js + Express + PostgreSQL)
│   ├── config/          # إعدادات قاعدة البيانات
│   ├── models/          # نماذج قاعدة البيانات
│   ├── routes/          # مسارات API
│   ├── middleware/      # middleware للمصادقة والأخطاء
│   ├── .env             # متغيرات البيئة
│   └── server.js        # ملف السيرفر الرئيسي
│
├── src/                 # Frontend (React + Vite)
│   ├── components/      # مكونات React
│   ├── pages/          # صفحات التطبيق
│   └── .env            # إعدادات Frontend
│
└── README.md           # هذا الملف
```

## 🚀 تشغيل المشروع

### الخطوة 1: إعداد قاعدة البيانات

1. تثبيت PostgreSQL من الموقع الرسمي
2. إنشاء قاعدة بيانات:
```sql
CREATE DATABASE halaqe_db;
```

### الخطوة 2: إعداد Backend

```bash
# الانتقال لمجلد backend
cd backend

# تثبيت المكتبات
npm install

# نسخ ملف البيئة وتعديله
cp .env.example .env
# عدّل .env وضع كلمة مرور PostgreSQL

# تشغيل السيرفر
npm run dev
```

السيرفر سيعمل على: `http://localhost:4000`

### الخطوة 3: إعداد Frontend

```bash
# في المجلد الرئيسي
npm install

# تشغيل Frontend
npm run dev
```

التطبيق سيعمل على: `http://localhost:5173`

## 🔑 الميزات الرئيسية

### للمستخدمين:
- ✅ تسجيل الدخول والتسجيل
- ✅ البحث عن حلاقين وصالونات
- ✅ حجز المواعيد
- ✅ المحفظة الإلكترونية
- ✅ نظام النقاط والمكافآت
- ✅ التقييمات والمراجعات
- ✅ المفضلة

### للحلاقين:
- ✅ لوحة تحكم خاصة
- ✅ إدارة المواعيد
- ✅ إدارة الخدمات
- ✅ محفظة إلكترونية
- ✅ إحصائيات ورسوم بيانية

### للإدارة:
- ✅ الموافقة على الحلاقين
- ✅ إدارة المعاملات
- ✅ إدارة السحوبات
- ✅ إنشاء العروض الترويجية

## 📊 قاعدة البيانات

يستخدم المشروع PostgreSQL مع Sequelize ORM.

### الجداول الرئيسية:
- `users` - المستخدمين
- `barbers` - الحلاقين
- `salons` - الصالونات
- `services` - الخدمات
- `appointments` - الحجوزات
- `reviews` - التقييمات
- `transactions` - المعاملات المالية
- `notifications` - الإشعارات
- `favorites` - المفضلة

## 🔐 المصادقة والأمان

- JWT للمصادقة
- bcrypt لتشفير كلمات المرور
- Helmet للأمان
- Rate limiting لمنع الهجمات
- CORS مُعد بشكل صحيح

## 📝 API Endpoints

### المصادقة (`/api/auth`)
- `POST /register` - تسجيل مستخدم جديد
- `POST /verify-email` - التحقق من البريد
- `POST /login` - تسجيل الدخول
- `POST /forgot-password` - نسيت كلمة المرور
- `POST /reset-password` - إعادة تعيين كلمة المرور

### المستخدم (`/api/user`)
- `GET /navbar` - بيانات شريط التنقل
- `GET /profile` - الملف الشخصي
- `PUT /profile` - تحديث الملف الشخصي

المزيد من endpoints سيتم إضافتها...

## 🛠️ التقنيات المستخدمة

### Frontend:
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- i18next (العربية/الإنجليزية)

### Backend:
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT
- bcryptjs

## 🌍 اللغات المدعومة

- العربية (افتراضي)
- English

## 📱 الواجهة

التطبيق responsive ويعمل على:
- 💻 Desktop
- 📱 Mobile
- 📱 Tablet

## 🧪 الاختبار

```bash
# اختبار Backend
cd backend
npm test

# اختبار Frontend
npm test
```

## 🚀 النشر

### Backend:
- يمكن نشره على Heroku, Railway, Render
- تأكد من إعداد PostgreSQL في الإنتاج

### Frontend:
- يمكن نشره على Vercel, Netlify, Cloudflare Pages

## 🐛 المشاكل الشائعة

راجع ملف `backend/README.md` لحل المشاكل الشائعة

## 📄 الترخيص

MIT License

## 👨‍💻 المطور

تم التطوير بواسطة فريق Halaqe

---

**ملاحظة**: هذا المشروع في مرحلة التطوير. بعض الميزات قيد الإنشاء.
