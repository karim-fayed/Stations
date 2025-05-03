import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { User } from "../types";

interface DeleteUserDialogProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteUserDialog = ({
  isOpen,
  user,
  onClose,
  onConfirm,
}: DeleteUserDialogProps) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            تأكيد حذف المستخدم
          </DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في حذف المستخدم{" "}
            <span className="font-bold">{user.email}</span>؟
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 mb-4">
          <p className="font-medium mb-2">تحذير:</p>
          <p>
            سيؤدي هذا الإجراء إلى حذف المستخدم بشكل نهائي من النظام. لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
          >
            حذف المستخدم
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
