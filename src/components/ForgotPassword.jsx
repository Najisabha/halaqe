import React, { useState } from "react"
import { Button } from "./ui/button"
import { useToast } from "./ui/use-toast"
import { motion } from "framer-motion"
import { ArrowRight, Mail, Phone } from "lucide-react"

function ForgotPassword({ setCurrentView }) {
  const { toast } = useToast()
  const [method, setMethod] = useState("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [step, setStep] = useState(1)
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (step === 2) {
        const api = import.meta.env.VITE_API_URL;

        const res = await fetch(`${api}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
        if (res.ok) {
          toast({
            title: "تم إرسال رمز التحقق",
            description:
              method === "email"
                ? "تم إرسال رمز التحقق إلى بريدك الإلكتروني"
                : "تم إرسال رمز التحقق إلى رقم جوالك",
          })
          setStep(3)
        } else {
          toast({ title: "خطأ", description: "تعذر إرسال الرمز" })
        }
      }

      if (step === 3) {
        const api = import.meta.env.VITE_API_URL;

        const res = await fetch(`${api}/api/auth/verify-reset-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: verificationCode }),
        })
        if (res.ok) {
          toast({ title: "تم التحقق", description: "يمكنك الآن إدخال كلمة مرور جديدة" })
          setStep(4)
        } else {
          toast({ title: "خطأ", description: "رمز التحقق غير صحيح أو منتهي" })
        }
      }

      if (step === 4) {
        if (newPassword !== confirmPassword) {
          toast({ title: "كلمة المرور غير متطابقة", description: "يرجى إعادة المحاولة" })
          return
        }
        const api = import.meta.env.VITE_API_URL;

        const res = await fetch(`${api}/api/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: verificationCode, newPassword }),
        })

        if (res.ok) {
          toast({
            title: "تم إعادة تعيين كلمة المرور",
            description: "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة",
          })
          setCurrentView("login")
        } else {
          toast({ title: "خطأ", description: "تعذر إعادة تعيين كلمة المرور" })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-lg"
      >
        <button
          onClick={() => setCurrentView("login")}
          className="flex items-center text-primary hover:underline mb-6"
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة لتسجيل الدخول
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">استعادة كلمة المرور</h2>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">
              اختر طريقة استعادة كلمة المرور
            </p>
            <Button
              className="w-full flex items-center justify-center"
              onClick={() => {
                setMethod("email")
                setStep(2)
              }}
            >
              <Mail className="h-4 w-4 ml-2" />
              البريد الإلكتروني
            </Button>
            
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {method === "email" ? (
              <div>
                <label className="block mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block mb-2">رقم الجوال</label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded-md"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">رمز التحقق</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جارٍ التحقق..." : "تأكيد الرمز"}
            </Button>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">كلمة المرور الجديدة</label>
              <input
                type="password"
                className="w-full p-2 border rounded-md"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-2">تأكيد كلمة المرور</label>
              <input
                type="password"
                className="w-full p-2 border rounded-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري إعادة التعيين..." : "إعادة تعيين كلمة المرور"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

export default ForgotPassword
