# Halaqe Backend - PostgreSQL Setup

Backend API لنظام حجز الحلاقين Halaqe مع قاعدة بيانات PostgreSQL.

## 📋 المتطلبات الأساسية

- Node.js (v16 أو أحدث)
- PostgreSQL (v12 أو أحدث)
- npm أو yarn

## 🚀 البدء السريع

### 1. تثبيت PostgreSQL

#### Windows:
1. حمّل PostgreSQL من الموقع الرسمي: https://www.postgresql.org/download/windows/
2. قم بتثبيته مع الإعدادات الافتراضية
3. احفظ كلمة مرور المستخدم `postgres`

#### Mac:
```bash
brew install postgresql
brew services start postgresql
```

#### Linux:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. إنشاء قاعدة البيانات

افتح PostgreSQL command line أو pgAdmin وقم بإنشاء قاعدة البيانات:

```sql
CREATE DATABASE halaqe_db;
```

أو استخدم الأمر التالي:
```bash
# Windows/Linux/Mac
psql -U postgres
CREATE DATABASE halaqe_db;
\q
```

### 3. تثبيت المكتبات

```bash
cd backend
npm install
```

### 4. إعداد ملف البيئة

انسخ ملف `.env.example` إلى `.env` وعدّل القيم:

```bash
cp .env.example .env
```

عدّل ملف `.env`:
```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=halaqe_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here  # ضع كلمة المرور هنا

# JWT Secret
JWT_SECRET=halaqe_secret_key_2024_change_in_production

# Email Configuration (اختياري للبداية)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 5. تشغيل السيرفر

```bash
# وضع التطوير (مع auto-reload)
npm run dev

# أو الوضع العادي
npm start
```

إذا نجح التشغيل، سترى:
```
╔════════════════════════════════════════╗
║   🚀 Halaqe Backend Server Started    ║
║                                        ║
║   📍 Port: 4000                        ║
║   🌍 Environment: development          ║
║   🗄️  Database: Connected              ║
║                                        ║
║   API: http://localhost:4000/api      ║
╚════════════════════════════════════════╝
```

## 📊 هيكل قاعدة البيانات

سيتم إنشاء الجداول التالية تلقائياً:

- **users** - معلومات المستخدمين الأساسية
- **barbers** - معلومات الحلاقين
- **salons** - معلومات الصالونات
- **services** - الخدمات المتاحة
- **appointments** - الحجوزات
- **reviews** - التقييمات
- **transactions** - المعاملات المالية
- **notifications** - الإشعارات
- **favorites** - المفضلة

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/verify-email` - التحقق من البريد الإلكتروني
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/forgot-password` - نسيت كلمة المرور
- `POST /api/auth/reset-password` - إعادة تعيين كلمة المرور

### User
- `GET /api/user/navbar` - بيانات شريط التنقل
- `GET /api/user/profile` - الملف الشخصي
- `PUT /api/user/profile` - تحديث الملف الشخصي

## 🧪 اختبار API

يمكنك استخدام:
- **Postman**: استيراد المجموعة من `postman/halaqe.json`
- **Thunder Client** (VS Code Extension)
- **curl**

مثال على التسجيل:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "أحمد",
    "lastname": "محمد",
    "email": "ahmad@example.com",
    "password": "123456",
    "phonenumber": "+970599123456",
    "city": "رام الله",
    "area": "البيرة",
    "birthDate": "1995-01-01",
    "gender": "MALE",
    "type": "USER"
  }'
```

## 🔧 استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**الحل**: تأكد من أن PostgreSQL يعمل:
```bash
# Windows
# افتح Services وابحث عن postgresql

# Mac
brew services list

# Linux
sudo systemctl status postgresql
```

### خطأ في المصادقة
```
Error: password authentication failed for user "postgres"
```
**الحل**: تأكد من كلمة المرور في ملف `.env`

### Port مستخدم بالفعل
```
Error: listen EADDRINUSE: address already in use :::4000
```
**الحل**: غيّر PORT في ملف `.env` أو أوقف التطبيق الذي يستخدم البورت

## 📝 ملاحظات مهمة

1. **الأمان**: غيّر `JWT_SECRET` في الإنتاج
2. **البريد الإلكتروني**: حالياً يتم طباعة رموز التحقق في console، يجب إعداد SMTP للإنتاج
3. **الصور**: سيتم إضافة upload للصور لاحقاً
4. **OAuth**: Google/Facebook login سيتم إضافته لاحقاً

## 🔄 تحديث Frontend

أنشئ/عدّل ملف `.env` (أو `.env.local`) في **جذر المشروع**:
```env
VITE_API_URL=http://localhost:4000
```

## 📚 موارد إضافية

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## 🤝 المساهمة

للمساهمة في المشروع:
1. Fork المشروع
2. أنشئ فرع جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License
