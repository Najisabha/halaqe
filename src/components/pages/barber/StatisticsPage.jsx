import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Star, Users, Calendar, DollarSign, Clock, Scissors, Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "../../ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

function StatisticsPage({ setIsLoggedIn, setCurrentView }) {
  const { toast } = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("token")
          const api = import.meta.env.VITE_API_URL;

  
  // Logout if token expired
  const handleLogout = () => {
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

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${api}/api/barber/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.status === 401) return handleLogout()
      if (!res.ok) throw new Error("فشل تحميل الإحصائيات")

      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error(err)
      toast({
        title: "خطأ في تحميل الإحصائيات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [])

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">⏳ جاري تحميل الإحصائيات...</p>
  }

  if (!stats) {
    return <p className="text-center text-red-500 mt-10">❌ لم يتم العثور على بيانات</p>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📊 لوحة الإحصائيات</h2>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="h-4 w-4 ml-2" /> تصدير التقرير
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 text-green-500" />
            <span className="text-green-500 text-sm">+{stats.revenue.growth}%</span>
          </div>
          <p className="text-gray-600">إجمالي الإيرادات</p>
          <h3 className="text-2xl font-bold">{stats.revenue.total} شيكل</h3>
          <p className="text-sm text-gray-500 mt-2">
            الشهر الماضي: {stats.revenue.lastMonth} شيكل
          </p>
        </motion.div>

        {/* Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-blue-500" />
            <span className="text-blue-500 text-sm">{stats.customers.new} جديد</span>
          </div>
          <p className="text-gray-600">العملاء</p>
          <h3 className="text-2xl font-bold">{stats.customers.total}</h3>
          <p className="text-sm text-gray-500 mt-2">
            {stats.customers.returning} عميل دائم
          </p>
        </motion.div>

        {/* Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 text-purple-500" />
            <span className="text-purple-500 text-sm">{stats.appointments.completed} مكتمل</span>
          </div>
          <p className="text-gray-600">المواعيد</p>
          <h3 className="text-2xl font-bold">{stats.appointments.total}</h3>
          <p className="text-sm text-gray-500 mt-2">
            {stats.appointments.cancelled} موعد ملغي
          </p>
        </motion.div>

        {/* Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Star className="h-8 w-8 text-yellow-500" />
            <span className="text-yellow-500 text-sm">{stats.rating.total} تقييم</span>
          </div>
          <p className="text-gray-600">متوسط التقييم</p>
          <h3 className="text-2xl font-bold">{stats.rating.average.toFixed(1)}</h3>
          <div className="flex items-center mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(stats.rating.average)
                    ? "text-yellow-500 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Services Stats */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-6">💈 إحصائيات الخدمات</h3>
          <div className="space-y-4">
            {stats.services?.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Scissors className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.count} مرة</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{service.revenue} شيكل</p>
                  <p className="text-sm text-gray-600">الإيرادات</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Appointments */}
<div className="bg-white rounded-lg shadow-lg p-6">
  <h3 className="text-xl font-semibold mb-6">مواعيد اليوم</h3>
  <div className="space-y-4">
    {stats.todayAppointments?.length > 0 ? (
      stats.todayAppointments.map((appt, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">
                {appt.customer?.firstname} {appt.customer?.lastname}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(appt.date).toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                appt.status === "completed"
                  ? "bg-green-100 text-green-600"
                  : appt.status === "cancelled"
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {appt.status === "completed"
                ? "مكتمل"
                : appt.status === "cancelled"
                ? "ملغي"
                : "قادم"}
            </span>
          </div>
        </motion.div>
      ))
    ) : (
      <p className="text-center text-gray-500">لا توجد مواعيد اليوم</p>
    )}
  </div>
</div>

    </div>
  )
}

export default StatisticsPage
