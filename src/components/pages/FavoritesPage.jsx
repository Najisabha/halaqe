import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next"; // Import useTranslation

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

function FavoritesPage({ onBookBarber, setIsLoggedIn, setCurrentView }) {
  const { t, i18n } = useTranslation(); // Use translation hook
  const { toast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Load favorites
  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await api("/api/user/favorites", "GET", null, toast, setIsLoggedIn, setCurrentView, t);
      if (data) setFavorites(data);
    } catch {
      toast({ title: t("error"), description: t("failed_to_load_favorites"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [t, toast, setIsLoggedIn, setCurrentView]);

  // 🔹 Remove from favorites
  const removeFavorite = async (id) => {
    try {
      await api(`/api/user/favorites/${id}`, "DELETE", null, toast, setIsLoggedIn, setCurrentView, t);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
      toast({ title: t("success"), description: t("salon_removed_from_favorites") });
    } catch {
      toast({ title: t("error"), description: t("failed_to_remove_favorite"), variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" dir={i18n.dir()}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        {/* 🔹 Language Switcher */}


        <h2 className="text-2xl font-bold mb-8">{t("favorites")}</h2>

        {loading ? (
          <p className="text-center text-gray-500">{t("loading")}</p>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">{t("no_favorite_salons")}</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {favorites.map((fav) => {
              const salon = fav.salon || {};
              const rating = fav.user.reviewsGiven;
              const area = fav.user.area;
              const city = fav.user.city;
              const avgRating = calcAverageRating(rating || []);
              return (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img
                        src={salon.images?.[0]?.url || salon.imageUrl || "/placeholder.png"}
                        alt={salon.name || t("salon")}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="p-6 md:w-2/3">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">{salon.name || t("unknown_salon")}</h3>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-500 ml-1" />
                          <span>{avgRating || "—"}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="h-5 w-5 ml-2" />
                        <span>
                          {city || t("unknown_city")} {area ? `- ${area}` : ""}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                            onClick={() => removeFavorite(fav.salonId)}
                            aria-label={t("remove_from_favorites")}
                          >
                            <Heart className="h-5 w-5 fill-current" />
                          </Button>
                          <Button onClick={() => onBookBarber(salon)}>{t("book_appointment")}</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default FavoritesPage;