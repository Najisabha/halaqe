import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, Check, X, DownloadCloud, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { debounce } from "lodash";

// API helper
const apiFetch = async (url, { method = "GET", body } = {}) => {
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
};

// Constants
const STATUS_COLORS = {
  pending: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  succeeded: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

// Withdrawal Card Component
const WithdrawalCard = React.memo(({ withdrawal, onProcess, onMarkPaid, onMarkFailed }) => {
  const bankInfo = useMemo(() => {
    try {
      return JSON.parse(withdrawal.bankInfo)?.bankInfo || {};
    } catch {
      return {};
    }
  }, [withdrawal.bankInfo]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-lg shadow border border-gray-200"
      role="region"
      aria-labelledby={`withdrawal-${withdrawal.id}`}
    >
      <h3 id={`withdrawal-${withdrawal.id}`} className="font-semibold text-lg">
        {withdrawal.barber.firstname} {withdrawal.barber.lastname}
      </h3>
      <p className="text-sm text-gray-600">{withdrawal.barber.email}</p>
      <p className="text-sm mt-2">
        <DollarSign className="inline h-4 w-4 mr-1" />
        المبلغ: {withdrawal.amount} ₪
      </p>
      <p className="text-sm">
        الحالة: <Badge className={STATUS_COLORS[withdrawal.status]}>{withdrawal.status}</Badge>
      </p>
      <p className="text-sm">التاريخ: {new Date(withdrawal.createdAt).toLocaleDateString("ar-EG")}</p>
      <p className="text-sm">المزود: {withdrawal.provider}</p>
      {withdrawal.note && <p className="text-sm">ملاحظة: {withdrawal.note}</p>}

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="mt-2">
            <Info className="h-4 w-4 mr-1" /> تفاصيل البنك
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل الحساب البنكي</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p>البنك: {bankInfo.bankName || "غير متوفر"}</p>
            <p>رقم الحساب: {bankInfo.accountNumber || "غير متوفر"}</p>
            <p>اسم الحساب: {bankInfo.accountHolder || "غير متوفر"}</p>
            <p>الفرع: {bankInfo.branch || "غير متوفر"}</p>
            <p>IBAN: {bankInfo.iban || "غير متوفر"}</p>
            <p>SWIFT: {bankInfo.swift || "غير متوفر"}</p>
            <p>رقم الهاتف: {bankInfo.phone || "غير متوفر"}</p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end gap-2 mt-3">
        {withdrawal.status === "pending" && (
          <>
            <Button size="sm" onClick={() => onProcess(withdrawal.id)} aria-label="معالجة السحب">
              معالجة
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (window.confirm("هل أنت متأكد من رفض السحب؟")) {
                  onMarkFailed(withdrawal.id);
                }
              }}
              aria-label="رفض السحب"
            >
              رفض
            </Button>
            <Button
              size="sm"
              variant="success"
              onClick={() => {
                if (window.confirm("هل أنت متأكد من تأكيد الدفع؟")) {
                  onMarkPaid(withdrawal.id);
                }
              }}
              aria-label="تأكيد الدفع"
            >
              تم الدفع
            </Button>
          </>
        )}
        {withdrawal.status === "processing" && (
          <>
            <Button
              size="sm"
              variant="success"
              onClick={() => {
                if (window.confirm("هل أنت متأكد من تأكيد الدفع؟")) {
                  onMarkPaid(withdrawal.id);
                }
              }}
              aria-label="تأكيد الدفع"
            >
              تم الدفع
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (window.confirm("هل أنت متأكد من رفض السحب؟")) {
                  onMarkFailed(withdrawal.id);
                }
              }}
              aria-label="رفض السحب"
            >
              رفض
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
});

// Filter Bar Component
const FilterBar = ({ statusFilter, setStatusFilter, onExportCSV }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
    <div className="flex gap-2">
      {["pending", "processing", "succeeded"].map((status) => (
        <Button
          key={status}
          onClick={() => setStatusFilter(status)}
          className={statusFilter === status ? `bg-blue-500 text-white` : "bg-gray-200"}
          aria-pressed={statusFilter === status}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Button>
      ))}
    </div>
    <Button onClick={onExportCSV} variant="outline" className="flex items-center gap-2">
      <DownloadCloud className="h-4 w-4" /> تصدير CSV
    </Button>
  </div>
);

// Main Component
const WithdrawalsPage = () => {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");

  const loadWithdrawals = useCallback(
    debounce(async (filter) => {
      try {
        setLoading(true);
        const data = await apiFetch(`/api/admin/withdrawals?status=${filter}`);
        setWithdrawals(data);
      } catch (err) {
        toast({ title: "خطأ", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }, 300),
    [toast]
  );

  useEffect(() => {
    loadWithdrawals(statusFilter);
  }, [statusFilter, loadWithdrawals]);

  const handleProcess = useCallback(
    async (id, provider = "manual") => {
      try {
        await apiFetch(`/api/admin/withdrawals/${id}/process`, { method: "POST", body: { provider } });
        toast({ title: "تمت معالجة السحب" });
        loadWithdrawals(statusFilter);
      } catch (err) {
        toast({ title: "خطأ", description: err.message, variant: "destructive" });
      }
    },
    [toast, statusFilter, loadWithdrawals]
  );

  const handleMarkPaid = useCallback(
    async (id) => {
      try {
        await apiFetch(`/api/admin/withdrawals/${id}/mark-paid`, { method: "POST", body: {} });
        toast({ title: "تم تأكيد الدفع" });
        loadWithdrawals(statusFilter);
      } catch (err) {
        toast({ title: "خطأ", description: err.message, variant: "destructive" });
      }
    },
    [toast, statusFilter, loadWithdrawals]
  );

  const handleMarkFailed = useCallback(
    async (id, reason = "unknown") => {
      try {
        await apiFetch(`/api/admin/withdrawals/${id}/mark-failed`, { method: "POST", body: { reason } });
        toast({ title: "تم رفض السحب" });
        loadWithdrawals(statusFilter);
      } catch (err) {
        toast({ title: "خطأ", description: err.message, variant: "destructive" });
      }
    },
    [toast, statusFilter, loadWithdrawals]
  );

  const handleExportCSV = useCallback(async () => {
    try {
      const res = await fetch(`${api}/api/admin/withdrawals/export?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `withdrawals_${statusFilter}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast({ title: "تم تصدير الملف" });
    } catch (err) {
      toast({ title: "خطأ", description: "فشل التصدير", variant: "destructive" });
    }
  }, [statusFilter, toast]);

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen bg-gray-50">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-6 text-center"
      >
        إدارة السحوبات
      </motion.h1>

      <FilterBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onExportCSV={handleExportCSV}
      />

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">جاري تحميل البيانات...</p>
        </div>
      ) : withdrawals.length === 0 ? (
        <p className="text-center py-20 text-gray-500">لا توجد سحوبات</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withdrawals.map((withdrawal) => (
            <WithdrawalCard
              key={withdrawal.id}
              withdrawal={withdrawal}
              onProcess={handleProcess}
              onMarkPaid={handleMarkPaid}
              onMarkFailed={handleMarkFailed}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WithdrawalsPage;