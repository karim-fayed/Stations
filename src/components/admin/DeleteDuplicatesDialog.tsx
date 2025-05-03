import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteDuplicatesDialogProps {
  isOpen: boolean;
  duplicateCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteDuplicatesDialog = ({
  isOpen,
  duplicateCount,
  onClose,
  onConfirm,
}: DeleteDuplicatesDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rtl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            حذف المحطات المكررة
          </DialogTitle>
          <DialogDescription>
            {duplicateCount > 0 ?
              "تم العثور على " + duplicateCount + " محطة مكررة. هل ترغب في حذف المحطات المكررة تلقائيًا؟"
             :
              "لا توجد محطات مكررة للحذف."
            }
          </DialogDescription>
          {duplicateCount > 0 && (
            <div className="text-amber-600 font-semibold text-sm mt-2">
              سيتم الاحتفاظ بأقدم محطة في كل مجموعة من المحطات المكررة وحذف البقية.
            </div>
          )}
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          {duplicateCount > 0 && (
            <Button
              variant="destructive"
              onClick={() => {
                onConfirm();
                onClose(); // إغلاق النافذة بعد تأكيد الحذف
              }}
            >
              نعم، حذف المحطات المكررة
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDuplicatesDialog;
