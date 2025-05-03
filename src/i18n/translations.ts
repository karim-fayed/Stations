
// Define the structure of the translations
export interface Translations {
  [key: string]: {
    [key: string]: {
      ar: string;
      en: string;
    };
  };
}

// The translations data
export const translations: Translations = {
  home: {
    loadingError: {
      ar: "حدث خطأ أثناء تحميل البيانات",
      en: "An error occurred while loading data"
    },
    map: {
      ar: "الخريطة",
      en: "Map"
    },
    stationsList: {
      ar: "قائمة المحطات",
      en: "Stations List"
    },
    adminPanel: {
      ar: "لوحة التحكم",
      en: "Admin Panel"
    }
  },
  // Additional sections can be added here
  errors: {
    networkError: {
      ar: "خطأ في الاتصال بالشبكة",
      en: "Network connection error"
    },
    serverError: {
      ar: "خطأ في الخادم",
      en: "Server error"
    },
    unauthorizedError: {
      ar: "غير مصرح لك بالوصول",
      en: "Unauthorized access"
    },
    notFoundError: {
      ar: "لم يتم العثور على البيانات المطلوبة",
      en: "Requested data not found"
    }
  }
};
