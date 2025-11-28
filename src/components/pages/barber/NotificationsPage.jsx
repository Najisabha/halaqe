import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  Bell, Calendar, Star, DollarSign,
  CheckCircle, XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

function NotificationsPage({ setIsLoggedIn, setCurrentView }) {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState([])
  const token = localStorage.getItem("token")

            const api = import.meta.env.VITE_API_URL;

  const getStatusIcon = (type) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-6 w-6" />
      case "review":
        return <Star className="h-6 w-6" />
      case "payment":
        return <DollarSign className="h-6 w-6" />
      default:
        return <Bell className="h-6 w-6" />
    }
  }

  const getStatusColor = (color) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600"
      case "yellow":
        return "bg-yellow-100 text-yellow-600"
      case "green":
        return "bg-green-100 text-green-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  // Logout if token expired
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
    setIsLoggedIn(false)
    setCurrentView("login")
    toast({
      title: "انتهت صلاحية الجلسة",
      description: "يرجى تسجيل الدخول مرة أخرى",
      variant: "destructive"
    })
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${api}/api/barber/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (res.status === 401) return handleLogout()

      const data = await res.json()
      setNotifications(data)
    } catch (err) {
      console.error(err)
      toast({
        title: "خطأ في تحميل الإشعارات",
        variant: "destructive"
      })
    }
  }

  // Handle action (accept/reject)
  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${api}/api/barber/notifications/${id}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      })

      if (res.status === 401) return handleLogout()

      if (!res.ok) throw new Error("فشل تحديث الإشعار")

      setNotifications(notifications.filter(n => n.id !== id))
      toast({
        title: action === "confirm" ? "تم قبول الموعد" : "تم رفض الموعد"
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "خطأ في تحديث الإشعار",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">الإشعارات</h2>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {notifications.length === 0 ? (
          <p className="text-gray-500">لا توجد إشعارات حالياً</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className={`${getStatusColor(notification.color)} p-2 rounded-full`}>
                  {getStatusIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{notification.title}</h3>
                    <span className="text-sm text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-gray-600">{notification.message}</p>
                  {notification.action && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(notification.id, "reject")}
                      >
                        <XCircle className="h-4 w-4 ml-2" />
                        رفض
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAction(notification.id, "confirm")}
                      >
                        <CheckCircle className="h-4 w-4 ml-2" />
                        قبول
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
