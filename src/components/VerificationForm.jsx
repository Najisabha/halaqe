
import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { useToast } from "./ui/use-toast"
import { Upload } from "lucide-react"

function VerificationForm({ currentUser }) {
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedFile) {
      toast({
        title: "يرجى اختيار صورة الهوية",
        variant: "destructive"
      })
      return
    }

    // In a real app, this would be an API call to upload the file
    toast({
      title: "تم إرسال طلب التوثيق",
      description: "سيتم مراجعة طلبك خلال 24 ساعة"
    })
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">توثيق الحساب</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 text-center">
              قم بتحميل صورة واضحة لهويتك الوطنية للتحقق من حسابك
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="id-upload"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <label
                htmlFor="id-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <span className="text-gray-600">
                  {selectedFile ? selectedFile.name : "اختر صورة الهوية"}
                </span>
              </label>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>• يجب أن تكون الصورة واضحة وغير مشوشة</p>
              <p>• يجب أن تظهر جميع المعلومات بشكل واضح</p>
              <p>• حجم الملف يجب ألا يتجاوز 5 ميجابايت</p>
            </div>

            <Button type="submit" className="w-full">
              إرسال طلب التوثيق
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default VerificationForm
