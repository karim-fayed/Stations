
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface MapboxTokenInputProps {
  language: 'ar' | 'en';
  onTokenSaved: () => void;
}

const MapboxTokenInput: React.FC<MapboxTokenInputProps> = ({ language, onTokenSaved }) => {
  const [token, setToken] = useState<string>(localStorage.getItem('MAPBOX_TOKEN') || '');
  const { toast } = useToast();
  const isArabic = language === 'ar';

  const saveToken = () => {
    if (token.trim()) {
      localStorage.setItem('MAPBOX_TOKEN', token.trim());
      toast({
        title: isArabic ? 'تم حفظ الرمز بنجاح' : 'Token saved successfully',
        description: isArabic ? 'جاري تحديث الخريطة...' : 'Updating map...',
      });
      onTokenSaved();
    } else {
      toast({
        title: isArabic ? 'الرمز مطلوب' : 'Token is required',
        description: isArabic ? 'يرجى إدخال رمز صالح' : 'Please enter a valid token',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto my-4">
      <div className={`space-y-4 ${isArabic ? 'text-right' : 'text-left'}`}>
        <h3 className="text-lg font-bold text-noor-purple">
          {isArabic ? 'إدخال رمز Mapbox' : 'Enter Mapbox Token'}
        </h3>
        
        <p className="text-gray-600 text-sm">
          {isArabic
            ? 'للاستمرار بعرض الخرائط، يرجى إدخال رمز Mapbox الخاص بك.'
            : 'To continue viewing maps, please enter your Mapbox token.'}
        </p>
        
        <div className="space-y-2">
          <label htmlFor="mapbox-token" className="text-sm font-medium">
            {isArabic ? 'رمز Mapbox' : 'Mapbox Token'}
          </label>
          <Input
            id="mapbox-token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={isArabic ? 'أدخل رمز Mapbox هنا...' : 'Enter your Mapbox token here...'}
            className="w-full"
            dir={isArabic ? 'rtl' : 'ltr'}
          />
        </div>
        
        <p className="text-xs text-gray-500">
          {isArabic
            ? 'يمكنك الحصول على رمز Mapbox من لوحة تحكم Mapbox الخاصة بك.'
            : 'You can get your Mapbox token from your Mapbox dashboard.'}
        </p>
        
        <div className="pt-2">
          <Button 
            onClick={saveToken} 
            className="w-full bg-noor-purple hover:bg-purple-800"
          >
            {isArabic ? 'حفظ وتحديث الخريطة' : 'Save & Update Map'}
          </Button>
        </div>

        <p className="text-xs text-gray-400">
          {isArabic
            ? 'سيتم تخزين الرمز محليًا في متصفحك فقط.'
            : 'Your token will only be stored locally in your browser.'}
        </p>

        <div className="border-t border-gray-200 pt-3 mt-3">
          <a 
            href="https://account.mapbox.com/access-tokens/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline"
          >
            {isArabic ? 'الحصول على رمز Mapbox' : 'Get a Mapbox token'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default MapboxTokenInput;
