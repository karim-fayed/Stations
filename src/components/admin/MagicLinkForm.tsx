
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MagicLinkFormProps {
  email: string;
  setEmail: (email: string) => void;
}

const MagicLinkForm = ({ email, setEmail }: MagicLinkFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { toast } = useToast();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !email.trim()) {
      toast({
        title: "يرجى إدخال البريد الإلكتروني",
        description: "يجب إدخال بريدك الإلكتروني لإرسال رابط الدخول",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Make sure to trim the email to avoid whitespace issues
      const trimmedEmail = email.trim();
      
      console.log("Sending magic link to:", trimmedEmail);
      
      // First sign out to clear any existing session
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
      });

      if (error) {
        console.error("Magic link error details:", error);
        throw error;
      }
      
      console.log("Magic link response:", data);
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

      <div className="text-sm text-center mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
        <p className="font-medium text-gray-700 mb-2">حسابات للاختبار:</p>
        <div className="space-y-1">
          <p className="font-mono text-green-700">admin@example.com</p>
          <p className="font-mono text-green-700">karim-it@outlook.sa</p>
          <p className="font-mono text-green-700">a@a.com</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">تأكد من إدخال البريد الإلكتروني بشكل صحيح بدون مسافات إضافية</p>
      </div>
    </form>
  );
};

export default MagicLinkForm;
