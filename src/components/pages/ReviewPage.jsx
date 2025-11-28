import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Heart, HeartOff, MessageSquare, Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Textarea from "@/components/ui/Textarea.jsx";
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

function ReviewPage({ barberId, salonId, setIsLoggedIn, setCurrentView }) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  // 🔹 Persist language preference
  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang) i18n.changeLanguage(savedLang);
  }, [i18n]);

  // 🔹 Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await api(
        `/api/user/barbers/${barberId}/reviews`,
        "GET",
        null,
        toast,
        setIsLoggedIn,
        setCurrentView,
        t
      );
      if (data) {
        setReviews(data || []);
        setFilteredReviews(data || []);
      }
    } catch {
      toast({
        title: t("error"),
        description: t("failed_to_load_reviews"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch favorite status
  const fetchFavoriteStatus = async () => {
    try {
      const data = await api("/api/user/favorites", "GET", null, toast, setIsLoggedIn, setCurrentView, t);
      if (data) {
        setFavorite(data.some((f) => f.salonId === salonId));
      }
    } catch {
      toast({
        title: t("error"),
        description: t("failed_to_load_favorite_status"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchFavoriteStatus();
  }, [barberId, salonId, t, toast, setIsLoggedIn, setCurrentView]);

  // 🔹 Filter reviews by search query and rating
  useEffect(() => {
    let filtered = reviews.filter(
      (r) =>
        r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.barber?.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.barber?.lastname?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (ratingFilter !== "all") {
      filtered = filtered.filter((r) => r.rating === Number(ratingFilter));
    }

    setFilteredReviews(filtered);
  }, [searchQuery, ratingFilter, reviews]);

  // 🔹 Submit review
  const submitReview = async () => {
    if (!rating || !comment) {
      toast({ title: t("error"), description: t("fill_all_fields"), variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      await api(
        `/api/user/barbers/${barberId}/reviews`,
        "POST",
        { barberId, rating, comment },
        toast,
        setIsLoggedIn,
        setCurrentView,
        t
      );
      await fetchReviews();
      setComment("");
      setRating(0);
      toast({ title: t("success"), description: t("review_added") });
    } catch {
      toast({
        title: t("error"),
        description: t("failed_to_add_review"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 Reply to review (barber only)
  const replyToReview = async (reviewId) => {
    if (!replyText[reviewId]) {
      toast({ title: t("error"), description: t("reply_required"), variant: "destructive" });
      return;
    }
    try {
      setReplyingTo(reviewId);
      await api(
        `/api/user/barbers/${barberId}/reviews/${reviewId}/reply`,
        "POST",
        { reply: replyText[reviewId] },
        toast,
        setIsLoggedIn,
        setCurrentView,
        t
      );
      await fetchReviews();
      setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
      toast({ title: t("success"), description: t("reply_added") });
    } catch {
      toast({
        title: t("error"),
        description: t("failed_to_add_reply"),
        variant: "destructive",
      });
    } finally {
      setReplyingTo(null);
    }
  };

  // 🔹 Toggle favorite
  const toggleFavorite = async () => {
    try {
      if (favorite) {
        await api(
          `/api/user/favorites/${salonId}`,
          "DELETE",
          null,
          toast,
          setIsLoggedIn,
          setCurrentView,
          t
        );
        setFavorite(false);
        toast({ title: t("success"), description: t("removed_from_favorites") });
      } else {
        await api(
          "/api/user/favorites",
          "POST",
          { salonId },
          toast,
          setIsLoggedIn,
          setCurrentView,
          t
        );
        setFavorite(true);
        toast({ title: t("success"), description: t("added_to_favorites") });
      }
    } catch {
      toast({
        title: t("error"),
        description: t("failed_to_toggle_favorite"),
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
          <Star className="h-6 w-6 text-primary" />
        </motion.div>
        <p className="text-lg font-medium">{t("loading_reviews")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={i18n.dir()}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6"
      >
        {/* 🔹 Language Switcher, Search Bar, and Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 transform -translate-y-1/2 start-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t("search_reviews")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10 pe-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary transition-shadow"
              aria-label={t("search_reviews")}
            />
          </div>
          <div className="flex gap-4">
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-40" aria-label={t("filter_by_rating")}>
                <SelectValue placeholder={t("all_ratings")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_ratings")}</SelectItem>
                {[1, 2, 3, 4, 5].map((r) => (
                  <SelectItem key={r} value={r.toString()}>
                    {t("stars", { count: r })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={i18n.language}
              onValueChange={(lng) => {
                i18n.changeLanguage(lng);
                localStorage.setItem("language", lng);
                toast({
                  title: t("language_changed"),
                  description: t("language_changed_message", {
                    language: lng === "ar" ? t("arabic") : t("english"),
                  }),
                });
              }}
            >
              <SelectTrigger className="w-40" aria-label={t("select_language")}>
                <SelectValue placeholder={t("select_language")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">{t("arabic")}</SelectItem>
                <SelectItem value="en">{t("english")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 🔹 Favorite Button */}
        <div className="flex justify-end">
          <Button
            variant={favorite ? "destructive" : "outline"}
            onClick={toggleFavorite}
            className={`border-gray-300 hover:bg-gray-50 ${favorite ? "hover:bg-red-50" : ""}`}
            aria-label={favorite ? t("remove_from_favorites") : t("add_to_favorites")}
          >
            {favorite ? <HeartOff className="h-5 w-5 me-2" /> : <Heart className="h-5 w-5 me-2" />}
            {favorite ? t("remove_from_favorites") : t("add_to_favorites")}
          </Button>
        </div>

        {/* 🔹 Review Form */}
        <div className="bg-white shadow-lg rounded-lg p-6 ring-1 ring-gray-200">
          <h3 className="text-lg font-semibold mb-4">{t("add_review")}</h3>
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 cursor-pointer transition-colors ${
                  rating >= star ? "text-yellow-500" : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
                aria-label={t("rate_stars", { count: star })}
              />
            ))}
          </div>
          <Textarea
            placeholder={t("write_review_placeholder")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded p-2 mb-3 focus:ring-2 focus:ring-primary"
            aria-label={t("write_review_placeholder")}
          />
          <Button
            onClick={submitReview}
            disabled={submitting}
            className={`w-full ${submitting ? "opacity-50" : ""}`}
            aria-label={t("submit_review")}
          >
            {submitting ? t("submitting_review") : t("submit_review")}
          </Button>
        </div>

        {/* 🔹 Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 text-center text-lg"
            >
              {t("no_reviews_found")}
            </motion.p>
          ) : (
            filteredReviews.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg">
                    {r.barber?.firstname || t("unknown_barber")} {r.barber?.lastname || ""}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < r.rating ? "text-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{r.comment || t("no_comment")}</p>
                {r.createdAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(r.createdAt).toLocaleString(i18n.language, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}
                {r.reply && (
                  <p className="text-sm text-primary mt-2">
                    {t("barber_reply")}: {r.reply}
                  </p>
                )}
                {!r.reply && (
                  <div className="flex items-center gap-2 mt-3">
                    <Input
                      type="text"
                      placeholder={t("add_reply_placeholder")}
                      value={replyText[r.id] || ""}
                      onChange={(e) => setReplyText((prev) => ({ ...prev, [r.id]: e.target.value }))}
                      className="flex-1 border rounded p-2"
                      aria-label={t("add_reply_placeholder")}
                    />
                    <Button
                      size="icon"
                      onClick={() => replyToReview(r.id)}
                      disabled={replyingTo === r.id}
                      className={replyingTo === r.id ? "opacity-50" : ""}
                      aria-label={t("submit_reply", { title: r.comment || t("no_comment") })}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ReviewPage;