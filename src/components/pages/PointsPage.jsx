// نقاط المستخدمين
import React from "react"
import { motion } from "framer-motion"
import { Star, Gift, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

function PointsPage({ currentUser }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-2xl font-bold mb-8">نقاطي</h2>

        {/* رصيد النقاط */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600">رصيد النقاط الحالي</p>
              <h3 className="text-3xl font-bold">{currentUser.points} نقطة</h3>
            </div>
            <Star className="h-12 w-12 text-yellow-500" />
          </div>
          <Button className="w-full">تحويل النقاط إلى رصيد</Button>
        </div>

        {/* كيفية كسب النقاط */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">كيف تكسب المزيد من النقاط؟</h3>
          <div className="grid gap-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">احجز موعدك مبكراً</p>
                <p className="text-sm text-gray-600">احصل على 10 نقاط لكل حجز قبل 24 ساعة</p>
              </div>
            </div>


          </div>
        </div>

        {/* المكافآت المتاحة */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">المكافآت المتاحة</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">خصم 50 شيكل</p>
                  <p className="text-sm text-gray-600">500 نقطة</p>
                </div>
              </div>
              <Button variant="outline">استبدال</Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">حلاقة مجانية</p>
                  <p className="text-sm text-gray-600">1000 نقطة</p>
                </div>
              </div>
              <Button variant="outline">استبدال</Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PointsPage
