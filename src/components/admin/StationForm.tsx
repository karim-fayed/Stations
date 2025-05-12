
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GasStation, SaudiCity } from "@/types/station";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaudiCities } from "@/components/map/useSaudiCities";
import { Plus } from "lucide-react";
import AddCityDialog from "./AddCityDialog";
import AddCityManually from "./AddCityManually";
import { checkUserPermission } from "@/utils/securityUtils";

interface StationFormProps {
  station: Partial<GasStation>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange?: (name: string, value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  title: string;
  description: string;
}

const StationForm = ({
  station,
  onInputChange,
  onSelectChange,
  onCancel,
  onSubmit,
  submitLabel,
  title,
  description,
}: StationFormProps) => {
  // استخدام hook لجلب المدن من قاعدة البيانات
  const { cities, isLoading, refreshCities, addLocalCity } = useSaudiCities();
  // حالة لإظهار/إخفاء نوافذ إضافة منطقة جديدة
  const [isAddCityDialogOpen, setIsAddCityDialogOpen] = useState(false);
  const [isAddCityManuallyOpen, setIsAddCityManuallyOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // التحقق من صلاحيات المستخدم عند تحميل المكون
  useEffect(() => {
    const checkAdmin = async () => {
      const hasPermission = await checkUserPermission('admin');
      setIsAdmin(hasPermission);
    };
    checkAdmin();
  }, []);

  // دالة لفتح نافذة إضافة منطقة جديدة المناسبة
  const handleAddCityClick = () => {
    if (isAdmin) {
      setIsAddCityDialogOpen(true);
    } else {
      // إذا لم يكن المستخدم مشرفًا، نعرض نافذة الإضافة المحلية
      setIsAddCityManuallyOpen(true);
    }
  };

  // دالة لإضافة مدينة جديدة إلى القائمة وتحديد قيمة المنطقة
  const handleCityAdded = (newCity: SaudiCity) => {
    // تحديث قائمة المدن إذا كان المستخدم مشرفًا
    if (isAdmin) {
      refreshCities();
    } else {
      // إذا لم يكن المستخدم مشرفًا، نضيف المدينة محليًا
      addLocalCity(newCity);
    }

    // تحديث قيمة المنطقة في النموذج
    if (onSelectChange) {
      onSelectChange('region', newCity.name);
    }
  };
  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <label htmlFor="name" className="text-sm font-medium">اسم المحطة *</label>
          <Input
            id="name"
            name="name"
            value={station.name || ""}
            onChange={onInputChange}
            placeholder="مثال: محطة نور الرياض"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="region" className="text-sm font-medium">المنطقة *</label>
          <div className="flex gap-2">
            <Select
              value={station.region || ""}
              onValueChange={(value) => onSelectChange && onSelectChange('region', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="region" className="w-full">
                <SelectValue placeholder="اختر المنطقة" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {cities.map((city) => (
                  <SelectItem key={city.nameEn} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="flex-shrink-0"
              onClick={handleAddCityClick}
              title="إضافة منطقة جديدة"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="sub_region" className="text-sm font-medium">الموقع الفرعي *</label>
          <Input
            id="sub_region"
            name="sub_region"
            value={station.sub_region || ""}
            onChange={onInputChange}
            placeholder="مثال: حي النزهة"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="latitude" className="text-sm font-medium">خط العرض *</label>
          <Input
            id="latitude"
            name="latitude"
            type="number"
            step="0.000001"
            value={station.latitude || ""}
            onChange={onInputChange}
            placeholder="مثال: 24.774265"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="longitude" className="text-sm font-medium">خط الطول *</label>
          <Input
            id="longitude"
            name="longitude"
            type="number"
            step="0.000001"
            value={station.longitude || ""}
            onChange={onInputChange}
            placeholder="مثال: 46.738586"
            required
          />
        </div>

        <div className="space-y-2 col-span-2">
          <label htmlFor="fuel_types" className="text-sm font-medium">أنواع الوقود</label>
          <Input
            id="fuel_types"
            name="fuel_types"
            value={station.fuel_types || ""}
            onChange={onInputChange}
            placeholder="مثال: بنزين 91، بنزين 95، ديزل"
          />
        </div>

        <div className="space-y-2 col-span-2">
          <label htmlFor="additional_info" className="text-sm font-medium">معلومات إضافية</label>
          <Textarea
            id="additional_info"
            name="additional_info"
            value={station.additional_info || ""}
            onChange={onInputChange}
            placeholder="أي معلومات إضافية عن المحطة"
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-6">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          إلغاء
        </Button>
        <Button
          className="bg-noor-purple hover:bg-noor-purple/90"
          onClick={onSubmit}
        >
          {submitLabel}
        </Button>
      </div>

      {/* نافذة إضافة منطقة جديدة (للمشرفين) */}
      <AddCityDialog
        isOpen={isAddCityDialogOpen}
        onClose={() => setIsAddCityDialogOpen(false)}
        onCityAdded={handleCityAdded}
      />

      {/* نافذة إضافة منطقة جديدة محليًا (للمستخدمين العاديين) */}
      <AddCityManually
        isOpen={isAddCityManuallyOpen}
        onClose={() => setIsAddCityManuallyOpen(false)}
        onCityAdded={handleCityAdded}
      />
    </div>
  );
};

export default StationForm;
