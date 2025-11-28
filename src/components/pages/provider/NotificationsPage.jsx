import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Bell, Calendar, Star, Info, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

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
const api = async (url, method = "GET", body) => {
          const api = import.meta.env.VITE_API_URL;

    const res = await fetch(`${api}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error("API Error")
  if (res.status === 401) return handleUnauthorized()
  return res.json()
}
function NotificationsProviderPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const iconMap = {
    appointment: { icon: Calendar, color: "blue" },
    rating: { icon: Star, color: "yellow" },
    info: { icon: Info, color: "gray" },
    default: { icon: Bell, color: "gray" },
  }

  // 🔹 Fetch notifications
  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await api("/api/provider/notifications", "GET")
      setNotifications(data)
    } catch {
      toast({ title: "خطأ", description: "فشل تحميل الإشعارات", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  // 🔹 Mark as read
  const markAsRead = async (id) => {
    try {
      await api(`/api/provider/notifications/${id}/read`, "PUT")
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch {
      toast({ title: "خطأ", description: "فشل تحديث الإشعار", variant: "destructive" })
    }
  }

  // 🔹 Mark all as read
  const markAllAsRead = async () => {
    try {
      await api("/api/provider/notifications/read-all", "PUT")
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast({ title: "تم التحديث", description: "تم تعليم جميع الإشعارات كمقروءة" })
    } catch {
      toast({ title: "خطأ", description: "فشل تحديث الإشعارات", variant: "destructive" })
    }
  }

  if (loading) return <p className="text-center">جاري التحميل...</p>

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">الإشعارات</h2>
          {notifications.some((n) => !n.read) && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 ml-2" />
              تحديد الكل كمقروء
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center">لا توجد إشعارات</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const { icon: Icon, color } =
                  iconMap[notification.type] || iconMap.default

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-4 p-4 rounded-lg ${
                      notification.read ? "bg-gray-50" : "bg-blue-50"
                    }`}
                  >
                    <div className={`bg-${color}-100 p-2 rounded-full`}>
                      <Icon className={`h-6 w-6 text-${color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 text-blue-600"
                          onClick={() => markAsRead(notification.id)}
                        >
                          تعليم كمقروء
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default NotificationsProviderPage
