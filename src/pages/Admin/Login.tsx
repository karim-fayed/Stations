
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { adminLogin, checkAdminStatus } from "@/services/stationService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already logged in
    const checkAuth = async () => {
      try {
        const { isAuthenticated } = await checkAdminStatus();
        if (isAuthenticated) {
          navigate("/admin/dashboard");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };

    checkAuth();

    // Check for authentication in URL (for passwordless login)
    const handleAuthStateChange = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate("/admin/dashboard");
      }
    };

    handleAuthStateChange();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log("Attempting login with:", { email, password });
      const response = await adminLogin(email, password);
      console.log("Login response:", response);
      
      // Check if we have a session
      if (response.session) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "جاري تحويلك إلى لوحة التحكم",
        });
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1500);
      } else {
        setErrorMessage("لا يوجد جلسة مستخدم. تأكد من صحة بريدك الإلكتروني وكلمة المرور");
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "لا يوجد جلسة مستخدم. تأكد من صحة بريدك الإلكتروني وكلمة المرور",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMsg = "تأكد من صحة بريدك الإلكتروني وكلمة المرور";
      if (error.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMsg = "بيانات الدخول غير صحيحة. تأكد من البريد الإلكتروني وكلمة المرور";
        } else if (error.message.includes("Email not confirmed")) {
          errorMsg = "لم يتم تأكيد البريد الإلكتروني بعد";
        } else {
          errorMsg = error.message;
        }
      }
      
      setErrorMessage(errorMsg);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function signInWithMagicLink(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) {
        throw error;
      }
      
      toast({
        title: "تم إرسال رابط لبريدك الإلكتروني",
        description: "يرجى التحقق من بريدك الإلكتروني واستخدام الرابط المرسل لتسجيل الدخول",
      });
    } catch (error: any) {
      console.error("Magic link error:", error);
      toast({
        title: "خطأ في إرسال الرابط",
        description: error.message || "حدث خطأ أثناء محاولة إرسال رابط تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/7d04d515-ba22-4ed7-9bba-9b93a0f1eba3.png" 
            alt="Noor Stations Logo" 
            className="mx-auto h-24 w-auto" 
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            لوحة تحكم المشرفين
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            الرجاء تسجيل الدخول للوصول إلى لوحة التحكم
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>تسجيل الدخول</CardTitle>
            <CardDescription>أدخل بيانات تسجيل الدخول الخاصة بك</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  البريد الإلكتروني
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  كلمة المرور
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  dir="ltr"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-noor-purple hover:bg-noor-purple/90" 
                disabled={isLoading}
              >
                {isLoading ? "جاري التسجيل..." : "تسجيل الدخول"}
              </Button>

              <div className="text-center">
                <Button 
                  type="button" 
                  variant="link" 
                  onClick={signInWithMagicLink}
                  disabled={!email || isLoading}
                >
                  إرسال رابط تسجيل الدخول إلى بريدك الإلكتروني
                </Button>
              </div>

              <div className="text-sm text-gray-600 mt-2">
                <p>للتجربة يمكنك استخدام:</p>
                <p className="font-mono mt-1">email: karim-it@outlook.sa</p>
                <p className="font-mono">password: |l0v3N@fes</p>
              </div>
            </form>
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
