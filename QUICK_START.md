# ⚡ دليل البدء السريع - Halaqe

## خطوات التشغيل السريعة

### 1️⃣ تثبيت PostgreSQL

**Windows:**
```powershell
# حمّل من: https://www.postgresql.org/download/windows/
# بعد التثبيت، افتح pgAdmin أو SQL Shell (psql)
```

**Mac:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2️⃣ إنشاء قاعدة البيانات

افتح terminal/cmd واكتب:

```bash
# Windows - افتح SQL Shell (psql)
psql -U postgres

# Mac/Linux
sudo -u postgres psql
```

ثم في psql:
```sql
CREATE DATABASE halaqe_db;
\q
```

### 3️⃣ إعداد Backend

```bash
# افتح terminal في مجلد المشروع
cd backend

# تثبيت المكتبات
npm install

# تحديث ملف .env
# افتح backend/.env وغيّر:
# DB_PASSWORD=كلمة_مرور_postgres_الخاصة_بك

# تشغيل السيرفر
npm run dev
```

**يجب أن ترى:**
```
╔════════════════════════════════════════╗
║   🚀 Halaqe Backend Server Started    ║
║   📍 Port: 4000                        ║
║   🗄️  Database: Connected              ║
╚════════════════════════════════════════╝
```

### 4️⃣ تشغيل Frontend

افتح terminal جديد:

```bash
# في المجلد الرئيسي للمشروع
npm install

# تشغيل التطبيق
npm run dev
```

**افتح المتصفح على:**
`http://localhost:5173`

---

## ✅ اختبار التطبيق

1. افتح المتصفح على `http://localhost:5173`
2. انقر على "Sign Up"
3. املأ البيانات:
   - الاسم: أحمد
   - البريد: ahmad@test.com
   - كلمة المرور: 123456
   - الهاتف: 0599123456
   - المدينة: رام الله
   - المنطقة: البيرة
   - تاريخ الميلاد: اختر تاريخ
   - الجنس: ذكر
   - النوع: مستخدم عادي

4. سيتم إرسال رمز التحقق - **ابحث عنه في terminal الخاص بـ backend**
5. أدخل الرمز وأكمل التسجيل

---

## 🐛 حل المشاكل السريع

### ❌ Backend لا يعمل

**المشكلة:** `connect ECONNREFUSED`
```bash
# تأكد من تشغيل PostgreSQL:
# Windows: Services → postgresql
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

**المشكلة:** `password authentication failed`
```bash
# افتح backend/.env وتأكد من:
DB_PASSWORD=كلمة_المرور_الصحيحة
```

### ❌ Frontend لا يتصل بـ Backend

```bash
# تأكد من وجود ملف `.env` (أو `.env.local`) في **جذر المشروع** يحتوي:
VITE_API_URL=http://localhost:4000
```

### ❌ Port مستخدم

```bash
# غيّر PORT في backend/.env:
PORT=4001
```

---

## 📞 احتجت مساعدة؟

1. راجع `backend/README.md` للتفاصيل الكاملة
2. تأكد من تشغيل PostgreSQL أولاً
3. تأكد من تثبيت جميع المكتبات بـ `npm install`
4. افحص terminal للأخطاء

---

## 🎉 نجح التشغيل!

يمكنك الآن:
- ✅ التسجيل وتسجيل الدخول
- ✅ تصفح الصفحة الرئيسية
- ✅ استكشاف الميزات

**ملاحظة:** بعض الميزات المتقدمة قيد التطوير وسيتم إضافتها لاحقاً.
