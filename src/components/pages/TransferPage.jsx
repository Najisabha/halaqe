import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Wallet, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

// 🔹 Shared API Helper
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

// 🔹 Shared Unauthorized Handler
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

function TransferPage({ currentUser, setIsLoggedIn, setCurrentView }) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientType, setRecipientType] = useState("id"); // New state for recipient input type
  const [fetchedRecipient, setFetchedRecipient] = useState({ id: "", email: "" }); // New state for fetched ID/email
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
  const [fetching, setFetching] = useState(true);
  const [fetchingRecipient, setFetchingRecipient] = useState(false);

  // 🟢 Fetch Recipient Details
  const fetchRecipientDetails = async (idOrEmail) => {
    if (!idOrEmail) return;
    setFetchingRecipient(true);
    try {
      const isEmail = idOrEmail.includes("@");
      const param = isEmail ? `email=${encodeURIComponent(idOrEmail)}` : `userId=${idOrEmail}`;
      const data = await api(
        `/api/user/name?${param}`,
        "GET",
        null,
        toast,
        setIsLoggedIn,
        setCurrentView,
        t
      );
      if (data && data.firstName && data.lastName) {
        setRecipientName(`${data.firstName} ${data.lastName}`.trim());
        setFetchedRecipient({ id: data.id || "", email: data.email || "" });
      } else {
        setRecipientName("");
        setFetchedRecipient({ id: "", email: "" });
        toast({
          title: t("error"),
          description: t("recipient_not_found"),
          variant: "destructive",
        });
      }
    } catch (err) {
      setRecipientName("");
      setFetchedRecipient({ id: "", email: "" });
      toast({
        title: t("error"),
        description: t("failed_to_fetch_recipient", { message: err.message }),
        variant: "destructive",
      });
    } finally {
      setFetchingRecipient(false);
    }
  };

  // 🟢 Fetch Transactions
  const fetchTransactions = async () => {
    setFetching(true);
    try {
      const data = await api(
        "/api/user/wallet/transactions",
        "GET",
        null,
        toast,
        setIsLoggedIn,
        setCurrentView,
        t
      );
      if (!data) return;

      const { transactions: all = [], balance = 0, summary = {} } = data;

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
      toast({
        title: t("error"),
        description: t("failed_to_fetch_transactions", { message: err.message }),
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang) i18n.changeLanguage(savedLang);
    fetchTransactions();
  }, [i18n, toast, setIsLoggedIn, setCurrentView]);

  // 🟢 Handle Recipient Input Change
  useEffect(() => {
    const timeout = setTimeout(() => {
      if ((recipientType === "id" && recipientId) || (recipientType === "email" && recipientEmail)) {
        fetchRecipientDetails(recipientType === "id" ? recipientId : recipientEmail);
      } else {
        setRecipientName("");
        setFetchedRecipient({ id: "", email: "" });
      }
    }, 500); // Debounce to avoid frequent API calls
    return () => clearTimeout(timeout);
  }, [recipientId, recipientEmail, recipientType]);

  // 🟢 Copy Account ID
  const handleCopyAccountId = () => {
    navigator.clipboard.writeText(currentUser.id);
    toast({
      title: t("account_id_copied"),
      description: t("account_id_copied_description"),
    });
  };

  // 🟢 Send Receipt


  // 🟢 Confirm Transfer
  const handleTransfer = async () => {
    const trimmedAmount = amount.toString().trim();
    const trimmedRecipient = fetchedRecipient.id;

    if (!trimmedAmount || !trimmedRecipient) {
      toast({
        title: t("error"),
        description: t("fill_all_fields"),
        variant: "destructive",
      });
      return;
    }

    if (trimmedRecipient === currentUser.id) {
      toast({
        title: t("error"),
        description: t("cannot_transfer_to_self"),
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(trimmedAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: t("error"),
        description: t("invalid_amount"),
        variant: "destructive",
      });
      return;
    }

    if (numericAmount > transactions.balance) {
      toast({
        title: t("error"),
        description: t("insufficient_balance"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await api(
        "/api/user/wallet/send-money",
        "POST",
        {
          recipientId: trimmedRecipient,
          amount: numericAmount,
          note: note.trim(),
        },
        toast,
        setIsLoggedIn,
        setCurrentView,
        t
      );
      if (!data) return;

      if (data.status === "succeeded") {
        toast({
          title: t("transfer_success"),
          description: t("transfer_success_description", {
            amount: numericAmount,
            receiver: recipientName || trimmedRecipient,
          }),
        });
        setAmount("");
        setRecipientId("");
        setRecipientEmail("");
        setRecipientName("");
        setFetchedRecipient({ id: "", email: "" });
        setRecipientType("id");
        setStep(1);
        fetchTransactions();
        
              } else {
        toast({
          title: t("error"),
          description: data?.message || t("transfer_failed"),
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: t("error"),
        description: t("transfer_failed", { message: err.message }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Render Status
  const renderStatus = (status) => {
    switch (status) {
      case "succeeded":
        return <span className="text-green-600">{t("status_succeeded")}</span>;
      case "pending":
        return <span className="text-yellow-500">{t("status_pending")}</span>;
      case "failed":
        return <span className="text-red-600">{t("status_failed")}</span>;
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  // 🟢 Render Transaction List
  const renderList = (list, type) => {
    const showAll = expanded[type];
    const data = showAll ? list : list.slice(0, 5);

    return (
      <>
        {data.length === 0 ? (
          <p className="text-sm text-gray-500">{t("no_transactions")}</p>
        ) : (
          data.map((tx, i) => (
            <div
              key={i}
              className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div>
                {type === "sent" && (
                  <p className="font-semibold">
                    {t("to")}: {tx.toUser?.firstname} {tx.toUser?.lastname}
                  </p>
                )}
                {type === "received" && (
                  <p className="font-semibold">
                    {t("from")}: {tx.fromUser?.firstname} {tx.fromUser?.lastname}
                  </p>
                )}
                {type === "all" && (
                  <p className="font-semibold">
                    {tx.fromUser?.firstname} {tx.fromUser?.lastname} →{" "}
                    {tx.toUser?.firstname} {tx.toUser?.lastname}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(tx.createdAt).toLocaleDateString(i18n.language, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-end">
                {type === "sent" && (
                  <p className="font-bold text-red-500">- {tx.amount} ₪</p>
                )}
                {type === "received" && (
                  <p className="font-bold text-green-500">+ {tx.amount} ₪</p>
                )}
                {type === "all" && (
                  <p
                    className={`font-bold ${
                      tx.direction === "sent" ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {tx.direction === "sent" ? "-" : "+"} {tx.amount} ₪
                  </p>
                )}
                {renderStatus(tx.status)}
              </div>
            </div>
          ))
        )}
        {list.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-blue-600 hover:text-blue-700"
            onClick={() => setExpanded({ ...expanded, [type]: !showAll })}
            aria-label={showAll ? t("hide_all") : t("show_all")}
          >
            {showAll ? t("hide_all") : t("show_all")}
          </Button>
        )}
      </>
    );
  };

  // 🟢 Render Receipt Preview
  const renderReceiptPreview = () => {
    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="text-lg font-semibold mb-4">{t("receipt_preview")}</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>{t("amount")}</span>
            <span className="font-semibold">{amount} ₪</span>
          </div>
          <div className="flex justify-between">
            <span>{t("recipient")}</span>
            <span className="font-semibold">{recipientName || fetchedRecipient.id}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("recipient_id")}</span>
            <span className="font-semibold">{fetchedRecipient.id}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("recipient_email")}</span>
            <span className="font-semibold">{fetchedRecipient.email}</span>
          </div>
          <div className="flex justify-between">
            <span>{t("sender")}</span>
            <span className="font-semibold">
              {currentUser.email} {currentUser.lastName}
            </span>
          </div>
          {note && (
            <div className="flex justify-between">
              <span>{t("note")}</span>
              <span className="font-semibold">{note}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>{t("date")}</span>
            <span className="font-semibold">
              {new Date().toLocaleDateString(i18n.language, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[80vh]" dir={i18n.dir()}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="me-2"
        >
          <Wallet className="h-6 w-6 text-primary" />
        </motion.div>
        <p className="text-lg font-medium">{t("loading_transactions")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={i18n.dir()}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">{t("wallet")}</h2>
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

        {/* 🟢 Balance */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg p-6 mb-8 flex justify-between items-center ring-1 ring-green-200"
        >
          <div>
            <p className="text-lg">{t("current_balance")}</p>
            <p className="text-4xl font-bold">{transactions.balance} ₪</p>
            <p className="text-sm opacity-90 mt-2">
              {t("balance_summary", {
                sentTotal: transactions.summary.sentTotal,
                receivedTotal: transactions.summary.receivedTotal,
              })}
              {console.log(transactions.summary)}
            </p>
          </div>
          <Wallet className="h-12 w-12 opacity-80" />
        </motion.div>

        {/* 🟢 Account ID */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 ring-1 ring-gray-200">
          <h3 className="text-lg font-semibold mb-4">{t("account_id")}</h3>
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <span className="font-mono text-lg">{currentUser.id}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAccountId}
              className="flex items-center gap-2 hover:bg-gray-50"
              aria-label={t("copy_account_id")}
            >
              <Copy className="h-4 w-4" /> {t("copy")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 🟢 Transfer Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 ring-1 ring-gray-200">
              {step === 1 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block mb-2 font-semibold">{t("amount")}</label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="0.00"
                      aria-label={t("amount")}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">{t("recipient_type")}</label>
                    <Select
                      value={recipientType}
                      onValueChange={(value) => {
                        setRecipientType(value);
                        setRecipientId("");
                        setRecipientEmail("");
                        setRecipientName("");
                        setFetchedRecipient({ id: "", email: "" });
                      }}
                    >
                      <SelectTrigger className="w-full" aria-label={t("select_recipient_type")}>
                        <SelectValue placeholder={t("select_recipient_type")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">{t("user_id")}</SelectItem>
                        <SelectItem value="email">{t("email")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">
                      {recipientType === "id" ? t("recipient_id") : t("recipient_email")}
                    </label>
                    {recipientType === "id" ? (
                      <Input
                        type="text"
                        value={recipientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        className="w-full rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder={t("enter_recipient_id")}
                        aria-label={t("recipient_id")}
                      />
                    ) : (
                      <Input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="w-full rounded-lg focus:ring-2 focus:ring-primary"
                        placeholder={t("enter_recipient_email")}
                        aria-label={t("recipient_email")}
                      />
                    )}
                    {fetchingRecipient && <p className="text-sm text-gray-500">{t("fetching_recipient")}</p>}
                    {recipientName && (
                      <p className="text-sm text-green-600 mt-2">
                        {t("recipient_name")}: {recipientName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">{t("note")}</label>
                    <Input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder={t("optional_note")}
                      aria-label={t("note")}
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => setStep(2)}
                    disabled={!amount || (recipientType === "id" ? !recipientId : !recipientEmail) || loading || fetchingRecipient}
                    aria-label={t("continue")}
                  >
                    {t("continue")}
                  </Button>
                </motion.div>
              ) : step === 2 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold mb-6">{t("preview_transfer")}</h3>
                  {renderReceiptPreview()}
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 hover:bg-gray-50"
                      onClick={() => setStep(1)}
                      aria-label={t("edit")}
                    >
                      {t("edit")}
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setStep(3)}
                      disabled={loading || !fetchedRecipient.id}
                      aria-label={t("proceed_to_confirm")}
                    >
                      {t("proceed_to_confirm")}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold mb-6">{t("confirm_transfer")}</h3>
                  {renderReceiptPreview()}
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 hover:bg-gray-50"
                      onClick={() => setStep(2)}
                      aria-label={t("back")}
                    >
                      {t("back")}
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleTransfer}
                      disabled={loading}
                      aria-label={t("confirm_transfer")}
                    >
                      {loading ? t("transferring") : t("confirm_transfer")}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* 🟢 Sidebar */}
          <div className="space-y-6">
            {/* Recent Recipients */}
            <div className="bg-white rounded-lg shadow-lg p-6 ring-1 ring-gray-200">
              <h3 className="font-semibold mb-4">{t("recent_recipients")}</h3>
              {recentRecipients.length === 0 ? (
                <p className="text-sm text-gray-500">{t("no_recipients")}</p>
              ) : (
                recentRecipients.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setRecipientType("id");
                      setRecipientId(r.id);
                      setRecipientEmail("");
                    }}
                    className="block w-full text-end p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    aria-label={t("select_recipient", { name: r.firstname })}
                    >
                    {console.log(r)}
                    
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-sm text-gray-500">{r.id}</p>
                  </button>
                ))
              )}
            </div>

            {/* Sent */}
            <div className="bg-white rounded-lg shadow-lg p-6 ring-1 ring-gray-200">
              <h3 className="font-semibold mb-4">{t("sent_transactions")}</h3>
              {renderList(transactions.sent, "sent")}
            </div>

            {/* Received */}
            <div className="bg-white rounded-lg shadow-lg p-6 ring-1 ring-gray-200">
              <h3 className="font-semibold mb-4">{t("received_transactions")}</h3>
              {renderList(transactions.received, "received")}
            </div>

            {/* All */}
            <div className="bg-white rounded-lg shadow-lg p-6 ring-1 ring-gray-200">
              <h3 className="font-semibold mb-4">{t("all_transactions")}</h3>
              {renderList(transactions.all, "all")}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default TransferPage;