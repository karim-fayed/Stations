
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

interface DeleteStationDialogProps {
  isOpen: boolean;
  stationName: string;
  onClose: () => void;
  onConfirm: (id?: string) => void;
  stationId?: string;
}

const DeleteStationDialog = ({
  isOpen,
  stationName,
  onClose,
  onConfirm,
  stationId,
}: DeleteStationDialogProps) => {
  const handleConfirm = () => {
    onConfirm(stationId);
    onClose(); // إغلاق النافذة بعد تأكيد الحذف
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rtl">
        <DialogHeader>
          <DialogTitle className="text-red-500">تأكيد حذف المحطة</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في حذف محطة "{stationName}"؟ هذا الإجراء لا يمكن التراجع عنه.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 justify-end mt-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
          >
            نعم، حذف المحطة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteStationDialog;
