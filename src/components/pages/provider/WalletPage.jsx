import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  X,
} from "lucide-react";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// ----------------- UI Components -----------------
const Button = ({ children, className = "", variant = "default", ...props }) => {
  const base =
    "px-4 py-2 rounded-lg font-medium transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700",
    ghost: "bg-transparent text-blue-600 hover:bg-gray-100",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const Toasts = ({ toasts, remove }) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`px-4 py-2 rounded shadow text-white ${
          t.type === "error"
            ? "bg-red-500"
            : t.type === "success"
            ? "bg-green-500"
            : "bg-gray-700"
        }`}
      >
        <div className="flex justify-between items-center gap-4">
          <span>{t.msg}</span>
          <button onClick={() => remove(t.id)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    ))}
  </div>
);

const Dialog = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

// ----------------- Top-Up Form -----------------
const TopUpForm = ({ showToast }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (loading || !amount || Number(amount) <= 0) return;

    try {
      setLoading(true);
      const api = import.meta.env.VITE_API_URL;


      // Request backend to create Stripe Checkout session
      const res = await axios.post(
        `${api}/api/provider/wallet/topup`,
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const { sessionUrl } = res.data; // return full Stripe URL
      console.log(sessionUrl)
      if (!sessionUrl) return showToast("❌ فشل إنشاء عملية الدفع", "error");

      // Redirect immediately to Stripe Checkout
      window.location.href = sessionUrl;
    } catch (err) {
      console.error(err);
      showToast("❌ خطأ في الدفع", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleTopUp} className="space-y-4">
      <Input
        type="number"
        placeholder="المبلغ"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        min="1"
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "إيداع الآن"}
      </Button>
    </form>
  );
};

// ----------------- Wallet Page -----------------
function WalletProviderPage({ currentUser }) {
  const [balance, setBalance] = useState(currentUser.balance || 0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openTopup, setOpenTopup] = useState(false);
  const [openSend, setOpenSend] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [toasts, setToasts] = useState([]);

  const showToast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchTransactions = async () => {
    try {
      const api = import.meta.env.VITE_API_URL;

    
      const res = await axios.get(
      `${api}/api/provider/wallet/transactions`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.status === 200) {
        setTransactions(res.data.transactions || []);
        setBalance(res.data.balance ?? balance);
      }
    } catch (err) {
      console.error("❌ Failed to fetch transactions:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();

    // Refresh wallet after successful Stripe payment
    if (window.location.search.includes("payment_success")) {
      fetchTransactions();
      showToast("✅ تم إضافة الرصيد بنجاح", "success");
      const params = new URLSearchParams(window.location.search);
      params.delete("payment_success");
      window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
    }
  }, []);

  const handleSendMoney = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!amount || !recipient) {
      showToast("❌ الرجاء تعبئة جميع الحقول", "error");
      return;
    }

    if (Number(amount) > balance) {
      showToast("❌ الرصيد غير كافي", "error");
      return;
    }

    try {
      setLoading(true);
      const api = import.meta.env.VITE_API_URL;

    
      const res = await axios.post(
        `${api}/api/provider/wallet/send`,
        { recipientId: recipient, amount: Number(amount) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.status === 200) {
        showToast(`✅ تم تحويل ${amount} شيكل`, "success");
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
      } else {
        showToast(res.data.message || "❌ فشل التحويل", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("❌ خطأ في التحويل", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toasts
        toasts={toasts}
        remove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-2xl font-bold mb-8">المحفظة</h2>

        {/* Balance */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600">الرصيد الحالي</p>
              <h3 className="text-4xl font-extrabold text-blue-600">{balance} شيكل</h3>
            </div>
            <Wallet className="h-14 w-14 text-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => setOpenTopup(true)} className="flex gap-2">
              <CreditCard className="h-5 w-5" /> إيداع رصيد
            </Button>
            <Button
              disabled={loading}
              variant="outline"
              onClick={() => setOpenSend(true)}
              className="flex gap-2"
            >
              <ArrowUpRight className="h-5 w-5" /> تحويل أموال
            </Button>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-xl font-bold mb-4">المعاملات الأخيرة</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500">لا توجد معاملات بعد</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-full ${
                        t.type === "wallet_topup" ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {t.type === "wallet_topup" ? (
                        <ArrowDownLeft className="h-6 w-6 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {t.type === "wallet_topup"
                          ? "إيداع رصيد"
                          : `تحويل إلى ${t.metadata?.recipientName || "مستخدم"}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(t.createdAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      t.type === "wallet_topup" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "wallet_topup" ? "+" : "-"}
                    {t.amount} شيكل
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Top-up Dialog */}
      <Dialog open={openTopup} onClose={() => setOpenTopup(false)}>
        <h2 className="text-xl font-bold mb-4">إيداع رصيد</h2>
        <TopUpForm showToast={showToast} />
      </Dialog>

      {/* Send Money Dialog */}
      <Dialog open={openSend} onClose={() => setOpenSend(false)}>
        <h2 className="text-xl font-bold mb-4">تحويل أموال</h2>
        <form onSubmit={handleSendMoney} className="space-y-4">
          <Input
            placeholder="معرّف المستلم"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
          <Input
            type="number"
            placeholder="المبلغ"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "إرسال"}
          </Button>
        </form>
      </Dialog>
    </div>
  );
}

export default WalletProviderPage;
