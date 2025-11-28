import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Star, Scissors, MapPin, Heart, Search, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🔹 Custom marker icon
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

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

// 🔹 Helper to calculate average rating
const calcAverageRating = (reviews = []) => {
  if (!reviews.length) return null;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return (sum / reviews.length).toFixed(1);
};

function MapPage({ onBookBarber, setIsLoggedIn, setCurrentView }) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [salons, setSalons] = useState([]);
  const [filteredSalons, setFilteredSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("0");
  const [priceFilter, setPriceFilter] = useState("all");
  const [mapTheme, setMapTheme] = useState("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
  const [center, setCenter] = useState([31.9539, 35.9106]); // Default: Amman, Jordan
  const [addingFavorite, setAddingFavorite] = useState(null);
  const mapRef = useRef(null);

  // 🔹 Persist language preference
  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang) i18n.changeLanguage(savedLang);
  }, []);

  // 🔹 Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCenter = [position.coords.latitude, position.coords.longitude];
        setCenter(newCenter);
        if (mapRef.current) {
          mapRef.current.setView(newCenter, 12);
        }
      },
      () => {

      }
    );
  }, [t, toast]);

  // 🔹 Fetch salons
  const fetchSalons = async () => {
    try {
      setLoading(true);
      const data = await api("/api/user/salons", "GET", null, toast, setIsLoggedIn, setCurrentView, t);
      if (data) {
        setSalons(data.salons || []);
        setFilteredSalons(data.salons || []);
      }
    } catch {
      toast({
        title: t("error"),
        description: t("failed_to_load_salons"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, [t, toast, setIsLoggedIn, setCurrentView]);

  // 🔹 Filter salons by search query, rating, and price
  useEffect(() => {
    let filtered = salons.filter(
      (salon) =>
        (salon.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         salon.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         salon.owner?.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         salon.owner?.lastname?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (ratingFilter !== "0") {
      filtered = filtered.filter(
        (salon) => calcAverageRating(salon.owner?.reviewsReceived) >= Number(ratingFilter)
      );
    }

    if (priceFilter !== "all") {
      const [min, max] = priceFilter.split("-").map(Number);
      filtered = filtered.filter(
        (salon) => salon.minPrice >= min && (max ? salon.minPrice <= max : true)
      );
    }

    setFilteredSalons(filtered);
  }, [searchQuery, ratingFilter, priceFilter, salons]);

  // 🔹 Get Directions
  const handleGetDirections = (latitude, longitude, salonName) => {
    const encodedName = encodeURIComponent(salonName || t("unknown_salon"));
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_name=${encodedName}`;
    window.open(url, "_blank");
    toast({
      title: t("success"),
      description: t("directions_opened", { name: salonName || t("unknown_salon") }),
    });
  };

  // 🔹 Add to Favorites
  const handleAddToFavorites = async (salonId) => {
    if (addingFavorite) return;
    try {
      setAddingFavorite(salonId);
      await api("/api/user/favorites", "POST", { salonId }, toast, setIsLoggedIn, setCurrentView, t);
      toast({ title: t("success"), description: t("added_to_favorites") });
    } catch {
      toast({
        title: t("error"),
        description: t("failed_to_add_favorite"),
        variant: "destructive",
      });
    } finally {
      setAddingFavorite(null);
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
          <MapPin className="h-6 w-6 text-primary" />
        </motion.div>
        <p className="text-lg font-medium">{t("loading_salons")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={i18n.dir()}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        
        <h2 className="text-3xl font-bold mb-2">{t("nearby_salons")}</h2>
        <p className="text-gray-600 mb-8">{t("click_marker_for_details")}</p>

        {filteredSalons.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 text-center mb-4 text-lg"
          >
            {t("no_salons_found")}
          </motion.p>
        )}

        <div
          className="bg-white rounded-lg shadow-lg overflow-hidden ring-1 ring-gray-200 relative"
          style={{ height: "600px" }}
        >
          {/* 🔹 Custom Zoom Controls */}
          <div className="absolute top-4 start-4 z-[1000] flex flex-col gap-2">
            <Button
              size="icon"
              onClick={() => mapRef.current?.zoomIn()}
              className="bg-white hover:bg-gray-100 shadow-md"
              aria-label={t("zoom_in")}
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              onClick={() => mapRef.current?.zoomOut()}
              className="bg-white hover:bg-gray-100 shadow-md"
              aria-label={t("zoom_out")}
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
          </div>

          <MapContainer
            center={center}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer url={mapTheme} attribution={t("openstreetmap_attribution")} />
            <MarkerClusterGroup>
              {filteredSalons
                .filter((s) => s.latitude && s.longitude)
                .map((salon) => {
                  const avgRating = calcAverageRating(salon.owner?.reviewsReceived);

                  return (
                    <Marker
                      key={salon.id}
                      position={[salon.latitude, salon.longitude]}
                      icon={customIcon}
                      aria-label={t("salon_marker", { name: salon.name || t("unknown_salon") })}
                    >
                      <Popup maxWidth={300}>
                        <div className="p-4 w-64 bg-white rounded-md shadow-sm">
                          <img
                            src={salon.imageUrl || "https://via.placeholder.com/150"}
                            alt={salon.name || t("unknown_salon")}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                          <h3 className="font-semibold text-lg mb-2">
                            {salon.name || t("unknown_salon")}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {salon.owner?.firstname || t("unknown_owner")} {salon.owner?.lastname || ""}
                          </p>
                          <p className="text-xs text-gray-600 mb-3 flex items-center justify-center">
                            <MapPin className="h-4 w-4 me-1 text-gray-400" />
                            {salon.location || t("unknown_location")}
                          </p>

                          {avgRating ? (
                            <div className="flex items-center justify-center gap-1 mb-3">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium">{avgRating}/5</span>
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm mb-3">{t("no_rating_available")}</p>
                          )}

  

                          <div className="flex flex-col gap-2">
                            <Button
                              className="w-full bg-primary hover:bg-primary/90 transition-colors"
                              onClick={() => onBookBarber(salon)}
                              aria-label={t("book_appointment", { name: salon.name || t("unknown_salon") })}
                            >
                              <Scissors className="w-4 h-4 me-2" />
                              {t("book_appointment")}
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full border-gray-300 hover:bg-gray-50"
                              onClick={() => handleGetDirections(salon.latitude, salon.longitude, salon.name)}
                              aria-label={t("get_directions")}
                            >
                              <MapPin className="w-4 h-4 me-2" />
                              {t("get_directions")}
                            </Button>

                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </motion.div>
    </div>
  );
}

export default MapPage;