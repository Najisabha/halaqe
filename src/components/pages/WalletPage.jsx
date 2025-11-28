import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Loader2, X, Info } from "lucide-react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// ----------------- UI Components -----------------
const Button = ({ children, className = "", variant = "default", ...props }) => {
  const base =
    "px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:scale-[1.02] active:scale-[0.98]";
  const variants = {
    default: "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "bg-transparent text-blue-600 hover:bg-blue-50",
  };
  return (
    <motion.button
      className={`${base} ${variants[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

const Input = ({ className = "", label, id, error, tooltip, ...props }) => (
  <div className="space-y-1 relative">
    {label && (
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {tooltip && (
          <span className="group relative">
            <Info className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span className="absolute hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              {tooltip}
            </span>
          </span>
        )}
      </div>
    )}
    <input
      id={id}
      className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 transition-colors duration-200 ${error ? "border-red-500" : "border-gray-300"} ${className}`}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
    {error && (
      <p className="text-sm text-red-600" id={`${id}-error`}>
        {error}
      </p>
    )}
  </div>
);

const Toasts = ({ toasts, remove }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2 max-w-xs">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className={`px-4 py-2 rounded-lg shadow text-white flex items-center gap-3 text-sm font-medium ${t.type === "error" ? "bg-red-600" : t.type === "success" ? "bg-green-600" : "bg-gray-700"}`}
        >
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => remove(t.id)} aria-label="إغلاق الإشعار">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

const Dialog = ({ open, onClose, children, title }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
        role="dialog"
        aria-labelledby="dialog-title"
        ref={dialogRef}
        tabIndex={-1}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>
        {title && (
          <h2 id="dialog-title" className="text-xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
};

// ----------------- Top-Up Form -----------------
const TopUpForm = ({ showToast, onClose }) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("visa"); // 'visa' or 'provider'
  const [providerId, setProviderId] = useState("");
  const [message, setMessage] = useState("");
  const [benefit, setBenefit] = useState(null);
  const [finalAmount, setFinalAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ amount: "", providerId: "" });
  const api = import.meta.env.VITE_API_URL;

  const fetchBenefit = useCallback(async () => {
    try {
      const res = await axios.get(`${api}/api/user/benfits`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBenefit(res.data.benfitsporvider || 0);
    } catch (err) {
      console.error("❌ Failed to fetch benefit:", err);
      showToast("❌ خطأ في جلب قيمة الخصم", "error");
      setBenefit(0);
    }
  }, [showToast]);

  useEffect(() => {
    if (method === "provider") {
      fetchBenefit();
    } else {
      setProviderId("");
      setMessage("");
      setErrors((prev) => ({ ...prev, providerId: "" }));
      setBenefit(null);
      setFinalAmount(null);
    }
  }, [method, fetchBenefit]);

  useEffect(() => {
    if (method === "provider" && amount && benefit !== null) {
      const calculatedFinal = Number(amount) - (benefit || 0);
      setFinalAmount(calculatedFinal < 0 ? 0 : calculatedFinal);
    } else {
      setFinalAmount(null);
    }
  }, [amount, benefit, method]);

  const validateForm = useCallback(() => {
    const newErrors = { amount: "", providerId: "" };
    let isValid = true;

    if (!amount || Number(amount) <= 0) {
      newErrors.amount = "الرجاء إدخال مبلغ صالح (أكبر من 0)";
      isValid = false;
    }
    if (method === "provider" && !providerId) {
      newErrors.providerId = "الرجاء إدخال معرّف مقدم الخدمة";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [amount, method, providerId]);

  const handleTopUp = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading || !validateForm()) return;

      try {
        setLoading(true);
        if (method === "visa") {

          const res = await axios.post(
            `${api}/api/user/wallet/create-checkout-session`,
            { amount: Number(amount), type: "wallet_topup" },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );

          const { sessionUrl } = res.data;
          if (sessionUrl) {
            window.location.href = sessionUrl;
          } else {
            showToast("❌ فشل إنشاء جلسة الدفع", "error");
          }
        } else {
          const res = await axios.post(
            `${api}/api/user/wallet/create-checkout-session`,
            { amount: Number(amount), providerId, message, type: "provider_charge" },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );

          if (res.status === 200) {
            const { originalAmount, finalAmount } = res.data;
            showToast(
              `✅ تم إرسال طلب الشحن بقيمة ${finalAmount}₪ (الأصلي: ${originalAmount}₪) بنجاح`,
              "success"
            );
            setAmount("");
            setProviderId("");
            setMessage("");
            setErrors({ amount: "", providerId: "" });
            setFinalAmount(null);
            onClose();
          } else {
            showToast(res.data.message || "❌ فشل إرسال طلب الشحن", "error");
          }
        }
      } catch (err) {
        console.error("❌ Top-up error:", err);
        const errorMessage = err.response?.data?.message || "❌ خطأ في عملية الدفع";
        showToast(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    },
    [amount, providerId, message, method, loading, showToast, onClose]
  );

  return (
    <form onSubmit={handleTopUp} className="space-y-5">
      {/* Payment Method Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-xl">
        <motion.button
          type="button"
          className={`py-2.5 rounded-lg font-medium transition-all duration-200 ${method === "visa" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
          onClick={() => setMethod("visa")}
          aria-pressed={method === "visa"}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          فيزا
        </motion.button>
        <motion.button
          type="button"
          className={`py-2.5 rounded-lg font-medium transition-all duration-200 ${method === "provider" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
          onClick={() => setMethod("provider")}
          aria-pressed={method === "provider"}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          مقدم الخدمة
        </motion.button>
      </div>

      {/* Amount Input */}
      <Input
        id="amount"
        type="number"
        label="المبلغ (شيكل)"
        placeholder="أدخل المبلغ"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        min="1"
        error={errors.amount}
        disabled={loading}
        tooltip="أدخل المبلغ المراد شحنه في المحفظة"
      />

      {/* Benefit and Final Amount Display */}
      <AnimatePresence>
        {method === "provider" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {benefit !== null && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-700">
                <p className="font-medium">خصم الإدارة: <span className="font-bold">{benefit} شيكل</span></p>
                {finalAmount !== null && (
                  <p className="font-medium">
                    المبلغ النهائي بعد الخصم: <span className="font-bold text-blue-600">{finalAmount} شيكل</span>
                  </p>
                )}
              </div>
            )}
            <Input
              id="providerId"
              label="معرّف مقدم الخدمة"
              placeholder="أدخل معرّف مقدم الخدمة"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              required
              error={errors.providerId}
              disabled={loading}
              tooltip="معرّف مقدم الخدمة هو الرقم التعريفي الخاص به"
            />
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                رسالة (اختياري)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="أدخل رسالة لمقدم الخدمة (اختياري)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 transition-colors"
                rows={3}
                disabled={loading}
                aria-describedby="message-hint"
              />
              <p id="message-hint" className="text-xs text-gray-500 mt-1">
                يمكنك إضافة ملاحظات إضافية لمقدم الخدمة
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <Button type="submit" disabled={loading} className="w-full text-base">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "إيداع الآن"}
      </Button>
    </form>
  );
};

// ----------------- Wallet Page -----------------
function WalletPage({ currentUser }) {
  const [balance, setBalance] = useState(currentUser.balance || 0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openTopup, setOpenTopup] = useState(false);
  const [openSend, setOpenSend] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [toasts, setToasts] = useState([]);
  const [errors, setErrors] = useState({ recipient: "", amount: "" });

  const showToast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await axios.get(`${api}/api/user/wallet/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.status === 200) {
        setTransactions(res.data.transactions || []);
        setBalance(res.data.balance ?? balance);
      }
    } catch (err) {
      console.error("❌ Failed to fetch transactions:", err);
      showToast("❌ خطأ في جلب المعاملات", "error");
    }
  }, [balance, showToast]);

  useEffect(() => {
    fetchTransactions();

    const params = new URLSearchParams(window.location.search);
    if (params.has("payment_success")) {
      fetchTransactions();
      showToast("✅ تم إضافة الرصيد بنجاح", "success");
      params.delete("payment_success");
      window.history.replaceState({}, "", `${window.location.pathname}`);
    } else if (params.has("payment_canceled")) {
      showToast("❌ تم إلغاء عملية الدفع", "error");
      params.delete("payment_canceled");
      window.history.replaceState({}, "", `${window.location.pathname}`);
    }
  }, [fetchTransactions, showToast]);

  const validateSendMoney = useCallback(() => {
    const newErrors = { recipient: "", amount: "" };
    let isValid = true;

    if (!recipient) {
      newErrors.recipient = "الرجاء إدخال معرّف المستلم";
      isValid = false;
    }
    if (!amount || Number(amount) <= 0) {
      newErrors.amount = "الرجاء إدخال مبلغ صالح";
      isValid = false;
    } else if (Number(amount) > balance) {
      newErrors.amount = "الرصيد غير كافي";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [recipient, amount, balance]);

  const handleSendMoney = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading || !validateSendMoney()) return;

      try {
        setLoading(true);
        const res = await axios.post(
          `${api}/api/user/wallet/send-money`,
          { recipientId: recipient, amount: Number(amount) },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        if (res.status === 200) {
          showToast(`✅ تم تحويل ${amount} شيكل بنجاح`, "success");
          setBalance((prev) => prev - Number(amount));
          setTransactions((prev) => [
            {
              id: Date.now(),
              type: "send_money",
              amount: Number(amount),
              createdAt: new Date().toISOString(),
              metadata: { recipientName: recipient },
            },
            ...prev,
          ]);
          setOpenSend(false);
          setRecipient("");
          setAmount("");
          setErrors({ recipient: "", amount: "" });
        } else {
          showToast(res.data.message || "❌ فشل التحويل", "error");
        }
      } catch (err) {
        console.error("❌ Send money error:", err);
        const errorMessage = err.response?.data?.message || "❌ خطأ في التحويل";
        showToast(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    },
    [recipient, amount, loading, balance, showToast]
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Toasts toasts={toasts} remove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">المحفظة</h2>

        {/* Balance Section */}
        <motion.div
          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6"
          whileHover={{ boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <Wallet className="h-12 w-12 text-blue-600" aria-hidden="true" />
            <div>
              <p className="text-gray-600 text-sm font-medium">الرصيد الحالي</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-blue-600 tracking-tight">
                {balance} شيكل
              </h3>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Button
              onClick={() => setOpenTopup(true)}
              className="flex gap-2 w-full text-sm md:text-base"
            >
              <CreditCard className="h-5 w-5" /> إيداع رصيد
            </Button>

          </div>
        </motion.div>

        {/* Transactions Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 tracking-tight">
            المعاملات الأخيرة
          </h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-sm md:text-base">
              لا توجد معاملات بعد
            </p>
          ) : (
            <ul className="space-y-3" role="list">
              {transactions.map((t) => (
                <motion.li
                  key={t.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  role="listitem"
                  whileHover={{ scale: 1.01 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2.5 rounded-full ${
                        t.type === "wallet_topup" || t.type === "provider_charge"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      {t.type === "wallet_topup" || t.type === "provider_charge" ? (
                        <ArrowDownLeft className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base">
                        {t.type === "wallet_topup" ? (
                          "إيداع رصيد (فيزا)"
                        ) : t.type === "provider_charge" ? (
                          <>
                            إيداع رصيد (مقدم الخدمة)
                            {t.metadata?.originalAmount && t.metadata?.benefitDiscount ? (
                              <span className="text-xs text-gray-500 block">
                                الأصلي: {t.metadata.originalAmount}₪, خصم: {t.metadata.benefitDiscount}₪
                              </span>
                            ) : null}
                          </>
                        ) : (
                          `تحويل إلى ${t.toUser?.firstname || "مستخدم"} ${t.toUser?.lastname || "مستخدم"}`
                        )}
                        {console.log(t.toUser)}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        {new Date(t.createdAt).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold text-sm md:text-base ${
                      t.type === "wallet_topup" || t.type === "provider_charge"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {t.type === "wallet_topup" || t.type === "provider_charge" ? "+" : "-"}
                    {t.amount} شيكل
                  </p>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>

      {/* Top-up Dialog */}
      <Dialog open={openTopup} onClose={() => setOpenTopup(false)} title="إيداع رصيد">
        <TopUpForm showToast={showToast} onClose={() => setOpenTopup(false)} />
      </Dialog>

      
    </div>
  );
}

export default WalletPage;
