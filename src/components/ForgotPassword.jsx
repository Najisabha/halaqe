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
  const [step, setStep] = useState(1) // 1: choose method, 2: submit, 3: sent
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (step === 2 && method === "email") {
        const api = import.meta.env.VITE_API_URL;

        const res = await fetch(`${api}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
        if (res.ok) {
          toast({
            title: "تم إرسال رابط إعادة التعيين",
            description: "تحقق من بريدك الإلكتروني واضغط على رابط إعادة تعيين كلمة المرور",
          })
          setStep(3)
        } else {
          toast({ title: "خطأ", description: "تعذر إرسال الرمز" })
        }
      } else if (step === 2 && method !== "email") {
        toast({
          title: "غير مدعوم حالياً",
          description: "استعادة كلمة المرور عبر الهاتف غير مفعّلة حالياً. استخدم البريد الإلكتروني.",
        })
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
              {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
            </Button>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <p className="text-gray-700">
              تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
            </p>
            <p className="text-sm text-gray-500">
              إذا لم تجد الرسالة، تحقق من “Spam/Junk”.
            </p>
            <Button className="w-full" onClick={() => setCurrentView("login")}>
              العودة لتسجيل الدخول
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ForgotPassword
