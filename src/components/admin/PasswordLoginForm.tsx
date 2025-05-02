
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PasswordLoginFormProps {
  email: string;
  setEmail: (email: string) => void;
}

const PasswordLoginForm = ({ email, setEmail }: PasswordLoginFormProps) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Remove whitespace from email and password
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      
      console.log("Attempting login with:", { email: trimmedEmail });
      
      // Use Supabase password login with proper error handling
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });
      
      if (error) {
        console.error("Login error details:", error);
        throw error;
      }
      
      console.log("Login successful with response:", data);
      
      // Check if we have a session
      if (data.session) {
        console.log("Login successful, user:", data.user);
        
        try {
          // تحقق مما إذا كان المستخدم موجودًا في جدول المشرفين
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (adminError) {
            console.error("Error fetching admin user:", adminError);
            
            // إذا لم يكن المستخدم موجودًا في جدول admin_users، نقوم بإضافته
            if (adminError.code === 'PGRST116') { // No rows returned
              console.log("Admin user not found in admin_users table, adding now...");
              const { error: insertError } = await supabase
                .from('admin_users')
                .insert({
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.user_metadata?.name || 'Admin User',
                  role: 'admin',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
              if (insertError) {
                console.error("Error adding user to admin_users table:", insertError);
                toast({
                  title: "تم تسجيل الدخول",
                  description: "ولكن هناك مشكلة في إضافة المستخدم إلى جدول المشرفين",
                  variant: "destructive",
                });
              } else {
                console.log("Successfully added user to admin_users table");
              }
            }
          } else {
            console.log("Found admin user in admin_users table:", adminData);
          }
        } catch (adminCheckError) {
          console.error("Error checking admin status:", adminCheckError);
        }
        
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "جاري تحويلك إلى لوحة التحكم",
        });
        
        // Add a small delay before redirecting
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
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
      
      // تحقق من نوع الخطأ وعرض رسالة مناسبة
      let errorMessage = "تأكد من صحة بريدك الإلكتروني وكلمة المرور";
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "بيانات الدخول غير صحيحة. تأكد من البريد الإلكتروني وكلمة المرور";
      } else if (error.message?.includes("rate limit")) {
        errorMessage = "تم تجاوز عدد محاولات تسجيل الدخول، يرجى المحاولة بعد قليل";
      }
      
      toast({
        title: "خطأ في تسجيل الدخول",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <p>للتجربة استخدم أي من الحسابات التالية:</p>
        <p className="font-semibold mt-1">admin@example.com / Admin123!</p>
        <p className="font-semibold">karim-it@outlook.sa / |l0v3N@fes</p>
        <p className="font-semibold">a@a.com / Password123!</p>
      </div>
    </form>
  );
};

export default PasswordLoginForm;
