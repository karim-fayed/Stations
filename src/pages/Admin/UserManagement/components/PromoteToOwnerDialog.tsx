
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { User } from "../hooks/useUserManagement";

interface PromoteToOwnerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  user: User | null;
}

const PromoteToOwnerDialog: React.FC<PromoteToOwnerDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user
}) => {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("يجب إدخال كلمة المرور للتأكيد");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(password);
      setPassword("");
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تغيير الدور");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      onClose();
      setPassword("");
      setError(null);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">تأكيد ترقية المستخدم إلى مالك</DialogTitle>
          <DialogDescription>
            أنت على وشك منح حقوق المالك لـ {user?.name || user?.email}. هذا سيمنح المستخدم صلاحيات كاملة للنظام.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password" className="font-medium">
                أدخل كلمة المرور الخاصة بك للتأكيد
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={onClose} 
              type="button"
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "جاري التأكيد..." : "تأكيد الترقية"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromoteToOwnerDialog;
