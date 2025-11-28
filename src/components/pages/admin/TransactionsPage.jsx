import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * apiFetch - small helper
 */
async function apiFetch(url) {
  const api = import.meta.env.VITE_API_URL;

    const res = await fetch(`${api}${url}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load data");
  }
  return res.json();
}

const statusColors = {
  succeeded: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

const ITEMS_PER_PAGE = 10;

/**
 * safeParseBank - returns parsed bank info object or null
 *
 * Handles many shapes in the wild:
 *  - item.bankInfo could be an object
 *  - item.bankInfo could be a JSON string
 *  - item.note could be a JSON string containing { bankInfo: { ... } }
 *  - double-encoded JSON
 */
function safeParseBank(item) {
  const candidates = [item.bankInfo, item.note];

  for (let raw of candidates) {
    if (!raw) continue;

    // already object
    if (typeof raw === "object") {
      // maybe wrapped
      if (raw.bankInfo) {
        return raw.bankInfo;
      }
      return raw;
    }

    // string: try parse
    if (typeof raw === "string") {
      // try parsing repeatedly to handle double-encoding
      try {
        let parsed = JSON.parse(raw);

        // sometimes parsed is an object with bankInfo key
        if (parsed && typeof parsed === "object") {
          if (parsed.bankInfo) {
            // parsed.bankInfo might be a string again
            const inner = parsed.bankInfo;
            if (typeof inner === "string") {
              try {
                return JSON.parse(inner);
              } catch {
                return inner;
              }
            }
            return parsed.bankInfo;
          }

          // maybe parsed already is the bank object
          const keys = Object.keys(parsed);
          if (
            keys.includes("accountNumber") ||
            keys.includes("accountHolder") ||
            keys.includes("branch") ||
            keys.includes("bankName")
          ) {
            return parsed;
          }

          // If parsed has single key whose value is the bank object (rare)
          for (const k of keys) {
            if (typeof parsed[k] === "object") {
              const nested = parsed[k];
              if (
                nested.accountNumber ||
                nested.accountHolder ||
                nested.bankName ||
                nested.branch
              ) {
                return nested;
              }
            }
          }
        }

        // parsed was string again -> try parse once more
        if (typeof parsed === "string") {
          try {
            const twice = JSON.parse(parsed);
            if (typeof twice === "object") return twice;
          } catch {}
        }
      } catch (err) {
        // fallthrough to next candidate
      }
    }
  }

  return null;
}

/**
 * small formatter
 */
function formatDate(d) {
  try {
    return new Date(d).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

/**
 * SectionTable - single component but renders differently by `type`
 */
const SectionTable = ({ title, items, type }) => {
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);

  const filteredItems =
    filter === "all" ? items : items.filter((t) => t.status === filter);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
    const visibleItems =
    type === "transactions" ? items.filter((t) => t.type === "transfer") : items;

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, items]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {title} <span className="text-sm text-gray-500 ml-2">({items.length})</span>
        </h2>

        <div className="flex gap-2">
          {["all", "succeeded", "pending", "failed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      </div>

      {paginatedItems.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No data to show</p>
      ) : (
        <div className="overflow-x-auto">
          {/* payments table */}
          {type === "payment" && (
            <table className="min-w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2">Payer</th>
                  <th className="px-4 py-2">Payer Email</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Barber</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 text-sm font-mono">{p.id}</td>
                      <td className="px-4 py-2">{p.payer?.firstname} {p.payer?.lastname}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{p.payer?.email}</td>
                      <td className="px-4 py-2 text-sm">
                        {p.barberId ? "Appointment" : "Wallet top-up"}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {p.barber ? `${p.barber.firstname} ${p.barber.lastname}` : "-"}
                      </td>
                      <td className="px-4 py-2">{p.amount} {p.currency || "ILS"}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[p.status] || "bg-gray-100 text-gray-800"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{formatDate(p.createdAt)}</td>
                      <td className="px-4 py-2">
                        <button
                          className="text-sm text-primary underline"
                          onClick={() => setExpandedRow(expandedRow === p.id ? null : p.id)}
                        >
                          {expandedRow === p.id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>

                    {expandedRow === p.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={9} className="px-4 py-3 text-sm text-gray-700">
                          <pre dir= "ltr" className="whitespace-pre-wrap text-xs bg-white p-3 rounded border">{JSON.stringify(p, null, 2)}</pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}

          {/* transactions table */}
          {type === "transactions" && (
  <table className="min-w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-4 py-2 text-left">ID</th>
        <th className="px-4 py-2">Type</th>
        <th className="px-4 py-2">Amount</th>
        <th className="px-4 py-2">Meta</th>
        <th className="px-4 py-2">Status</th>
        <th className="px-4 py-2">Date</th>
        <th className="px-4 py-2">Details</th>
      </tr>
    </thead>
    <tbody>
      {paginatedItems.map((t) => {
        let metaText = "-";

        try {
          const m = t.metadata || {};
          const sender =
            (t.user && `${t.user.firstname} ${t.user.lastname}`) ||
            m.senderName ||
            m.payerName ||
            m.from;

          const receiver =
            m.receiverName ||
            (m.barberId && `barber:${m.barberId}`) ||
            m.to ||
            (t.paymentId ? `payment:${t.paymentId}` : null);

          // ✅ Special handling for transfer type
          if (t.type === "transfer") {
            if (sender && receiver) metaText = `${sender} → ${receiver}`;
            else if (sender) metaText = `${sender} (sender)`;
            else if (receiver) metaText = `(to) ${receiver}`;
            else if (Object.keys(m).length) metaText = JSON.stringify(m);
          } else {
            // fallback for other transaction types
            metaText =
              sender && receiver
                ? `${sender} / ${receiver}`
                : sender || receiver || (Object.keys(m).length ? JSON.stringify(m) : "-");
          }
        } catch {}

        return (
          <React.Fragment key={t.id}>
            <tr className="border-b hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2 text-sm font-mono">{t.id}</td>
              <td className="px-4 py-2 text-sm capitalize">
                {t.type === "transfer" ? "💸 Transfer" : t.type}
              </td>
              <td className="px-4 py-2">
                {t.amount} {t.currency || "ILS"}
              </td>
              <td className="px-4 py-2 text-sm">{metaText}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    statusColors[t.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {t.status}
                </span>
              </td>
              <td className="px-4 py-2">{formatDate(t.createdAt)}</td>
              <td className="px-4 py-2">
                <button
                  className="text-sm text-primary underline"
                  onClick={() =>
                    setExpandedRow(expandedRow === t.id ? null : t.id)
                  }
                >
                  {expandedRow === t.id ? "Hide" : "View"}
                </button>
              </td>
            </tr>

            {expandedRow === t.id && (
              <tr className="bg-gray-50">
                <td colSpan={7} className="px-4 py-3 text-sm text-gray-700">
                  <pre
                    dir="ltr"
                    className="whitespace-pre-wrap text-xs bg-white p-3 rounded border"
                  >
                    {JSON.stringify(t, null, 2)}
                  </pre>
                </td>
              </tr>
            )}
          </React.Fragment>
        );
      })}
    </tbody>
  </table>
)}

          {/* withdrawals table */}
          {type === "withdrawals" && (
            <table className="min-w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2">Barber</th>
                  <th className="px-4 py-2">Barber Email</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Bank Info</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Raw</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((w) => {
                  const bank = safeParseBank(w);
                  return (
                    <tr key={w.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2 text-sm font-mono">{w.id}</td>
                      <td className="px-4 py-2">
                        {w.barber ? `${w.barber.firstname} ${w.barber.lastname}` : "-"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {w.barber?.email || "-"}
                      </td>
                      <td className="px-4 py-2 font-medium">{w.amount} {w.currency || "ILS"}</td>
                      <td className="px-4 py-2 text-sm">
                        {bank ? (
                          <>
                            <div><strong>Bank:</strong> {bank.bankName || bank.bank || bank.bankId || "-"}</div>
                            <div><strong>Account #:</strong> {bank.accountNumber || "-"}</div>
                            <div><strong>Holder:</strong> {bank.accountHolder || bank.account_name || "-"}</div>
                            <div><strong>Branch:</strong> {bank.branch || "-"}</div>
                            {bank.iban && <div><strong>IBAN:</strong> {bank.iban}</div>}
                            {bank.swift && <div><strong>SWIFT:</strong> {bank.swift}</div>}
                            {bank.phone && <div><strong>Phone:</strong> {bank.phone}</div>}
                          </>
                        ) : (
                          <span className="text-gray-500">No bank info</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[w.status] || "bg-gray-100 text-gray-800"}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{formatDate(w.createdAt)}</td>
                      <td className="px-4 py-2">
                        <button
                          className="text-sm text-primary underline"
                          onClick={() => setExpandedRow(expandedRow === w.id ? null : w.id)}
                        >
                          {expandedRow === w.id ? <><ChevronUp className="inline-block" /> Hide</> : <><ChevronDown className="inline-block" /> Raw</>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages).keys()].map((i) => (
            <button
              key={i}
              onClick={() => changePage(i + 1)}
              className={`px-3 py-1 rounded-md ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* expanded raw JSON view placed at bottom for clarity */}
      {expandedRow && (
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">Expanded JSON (debug):</div>
          <pre dir="ltr" className="bg-gray-50 p-4 rounded border text-xs whitespace-pre-wrap">
            {JSON.stringify(items.find((i) => i.id === expandedRow), null, 2)}
          </pre>
        </div>
      )}
    </motion.div>
  );
};

const TransactionsPage = () => {
  const { toast } = useToast();
  const [data, setData] = useState({ payment: [], transactions: [], withdrawals: [] });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/admin/all-transcation");
      setData({
        payment: res.payment || [],
        transactions: res.transactions || [],
        withdrawals: res.withdrawals || [],
      });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <p className="text-center py-20">⏳ Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen bg-gray-50">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold mb-8">
        Financial Transactions
      </motion.h1>

      <SectionTable title="Payments" items={data.payment} type="payment" />
      <SectionTable title="Transactions" items={data.transactions} type="transactions" />
      <SectionTable title="Withdrawals" items={data.withdrawals} type="withdrawals" />
    </div>
  );
};

export default TransactionsPage;
