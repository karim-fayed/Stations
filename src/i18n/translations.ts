
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
      ar: "تسجيل الدخول",
      en: "Login"
    },
    subtitle: {
      ar: "قم بتسجيل الدخول للوصول إلى لوحة التحكم",
      en: "Sign in to access the dashboard"
    },
    error: {
      ar: "خطأ",
      en: "Error"
    },
    enterCredentials: {
      ar: "الرجاء إدخال البريد الإلكتروني وكلمة المرور",
      en: "Please enter email and password"
    },
    loginError: {
      ar: "خطأ في تسجيل الدخول",
      en: "Login Error"
    },
    invalidCredentials: {
      ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      en: "Invalid email or password"
    },
    loginSuccess: {
      ar: "تم تسجيل الدخول بنجاح",
      en: "Login Successful"
    },
    redirecting: {
      ar: "جاري التحويل إلى لوحة التحكم",
      en: "Redirecting to dashboard"
    },
    notAdmin: {
      ar: "هذا الحساب ليس لديه صلاحيات إدارية",
      en: "This account does not have admin privileges"
    },
    loggingIn: {
      ar: "جاري تسجيل الدخول...",
      en: "Logging in..."
    },
    loginButton: {
      ar: "تسجيل الدخول",
      en: "Login"
    },
    checkingSession: {
      ar: "جاري التحقق من الجلسة...",
      en: "Checking session..."
    },
    email: {
      ar: "البريد الإلكتروني",
      en: "Email"
    },
    password: {
      ar: "كلمة المرور",
      en: "Password"
    },
    forgotPassword: {
      ar: "نسيت كلمة المرور؟",
      en: "Forgot password?"
    },
    rememberMe: {
      ar: "تذكرني",
      en: "Remember me"
    }
  },
  common: {
    alert: {
      ar: "تنبيه",
      en: "Alert"
    },
    email: {
      ar: "البريد الإلكتروني",
      en: "Email"
    },
    password: {
      ar: "كلمة المرور",
      en: "Password"
    },
    copyright: {
      ar: "محطات نور 2025 - جميع الحقوق محفوظة",
      en: "Noor Stations 2025 - All Rights Reserved"
    },
    loading: {
      ar: "جاري التحميل...",
      en: "Loading..."
    },
    error: {
      ar: "خطأ",
      en: "Error"
    },
    success: {
      ar: "تم بنجاح",
      en: "Success"
    },
    warning: {
      ar: "تحذير",
      en: "Warning"
    },
    info: {
      ar: "معلومات",
      en: "Information"
    },
    save: {
      ar: "حفظ",
      en: "Save"
    },
    cancel: {
      ar: "إلغاء",
      en: "Cancel"
    },
    delete: {
      ar: "حذف",
      en: "Delete"
    },
    edit: {
      ar: "تعديل",
      en: "Edit"
    },
    add: {
      ar: "إضافة",
      en: "Add"
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
