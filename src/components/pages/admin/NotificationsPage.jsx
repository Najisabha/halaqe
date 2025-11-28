import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, Star, DollarSign, CheckCircle, XCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

function NotificationsPage({ setIsLoggedIn, setCurrentView }) {
  const { toast } = useToast();
  const token = localStorage.getItem("token");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
          const api = import.meta.env.VITE_API_URL;


  const observer = useRef();

  const lastNotificationRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadMoreNotifications();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading]
  );

  const getStatusIcon = (type) => {
    switch (type) {
      case "appointment": return <Calendar className="h-6 w-6 text-blue-600" />;
      case "review": return <Star className="h-6 w-6 text-yellow-600" />;
      case "payment": return <DollarSign className="h-6 w-6 text-green-600" />;
      default: return <Bell className="h-6 w-6 text-gray-600" />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    setCurrentView("login");
    toast({ title: "انتهت صلاحية الجلسة", description: "يرجى تسجيل الدخول مرة أخرى", variant: "destructive" });
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${api}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return handleLogout();
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      toast({ title: "خطأ في تحميل الإشعارات", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreNotifications = () => {
    // Optional: implement incremental fetching if API supports
    // Currently, we fetch all notifications at once
  };

  const markRead = async (id) => {
    try {
      await fetch(`${api}/api/admin/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${api}/api/admin/notifications/rear-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page content */}
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">الإشعارات</h2>
          <Button size="sm" variant="outline" onClick={markAllRead}>
            تعليم الكل كمقروء
          </Button>
        </div>

        {notifications.length === 0 && !loading ? (
          <p className="text-gray-500 text-center">لا توجد إشعارات حالياً</p>
        ) : (
          <div className="grid gap-4">
            {notifications.map((n, index) => (
              <motion.div
                key={n.id}
                ref={notifications.length === index + 1 ? lastNotificationRef : null}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`flex gap-4 p-4 rounded-lg shadow-sm cursor-pointer transition-colors ${
                  n.read ? "bg-white" : "bg-blue-50 border-l-4 border-blue-400"
                }`}
                onClick={() => !n.read && markRead(n.id)}
              >
                <div className="flex-shrink-0 p-2 rounded-full bg-gray-100">{getStatusIcon(n.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-800">{n.title}</h3>
                    <span className="text-sm text-gray-400">{n.time}</span>
                  </div>
                  <p className="text-gray-600">{n.message}</p>
                  {n.action && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => handleAction(n.id, "reject")}>
                        <XCircle className="h-4 w-4 ml-1" /> رفض
                      </Button>
                      <Button size="sm" onClick={() => handleAction(n.id, "confirm")}>
                        <CheckCircle className="h-4 w-4 ml-1" /> قبول
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {loading && <p className="text-gray-500 text-center">جاري التحميل...</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
