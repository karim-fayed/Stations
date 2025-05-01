
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import LoginPage from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";
import NotFound from "./pages/NotFound";
import { ensureAdminExists } from "./utils/createAdmin";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Ensure admin user exists on app startup
    console.log("App initializing - ensuring admin users exist");
    ensureAdminExists().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* Redirect login to dashboard temporarily */}
            <Route path="/admin/login" element={<Navigate to="/admin/dashboard" replace />} />
            {/* Remove authentication check from Dashboard temporarily */}
            <Route path="/admin/dashboard" element={<Dashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
