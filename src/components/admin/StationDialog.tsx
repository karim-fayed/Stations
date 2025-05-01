
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GasStation } from "@/types/station";
import StationForm from "./StationForm";

interface StationDialogProps {
  isOpen: boolean;
  station: Partial<GasStation>;
  isEditing: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const StationDialog = ({
  isOpen,
  station,
  isEditing,
  onInputChange,
  onClose,
  onSubmit,
}: StationDialogProps) => {
  const title = isEditing ? "تعديل محطة" : "إضافة محطة جديدة";
  const description = isEditing ? "تحديث بيانات محطة الوقود" : "أدخل تفاصيل محطة الوقود الجديدة";
  const submitLabel = isEditing ? "حفظ التغييرات" : "إضافة المحطة";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rtl max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-noor-purple">{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <StationForm
          station={station}
          onInputChange={onInputChange}
          onCancel={onClose}
          onSubmit={onSubmit}
          submitLabel={submitLabel}
          title={title}
          description={description}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StationDialog;
