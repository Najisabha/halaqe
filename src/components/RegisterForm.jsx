import React, { useState } from "react"
import { Button } from "./ui/button"
import { useToast } from "./ui/use-toast"
import { motion } from "framer-motion"
import { ArrowRight, Link, Facebook, Apple } from "lucide-react"
import { palestineLocations } from "@/data/palestine-locations"

function RegisterForm({ setCurrentView }) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [selectedCity, setSelectedCity] = useState("")
  const [dateFields, setDateFields] = useState({
    day: "",
    month: "",
    year: ""
  })

  // Date helper functions
  const generateDays = () => {
    return Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  }

  const generateMonths = () => {
    return [
      { value: "01", label: "يناير" },
      { value: "02", label: "فبراير" },
      { value: "03", label: "مارس" },
      { value: "04", label: "أبريل" },
      { value: "05", label: "مايو" },
      { value: "06", label: "يونيو" },
      { value: "07", label: "يوليو" },
      { value: "08", label: "أغسطس" },
      { value: "09", label: "سبتمبر" },
      { value: "10", label: "أكتوبر" },
      { value: "11", label: "نوفمبر" },
      { value: "12", label: "ديسمبر" }
    ]
  }

  const generateYears = () => {
    const currentYear = new Date().getFullYear()
    return Array.from(
      { length: 100 },
      (_, i) => (currentYear - i).toString()
    )
  }

  const handleDateChange = (field, value) => {
    setDateFields(prev => {
      const newFields = { ...prev, [field]: value }
      
      if (newFields.day && newFields.month && newFields.year) {
        const birthDate = `${newFields.year}-${newFields.month}-${newFields.day}`
        setFormData(prev => ({ ...prev, birthDate }))
      }
      
      return newFields
    })
  }

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    countryCode: "+970",
    city: "",
    area: "",
    address: "",
    birthDate: "",
    gender: "",
    type: "",
    idDocumentLink: "",
    professionLicenseLink: "",
    salonType: "",
    emailVerificationCode: "",
    phoneVerificationCode: ""
  })
                  const api = import.meta.env.VITE_API_URL;

  const handleSocialRegister = async (provider) => {
    try {
      if (provider === 'Google') {
        window.location.href = `${api}/api/auth/google`
      } else if (provider === 'Facebook') {
        window.location.href = `${api}/api/auth/facebook`
      } else {
        toast({
          title: `جاري التسجيل باستخدام ${provider}`,
          description: "هذه الميزة قيد التطوير"
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة التسجيل باستخدام " + provider,
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || 
          !formData.phone || !formData.city || !formData.area) {
        toast({
          title: "يرجى تعبئة جميع الحقول المطلوبة",
          variant: "destructive"
        })
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      if (!formData.birthDate || !formData.gender || !formData.type) {
        toast({
          title: "يرجى تعبئة جميع الحقول المطلوبة",
          variant: "destructive"
        })
        return
      }
    
      const birthDate = new Date(formData.birthDate)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      const dayDiff = today.getDate() - birthDate.getDate()
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--
      }
    
      if (formData.type === 'barber') {
        if (!formData.idDocumentLink || !formData.professionLicenseLink || !formData.salonType) {
          toast({
            title: "يرجى إدخال جميع الروابط المطلوبة للحلاق",
            description: "رابط الهوية ورابط شهادة مزاولة المهنة مطلوبان",
            variant: "destructive"
          })
      
          return
        }
      
        
    
        // Validate Google Drive/Dropbox links
        const urlPattern = /^https:\/\/(drive\.google\.com\/|www\.dropbox\.com\/)/
        if (!urlPattern.test(formData.idDocumentLink) || !urlPattern.test(formData.professionLicenseLink)) {
          toast({
            title: "روابط غير صالحة",
            description: "يرجى إدخال روابط صالحة من Google Drive أو Dropbox",
            variant: "destructive"
          })
          return
        }
      }
      if (formData.type === 'provider') {
        if (!formData.idDocumentLink) {
          toast({
            title: "يرجى إدخال جميع الروابط المطلوبة للوكيل",
            description: "رابط الهوية ورابط شهادة مزاولة المهنة مطلوبان",
            variant: "destructive"
          })
      
          return
        }
      
        
    
        // Validate Google Drive/Dropbox links
        const urlPattern = /^https:\/\/(drive\.google\.com\/|www\.dropbox\.com\/)/
        if (!urlPattern.test(formData.idDocumentLink)) {
          toast({
            title: "روابط غير صالحة",
            description: "يرجى إدخال روابط صالحة من Google Drive أو Dropbox",
            variant: "destructive"
          })
          return
        }
      }
      const datas = {
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        password: formData.password,
        countryCode: formData.countryCode,
        phonenumber: formData.countryCode + formData.phone,
        city: formData.city,
        area: formData.area,
        address: formData.address,
        birthDate: formData.birthDate,
        gender: formData.gender.toLocaleUpperCase(),
        type: formData.type.toUpperCase(), // Changed to use toUpperCase() for consistency
        idDocumentUrl: formData.idDocumentLink || null,
        professionLicenseUrl: formData.professionLicenseLink || null,
        salonType: formData.salonType.toLocaleUpperCase() || null,
      }
      try {
        // 1️⃣ Register user
        const api = import.meta.env.VITE_API_URL;

        const response = await fetch(`${api}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datas)
        })
    
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "فشل التسجيل")
        }
    
        toast({
          title: "تم إرسال رمز التحقق",
          description: "يرجى فحص بريدك الإلكتروني وإدخال رمز التحقق"
        })
    
        setStep(3) // move to verification step
      } catch (error) {
        toast({
          title: "خطأ في التسجيل",
          description: error.message,
          variant: "destructive"
        })
      }
    
      return
    }
    
    if (step === 3) {
      if (!formData.emailVerificationCode) {
        toast({
          title: "أدخل رمز التحقق",
          variant: "destructive"
        })
        return
      }
    
      try {
        // 2️⃣ Verify email with backend
        const api = import.meta.env.VITE_API_URL;

        const response = await fetch(`${api}/api/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            code: formData.emailVerificationCode
          })
        })
    
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "فشل التحقق من البريد الإلكتروني")
        }
    
        toast({
          title: "تم التحقق بنجاح",
          description: "يمكنك الآن تسجيل الدخول"
        })
    
        setCurrentView("login")
      } catch (error) {
        toast({
          title: "خطأ في التحقق",
          description: error.message,
          variant: "destructive"
        })
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-lg"
      >
        <button
          onClick={() => setCurrentView('login')}
          className="flex items-center text-primary hover:underline mb-6"
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة لتسجيل الدخول
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">إنشاء حساب جديد</h2>

        {/* Social Registration */}
        <div className="space-y-3 mb-8">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={() => handleSocialRegister('Google')}
          >
            <div className="w-5 h-5 ml-2">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </div>
            متابعة باستخدام Google
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={() => handleSocialRegister('Facebook')}
          >
            <Facebook className="h-5 w-5 ml-2" />
            متابعة باستخدام Facebook
          </Button>


        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">أو</span>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">الاسم الأول</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block mb-2">اسم العائلة</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                className="w-full p-2 border rounded-md"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block mb-2">كلمة المرور</label>
              <input
                type="password"
                className="w-full p-2 border rounded-md"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/4">
                <label className="block mb-2">المقدمة</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md bg-muted"
                  value={formData.countryCode}
                  disabled
                />
              </div>
              <div className="flex-1">
                <label className="block mb-2">رقم الجوال</label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded-md"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">المدينة</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.city}
                onChange={(e) => {
                  setFormData({ ...formData, city: e.target.value, area: "" })
                  setSelectedCity(e.target.value)
                }}
                required
              >
                <option value="">اختر المدينة</option>
                {Object.keys(palestineLocations.cities).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {selectedCity && (
              <div>
                <label className="block mb-2">المنطقة</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  required
                >
                  <option value="">اختر المنطقة</option>
                  {palestineLocations.cities[selectedCity].map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block mb-2">العنوان التفصيلي</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="مثال: شارع السلام، بجانب مسجد النور"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              التالي
            </Button>
          </motion.form>
        )}

        {/* Step 2: Additional Information */}
        {step === 2 && (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="block mb-2">تاريخ الميلاد</label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={dateFields.day}
                    onChange={(e) => handleDateChange('day', e.target.value)}
                    required
                  >
                    <option value="">اليوم</option>
                    {generateDays().map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={dateFields.month}
                    onChange={(e) => handleDateChange('month', e.target.value)}
                    required
                  >
                    <option value="">الشهر</option>
                    {generateMonths().map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={dateFields.year}
                    onChange={(e) => handleDateChange('year', e.target.value)}
                    required
                  >
                    <option value="">السنة</option>
                    {generateYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2">الجنس</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                required
              >
                <option value="">اختر الجنس</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">نوع الحساب</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="">اختر نوع الحساب</option>
                <option value="user">مستخدم</option>
                <option value="barber">حلاق</option>
                <option value="provider">وكيل</option>

              </select>
            </div>

            {formData.type && (
              <div>
                <label className="block mb-2">
                  {formData.type === 'user' ? 'رابط الهوية على Google Drive (اختياري)' : 'رابط الهوية على Google Drive (إجباري)'}
                </label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <input
                    type="url"
                    className="w-full p-2 border rounded-md"
                    value={formData.idDocumentLink}
                    onChange={(e) => setFormData({ ...formData, idDocumentLink: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    required={formData.type === 'barber'}
                  />
                  <Link className="h-8 w-8 text-gray-400 mt-2 mx-auto" />
                </div>
                {formData.type === 'user' && (
                  <p className="text-sm text-gray-500 mt-2">
                    * توثيق الحساب يمنحك وصولاً كاملاً لجميع المميزات
                  </p>
                )}
              </div>
            )}

            {formData.type === 'barber' && (
              <>
                <div>
                  <label className="block mb-2">رابط شهادة مزاولة المهنة على Google Drive</label>
                  <div className="border-2 border-dashed rounded-lg p-4">
                    <input
                      type="url"
                      className="w-full p-2 border rounded-md"
                      value={formData.professionLicenseLink}
                      onChange={(e) => setFormData({ ...formData, professionLicenseLink: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      required
                    />
                    <Link className="h-8 w-8 text-gray-400 mt-2 mx-auto" />
                  </div>
                </div>

                <div>
                  <label className="block mb-2">نوع العمل</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.salonType}
                    onChange={(e) => setFormData({ ...formData, salonType: e.target.value })}
                    required
                  >
                    <option value="">اختر نوع العمل</option>
                    <option value="owner">يمتلك صالون</option>
                    <option value="employee">يعمل في صالون</option>
                    <option value="trainee">متدرب</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(1)}
              >
                السابق
              </Button>
              <Button type="submit" className="w-full">
                التالي
              </Button>
            </div>
          </motion.form>
        )}

        {/* Step 3: Verification */}
        {step === 3 && (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="block mb-2">رمز التحقق من البريد الإلكتروني</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={formData.emailVerificationCode}
                onChange={(e) => setFormData({ ...formData, emailVerificationCode: e.target.value })}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                * تم إرسال رمز التحقق إلى بريدك الإلكتروني
              </p>
            </div>

           
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(2)}
              >
                السابق
              </Button>
              <Button type="submit" className="w-full">
                إنشاء الحساب
              </Button>
            </div>
          </motion.form>
        )}
      </motion.div>
    </div>
  )
}

export default RegisterForm