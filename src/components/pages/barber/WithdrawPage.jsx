import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Building, ArrowRight, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

function WithdrawPage() {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [selectedBank, setSelectedBank] = useState("")
  const [bankInfo, setBankInfo] = useState({
    bankId: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    branch: "",
    iban: "",
    swift: "",
    phone: "",
  })

  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
          const api = import.meta.env.VITE_API_URL;

  // ✅ Fetch balance on mount
  useEffect(() => {
    fetch(`${api}/api/barber/wallet`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setBalance(data.balance || 0))
      .catch((err) => console.error(err))
  }, [])

  const banks = [
    { id: "arab-bank", name: "البنك العربي" },
    { id: "palestine-bank", name: "بنك فلسطين" },
    { id: "quds-bank", name: "بنك القدس" },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (parseFloat(withdrawAmount) > balance) {
      toast({
        title: "خطأ في السحب",
        description: "المبلغ المطلوب أكبر من الرصيد المتاح",
        variant: "destructive",
      })
      return
    }

    if (step < 3) {
      setStep(step + 1)
      return
    }

    // ✅ Send withdrawal request
    try {
      setLoading(true)
      const res = await fetch(
        `${api}/api/barber/wallet/withdraw`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            amount: parseInt(withdrawAmount),
            bankInfo, // only bankInfo JSON
          }),
        }
      )

      const data = await res.json()
      if (res.ok) {
        toast({
          title: "تم تقديم طلب السحب",
          description: "سيتم معالجة طلبك خلال يوم عمل",
        })
        setBalance(balance - parseInt(withdrawAmount))
        setStep(1)
        setWithdrawAmount("")
        setSelectedBank("")
        setBankInfo({
          bankId: "",
          bankName: "",
          accountNumber: "",
          accountHolder: "",
          branch: "",
          iban: "",
          swift: "",
          phone: "",
        })
      } else {
        toast({
          title: "خطأ",
          description: data.message || "فشل في تقديم طلب السحب",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل الاتصال بالخادم",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          className="ml-4"
          onClick={() => window.history.back()}
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة للمحفظة
        </Button>
        <h2 className="text-2xl font-bold">سحب الأموال</h2>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-600">الرصيد المتاح للسحب</p>
            <h3 className="text-3xl font-bold">{balance} شيكل</h3>
          </div>
          <DollarSign className="h-12 w-12 text-primary" />
        </div>
        <p className="text-sm text-gray-600">الحد الأدنى للسحب: 100 شيكل</p>
      </motion.div>

      {/* Step 1: Amount */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold mb-6">أدخل مبلغ السحب</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2">المبلغ (شيكل)</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full p-3 border rounded-lg pl-12"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="100"
                  max={balance}
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  شيكل
                </span>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!withdrawAmount || parseFloat(withdrawAmount) > balance}
            >
              التالي
            </Button>
          </form>
        </motion.div>
      )}

      {/* Step 2: Select Bank */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold mb-6">اختر البنك</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {banks.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => {
                    setSelectedBank(bank.id)
                    setBankInfo((prev) => ({
                      ...prev,
                      bankId: bank.id,
                      bankName: bank.name,
                    }))
                  }}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-colors ${
                    selectedBank === bank.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <Building className="h-6 w-6" />
                  <span className="font-semibold">{bank.name}</span>
                </button>
              ))}
            </div>
            <Button type="submit" className="w-full" disabled={!selectedBank}>
              التالي
            </Button>
          </form>
        </motion.div>
      )}

      {/* Step 3: Bank Details */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold mb-6">معلومات الحساب البنكي</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2">رقم الحساب</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                value={bankInfo.accountNumber}
                onChange={(e) =>
                  setBankInfo({ ...bankInfo, accountNumber: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block mb-2">اسم صاحب الحساب</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                value={bankInfo.accountHolder}
                onChange={(e) =>
                  setBankInfo({ ...bankInfo, accountHolder: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block mb-2">الفرع</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                value={bankInfo.branch}
                onChange={(e) =>
                  setBankInfo({ ...bankInfo, branch: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block mb-2">IBAN</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                value={bankInfo.iban}
                onChange={(e) =>
                  setBankInfo({ ...bankInfo, iban: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block mb-2">SWIFT</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                value={bankInfo.swift}
                onChange={(e) =>
                  setBankInfo({ ...bankInfo, swift: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block mb-2">رقم الهاتف المرتبط بالحساب</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                value={bankInfo.phone}
                onChange={(e) =>
                  setBankInfo({ ...bankInfo, phone: e.target.value })
                }
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">المبلغ</span>
                <span className="font-semibold">{withdrawAmount} شيكل</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">البنك</span>
                <span className="font-semibold">{bankInfo.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">رسوم السحب</span>
                <span className="font-semibold">0 شيكل</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>المجموع</span>
                <span>{withdrawAmount} شيكل</span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جارٍ المعالجة..." : "تأكيد السحب"}
            </Button>
          </form>
        </motion.div>
      )}
    </div>
  )
}

export default WithdrawPage
