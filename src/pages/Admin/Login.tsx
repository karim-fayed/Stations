
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { adminLogin, sendMagicLink, checkAdminStatus } from "@/services/stationService";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
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
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting login with:", { email });
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
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "لا يوجد جلسة مستخدم. تأكد من صحة بريدك الإلكتروني وكلمة المرور",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "تأكد من صحة بريدك الإلكتروني وكلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast({
        title: "يرجى إدخال البريد الإلكتروني",
        description: "يجب إدخال بريدك الإلكتروني لإرسال رابط الدخول",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await sendMagicLink(email);
      setMagicLinkSent(true);
      toast({
        title: "تم إرسال رابط الدخول",
        description: "يرجى التحقق من بريدك الإلكتروني للدخول",
      });
    } catch (error: any) {
      console.error("Magic link error:", error);
      toast({
        title: "خطأ في إرسال رابط الدخول",
        description: error.message || "حدث خطأ أثناء إرسال رابط الدخول",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            <Tabs defaultValue="password">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="password">كلمة المرور</TabsTrigger>
                <TabsTrigger value="magic">رابط الدخول</TabsTrigger>
              </TabsList>
              
              <TabsContent value="password">
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
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري التسجيل...
                      </>
                    ) : (
                      "تسجيل الدخول"
                    )}
                  </Button>

                  <div className="text-sm text-gray-600 mt-2 text-center">
                    <p>للتجربة: استخدم admin@example.com / password1234</p>
                    <p>أو karim-it@outlook.sa / كلمة المرور المقدمة</p>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="magic">
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700">
                      البريد الإلكتروني
                    </label>
                    <Input
                      id="magic-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full"
                      dir="ltr"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-noor-purple hover:bg-noor-purple/90" 
                    disabled={isLoading || magicLinkSent}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : magicLinkSent ? (
                      "تم إرسال الرابط"
                    ) : (
                      "إرسال رابط الدخول"
                    )}
                  </Button>

                  {magicLinkSent && (
                    <p className="text-sm text-green-600 text-center">
                      تم إرسال رابط الدخول إلى بريدك الإلكتروني، يرجى التحقق من صندوق الوارد.
                    </p>
                  )}
                </form>
              </TabsContent>
            </Tabs>
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
