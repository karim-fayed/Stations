
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";

interface PasswordLoginFormProps {
  email: string;
  setEmail: (email: string) => void;
}

const PasswordLoginForm = ({ email, setEmail }: PasswordLoginFormProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Function to prevent spaces in input
  const preventSpaces = (value: string) => {
    return value.replace(/\s/g, '');
  };

  // Handle email change with space prevention
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = preventSpaces(e.target.value);
    setEmail(value);
  };

  // Handle password change with space prevention
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = preventSpaces(e.target.value);
    setPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Make sure there are no spaces in credentials
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();

      console.log("Login attempt with email:", cleanEmail);

      // Validate inputs
      if (!cleanEmail || !cleanPassword) {
        toast({
          title: t('login', 'error'),
          description: t('login', 'enterCredentials'),
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // First sign out to clear any existing session
      await supabase.auth.signOut();

      // Set up testing credentials for development
      const emailToUse = cleanEmail;
      const passwordToUse = cleanPassword;

      // تم إزالة الاختصارات بناءً على طلب المستخدم لتحسين الأمان

      // Attempt to sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: passwordToUse,
      });

      if (error) {
        console.error("Login error:", error);

        // Handle specific error cases
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: t('login', 'loginError'),
            description: t('login', 'invalidCredentials'),
            variant: "destructive",
          });
        } else if (error.message.includes("rate limit")) {
          toast({
            title: "خطأ في تسجيل الدخول",
            description: "تم تجاوز عدد محاولات تسجيل الدخول، يرجى المحاولة بعد قليل",
            variant: "destructive",
          });
        } else {
          toast({
            title: "خطأ في تسجيل الدخول",
            description: error.message || "حدث خطأ أثناء تسجيل الدخول",
            variant: "destructive",
          });
        }

        setIsLoading(false);
        return;
      }

      console.log("Login successful:", data);

      // Check if we have a session
      if (data.session) {
        console.log("User authenticated:", data.user);

        try {
          // Check if user is in admin_users table
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (adminError) {
            console.error("Error checking admin status:", adminError);

            if (adminError.code === 'PGRST116') { // No rows found
              await supabase.auth.signOut(); // Sign out if not an admin
              toast({
                title: t('common', 'alert'),
                description: t('login', 'notAdmin'),
                variant: "destructive",
              });
              setIsLoading(false);
              return;
            }
          } else {
            console.log("Admin user verified:", adminData);
          }
        } catch (adminCheckError) {
          console.error("Error during admin check:", adminCheckError);
        }

        toast({
          title: t('login', 'loginSuccess'),
          description: t('login', 'redirecting'),
        });

        // Redirect to dashboard
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      } else {
        console.error("No session after successful login");
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "فشل إنشاء جلسة المستخدم",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error("Unexpected login error:", error);

      if (error instanceof Error) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: error.message || "حدث خطأ غير متوقع أثناء تسجيل الدخول",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "حدث خطأ غير متوقع أثناء تسجيل الدخول",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isRTL = language === 'ar';

  const inputVariants = {
    focus: { 
      boxShadow: "0 0 0 3px rgba(102, 51, 204, 0.3)",
      borderColor: "rgba(102, 51, 204, 0.5)", 
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-3">
        <div className="relative">
          <motion.label 
            htmlFor="email" 
            className="block text-sm font-medium text-white/90 mb-1.5 text-right"
            initial={{ x: -5, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            البريد الإلكتروني
          </motion.label>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleEmailChange}
              placeholder="أدخل البريد الإلكتروني"
              className={`w-full ${isRTL ? 'pr-10' : 'pl-10'} text-right bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:bg-white/15`}
              dir="rtl"
            />
            <Mail
              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-white/60 ${isRTL ? 'right-3' : 'left-3'}`}
            />
          </motion.div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <motion.label 
            htmlFor="password" 
            className="block text-sm font-medium text-white/90 mb-1.5 text-right"
            initial={{ x: -5, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            كلمة المرور
          </motion.label>
          <motion.div
            className="relative"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={handlePasswordChange}
              placeholder="أدخل كلمة المرور"
              className={`w-full pr-10 ${isRTL ? 'pl-10' : 'pl-0'} text-right bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:bg-white/15`}
              dir="rtl"
            />
            <Lock
              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-white/60 ${isRTL ? 'right-3' : 'left-3'}`}
            />
            <motion.button
              type="button"
              onClick={togglePasswordVisibility}
              className={`absolute inset-y-0 flex items-center ${isRTL ? 'left-3' : 'right-3'}`}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              whileTap={{ scale: 0.95 }}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-white/60" />
              ) : (
                <Eye className="h-4 w-4 text-white/60" />
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Button
          type="submit"
          className="w-full mt-6 bg-noor-purple hover:bg-noor-purple/90 text-white border-none"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري تسجيل الدخول...
            </>
          ) : (
            "تسجيل الدخول"
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
};

export default PasswordLoginForm;
