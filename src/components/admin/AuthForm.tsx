import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LoginTabs from "./LoginTabs";
import { useLanguage } from "@/i18n/LanguageContext";

const AuthForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth status...");

        // First check if there's a session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error checking auth status:", error);
          setIsCheckingAuth(false);
          return;
        }

        if (!data?.session) {
          console.log("No active session found");
          setIsCheckingAuth(false);
          return;
        }

        console.log("User is already logged in, checking admin status...");

        // Check if the user is in the admin_users table
        const { error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (adminError) {
          console.error("Error checking admin status:", adminError);
          if (adminError.code === 'PGRST116') {  // No rows found
            console.log("User is not an admin, signing out");
            await supabase.auth.signOut();
            toast({
              title: t('common', 'alert'),
              description: t('login', 'notAdmin')
            });
            setIsCheckingAuth(false);
          } else {
            // Other error occurred
            setIsCheckingAuth(false);
          }
        } else {
          console.log("Admin user verified, redirecting to dashboard");
          navigate('/admin/dashboard');
        }
      } catch (error) {
        console.error("Error in authentication check:", error);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate, toast, t]);

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-noor-purple mb-2"></div>
        <div>{t('login', 'checkingSession')}</div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-0">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
        <CardDescription>
          أدخل بيانات حسابك للوصول إلى لوحة التحكم
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginTabs />
      </CardContent>
      <CardFooter className="flex justify-center pt-4">
        <p className="text-sm text-gray-500">
          © محطات نور {new Date().getFullYear()} - جميع الحقوق محفوظة
        </p>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
