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
import { useToast } from "@/hooks/use-toast";
import { SaudiCity } from "@/types/station";

interface AddCityManuallyProps {
  isOpen: boolean;
  onClose: () => void;
  onCityAdded: (city: SaudiCity) => void;
}

/**
 * مكون لإضافة منطقة يدويًا (بدون حفظها في قاعدة البيانات)
 * يستخدم في حالة عدم وجود صلاحيات كافية لإضافة منطقة جديدة في قاعدة البيانات
 */
const AddCityManually = ({
  isOpen,
  onClose,
  onCityAdded,
}: AddCityManuallyProps) => {
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من إدخال جميع البيانات المطلوبة
    if (!nameAr || !nameEn || !latitude || !longitude) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى إدخال جميع البيانات المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // إنشاء كائن المدينة الجديدة (بدون حفظها في قاعدة البيانات)
      const newCity: SaudiCity = {
        name: nameAr,
        nameEn: nameEn,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        zoom: 10,
      };

      // إعادة تعيين الحقول
      setNameAr("");
      setNameEn("");
      setLatitude("");
      setLongitude("");

      // إغلاق النافذة المنبثقة
      onClose();

      // استدعاء دالة رد النداء مع المدينة الجديدة
      onCityAdded(newCity);

      // عرض رسالة نجاح
      toast({
        title: "تمت الإضافة بنجاح",
        description: `تمت إضافة مدينة ${nameAr} بنجاح (محليًا فقط)`,
      });
    } catch (error) {
      console.error("Error adding city manually:", error);
      toast({
        title: "خطأ في إضافة المدينة",
        description: (error as Error).message || "حدث خطأ أثناء إضافة المدينة الجديدة",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rtl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-amber-600">إضافة منطقة جديدة (محليًا فقط)</DialogTitle>
          <DialogDescription className="mt-2">
            أدخل تفاصيل المنطقة الجديدة بدقة.
          </DialogDescription>
          <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mt-3 mb-3">
            <div className="text-amber-700 font-bold text-lg">تنبيه: إضافة محلية فقط</div>
            <div className="text-amber-800 text-sm font-medium mt-1">
              ستتم إضافة المنطقة محليًا فقط ولن يتم حفظها في قاعدة البيانات.
              هذا يعني أنها ستكون متاحة فقط في هذه الجلسة ولن تظهر للمستخدمين الآخرين.
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nameAr">اسم المنطقة (بالعربية) *</Label>
            <Input
              id="nameAr"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: الرياض"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameEn">اسم المنطقة (بالإنجليزية) *</Label>
            <Input
              id="nameEn"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="مثال: Riyadh"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">خط العرض *</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="مثال: 24.774265"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">خط الطول *</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="مثال: 46.738586"
                required
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 justify-end mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700"
              disabled={isLoading}
            >
              {isLoading ? "جاري الإضافة..." : "إضافة المنطقة محليًا فقط"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCityManually;
