import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { motion } from "framer-motion";
import { Facebook, Apple, ArrowRight } from "lucide-react";

function LoginForm({ setCurrentView, setIsLoggedIn, setUserType, setCurrentUser }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // ✅ Handle success login with role + barber approval
  const handleLoginSuccess = (data) => {
    const { user, token } = data;

    // Save auth info
    localStorage.setItem("token", token);
    localStorage.setItem("currentUser", JSON.stringify(user));

    // 🔒 Check if barber is approved
    if (user.type === "BARBER" && !user.barberApproved) {
      toast({
        title: "في انتظار الموافقة",
        description: "لم يتم تفعيل حسابك بعد. يرجى انتظار موافقة الإدارة.",
        variant: "destructive",
      });
      return; // ❌ stop login process
    }

    setIsLoggedIn(true);
    setUserType(user.type);
    setCurrentUser(user);

    // Redirect by role
    if (user.type === "ADMIN") {
      console.log("admin");
      setCurrentView("admin-dashboard");
    } else if (user.type === "BARBER") {
      console.log("barber");
      setCurrentView("barber-dashboard");
    } else {
      console.log("user");
      setCurrentView("home");
    }

    toast({ title: "تم تسجيل الدخول بنجاح" });
  };

  // ✅ Handle OAuth redirect (Google / Facebook)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      try {
        localStorage.setItem("token", token);

        const payload = JSON.parse(atob(token.split(".")[1]));

        const user = {
          id: payload.id,
          type: payload.type,
          barberApproved: payload.barberApproved || false,
        };

        handleLoginSuccess({ token, user });

        // Remove token from URL
        window.history.replaceState({}, document.title, "/");
      } catch (err) {
        console.error("Invalid token", err);
        toast({
          title: "خطأ في التحقق من الرمز",
          description: "تعذر قراءة بيانات المستخدم",
          variant: "destructive",
        });
      }
    }
  }, []);

  const handleSocialLogin = (provider) => {
    if (provider === "Google") {
      const api = import.meta.env.VITE_API_URL;

      window.location.href = `${api}/api/auth/google`;
    }
    if (provider === "Facebook") {
      window.location.href = `${api}/api/auth/facebook`;
    }
    if (provider === "Apple") {
      toast({
        title: "تسجيل الدخول عبر Apple",
        description: "هذه الميزة غير مفعلة حالياً",
      });
    }
  };

  // ✅ Handle email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const api = import.meta.env.VITE_API_URL;

      const res = await fetch(`${api}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "فشل تسجيل الدخول");

      handleLoginSuccess(data);
    } catch (err) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-lg"
      >
        <button
          onClick={() => setCurrentView('welcome')}
          className="flex items-center text-primary hover:underline mb-6"
        >
          <ArrowRight className="h-4 w-4 ml-2 rotate-180" />
          العودة للصفحة الرئيسية
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">تسجيل الدخول</h2>

        {/* Social Login */}
        <div className="space-y-3 mb-8">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={() => handleSocialLogin("Google")}
          >
            <div className="w-5 h-5 ml-2">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </div>
            متابعة باستخدام Google
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={() => handleSocialLogin("Facebook")}
          >
            <Facebook className="h-5 w-5 ml-2" />
            متابعة باستخدام Facebook
          </Button>

 
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">أو</span>
          </div>
        </div>

        {/* Email Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="example@email.com"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">كلمة المرور</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <button
            onClick={() => setCurrentView("forgot-password")}
            className="text-primary hover:underline block w-full"
          >
            نسيت كلمة المرور؟
          </button>
          <p>
            ليس لديك حساب؟{" "}
            <button
              onClick={() => setCurrentView("register")}
              className="text-primary hover:underline"
            >
              إنشاء حساب جديد
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginForm;
