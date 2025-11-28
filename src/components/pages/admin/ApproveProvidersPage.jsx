import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Check, User, X, Calendar, MapPin, Mail, Phone, Home, FileText, Circle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";

// API helper
async function apiFetch(url, { method = "GET", body } = {}) {
          const api = import.meta.env.VITE_API_URL;

    const res = await fetch(`${api}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "حدث خطأ في الاتصال بالخادم");
  }

  return res.json();
}

const ApproveProvidersPage = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/api/auth/providers-not-accepted");
      setProviders(data.providers || []);
    } catch (err) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: "تأكيد الموافقة",
      text: "هل أنت متأكد من الموافقة على هذا الوكيل؟",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم، موافقة",
      cancelButtonText: "إلغاء",
      buttonsStyling: false,
      customClass: {
        confirmButton: "bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md mx-2",
        cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md mx-2",
      },
    });

    if (result.isConfirmed) {
      try {
        await apiFetch("/api/auth/approve-provider", { method: "POST", body: { id } });
        await Swal.fire({
          title: "نجاح",
          text: "تمت الموافقة على الوكيل بنجاح",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        setProviders((prev) => prev.filter((b) => b.id !== id));
      } catch (err) {
        await Swal.fire({
          title: "خطأ",
          text: err.message,
          icon: "error",
          confirmButtonText: "حسنًا",
          customClass: {
            confirmButton: "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md",
          },
        });
      }
    }
  };

  const handleReject = async (id) => {
    const { value: reason } = await Swal.fire({
      title: "رفض الوكيل",
      input: "textarea",
      inputLabel: "أدخل سبب الرفض",
      inputPlaceholder: "يرجى كتابة سبب الرفض هنا...",
      showCancelButton: true,
      confirmButtonText: "إرسال",
      cancelButtonText: "إلغاء",
      inputValidator: (value) => {
        if (!value) {
          return "يجب إدخال سبب الرفض!";
        }
      },
      buttonsStyling: false,
      customClass: {
        confirmButton: "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md mx-2",
        cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-md mx-2",
      },
    });

    if (reason) {
      try {
        await apiFetch("/api/auth/reject-provider", { method: "POST", body: { id, reason } });
        await Swal.fire({
          title: "نجاح",
          text: "تم رفض الوكيل بنجاح",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        setProviders((prev) => prev.filter((b) => b.id !== id));
      } catch (err) {
        await Swal.fire({
          title: "خطأ",
          text: err.message,
          icon: "error",
          confirmButtonText: "حسنًا",
          customClass: {
            confirmButton: "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md",
          },
        });
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return url;
    } catch {
      return "#"; // Fallback to prevent broken links
    }
  };

  const filteredProviders = providers.filter(
    (p) =>
      p.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dir=rtl">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 text-center text-gray-800"
      >
        الموافقة على الوكلاء
      </motion.h1>

      <div className="mb-6">
        <Input
          placeholder="ابحث بالاسم أو البريد الإلكتروني..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md mx-auto border-2 border-gray-300 focus:border-primary rounded-lg"
        />
      </div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-lg"
        >
          ⏳ جاري تحميل البيانات...
        </motion.div>
      ) : filteredProviders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-lg text-gray-600"
        >
          لا توجد وكلاء في انتظار الموافقة
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white rounded-xl border border-gray-200">
                <CardHeader className="bg-primary/5 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <User className="h-6 w-6" /> {p.firstname} {p.lastname}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-2 bg-gray-200 text-gray-700">
                    ID: {p.id}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-muted-foreground" /> {p.email}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-muted-foreground" /> {p.phonenumber || "—"}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-muted-foreground" /> {p.city || "—"} – {p.area || "—"}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Home className="h-4 w-4 text-muted-foreground" /> العنوان: {p.address || "—"}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Circle className={`h-4 w-4 ${p.status ? 'text-green-500' : 'text-red-500'}`} /> الحالة: {p.status ? "نشط" : "غير نشط"}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-muted-foreground" /> تاريخ الإنشاء: {formatDate(p.createdAt)}
                  </p>
                  <div className="flex gap-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="link" asChild className="text-blue-600 hover:text-blue-800">
                            <a href={validateUrl(p.idDocumentUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" /> وثيقة الهوية
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>انقر لعرض وثيقة الهوية</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-gray-50 rounded-b-xl">
                  <Button
                    variant="default"
                    onClick={() => handleApprove(p.id)}
                    className="bg-green-600 hover:bg-green-700 transition-colors duration-200"
                  >
                    <Check className="h-4 w-4 ml-2" /> موافقة
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(p.id)}
                    className="bg-red-600 hover:bg-red-700 transition-colors duration-200"
                  >
                    <X className="h-4 w-4 ml-2" /> رفض
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApproveProvidersPage;