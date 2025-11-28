import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Loader2, Download } from "lucide-react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

function ProviderRequests({ currentUser, currentView, setCurrentView, setIsLoggedIn }) {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState({});
  const api = import.meta.env.VITE_API_URL;

  // 🟢 Fetch pending and all requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const pendingResponse = await axios.get(`${api}/api/provider/requests`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setRequests(pendingResponse.data.request || []);

        const allResponse = await axios.get(`${api}/api/provider/requests/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setAllRequests(allResponse.data.requests || []);
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل في جلب طلبات الأموال",
          variant: "destructive",
        });
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          setIsLoggedIn(false);
          setCurrentView("login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [toast, setIsLoggedIn, setCurrentView]);

  // 🟢 Handle approve request
  const handleApprove = async (requestId, recipientId, userName, amount, currency) => {
    const result = await Swal.fire({
      title: "تأكيد الموافقة",
      html: `<p>هل أنت متأكد من الموافقة على طلب ${amount} ${currency} لـ ${userName}؟</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "موافقة",
      cancelButtonText: "إلغاء",
      customClass: {
        confirmButton: "bg-green-600 text-white px-3 py-1.5 rounded-md mx-1 font-medium",
        cancelButton: "bg-gray-500 text-white px-3 py-1.5 rounded-md mx-1 font-medium",
      },
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const response = await axios.patch(
        `${api}/api/provider/requests/approve`,
        { requestId, recipientId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const { message } = response.data;
      await Swal.fire({
        icon: "success",
        title: "نجاح",
        text: message,
        confirmButtonText: "حسناً",
        customClass: { confirmButton: "bg-green-600 text-white px-3 py-1.5 rounded-md font-medium" },
      });

      setRequests((prev) => prev.filter((req) => req._id !== requestId));
      const allResponse = await axios.get(`${api}/api/provider/requests/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAllRequests(allResponse.data.requests || []);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "فشل في الموافقة على الطلب",
        confirmButtonText: "حسناً",
        customClass: { confirmButton: "bg-green-600 text-white px-3 py-1.5 rounded-md font-medium" },
      });

      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        setIsLoggedIn(false);
        setCurrentView("login");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Handle reject request
  const handleReject = async (requestId, recipientId, userName, amount, currency) => {
    const reason = rejectionReason[requestId] || "";
    const result = await Swal.fire({
      title: "تأكيد الرفض",
      html: `<p>هل أنت متأكد من رفض طلب ${amount} ${currency} لـ ${userName}؟</p>
             <p class="text-sm text-gray-500 mt-1">سبب الرفض: ${reason || "غير محدد"}</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "رفض",
      cancelButtonText: "إلغاء",
      customClass: {
        confirmButton: "bg-red-600 text-white px-3 py-1.5 rounded-md mx-1 font-medium",
        cancelButton: "bg-gray-500 text-white px-3 py-1.5 rounded-md mx-1 font-medium",
      },
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      const response = await axios.patch(
        `${api}/api/provider/requests/reject`,
        { requestId, recipientId, reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const { message } = response.data;
      await Swal.fire({
        icon: "success",
        title: "نجاح",
        text: message,
        confirmButtonText: "حسناً",
        customClass: { confirmButton: "bg-green-600 text-white px-3 py-1.5 rounded-md font-medium" },
      });

      setRequests((prev) => prev.filter((req) => req._id !== requestId));
      setRejectionReason((prev) => {
        const newReasons = { ...prev };
        delete newReasons[requestId];
        return newReasons;
      });


        
      const allResponse = await axios.get(`${api}/api/provider/requests/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAllRequests(allResponse.data.requests || []);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.response?.data?.message || "فشل في رفض الطلب",
        confirmButtonText: "حسناً",
        customClass: { confirmButton: "bg-green-600 text-white px-3 py-1.5 rounded-md font-medium" },
      });

      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        setIsLoggedIn(false);
        setCurrentView("login");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Export requests to CSV
  const exportToCSV = async () => {
    const result = await Swal.fire({
      title: "تصدير الطلبات",
      text: "هل تريد تصدير جميع الطلبات إلى ملف CSV؟",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "تصدير",
      cancelButtonText: "إلغاء",
      customClass: {
        confirmButton: "bg-green-600 text-white px-3 py-1.5 rounded-md mx-1 font-medium",
        cancelButton: "bg-gray-500 text-white px-3 py-1.5 rounded-md mx-1 font-medium",
      },
    });

    if (!result.isConfirmed) return;

    // 🟢 Dynamically generate headers from all possible fields
    const sampleRequest = allRequests[0] || {};
    const userFields = sampleRequest.user ? Object.keys(sampleRequest.user).filter(
      (key) => !['password', 'token'].includes(key) // Exclude sensitive fields
    ) : [];
    const requestFields = Object.keys(sampleRequest).filter(
      (key) => key !== 'user' && !key.startsWith('_') // Exclude user object and internal MongoDB fields
    );
    const headers = [
      "Request ID",
      ...userFields.map((field) => `User ${field.charAt(0).toUpperCase() + field.slice(1)}`),
      ...requestFields,
    ];

    // 🟢 Format rows with all fields
    const rows = allRequests.map((request) => {
      const userData = userFields.map((field) => {
        const value = request.user?.[field] || "";
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      const requestData = requestFields.map((field) => {
        let value = request[field];
        if (field.includes('At')) value = value ? new Date(value).toLocaleString() : "";
        if (typeof value === 'string' && value.includes(',')) value = `"${value}"`;
        return value || "";
      });
      return [request._id, ...userData, ...requestData];
    });

    // 🟢 Generate CSV with UTF-8 BOM for Arabic support
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const bom = "\uFEFF"; // UTF-8 BOM for proper Arabic encoding
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `requests_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await Swal.fire({
      icon: "success",
      title: "تم التصدير",
      text: "تم تصدير جميع الطلبات إلى ملف CSV",
      confirmButtonText: "حسناً",
      customClass: { confirmButton: "bg-green-600 text-white px-3 py-1.5 rounded-md font-medium" },
    });
  };

  return (
    <div className="container mx-auto px-4 py-4 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-bold text-gray-800">طلبات الأموال</h1>
        <Button
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium flex items-center gap-1.5 py-1.5 px-2.5 rounded-md transition-colors duration-150"
          disabled={loading || allRequests.length === 0}
          aria-label="تصدير الطلبات إلى CSV"
        >
          <Download className="h-3.5 w-3.5" /> تصدير CSV
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-48 bg-white rounded-md shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" aria-label="جارٍ التحميل" />
        </div>
      )}

      {!loading && requests.length === 0 && (
        <p className="text-center text-gray-500 text-sm font-medium bg-white rounded-md shadow-sm py-5">
          لا توجد طلبات معلقة
        </p>
      )}

      {!loading && requests.length > 0 && (
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          {/* 🟢 Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="text-gray-800 font-bold text-xs py-2.5">اسم المستخدم</TableHead>
                  <TableHead className="text-gray-800 font-bold text-xs py-2.5">البريد الإلكتروني</TableHead>
                  <TableHead className="text-gray-800 font-bold text-xs py-2.5">المبلغ</TableHead>
                  <TableHead className="text-gray-800 font-bold text-xs py-2.5">العملة</TableHead>
                  <TableHead className="text-gray-800 font-bold text-xs py-2.5">الرسالة</TableHead>
                  <TableHead className="text-gray-800 font-bold text-xs py-2.5">سبب الرفض</TableHead>
                  <TableHead className="text-gray-800 font-bold text-xs py-2.5">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow
                    key={request._id}
                    className="hover:bg-gray-50 transition-colors duration-100"
                  >
                    <TableCell className="text-gray-700 text-xs py-2.5">{`${request.user.firstname} ${request.user.lastname}`}</TableCell>
                    <TableCell className="text-gray-700 text-xs py-2.5">{request.user.email}</TableCell>
                    <TableCell className="text-gray-700 text-xs py-2.5">{request.amount}</TableCell>
                    <TableCell className="text-gray-700 text-xs py-2.5">{request.currency}</TableCell>
                    <TableCell className="text-gray-700 text-xs py-2.5">{request.message || "غير متوفر"}</TableCell>
                    <TableCell>
                      <Input
                        placeholder="سبب الرفض (اختياري)"
                        value={rejectionReason[request._id] || ""}
                        onChange={(e) =>
                          setRejectionReason((prev) => ({
                            ...prev,
                            [request._id]: e.target.value,
                          }))
                        }
                        className="border-gray-200 focus:ring-green-600 focus:border-green-600 text-xs h-8"
                        disabled={loading}
                        aria-label={`سبب رفض طلب ${request.user.firstname} ${request.user.lastname}`}
                      />
                    </TableCell>
                    <TableCell className="flex gap-1.5 py-2.5">
                      <Button
                        onClick={() =>
                          handleApprove(
                            request._id,
                            request.user.id,
                            `${request.user.firstname} ${request.user.lastname}`,
                            request.amount,
                            request.currency
                          )
                        }
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1 px-2.5 rounded-md"
                        disabled={loading}
                        aria-label={`الموافقة على طلب ${request.user.firstname} ${request.user.lastname}`}
                      >
                        موافقة
                      </Button>
                      <Button
                        onClick={() =>
                          handleReject(
                            request._id,
                            request.user.id,
                            `${request.user.firstname} ${request.user.lastname}`,
                            request.amount,
                            request.currency
                          )
                        }
                        className="bg-red-600 hover:bg-green-700 text-white text-xs font-medium py-1 px-2.5 rounded-md"
                        disabled={loading}
                        aria-label={`رفض طلب ${request.user.firstname} ${request.user.lastname}`}
                      >
                        رفض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 🟢 Mobile Card Layout */}
          <div className="md:hidden space-y-2 px-1">
            {requests.map((request) => (
              <motion.div
                key={request._id}
                className="bg-white rounded-md shadow-sm p-3 border border-gray-200"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="space-y-1.5">
                  <p className="text-gray-800 font-medium text-xs">
                    <span className="text-gray-500">الاسم:</span> {`${request.user.firstname} ${request.user.lastname}`}
                  </p>
                  <p className="text-gray-700 text-xs">
                    <span className="text-gray-500">البريد:</span> {request.user.email}
                  </p>
                  <p className="text-gray-700 text-xs">
                    <span className="text-gray-500">المبلغ:</span> {request.amount} {request.currency}
                  </p>
                  <p className="text-gray-700 text-xs">
                    <span className="text-gray-500">الرسالة:</span> {request.message || "غير متوفر"}
                  </p>
                  <div>
                    <label className="text-gray-500 text-2xs block mb-0.5">سبب الرفض (اختياري):</label>
                    <Input
                      placeholder="سبب الرفض"
                      value={rejectionReason[request._id] || ""}
                      onChange={(e) =>
                        setRejectionReason((prev) => ({
                          ...prev,
                          [request._id]: e.target.value,
                        }))
                      }
                      className="border-gray-200 focus:ring-green-600 focus:border-green-600 text-xs h-8"
                      disabled={loading}
                      aria-label={`سبب رفض طلب ${request.user.firstname} ${request.user.lastname}`}
                    />
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    <Button
                      onClick={() =>
                        handleApprove(
                          request._id,
                          request.user.id,
                          `${request.user.firstname} ${request.user.lastname}`,
                          request.amount,
                          request.currency
                        )
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1 rounded-md"
                      disabled={loading}
                      aria-label={`الموافقة على طلب ${request.user.firstname} ${request.user.lastname}`}
                    >
                      موافقة
                    </Button>
                    <Button
                      onClick={() =>
                        handleReject(
                          request._id,
                          request.user.id,
                          `${request.user.firstname} ${request.user.lastname}`,
                          request.amount,
                          request.currency
                        )
                      }
                      className="flex-1 bg-red-600 hover:bg-green-700 text-white text-xs font-medium py-1 rounded-md"
                      disabled={loading}
                      aria-label={`رفض طلب ${request.user.firstname} ${request.user.lastname}`}
                    >
                      رفض
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProviderRequests;