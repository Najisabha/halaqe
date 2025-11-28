import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useToast } from "./components/ui/use-toast"
import { 
  Search, Wallet, Send, Clock, Star, 
  Bell, Heart, User, Map, Scissors,
  Settings, LogOut, Menu, LayoutDashboard
} from "lucide-react"
import { Globe } from "lucide-react"
import { useTranslation } from 'react-i18next'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "./components/ui/dropdown-menu"

// User pages
import HomePage from "./components/pages/HomePage"
import WalletPage from "./components/pages/WalletPage"
import PointsPage from "./components/pages/PointsPage"
import WelcomePage from "./components/pages/WelcomePage"
import MapPage from "./components/pages/MapPage"
import NotificationsPage from "./components/pages/NotificationsPage"
import FavoritesPage from "./components/pages/FavoritesPage"
import SettingsPage from "./components/pages/SettingsPage"
import AppointmentsPage from "./components/pages/AppointmentsPage"
import FreeBarbers from "./components/pages/FreeBarbers"
import TransferPage from "./components/pages/TransferPage"
import BookingPage from "./components/pages/BookingPage"
import ReviewPage from "./components/pages/ReviewPage"

// Auth
import LoginForm from "./components/LoginForm"
import RegisterForm from "./components/RegisterForm"
import ForgotPasswordForm from "./components/ForgotPassword"

// Dashboards
import BarberDashboard from "./components/BarberDashboard"
import AdminDashboard from "./components/pages/admin/AdminDashboard"
import WithdrawalsPage from "./components/pages/admin/WithdrawalsPage"
import ApproveBarbersPage from "./components/pages/admin/ApproveBarbersPage"
import ApproveProvidersPage from "./components/pages/admin/ApproveProvidersPage"

// Providers
import NotificationsProviderPage from "./components/pages/provider/NotificationsPage"
import ProviderNavbar from "./components/ProviderNavbar"
import WalletProviderPage from "./components/pages/provider/WalletPage"
import TransferProviderPage from "./components/pages/provider/TransferPage"
import ProviderRequests from "./components/pages/provider/RequestsPage"
import SettingsProvidersPage from "./components/pages/provider/SettingPage"

import PromotionsAdminPage from "./components/pages/admin/CreatePromotionPage"
import AdminNavbar from "./components/AdminNavbar"
import TransactionsPage from "./components/pages/admin/TransactionsPage"
import NotificationsAdminPage from "./components/pages/admin/NotificationsPage"
import AdminSettings from "./components/pages/admin/AdminSetting"
function App() {
  const { toast } = useToast()
  const [currentView, setCurrentView] = useState("home")
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState("user") // user, barber, admin
  const [currentUser, setCurrentUser] = useState(null)

  // ✅ barber/salon selected for booking
  const [selectedBarber, setSelectedBarber] = useState(null)

  // ✅ Restore session
  useEffect(() => {

    const savedUser = localStorage.getItem("currentUser")
    const token = localStorage.getItem("token")

    if (savedUser && token) {
      const user = JSON.parse(savedUser)

      if (user.type === "BARBER" && !user.barberApproved) {
        toast({
          title: "Pending Approval",
          description: "Your account is not yet approved by admin.",
          variant: "destructive",
        })
        localStorage.removeItem("currentUser")
        localStorage.removeItem("token")
        return
      }

      setCurrentUser(user)
      setIsLoggedIn(true)
      setUserType(user.type.toLowerCase())
    }
    const fetchNavbarData = async () => {
      try {
        const token = localStorage.getItem("token"); // assuming you use JWT
        const api = import.meta.env.VITE_API_URL;

        const res = await fetch(`${api}/api/user/navbar`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch navbar data");
        const data = await res.json();
  
        setNotifications((prev) => ({
          ...prev,
          wallet: data.balance,
          notifications: data.notification,
          favorites: data.moneyreceived,
        }));
      } catch (err) {
        console.error("Navbar fetch error:", err);
      }
    };
  
    fetchNavbarData();
  }, [isLoggedIn])

  const [notifications, setNotifications] = useState({
    wallet: currentUser?.balance || 0,
    notifications: currentUser?.notifications || 0,
    favorites: currentUser?.favorites || 0,
  })

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    setCurrentView("home")
    setUserType("user")
    setCurrentUser(null)
    setSelectedBarber(null)
    toast({ title: "Logged out successfully" })
  }

  // -------------------------------
  // 🟢 User Navbar
  // -------------------------------
  const userNavItems = [
    { icon: Wallet, view: "wallet", notification: notifications.wallet },
    { icon: Send, view: "transfer", notification: notifications.transfer },
    { icon: Clock, view: "appointments", notification: notifications.appointments },
    { icon: Scissors, view: "free-barbers", notification: notifications.freeBarbers },
    { icon: Map, view: "map" },
    { icon: Bell, view: "notifications", notification: notifications.notifications },
    { icon: Heart, view: "favorites", notification: notifications.favorites }
  ]
// Add this inside your App component, alongside other handlers
const handleBookSalon = (salon) => {
  setSelectedBarber(salon); // or whatever logic you need
  setCurrentView("booking");
};

  const UserNavbar = () => {
    const { t, i18n } = useTranslation();
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  
    const languages = [
      { code: 'en', label: 'English' },
      { code: 'ar', label: 'العربية' },
    ];
  
    const changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
    localStorage.setItem("language", lng); // ✅ persist language

      setIsLanguageOpen(false);
      toast({
        title: t('language_changed'),
        description: t('language_changed_message', { language: languages.find(l => l.code === lng).label }),
      });
    };
  
    return (
      <nav className="fixed top-0 left-0 right-0 bg-primary text-primary-foreground shadow-sm z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => setCurrentView("home")} className="text-xl font-bold">{t('حلاقة')}</button>
            <button
              className="md:hidden p-2 hover:bg-primary-foreground/10 rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden md:flex items-center gap-4">
              {userNavItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => item.view ? setCurrentView(item.view) : item.onClick()}
                  className="p-2 hover:bg-primary-foreground/10 rounded-full relative"
                >
                  <item.icon className="h-5 w-5" />
                  {item.notification > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 min-w-[20px] text-center">
                      {item.notification}
                    </span>
                  )}
                </button>
              ))}
              <DropdownMenu open={isLanguageOpen} onOpenChange={setIsLanguageOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-primary-foreground/10 rounded-full">
                    <Globe className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {lang.label}
                      {i18n.language === lang.code && (
                        <span className="ml-auto text-primary-foreground">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-primary-foreground/10 rounded-full">
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setCurrentView("settings")} className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" /> {t('settings')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-500">
                    <LogOut className="h-4 w-4" /> {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden bg-primary text-primary-foreground">
              <div className="py-4 px-4 space-y-2">
                {userNavItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.view ? setCurrentView(item.view) : item.onClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-primary-foreground/10 rounded-lg"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{t(item.view)}</span>
                    {item.notification > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 min-w-[20px] text-center">
                        {item.notification}
                      </span>
                    )}
                  </button>
                ))}
                <div className="border-t border-primary-foreground/20 pt-2">
                  <div className="flex items-center gap-3 p-3">
                    <Globe className="h-5 w-5" />
                    <span>{t('language')}</span>
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full p-3 flex items-center gap-3 hover:bg-primary-foreground/10 rounded-lg"
                    >
                      {lang.label}
                      {i18n.language === lang.code && (
                        <span className="ml-auto text-primary-foreground">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  };

  // -------------------------------
  // 🔴 Admin Navbar
  // -------------------------------
 
  // -------------------------------
  // Content Renderer
  // -------------------------------
  const renderContent = () => {
    if (!isLoggedIn) {
      switch (currentView) {
        case "register":
          return <RegisterForm setCurrentView={setCurrentView} />
        case "forgot-password":
          return <ForgotPasswordForm setCurrentView={setCurrentView} />
        case "login":
          return (
            <LoginForm
              setIsLoggedIn={setIsLoggedIn}
              setCurrentView={setCurrentView}
              setCurrentUser={setCurrentUser}
              setUserType={setUserType}
            />
          )
        default:
          // 👇 Default to WelcomePage
          return <RegisterForm setCurrentView={setCurrentView} />
      }
    }

// In App.jsx
if (userType === "admin") {
  switch (currentView) {
    case "dashboard":
      return (
        <AdminDashboard
          currentUser={currentUser}
          currentView={currentView}
          setCurrentView={setCurrentView}
          setIsLoggedIn={setIsLoggedIn}
        />
      )
      case "adminsettings":
        return (
          <AdminSettings
            currentUser={currentUser}
            currentView={currentView}
            setCurrentView={setCurrentView}
            setIsLoggedIn={setIsLoggedIn}
          />
        )
    case "withdrawals":
      return (
        <WithdrawalsPage
          currentView={currentView}
          setCurrentView={setCurrentView}
          setIsLoggedIn={setIsLoggedIn}
        />
      )
      case "promtionsAdmin":
        return (
          <PromotionsAdminPage
            currentView={currentView}
            setCurrentView={setCurrentView}
            setIsLoggedIn={setIsLoggedIn}
          />
        )
      case "notificationsadmin":
        return (
          <NotificationsAdminPage
            currentView={currentView}
            setCurrentView={setCurrentView}
            setIsLoggedIn={setIsLoggedIn}
          />
        )
      case "transactions":
        return (
          <TransactionsPage
            currentView={currentView}
            setCurrentView={setCurrentView}
            setIsLoggedIn={setIsLoggedIn}
          />
        )
      case "barbers":
        return (
          <ApproveBarbersPage
            currentView={currentView}
            setCurrentView={setCurrentView}
            setIsLoggedIn={setIsLoggedIn}
          />
        )
        case "providers":
        return (
          <ApproveProvidersPage
            currentView={currentView}
            setCurrentView={setCurrentView}
            setIsLoggedIn={setIsLoggedIn}
          />
        )
    default:
      return (
        <AdminDashboard
          currentUser={currentUser}
          currentView={currentView}
          setCurrentView={setCurrentView}
          setIsLoggedIn={setIsLoggedIn}
        />
      )
  }
}
if (userType === "provider") {
  switch (currentView) {
    case "walletprovider": return <WalletProviderPage currentUser={currentUser} />
      case "transferprovider": return <TransferProviderPage currentUser={currentUser} />
      case "providersettings":
        return <SettingsProvidersPage currentUser={currentUser} onLogout={handleLogout} />
        
    case "usersRequest":
      return (
        <ProviderRequests
        currentUser={currentUser}
        currentView={currentView}
        setCurrentView={setCurrentView}
        setIsLoggedIn={setIsLoggedIn}
        />
      )
      case "promtionsAdmin":
        return (
          <PromotionsAdminPage
            currentView={currentView}
            setCurrentView={setCurrentView}
            setIsLoggedIn={setIsLoggedIn}
          />
        )
      case "notificationsprovider":
        
        return (
          <NotificationsProviderPage
            currentView={currentView}
            setCurrentView={setCurrentView}
            setIsLoggedIn={setIsLoggedIn}
          />
        )
      default:
        case "usersRequest":
          return (
            <ProviderRequests
            currentUser={currentUser}
            currentView={currentView}
            setCurrentView={setCurrentView}
            setIsLoggedIn={setIsLoggedIn}
            />
          )
  }
}

    if (userType === "barber") return <BarberDashboard currentUser={currentUser} />

    switch (currentView) {
      case "home":
        return <HomePage currentUser={currentUser}   onBookSalon={handleBookSalon}        onBookBarber={(barber) => { setSelectedBarber(barber); setCurrentView("booking") }} />
      case "wallet": return <WalletPage currentUser={currentUser} />
      case "transfer": return <TransferPage currentUser={currentUser} />
      case "appointments": return <AppointmentsPage />
      case "points": return <PointsPage currentUser={currentUser} />
      case "map":
        return <MapPage onBookBarber={(barber) => { setSelectedBarber(barber); setCurrentView("booking") }} />
      case "notifications": return <NotificationsPage />
      case "favorites":
        return <FavoritesPage onBookBarber={(barber) => { setSelectedBarber(barber); setCurrentView("booking") }} />
      case "reviews":
        return <ReviewPage barberId={selectedBarber?.ownerId || currentUser?.id} salonId={selectedBarber?.salonId} />
      case "settings": return <SettingsPage currentUser={currentUser} onLogout={handleLogout} />
      case "free-barbers":
        return <FreeBarbers onBookBarber={(barber) => { setSelectedBarber(barber); setCurrentView("booking") }} />
      case "booking":
        return <BookingPage currentUser={currentUser} barber={selectedBarber} setCurrentView={setCurrentView} />
      default:
        return <HomePage currentUser={currentUser}   onBookSalon={handleBookSalon} onBookBarber={(barber) => { setSelectedBarber(barber); setCurrentView("booking") }} />
    }
  }

  return (
<div className="min-h-screen bg-gray-50">
{isLoggedIn && (
  userType === "admin" ? (
    <AdminNavbar
      currentView={currentView}
      setCurrentView={setCurrentView}
      setIsLoggedIn={setIsLoggedIn}
    />
  ) : userType === "provider" ? (
    <ProviderNavbar
      currentView={currentView}
      setCurrentView={setCurrentView}
      setIsLoggedIn={setIsLoggedIn}
    />
  ) : userType === "user" ? (
    <UserNavbar
      currentView={currentView}
      setCurrentView={setCurrentView}
      setIsLoggedIn={setIsLoggedIn}
    />
  ) : null
)}

  <main className={isLoggedIn ? "pt-16" : ""}>
    {renderContent()}
  </main>
</div>

  )
}

export default App
