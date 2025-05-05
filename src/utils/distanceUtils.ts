/**
 * حساب المسافة بين نقطتين جغرافيتين
 * @param lat1 خط العرض للنقطة الأولى
 * @param lon1 خط الطول للنقطة الأولى
 * @param lat2 خط العرض للنقطة الثانية
 * @param lon2 خط الطول للنقطة الثانية
 * @returns المسافة بالكيلومترات
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // نصف قطر الأرض بالكيلومترات
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // المسافة بالكيلومترات
  return distance;
};

/**
 * تنسيق المسافة لعرضها بشكل مناسب
 * @param distanceInKm المسافة بالكيلومترات
 * @param language اللغة المستخدمة (ar أو en)
 * @returns نص المسافة المنسق
 */
export const formatDistance = (distanceInKm: number, language: 'ar' | 'en'): string => {
  if (distanceInKm < 0.1) {
    // أقل من 100 متر
    const meters = Math.round(distanceInKm * 1000);
    return `${meters} ${language === 'ar' ? 'متر' : 'meters'}`;
  } else if (distanceInKm < 1) {
    // أقل من كيلومتر
    const meters = Math.round(distanceInKm * 1000);
    return `${meters} ${language === 'ar' ? 'متر' : 'meters'}`;
  } else if (distanceInKm < 10) {
    // أقل من 10 كيلومترات - عرض رقم عشري واحد
    return `${distanceInKm.toFixed(1)} ${language === 'ar' ? 'كم' : 'km'}`;
  } else {
    // أكثر من 10 كيلومترات - عرض رقم صحيح
    return `${Math.round(distanceInKm)} ${language === 'ar' ? 'كم' : 'km'}`;
  }
};
