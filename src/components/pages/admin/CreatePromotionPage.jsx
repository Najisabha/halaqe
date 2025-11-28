import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Tag,
  Calendar,
  Trash2,
  Power,
  PlusCircle,
  Loader2,
  KeyRound,
  MapPin,
  Users,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"

function PromotionsAdminPage() {
  const { toast } = useToast()
  const token = localStorage.getItem("token")

  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [filter, setFilter] = useState("all")

  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    discountValue: 0,
    discountType: "PERCENT",
    startDate: "",
    endDate: "",
  })
          const api = import.meta.env.VITE_API_URL;

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${api}/api/admin/promotions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPromotions(res.data || [])
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل الكوبونات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const generateCode = () => {
    const newCode = "HALAQE-" + Math.random().toString(36).substring(2, 7).toUpperCase()
    setForm((prev) => ({ ...prev, code: newCode }))
    toast({ title: "✅ تم توليد الكود", description: `الكود: ${newCode}` })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
              
      await axios.post(`${api}/api/admin/promotions`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast({ title: "نجاح", description: "تم إنشاء الكوبون بنجاح" })
      setForm({
        code: "",
        title: "",
        description: "",
        discountValue: 0,
        discountType: "PERCENT",
        startDate: "",
        endDate: "",
      })
      fetchPromotions()
    } catch (err) {
      toast({
        title: "خطأ",
        description: err.response?.data?.message || "فشل في إنشاء الكوبون",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const deactivatePromotion = async (id) => {
    setActionLoading(id)
    try {
      await axios.patch(
        `${api}/api/admin/${id}/promotions/deactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast({ title: "تم التعطيل", description: "تم تعطيل الكوبون" })
      fetchPromotions()
    } catch {
      toast({ title: "خطأ", description: "فشل في تعطيل الكوبون", variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const deletePromotion = async (id) => {
    setActionLoading(id)
    try {
      await axios.delete(`${api}/api/admin/${id}/promotions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast({ title: "تم الحذف", description: "تم حذف الكوبون" })
      fetchPromotions()
    } catch {
      toast({ title: "خطأ", description: "فشل في حذف الكوبون", variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const filteredPromos = promotions.filter((promo) => {
    const now = new Date()
    const end = new Date(promo.endDate)
    if (filter === "active") return promo.isActive && end >= now
    if (filter === "expired") return end < now
    return true
  })

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🎟️ إدارة الكوبونات</h2>
        <div className="flex gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            الكل
          </Button>
          <Button variant={filter === "active" ? "default" : "outline"} onClick={() => setFilter("active")}>
            نشط
          </Button>
          <Button variant={filter === "expired" ? "default" : "outline"} onClick={() => setFilter("expired")}>
            منتهي
          </Button>
        </div>
      </div>

      {/* ✅ إنشاء كوبون جديد */}
      <motion.form
        onSubmit={handleCreate}
        className="bg-white p-6 rounded-2xl shadow-lg space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold mb-2">➕ إنشاء كوبون جديد</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">كود الكوبون</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                className="flex-1 border p-2 rounded-md"
              />
              <Button type="button" onClick={generateCode} variant="outline">
                <KeyRound className="h-4 w-4 mr-1" /> توليد
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">عنوان العرض</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded-md"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">الوصف</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">قيمة الخصم</label>
            <input
              type="number"
              name="discountValue"
              value={Number(form.discountValue)}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium">نوع الخصم</label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            >
              <option value="PERCENT">نسبة (%)</option>
              <option value="FIXED">مبلغ ثابت</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">تاريخ البداية</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium">تاريخ الانتهاء</label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
        </div>

        <Button type="submit" disabled={creating} className="w-full">
          {creating ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <PlusCircle className="h-5 w-5 ml-2" />}
          {creating ? "جاري الإنشاء..." : "إنشاء الكوبون"}
        </Button>
      </motion.form>

      {/* ✅ قائمة الكوبونات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p>جاري التحميل...</p>
        ) : filteredPromos.length === 0 ? (
          <p className="text-gray-500">لا توجد كوبونات</p>
        ) : (
          filteredPromos.map((promo) => {
            const now = new Date()
            const end = new Date(promo.endDate)
            const status = !promo.isActive ? "معطل" : end < now ? "منتهي" : "نشط"

            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white rounded-2xl shadow-md space-y-4"
              >
                {/* بيانات العرض */}
                <div>
                  <p className="font-bold flex items-center gap-2 text-lg">
                    <Tag className="h-5 w-5 text-primary" /> {promo.code} - {promo.title}
                  </p>
                  <p className="text-sm text-gray-600">{promo.description}</p>
                  <p className="mt-2 font-semibold text-gray-700">
                    {promo.discountType === "PERCENT"
                      ? `${promo.discountValue}%`
                      : `${promo.discountValue} شيكل`}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(promo.startDate).toLocaleDateString("ar-EG")} -{" "}
                    {new Date(promo.endDate).toLocaleDateString("ar-EG")}
                  </div>
                </div>

                {/* ✅ بيانات الصالون */}
                {promo.salon && (
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={promo.salon.imageUrl}
                        alt={promo.salon.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          <Building2 className="h-4 w-4" /> {promo.salon.name}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {promo.salon.location}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ بيانات الاسترداد */}
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" /> عدد مرات الاستخدام: {promo.redemptionCount || 0}
                  </p>
                  {promo.redemptions && promo.redemptions.length > 0 && (
                    <ul className="text-xs mt-2 text-gray-600 list-disc list-inside">
                      {promo.redemptions.map((r, i) => (
                        <li key={i}>استخدام #{i + 1} - {new Date(r.createdAt).toLocaleString("ar-EG")}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* الأزرار */}
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm px-3 py-1 rounded-full ${
                      status === "نشط"
                        ? "bg-green-100 text-green-700"
                        : status === "منتهي"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {status}
                  </span>
                  <div className="flex gap-2">
                    {promo.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading === promo.id}
                        onClick={() => deactivatePromotion(promo.id)}
                      >
                        {actionLoading === promo.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Power className="h-4 w-4" /> تعطيل
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionLoading === promo.id}
                      onClick={() => deletePromotion(promo.id)}
                    >
                      {actionLoading === promo.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" /> حذف
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default PromotionsAdminPage
