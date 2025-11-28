import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
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
function BarberReviewsPage({ barberId }) {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    const fetchReviews = async () => {
                const api = import.meta.env.VITE_API_URL;

      const res = await fetch(`${api}/api/barber/${barberId}/reviews`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (res.status === 401) return handleUnauthorized()

      const data = await res.json()
      setReviews(data)
    }
    fetchReviews()
  }, [barberId])

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4">تقييمات العملاء</h2>
      {reviews.length === 0 ? (
        <p className="text-gray-500">لا توجد تقييمات بعد</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 border rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{r.user?.name || "عميل مجهول"}</span>
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < r.rating ? "fill-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-600">{r.comment}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BarberReviewsPage