# 📸 دليل مصور - تثبيت PostgreSQL و تشغيل المشروع

## 🪟 Windows

### 1. تثبيت PostgreSQL

#### الخطوة 1: تحميل PostgreSQL
1. اذهب إلى: https://www.postgresql.org/download/windows/
2. انقر على "Download the installer"
3. اختر أحدث إصدار (مثل PostgreSQL 15 أو 16)
4. حمّل الملف (حوالي 250 MB)

#### الخطوة 2: التثبيت
1. شغّل الملف المحمل
2. اضغط "Next" في الشاشة الأولى
3. اترك مسار التثبيت الافتراضي واضغط "Next"
4. اختر المكونات (اترك الكل محدد) واضغط "Next"
5. اترك مجلد البيانات الافتراضي واضغط "Next"
6. **مهم جداً**: أدخل كلمة مرور قوية للمستخدم `postgres` واحفظها!
7. اترك Port 5432 واضغط "Next"
8. اترك اللغة الافتراضية واضغط "Next"
9. اضغط "Next" ثم "Next" ثم انتظر التثبيت
10. الغِ تحديد "Stack Builder" واضغط "Finish"

#### الخطوة 3: التحقق من التثبيت
1. اضغط `Win + R`
2. اكتب `services.msc` واضغط Enter
3. ابحث عن "postgresql-x64-XX" (XX رقم الإصدار)
4. يجب أن يكون Status = "Running"

#### الخطوة 4: إنشاء قاعدة البيانات

**الطريقة 1: باستخدام pgAdmin (واجهة رسومية)**
1. افتح pgAdmin 4 من قائمة Start
2. ادخل كلمة مرور postgres
3. من اليسار: Servers → PostgreSQL XX → Databases
4. كليك يمين على Databases → Create → Database
5. اسم قاعدة البيانات: `halaqe_db`
6. اضغط Save

**الطريقة 2: باستخدام SQL Shell (psql)**
1. افتح "SQL Shell (psql)" من قائمة Start
2. اضغط Enter 4 مرات (يستخدم الإعدادات الافتراضية)
3. أدخل كلمة مرور postgres
4. اكتب الأمر التالي:
```sql
CREATE DATABASE halaqe_db;
```
5. اضغط Enter
6. اكتب `\q` للخروج

---

## 🍎 macOS

### 1. تثبيت PostgreSQL

#### الطريقة 1: باستخدام Homebrew (موصى بها)
```bash
# إذا لم يكن Homebrew مثبت
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# تثبيت PostgreSQL
brew install postgresql@14

# تشغيل PostgreSQL
brew services start postgresql@14
```

#### الطريقة 2: باستخدام Postgres.app
1. حمّل من: https://postgresapp.com/
2. اسحب التطبيق إلى Applications
3. افتح Postgres.app
4. اضغط "Initialize" لإنشاء خادم جديد

### 2. إنشاء قاعدة البيانات
```bash
# افتح Terminal
psql postgres

# في psql
CREATE DATABASE halaqe_db;
\q
```

---

## 🐧 Linux (Ubuntu/Debian)

### 1. تثبيت PostgreSQL
```bash
# تحديث النظام
sudo apt update

# تثبيت PostgreSQL
sudo apt install postgresql postgresql-contrib

# تشغيل الخدمة
sudo systemctl start postgresql
sudo systemctl enable postgresql

# التحقق من التشغيل
sudo systemctl status postgresql
```

### 2. إنشاء قاعدة البيانات
```bash
# التبديل لمستخدم postgres
sudo -i -u postgres

# فتح psql
psql

# إنشاء قاعدة البيانات
CREATE DATABASE halaqe_db;

# الخروج
\q
exit
```

---

## 🚀 تشغيل المشروع

### 1. تحضير Backend

افتح PowerShell/Terminal في مجلد المشروع:

```bash
# الانتقال لمجلد backend
cd backend

# تثبيت المكتبات (أول مرة فقط)
npm install

# ⚠️ مهم: تحديث ملف .env
# افتح backend\.env في محرر نصوص
# غيّر السطر التالي:
# DB_PASSWORD=your_password_here
# إلى:
# DB_PASSWORD=كلمة_المرور_التي_اخترتها_للـpostgres

# إنشاء الجداول (أول مرة فقط)
npm run init-db

# (اختياري) إضافة بيانات تجريبية
npm run seed

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

### 2. تشغيل Frontend

**في terminal/PowerShell جديد** (لا تغلق الأول):

```bash
# في المجلد الرئيسي للمشروع
npm install

# تشغيل التطبيق
npm run dev
```

**يجب أن ترى:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. فتح المتصفح

افتح المتصفح على:
```
http://localhost:5173
```

---

## ✅ اختبار سريع

### 1. التسجيل
1. اضغط "Sign Up"
2. املأ النموذج:
   - الاسم: أحمد
   - البريد: test@example.com
   - كلمة المرور: 123456
   - الهاتف: 0599123456
   - المدينة: رام الله
   - المنطقة: البيرة
   - تاريخ الميلاد: اختر أي تاريخ
   - الجنس: ذكر
   - النوع: مستخدم عادي

3. اضغط "التالي"
4. **مهم**: ارجع لـ terminal الـ backend وابحث عن:
   ```
   Verification code for test@example.com: 123456
   ```
5. أدخل الرمز في الصفحة
6. تم! سجلت الدخول

### 2. استخدام حسابات تجريبية
بدلاً من التسجيل، يمكنك استخدام:

```
👤 مستخدم:
البريد: mohamed@example.com
كلمة المرور: 123456

✂️ حلاق:
البريد: ahmad@example.com
كلمة المرور: 123456
```

---

## 🔧 حل المشاكل

### ❌ Backend يقول "connect ECONNREFUSED"

**المشكلة**: PostgreSQL غير شغال

**الحل Windows:**
```powershell
# افتح Services
Win + R → services.msc → Enter
# ابحث عن postgresql واضغط Start
```

**الحل Mac:**
```bash
brew services start postgresql@14
```

**الحل Linux:**
```bash
sudo systemctl start postgresql
```

### ❌ "password authentication failed"

**المشكلة**: كلمة المرور في .env غلط

**الحل:**
1. افتح `backend\.env`
2. غيّر `DB_PASSWORD=` لكلمة المرور الصحيحة
3. احفظ الملف
4. أعد تشغيل Backend

### ❌ "Port 4000 already in use"

**الحل:**
1. افتح `backend\.env`
2. غيّر `PORT=4000` إلى `PORT=4001`
3. احفظ
4. أعد التشغيل

### ❌ "Cannot find module"

**الحل:**
```bash
cd backend
npm install
cd ..
npm install
```

---

## 🎯 نصائح مهمة

1. **اترك terminal الـ Backend مفتوح** أثناء العمل
2. **احفظ كلمة مرور postgres** في مكان آمن
3. **للتطوير**: استخدم `npm run dev` (يعيد التشغيل تلقائياً)
4. **رموز التحقق**: ابحث عنها في terminal الـ Backend
5. **البيانات التجريبية**: شغّل `npm run seed` لحسابات جاهزة

---

## 📞 محتاج مساعدة إضافية؟

1. راجع `DATABASE_SETUP.md` - ملخص كامل
2. راجع `backend/README.md` - تفاصيل Backend
3. راجع `QUICK_START.md` - بدء سريع
4. تأكد من:
   - PostgreSQL شغال
   - كلمة المرور صحيحة في .env
   - Port 4000 و 5173 فاضيين
   - تم تشغيل `npm install` في المجلدين

---

**🎉 مبروك! مشروعك الآن شغال بقاعدة بيانات PostgreSQL حقيقية!**
