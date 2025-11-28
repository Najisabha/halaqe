import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Star, CheckCircle, XCircle, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale"; // Import English locale
import { useTranslation } from "react-i18next"; // Import useTranslation

// Helper to handle unauthorized API responses
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

// Updated API helper
const api = async (url, method = "GET", body, toast, setIsLoggedIn, setCurrentView, t) => {
  try {
    const api = import.meta.env.VITE_API_URL;

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
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  } catch (error) {
    return null;
  }
};

function AppointmentsPage({ setIsLoggedIn, setCurrentView }) {
  const { t, i18n } = useTranslation(); // Use translation hook
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [freeAppointments, setFreeAppointments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Review modal state
  const [reviewingAppointment, setReviewingAppointment] = useState(null);
  const [reviewTarget, setReviewTarget] = useState("barber"); // barber | salon
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // 🔹 Barber selection for reviews
  const [salonBarbers, setSalonBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);

  // 🔹 Fetch appointments + free appointments + favorites
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await api("/api/user/appointments", "GET", null, toast, setIsLoggedIn, setCurrentView, t);
      if (data) setAppointments(data);

      const free = await api(
        "/api/user/free-appointments/available/booked",
        "GET",
        null,
        toast,
        setIsLoggedIn,
        setCurrentView,
        t
      );
      if (free) setFreeAppointments(free);

      const favs = await api("/api/user/favorites", "GET", null, toast, setIsLoggedIn, setCurrentView, t);
      if (favs) setFavorites(favs);
    } catch {
      toast({ title: t("error"), description: t("failed_to_load_data"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (barberId) => {
    try {
      const success = await api(
        `/api/user/favorites/${barberId}`,
        "POST",
        null,
        toast,
        setIsLoggedIn,
        setCurrentView,
        t
      );
      if (success) {
        setFavorites((prev) =>
          prev.includes(barberId) ? prev.filter((id) => id !== barberId) : [...prev, barberId]
        );
        toast({
          title: t("success"),
          description: t("favorite_updated"),
        });
      }
    } catch {
      toast({
        title: t("error"),
        description: t("failed_to_update_favorite"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // 🔹 Open review modal
  const openReview = async (appointment, isFree = false) => {
    setReviewingAppointment({ ...appointment, isFree });
    setReviewTarget("barber");
    setRating(0);
    setComment("");
    setSalonBarbers([]);
    setSelectedBarber(null);

    // Only for normal appointments → fetch barbers of salon
    if (!isFree && appointment.barberId) {
      try {
        const barbers = await api(
          `/api/user/barbers-of-salon/${appointment.barberId}`,
          "GET",
          null,
          toast,
          setIsLoggedIn,
          setCurrentView,
          t
        );
        if (barbers) {
          setSalonBarbers(barbers);
          if (barbers.length > 0) setSelectedBarber(barbers[0]);
        }
      } catch {
        toast({
          title: t("error"),
          description: t("failed_to_load_salon_barbers"),
          variant: "destructive",
        });
      }
    }
  };

  // 🔹 Submit review
  const submitReview = async () => {
    if (!reviewingAppointment) return;
    try {
      const { isFree } = reviewingAppointment;
      const appointmentId = reviewingAppointment.id;
      if (reviewTarget === "barber") {
        const barberId = isFree
          ? reviewingAppointment.slot.appointment.barberId
          : selectedBarber?.id || reviewingAppointment.barberId;

        const barberUrl = `/api/user/barbers/${barberId}/reviews-free-appointment/${appointmentId}`;
        await api(barberUrl, "POST", { barberId, rating, comment }, toast, setIsLoggedIn, setCurrentView, t);
      }

      if (!isFree && reviewTarget === "salon" && reviewingAppointment.barber.salon?.id) {
        await api(
          `/api/user/barbers/reviews`,
          "POST",
          { barberId: reviewingAppointment.barberId, rating, comment },
          toast,
          setIsLoggedIn,
          setCurrentView,
          t
        );
      }

      toast({ title: t("success"), description: t("تم إضافة التقييم") });
      setReviewingAppointment(null);
      setRating(0);
      setComment("");
      loadAppointments();
    } catch (err) {
      console.log(err);
      toast({ title: t("error"), description: t("فشل إرسال التقييم"), variant: "destructive" });
    }
  };

  // 🔹 Status helpers
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
      case "pending_payment":
        return "text-yellow-500";
      case "confirmed":
        return "text-blue-500";
      case "completed":
        return "text-green-500";
      case "cancelled":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
      case "pending_payment":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "confirmed":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
      case "pending_payment":
        return t("pending");
      case "confirmed":
        return t("confirmed");
      case "completed":
        return t("completed");
      case "cancelled":
        return t("cancelled");
      default:
        return "";
    }
  };

  // 🔹 Filter appointments
  const filteredAppointments = activeTab === "free"
    ? freeAppointments
    : appointments.filter((a) => {
        if (activeTab === "upcoming") return a.status === "pending" || a.status === "confirmed";
        if (activeTab === "past") return a.status === "completed";
        if (activeTab === "cancelled") return a.status === "cancelled";
        return true;
      });

  // 🔹 Dynamic locale for date-fns based on language
  const locale = i18n.language === "ar" ? ar : enUS;

  return (
    <div className="container mx-auto px-4 py-8" dir={i18n.dir()}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">{t("appointments")}</h2>

        {/* Language Switcher */}
       

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === "upcoming" ? "default" : "outline"}
            onClick={() => setActiveTab("upcoming")}
          >
            {t("upcoming_appointments")}
          </Button>
          <Button
            variant={activeTab === "past" ? "default" : "outline"}
            onClick={() => setActiveTab("past")}
          >
            {t("past_appointments")}
          </Button>
          <Button
            variant={activeTab === "cancelled" ? "default" : "outline"}
            onClick={() => setActiveTab("cancelled")}
          >
            {t("cancelled_appointments")}
          </Button>
          <Button
            variant={activeTab === "free" ? "default" : "outline"}
            onClick={() => setActiveTab("free")}
          >
            {t("free_appointments")}
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-center text-gray-500">{t("loading")}</p>
        ) : filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg shadow-inner">
            <User className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">{t("no_appointments_in_section")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAppointments.map((appointment) =>
              activeTab === "free" ? (
                <motion.div key={appointment.id} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-bold mb-2">
                    {appointment.slot.appointment.barber.firstname}{" "}
                    {appointment.slot.appointment.barber.lastname}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-5 w-5 ml-2 text-blue-500" />
                      <span>
                        {format(new Date(appointment.slot.appointment.date), "EEEE, dd MMMM yyyy", {
                          locale,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-5 w-5 ml-2 text-green-500" />
                      <span>
                        {format(new Date(appointment.slot.time), "hh:mm a", { locale })}
                      </span>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => openReview(appointment, true)}>
                    {t("review_barber")}
                  </Button>
                </motion.div>
              ) : (
                <motion.div key={appointment.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">
                      {appointment.barber?.firstname} {appointment.barber?.lastname}
                    </h3>
                    <div className="flex items-center">
                      {getStatusIcon(appointment.status)}
                      <span className={`mr-2 ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 ml-2" />
                      <span>
                        {format(new Date(appointment.date), "EEEE, dd MMMM yyyy", { locale })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 ml-2" />
                      <span>{format(new Date(`1970-01-01T${appointment.time}:00`), "HH:mm", { locale })}</span>
                    </div>
                  </div>
                  {appointment.status === "completed" && (
                    <Button className="w-full" onClick={() => openReview(appointment, false)}>
                      {t("review")}
                    </Button>
                  )}
                </motion.div>
              )
            )}
          </div>
        )}

        {/* ⭐ Review Modal */}
        {reviewingAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            dir={i18n.dir()}
          >
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              {/* Switch target */}
              {!reviewingAppointment.isFree && (
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={reviewTarget === "barber" ? "default" : "outline"}
                    onClick={() => setReviewTarget("barber")}
                  >
                    {t("review_barber")}
                  </Button>
                  <Button
                    variant={reviewTarget === "salon" ? "default" : "outline"}
                    onClick={() => setReviewTarget("salon")}
                  >
                    {t("review_salon")}
                  </Button>
                </div>
              )}

              {/* Select barber if normal appointment */}
              {!reviewingAppointment.isFree && reviewTarget === "barber" && salonBarbers.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">{t("select_barber")}</label>
                  <select
                    value={selectedBarber?.id || ""}
                    onChange={(e) => {
                      const b = salonBarbers.find((b) => b.id === e.target.value);
                      setSelectedBarber(b);
                    }}
                    className="w-full border rounded p-2"
                  >
                    {salonBarbers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.firstname} {b.lastname}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Review form */}
              <h3 className="text-lg font-semibold mb-2">
                {reviewTarget === "barber"
                  ? t("review_barber")
                  : t("review_salon_name", { name: reviewingAppointment.barber.salon?.name })}
              </h3>
              <div className="flex gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 cursor-pointer ${i <= rating ? "text-yellow-500" : "text-gray-300"}`}
                    onClick={() => setRating(i)}
                  />
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("write_review_placeholder", {
                  target: reviewTarget === "barber" ? t("barber") : t("salon"),
                })}
                className="w-full border rounded p-2 mb-4"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setReviewingAppointment(null)}>
                  {t("cancel")}
                </Button>
                <Button onClick={submitReview} disabled={rating === 0}>
                  {t("submit")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default AppointmentsPage;