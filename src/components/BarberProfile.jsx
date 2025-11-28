
import React from "react"
import { motion } from "framer-motion"
import { Star, Clock, Scissors, MapPin } from "lucide-react"
import { Button } from "./ui/button"

function BarberProfile({ barber }) {
  if (!barber) return null

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-64">
            <img  
              className="w-full h-full object-cover" 
              alt={`صورة ${barber.name}`}
              src="https://images.unsplash.com/photo-1622287162716-f311baa1a2b8"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h1 className="text-3xl font-bold text-white">{barber.name}</h1>
              <div className="flex items-center gap-4 text-white mt-2">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 ml-1" />
                  <span>{barber.rating}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 ml-1" />
                  <span>{barber.experience}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">الخدمات</h2>
                <ul className="space-y-3">
                  {barber.services.map((service, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-muted p-3 rounded-md">
                      <div className="flex items-center">
                        <Scissors className="h-4 w-4 ml-2" />
                        <span>{service}</span>
                      </div>
                      <span className="font-semibold">{barber.price} شيكل</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">معلومات الحجز</h2>
                <div className="bg-muted p-4 rounded-md">
                  <div className="mb-4">
                    <p className="font-semibold mb-2">ساعات العمل:</p>
                    <p>من {barber.workingHours.from} إلى {barber.workingHours.to}</p>
                  </div>
                  <div className="mb-4">
                    <p className="font-semibold mb-2">مدة الخدمة:</p>
                    <p>{barber.serviceTime} دقيقة</p>
                  </div>
                  <Button className="w-full">
                    حجز موعد
                  </Button>
                </div>
              </div>
            </div>

            {barber.portfolio && barber.portfolio.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">معرض الأعمال</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {barber.portfolio.map((work) => (
                    <div key={work.id} className="relative rounded-lg overflow-hidden">
                      <img  
                        className="w-full h-48 object-cover" 
                        alt={work.title}
                        src="https://images.unsplash.com/photo-1622287162716-f311baa1a2b8"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                        <p className="text-white text-sm">{work.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">التقييمات</h2>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">أحمد محمد</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="ml-1">4.5</span>
                    </div>
                  </div>
                  <p className="text-gray-600">خدمة ممتازة وحلاقة احترافية</p>
                </div>
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">خالد علي</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="ml-1">5.0</span>
                    </div>
                  </div>
                  <p className="text-gray-600">تجربة رائعة وخدمة مميزة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default BarberProfile
