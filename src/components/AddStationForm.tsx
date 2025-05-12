import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@chakra-ui/react';
import { addStation } from '@/services/stationService';

export const AddStationForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    sub_region: '',
    latitude: '',
    longitude: '',
    fuel_types: '',
    additional_info: ''
  });

  // حفظ اللغة الحالية عند تحميل المكون
  useEffect(() => {
    const currentLang = i18n.language;
    localStorage.setItem('preferredLanguage', currentLang);
  }, [i18n.language]);

  // استعادة اللغة المحفوظة عند تغيير الصفحة
  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stationData = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      await addStation(stationData);
      toast({
        title: t('success'),
        description: t('stationAddedSuccessfully'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setFormData({
        name: '',
        region: '',
        sub_region: '',
        latitude: '',
        longitude: '',
        fuel_types: '',
        additional_info: ''
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorAddingStation'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('stationName')}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      {/* باقي حقول النموذج */}
    </form>
  );
}; 