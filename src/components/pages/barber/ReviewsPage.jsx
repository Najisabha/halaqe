import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Star, ThumbsUp, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

function ReviewsPage({ setIsLoggedIn, setCurrentView }) {
  const { toast } = useToast()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const token = localStorage.getItem("token")
          const api = import.meta.env.VITE_API_URL;


  // Logout handler if token expired
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

  // Fetch reviews + stats
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${api}/api/barber/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log(res)
      if (res.status === 401) return handleLogout()

      const data = await res.json()
      setReviews(data.reviews || [])
      setStats(data.stats || null)
    } catch (err) {
      console.error(err)
      toast({
        title: "خطأ في تحميل التقييمات",
        variant: "destructive"
      })
    }
  }

  // Reply to review
  const handleReply = async (id, reply) => {
    try {
      const res = await fetch(`${api}/api/barber/reviews/${id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reply })
      })

      if (res.status === 401) return handleLogout()
      if (!res.ok) throw new Error("فشل إرسال الرد")

      // Update UI
      setReviews(reviews.map(r => r.id === id ? { ...r, replied: true, reply } : r))
      toast({ title: "تم إرسال الرد بنجاح" })
    } catch (err) {
      console.error(err)
      toast({
        title: "خطأ في إرسال الرد",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">التقييمات</h2>

      {/* Stats Overview */}
      {stats && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(stats.averageRating)
                        ? "text-yellow-500 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">من {stats.totalReviews} تقييم</p>
            </div>

            <div className="col-span-2">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center w-12">
                      <span>{rating}</span>
                      <Star className="h-4 w-4 text-yellow-500 ml-1" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full"
                        style={{
                          width: `${(stats.ratingDistribution[rating] / stats.totalReviews) * 100}%`
                        }}
                      />
                    </div>
                    <div className="w-12 text-right text-gray-600">
                      {stats.ratingDistribution[rating]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">آخر التقييمات</h3>
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-500">لا توجد تقييمات حتى الآن</p>
          ) : (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b last:border-0 pb-6 last:pb-0"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{review.customerName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600 text-sm">{review.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="h-4 w-4 ml-2" />
                      شكر
                    </Button>
                    {!review.replied && (
                      <Button size="sm" onClick={() => handleReply(review.id, "شكراً على تقييمك!")}>
                        <MessageCircle className="h-4 w-4 ml-2" />
                        رد
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{review.comment}</p>
                {review.replied && (
                  <div className="bg-gray-50 p-4 rounded-lg mr-8 relative before:content-[''] before:absolute before:right-[-16px] before:top-4 before:border-8 before:border-transparent before:border-l-gray-50">
                    <p className="text-sm text-gray-600">{review.reply}</p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewsPage
