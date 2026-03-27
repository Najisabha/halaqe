import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useToast } from "../../ui/use-toast"
import { Users, Scissors, Briefcase, Trash2, Eye } from "lucide-react"
import AdminNavbar from "../../AdminNavbar"
import { Button } from "../../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog"

// 🔗 API wrapper
async function apiFetch(url, { method = "GET", body } = {}) {
  const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/+$/, "");

  const res = await fetch(`${apiBase}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
    window.location.href = "/login"
    throw new Error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا")
  }

  if (!res.ok) {
    let errorMessage = "حدث خطأ أثناء الاتصال بالخادم"
    try {
      const raw = await res.text()
      const errorData = raw ? JSON.parse(raw) : {}
      errorMessage = errorData.message || errorMessage
    } catch (_) {}
    throw new Error(errorMessage)
  }

  const raw = await res.text()
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return { message: raw }
  }
}

// 📅 Helper to format dates
const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  } catch {
    return "—"
  }
}

function AdminDashboard({ currentUser, currentView, setCurrentView, setIsLoggedIn }) {
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [barbers, setBarbers] = useState([])
  const [providers, setProviders] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  // 🔄 Fetch data
  const loadData = async () => {
    try {
      setLoading(true)
      const data = await apiFetch("/api/admin/users-barbers")
      setUsers(data?.users || [])
      setBarbers(data?.barbers || [])
      setProviders(data?.providers || [])
    } catch (err) {
      console.error("❌ API error:", err)
      toast({
        title: "خطأ",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ❌ Delete user, barber, or provider
  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return

    try {
      await apiFetch(`/api/admin/users-barbers/${id}`, { method: "DELETE" })
      toast({ title: "✅ تم الحذف بنجاح" })

      // refresh states
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setBarbers((prev) => prev.filter((b) => b.id !== id))
      setProviders((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      toast({
        title: "خطأ",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  // 🔍 Filter by search
  const filterData = (list) =>
    list.filter(
      (item) =>
        item.firstname?.toLowerCase().includes(search.toLowerCase()) ||
        item.lastname?.toLowerCase().includes(search.toLowerCase()) ||
        item.email?.toLowerCase().includes(search.toLowerCase())
    )

  // 🗺️ User map for reviewer names
  const userMap = users.reduce((map, u) => {
    map[u.id] = `${u.firstname} ${u.lastname}`
    return map
  }, {})

  // ⭐ Calculate average rating
  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return "—"
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    return `${avg.toFixed(1)} ⭐ (${reviews.length} تقييمات)`
  }

  if (loading) {
    return <p className="text-center py-20">⏳ جاري تحميل البيانات...</p>
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Navbar */}
      <AdminNavbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        setIsLoggedIn={setIsLoggedIn}
      />

      <div className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-8">لوحة تحكم المشرف</h2>

          {/* 🔍 Search */}
          <input
            type="text"
            placeholder="ابحث بالاسم الأول أو البريد الإلكتروني..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 mb-6 border rounded-lg shadow-sm"
          />

          {/* كل الحلاقين */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Scissors className="ml-2 h-5 w-5" /> كل الحلاقين ({barbers.length})
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>المدينة - المنطقة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterData(barbers).map((barber) => (
                  <TableRow key={barber.id}>
                    <TableCell>{`${barber.firstname} ${barber.lastname}`}</TableCell>
                    <TableCell>{barber.email}</TableCell>
                    <TableCell>{barber.phonenumber || "—"}</TableCell>
                    <TableCell>{`${barber.city || "—"} - ${barber.area || "—"}`}</TableCell>
                    <TableCell>{formatDate(barber.createdAt)}</TableCell>
                    <TableCell>{getAverageRating(barber.reviewsReceived)}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelected(barber)}
                      >
                        <Eye className="h-4 w-4 ml-1" /> عرض
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(barber.id)}
                      >
                        <Trash2 className="h-4 w-4 ml-1" /> حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* كل المزودين */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Briefcase className="ml-2 h-5 w-5" /> كل المزودين ({providers.length})
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>المدينة - المنطقة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterData(providers).map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>{`${provider.firstname} ${provider.lastname}`}</TableCell>
                    <TableCell>{provider.email}</TableCell>
                    <TableCell>{provider.phonenumber || "—"}</TableCell>
                    <TableCell>{`${provider.city || "—"} - ${provider.area || "—"}`}</TableCell>
                    <TableCell>{formatDate(provider.createdAt)}</TableCell>
                    <TableCell>{getAverageRating(provider.reviewsReceived)}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelected(provider)}
                      >
                        <Eye className="h-4 w-4 ml-1" /> عرض
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(provider.id)}
                      >
                        <Trash2 className="h-4 w-4 ml-1" /> حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* كل المستخدمين */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="ml-2 h-5 w-5" /> كل المستخدمين ({users.length})
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>المدينة - المنطقة</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterData(users).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{`${user.firstname} ${user.lastname}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phonenumber || "—"}</TableCell>
                    <TableCell>{`${user.city || "—"} - ${user.area || "—"}`}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelected(user)}
                      >
                        <Eye className="h-4 w-4 ml-1" /> عرض
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4 ml-1" /> حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>

      {/* 📝 Details Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل {selected?.firstname} {selected?.lastname}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p><strong>البريد:</strong> {selected?.email}</p>
            <p><strong>الهاتف:</strong> {selected?.phonenumber || "—"}</p>
            <p><strong>المدينة - المنطقة:</strong> {`${selected?.city || "—"} - ${selected?.area || "—"}`}</p>
            <p><strong>تاريخ الإنشاء:</strong> {formatDate(selected?.createdAt)}</p>
            {selected?.idDocumentUrl && (
              <a href={selected.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                عرض وثيقة الهوية
              </a>
            )}
            {selected?.professionLicenseUrl && (
              <a href={selected.professionLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                عرض ترخيص المهنة
              </a>
            )}
            {selected?.reviewsReceived && selected.reviewsReceived.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">التقييمات:</h4>
                <div className="grid gap-3">
                  {selected.reviewsReceived.map((review) => (
                    <div key={review.id} className="p-3 border rounded-lg">
                      <p><strong>التقييم:</strong> {review.rating} ⭐</p>
                      <p><strong>التعليق:</strong> {review.comment || "—"}</p>
                      {review.reply && <p><strong>الرد:</strong> {review.reply}</p>}
                      <p><strong>التاريخ:</strong> {formatDate(review.createdAt)}</p>
                      <p><strong>من:</strong> {userMap[review.customerId] || "مجهول"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminDashboard