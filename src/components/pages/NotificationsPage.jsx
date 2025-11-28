import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, Star, Info, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

// 🔹 Updated handleUnauthorized
const handleUnauthorized = (setIsLoggedIn, setCurrentView, toast, t) => {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
  setIsLoggedIn(false);
  setCurrentView("login");
  toast({
    title: t("session_expired"),
    description: t("please_login_again"),
    variant: "destructive",
  });
};

// 🔹 Updated API Helper
const api = async (url, method = "GET", body, toast, setIsLoggedIn, setCurrentView, t) => {
  try {const api = import.meta.env.VITE_API_URL;

    const res = await fetch(`${api}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      handleUnauthorized(setIsLoggedIn, setCurrentView, toast, t);
      return null;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || t("api_error"));
    }
    return res.json();
  } catch (error) {
    throw error;
  }
};

function NotificationsPage({ setIsLoggedIn, setCurrentView }) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState("all");

  const iconMap = {
    appointment: { icon: Calendar, color: "blue" },
    rating: { icon: Star, color: "yellow" },
    info: { icon: Info, color: "gray" },
    default: { icon: Bell, color: "gray" },
  };

  // 🔹 Persist language preference
  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang) i18n.changeLanguage(savedLang);
  }, [i18n]);

  // 🔹 Fetch notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api("/api/user/notifications", "GET", null, toast, setIsLoggedIn, setCurrentView, t);
      if (data) {
        setNotifications(data || []);
        setFilteredNotifications(data || []);
      }
    } catch {
      toast({
        title: t("error"),
        description: t("failed_to_load_notifications"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [t, toast, setIsLoggedIn, setCurrentView]);

  // 🔹 Filter notifications by search query, type, and read status
  useEffect(() => {
    let filtered = notifications.filter(
      (n) =>
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (typeFilter !== "all") {
      filtered = filtered.filter((n) => n.type === typeFilter);
    }

    if (readFilter !== "all") {
      filtered = filtered.filter((n) => n.read === (readFilter === "read"));
    }

    setFilteredNotifications(filtered);
  }, [searchQuery, typeFilter, readFilter, notifications]);

  // 🔹 Mark as read
  const markAsRead = async (id) => {
    try {
      await api(`/api/user/notifications/${id}/read`, "PUT", null, toast, setIsLoggedIn, setCurrentView, t);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setFilteredNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      toast({ title: t("success"), description: t("notification_marked_read") });
    } catch {
      toast({
        title: t("error"),
        description: t("failed_to_mark_read"),
        variant: "destructive",
      });
    }
  };

  // 🔹 Mark all as read
  const markAllAsRead = async () => {
    try {
      await api("/api/user/notifications/read-all", "PUT", null, toast, setIsLoggedIn, setCurrentView, t);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setFilteredNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast({ title: t("success"), description: t("all_notifications_marked_read") });
    } catch {
      toast({
        title: t("error"),
        description: t("failed_to_mark_all_read"),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]" dir={i18n.dir()}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="me-2"
        >
          <Bell className="h-6 w-6 text-primary" />
        </motion.div>
        <p className="text-lg font-medium">{t("loading_notifications")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={i18n.dir()}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{t("notifications")}</h2>
          {notifications.some((n) => !n.read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="border-gray-300 hover:bg-gray-50"
              aria-label={t("mark_all_read")}
            >
              <Check className="h-4 w-4 me-2" />
              {t("mark_all_read")}
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 ring-1 ring-gray-200">
          {filteredNotifications.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-center text-lg"
            >
              {t("no_notifications_found")}
            </motion.p>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const { icon: Icon, color } = iconMap[notification.type] || iconMap.default;

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-4 p-4 rounded-lg ${
                      notification.read ? "bg-gray-50" : "bg-blue-50"
                    } border ${notification.read ? "border-gray-200" : "border-blue-200"}`}
                  >
                    <div className={`bg-${color}-100 p-2 rounded-full`}>
                      <Icon className={`h-6 w-6 text-${color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{notification.title || t("unknown_notification")}</h3>
                        <span className="text-sm text-gray-500">
                          {new Date(notification.createdAt).toLocaleString(i18n.language, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{notification.message || t("no_message")}</p>
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 text-blue-600 hover:text-blue-800"
                          onClick={() => markAsRead(notification.id)}
                          aria-label={t("mark_as_read", { title: notification.title || t("unknown_notification") })}
                        >
                          {t("mark_as_read")}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default NotificationsPage;