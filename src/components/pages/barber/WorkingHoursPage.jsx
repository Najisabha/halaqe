import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Plus, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

function WorkingHoursPage({ setIsLoggedIn, setCurrentView }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [workingHours, setWorkingHours] = useState({})
  const [breaks, setBreaks] = useState([])
  const [dirtyBreaks, setDirtyBreaks] = useState({}) // track unsaved changes
  const token = localStorage.getItem("token")
          const api = import.meta.env.VITE_API_URL;


  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
    setIsLoggedIn(false)
    setCurrentView("login")
    toast({
      title: "انتهت صلاحية الجلسة",
      description: "يرجى تسجيل الدخول مرة أخرى",
      variant: "destructive",
    })
  }

  const daysTranslations = {
    sunday: "الأحد",
    monday: "الإثنين",
    tuesday: "الثلاثاء",
    wednesday: "الأربعاء",
    thursday: "الخميس",
    friday: "الجمعة",
    saturday: "السبت",
  }

  const defaultWorkingHours = {
    sunday: { from: "10:00", to: "22:00", isOpen: true },
    monday: { from: "10:00", to: "22:00", isOpen: true },
    tuesday: { from: "10:00", to: "22:00", isOpen: true },
    wednesday: { from: "10:00", to: "22:00", isOpen: true },
    thursday: { from: "10:00", to: "22:00", isOpen: true },
    friday: { from: "10:00", to: "22:00", isOpen: false },
    saturday: { from: "10:00", to: "22:00", isOpen: false },
  }

  // ✅ Fetch working hours + breaks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resHours = await fetch(`${api}/api/barber/working-hours`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (resHours.status === 401) return handleLogout()
        if (!resHours.ok) throw new Error("Failed to load working hours")

        const data = await resHours.json()
        setWorkingHours(
          data.workingHours && Object.keys(data.workingHours).length > 0
            ? data.workingHours
            : defaultWorkingHours
        )
        setBreaks(data.breaks || [])
      } catch (err) {
        console.error(err)
        setWorkingHours(defaultWorkingHours)
        setBreaks([])
        toast({
          title: "تنبيه",
          description: "تم تحميل القيم الافتراضية",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleWorkingHoursChange = (day, field, value) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  const handleBreakAdd = () => {
    const newBreak = {
      id: Date.now().toString(),
      from: "12:00",
      to: "13:00",
      days: [],
    }
    setBreaks([...breaks, newBreak])
    setDirtyBreaks((prev) => ({ ...prev, [newBreak.id]: true }))
  }

  const handleBreakDelete = async (id) => {
    try {
      await fetch(`${api}/api/barber/breaks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      setBreaks(breaks.filter((b) => b.id !== id))
      const copy = { ...dirtyBreaks }
      delete copy[id]
      setDirtyBreaks(copy)
      toast({ title: "تم حذف فترة الراحة" })
    } catch (err) {
      console.error(err)
      toast({
        title: "خطأ",
        description: "فشل حذف فترة الراحة",
        variant: "destructive",
      })
    }
  }

  const updateBreak = (id, updates) => {
    setBreaks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    )
    setDirtyBreaks((prev) => ({ ...prev, [id]: true }))
  }

  const toggleBreakDay = (breakId, day) => {
    const brk = breaks.find((b) => b.id === breakId)
    if (!brk) return
    const newDays = brk.days.includes(day)
      ? brk.days.filter((d) => d !== day)
      : [...brk.days, day]
    updateBreak(breakId, { days: newDays })
  }

  const saveSingleBreak = async (breakItem) => {
    try {
      if (breakItem.days.length === 0) {
        toast({
          title: "تنبيه",
          description: "يجب اختيار يوم واحد على الأقل",
          variant: "destructive",
        })
        return
      }
      const res = await fetch(`${api}/api/barber/breaks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(breakItem),
      })
      if (res.status === 401) return handleLogout()
      if (!res.ok) throw new Error("فشل حفظ فترة الراحة")
      toast({ title: "تم حفظ فترة الراحة" })
      setDirtyBreaks((prev) => ({ ...prev, [breakItem.id]: false }))
    } catch (err) {
      console.error(err)
      toast({
        title: "خطأ",
        description: "فشل حفظ فترة الراحة",
        variant: "destructive",
      })
    }
  }

  // ✅ Save working hours globally
  const handleSaveWorkingHours = async () => {
    try {
      const res = await fetch(`${api}/api/barber/working-hours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workingHours }),
      })

      if (res.status === 401) return handleLogout()
      if (!res.ok) throw new Error("Failed to save")

      toast({ title: "تم حفظ مواعيد العمل" })
    } catch (err) {
      console.error(err)
      toast({
        title: "خطأ",
        description: "فشل حفظ البيانات",
        variant: "destructive",
      })
    }
  }

  if (loading) return <p>جاري التحميل...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">مواعيد العمل</h2>
        <Button onClick={handleSaveWorkingHours}>حفظ التغييرات</Button>
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">ساعات العمل</h3>
        <div className="space-y-4">
          {Object.entries(workingHours).map(([day, hours]) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <div className="w-24">
                <span className="font-semibold">{daysTranslations[day]}</span>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={hours.isOpen}
                  onChange={(e) =>
                    handleWorkingHoursChange(day, "isOpen", e.target.checked)
                  }
                  className="ml-2"
                />
                مفتوح
              </label>
              {hours.isOpen && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <input
                    type="time"
                    value={hours.from}
                    onChange={(e) =>
                      handleWorkingHoursChange(day, "from", e.target.value)
                    }
                    className="border rounded p-2"
                  />
                  <span>إلى</span>
                  <input
                    type="time"
                    value={hours.to}
                    onChange={(e) =>
                      handleWorkingHoursChange(day, "to", e.target.value)
                    }
                    className="border rounded p-2"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Breaks */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">فترات الراحة</h3>
          <Button onClick={handleBreakAdd} variant="outline">
            <Plus className="h-4 w-4 ml-2" />
            إضافة فترة راحة
          </Button>
        </div>
        <div className="space-y-4">
          {breaks.map((breakItem) => (
            <motion.div
              key={breakItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border rounded-lg space-y-2"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <input
                  type="time"
                  value={breakItem.from}
                  onChange={(e) =>
                    updateBreak(breakItem.id, { from: e.target.value })
                  }
                  className="border rounded p-2"
                />
                <span>إلى</span>
                <input
                  type="time"
                  value={breakItem.to}
                  onChange={(e) =>
                    updateBreak(breakItem.id, { to: e.target.value })
                  }
                  className="border rounded p-2"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleBreakDelete(breakItem.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              {/* Days selection */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(daysTranslations).map(([dayKey, label]) => (
                  <label
                    key={dayKey}
                    className={`px-3 py-1 rounded-full cursor-pointer border ${
                      breakItem.days.includes(dayKey)
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={breakItem.days.includes(dayKey)}
                      onChange={() => toggleBreakDay(breakItem.id, dayKey)}
                      className="hidden"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {/* Save button only if dirty + min 1 day */}
              {dirtyBreaks[breakItem.id] && breakItem.days.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => saveSingleBreak(breakItem)}
                  >
                    حفظ
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WorkingHoursPage
