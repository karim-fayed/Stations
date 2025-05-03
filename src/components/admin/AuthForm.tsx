import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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
        const { data: adminData, error: adminError } = await supabase
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
  }, [navigate, toast]);

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-noor-purple mb-2"></div>
        <div>{t('login', 'checkingSession')}</div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md border-none shadow-lg rounded-lg">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">{t('login', 'title')}</h2>
          <p className="text-gray-600 mt-1">
            {t('login', 'subtitle')}
          </p>
        </div>
        <LoginTabs />
        <p className="text-xs text-gray-500 text-center mt-8">
          © {t('common', 'copyright')}
        </p>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
