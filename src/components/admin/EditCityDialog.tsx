import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { checkUserPermission } from "@/utils/securityUtils";

interface EditCityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCityUpdated: (city: SaudiCity) => void;
  city: SaudiCity;
}

const EditCityDialog = ({
  isOpen,
  onClose,
  onCityUpdated,
  city,
}: EditCityDialogProps) => {
  const [nameAr, setNameAr] = useState(city.name || "");
  const [nameEn, setNameEn] = useState(city.nameEn || "");
  const [latitude, setLatitude] = useState(city.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(city.longitude?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const { toast } = useToast();

  // تحديث الحقول عند تغيير المدينة
  useEffect(() => {
    setNameAr(city.name || "");
    setNameEn(city.nameEn || "");
    setLatitude(city.latitude?.toString() || "");
    setLongitude(city.longitude?.toString() || "");
  }, [city]);

  // التحقق من صلاحيات المستخدم
  useEffect(() => {
    const checkOwnerRole = async () => {
      const hasPermission = await checkUserPermission('owner');
      setIsOwner(hasPermission);
    };
    checkOwnerRole();
  }, []);

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
      if (!isOwner) {
        toast({
          title: "غير مصرح",
          description: "ليس لديك صلاحية لتعديل المناطق. يرجى تسجيل الدخول كمالك.",
          variant: "destructive",
        });
        onClose();
        return;
      }

      // الحصول على معرف المدينة من قاعدة البيانات
      const { data: cityData, error: cityError } = await supabase
        .from("cities")
        .select("id")
        .eq("name_ar", city.name)
        .eq("name_en", city.nameEn)
        .single();

      if (cityError) {
        console.error("خطأ في الحصول على معرف المدينة:", cityError);
        throw new Error("فشل في العثور على المدينة في قاعدة البيانات");
      }

      // تحديث المدينة في قاعدة البيانات
      const { error } = await supabase
        .from("cities")
        .update({
          name_ar: nameAr,
          name_en: nameEn,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        })
        .eq("id", cityData.id);

      if (error) {
        console.error("خطأ في تحديث المدينة:", error);
        throw error;
      }

      // إغلاق النافذة الحالية
      onClose();

      // عرض رسالة نجاح
      toast({
        title: "تم التعديل بنجاح",
        description: `تم تعديل مدينة ${nameAr} بنجاح`,
        variant: "default",
      });

      // استدعاء دالة رد النداء مع المدينة المعدلة
      onCityUpdated({
        name: nameAr,
        nameEn: nameEn,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        zoom: city.zoom || 10,
      });
    } catch (error) {
      console.error("خطأ في تعديل المدينة:", error);
      toast({
        title: "خطأ في تعديل المدينة",
        description: error.message || "حدث خطأ أثناء تعديل المدينة",
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
          <DialogTitle>تعديل منطقة</DialogTitle>
          <DialogDescription className="mt-2">
            قم بتعديل تفاصيل المنطقة بدقة.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nameAr">الاسم بالعربية</Label>
            <Input
              id="nameAr"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: الرياض"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
            <Input
              id="nameEn"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="Example: Riyadh"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="latitude">خط العرض</Label>
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
            <Label htmlFor="longitude">خط الطول</Label>
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

          <DialogFooter className="mt-6">
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
              disabled={isLoading}
              className="bg-noor-purple hover:bg-noor-purple/90"
            >
              {isLoading ? "جاري التعديل..." : "تعديل"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCityDialog;
