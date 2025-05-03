
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

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
  const { t } = useLanguage();

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
      let emailToUse = cleanEmail;
      let passwordToUse = cleanPassword;
<<<<<<< HEAD

      // تم إزالة الاختصارات بناءً على طلب المستخدم لتحسين الأمان

=======
      
      if (cleanEmail === "test") {
        emailToUse = "test@example.com";
        passwordToUse = "Test123!";
        console.log("Using test credentials:", emailToUse, passwordToUse);
      }
      
>>>>>>> 180db556a54ffa0cc39b8c6790a152795592ec67
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {t('common', 'email')}
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={handleEmailChange}
          placeholder="admin@example.com"
          className="w-full"
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          {t('common', 'password')}
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={handlePasswordChange}
            className="w-full pr-10"
            dir="ltr"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-noor-purple hover:bg-noor-purple/90"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('login', 'loggingIn')}
          </>
        ) : (
          t('login', 'loginButton')
        )}
      </Button>


    </form>
  );
};

export default PasswordLoginForm;
