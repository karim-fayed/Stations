
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/ui/loading-spinner";

import logger from "@/utils/logger";

interface AuthGuardProps {
  children: ReactNode;
  requireOwner?: boolean;
}

const AuthGuard = ({ children, requireOwner = false }: AuthGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        logger.debug("التحقق من حالة الجلسة في AuthGuard");

        // التحقق من حالة الجلسة عند تحميل الصفحة
        // هذا سيقوم بتسجيل الخروج تلقائيًا إذا تم إغلاق المتصفح/التبويب وإعادة فتحه
        const sessionManager = (await import("@/utils/sessionManager")).default;
        const isSessionValid = await sessionManager.checkSessionOnLoad();

        if (!isSessionValid) {
          logger.debug("الجلسة غير صالحة، تسجيل الخروج");
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // التحقق من وجود جلسة
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          logger.debug("لا توجد جلسة نشطة في Supabase");
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // التحقق من دور المستخدم
        const { data: userData, error } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          logger.error("خطأ في جلب دور المستخدم:", error);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // تهيئة الجلسة إذا كانت صالحة
        await sessionManager.initializeSession();

        setIsAuthenticated(true);
        setUserRole(userData?.role || null);
      } catch (error) {
        logger.error("خطأ في التحقق من المصادقة:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // تنظيف عند إلغاء تحميل المكون
    return () => {
      // لا نقوم بتسجيل الخروج هنا، فقط نقوم بتنظيف المستمعين
      // لأن هذا قد يحدث عند التنقل بين الصفحات المحمية
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      console.log("AuthGuard state:", {
        isAuthenticated,
        userRole,
        path: location.pathname
      });
    }
  }, [isAuthenticated, loading, userRole, location.pathname]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    // Save the current path to return to after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // التحقق من صلاحيات المالك إذا كانت مطلوبة
  if (requireOwner && userRole !== 'owner') {
    console.log("User is not an owner, redirecting to dashboard");
    return <Navigate to="/admin/dashboard" replace />;
  }

  console.log("User is authenticated, rendering protected content");
  return <>{children}</>;
};

export default AuthGuard;
