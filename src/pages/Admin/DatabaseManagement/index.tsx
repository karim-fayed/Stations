
import React from "react";
import { motion } from "framer-motion";
import AuthGuard from "@/components/admin/AuthGuard";
import DashboardHeader from "@/components/admin/DashboardHeader";
import DatabaseAdvisor from "@/components/admin/DatabaseAdvisor";
import { useToast } from "@/hooks/use-toast";
import { adminLogout } from "@/services/stationService";
import { useNavigate } from "react-router-dom";

const DatabaseManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // تسجيل الخروج
      const success = await adminLogout();

      // توجيه المستخدم إلى صفحة تسجيل الدخول
      navigate("/admin/login", { replace: true });

      // إظهار رسالة نجاح
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "تم تسجيل خروجك من النظام بنجاح",
      });
    } catch (error) {
      console.error("Error logging out:", error);

      // حتى في حالة الخطأ، نقوم بتوجيه المستخدم إلى صفحة تسجيل الدخول
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <AuthGuard requireOwner={true}>
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-orange-50 rtl">
        <div className="container mx-auto py-8 px-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <DashboardHeader
              onLogout={handleLogout}
              onAddStation={() => {}}
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6"
          >
            <DatabaseAdvisor />
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default DatabaseManagement;
