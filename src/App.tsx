
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import Index from "./pages/Index";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LoginPage from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";
import UserManagement from "./pages/Admin/UserManagement";
import ProfilePage from "./pages/Admin/Profile";
import DatabaseManagement from "./pages/Admin/DatabaseManagement";
import SecurityExamples from "./pages/SecurityExamples";
import NotFound from "./pages/NotFound";
import { ensureAdminExists } from "./utils/admin";
import AuthGuard from "@/components/admin/AuthGuard";
import WhatsAppButton from "./components/WhatsAppButton";
import { soundService } from "@/services/SoundService";
import PermissionsDialog from "@/components/permissions/PermissionsDialog";
import LoadingIndicator from "@/components/ui/loading-indicator";
import logger from "@/utils/logger";
import securityUtils from "@/utils/securityUtils";

const queryClient = new QueryClient();

const App = () => {
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

    // تم إزالة المرحلة 3: التحقق من المستخدمين المشرفين
    // لا يتم إنشاء مستخدمين تلقائيًا بعد الآن

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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {/* مؤشر التحميل */}
        {isLoading && <LoadingIndicator />}

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
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
            <Route path="/admin/database" element={
              <AuthGuard requireOwner={true}>
                <DatabaseManagement />
              </AuthGuard>
            } />
            <Route path="/admin/security-examples" element={
              <AuthGuard requireOwner={true}>
                <SecurityExamples />
              </AuthGuard>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
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
};

export default App;
