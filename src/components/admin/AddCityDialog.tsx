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
import { checkUserPermission } from "@/utils/securityUtils";
import { addCity } from "@/services/cityService";

interface AddCityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCityAdded: (city: SaudiCity) => void;
}

const AddCityDialog = ({
  isOpen,
  onClose,
  onCityAdded,
}: AddCityDialogProps) => {
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

      // التحقق من صلاحيات المستخدم
      const isAdmin = await checkUserPermission('admin');
      const isOwner = await checkUserPermission('owner');

      // إنشاء كائن المدينة الجديدة
      const newCity: SaudiCity = {
        name: nameAr,
        nameEn: nameEn,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        zoom: 10,
      };

      // إذا لم يكن المستخدم مشرفًا أو مالكًا، نضيف المدينة محليًا فقط
      if (!isAdmin && !isOwner) {
        // إغلاق النافذة
        onClose();

        // إظهار رسالة
        toast({
          title: "إضافة محلية فقط",
          description: "تم إضافة المنطقة محليًا فقط لأنك لا تملك صلاحيات كافية.",
          variant: "warning",
          duration: 6000,
        });

        // استدعاء دالة رد النداء مع المدينة الجديدة
        onCityAdded(newCity);

        setIsLoading(false);
        return;
      }

      // محاولة إضافة المدينة إلى قاعدة البيانات
      try {
        // استدعاء خدمة إضافة المدينة
        const addedCity = await addCity({
          name_ar: nameAr,
          name_en: nameEn,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          zoom: 10, // قيمة افتراضية للتكبير
        });

        // إغلاق النافذة الحالية
        onClose();

        // التحقق مما إذا كانت المدينة أضيفت إلى قاعدة البيانات أو محليًا
        const isLocalAdd = addedCity.name === nameAr &&
                          addedCity.nameEn === nameEn &&
                          addedCity.latitude === parseFloat(latitude) &&
                          addedCity.longitude === parseFloat(longitude);

        if (isLocalAdd) {
          // إظهار رسالة للإضافة المحلية
          toast({
            title: "تم الإضافة محليًا",
            description: `تمت إضافة مدينة ${nameAr} محليًا فقط. ستكون متاحة في هذه الجلسة فقط.`,
            variant: "warning",
            duration: 6000,
          });
        } else {
          // عرض رسالة نجاح للإضافة إلى قاعدة البيانات
          toast({
            title: "تمت الإضافة بنجاح",
            description: `تمت إضافة مدينة ${nameAr} بنجاح إلى قاعدة البيانات`,
            variant: "default",
          });
        }

        // استدعاء دالة رد النداء مع المدينة المضافة
        onCityAdded(addedCity);

      } catch (error) {
        console.error("خطأ في إضافة المدينة:", error);

        // إذا كان الخطأ متعلق بالصلاحيات
        if (error.message && (
            error.message.includes("Forbidden") ||
            error.message.includes("Unauthorized") ||
            error.message.includes("صلاحية")
        )) {
          // إغلاق النافذة الحالية
          onClose();

          // إظهار رسالة
          toast({
            title: "تم الإضافة محليًا",
            description: "تعذر إضافة المنطقة إلى قاعدة البيانات بسبب مشكلة في الصلاحيات. تم إضافتها محليًا فقط.",
            variant: "warning",
            duration: 6000,
          });

          // استدعاء دالة رد النداء مع المدينة الجديدة
          onCityAdded(newCity);
        } else {
          // إظهار رسالة خطأ عامة
          toast({
            title: "خطأ في إضافة المدينة",
            description: error.message || "حدث خطأ أثناء إضافة المدينة الجديدة",
            variant: "destructive",
          });
        }
      }

      // إعادة تعيين الحقول
      setNameAr("");
      setNameEn("");
      setLatitude("");
      setLongitude("");

      // إغلاق النافذة المنبثقة
      onClose();

      // عرض رسالة نجاح
      toast({
        title: "تمت الإضافة بنجاح",
        description: `تمت إضافة مدينة ${nameAr} بنجاح إلى قاعدة البيانات`,
      });
    } catch (error) {
      console.error("Error adding city:", error);
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
          <DialogTitle className="text-noor-purple text-lg">إضافة منطقة جديدة</DialogTitle>
          <DialogDescription className="mt-2">
            أدخل تفاصيل المنطقة الجديدة. جميع الحقول مطلوبة.
          </DialogDescription>
          <div className="bg-purple-50 p-3 rounded-md border border-purple-200 mt-3 mb-3">
            <div className="text-purple-800 font-bold">إضافة إلى قاعدة البيانات</div>
            <div className="text-purple-700 text-sm font-medium mt-1">
              سيتم إضافة المنطقة الجديدة إلى قاعدة البيانات وستكون متاحة لجميع المستخدمين.
              يرجى التأكد من صحة البيانات قبل الإضافة.
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
              className="bg-purple-700 hover:bg-purple-800 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "جاري الإضافة..." : "إضافة المنطقة إلى قاعدة البيانات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCityDialog;
