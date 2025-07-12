import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import { ensureAdminExists } from "./utils/admin";
import AuthGuard from "@/components/admin/AuthGuard";
import WhatsAppButton from "./components/WhatsAppButton";
import { soundService } from "@/services/SoundService";
import PermissionsDialog from "@/components/permissions/PermissionsDialog";
import LoadingIndicator from "@/components/ui/loading-indicator";
import logger from "@/utils/logger";
import securityUtils from "@/utils/securityUtils";
import { fixUpdateStationFunction } from "@/integrations/supabase/client";


// تحميل المكونات بشكل كسول
const Index = lazy(() => import("./pages/Index"));
const Services = lazy(() => import("./pages/Services"));
//const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const LoginPage = lazy(() => import("./pages/Admin/Login"));
const Dashboard = lazy(() => import("./pages/Admin/Dashboard"));
const UserManagement = lazy(() => import("./pages/Admin/UserManagement"));
const ProfilePage = lazy(() => import("./pages/Admin/Profile"));
const DatabaseManagement = lazy(() => import("./pages/Admin/DatabaseManagement"));
const RegionsManagement = lazy(() => import("./pages/Admin/RegionsManagement"));
const SecurityExamples = lazy(() => import("./pages/SecurityExamples"));
const FeedbacksAdmin = lazy(() => import("./pages/Admin/Feedbacks"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      gcTime: 10 * 60 * 1000, // 10 دقائق
      retry: 1,
    },
  },
});

function App() {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // تهيئة التطبيق بشكل تدريجي لتحسين الأداء

    // المرحلة 1: تهيئة الخدمات الأساسية وتأمين التطبيق فورًا
    logger.debug("App initializing - stage 1: essential services and security");

    // تأمين التطبيق عند بدء التشغيل
    securityUtils.secureAppInitialization();

    // إخفاء مؤشر التحميل بعد فترة قصيرة
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // المرحلة 2: تهيئة خدمات الصوت والإشعارات بعد تحميل الواجهة
    setTimeout(() => {
      logger.debug("App initializing - stage 2: sound and notification services");
      soundService.initialize();
    }, 1000);

    // المرحلة 2.5: التحقق من حالة الجلسة
    setTimeout(async () => {
      logger.debug("App initializing - stage 2.5: checking session state");
      try {
        // Dynamic import for sessionManager
        const sessionManager = (await import("@/utils/sessionManager")).default;
        await sessionManager.checkSessionOnLoad();
      } catch (error) {
        logger.error("Error checking session state:", error);
      }
    }, 1200);

    // تم إزالة المرحلة 3: التحقق من المستخدمين المشرفين
    // لا يتم إنشاء مستخدمين تلقائيًا بعد الآن

    // المرحلة 3.5: إصلاح وظائف قاعدة البيانات
    setTimeout(async () => {
      logger.debug("App initializing - stage 3.5: fixing database functions");
      try {
        // محاولة إصلاح دالة تحديث المحطة
        const result = await fixUpdateStationFunction();
        if (result) {
          logger.debug("Successfully fixed update_station function");
        } else {
          logger.warn("Failed to fix update_station function automatically");
        }
      } catch (error) {
        logger.error("Error fixing database functions:", error);
      }
    }, 1500);

    // المرحلة 4: عرض مربع حوار الأذونات إذا لزم الأمر
    setTimeout(() => {
      logger.debug("App initializing - stage 4: checking permissions");

      // التحقق مما إذا كان المستخدم قد تجاهل طلب الأذونات من قبل
      const hasIgnoredPermission = securityUtils.secureStorage.getItem('permissions_dialog_ignored', false);

      // التحقق مما إذا كان المستخدم قد منح الأذونات من قبل
      const hasGrantedPermissions = securityUtils.secureStorage.getItem('permissions_granted', false);

      // عرض مربع حوار الأذونات إذا لم يتم تجاهله أو منحه من قبل
      if (!hasIgnoredPermission && !hasGrantedPermissions) {
        setShowPermissionDialog(true);
      }
    }, 2000);

    // تنظيف عند إلغاء تحميل المكون
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {/* مؤشر التحميل */}
        {isLoading && <LoadingIndicator />}

        <BrowserRouter>
          <Suspense fallback={<LoadingIndicator />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              {/* <Route path="/about" element={<About />} /> */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin/dashboard" element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              } />
              <Route path="/admin/users" element={
                <AuthGuard requireOwner={true}>
                  <UserManagement />
                </AuthGuard>
              } />
              <Route path="/admin/profile" element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              } />
              <Route path="/admin/feedbacks" element={
                <AuthGuard requireOwner={true}>
                  <FeedbacksAdmin />
                </AuthGuard>
              } />
              <Route path="/admin/regions" element={
                <AuthGuard requireOwner={true}>
                  <RegionsManagement />
                </AuthGuard>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>

          </Suspense>
          <WhatsAppButton />

          {/* مكون طلب الأذونات */}
          {showPermissionDialog && (
            <PermissionsDialog
              onPermissionsGranted={() => {
                console.log('تم منح الأذونات المطلوبة');
                setShowPermissionDialog(false);
              }}
            />
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
