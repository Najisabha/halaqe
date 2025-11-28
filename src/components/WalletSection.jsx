
import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { useToast } from "./ui/use-toast"
import { Wallet, Send, RefreshCw } from "lucide-react"

function WalletSection({ currentUser }) {
  const { toast } = useToast()
  const [balance, setBalance] = useState(500) // مثال للرصيد
  const [transferAmount, setTransferAmount] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")

  const handleTransfer = (e) => {
    e.preventDefault()
    if (!transferAmount || !recipientEmail) {
      toast({
        title: "خطأ في التحويل",
        description: "يرجى تعبئة جميع الحقول",
        variant: "destructive"
      })
      return
    }

    if (transferAmount > balance) {
      toast({
        title: "رصيد غير كافي",
        description: "المبلغ المطلوب تحويله أكبر من رصيدك الحالي",
        variant: "destructive"
      })
      return
    }

    // In a real app, this would be an API call
    setBalance(prev => prev - parseFloat(transferAmount))
    toast({
      title: "تم التحويل بنجاح",
      description: `تم تحويل ${transferAmount} شيكل إلى ${recipientEmail}`
    })
    setTransferAmount("")
    setRecipientEmail("")
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <div className="bg-card p-6 rounded-lg shadow-lg mb-8">
          <div className="text-center mb-6">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold">محفظتي</h2>
            <p className="text-3xl font-bold text-primary mt-4">
              {balance} شيكل
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">تحويل الأموال</h3>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <label className="block mb-2">البريد الإلكتروني للمستلم</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-md"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">المبلغ (شيكل)</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 border rounded-md"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 ml-2" />
                  تحويل
                </Button>
              </form>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">آخر المعاملات</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div>
                    <p className="font-semibold">تحويل إلى: أحمد محمد</p>
                    <p className="text-sm text-gray-600">2025/03/21</p>
                  </div>
                  <p className="text-red-500">- 100 شيكل</p>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div>
                    <p className="font-semibold">استلام من: خالد علي</p>
                    <p className="text-sm text-gray-600">2025/03/20</p>
                  </div>
                  <p className="text-green-500">+ 200 شيكل</p>
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                toast({
                  title: "جاري تحديث الرصيد",
                })
              }}
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث الرصيد
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default WalletSection
