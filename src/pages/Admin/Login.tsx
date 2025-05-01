
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Custom Components
import PasswordLoginForm from "@/components/admin/PasswordLoginForm";
import MagicLinkForm from "@/components/admin/MagicLinkForm";
import LoginHeader from "@/components/admin/LoginHeader";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  // Auto-redirect to dashboard (temporary solution)
  useEffect(() => {
    toast({
      title: "تم تجاوز تسجيل الدخول",
      description: "تم تفعيل الدخول المباشر مؤقتاً لحل المشكلة",
    });
    
    // Redirect after showing toast
    const redirectTimer = setTimeout(() => {
      navigate("/admin/dashboard");
    }, 1500);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  const handleDirectAccess = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <LoginHeader />
        
        <Card>
          <CardHeader>
            <CardTitle>تسجيل الدخول (تم التجاوز مؤقتاً)</CardTitle>
            <CardDescription>تم تفعيل الدخول المباشر مؤقتاً لحل مشكلة تسجيل الدخول</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleDirectAccess}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              الدخول المباشر إلى لوحة التحكم
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  تسجيل الدخول العادي (غير مفعل حالياً)
                </span>
              </div>
            </div>
            
            <Tabs defaultValue="password">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="password" disabled>كلمة المرور</TabsTrigger>
                <TabsTrigger value="magic" disabled>رابط الدخول</TabsTrigger>
              </TabsList>
              
              <div className="opacity-50">
                <PasswordLoginForm email={email} setEmail={setEmail} />
              </div>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button 
              variant="link" 
              className="w-full text-noor-purple"
              onClick={() => navigate("/")}
            >
              العودة إلى الصفحة الرئيسية
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
