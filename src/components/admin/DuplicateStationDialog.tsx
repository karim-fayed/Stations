import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GasStation } from "@/types/station";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DuplicateStationDialogProps {
  isOpen: boolean;
  duplicateStation: GasStation | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onContinueAnyway: () => void;
}

const DuplicateStationDialog: React.FC<DuplicateStationDialogProps> = ({
  isOpen,
  duplicateStation,
  onClose,
  onDelete,
  onContinueAnyway,
}) => {
  if (!duplicateStation) return null;

  // تنسيق الإحداثيات
  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rtl max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-amber-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            تم العثور على محطة مكررة
          </DialogTitle>
          <DialogDescription>
            هناك محطة موجودة بالفعل بنفس الاسم أو في نفس الموقع الجغرافي تقريبًا.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <h3 className="font-bold text-amber-800 mb-2">تفاصيل المحطة الموجودة:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">الاسم:</div>
              <div>{duplicateStation.name}</div>

              <div className="font-medium">المنطقة:</div>
              <div>{duplicateStation.region}</div>

              <div className="font-medium">الموقع الفرعي:</div>
              <div>{duplicateStation.sub_region || '-'}</div>

              <div className="font-medium">الإحداثيات:</div>
              <div>{formatCoordinates(duplicateStation.latitude, duplicateStation.longitude)}</div>

              <div className="font-medium">أنواع الوقود:</div>
              <div>{duplicateStation.fuel_types || '-'}</div>

              {duplicateStation.additional_info && (
                <>
                  <div className="font-medium">معلومات إضافية:</div>
                  <div>{duplicateStation.additional_info}</div>
                </>
              )}

              {duplicateStation.distance_meters !== undefined && (
                <>
                  <div className="font-medium">المسافة بين المحطتين:</div>
                  <div>
                    {duplicateStation.distance_meters < 1000
                      ? `${Math.round(duplicateStation.distance_meters)} متر`
                      : `${(duplicateStation.distance_meters / 1000).toFixed(2)} كم`}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={() => {
              onDelete(duplicateStation.id);
              // لا نحتاج لاستدعاء onClose() هنا لأن onDelete يقوم بإغلاق النافذة
            }}
          >
            <Trash2 className="h-4 w-4" />
            حذف المحطة الموجودة
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              إلغاء
            </Button>
            <Button
              variant="default"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                onContinueAnyway();
                onClose(); // إغلاق النافذة بعد المتابعة
              }}
            >
              المتابعة على أي حال
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateStationDialog;
