
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import LoginTabs from "./LoginTabs";

const AuthForm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth status...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking auth status:", error);
          throw error;
        }
        
        if (data?.session) {
          console.log("User is already logged in, redirecting to dashboard");
          navigate('/admin/dashboard');
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
        <CardDescription className="text-center">
          أدخل بيانات حسابك للوصول إلى لوحة التحكم
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginTabs />
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          © محطات نور {new Date().getFullYear()} - جميع الحقوق محفوظة
        </p>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
