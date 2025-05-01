
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { adminLogin } from "@/services/stationService";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await adminLogin(email, password);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "جاري تحويلك إلى لوحة التحكم",
      });
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "تأكد من صحة بريدك الإلكتروني وكلمة المرور",
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
