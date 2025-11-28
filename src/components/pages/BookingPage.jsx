import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Star, MapPin, ArrowRight, ArrowLeft, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale"; // Import English locale
import { useTranslation } from "react-i18next"; // Import useTranslation

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
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      setIsLoggedIn(false);
      setCurrentView("login");
      toast({
        title: t("session_expired"),
        description: t("please_login_again"),
        variant: "destructive",
      });
      return null;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || t("api_error"));
    }
    return res.json().catch(() => ({}));
  } catch (error) {
    throw error;
  }
};

// 🔹 Generate Available Time Slots
const generateTimeSlots = (date, serviceDuration, barber, t) => {
  if (!barber?.workingHours || !date || isNaN(date.getTime())) return [];

  const daysMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const todayName = daysMap[date.getDay()];
  const workingDay = barber.workingHours.find((w) => w.day.toLowerCase() === todayName.toLowerCase());

  if (!workingDay || !workingDay.isOpen) return "closed";

  const [startHour, startMin] = workingDay.from.split(":").map(Number);
  const [endHour, endMin] = workingDay.to.split(":").map(Number);

  let slots = [];
  let start = new Date(date);
  start.setHours(startHour, startMin, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, endMin, 0, 0);

  while (start.getTime() + serviceDuration * 60000 <= end.getTime()) {
    const slot = start.toTimeString().slice(0, 5);

    const inBreak = barber.breaks?.some((br) => {
      const appliesToday = !br.days?.length || br.days.map((d) => d.toLowerCase()).includes(todayName);
      if (!appliesToday) return false;

      const [bf, bm] = br.from.split(":").map(Number);
      const [bt, btM] = br.to.split(":").map(Number);

      const breakStart = new Date(date);
      breakStart.setHours(bf, bm, 0, 0);
      const breakEnd = new Date(date);
      breakEnd.setHours(bt, btM, 0, 0);

      return start >= breakStart && start < breakEnd;
    });

    if (!inBreak) slots.push(slot);
    start = new Date(start.getTime() + serviceDuration * 60000);
  }

  return slots;
};

// 🔹 Step Indicator Component
function StepIndicator({ step, setStep, t }) {
  const steps = [
    { id: 1, label: t("service") },
    { id: 2, label: t("date") },
    { id: 3, label: t("time") },
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((s) => (
        <button
          key={s.id}
          onClick={() => setStep(s.id)}
          aria-current={step === s.id ? "step" : undefined}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            step === s.id ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// 🔹 Legend Component
function Legend({ t }) {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-700">
      <LegendItem colorClass="border-2 border-gray-200" label={t("available")} />
      <LegendItem colorClass="border-2 border-primary bg-primary/5" label={t("selected")} />
      <LegendItem colorClass="border-2 border-yellow-500 bg-yellow-50" label={t("pending_payment")} />
      <LegendItem colorClass="border-2 border-red-500 bg-red-50" label={t("booked")} />
    </div>
  );
}

function LegendItem({ colorClass, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-5 h-5 rounded ${colorClass}`}></span>
      {label}
    </div>
  );
}

// 🔹 Main Component
function BookingPage({ barber, setCurrentView, setIsLoggedIn }) {
  const { t, i18n } = useTranslation(); // Use translation hook
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [truebarber, setTrueBarber] = useState({});
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  // 🔹 Promotions
  const [couponCode, setCouponCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // 🔹 Dynamic locale for date-fns
  const locale = i18n.language === "ar" ? ar : enUS;

  // 🔹 Fetch Services
  useEffect(() => {
    const loadServices = async () => {
      if (!barber?.ownerId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await api(
          `/api/user/barbers/${barber.ownerId}/services`,
          "GET",
          null,
          toast,
          setIsLoggedIn,
          setCurrentView,
          t
        );
        // Handle various shapes: array or { services: [...] }
        const svcArray = Array.isArray(data) ? data : data?.services || [];
        setServices(svcArray);
        setTrueBarber(svcArray[0]?.barber || barber || {});
      } catch (e) {
        console.error(e);
        toast({ title: t("error"), description: t("failed_to_load_services"), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, [barber, toast, setIsLoggedIn, setCurrentView, t]);

  // 🔹 Available Dates
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  }, []);

  // 🔹 Time Slots
  const timeSlots = useMemo(() => {
    if (!selectedDate || !selectedService) return [];
    return generateTimeSlots(new Date(selectedDate), selectedService.duration, selectedService.barber, t);
  }, [selectedDate, selectedService, t]);

  // 🔹 Slot Status
  const getSlotStatus = (time) => {
    const appointments = selectedService?.barber?.appointmentsAsBarber || [];
    const appointment = appointments.find(
      (a) => new Date(a.date).toISOString().split("T")[0] === selectedDate && a.time === time
    );
    if (!appointment) return "free";
    return appointment.status; // confirmed, pending_payment
  };

  // 🔹 Apply Promotion
  const applyCoupon = async () => {
    if (!couponCode?.trim()) {
      toast({ title: t("enter_coupon"), description: t("please_enter_coupon_code"), variant: "destructive" });
      return;
    }

    try {
      setCouponLoading(true);
      const res = await api(
        `/api/user/promotions/validate`,
        "POST",
        { serviceId: selectedService.id, promotionCode: couponCode.trim() },
        toast,
        setIsLoggedIn,
        setCurrentView,
        t
      );
      const valid = res?.valid || !!res?.promotion || !!res?.discountType;
      if (valid) {
        const promotion = res.promotion || {
          code: couponCode.trim(),
          discountType: res.discountType || "FIXED",
          discountValue: res.discountValue || res.amount || 0,
        };
        setAppliedPromotion(promotion);
        toast({
          title: t("coupon_applied"),
          description:
            promotion.discountType === "PERCENT"
              ? t("discount_percent", { value: promotion.discountValue })
              : t("discount_fixed", { value: promotion.discountValue, currency: t("shekel") }),
        });
      } else {
        setAppliedPromotion(null);
        toast({ title: t("invalid_coupon"), description: t("coupon_invalid_or_expired"), variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      setAppliedPromotion(null);
      toast({ title: t("error"), description: t("failed_to_verify_coupon"), variant: "destructive" });
    } finally {
      setCouponLoading(false);
    }
  };

  // Allow clearing coupon
  const removeCoupon = () => {
    setAppliedPromotion(null);
    setCouponCode("");
    toast({ title: t("coupon_removed"), description: t("coupon_removed_description") });
  };

  // 🔹 Calculate Price
  const finalPrice = useMemo(() => {
    if (!selectedService) return 0;
    let price = Number(selectedService.price || 0);
    if (appliedPromotion) {
      if (appliedPromotion.discountType === "PERCENT") {
        price = price - (price * Number(appliedPromotion.discountValue || 0)) / 100;
      } else if (appliedPromotion.discountType === "FIXED") {
        price = price - Number(appliedPromotion.discountValue || 0);
      }
      if (price < 0) price = 0;
    }
    return Math.round(price);
  }, [selectedService, appliedPromotion]);

  // 🔹 Handle Booking
  const handleBooking = async () => {
    if (isProcessing) return;
    if (!selectedService || !selectedDate || !selectedTime) {
      toast({ title: t("error"), description: t("please_select_all_details"), variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        barberId: selectedService.barberId || selectedService.barber?.id,
        serviceId: selectedService.id,
        date: selectedDate,
        time: selectedTime,
        paymentMethod,
        promotionCode: appliedPromotion?.code || null,
      };

      const res = await api("/api/user/appointments", "POST", payload, toast, setIsLoggedIn, setCurrentView, t);

      if (paymentMethod === "online" && res.sessionUrl) {
        window.location.href = res.sessionUrl;
        return;
      }

      if (paymentMethod === "wallet") {
        if (res.payment?.status === "succeeded") {
          toast({ title: t("booking_success"), description: t("paid_from_wallet") });
          setCurrentView("home");
        } else {
          toast({ title: t("payment_failed"), description: t("insufficient_balance"), variant: "destructive" });
        }
        return;
      }

      toast({ title: t("booking_success"), description: t("awaiting_barber_confirmation") });
      setCurrentView("home");
    } catch (err) {
      console.error(err);
      toast({ title: t("error"), description: err.message || t("booking_failed"), variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" dir={i18n.dir()}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        {/* 🔹 Language Switcher */}
       

        {/* 🔹 Header */}
        <h2 className="text-2xl font-bold mb-8 text-center">{t("book_appointment")}</h2>

        {/* 🔹 Barber Info */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="md:flex items-center gap-6">
            <img
              src={barber?.imageUrl || "https://placehold.co/200x200?text=Barber"}
              alt={t("barber")}
              className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
            />
            <div className="text-center md:text-start">
              <h3 className="text-xl font-bold mb-2">{barber?.name}</h3>
              <div className="flex justify-center md:justify-start gap-4 text-gray-600 mb-2">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 ml-1" />
                  4.8
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 ml-1" />
                  {truebarber?.area} - {truebarber?.city}
                </div>
              </div>
              <p className="text-gray-600">{truebarber?.address || t("no_address")}</p>
            </div>
          </div>
        </div>

        {/* 🔹 Steps */}
        <div className="bg-white rounded-2xl shadow p-6">
          <StepIndicator step={step} setStep={setStep} t={t} />

          {/* Step 1: Services */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-xl font-semibold mb-4">{t("select_service")}</h3>
              {loading ? (
                <p className="text-gray-500">{t("loading")}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.length === 0 ? (
                    <p className="text-gray-500">{t("no_services_available")}</p>
                  ) : (
                    services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setSelectedService(service);
                          setStep(2);
                          setSelectedTime("");
                          setSelectedDate("");
                        }}
                        aria-pressed={selectedService?.id === service.id}
                        className={`text-left p-4 rounded-lg border-2 transition focus:outline-none ${
                          selectedService?.id === service.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{service.name}</span>
                          <span className="text-primary">
                            {service.price} {t("shekel")}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Clock className="h-4 w-4 ml-1" />
                          {service.duration} {t("minutes")}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Date */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowRight className="h-4 w-4 ml-2" /> {t("previous")}
                </Button>
                <h3 className="text-xl font-semibold">{t("select_date")}</h3>
                <div className="w-24"></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {availableDates.map((date) => {
                  const d = new Date(date);
                  const dayName = format(d, "EEEE", { locale });
                  const dayNum = d.getDate();
                  const active = selectedDate === date;

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      aria-pressed={active}
                      className={`p-4 rounded-lg border-2 transition focus:outline-none ${
                        active ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      <Calendar className="h-5 w-5 mx-auto mb-2" />
                      <span className="block text-center">
                        {dayName} {dayNum}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  {t("back_to_services")}
                </Button>
                <Button onClick={() => setStep(3)} disabled={!selectedDate}>
                  {t("next")} <ArrowLeft className="h-4 w-4 mr-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Time & Payment & Promotion */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowRight className="h-4 w-4 ml-2" /> {t("previous")}
                </Button>
                <h3 className="text-xl font-semibold">{t("select_time")}</h3>
                <div className="w-24"></div>
              </div>

              {/* ✅ إذا الحلاق مغلق */}
              {timeSlots === "closed" ? (
                <p className="text-red-500 text-center font-semibold">{t("barber_closed")}</p>
              ) : (
                <>
                  {/* ✅ الأوقات */}
                  {timeSlots.length ? (
                    <>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {timeSlots.map((time) => {
                          const status = getSlotStatus(time);
                          const isSelected = selectedTime === time;

                          let slotClasses =
                            "p-3 rounded-lg border-2 transition text-sm flex flex-col items-center justify-center gap-1";
                          if (status === "pending_payment" || status === "pending")
                            slotClasses += " border-yellow-500 bg-yellow-50 cursor-not-allowed";
                          else if (status === "confirmed")
                            slotClasses += " border-red-500 bg-red-50 cursor-not-allowed";
                          else if (isSelected) slotClasses += " border-primary bg-primary/5";
                          else slotClasses += " border-gray-200 hover:border-primary/50";

                          return (
                            <button
                              key={time}
                              onClick={() => status === "free" && setSelectedTime(time)}
                              disabled={status !== "free"}
                              aria-pressed={isSelected}
                              aria-label={t("time_slot_label", {
                                time,
                                status: status === "free" ? t("available") : t(status),
                              })}
                              className={slotClasses}
                            >
                              <Clock className="h-5 w-5" />
                              <span>{time}</span>
                            </button>
                          );
                        })}
                      </div>
                      <Legend t={t} />
                    </>
                  ) : (
                    <p className="text-gray-500 text-center">{t("no_times_available")}</p>
                  )}

                  {/* ✅ ملخص الحجز و البروموشن */}
                  {selectedService && (
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-4">{t("booking_summary")}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>{t("service")}</span>
                          <span>{selectedService.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("date")}</span>
                          <span>
                            {selectedDate ? format(new Date(selectedDate), "EEEE, dd MMMM yyyy", { locale }) : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("time")}</span>
                          <span>{selectedTime || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("duration")}</span>
                          <span>
                            {selectedService.duration} {t("minutes")}
                          </span>
                        </div>

                        {/* ✅ السعر */}
                        <div className="flex justify-between items-center">
                          <span>{t("price")}</span>
                          <div className="text-right">
                            {appliedPromotion && (
                              <div className="text-sm line-through text-gray-500">
                                {selectedService.price} {t("shekel")}
                              </div>
                            )}
                            <div className="font-semibold">
                              {finalPrice} {t("shekel")}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ✅ عرض كود الخصم فقط إذا الحلاق مفتوح */}
                      {timeSlots !== "closed" && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">{t("discount_code")}</h4>
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              placeholder={t("enter_discount_code")}
                              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none"
                            />
                            <Button onClick={applyCoupon} disabled={couponLoading}>
                              {couponLoading ? t("loading") : t("apply")}
                            </Button>
                            {appliedPromotion && (
                              <div className="ml-2 px-3 py-2 rounded-lg border-2 border-primary bg-primary/5 flex items-center gap-2">
                                <div className="text-sm">
                                  {appliedPromotion.discountType === "PERCENT"
                                    ? t("discount_percent", { value: appliedPromotion.discountValue })
                                    : t("discount_fixed", {
                                        value: appliedPromotion.discountValue,
                                        currency: t("shekel"),
                                      })}
                                </div>
                                <button onClick={removeCoupon} className="text-sm underline ml-2">
                                  {t("remove")}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ✅ الدفع */}
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">{t("payment_method")}</h4>
                        <div className="flex gap-4">
                          <button
                            className={`px-4 py-2 rounded-lg border-2 ${
                              paymentMethod === "cash" ? "border-primary bg-primary/5" : "border-gray-200"
                            }`}
                            onClick={() => setPaymentMethod("cash")}
                          >
                            {t("cash")}
                          </button>
                          <button
                            className={`px-4 py-2 rounded-lg border-2 ${
                              paymentMethod === "online" ? "border-primary bg-primary/5" : "border-gray-200"
                            }`}
                            onClick={() => setPaymentMethod("online")}
                          >
                            {t("card")}
                          </button>
                          <button
                            className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 ${
                              paymentMethod === "wallet" ? "border-primary bg-primary/5" : "border-gray-200"
                            }`}
                            onClick={() => setPaymentMethod("wallet")}
                          >
                            <Wallet className="h-4 w-4" /> {t("wallet")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* زر التأكيد */}
              {timeSlots !== "closed" && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleBooking} disabled={isProcessing}>
                    {isProcessing ? t("booking_in_progress") : t("confirm_booking")}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default BookingPage;