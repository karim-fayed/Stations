
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "../hooks/useUserManagement";

interface PasswordResetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onResetPassword: (user: User) => Promise<boolean>;
  onDirectPasswordChange?: (user: User, password: string) => Promise<boolean>;
  selectedUser: User | null;
  canDirectChange?: boolean;
  currentUserId?: string;
}

const PasswordResetDialog: React.FC<PasswordResetDialogProps> = ({
  isOpen,
  onOpenChange,
  onResetPassword,
  onDirectPasswordChange,
  selectedUser,
  canDirectChange = false,
  currentUserId,
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [useDirectChange, setUseDirectChange] = useState(canDirectChange);

  // Function to prevent spaces in input
  const preventSpaces = (value: string) => {
    return value.replace(/\s/g, '');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = preventSpaces(e.target.value);
    setPassword(value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = preventSpaces(e.target.value);
    setConfirmPassword(value);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    setIsResetting(true);

    let success = false;

    if (useDirectChange && onDirectPasswordChange) {
      // التحقق من تطابق كلمة المرور وتأكيدها
      if (password !== confirmPassword) {
        alert("كلمة المرور وتأكيدها غير متطابقين");
        setIsResetting(false);
        return;
      }

      // التحقق من طول كلمة المرور
      if (password.length < 6) {
        alert("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
        setIsResetting(false);
        return;
      }

      success = await onDirectPasswordChange(selectedUser, password);
    } else {
      success = await onResetPassword(selectedUser);
    }

    if (success) {
      // إعادة تعيين الحقول
      setPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    }

    setIsResetting(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تغيير كلمة المرور</DialogTitle>
          <DialogDescription>
            {selectedUser &&
              `تغيير كلمة المرور للمستخدم ${selectedUser.email}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
          {canDirectChange && (
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="useDirectChange"
                checked={useDirectChange}
                onChange={(e) => setUseDirectChange(e.target.checked)}
                className="ml-2"
              />
              <label htmlFor="useDirectChange" className="text-sm font-medium">
                تغيير كلمة المرور مباشرة
              </label>
            </div>
          )}

          {useDirectChange && canDirectChange ? (
            <>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                    className="w-full pr-10"
                    dir="ltr"
                    minLength={6}
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
                    onClick={toggleConfirmPasswordVisibility}
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

              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200 text-sm text-blue-700">
                <p className="font-medium mb-1">ملاحظة:</p>
                <p>
                  سيتم تغيير كلمة المرور مباشرة في النظام دون إرسال أي بريد إلكتروني.
                  {selectedUser && selectedUser.id !== currentUserId && (
                    <> يمكن للمالك فقط تغيير كلمات مرور المستخدمين الآخرين.</>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                سيتم إرسال بريد إلكتروني يحتوي على رابط لإعادة تعيين كلمة المرور.
                هذه هي الطريقة الأكثر أمانًا لإعادة تعيين كلمة المرور.
              </p>
              <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200 text-sm text-yellow-700">
                <p>
                  سيتلقى المستخدم بريدًا إلكترونيًا يحتوي على رابط لإعادة تعيين كلمة المرور.
                  يجب عليه النقر على الرابط وإدخال كلمة مرور جديدة.
                </p>
              </div>
            </>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="bg-noor-purple hover:bg-noor-purple/90"
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  {useDirectChange && canDirectChange ? "جاري تغيير كلمة المرور..." : "جاري الإرسال..."}
                </>
              ) : (useDirectChange && canDirectChange ? "تغيير كلمة المرور" : "إرسال رابط إعادة التعيين")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetDialog;
