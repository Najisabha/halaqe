import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

function TransferProviderPage({ currentUser, setView }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [note, setNote] = useState("");
  const [recentRecipients, setRecentRecipients] = useState([]);
  const [transactions, setTransactions] = useState({
    sent: [],
    received: [],
    all: [],
    balance: 0,
    summary: { sentTotal: 0, receivedTotal: 0, count: 0 },
  });
  const [expanded, setExpanded] = useState({
    sent: false,
    received: false,
    all: false,
  });
  const [loading, setLoading] = useState(false);

  // 🟢 Fetch transactions
  const fetchTransactions = async () => {
    try {
      const api = import.meta.env.VITE_API_URL;

      const res = await axios.get(
       `${api}/api/provider/wallet/transactions`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const { transactions: all = [], balance = 0, summary = {} } = res.data;

      const sent = all.filter((t) => t.direction === "sent" && t.status === "succeeded");
      const received = all.filter((t) => t.direction === "received" && t.status === "succeeded");
      const completed = all.filter((t) => t.status === "succeeded");

      setTransactions({
        sent,
        received,
        all: completed,
        balance,
        summary,
      });

      // 🟢 Collect unique recent recipients
      const uniqueMap = {};
      sent
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach((t) => {
          const rid = t.toUser?.id;
          if (rid && rid !== currentUser.id && !uniqueMap[rid]) {
            uniqueMap[rid] = {
              id: rid,
              name: `${t.toUser.firstname} ${t.toUser.lastname}`.trim(),
            };
          }
        });
      setRecentRecipients(Object.values(uniqueMap));
    } catch (err) {
      console.error("Fetch transactions error:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 🟢 Copy account ID
  const handleCopyAccountId = () => {
    navigator.clipboard.writeText(currentUser.id);
    toast({
      title: "تم نسخ رقم الحساب",
      description: "تم نسخ رقم الحساب الافتراضي إلى الحافظة",
    });
  };

  // 🟢 Confirm transfer
  const handleTransfer = async () => {
    const trimmedAmount = amount.toString().trim();
    const trimmedRecipient = recipientId.toString().trim();

    if (!trimmedAmount || !trimmedRecipient) {
      return toast({
        title: "خطأ في التحويل",
        description: "يرجى تعبئة جميع الحقول المطلوبة",
        variant: "destructive",
      });
    }

    if (trimmedRecipient === currentUser.id) {
      return toast({
        title: "خطأ",
        description: "لا يمكنك إرسال الأموال لنفسك",
        variant: "destructive",
      });
    }

    const numericAmount = parseFloat(trimmedAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return toast({
        title: "مبلغ غير صالح",
        description: "يرجى إدخال مبلغ صالح أكبر من صفر",
        variant: "destructive",
      });
    }

    if (numericAmount > transactions.balance) {
      return toast({
        title: "رصيد غير كافي",
        description: "المبلغ المطلوب أكبر من رصيدك الحالي",
        variant: "destructive",
      });
    }

    setLoading(true);

    try {
      const api = import.meta.env.VITE_API_URL;

      
      const res = await axios.post(
        `${api}/api/provider/wallet/send`,
        {
          recipientId: trimmedRecipient,
          amount: numericAmount,
          note: note.trim(),
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (res.data?.status === "succeeded") {
        toast({
          title: "تم التحويل بنجاح",
          description: `تم تحويل ${numericAmount} ₪ إلى ${res.data.receiver?.firstname || ""
            } ${res.data.receiver?.lastname || ""}`,
        });

        setAmount("");
        setRecipientId("");
        setNote("");
        setStep(1);
      } else {
        toast({
          title: "فشل التحويل",
          description: res.data?.message || "حدث خطأ أثناء التحويل",
          variant: "destructive",
        });
      }

      fetchTransactions();
      setView("transfer");
    } catch (err) {
      toast({
        title: "فشل التحويل",
        description:
          err.response?.data?.message || "حدث خطأ أثناء التحويل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Render status
  const renderStatus = (status) => {
    switch (status) {
      case "succeeded":
        return <span className="text-green-600">مكتمل</span>;
      case "pending":
        return <span className="text-yellow-500">معلق</span>;
      case "failed":
        return <span className="text-red-600">فشل</span>;
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  // 🟢 Render transaction list
  const renderList = (list, type) => {
    const showAll = expanded[type];
    const data = showAll ? list : list.slice(0, 5);

    return (
      <>
        {data.length === 0 ? (
          <p className="text-sm text-gray-500">لا يوجد</p>
        ) : (
          data.map((t, i) => (
            <div
              key={i}
              className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg"
            >
              <div>
                {type === "sent" && (
                  <p className="font-semibold">
                    إلى: {t.toUser?.firstname} {t.toUser?.lastname}
                  </p>
                )}
                {type === "received" && (
                  <p className="font-semibold">
                    من: {t.fromUser?.firstname} {t.fromUser?.lastname}
                  </p>
                )}
                {type === "all" && (
                  <p className="font-semibold">
                    {t.fromUser?.firstname} {t.fromUser?.lastname} →{" "}
                    {t.toUser?.firstname} {t.toUser?.lastname}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                {type === "sent" && (
                  <p className="font-bold text-red-500">- {t.amount} ₪</p>
                )}
                {type === "received" && (
                  <p className="font-bold text-green-500">
                    + {t.amount} ₪
                  </p>
                )}
                {type === "all" && (
                  <p
                    className={`font-bold ${
                      t.direction === "sent"
                        ? "text-red-500"
                        : t.direction === "received"
                        ? "text-green-500"
                        : ""
                    }`}
                  >
                    {t.direction === "sent" ? "-" : "+"} {t.amount} ₪
                  </p>
                )}
                {renderStatus(t.status)}
              </div>
            </div>
          ))
        )}
        {list.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-blue-600"
            onClick={() =>
              setExpanded({ ...expanded, [type]: !showAll })
            }
          >
            {showAll ? "إخفاء" : "عرض الكل"}
          </Button>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        <h2 className="text-2xl font-bold mb-8">محفظتك المالية</h2>

        {/* 🟢 Balance */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg p-6 mb-8 flex justify-between items-center"
        >
          <div>
            <p className="text-lg">رصيدك الحالي</p>
            <p className="text-4xl font-bold">{transactions.balance} ₪</p>
            <p className="text-sm opacity-90 mt-2">
              {`إجمالي المرسلة: ${transactions.summary.sentTotal} ₪ | إجمالي المستلمة: ${transactions.summary.receivedTotal} ₪`}
            </p>
          </div>
          <Wallet className="h-12 w-12 opacity-80" />
        </motion.div>

        {/* 🟢 Account ID */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">رقم حسابك الافتراضي</h3>
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <span className="font-mono text-lg">{currentUser.id}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAccountId}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" /> نسخ
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 🟢 Transfer Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {step === 1 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block mb-2 font-semibold">المبلغ</label>
                    <input
                      type="number"
                      className="w-full p-3 border rounded-lg"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">المستفيد</label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg"
                      placeholder="رقم الحساب أو الاسم"
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">ملاحظات</label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg"
                      placeholder="اختياري"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => setStep(2)}
                    disabled={!amount || !recipientId}
                  >
                    متابعة
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold mb-6">تأكيد التحويل</h3>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span>المبلغ</span>
                      <span className="font-semibold">{amount} ₪</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المستفيد</span>
                      <span className="font-semibold">{recipientId}</span>
                    </div>
                    {note && (
                      <div className="pt-2">
                        <p className="text-sm text-gray-600">ملاحظات: {note}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      تعديل
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleTransfer}
                      disabled={loading}
                    >
                      {loading ? "جارٍ التحويل..." : "تأكيد التحويل"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* 🟢 Sidebar */}
          <div className="space-y-6">
            {/* Recent Recipients */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">المستفيدون السابقون</h3>
              {recentRecipients.length === 0 ? (
                <p className="text-sm text-gray-500">لا يوجد مستفيدون</p>
              ) : (
                recentRecipients.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setRecipientId(r.id)}
                    className="block w-full text-right p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-sm text-gray-500">{r.id}</p>
                  </button>
                ))
              )}
            </div>

            {/* Sent */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">التحويلات المرسلة</h3>
              {renderList(transactions.sent, "sent")}
            </div>

            {/* Received */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">التحويلات المستلمة</h3>
              {renderList(transactions.received, "received")}
            </div>

            {/* All */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">كل التحويلات</h3>
              {renderList(transactions.all, "all")}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default TransferProviderPage;
