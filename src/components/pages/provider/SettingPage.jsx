// SettingsPage.jsx
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Lock, Star, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { palestineLocations } from "../../../data/palestine-locations"
import { MapPin } from "lucide-react"
/**
 * SettingsPage.jsx
 * Combined and fixed Settings / Profile / Password / Salon pages.
 *
 * Notes:
 * - api() now handles 401 responses by clearing auth and redirecting to /login.
 * - localStorage.currentUser is parsed (JSON.parse) before checking .type
 * - Kept Arabic text, toast usage, and UI layout from original code.
 */

// --- API helper ------------------------------------------------
const api = async (url, method = "GET", body) => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  }

  let options = { method, headers }

  if (body) {
    if (body instanceof FormData) {
      // Let browser set Content-Type automatically
      options.body = body
    } else {
      headers["Content-Type"] = "application/json"
      options.body = JSON.stringify(body)
    }
  }
  const api = import.meta.env.VITE_API_URL;

  const res = await fetch(`${api}${url}`, options)

  if (res.status === 401) {
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
    window.location.href = "/login"
    return
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    let message = "API Error"
    try {
      const json = JSON.parse(text)
      if (json?.message) message = json.message
    } catch {}
    throw new Error(message)
  }

  const contentType = res.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return res.json()
  }
  return res.text()
}



// ----------------- ProfilePage --------------------------------
function ProfilePage({ profile, reload }) {
  const { toast } = useToast()
  const [form, setForm] = useState(profile || {})
  const [selectedCity, setSelectedCity] = useState(profile?.city || "")

  useEffect(() => {
    setForm(profile || {})
    setSelectedCity(profile?.city || "")
  }, [profile])

  const handleSave = async () => {
    try {
      const endpoint =  "/api/provider/profile"
      await api(endpoint, "PUT", form)
      toast({ title: "تم الحفظ", description: "تم تحديث البيانات بنجاح" })
      reload()
    } catch (err) {
      toast({ title: "خطأ", description: `فشل تحديث البيانات (${err.message})`, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">معلومات الحساب</h3>

      <div>
        <label className="block text-sm font-medium">الاسم الأول</label>
        <input
          type="text"
          value={form.firstname || ""}
          onChange={(e) => setForm({ ...form, firstname: e.target.value })}
          className="mt-1 block w-full border rounded-lg p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">الاسم الأخير</label>
        <input
          type="text"
          value={form.lastname || ""}
          onChange={(e) => setForm({ ...form, lastname: e.target.value })}
          className="mt-1 block w-full border rounded-lg p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">البريد الإلكتروني</label>
        <input
          type="email"
          value={form.email || ""}
          readOnly
          className="mt-1 block w-full border rounded-lg p-2 bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">رقم الهاتف</label>
        <input
          type="text"
          value={form.phonenumber || ""}
          readOnly
          className="mt-1 block w-full border rounded-lg p-2 bg-gray-100"
        />
      </div>


      <div>
  <label className="block text-sm font-medium">العنوان</label>
  <div className="flex gap-2">
    <input
      type="text"
      value={form.location || form.address || ""}
      onChange={(e) =>
        setForm({
          ...form,
          location: form.location !== undefined ? e.target.value : form.location,
          address: form.address !== undefined ? e.target.value : form.address,
          latitude,
          longitude
        })
      }
      className="block w-full border rounded-lg p-2"
      placeholder="أدخل العنوان أو استخدم موقعي الحالي"
    />

    <Button
      type="button"
      variant="outline"
      onClick={() => {
        if (!navigator.geolocation) {
          toast({
            title: "خطأ",
            description: "المتصفح لا يدعم تحديد الموقع",
            variant: "destructive",
          })
          return
        }

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
              )
              const data = await res.json()
              const address =
                data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`

              setForm({
                ...form,
                location: form.location !== undefined ? address : form.location,
                address: form.address !== undefined ? address : form.address,
                latitude,         // store lat
                longitude,        // store lng
              })

              toast({
                title: "تم تحديد الموقع",
                description: "تم جلب العنوان بنجاح من موقعك الحالي",
              })
            } catch (err) {
              toast({
                title: "خطأ",
                description: "فشل في جلب العنوان، الرجاء المحاولة مرة أخرى.",
                variant: "destructive",
              })
            }
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              toast({
                title: "مطلوب إذن",
                description: "تحتاج إلى السماح بالوصول إلى الموقع لاستخدام هذه الميزة.",
                variant: "destructive",
              })
            } else {
              toast({
                title: "خطأ",
                description: "تعذر الحصول على الموقع. الرجاء المحاولة لاحقاً.",
                variant: "destructive",
              })
            }
          }
        )
      }}
    >
      <MapPin className="w-4 h-4 mr-1" /> موقعي الحالي
    </Button>
  </div>
</div>

      {/* City */}
      <div>
        <label className="block mb-2">المدينة</label>
        <select
          className="w-full p-2 border rounded-md"
          value={form.city || ""}
          onChange={(e) => {
            setForm({ ...form, city: e.target.value, area: "" })
            setSelectedCity(e.target.value)
          }}
        >
          <option value="">اختر المدينة</option>
          {Object.keys(palestineLocations.cities).map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Area */}
      {selectedCity && (
        <div>
          <label className="block mb-2">المنطقة</label>
          <select
            className="w-full p-2 border rounded-md"
            value={form.area || ""}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
          >
            <option value="">اختر المنطقة</option>
            {palestineLocations.cities[selectedCity]?.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">تاريخ الميلاد</label>
        <input
          type="date"
          value={form.birthDate ? form.birthDate.split("T")[0] : ""}
          onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          className="mt-1 block w-full border rounded-lg p-2"
        />
      </div>

      <Button className="mt-4 w-full" onClick={handleSave}>
        حفظ التغييرات
      </Button>
    </div>
  )
}

// ----------------- PasswordPage -------------------------------
function PasswordPage({ profile }) {
  const { toast } = useToast()
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirm: "" })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async () => {
    if (form.newPassword !== form.confirm) {
      return toast({ title: "خطأ", description: "كلمات المرور غير متطابقة", variant: "destructive" })
    }
    try {
      const endpoint =  "/api/provider/change-password"
      await api(endpoint, "PUT", {
        currentPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      toast({ title: "تم التغيير", description: "تم تغيير كلمة المرور بنجاح" })
      setForm({ oldPassword: "", newPassword: "", confirm: "" })
    } catch (err) {
      toast({ title: "خطأ", description: `فشل تغيير كلمة المرور (${err.message})`, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">كلمة المرور الحالية</label>
        <input
          type="password"
          name="oldPassword"
          value={form.oldPassword}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-lg p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">كلمة المرور الجديدة</label>
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-lg p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">تأكيد كلمة المرور</label>
        <input
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-lg p-2"
        />
      </div>
      <Button className="mt-4 w-full" onClick={handleSave}>
        تغيير كلمة المرور
      </Button>
    </div>
  )
}

// ----------------- SettingsPage (main) -------------------------
export default function SettingsProvidersPage({ onLogout }) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async () => {
    setLoading(true)
    try {
      // parse currentUser from localStorage (may be saved as JSON string)
      const stored = localStorage.getItem("currentUser")
      let parsed = null
      try {
        parsed = stored ? JSON.parse(stored) : null
      } catch {
        parsed = null
      }

      // determine endpoint based on parsed.type (fallback to user)
      const endpoint = "/api/provider/profile"
      const data = await api(endpoint, "GET")
      // if api returned undefined because of 401 redirect, stop
      if (!data) {
        setLoading(false)
        return
      }
      setProfile(data)
    } catch (err) {
      toast({ title: "خطأ", description: `فشل تحميل البيانات (${err.message})`, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <p>جاري التحميل...</p>
  if (!profile) return <p>لم يتم العثور على بيانات الحساب.</p>

  const settingsSections = [
    { id: "profile", title: "الملف الشخصي", icon: User },
    { id: "password", title: "كلمة المرور", icon: Lock },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">الإعدادات</h2>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-4">
          {/* Sidebar */}
          <div className="bg-gray-50 p-4 border-l">
            <nav className="space-y-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === section.id ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
                  }`}
                >
                  <section.icon className="h-5 w-5" />
                  <span>{section.title}</span>
                </button>
              ))}

              <button
                onClick={() => {
                  // clear and call parent logout if provided
                  localStorage.removeItem("token")
                  localStorage.removeItem("currentUser")
                  if (onLogout) onLogout()
                  else window.location.href = "/login"
                }}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-red-500 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                <span>تسجيل الخروج</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="col-span-3 p-6">
            {activeTab === "profile" && <ProfilePage profile={profile} reload={loadProfile} />}
            {activeTab === "password" && <PasswordPage profile={profile} />}
           
          </div>
        </div>
      </motion.div>
    </div>
  )
}
