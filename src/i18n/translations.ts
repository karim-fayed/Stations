
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
  login: {
    title: {
      ar: "لوحة تحكم المشرفين",
      en: "Admin Dashboard"
    },
    subtitle: {
      ar: "الرجاء تسجيل الدخول للوصول إلى لوحة التحكم",
      en: "Please login to access the dashboard"
    },
    loginTitle: {
      ar: "تسجيل الدخول",
      en: "Login"
    },
    loginSubtitle: {
      ar: "أدخل بيانات حسابك للوصول إلى لوحة التحكم",
      en: "Enter your account details to access the dashboard"
    },
    email: {
      ar: "البريد الإلكتروني",
      en: "Email"
    },
    password: {
      ar: "كلمة المرور",
      en: "Password"
    },
    loginButton: {
      ar: "تسجيل الدخول",
      en: "Login"
    },
    loggingIn: {
      ar: "جاري تسجيل الدخول...",
      en: "Logging in..."
    },
    loginSuccess: {
      ar: "تم تسجيل الدخول بنجاح",
      en: "Login successful"
    },
    redirecting: {
      ar: "جاري التوجيه...",
      en: "Redirecting..."
    },
    loginError: {
      ar: "خطأ في تسجيل الدخول",
      en: "Login error"
    },
    invalidCredentials: {
      ar: "بيانات الدخول غير صحيحة",
      en: "Invalid credentials"
    },
    error: {
      ar: "خطأ",
      en: "Error"
    },
    enterCredentials: {
      ar: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
      en: "Please enter your email and password"
    },
    testAccounts: {
      ar: "للتجربة استخدم أي من الحسابات التالية:",
      en: "For testing, use any of the following accounts:"
    },
    checkingSession: {
      ar: "جاري التحقق من الجلسة...",
      en: "Checking session..."
    },
    notAdmin: {
      ar: "هذا الحساب ليس لديه صلاحيات إدارية",
      en: "This account does not have admin privileges"
    }
  },
  common: {
    email: {
      ar: "البريد الإلكتروني",
      en: "Email"
    },
    password: {
      ar: "كلمة المرور",
      en: "Password"
    },
    alert: {
      ar: "تنبيه",
      en: "Alert"
    },
    appName: {
      ar: "محطات نور",
      en: "Noor Stations"
    },
    allRightsReserved: {
      ar: "جميع الحقوق محفوظة",
      en: "All rights reserved"
    },
    // Adding missing translations
    home: {
      ar: "الرئيسية",
      en: "Home"
    },
    language: {
      ar: "اللغة",
      en: "Language"
    },
    arabic: {
      ar: "العربية",
      en: "Arabic"
    },
    english: {
      ar: "الإنجليزية",
      en: "English"
    }
  },
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
