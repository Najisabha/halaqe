import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  Calendar, Clock, Star, Wallet, 
  Bell, Settings, LogOut, Menu,
  BarChart, DollarSign, User, Scissors,TicketIcon
} from "lucide-react"  // ✅ أضفنا Scissors كأيقونة الحلاقين
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

function BarberNavbar({ currentView, setCurrentView, setIsLoggedIn }) {
  const { toast } = useToast()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { icon: Calendar, view: "appointments", label: "جدول الحجوزات" },
    { icon: Clock, view: "working-hours", label: "مواعيد العمل" },
    { icon: Star, view: "reviews", label: "التقييمات" },
    { icon: Wallet, view: "wallet", label: "المحفظة" },
    { icon: DollarSign, view: "withdraw", label: "سحب الأموال" },
    { icon: Bell, view: "notifications", label: "الإشعارات" },
    { icon: BarChart, view: "statistics", label: "الإحصائيات" },
    { icon: Scissors, view: "salon-barbers", label: "إدارة الحلاقين" }, // ✅ جديد
    { icon: TicketIcon, view: "promtions", label: "المحفظة" },

  ]

  const handleViewChange = (view) => {
    setCurrentView(view)
    setMobileMenuOpen(false)
  }

  const handleLogout = () => {
    // Clear JWT + user data
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
    setIsLoggedIn(false)
    setCurrentView("login")

    toast({
      title: "تم تسجيل الخروج بنجاح",
      description: "يرجى تسجيل الدخول للمتابعة",
    })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-primary text-primary-foreground shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => handleViewChange("dashboard")}
            className="text-xl font-bold"
          >
            لوحة التحكم
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-primary-foreground/10 rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item, index) => (
              
              <button
                key={index}

                onClick={() => handleViewChange(item.view)}
                className={`p-2 hover:bg-primary-foreground/10 rounded-full transition-colors relative ${
                  currentView === item.view ? "bg-primary-foreground/20" : ""
                }`}
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
              </button>
            ))}

            {/* User Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-primary-foreground/10 rounded-full transition-colors">
                  <User className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => handleViewChange("settings")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  الإعدادات
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-primary-foreground/10"
          >
            <div className="grid grid-cols-4 gap-4">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleViewChange(item.view)}
                  className={`flex flex-col items-center gap-1 p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors ${
                    currentView === item.view ? "bg-primary-foreground/20" : ""
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-around mt-4">
              <Button
                variant="ghost"
                onClick={() => handleViewChange("settings")}
                className="flex items-center gap-2"
              >
                <Settings className="h-5 w-5" />
                الإعدادات
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500"
              >
                <LogOut className="h-5 w-5" />
                تسجيل الخروج
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default BarberNavbar
