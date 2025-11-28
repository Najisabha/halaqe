
import React, { useState } from "react"
import { motion } from "framer-motion"
import { useToast } from "./ui/use-toast"
import { Button } from "./ui/button"
import { Calendar, Clock, Star, Upload } from "lucide-react"
import BarberNavbar from "./BarberNavbar"

// استيراد الصفحات
import AppointmentsPage from "./pages/barber/AppointmentsPage"
import WorkingHoursPage from "./pages/barber/WorkingHoursPage"
import ReviewsPage from "./pages/barber/ReviewsPage"
import WalletPage from "./pages/barber/WalletPage"
import WithdrawPage from "./pages/barber/WithdrawPage"
import NotificationsPage from "./pages/barber/NotificationsPage"
import StatisticsPage from "./pages/barber/StatisticsPage"
import SettingsPage from "./pages/SettingsPage"
import SalonBarbersPage from "./pages/barber/SalonBarbersPage"
import PromotionsPage from "./pages/barber/CreatePromotionPage"

function BarberDashboard({ currentUser, onLogout }) {
  const { toast } = useToast()
  const [currentView, setCurrentView] = useState('dashboard')

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
      toast({
        title: "تم تسجيل الخروج بنجاح"
      })
    }
  }

  const renderContent = () => {
    switch (currentView) {
      case 'appointments':
        return <AppointmentsPage />
      case 'working-hours':
        return <WorkingHoursPage />
      case 'reviews':
        return <ReviewsPage />
      case 'wallet':
        return <WalletPage />
      case 'withdraw':
        return <WithdrawPage />
      case 'notifications':
        return <NotificationsPage />
      case 'settings':
        return <SettingsPage currentUser={currentUser} onLogout={handleLogout} />
      case 'salon-barbers':
        return <SalonBarbersPage currentUser={currentUser} />
      case 'promtions':
        return <PromotionsPage currentUser={currentUser}  />
      case 'statistics':
      default:
        return <StatisticsPage />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BarberNavbar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  )
}

export default BarberDashboard
