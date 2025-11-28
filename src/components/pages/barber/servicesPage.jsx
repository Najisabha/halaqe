import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Scissors, Plus, Trash, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

function ServicesPage({ setIsLoggedIn, setCurrentView }) {
  const { toast } = useToast()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("token")

  // Logout handler for expired token
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
          const api = import.meta.env.VITE_API_URL;

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${api}/api/barber/services`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 401) return handleUnauthorized()
        if (!res.ok) throw new Error("فشل تحميل الخدمات")

        const data = await res.json()
        setServices(data)
      } catch (err) {
        console.error(err)
        toast({ title: "خطأ", description: err.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  // Add new service
  const handleAddService = () => {
    const newService = {
      id: Date.now().toString(),
      name: "",
      price: 0,
      duration: 30,
      isNew: true,
    }
    setServices([...services, newService])
  }

  // Update service locally
  const handleChange = (id, field, value) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  // Save service to backend
  const handleSaveService = async (service) => {
    try {
      const method = service.isNew ? "POST" : "PUT"
      const url = service.isNew
        ? `${api}/api/barber/services`
        : `${api}/api/barber/services/${service.id}`

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(service),
      })

      if (res.status === 401) return handleUnauthorized()
      if (!res.ok) throw new Error("فشل حفظ الخدمة")

      const saved = await res.json()
      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...saved, isNew: false } : s
        )
      )

      toast({ title: "تم حفظ الخدمة بنجاح" })
    } catch (err) {
      console.error(err)
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  // Delete service
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
      console.error(err)
      toast({ title: "خطأ", description: err.message, variant: "destructive" })
    }
  }

  if (loading) return <p>جاري التحميل...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">إضافة أنواع الحلاقات</h2>
        <Button onClick={handleAddService} variant="outline">
          <Plus className="h-4 w-4 ml-2" />
          إضافة خدمة جديدة
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        {services.length === 0 ? (
          <p className="text-gray-500">لم تتم إضافة أي خدمات بعد</p>
        ) : (
          services.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg"
            >
              <div className="flex items-center gap-2 flex-1">
                <Scissors className="h-5 w-5 text-primary" />
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) =>
                    handleChange(service.id, "name", e.target.value)
                  }
                  placeholder="اسم الخدمة"
                  className="border rounded p-2 flex-1"
                />
                <input
                  type="number"
                  value={service.price}
                  onChange={(e) =>
                    handleChange(service.id, "price", Number(e.target.value))
                  }
                  placeholder="السعر"
                  className="border rounded p-2 w-24"
                />
                <input
                  type="number"
                  value={service.duration}
                  onChange={(e) =>
                    handleChange(service.id, "duration", Number(e.target.value))
                  }
                  placeholder="المدة (دقيقة)"
                  className="border rounded p-2 w-28"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSaveService(service)}
                >
                  <Save className="h-4 w-4 ml-1" /> حفظ
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteService(service.id)}
                >
                  <Trash className="h-4 w-4 ml-1" /> حذف
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default ServicesPage
