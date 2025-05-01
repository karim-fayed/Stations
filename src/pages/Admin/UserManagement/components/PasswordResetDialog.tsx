
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
  selectedUser: User | null;
}

const PasswordResetDialog: React.FC<PasswordResetDialogProps> = ({
  isOpen,
  onOpenChange,
  onResetPassword,
  selectedUser,
}) => {
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    setIsResetting(true);
    
    const success = await onResetPassword(selectedUser);
    
    if (success) {
      onOpenChange(false);
    }
    
    setIsResetting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
          <DialogDescription>
            {selectedUser && 
              `سيتم إرسال رابط إعادة تعيين كلمة المرور إلى ${selectedUser.email}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
          <p className="text-sm text-gray-500">
            سيتم إرسال بريد إلكتروني يحتوي على رابط لإعادة تعيين كلمة المرور.
            هذه هي الطريقة الأكثر أمانًا لإعادة تعيين كلمة المرور.
          </p>

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
                  جاري الإرسال...
                </>
              ) : "إرسال رابط إعادة التعيين"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetDialog;
