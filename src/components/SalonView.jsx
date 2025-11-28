
import React from "react"
import { motion } from "framer-motion"
import { Star, Clock, Scissors, MapPin } from "lucide-react"
import { Button } from "./ui/button"

function SalonView({ salon, onBookBarber }) {
  if (!salon) return null

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <img  
            className="w-full h-64 object-cover rounded-lg mb-4" 
            alt={`صالون ${salon.name}`}
            src="https://images.unsplash.com/photo-1633681926019-03bd9325ec20" 
          />
          <h2 className="text-3xl font-bold mb-2">{salon.name}</h2>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 ml-1" />
              <span>{salon.location}</span>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 ml-1" />
              <span>{salon.rating}</span>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-6">الحلاقون المتوفرون</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {salon.barbers.map((barber, index) => (
            <motion.div
              key={barber.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card p-6 rounded-lg shadow-lg"
            >
              <div className="mb-4">
                <img  
                  className="w-full h-48 object-cover rounded-md" 
                  alt={`صورة ${barber.name}`}
                  src="https://images.unsplash.com/photo-1556755140-e34e22dcb26c" 
                />
              </div>
              <h4 className="text-xl font-semibold mb-2">{barber.name}</h4>
              <div className="flex items-center mb-2">
                <Star className="h-5 w-5 text-yellow-500 ml-1" />
                <span>{barber.rating}</span>
              </div>
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 ml-1" />
                <span>{barber.experience}</span>
              </div>
              <div className="mb-4">
                <p className="font-semibold mb-2">الخدمات:</p>
                <ul className="space-y-1">
                  {barber.services.map((service, idx) => (
                    <li key={idx} className="flex items-center">
                      <Scissors className="h-4 w-4 ml-2" />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-4">
                <p className="font-semibold mb-2">أوقات العمل:</p>
                <p className="text-gray-600">
                  من {barber.workingHours.from} إلى {barber.workingHours.to}
                </p>
              </div>
              <div className="mb-4">
                <p className="font-semibold">السعر:</p>
                <p className="text-lg text-primary">{barber.price} شيكل</p>
              </div>
              <Button 
                className="w-full"
                onClick={() => onBookBarber(barber.id)}
              >
                حجز موعد
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default SalonView
