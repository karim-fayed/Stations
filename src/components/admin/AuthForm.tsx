
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/admin/dashboard');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Remove whitespace from email and password
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      
      console.log("Attempting login with:", { email: trimmedEmail });
      
      // Use Supabase password login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });
      
      console.log("Login response:", data);
      
      if (error) {
        console.error("Login error details:", error);
        throw error;
      }
      
      // Check if we have a session
      if (data.session) {
        console.log("Login successful, user:", data.user);
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "جاري تحويلك إلى لوحة التحكم",
        });
        
        // Add a small delay before redirecting to allow the toast to be seen
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1500);
      } else {
        console.error("No session returned after successful login");
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "لا يوجد جلسة مستخدم. تأكد من صحة بريدك الإلكتروني وكلمة المرور",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(
        error.message === "Invalid login credentials"
          ? "بيانات تسجيل الدخول غير صحيحة"
          : error.message || "حدث خطأ أثناء تسجيل الدخول"
      );
      toast({
        title: "فشل تسجيل الدخول",
        description: "تأكد من صحة بريدك الإلكتروني وكلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (!email) {
      setErrorMessage("يرجى إدخال عنوان البريد الإلكتروني");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/login?mode=reset`,
      });

      if (error) throw error;

      toast({
        title: "تم إرسال رابط إعادة تعيين كلمة المرور",
        description: "يرجى التحقق من بريدك الإلكتروني",
      });
      
      setEmail('');
    } catch (error: any) {
      console.error("Reset error:", error);
      setErrorMessage(error.message || "حدث خطأ أثناء إرسال رابط إعادة التعيين");
      toast({
        title: "فشل إعادة تعيين كلمة المرور",
        description: error.message || "حدث خطأ أثناء العملية",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
        <CardDescription className="text-center">
          أدخل بيانات حسابك للوصول إلى لوحة التحكم
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-1 mb-6">
            <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email-login"
                    type="email"
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    dir="rtl"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password-login"
                    type="password"
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    dir="rtl"
                    required
                  />
                </div>
                <div className="text-left">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      const resetTab = document.querySelector('[data-state="inactive"][value="reset"]');
                      if (resetTab) {
                        (resetTab as HTMLElement).click();
                      }
                    }}
                  >
                    نسيت كلمة المرور؟
                  </Button>
                </div>
              </div>
              
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-noor-purple hover:bg-noor-purple/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري تسجيل الدخول...
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="reset" className="hidden">
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email-reset"
                    type="email"
                    placeholder="البريد الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    dir="rtl"
                    required
                  />
                </div>
              </div>
              
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-noor-purple hover:bg-noor-purple/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري إرسال الرابط...
                  </>
                ) : (
                  "إرسال رابط إعادة التعيين"
                )}
              </Button>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-sm"
                  onClick={() => {
                    const loginTab = document.querySelector('[data-state="inactive"][value="login"]');
                    if (loginTab) {
                      (loginTab as HTMLElement).click();
                    }
                  }}
                >
                  العودة إلى تسجيل الدخول
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="text-sm text-gray-600 mt-6 text-center">
          <p>للتجربة استخدم أي من الحسابات التالية:</p>
          <p>البريد: karim-it@outlook.sa</p>
          <p>كلمة المرور: |l0v3N@fes</p>
          <p className="mt-2">أو</p>
          <p>البريد: admin@example.com</p>
          <p>كلمة المرور: Admin123!</p>
        </div>
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
