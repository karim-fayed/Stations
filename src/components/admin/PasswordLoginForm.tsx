
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
        
        // Add a small delay before redirecting
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
        <p>البريد: karim-it@outlook.sa</p>
        <p>كلمة المرور: |l0v3N@fes</p>
        <p className="mt-2">أو</p>
        <p>البريد: admin@example.com</p>
        <p>كلمة المرور: Admin123!</p>
      </div>
    </form>
  );
};

export default PasswordLoginForm;
