
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GasStation } from "@/types/station";

interface StationFormProps {
  station: Partial<GasStation>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  title: string;
  description: string;
}

const StationForm = ({
  station,
  onInputChange,
  onCancel,
  onSubmit,
  submitLabel,
  title,
  description,
}: StationFormProps) => {
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
          <Input
            id="region"
            name="region"
            value={station.region || ""}
            onChange={onInputChange}
            placeholder="مثال: الرياض"
            required
          />
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
    </div>
  );
};

export default StationForm;
