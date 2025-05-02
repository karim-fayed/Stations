
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // حسابات اختبار للتسهيل على المستخدم
  const testUsers = [
    { email: 'admin@example.com', password: 'Admin123!' },
    { email: 'karim-it@outlook.sa', password: '|l0v3N@fes' }
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth status...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking auth status:", error);
          throw error;
        }
        
        if (data?.session) {
          console.log("User is already logged in, redirecting to dashboard");
          navigate('/admin/dashboard');
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      }
      
      console.log("Attempting login with:", { email: email.trim() });
      
      // محاولة تسجيل الدخول مع التأكد من أن supabase متاح
      if (!supabase || !supabase.auth) {
        throw new Error("خطأ في الاتصال بنظام المصادقة");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      
      console.log("Login response:", data);
      
      if (error) {
        console.error("Login error details:", error);
        throw error;
      }
      
      if (data && data.session) {
        console.log("Login successful, session:", data.session);
        
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "جاري تحويلك إلى لوحة التحكم",
        });
        
        // التأكد من وجود المستخدم في جدول المشرفين
        try {
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (adminError) {
            console.error("Error fetching admin user:", adminError);
            
            // إذا لم يكن المستخدم موجودًا في جدول admin_users، نحاول إضافته
            if (adminError.code === 'PGRST116') { // No rows returned
              const { error: insertError } = await supabase
                .from('admin_users')
                .insert({
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.user_metadata?.name || 'Admin',
                  role: 'admin',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
              if (insertError) {
                console.error("Error adding user to admin_users table:", insertError);
              } else {
                console.log("Successfully added user to admin_users table");
              }
            }
          }
          
          console.log("Admin user data:", adminData);
        } catch (adminCheckError) {
          console.error("Error checking admin status:", adminCheckError);
        }
        
        // التأخير قبل التحويل
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      } else {
        console.error("No session returned after successful login");
        throw new Error("فشل تسجيل الدخول، لم يتم إنشاء جلسة");
      }
    } catch (error: any) {
      console.error("Login error details:", error);
      
      let errorMsg = "حدث خطأ أثناء تسجيل الدخول";
      
      if (error.message === "Invalid login credentials") {
        errorMsg = "بيانات تسجيل الدخول غير صحيحة";
      } else if (error.message.includes("row") && error.message.includes("not found")) {
        errorMsg = "المستخدم غير موجود في قاعدة البيانات";
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      
      toast({
        title: "فشل تسجيل الدخول",
        description: "تأكد من صحة بريدك الإلكتروني وكلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setTestUser = (user: { email: string, password: string }) => {
    setEmail(user.email);
    setPassword(user.password);
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
        
        <div className="text-sm text-gray-600 mt-6 text-center">
          <p>للتجربة استخدم أي من الحسابات التالية:</p>
          <div className="flex flex-col gap-2 mt-2">
            {testUsers.map((user, index) => (
              <Button 
                key={index} 
                variant="outline"
                onClick={() => setTestUser(user)}
                className="text-xs"
              >
                {user.email}
              </Button>
            ))}
          </div>
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
