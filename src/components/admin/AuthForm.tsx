
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LoginTabs from "./LoginTabs";

const AuthForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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
          console.log("User is already logged in, checking admin status...");
          
          // Check if the user is in the admin_users table
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (adminError) {
            console.error("Error or user not in admin table:", adminError);
            if (adminError.code === 'PGRST116') {  // No rows found
              console.log("User is not an admin, signing out");
              await supabase.auth.signOut();
              toast({
                title: "تنبيه",
                description: "هذا الحساب لا يملك صلاحيات المشرف"
              });
            }
          } else {
            console.log("Admin user verified, redirecting to dashboard");
            navigate('/admin/dashboard');
          }
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };

    checkAuth();
  }, [navigate, toast]);

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
