import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Scissors, Trash2, Edit, Star, ArrowLeft, Plus, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { palestineLocations } from "../../../data/palestine-locations";
          const apis = import.meta.env.VITE_API_URL;

  
const api = async (url, method = "GET", body) => {
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  if (!(body instanceof FormData)) headers["Content-Type"] = "application/json";
  const res = await fetch(`${apis}${url}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    window.location.reload();
  }
  if (!res.ok) throw new Error("API Error");
  return res.json();
};

function SalonBarbersPage({ currentUser }) {
  const { toast } = useToast();

  const [barbers, setBarbers] = useState([]);
  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [submittingBarber, setSubmittingBarber] = useState(false);
  const [currentView, setCurrentView] = useState("barbers");
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [cuts, setCuts] = useState([]);
  const [loadingCuts, setLoadingCuts] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Barber form
  const [form, setForm] = useState({
    id: null,
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
    city: "",
    area: "",
    address: "",
    image: null,
  });
  const [selectedCity, setSelectedCity] = useState("");
  const [barberImage, setBarberImage] = useState(null);

  // Appointment form
  const [appointmentForm, setAppointmentForm] = useState({
    barberId: null,
    services: [],
    newService: "",
    experienceYears: 0,
    experienceType: "سنة",
    slots: [],
    newDate: "",
    newTime: "",
  });

  // Cuts form
  const [cutTitle, setCutTitle] = useState("");
  const [cutDescription, setCutDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Dropzone for barber cuts
  const onDropCuts = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      if (acceptedFiles[0].size > 5 * 1024 * 1024) {
        toast({ title: "خطأ", description: "حجم الصورة يجب أن يكون أقل من 5 ميغابايت", variant: "destructive" });
        return;
      }
      setSelectedFiles([acceptedFiles[0]]);
    }
  };
  const { getRootProps: getRootPropsCuts, getInputProps: getInputPropsCuts, isDragActive: isDragActiveCuts } = useDropzone({
    onDrop: onDropCuts,
    accept: { "image/*": [] },
  });

  // Dropzone for barber image
  const onDropBarberImage = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      if (acceptedFiles[0].size > 5 * 1024 * 1024) {
        toast({ title: "خطأ", description: "حجم الصورة يجب أن يكون أقل من 5 ميغابايت", variant: "destructive" });
        return;
      }
      setBarberImage(acceptedFiles[0]);
      setForm({ ...form, image: acceptedFiles[0] });
    }
  };
  const { getRootProps: getRootPropsBarber, getInputProps: getInputPropsBarber, isDragActive: isDragActiveBarber } = useDropzone({
    onDrop: onDropBarberImage,
    accept: { "image/*": [] },
  });

  useEffect(() => {
    loadBarbers();
  }, []);

  useEffect(() => {
    if (selectedBarber) {
      setAppointmentForm((prev) => ({ ...prev, barberId: selectedBarber.id }));
      setReviews(selectedBarber.ratebarbers || []);
      setLoadingReviews(false);
    }
  }, [selectedBarber]);

  // Load barbers
  const loadBarbers = async () => {
    try {
      setLoadingBarbers(true);
      const data = await api("/api/barber/barbers", "GET");
      const barbersWithRatings = data.map((b) => {
        const reviews = b.ratebarbers || [];
        const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;
        return { ...b, avgRating };
      });
      setBarbers(barbersWithRatings);
    } catch {
      toast({ title: "خطأ", description: "فشل تحميل الحلاقين", variant: "destructive" });
    } finally {
      setLoadingBarbers(false);
    }
  };

  // Barber CRUD
  const handleSubmitBarber = async () => {
    if (!form.firstname || !form.lastname || !form.email || !form.phonenumber) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    try {
      setSubmittingBarber(true);
      const formData = new FormData();
      formData.append("firstname", form.firstname);
      formData.append("lastname", form.lastname);
      formData.append("email", form.email);
      formData.append("phonenumber", form.phonenumber);
      formData.append("city", form.city);
      formData.append("area", form.area);
      formData.append("address", form.address);
      if (!form.id) formData.append("salonId", currentUser?.salonId);
      if (form.image) formData.append("image", form.image);

      if (form.id) {
        await api(`/api/barber/barbers/${form.id}`, "PUT", formData);
        toast({ title: "تم التحديث", description: "تم تعديل بيانات الحلاق" });
      } else {
        await api("/api/barber/barbers", "POST", formData);
        toast({ title: "تمت الإضافة", description: "تمت إضافة حلاق جديد" });
      }
      resetForm();
      loadBarbers();
    } catch {
      toast({ title: "خطأ", description: "فشل الحفظ", variant: "destructive" });
    } finally {
      setSubmittingBarber(false);
    }
  };

  const handleDeleteBarber = async (id) => {
    try {
      setLoadingBarbers(true);
      await api(`/api/barber/barbers/${id}`, "DELETE");
      toast({ title: "تم الحذف", description: "تم حذف الحلاق" });
      loadBarbers();
    } catch {
      toast({ title: "خطأ", description: "فشل الحذف", variant: "destructive" });
    } finally {
      setLoadingBarbers(false);
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      firstname: "",
      lastname: "",
      email: "",
      phonenumber: "",
      city: "",
      area: "",
      address: "",
      image: null,
    });
    setSelectedCity("");
    setBarberImage(null);
  };

  // Appointments
  const loadAppointments = async (barberId) => {
    try {
      setLoadingAppointments(true);
      const data = await api(`/api/barber/free-appointments/${barberId}`, "GET");
      setAppointments(data);
    } catch {
      toast({ title: "خطأ", description: "فشل تحميل المواعيد", variant: "destructive" });
    } finally {
      setLoadingAppointments(false);
    }
  };

  const addService = () => {
    if (!appointmentForm.newService) {
      toast({ title: "خطأ", description: "يرجى إدخال خدمة", variant: "destructive" });
      return;
    }
    setAppointmentForm({
      ...appointmentForm,
      services: [...appointmentForm.services, appointmentForm.newService],
      newService: "",
    });
  };

  const addTimeSlot = () => {
    if (!appointmentForm.newDate || !appointmentForm.newTime) {
      toast({ title: "خطأ", description: "يرجى إدخال التاريخ والوقت", variant: "destructive" });
      return;
    }
    const existingDate = appointmentForm.slots.find((s) => s.date === appointmentForm.newDate);
    let updatedSlots;
    if (existingDate) {
      updatedSlots = appointmentForm.slots.map((s) =>
        s.date === appointmentForm.newDate ? { ...s, times: [...s.times, appointmentForm.newTime] } : s
      );
    } else {
      updatedSlots = [...appointmentForm.slots, { date: appointmentForm.newDate, times: [appointmentForm.newTime] }];
    }
    setAppointmentForm({ ...appointmentForm, slots: updatedSlots, newTime: "" });
  };

  const handleCreateAppointment = async () => {
    try {
      if (appointmentForm.services.length === 0 || appointmentForm.slots.length === 0) {
        toast({ title: "خطأ", description: "يرجى إدخال الخدمات والمواعيد", variant: "destructive" });
        return;
      }
      setLoadingAppointments(true);
      await api("/api/barber/free-appointments", "POST", { ...appointmentForm, salonId: currentUser?.salonId });
      toast({ title: "تم", description: "تم إضافة المواعيد" });
      setAppointmentForm({
        barberId: selectedBarber.id,
        services: [],
        newService: "",
        experienceYears: 0,
        experienceType: "سنة",
        slots: [],
        newDate: "",
        newTime: "",
      });
      loadAppointments(selectedBarber.id);
    } catch {
      toast({ title: "خطأ", description: "فشل إضافة الموعد", variant: "destructive" });
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      setLoadingAppointments(true);
      await api(`/api/barber/free-appointments/${id}`, "DELETE");
      toast({ title: "تم الحذف", description: "تم حذف الموعد" });
      loadAppointments(selectedBarber.id);
    } catch {
      toast({ title: "خطأ", description: "فشل الحذف", variant: "destructive" });
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Barber Cuts
  const loadCuts = async (barberId) => {
    try {
      setLoadingCuts(true);
      const data = await api(`/api/barber/cuts/${barberId}`, "GET");
      setCuts(data);
    } catch {
      toast({ title: "خطأ", description: "فشل تحميل القصات", variant: "destructive" });
    } finally {
      setLoadingCuts(false);
    }
  };

  const handleUploadCuts = async () => {
    if (!selectedFiles.length || !cutTitle || !cutDescription) {
      toast({ title: "خطأ", description: "يرجى إدخال الصورة، العنوان والوصف", variant: "destructive" });
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("barberId", selectedBarber.id);
    formData.append("title", cutTitle);
    formData.append("description", cutDescription);
    formData.append("image", selectedFiles[0]);
    try {
      await api(`/api/barber/add-barber-cut`, "POST", formData);
      toast({ title: "تم", description: "تم تحديث القصة" });
      setSelectedFiles([]);
      setCutTitle("");
      setCutDescription("");
      loadCuts(selectedBarber.id);
    } catch {
      toast({ title: "خطأ", description: "فشل رفع الصورة", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCut = async (id) => {
    try {
      setLoadingCuts(true);
      await api(`/api/barber/cuts/${id}`, "DELETE");
      toast({ title: "تم الحذف", description: "تم حذف القصة" });
      loadCuts(selectedBarber.id);
    } catch {
      toast({ title: "خطأ", description: "فشل حذف القصة", variant: "destructive" });
    } finally {
      setLoadingCuts(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Barber Management */}
      {currentView === "barbers" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h2 className="flex items-center gap-3 text-2xl font-bold mb-8 text-gray-800">
            <Scissors className="h-6 w-6 text-primary" /> إدارة الحلاقين
          </h2>

          {/* Barber Form */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">{form.id ? "تعديل حلاق" : "إضافة حلاق جديد"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-600 mb-1">الاسم الأول</label>
                <input
                  id="firstname"
                  placeholder="الاسم الأول"
                  value={form.firstname}
                  onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-600 mb-1">الاسم الأخير</label>
                <input
                  id="lastname"
                  placeholder="الاسم الأخير"
                  value={form.lastname}
                  onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">البريد الإلكتروني</label>
                <input
                  id="email"
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
              <div>
                <label htmlFor="phonenumber" className="block text-sm font-medium text-gray-600 mb-1">رقم الهاتف</label>
                <input
                  id="phonenumber"
                  placeholder="رقم الهاتف"
                  value={form.phonenumber}
                  onChange={(e) => setForm({ ...form, phonenumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-600 mb-1">المدينة</label>
                <select
                  id="city"
                  value={form.city}
                  onChange={(e) => {
                    setForm({ ...form, city: e.target.value, area: "" });
                    setSelectedCity(e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                >
                  <option value="">اختر المدينة</option>
                  {Object.keys(palestineLocations.cities).map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              {selectedCity && (
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-600 mb-1">المنطقة</label>
                  <select
                    id="area"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                  >
                    <option value="">اختر المنطقة</option>
                    {palestineLocations.cities[selectedCity]?.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-600 mb-1">العنوان</label>
                <input
                  id="address"
                  placeholder="العنوان"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">صورة الحلاق</label>
                <div
                  {...getRootPropsBarber()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActiveBarber ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary/50"
                  } ${barberImage || form.imageUrl ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <input {...getInputPropsBarber()} />
                  <p className="text-gray-500">
                    {barberImage || form.imageUrl ? "تم اختيار صورة" : "اسحب وأفلت صورة الحلاق هنا أو اضغط للاختيار"}
                  </p>
                </div>
                {(barberImage || form.imageUrl) && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                      <img
                        src={barberImage ? URL.createObjectURL(barberImage) : form.imageUrl}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        onClick={() => {
                          setBarberImage(null);
                          setForm({ ...form, image: null, imageUrl: null });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 transition"
                onClick={handleSubmitBarber}
                disabled={submittingBarber}
              >
                {submittingBarber ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    جاري الحفظ...
                  </span>
                ) : (
                  form.id ? "تحديث الحلاق" : "إضافة حلاق"
                )}
              </Button>
              {form.id && (
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 hover:bg-gray-100 transition"
                  onClick={resetForm}
                  disabled={submittingBarber}
                >
                  إلغاء
                </Button>
              )}
            </div>
          </div>

          {/* Barber List */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">قائمة الحلاقين</h3>
            {loadingBarbers ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : barbers.length === 0 ? (
              <p className="text-gray-500 text-center">لا يوجد حلاقين حاليًا</p>
            ) : (
              <div className="space-y-4">
                {barbers.map((barber) => (
                  <motion.div
                    key={barber.id}
                    className="p-4 border rounded-lg flex items-center justify-between bg-white hover:shadow-md transition-shadow"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-4">
                      {barber.imageUrl ? (
                        <img
                          src={barber.imageUrl}
                          alt={`${barber.firstname} ${barber.lastname}`}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Scissors className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-lg text-gray-800">
                          {barber.firstname} {barber.lastname}
                        </p>
                        <p className="text-sm text-gray-500">{barber.email}</p>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-4 w-4" />
                          <span>{barber.avgRating || "بدون تقييم"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => {
                          setSelectedBarber(barber);
                          loadCuts(barber.id);
                          setCurrentView("cuts");
                        }}
                      >
                        القصات
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => {
                          setSelectedBarber(barber);
                          loadAppointments(barber.id);
                          setCurrentView("appointments");
                        }}
                      >
                        المواعيد
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => {
                          setSelectedBarber(barber);
                          setCurrentView("reviews");
                        }}
                      >
                        التقييمات
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-300 hover:bg-gray-100"
                        onClick={() => {
                          setForm({ ...barber, image: null });
                          setSelectedCity(barber.city);
                          setBarberImage(barber.imageUrl ? { url: barber.imageUrl } : null);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="hover:bg-red-600"
                        onClick={() => handleDeleteBarber(barber.id)}
                        disabled={loadingBarbers}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Barber Cuts */}
      {currentView === "cuts" && selectedBarber && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">قصات {selectedBarber.firstname}</h2>
            <Button
              variant="outline"
              className="border-gray-300 hover:bg-gray-100"
              onClick={() => setCurrentView("barbers")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> رجوع
            </Button>
          </div>

          {/* Cuts Form */}
          <div className="space-y-4">
            <div
              {...getRootPropsCuts()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActiveCuts ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary/50"
              } ${selectedFiles.length ? "opacity-50 pointer-events-none" : ""}`}
            >
              <input {...getInputPropsCuts()} />
              <p className="text-gray-500">
                {selectedFiles.length ? "تم اختيار صورة" : "اسحب وأفلت صورة القصة هنا أو اضغط للاختيار"}
              </p>
            </div>
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                      onClick={() => setSelectedFiles([])}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cutTitle" className="block text-sm font-medium text-gray-600 mb-1">عنوان القصة</label>
                <input
                  id="cutTitle"
                  type="text"
                  placeholder="عنوان القصة"
                  value={cutTitle}
                  onChange={(e) => setCutTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
              <div>
                <label htmlFor="cutDescription" className="block text-sm font-medium text-gray-600 mb-1">الوصف</label>
                <textarea
                  id="cutDescription"
                  placeholder="الوصف"
                  value={cutDescription}
                  onChange={(e) => setCutDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                  rows={4}
                />
              </div>
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90 transition"
              onClick={handleUploadCuts}
              disabled={uploading}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري الرفع...
                </span>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" /> رفع القصة
                </>
              )}
            </Button>
          </div>

          {/* Cuts List */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">القصات الحالية</h3>
            {loadingCuts ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg overflow-hidden">
                    <div className="w-full h-32 bg-gray-200" />
                    <div className="p-2 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : cuts.length === 0 ? (
              <p className="text-gray-500 text-center">لا توجد قصات حاليًا</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cuts.map((cut) => (
                  <motion.div
                    key={cut.id}
                    className="border rounded-lg overflow-hidden bg-white relative hover:shadow-md transition-shadow"
                    whileHover={{ scale: 1.02 }}
                  >
                    <img src={cut.imageUrl} alt={cut.title} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <p className="font-semibold text-gray-800">{cut.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{cut.description}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 hover:bg-red-600"
                      onClick={() => handleDeleteCut(cut.id)}
                      disabled={loadingCuts}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Appointments */}
      {currentView === "appointments" && selectedBarber && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">مواعيد {selectedBarber.firstname}</h2>
            <Button
              variant="outline"
              className="border-gray-300 hover:bg-gray-100"
              onClick={() => setCurrentView("barbers")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> رجوع
            </Button>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="newService" className="block text-sm font-medium text-gray-600 mb-1">خدمة جديدة</label>
                <input
                  id="newService"
                  placeholder="خدمة جديدة"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                  value={appointmentForm.newService}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, newService: e.target.value })}
                />
              </div>
              <Button
                className="mt-6 bg-primary hover:bg-primary/90"
                onClick={addService}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {appointmentForm.services.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {appointmentForm.services.map((s, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm text-gray-700"
                  >
                    {s}
                    <button
                      className="text-red-500 hover:text-red-600"
                      onClick={() =>
                        setAppointmentForm({
                          ...appointmentForm,
                          services: appointmentForm.services.filter((_, idx) => idx !== i),
                        })
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Time Slots */}
          <div className="mt-6 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="newDate" className="block text-sm font-medium text-gray-600 mb-1">التاريخ</label>
                <input
                  id="newDate"
                  type="date"
                  value={appointmentForm.newDate}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, newDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="newTime" className="block text-sm font-medium text-gray-600 mb-1">الوقت</label>
                <input
                  id="newTime"
                  type="time"
                  value={appointmentForm.newTime}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, newTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
              </div>
              <Button
                className="mt-6 bg-primary hover:bg-primary/90"
                onClick={addTimeSlot}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {appointmentForm.slots.length > 0 && (
              <div className="space-y-2">
                {appointmentForm.slots.map((slot, i) => (
                  <div key={i} className="border rounded-lg p-3 bg-gray-50">
                    <p className="font-semibold text-gray-800">{slot.date}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {slot.times.map((t, j) => (
                        <span key={j} className="bg-gray-200 px-2 py-1 rounded text-sm text-gray-700">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              className="w-full bg-primary hover:bg-primary/90 transition"
              onClick={handleCreateAppointment}
              disabled={loadingAppointments}
            >
              {loadingAppointments ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري الحفظ...
                </span>
              ) : (
                "حفظ المواعيد"
              )}
            </Button>
          </div>

          {/* Existing Appointments */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">المواعيد الحالية</h3>
            {loadingAppointments ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse p-3 border rounded-lg flex justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : appointments.length ? (
              appointments.map((app) => (
                <motion.div
                  key={app.id}
                  className="p-3 border rounded-lg flex justify-between bg-white hover:shadow-md transition-shadow"
                  whileHover={{ scale: 1.01 }}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{app.services?.map((s) => s.name).join(", ")}</p>
                    <p className="text-sm text-gray-500">{app.slots?.map((s) => s.time).join(", ")}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="hover:bg-red-600"
                    onClick={() => handleDeleteAppointment(app.id)}
                    disabled={loadingAppointments}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center">لا توجد مواعيد</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Reviews */}
      {currentView === "reviews" && selectedBarber && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">تقييمات {selectedBarber.firstname}</h2>
            <Button
              variant="outline"
              className="border-gray-300 hover:bg-gray-100"
              onClick={() => setCurrentView("barbers")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> رجوع
            </Button>
          </div>

          {/* Reviews List */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">التقييمات الحالية</h3>
            {loadingReviews ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/6" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
                  </div>
                ))}
              </div>
            ) : reviews.length ? (
              reviews.map((review) => (
                <motion.div
                  key={review.id}
                  className="p-3 border rounded-lg bg-white hover:shadow-md transition-shadow mb-2"
                  whileHover={{ scale: 1.01 }}
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {review.customer.firstname} {review.customer.lastname}
                    </p>
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(review.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center">لا توجد تقييمات</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default SalonBarbersPage;