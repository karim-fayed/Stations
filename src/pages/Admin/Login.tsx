
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

// Custom Components
import PasswordLoginForm from "@/components/admin/PasswordLoginForm";
import MagicLinkForm from "@/components/admin/MagicLinkForm";
import LoginHeader from "@/components/admin/LoginHeader";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already logged in
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (data?.session) {
          navigate("/admin/dashboard");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };

    checkAuth();
  }, [navigate]);

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
            <CardTitle>تسجيل الدخول</CardTitle>
            <CardDescription>أدخل بيانات تسجيل الدخول الخاصة بك</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="password">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="password">كلمة المرور</TabsTrigger>
                <TabsTrigger value="magic">رابط الدخول</TabsTrigger>
              </TabsList>
              
              <TabsContent value="password">
                <PasswordLoginForm email={email} setEmail={setEmail} />
              </TabsContent>
              
              <TabsContent value="magic">
                <MagicLinkForm email={email} setEmail={setEmail} />
              </TabsContent>
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
