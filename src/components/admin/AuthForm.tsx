
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PasswordLoginForm from "./PasswordLoginForm";
import { useLanguage } from "@/i18n/LanguageContext";

const AuthForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');

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
    <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-medium">{t('login', 'loginTitle')}</h3>
        <p className="text-sm text-gray-600 mt-1">{t('login', 'loginSubtitle')}</p>
      </div>
      
      <PasswordLoginForm email={email} setEmail={setEmail} />
      
      <div className="mt-5 text-center text-xs text-gray-500">
        <p>{t('login', 'testAccounts')}</p>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        © {t('common', 'appName')} {new Date().getFullYear()} - {t('common', 'allRightsReserved')}
      </div>
    </div>
  );
};

export default AuthForm;
