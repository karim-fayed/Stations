
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LoginTabs from "./LoginTabs";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";

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
        <motion.div 
          animate={{ 
            rotate: 360,
            borderColor: ['rgb(102, 51, 204, 0)', 'rgb(102, 51, 204, 0.7)', 'rgb(102, 51, 204, 0)'] 
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="rounded-full h-10 w-10 border-t-4 border-l-4 mb-3"
        ></motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/90"
        >
          {t('login', 'checkingSession')}
        </motion.div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md bg-transparent border-none shadow-none">
      <CardHeader className="text-center pb-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <CardTitle className="text-2xl text-white">تسجيل الدخول</CardTitle>
          <CardDescription className="text-white/70">
            أدخل بيانات حسابك للوصول إلى لوحة التحكم
          </CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <LoginTabs />
        </motion.div>
      </CardContent>
      <CardFooter className="flex justify-center pt-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-sm text-white/50"
        >
          © محطات نور {new Date().getFullYear()} - جميع الحقوق محفوظة
        </motion.p>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
