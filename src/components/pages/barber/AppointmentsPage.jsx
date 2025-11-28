import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Calendar, Clock, Check, X, Plus, Trash, User, BadgeCheck, Ban
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

function AppointmentsPage({ setIsLoggedIn, setCurrentView }) {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState([])
  const [freeAppointments, setFreeAppointments] = useState([]) // NEW
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [newService, setNewService] = useState({ name: "", price: "", duration: "" })

  const token = localStorage.getItem("token")
          const api = import.meta.env.VITE_API_URL;

  const handleUnauthorized = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
    setIsLoggedIn(false)
    setCurrentView("login")
    toast({
      title: "انتهت صلاحية الجلسة",
      description: "يرجى تسجيل الدخول مرة أخرى",
      variant: "destructive",
    })
  }

  // ─────────────── Fetch appointments + services + free appointments
  const fetchData = async () => {
    try {
      const [resAppointments, resServices, resFreeAppointments] = await Promise.all([
        fetch(`${api}/api/barber/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${api}/api/barber/services`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${api}/api/barber/free-appointments`, {   // NEW
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if ([resAppointments, resServices, resFreeAppointments].some(r => r.status === 401)) {
        handleUnauthorized()
        return
      }

      if (![resAppointments.ok, resServices.ok, resFreeAppointments.ok].every(Boolean))
        throw new Error("فشل تحميل البيانات")

      const appsData = await resAppointments.json()
      const servicesData = await resServices.json()
      const freeAppsData = await resFreeAppointments.json()

      setAppointments(appsData)
      setServices(servicesData)
      setFreeAppointments(
        freeAppsData.sort((a, b) => new Date(a.appointment.date) - new Date(b.appointment.date))
      )
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  // ─────────────── Service CRUD
  const handleSaveService = async () => {
    try {
      const res = await fetch(`${api}/api/barber/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newService),
      })

      if (res.status === 401) return handleUnauthorized()
      if (!res.ok) throw new Error("فشل إضافة الخدمة")

      const created = await res.json()
      setServices((prev) => [...prev, created])
      setShowServiceForm(false)
      setNewService({ name: "", price: "", duration: "" })
      toast({ title: "تمت إضافة الخدمة بنجاح" })
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  const handleDeleteService = async (id) => {
    try {
      const res = await fetch(`${api}/api/barber/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.status === 401) return handleUnauthorized()
      if (!res.ok) throw new Error("فشل حذف الخدمة")

      setServices((prev) => prev.filter((s) => s.id !== id))
      toast({ title: "تم حذف الخدمة" })
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }
  // Put this helper at the top of your component
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("ar-EG", {
    weekday: "long",   // الاثنين
    year: "numeric",   // 2025
    month: "long",     // سبتمبر
    day: "numeric",    // 15
  })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

  // ─────────────── Update appointment status
  const handleAppointmentAction = async (id, status) => {
    try {
      const res = await fetch(`${api}/api/barber/appointments/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (res.status === 401) return handleUnauthorized()
      if (!res.ok) throw new Error("فشل تحديث الموعد")

      const { appointment } = await res.json()

      setAppointments((prev) =>
        prev.map((a) => (a.id === appointment.id ? appointment : a))
      )

      toast({
        title: "تم تحديث الموعد",
        description: `الحالة الجديدة: ${statusBadge[status]?.label}`,
      })
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  // ─────────────── Status helpers
  const statusBadge = {
    pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    confirmed: { label: "مؤكد", color: "bg-blue-100 text-blue-700", icon: BadgeCheck },
    completed: { label: "مكتمل", color: "bg-green-100 text-green-700", icon: Check },
    rejected: { label: "مرفوض", color: "bg-red-100 text-red-700", icon: Ban },
  }

  const filteredAppointments = appointments.filter((a) =>
    activeTab === "all" ? true : a.status === activeTab
  )

  if (loading) return <p className="text-center">جاري التحميل...</p>

  return (
    <div className="space-y-8">
      {/* ─────────────── Tabs ─────────────── */}
      <div className="flex gap-3">
        {["pending", "confirmed", "completed", "rejected", "free"].map((tab) => {
          if (tab === "free") {
            return (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                المواعيد المجانية
              </Button>
            )
          }
          const badge = statusBadge[tab]
          return (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
              className="flex items-center gap-2"
            >
              <badge.icon className="h-4 w-4" />
              {badge.label}
            </Button>
          )
        })}
      </div>

      {/* ─────────────── Appointments Section ─────────────── */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">
          {activeTab === "free" ? "المواعيد المجانية" : "المواعيد"}
        </h3>

        {activeTab === "free" ? (
          freeAppointments.length === 0 ? (
            <p className="text-gray-500">لا توجد مواعيد مجانية</p>
          ) : (
            <div className="space-y-4">
              {freeAppointments.map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <User className="h-4 w-4" /> {f.user?.firstname} {f.user?.lastname}
                    </h4>
                    <p className="text-sm text-gray-600">
                    {formatDate(f.appointment.date)} - {f.slot.time}

                    </p>
                  </div>
                  {f.slot.isBooked ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      محجوز
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      متاح
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )
        ) : filteredAppointments.length === 0 ? (
          <p className="text-gray-500">لا توجد مواعيد {statusBadge[activeTab]?.label}</p>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const badge = statusBadge[appointment.status]
              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <User className="h-4 w-4" /> {appointment.customerName}
                    </h4>
                    <p className="text-sm text-gray-600">الخدمة: {appointment.serviceName}</p>
                    <div className="flex items-center gap-4 text-gray-600 mt-1 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {appointment.time}
                      </span>
                      <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> {formatDate(appointment.date)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                      {badge.label}
                    </span>
                    <p className="font-semibold text-primary mt-2">{appointment.price} شيكل</p>

                    {appointment.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAppointmentAction(appointment.id, "rejected")}
                        >
                          <X className="h-4 w-4 ml-1" /> رفض
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAppointmentAction(appointment.id, "confirmed")}
                        >
                          <Check className="h-4 w-4 ml-1" /> تأكيد
                        </Button>
                      </div>
                    )}
                    {appointment.status === "confirmed" && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => handleAppointmentAction(appointment.id, "completed")}
                      >
                        وضع كمكتمل
                      </Button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─────────────── Services Section ─────────────── */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">الخدمات</h3>
          <Button onClick={() => setShowServiceForm(true)}>
            <Plus className="h-4 w-4 ml-2" /> إضافة خدمة جديدة
          </Button>
        </div>

        {showServiceForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mb-4"
          >
            <input
              type="text"
              placeholder="اسم الخدمة"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              className="border rounded p-2 w-full"
            />
            <input
              type="number"
              placeholder="السعر"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              className="border rounded p-2 w-full"
            />
            <input
              type="number"
              placeholder="المدة (بالدقائق)"
              value={newService.duration}
              onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
              className="border rounded p-2 w-full"
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveService}>حفظ</Button>
              <Button variant="outline" onClick={() => setShowServiceForm(false)}>
                إلغاء
              </Button>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          {services.length === 0 ? (
            <p className="text-gray-500">لم تتم إضافة خدمات بعد</p>
          ) : (
            services.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-gray-600">
                    {s.price} شيكل - {s.duration} دقيقة
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteService(s.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AppointmentsPage
