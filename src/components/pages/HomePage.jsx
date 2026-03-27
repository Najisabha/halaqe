import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, MapPin, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { useTranslation } from "react-i18next";

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

// ───────── Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col animate-pulse">
    <div className="h-80 bg-gray-200 rounded-t-xl"></div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="flex gap-2">
          <div className="h-10 w-20 bg-gray-200 rounded"></div>
          <div className="h-10 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// ───────── Slideshow Component
function SalonSlideshow({ images = [], alt, className, autoPlay = true }) {
  const { t, i18n } = useTranslation();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    if (autoPlay && images.length > 1 && !isPaused) {
      const timer = setInterval(() => {
        setDirection(1);
        setIndex((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [images.length, autoPlay, isPaused]);

  const next = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStart && touchEnd) {
      const diff = touchStart - touchEnd;
      if (diff > 50) next();
      if (diff < -50) prev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? "100%" : "-100%", opacity: 0 }),
  };

  if (!images || images.length === 0) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-gray-100 rounded-t-xl ${className}`}>
        <img
          src="https://placehold.co/800x500"
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-lg font-semibold p-3">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-gray-100 rounded-t-xl ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={index}
          className="relative w-full h-full"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <img
            src={images[index].url || images[index]}
            alt={`${alt}-${index}`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
            <p className="text-white text-lg font-semibold p-3">{alt}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-3 hover:bg-black/80 transition z-10"
            aria-label={t("previous_image")}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-3 hover:bg-black/80 transition z-10"
            aria-label={t("next_image")}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                className={`w-3 h-3 rounded-full transition ${i === index ? "bg-white scale-125" : "bg-white/50"}`}
                aria-label={t("go_to_image", { number: i + 1 })}
              />
            ))}
          </div>
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === index ? "border-primary" : "border-transparent"} transition-all duration-300 hover:scale-105`}
              >
                <img
                  src={img.url || img}
                  alt={`${alt}-thumb-${i}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ───────── Cut Modal
const CutModal = ({ cuts, currentIndex, onClose }) => {
  const { t, i18n } = useTranslation();
  const [index, setIndex] = useState(currentIndex);

  if (!cuts || cuts.length === 0) return null;

  const nextCut = () => setIndex((prev) => (prev + 1) % cuts.length);
  const prevCut = () => setIndex((prev) => (prev - 1 + cuts.length) % cuts.length);
  const currentCut = cuts[index];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative max-w-4xl w-full bg-white rounded-2xl p-6 shadow-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 left-4 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 transition"
            onClick={onClose}
            aria-label={t("close")}
          >
            <X className="w-7 h-7" />
          </button>
          {cuts.length > 1 && (
            <>
              <button
                onClick={prevCut}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-3 hover:bg-black/80 transition z-10"
                aria-label={t("previous_cut")}
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={nextCut}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-3 hover:bg-black/80 transition z-10"
                aria-label={t("next_cut")}
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}
          <motion.img
            key={index}
            src={currentCut.imageUrl}
            alt={currentCut.title}
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            loading="lazy"
          />
          <div className="text-center mt-4 space-y-2">
            <p className="text-2xl font-semibold">{currentCut.title || t("cut")}</p>
            {currentCut.price && (
              <p className="text-lg text-gray-600">
                {t("price")}: {currentCut.price} {t("shekel")}
              </p>
            )}
            {currentCut.duration && (
              <p className="text-lg text-gray-600">
                {t("duration")}: {currentCut.duration} {t("minutes")}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ───────── API Helper
const api = async (url, method = "GET", body, toast, setIsLoggedIn, setCurrentView, t) => {
  try {
    const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/+$/, "");

    const res = await fetch(`${apiBase}${url}`, {
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

    const raw = await res.text();
    let data = {};
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw };
      }
    }

    if (!res.ok) {
      throw new Error(data.message || `API Error: ${res.status} ${res.statusText}`);
    }
    return data;
  } catch (error) {
    return null;
  }
};

// ───────── Barber Modal
const BarberModal = ({ barber,salon, onClose, onBookSalon }) => {
  const { t, i18n } = useTranslation();
  const [selectedCutIndex, setSelectedCutIndex] = useState(null);
  const [activeSection, setActiveSection] = useState("cuts");

  if (!barber) return null;

  const avgRating =
    barber.ratebarbers?.length > 0
      ? (barber.ratebarbers.reduce((sum, r) => sum + (r.rating || 0), 0) / barber.ratebarbers.length).toFixed(1)
      : null;
  const reviewCount = barber.ratebarbers?.length || 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        dir={i18n.dir()}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 relative"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 text-2xl font-bold"
            onClick={onClose}
            aria-label={t("close")}
          >
            ✕
          </button>

          <div className="flex flex-col items-center mb-6">
            <img
              src={barber.imageUrl || "https://placehold.co/150x150"}
              alt={barber.firstname}
              className="w-36 h-36 rounded-full shadow-xl object-cover border-4 border-primary/20 transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
            <h2 className="text-3xl font-bold mt-4">{barber.firstname} {barber.lastname}</h2>
            {avgRating && (
              <div className="mt-2 flex items-center gap-2">
                <span className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg text-yellow-500 text-lg">
                  <Star className="w-6 h-6" /> {avgRating}/5
                </span>
                <span className="text-sm text-gray-500">
                  ({reviewCount} {t("reviews")})
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-6 mb-8">
            <button
              className={`px-8 py-3 rounded-lg text-xl font-medium ${activeSection === "cuts" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"} transition-all duration-200 hover:scale-105`}
              onClick={() => setActiveSection("cuts")}
            >
              {t("cuts")}
            </button>
            <button
              className={`px-8 py-3 rounded-lg text-xl font-medium ${activeSection === "reviews" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"} transition-all duration-200 hover:scale-105`}
              onClick={() => setActiveSection("reviews")}
            >
              {t("reviews")}
            </button>
          </div>

          <div className="space-y-8">
            {activeSection === "reviews" && (
              <>
                <h3 className="font-semibold text-2xl">{t("customer_reviews")}</h3>
                <div className="max-h-48 overflow-y-auto px-3">
                  <div className="space-y-4">
                    {barber.ratebarbers?.length > 0 ? (
                      barber.ratebarbers.map((r) => (
                        <div key={r.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start">
                            <p className="text-base">{r.comment}</p>
                            <span className="flex items-center gap-2 text-yellow-500 bg-gray-100 px-3 py-1 rounded">
                              <Star className="w-5 h-5" /> {r.rating}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            — {r.customer.firstname} {r.customer.lastname}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 text-xl">{t("no_reviews_yet")}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeSection === "cuts" && (
              <>
                <h3 className="font-semibold text-2xl">{t("available_cuts")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {barber.BarberCut?.length > 0 ? (
                    barber.BarberCut.map((cut, i) => (
                      <div
                        key={cut.id}
                        className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer hover:shadow-2xl hover:ring-4 hover:ring-primary/30 transition-all duration-300 hover:scale-105"
                        onClick={() => setSelectedCutIndex(i)}
                      >
                        <img
                          src={cut.imageUrl}
                          alt={cut.title}
                          className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end p-4">
                          <p className="text-white text-lg font-semibold">{cut.title || t("cut")}</p>
                          {cut.price && (
                            <p className="text-white text-base mt-1">
                              {t("price")}: {cut.price} {t("shekel")}
                            </p>
                          )}
                          {cut.duration && (
                            <p className="text-white text-base mt-1">
                              {t("duration")}: {cut.duration} {t("minutes")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 text-xl">{t("no_cuts_available")}</p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center mt-8">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    onClick={() => onBookSalon(salon)}
                    className="px-8 py-3 text-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary transition-all duration-300"
                  >
                    {t("book_appointment_now")}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("book_with_barber")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>
      </motion.div>
      {selectedCutIndex !== null && (
        <CutModal cuts={barber.BarberCut} currentIndex={selectedCutIndex} onClose={() => setSelectedCutIndex(null)} />
      )}
    </AnimatePresence>
  );
};

// ───────── Barber Card
const BarberCard = ({ barber, onClick }) => {
  const { t, i18n } = useTranslation();
  const avgRating =
    barber.ratebarbers?.length > 0
      ? (barber.ratebarbers.reduce((sum, r) => sum + (r.rating || 0), 0) / barber.ratebarbers.length).toFixed(1)
      : null;
  const reviewCount = barber.ratebarbers?.length || 0;

  return (
    <div
      onClick={() => onClick(barber)}
      className="border rounded-lg p-4 shadow-sm flex items-center gap-4 bg-white hover:shadow-md cursor-pointer transition duration-300 hover:scale-102"
      dir={i18n.dir()}
    >
      <img
        src={barber.imageUrl || "https://placehold.co/60x60"}
        alt={barber.firstname}
        className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
        loading="lazy"
      />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-xl">{barber.firstname} {barber.lastname}</p>
          {avgRating && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded text-yellow-500">
                <Star className="w-5 h-5" /> {avgRating}
              </span>
              <span className="text-sm text-gray-500">({reviewCount})</span>
            </div>
          )}
        </div>
        <p className="text-base text-gray-500">{barber.phonenumber}</p>
      </div>
    </div>
  );
};

// ───────── Salon Modal
const SalonModal = ({ salon, onClose, onBookSalon, onBarberClick }) => {
  const { t, i18n } = useTranslation();
  if (!salon) return null;

  const avgRating =
    salon.owner?.reviewsReceived?.length > 0
      ? (salon.owner.reviewsReceived.reduce((sum, r) => sum + (r.rating || 0), 0) / salon.owner.reviewsReceived.length).toFixed(1)
      : null;
  const reviewCount = salon.owner?.reviewsReceived?.length || 0;

  const [activeSection, setActiveSection] = useState("barbers");

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-6 overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        dir={i18n.dir()}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-8 relative max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 text-2xl font-bold"
            onClick={onClose}
            aria-label={t("close")}
          >
            ✕
          </button>

          <div className="h-[32rem] mb-6">
            <SalonSlideshow images={salon.images} alt={salon.name} className="rounded-xl" autoPlay={true} />
          </div>

          <h2 className="text-4xl font-bold text-center mb-4">{salon.name}</h2>
          {avgRating && (
            <div className="flex justify-center items-center gap-3 mb-4">
              <span className="flex items-center gap-2 text-yellow-500 text-xl bg-gray-100 px-4 py-2 rounded-lg">
                <Star className="w-6 h-6" /> {avgRating}/5
              </span>
              <span className="text-base text-gray-500">
                ({reviewCount} {t("reviews")})
              </span>
            </div>
          )}
          <p className="text-center text-gray-600 mb-4 text-lg">
            {salon.description || t("no_description_available")}
          </p>
          <div className="flex justify-center items-center text-gray-600 gap-2 mb-6">
            <MapPin className="w-6 h-6" /> <span className="text-lg">{salon.location || t("not_specified")}</span>
          </div>
          <p className="text-center text-primary font-medium text-xl mb-8">
            {t("minimum_price")}: {salon.minPrice || 0} {t("shekel")}
          </p>

          <div className="flex justify-center gap-6 mb-8">
            <button
              className={`px-8 py-3 rounded-lg text-xl font-medium ${activeSection === "barbers" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"} transition-all duration-200 hover:scale-105`}
              onClick={() => setActiveSection("barbers")}
            >
              {t("barbers")}
            </button>
            <button
              className={`px-8 py-3 rounded-lg text-xl font-medium ${activeSection === "reviews" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"} transition-all duration-200 hover:scale-105`}
              onClick={() => setActiveSection("reviews")}
            >
              {t("reviews")}
            </button>
            <button
              className={`px-8 py-3 rounded-lg text-xl font-medium ${activeSection === "services" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"} transition-all duration-200 hover:scale-105`}
              onClick={() => setActiveSection("services")}
            >
              {t("services")}
            </button>
          </div>

          {activeSection === "barbers" && (
            <div>
              {salon.barbers?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {salon.barbers.map((barber) => (
                    <BarberCard key={barber.id} barber={barber} onClick={onBarberClick} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 text-xl">{t("no_barbers_available")}</p>
              )}
            </div>
          )}

          {activeSection === "reviews" && (
            <div>
              {salon.owner?.reviewsReceived?.length > 0 ? (
                <div className="max-h-60 overflow-y-auto px-4">
                  <div className="space-y-4">
                    {salon.owner.reviewsReceived.map((r) => (
                      <div key={r.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start">
                          <p className="text-base">{r.comment}</p>
                          <span className="flex items-center gap-2 text-yellow-500 bg-gray-100 px-3 py-1 rounded">
                            <Star className="w-5 h-5" /> {r.rating}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          — {r.customer.firstname} {r.customer.lastname}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 text-xl">{t("no_reviews_yet")}</p>
              )}
            </div>
          )}

          {activeSection === "services" && (
            <div>
              {salon.owner.services?.length > 0 ? (
                <ul className="space-y-3">
                  {salon.owner.services.map((service) => (
                    <li key={service.id} className="flex justify-between text-lg">
                      <span>{service.name}</span>
                      <span>
                        {service.price} {t("shekel")}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 text-xl">{t("no_services_available")}</p>
              )}
            </div>
          )}

<div className="flex justify-center mt-8">
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="lg"
          onClick={() => onBookSalon(salon)} // directly book the salon
          className="px-8 py-3 text-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary transition-all duration-300"
        >
          {t("book_appointment_now")}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t("book_with_salon")}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ───────── HomePage
function HomePage({ currentUser, onBookSalon, setIsLoggedIn, setCurrentView }) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [salons, setSalons] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [minRating, setMinRating] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [cityInput, setCityInput] = useState("");

  // Language switcher handler
  const handleLanguageSwitch = (lng) => {
    i18n.changeLanguage(lng);
    toast({
      title: t("language_changed"),
      description: t("language_changed_message", { language: lng === "ar" ? t("arabic") : t("english") }),
    });
  };

  // Debounce city input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSelectedCity(cityInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [cityInput]);

  const processedSalons = useMemo(() => {
    return salons.map((s) => ({
      ...s,
      avgRating:
        s.owner?.reviewsReceived?.length > 0
          ? (
              s.owner.reviewsReceived.reduce((sum, r) => sum + (r.rating || 0), 0) /
              s.owner.reviewsReceived.length
            ).toFixed(1)
          : s.stats?.avgRating
          ? Number(s.stats.avgRating.toFixed(1))
          : null,
      reviewCount: s.owner?.reviewsReceived?.length || 0,
    }));
  }, [salons]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit: itemsPerPage });
      if (selectedCity) params.append("city", selectedCity);
      if (minRating) params.append("rating", minRating);
      const url =
        activeTab === "all"
          ? `/api/user/salons?${params.toString()}`
          : `/api/user/salons-trending?${params.toString()}`;
      const data = await api(url, "GET", null, toast, setIsLoggedIn, setCurrentView, t);

      if (data) {
        setSalons(data.salons);
        setFavorites(data.favorite?.favorites?.map((f) => f.salonId) || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      }
      setLoading(false);
    };
    loadData();
  }, [activeTab, selectedCity, minRating, currentPage, toast, setIsLoggedIn, setCurrentView, t]);

  const toggleFavorite = async (salonId) => {
    const isFav = favorites.includes(salonId);
    const method = isFav ? "DELETE" : "POST";
    const url = isFav ? `/api/user/favorites/${salonId}` : "/api/user/favorites";
    const body = isFav ? null : { salonId };
    const success = await api(url, method, body, toast, setIsLoggedIn, setCurrentView, t);
    if (success) {
      setFavorites((prev) => (isFav ? prev.filter((id) => id !== salonId) : [...prev, salonId]));
      toast({
        title: isFav ? t("تم الحذف من المفضلة") : t("تمت الإضافة إلى المفضلة"),
      });
    }
  };

  const handleSeeDetails = async (salonId) => {
    const data = await api(`/api/user/salons/${salonId}`, "GET", null, toast, setIsLoggedIn, setCurrentView, t);
    if (data) setSelectedSalon(data);
  };

  return (
    <div className="container mx-auto px-4 py-10" dir={i18n.dir()}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold mb-4">{t("find_best_salons")}</h1>
        <p className="text-xl text-gray-600">{t("discover_barbers_in_area")}</p>
      </motion.div>

      <div className="flex justify-start gap-6 mb-8">
        <button
          className={`px-6 py-3 rounded-lg text-lg font-medium ${activeTab === "all" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"} transition-all duration-200 hover:scale-105`}
          onClick={() => {
            setActiveTab("all");
            setCurrentPage(1);
          }}
        >
          {t("all_salons")}
        </button>
        <button
          className={`px-6 py-3 rounded-lg text-lg font-medium ${activeTab === "trending" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"} transition-all duration-200 hover:scale-105`}
          onClick={() => {
            setActiveTab("trending");
            setCurrentPage(1);
          }}
        >
          {t("trending")}
        </button>
      </div>

      <div className="sticky top-0 bg-white shadow-md rounded-lg p-6 mb-8 flex flex-wrap gap-6 items-end z-10">
        <div className="flex-1 min-w-[250px]">
          <label className="block mb-2 text-base font-medium">{t("city")}</label>
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            placeholder={t("search_by_city")}
          />
        </div>
        <div>
          <label className="block mb-2 text-base font-medium">{t("minimum_rating")}</label>
          <select
            value={minRating}
            onChange={(e) => {
              setMinRating(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg px-4 py-3 w-36 focus:outline-none focus:ring-2 focus:ring-primary text-lg"
          >
            <option value="">{t("all")}</option>
            {[1, 2, 3, 4].map((r) => (
              <option key={r} value={r}>
                +{r}
              </option>
            ))}
          </select>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={() => {
                  setCityInput("");
                  setMinRating("");
                  setCurrentPage(1);
                }}
                className="h-12 text-lg px-6 bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 transition-all duration-300"
              >
                {t("clear_filters")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("reset_all_filters")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : processedSalons.length === 0 ? (
        <p className="text-gray-500 text-center py-12 text-xl">{t("no_salons_available")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {processedSalons.map((salon, i) => (
            <motion.div
              key={salon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 hover:scale-102 max-w-xl w-full mx-auto relative"
            >
              {activeTab === "trending" && (
                <span className="absolute top-4 right-4 bg-yellow-400 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {t("trending")}
                </span>
              )}
              <div className="h-80">
                <SalonSlideshow images={salon.images || [salon.imageUrl]} alt={salon.name} />
              </div>
              <div className="p-6 flex flex-col justify-between flex-1 bg-gradient-to-b from-white to-gray-50">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-2xl truncate">{salon.name}</h3>
                    <div className="flex items-center gap-4">
                      {salon.avgRating && (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded text-yellow-500">
                            <Star className="h-5 w-5" />
                            {salon.avgRating}/5
                          </span>
                          <span className="text-sm text-gray-500">({salon.reviewCount})</span>
                        </div>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Heart
                              className={`h-7 w-7 cursor-pointer transition ${favorites.includes(salon.id) ? "text-red-500 fill-red-500" : "text-gray-300"}`}
                              onClick={() => toggleFavorite(salon.id)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            {favorites.includes(salon.id) ? t("تم الحذف من المفضلة") : t("تمت الإضافة إلى المفضلة")}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 mb-4 text-lg">
                    <MapPin className="h-6 w-6 ml-2 flex-shrink-0" />
                    <span className="truncate">{salon.location || t("not_specified")}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-primary font-medium text-xl">
                    {t("from")} {salon.minPrice || 0} {t("shekel")}
                  </span>
                  <div className="flex gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="lg"
                            onClick={() => onBookSalon(salon)}
                            className="px-6 py-3 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary transition-all duration-300"
                          >
                            {t("book")}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("book_appointment_now")}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => handleSeeDetails(salon.id)}
                            className="px-6 py-3 text-lg bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 transition-all duration-300"
                          >
                            {t("details")}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t("view_salon_details")}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-3 items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-6 py-3 text-lg bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 transition-all duration-300"
          >
            {t("previous")}
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={i + 1 === currentPage ? "default" : "outline"}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 text-lg ${i + 1 === currentPage ? "bg-primary text-white" : "bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30"} transition-all duration-300`}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-6 py-3 text-lg bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 transition-all duration-300"
          >
            {t("next")}
          </Button>
        </div>
      )}

      {selectedSalon && (
        <SalonModal
          salon={selectedSalon}
          onClose={() => setSelectedSalon(null)}
          onBookSalon={onBookSalon}
          onBarberClick={setSelectedBarber}
        />
      )}
      {selectedBarber && (
        <BarberModal
          barber={selectedBarber}
          salon={selectedSalon} // ← pass the selected salon here

          onClose={() => setSelectedBarber(null)}
          onBookSalon={onBookSalon}
        />
      )}
    </div>
  );
}

export default HomePage;