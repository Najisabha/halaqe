import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, DollarSign, 
  TrendingUp, Calendar, Clock, Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"

function WalletPage() {
  const { toast } = useToast()
  const [balance, setBalance] = useState(0)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0,
    pendingPayments: 0,
  })
  const token = localStorage.getItem("token")

  // ✅ always array
  const [transactions, setTransactions] = useState([])
  const [period, setPeriod] = useState("week") // week, month, year
  const [filter, setFilter] = useState("all") // all, income, withdraw
  const [loading, setLoading] = useState(true)
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        
           
        const res = await axios.get(`${api}/api/barber/wallet/all`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log(res.data)
        setBalance(res.data.balance || 0)
        setStats(res.data.stats || {
          totalEarnings: 0,
          thisMonth: 0,
          lastMonth: 0,
          growth: 0,
          pendingPayments: 0,
        })
        // ✅ make sure it's always array
        setTransactions(Array.isArray(res.data.transactions) ? res.data.transactions : [])
      } catch (err) {
        console.error(err)
        toast({
          title: "خطأ",
          description: "فشل في تحميل بيانات المحفظة",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchWallet()
  }, [])

  // ✅ safe filter
  const filteredTransactions = Array.isArray(transactions)
    ? transactions.filter((t) => (filter === "all" ? true : t.type === filter))
    : []

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return <p className="text-center py-10">جاري تحميل البيانات...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">المحفظة</h2>
        <Button onClick={() => (window.location.href = "/withdraw")}>
          <DollarSign className="h-4 w-4 ml-2" />
          سحب الأموال
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Wallet className="h-8 w-8 text-primary" />
            <span className="text-green-500 text-sm">متاح للسحب</span>
          </div>
          <p className="text-gray-600">الرصيد الحالي</p>
          <h3 className="text-2xl font-bold">{balance} شيكل</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <span className="text-green-500 text-sm">+{stats.growth}%</span>
          </div>
          <p className="text-gray-600">إيرادات الشهر</p>
          <h3 className="text-2xl font-bold">{stats.thisMonth} شيكل</h3>
          <p className="text-sm text-gray-500 mt-2">
            الشهر الماضي: {stats.lastMonth} شيكل
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-gray-600">إجمالي الإيرادات</p>
          <h3 className="text-2xl font-bold">{stats.totalEarnings} شيكل</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-gray-600">مدفوعات معلقة</p>
          <h3 className="text-2xl font-bold">{stats.pendingPayments} شيكل</h3>
        </motion.div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">المعاملات</h3>
          <div className="flex gap-4">
            <select
              className="p-2 border rounded-md"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="week">آخر أسبوع</option>
              <option value="month">آخر شهر</option>
              <option value="year">آخر سنة</option>
            </select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              تصفية
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            جميع المعاملات
          </Button>
          <Button
            variant={filter === "income" ? "default" : "outline"}
            onClick={() => setFilter("income")}
          >
            المدفوعات المستلمة
          </Button>
          <Button
            variant={filter === "withdraw" ? "default" : "outline"}
            onClick={() => setFilter("withdraw")}
          >
            عمليات السحب
          </Button>
        </div>

        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <p className="text-center text-gray-500">لا توجد معاملات</p>
          ) : (
            filteredTransactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === "income"
                        ? "bg-green-100"
                        : "bg-blue-100"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <ArrowDownLeft className="h-6 w-6 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {transaction.type === "income"
                        ? `دفع بقيمة ${transaction.amount} شيكل`
                        : `سحب إلى ${transaction.metadata?.to || "الحساب البنكي"}`}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 ml-1" />
                        {formatDate(transaction.date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 ml-1" />
                        {transaction.time}
                      </div>
                    </div>
                    {transaction.metadata?.service && (
                      <p className="text-sm text-gray-600 mt-1">
                        الخدمة: {transaction.metadata.service}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {transaction.amount} شيكل
                  </p>
                  <p
                    className={`text-sm ${
                      transaction.status === "completed"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {transaction.status === "completed"
                      ? "مكتمل"
                      : "قيد المعالجة"}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default WalletPage
