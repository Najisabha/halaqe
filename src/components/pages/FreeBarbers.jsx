import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

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

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || t("api_error"));
    }
    return res.json();
  } catch (error) {
    throw error;
  }
};

// 🔹 Helper to calculate average rating
const calcAverageRating = (reviews = []) => {
  if (!reviews.length) return null;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return (sum / reviews.length).toFixed(1); // Example: 4.3
};

function FreeBarbers({ setIsLoggedIn, setCurrentView }) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [freeBarbers, setFreeBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [bookingSlotId, setBookingSlotId] = useState(null); // New state for booking

  // 🔹 Dynamic locale for date-fns
  const locale = i18n.language === "ar" ? ar : enUS;

  // 🔹 Persist language preference
  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang) i18n.changeLanguage(savedLang);
  }, [i18n]);

  // 🔹 Load free barbers
  const loadFreeBarbers = async () => {
    try {
      setLoading(true);
      const data = await api("/api/user/free-appointments/available/all", "GET", null, toast, setIsLoggedIn, setCurrentView, t);
      if (data) setFreeBarbers(data);
    } catch {
      toast({
        title: t("error"),
        description: t("failed_to_load_barbers"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFreeBarbers();
  }, [t, toast, setIsLoggedIn, setCurrentView]);

  // 🔹 Book a free appointment
  const handleBook = async (slotId) => {
    if (bookingSlotId) return; // Prevent multiple clicks
    try {
      setBookingSlotId(slotId);
      await api(
        "/api/user/free-appointments/book",
        "POST",
        { slotId, userId: localStorage.getItem("userId") },
        toast,
        setIsLoggedIn,
        setCurrentView,
        t
      );
      toast({ title: t("booking_success"), description: t("appointment_booked_successfully") });
      loadFreeBarbers();
    } catch {
      toast({
        title: t("error"),
        description: t("failed_to_book_appointment"),
        variant: "destructive",
      });
    } finally {
      setBookingSlotId(null);
    }
  };

  // 🔹 Format slot time with error handling
  const formatSlotTime = (time) => {
    try {
      return format(new Date(time), "PPp", { locale });
    } catch {
      return t("invalid_date");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8"dir={i18n.dir()}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">


        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{t("free_barbers")}</h2>
        </div>

        {loading ? (
          <p className="text-gray-500">{t("loading")}</p>
        ) : freeBarbers.length === 0 ? (
          <p className="text-gray-500">{t("no_free_appointments_available")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeBarbers.map((item) => {
              const barber = item.barber || {};
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                  aria-label={t("barber_card", {
                    name: `${barber.firstname || t("unknown_barber")} ${barber.lastname || ""}`,
                  })}
                >
                  <div className="relative">
                    <img
                      src={barber.salon?.imageUrl || "https://via.placeholder.com/400x300"}
                      alt={barber.firstname || t("barber")}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 end-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      {t("free")}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">
                        {barber.firstname || t("unknown_barber")} {barber.lastname || ""}
                      </h3>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 me-1" />
                        <span>{calcAverageRating(item.barber?.ratebarbers) || t("no_rating")}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 me-2" />
                        <span>
                          {barber.salon?.owner?.city || t("unknown_city")}{" "}
                          {barber.salon?.owner?.area ? `- ${barber.salon.owner.area}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 me-2" />
                        <span>
                          {item.experienceYears || t("no_experience")} {item.experienceType || ""}
                        </span>
                      </div>
                    </div>

                    {item.services?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">{t("available_services")}</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.services.map((s) => (
                            <span
                              key={s.id}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                            >
                              {s.name || t("unknown_service")}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">{t("available_slots")}</h4>
                      {item.slots?.filter((s) => !s.isBooked).length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {item.slots
                            .filter((s) => !s.isBooked)
                            .slice(0, 4)
                            .map((slot) => (
                              <Button
                                key={slot.id}
                                variant="outline"
                                size="sm"
                                onClick={() => handleBook(slot.id)}
                                className="flex items-center justify-center gap-1"
                                aria-label={t("book_slot", {
                                  time: formatSlotTime(slot.time),
                                })}
                                disabled={bookingSlotId === slot.id}
                              >
                                <Calendar className="h-4 w-4" />
                                {bookingSlotId === slot.id ? t("booking_in_progress") : formatSlotTime(slot.time)}
                              </Button>
                            ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">{t("no_slots_available")}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => setSelectedBarber(item)}
                        aria-label={t("view_profile", {
                          name: `${barber.firstname || t("unknown_barber")} ${barber.lastname || ""}`,
                        })}
                      >
                        {t("view_profile")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {selectedBarber && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"dir={i18n.dir()}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative"
            >
              <button
                className="absolute top-4 end-4 text-gray-500 hover:text-gray-800"
                onClick={() => setSelectedBarber(null)}
                aria-label={t("close")}
              >
                <X className="h-6 w-6" />
              </button>

              <h3 className="text-2xl font-bold mb-4">
                {selectedBarber.barber.firstname || t("unknown_barber")} {selectedBarber.barber.lastname || ""}
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedBarber.barber.salon?.name || t("unknown_salon")} –{" "}
                {selectedBarber.barber.salon?.location || t("unknown_location")}
              </p>

              <div>
                <h4 className="font-semibold mb-2">{t("ratings_and_reviews")}</h4>
                {selectedBarber.barber.ratebarbers?.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedBarber.barber.ratebarbers.map((r, i) => (
                      <div key={i} className="border p-3 rounded-lg flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{r.rating}/5</span>
                        </div>
                        <p className="text-gray-700">{r.comment || t("no_comment")}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">{t("no_reviews_yet")}</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default FreeBarbers;