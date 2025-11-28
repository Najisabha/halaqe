import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Plus } from "lucide-react"
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
function FreeAppointmentsPage({ barberId }) {
  const [appointments, setAppointments] = useState([])
  const [form, setForm] = useState({
    service: "",
    services: [],
    experienceCount: "",
    experienceUnit: "سنة",
    date: "",
    time: "",
  })
  const [editingId, setEditingId] = useState(null)
          const api = import.meta.env.VITE_API_URL;

 
  const loadAppointments = async () => {
    const res = await fetch(`${api}/api/barber/${barberId}/free-appointments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    if (res.status === 401) return handleUnauthorized()
    const data = await res.json()
    setAppointments(data)
  }

  useEffect(() => {
    loadAppointments()
  }, [barberId])

  const handleAddService = () => {
    if (form.service.trim() !== "") {
      setForm({ ...form, services: [...form.services, form.service], service: "" })
    }
  }

  const handleSubmit = async () => {
    const payload = {
      services: form.services,
      experience: `${form.experienceCount} ${form.experienceUnit}`,
      date: form.date,
      time: form.time,
    }

    if (editingId) {
      await fetch(`${api}/api/barber/free-appointments/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch(`${api}/api/barber/free-appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ ...payload, barberId }),
      })
    }
    setForm({ service: "", services: [], experienceCount: "", experienceUnit: "سنة", date: "", time: "" })
    setEditingId(null)
    loadAppointments()
  }

  const handleDelete = async (id) => {
    await fetch(`${api}/api/barber/free-appointments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")} `},
    })
    loadAppointments()
  }

  const handleEdit = (appt) => {
    setForm({
      services: appt.services,
      service: "",
      experienceCount: appt.experience.split(" ")[0],
      experienceUnit: appt.experience.split(" ")[1],
      date: appt.date.split("T")[0],
      time: appt.time,
    })
    setEditingId(appt.id)
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4">المواعيد المجانية</h2>

      {/* ✅ Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="أدخل خدمة"
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
            className="border rounded-lg p-2 flex-1"
          />
          <Button onClick={handleAddService}>
            <Plus className="h-4 w-4 mr-1" /> إضافة
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.services.map((s, i) => (
            <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
              {s}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="عدد الخبرة"
            value={form.experienceCount}
            onChange={(e) => setForm({ ...form, experienceCount: e.target.value })}
            className="border rounded-lg p-2"
          />
          <select
            value={form.experienceUnit}
            onChange={(e) => setForm({ ...form, experienceUnit: e.target.value })}
            className="border rounded-lg p-2"
          >
            <option value="شهر">شهر</option>
            <option value="سنة">سنة</option>
          </select>
        </div>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="border rounded-lg p-2 w-full"
        />
        <input
          type="time"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          className="border rounded-lg p-2 w-full"
        />
        <Button onClick={handleSubmit} className="w-full">
          {editingId ? "تحديث الموعد" : "إضافة الموعد"}
        </Button>
      </motion.div>

      {/* ✅ List */}
      <div className="space-y-4">
        {appointments.map((a) => (
          <div key={a.id} className="p-4 border rounded-lg flex justify-between items-start">
            <div>
              <p className="font-semibold">الخدمات: {a.services.join("، ")}</p>
              <p className="text-sm text-gray-600">الخبرة: {a.experience}</p>
              <p className="text-sm text-gray-600">التاريخ: {a.date.split("T")[0]}</p>
              <p className="text-sm text-gray-600">الوقت: {a.time}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(a)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(a.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FreeAppointmentsPage