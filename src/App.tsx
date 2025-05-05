
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LoginPage from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";
import UserManagement from "./pages/Admin/UserManagement";
import ProfilePage from "./pages/Admin/Profile";
import NotFound from "./pages/NotFound";
import { ensureAdminExists } from "./utils/admin";
import AuthGuard from "@/components/admin/AuthGuard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { NotificationProvider } from "@/contexts/NotificationContext";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Ensure admin user exists on app startup
    console.log("App initializing - ensuring admin users exist");
    ensureAdminExists().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* WhatsApp floating button */}
            <WhatsAppButton phoneNumber="966500702080" />
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
};

export default App;
