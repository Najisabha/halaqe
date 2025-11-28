import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

function AdminSettings({ setCurrentView }) {
  const { toast } = useToast();
  const [pointReplacement, setPointReplacement] = useState("");
  const [benefitsOfProviders, setBenefitsOfProviders] = useState("");
  const [loading, setLoading] = useState(false);
          const api = import.meta.env.VITE_API_URL;

  // Fetch current points and benefits
  useEffect(() => {
    const fetchPointsAndBenefits = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api}/api/admin/points-benfits`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log(response.data)
        const { PointReplacment, BenfitsOfProviders } = response.data.benfits_points;
        setPointReplacement(PointReplacment || 0);
        setBenefitsOfProviders(BenfitsOfProviders || 0);
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل في جلب النقاط والفوائد",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPointsAndBenefits();
  }, [toast]);

  // Handle form submission to update points and benefits
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.patch(
        `${api}/api/admin/points-benfits`,
        {
          PointReplacment: Number(pointReplacement),
          BenfitsOfProviders: Number(benefitsOfProviders),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast({
        title: "نجاح",
        description: "تم تحديث النقاط والفوائد بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث النقاط والفوائد",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">إعدادات النقاط والفوائد</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">

        <div>
          <label htmlFor="benefitsOfProviders" className="block text-sm font-medium mb-1">
            فوائد الوكلاء
          </label>
          <Input
            id="benefitsOfProviders"
            type="text"
            value={benefitsOfProviders}
            onChange={(e) => setBenefitsOfProviders(e.target.value)}
            placeholder="أدخل فوائد الوكلاء"
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "جاري التحديث..." : "تحديث الإعدادات"}
        </Button>
      </form>
    </div>
  );
}

export default AdminSettings;