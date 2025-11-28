
import React, { useEffect } from "react"
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Star } from "lucide-react"
import { Button } from "./ui/button"
import "leaflet/dist/leaflet.css"

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

function Map({ barbers, filters }) {
  // تحديد موقع المستخدم (مثال)
  const userLocation = [31.9539, 35.9106] // موقع افتراضي في فلسطين

  // تصفية الحلاقين حسب الفلاتر
  const filteredBarbers = barbers.filter(barber => {
    if (filters.priceRange[0] > barber.price || filters.priceRange[1] < barber.price) return false
    if (filters.rating > 0 && barber.rating < filters.rating) return false
    return true
  })

  return (
    <div className="h-full w-full">
      <MapContainer
        center={userLocation}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {filteredBarbers.map(barber => (
          <Marker
            key={barber.id}
            position={[
              userLocation[0] + Math.random() * 0.01,
              userLocation[1] + Math.random() * 0.01
            ]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{barber.name}</h3>
                <p className="text-sm text-gray-600">{barber.salonName}</p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-500 ml-1" />
                  <span>{barber.rating}</span>
                </div>
                <p className="mt-1">{barber.price} شيكل</p>
                <Button className="w-full mt-2">حجز موعد</Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default Map
