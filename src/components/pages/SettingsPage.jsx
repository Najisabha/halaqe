import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Lock, Star, LogOut, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { palestineLocations } from "../../data/palestine-locations";

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
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    };

    let options = { method, headers };

    if (body) {
      if (body instanceof FormData) {
        options.body = body;
      } else {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      }
    }

    const api = import.meta.env.VITE_API_URL;

    const res = await fetch(`${api}${url}`, options);

    if (res.status === 401) {
      handleUnauthorized(setIsLoggedIn, setCurrentView, toast, t);
      return null;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let message = t("api_error");
      try {
        const json = JSON.parse(text);
        if (json?.message) message = json.message;
      } catch {}
      throw new Error(message);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    return res.text();
  } catch (error) {
    throw error;
  }
};

// ----------------- SalonPage (for BARBER only) -----------------
function SalonPage({ salon, reload }) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: salon?.name || "",
    location: salon?.location || "",
    city: salon?.city || "",
    area: salon?.area || "",
    minPrice: salon?.minPrice ?? 0,
    latitude: salon?.latitude || "",
    longitude: salon?.longitude || "",
    isAutomaticAppointment: salon?.isAutomaticAppointment ?? false,
  });
  const [images, setImages] = useState(salon?.images || []);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [selectedCity, setSelectedCity] = useState(salon?.city || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm({
      name: salon?.name || "",
      location: salon?.location || "",
      city: salon?.city || "",
      area: salon?.area || "",
      minPrice: salon?.minPrice ?? 0,
      latitude: salon?.latitude || "",
      longitude: salon?.longitude || "",
      isAutomaticAppointment: salon?.isAutomaticAppointment ?? false,
    });
    setImages(salon?.images || []);
    setSelectedCity(salon?.city || "");
  }, [salon]);

  const saveSalon = async () => {
    if (!form.name || !form.location || !form.city || !form.area || form.minPrice < 0) {
      toast({ title: t("error"), description: t("fill_all_fields"), variant: "destructive" });
      return;
    }
    try {
      await api("/api/barber/salon", "PUT", {
        ...form,
        minPrice: Number(form.minPrice) || 0,
      }, toast, null, null, t);
      toast({ title: t("success"), description: t("salon_updated") });
      reload();
    } catch (err) {
      toast({ title: t("error"), description: t("failed_to_update_salon", { message: err.message }), variant: "destructive" });
    }
  };

  const addImages = async () => {
    if (pendingFiles.length === 0) {
      toast({ title: t("error"), description: t("no_images_selected"), variant: "destructive" });
      return;
    }
    try {
      setUploading(true);
      for (let file of pendingFiles) {
        const formData = new FormData();
        formData.append("image", file);
        const data = await api("/api/barber/images", "POST", formData, toast, null, null, t);
        if (data?.image) {
          setImages((prev) => [...prev, data.image]);
        }
      }
      setPendingFiles([]);
      toast({ title: t("success"), description: t("images_added") });
    } catch (err) {
      toast({ title: t("error"), description: t("failed_to_upload_images", { message: err.message }), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const setAsMain = async (id) => {
    try {
      await api("/api/barber/main-image", "PUT", { imageId: id }, toast, null, null, t);
      setImages(images.map((i) => ({ ...i, isMain: i.id === id })));
      toast({ title: t("success"), description: t("main_image_set") });
    } catch (err) {
      toast({ title: t("error"), description: t("failed_to_set_main_image", { message: err.message }), variant: "destructive" });
    }
  };

  const deleteImage = async (id) => {
    try {
      await api(`/api/barber/images/${id}`, "DELETE", null, toast, null, null, t);
      setImages(images.filter((i) => i.id !== id));
      toast({ title: t("success"), description: t("image_deleted") });
    } catch (err) {
      toast({ title: t("error"), description: t("failed_to_delete_image", { message: err.message }), variant: "destructive" });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: t("error"), description: t("geolocation_not_supported"), variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          const address = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setForm({ ...form, location: address, latitude, longitude });
          toast({ title: t("success"), description: t("location_fetched") });
        } catch (err) {
          toast({ title: t("error"), description: t("failed_to_fetch_location"), variant: "destructive" });
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          toast({ title: t("error"), description: t("location_permission_denied"), variant: "destructive" });
        } else {
          toast({ title: t("error"), description: t("failed_to_get_location"), variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-6" dir={i18n.dir()}>
      <h3 className="text-lg font-semibold">{t("salon_details")}</h3>

      <div>
        <label className="block text-sm font-medium">{t("salon_name")}</label>
        <Input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1 block w-full rounded-lg focus:ring-2 focus:ring-primary"
          placeholder={t("enter_salon_name")}
          aria-label={t("salon_name")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">{t("address")}</label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="block w-full rounded-lg focus:ring-2 focus:ring-primary"
            placeholder={t("enter_address_or_use_location")}
            aria-label={t("address")}
          />
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            className="hover:bg-gray-50"
            aria-label={t("use_current_location")}
          >
            <MapPin className="w-4 h-4 me-2" /> {t("use_current_location")}
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">{t("city")}</label>
        <Select value={form.city} onValueChange={(value) => {
  setForm({ ...form, city: value, area: "" });
  setSelectedCity(value);
}}>
  <SelectTrigger className="mt-1 w-full" aria-label={t("city")}>
    <SelectValue placeholder={t("select_city")} />
  </SelectTrigger>
  <SelectContent>
    {Object.keys(palestineLocations.cities).map((city) => (
      <SelectItem key={city} value={city}>{city}</SelectItem>
    ))}
  </SelectContent>
</Select>

      </div>

      {selectedCity && (
        <div>
          <label className="block text-sm font-medium">{t("area")}</label>
          <Select value={form.area} onValueChange={(value) => setForm({ ...form, area: value })}>
  <SelectTrigger className="mt-1 w-full" aria-label={t("area")}>
    <SelectValue placeholder={t("select_area")} />
  </SelectTrigger>
  <SelectContent>
    {palestineLocations.cities[selectedCity]?.map((area) => (
      <SelectItem key={area} value={area}>{area}</SelectItem>
    ))}
  </SelectContent>
</Select>

        </div>
      )}

      <div>
        <label className="block text-sm font-medium">{t("min_price")}</label>
        <Input
          type="number"
          value={form.minPrice}
          onChange={(e) => setForm({ ...form, minPrice: e.target.value ? Number(e.target.value) : 0 })}
          className="mt-1 block w-full rounded-lg focus:ring-2 focus:ring-primary"
          placeholder={t("enter_min_price")}
          aria-label={t("min_price")}
        />
      </div>

      <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
        <span className="font-medium">{t("automatic_appointments")}</span>
        {form.isAutomaticAppointment ? (
          <Button
            variant="destructive"
            onClick={async () => {
              try {
                await api("/api/barber/appointments-status", "PATCH", { status: false }, toast, null, null, t);
                setForm({ ...form, isAutomaticAppointment: false });
                toast({ title: t("success"), description: t("automatic_appointments_disabled") });
              } catch (err) {
                toast({ title: t("error"), description: t("failed_to_update_status", { message: err.message }), variant: "destructive" });
              }
            }}
            aria-label={t("disable_automatic_appointments")}
          >
            {t("disable")}
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={async () => {
              try {
                await api("/api/barber/appointments-status", "PATCH", { status: true }, toast, null, null, t);
                setForm({ ...form, isAutomaticAppointment: true });
                toast({ title: t("success"), description: t("automatic_appointments_enabled") });
              } catch (err) {
                toast({ title: t("error"), description: t("failed_to_update_status", { message: err.message }), variant: "destructive" });
              }
            }}
            aria-label={t("enable_automatic_appointments")}
          >
            {t("enable")}
          </Button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">{t("add_images", { max: 3 })}</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files);
            if (images.length + files.length > 3) {
              toast({ title: t("error"), description: t("max_images_exceeded", { max: 3 }), variant: "destructive" });
              return;
            }
            setPendingFiles(files.slice(0, 3 - images.length));
          }}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200 inline-block mt-2"
        >
          {t("choose_images")}
        </label>
        {pendingFiles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {pendingFiles.map((file, idx) => (
              <div key={idx} className="relative border rounded-lg p-2">
                <img
                  src={URL.createObjectURL(file)}
                  alt={t("image_preview")}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  className="absolute top-2 end-2 bg-red-500 text-white rounded-full p-1"
                  onClick={() => setPendingFiles(pendingFiles.filter((_, i) => i !== idx))}
                  aria-label={t("remove_image")}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {pendingFiles.length > 0 && (
          <Button
            onClick={addImages}
            disabled={uploading}
            className={`mt-3 ${uploading ? "opacity-50" : ""}`}
            aria-label={t("upload_selected_images")}
          >
            {uploading ? t("uploading_images") : t("upload_selected_images")}
          </Button>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">{t("salon_images")}</h2>
        {images.length === 0 ? (
          <p className="text-gray-500">{t("no_images")}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.url}
                  alt={t("salon_image")}
                  className={`w-full h-40 object-cover rounded-xl shadow ${img.isMain ? "ring-4 ring-blue-500" : ""}`}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  {!img.isMain && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setAsMain(img.id)}
                      aria-label={t("set_as_main_image")}
                    >
                      {t("set_as_main")}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteImage(img.id)}
                    aria-label={t("delete_image")}
                  >
                    {t("delete")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button className="mt-6 w-full" onClick={saveSalon} aria-label={t("save_salon_details")}>
        {t("save_salon_details")}
      </Button>
    </div>
  );
}

// ----------------- ProfilePage --------------------------------
function ProfilePage({ profile, reload, setIsLoggedIn, setCurrentView }) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [form, setForm] = useState(profile || {});
  const [selectedCity, setSelectedCity] = useState(profile?.city || "");

  useEffect(() => {
    setForm(profile || {});
    setSelectedCity(profile?.city || "");
  }, [profile]);

  const handleSave = async () => {
    if (!form.firstname || !form.lastname || !form.location || !form.city || !form.area || !form.birthDate) {
      toast({ title: t("error"), description: t("fill_all_fields"), variant: "destructive" });
      return;
    }
    try {
      const endpoint = profile?.type === "BARBER" ? "/api/barber/profile" : "/api/user/profile";
      await api(endpoint, "PUT", form, toast, setIsLoggedIn, setCurrentView, t);
      toast({ title: t("success"), description: t("profile_updated") });
      reload();
    } catch (err) {
      toast({ title: t("error"), description: t("failed_to_update_profile", { message: err.message }), variant: "destructive" });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: t("error"), description: t("geolocation_not_supported"), variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          const address = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setForm({ ...form, location: address, latitude, longitude });
          toast({ title: t("success"), description: t("location_fetched") });
        } catch (err) {
          toast({ title: t("error"), description: t("failed_to_fetch_location"), variant: "destructive" });
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          toast({ title: t("error"), description: t("location_permission_denied"), variant: "destructive" });
        } else {
          toast({ title: t("error"), description: t("failed_to_get_location"), variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-4" dir={i18n.dir()}>
      <h3 className="text-lg font-semibold">{t("profile_info")}</h3>

      <div>
        <label className="block text-sm font-medium">{t("first_name")}</label>
        <Input
          type="text"
          value={form.firstname || ""}
          onChange={(e) => setForm({ ...form, firstname: e.target.value })}
          className="mt-1 block w-full rounded-lg focus:ring-2 focus:ring-primary"
          placeholder={t("enter_first_name")}
          aria-label={t("first_name")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">{t("last_name")}</label>
        <Input
          type="text"
          value={form.lastname || ""}
          onChange={(e) => setForm({ ...form, lastname: e.target.value })}
          className="mt-1 block w-full rounded-lg focus:ring-2 focus:ring-primary"
          placeholder={t("enter_last_name")}
          aria-label={t("last_name")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">{t("email")}</label>
        <Input
          type="email"
          value={form.email || ""}
          readOnly
          className="mt-1 block w-full rounded-lg bg-gray-100"
          aria-label={t("email")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">{t("phone_number")}</label>
        <Input
          type="text"
          value={form.phonenumber || ""}
          readOnly
          className="mt-1 block w-full rounded-lg bg-gray-100"
          aria-label={t("phone_number")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">{t("address")}</label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={form.location || ""}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="block w-full rounded-lg focus:ring-2 focus:ring-primary"
            placeholder={t("enter_address_or_use_location")}
            aria-label={t("address")}
          />
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            className="hover:bg-gray-50"
            aria-label={t("use_current_location")}
          >
            <MapPin className="w-4 h-4 me-2" /> {t("use_current_location")}
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">{t("city")}</label>
        <Select value={form.city} onValueChange={(value) => {
  setForm({ ...form, city: value, area: "" });
  setSelectedCity(value);
}}>
  <SelectTrigger className="mt-1 w-full" aria-label={t("city")}>
    <SelectValue placeholder={t("select_city")} />
  </SelectTrigger>
  <SelectContent>
    {Object.keys(palestineLocations.cities).map((city) => (
      <SelectItem key={city} value={city}>{city}</SelectItem>
    ))}
  </SelectContent>
</Select>

      </div>

      {selectedCity && (
        <div>
          <label className="block text-sm font-medium">{t("area")}</label>
          <Select value={form.area} onValueChange={(value) => setForm({ ...form, area: value })}>
  <SelectTrigger className="mt-1 w-full" aria-label={t("area")}>
    <SelectValue placeholder={t("select_area")} />
  </SelectTrigger>
  <SelectContent>
    {palestineLocations.cities[selectedCity]?.map((area) => (
      <SelectItem key={area} value={area}>{area}</SelectItem>
    ))}
  </SelectContent>
</Select>

        </div>
      )}

      <div>
        <label className="block text-sm font-medium">{t("birth_date")}</label>
        <Input
          type="date"
          value={form.birthDate ? form.birthDate.split("T")[0] : ""}
          onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          className="mt-1 block w-full rounded-lg focus:ring-2 focus:ring-primary"
          aria-label={t("birth_date")}
        />
      </div>

      <Button className="mt-4 w-full" onClick={handleSave} aria-label={t("save_changes")}>
        {t("save_changes")}
      </Button>
    </div>
  );
}

// ----------------- PasswordPage -------------------------------
function PasswordPage({ profile, setIsLoggedIn, setCurrentView }) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirm: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirm) {
      toast({ title: t("error"), description: t("fill_all_fields"), variant: "destructive" });
      return;
    }
    if (form.newPassword !== form.confirm) {
      toast({ title: t("error"), description: t("passwords_not_matching"), variant: "destructive" });
      return;
    }
    try {
      const endpoint = profile?.type === "BARBER" ? "/api/barber/change-password" : "/api/user/change-password";
      await api(endpoint, "PUT", {
        currentPassword: form.oldPassword,
        newPassword: form.newPassword,
      }, toast, setIsLoggedIn, setCurrentView, t);
      toast({ title: t("success"), description: t("password_changed") });
      setForm({ oldPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast({ title: t("error"), description: t("failed_to_change_password", { message: err.message }), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4" dir={i18n.dir()}>
      <h3 className="text-lg font-semibold">{t("change_password")}</h3>
      <div>
        <label className="block text-sm font-medium">{t("current_password")}</label>
        <Input
          type="password"
          name="oldPassword"
          value={form.oldPassword}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg focus:ring-2 focus:ring-primary"
          placeholder={t("enter_current_password")}
          aria-label={t("current_password")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">{t("new_password")}</label>
        <Input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg focus:ring-2 focus:ring-primary"
          placeholder={t("enter_new_password")}
          aria-label={t("new_password")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">{t("confirm_password")}</label>
        <Input
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg focus:ring-2 focus:ring-primary"
          placeholder={t("confirm_new_password")}
          aria-label={t("confirm_password")}
        />
      </div>
      <Button className="mt-4 w-full" onClick={handleSave} aria-label={t("change_password")}>
        {t("change_password")}
      </Button>
    </div>
  );
}

// ----------------- SettingsPage (main) -------------------------
export default function SettingsPage({ setIsLoggedIn, setCurrentView }) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang) i18n.changeLanguage(savedLang);
  }, [i18n]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem("currentUser");
      let parsed = null;
      try {
        parsed = stored ? JSON.parse(stored) : null;
      } catch {
        parsed = null;
      }

      const endpoint = parsed?.type === "BARBER" ? "/api/barber/profile" : "/api/user/profile";
      const data = await api(endpoint, "GET", null, toast, setIsLoggedIn, setCurrentView, t);
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      toast({ title: t("error"), description: t("failed_to_load_profile", { message: err.message }), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [t, toast, setIsLoggedIn, setCurrentView]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]" dir={i18n.dir()}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="me-2"
        >
          <User className="h-6 w-6 text-primary" />
        </motion.div>
        <p className="text-lg font-medium">{t("loading_profile")}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12" dir={i18n.dir()}>
        <p className="text-gray-500 text-lg">{t("no_profile_found")}</p>
      </div>
    );
  }

  const settingsSections = [
    { id: "profile", title: t("profile"), icon: User },
    { id: "password", title: t("password"), icon: Lock },
    ...(profile?.type === "BARBER" ? [{ id: "salon", title: t("salon"), icon: Star }] : []),
  ];

  return (
    <div className="container mx-auto px-4 py-8" dir={i18n.dir()}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">{t("settings")}</h2>

        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-4 ring-1 ring-gray-200">
          <div className="bg-gray-50 p-4 border-e">
            <nav className="space-y-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === section.id ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
                  }`}
                  aria-label={section.title}
                >
                  <section.icon className="h-5 w-5" />
                  <span>{section.title}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("currentUser");
                  setIsLoggedIn(false);
                  setCurrentView("login");
                  toast({ title: t("success"), description: t("logged_out") });
                }}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-red-500 hover:bg-red-50"
                aria-label={t("logout")}
              >
                <LogOut className="h-5 w-5" />
                <span>{t("logout")}</span>
              </button>
            </nav>
          </div>
          <div className="col-span-3 p-6">
            {activeTab === "profile" && (
              <ProfilePage profile={profile} reload={loadProfile} setIsLoggedIn={setIsLoggedIn} setCurrentView={setCurrentView} />
            )}
            {activeTab === "password" && (
              <PasswordPage profile={profile} setIsLoggedIn={setIsLoggedIn} setCurrentView={setCurrentView} />
            )}
            {activeTab === "salon" && profile?.type === "BARBER" && (
              <SalonPage salon={profile.salon} reload={loadProfile} />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}