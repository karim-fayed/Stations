import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { directPasswordChange } from "@/api/directPasswordChange";

interface ChangePasswordFormProps {
  userId: string;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ userId }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  // Function to prevent spaces in input
  const preventSpaces = (value: string) => {
    return value.replace(/\s/g, '');
  };

  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = preventSpaces(e.target.value);
    setCurrentPassword(value);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = preventSpaces(e.target.value);
    setNewPassword(value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = preventSpaces(e.target.value);
    setConfirmPassword(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast({
          title: "خطأ في البيانات",
          description: "الرجاء إدخال جميع الحقول المطلوبة",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: "خطأ في البيانات",
          description: "كلمة المرور الجديدة وتأكيدها غير متطابقين",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        toast({
          title: "خطأ في البيانات",
          description: "يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // استخدام الوظيفة الجديدة لتغيير كلمة المرور مباشرة
      const result = await directPasswordChange(currentPassword, newPassword);

      if (!result.success) {
        toast({
          title: "خطأ في تغيير كلمة المرور",
          description: result.error || "حدث خطأ أثناء تغيير كلمة المرور",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "تم تغيير كلمة المرور بنجاح",
        description: result.message || "تم تحديث كلمة المرور الخاصة بك",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: error.message || "حدث خطأ أثناء تغيير كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
          كلمة المرور الحالية
        </label>
        <div className="relative">
          <Input
            id="currentPassword"
            name="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
            className="w-full pr-10"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showCurrentPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
          كلمة المرور الجديدة
        </label>
        <div className="relative">
          <Input
            id="newPassword"
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={handleNewPasswordChange}
            className="w-full pr-10"
            dir="ltr"
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          تأكيد كلمة المرور الجديدة
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className="w-full pr-10"
            dir="ltr"
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-noor-purple hover:bg-noor-purple/90 mt-6"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري تغيير كلمة المرور...
          </>
        ) : (
          "تغيير كلمة المرور"
        )}
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
