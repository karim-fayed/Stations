// ملف الترجمات

export type Language = 'ar' | 'en';

export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// الترجمات العربية والإنجليزية
export const translations: Translations = {
  // الترجمات العامة
  common: {
    alert: {
      ar: 'تنبيه',
      en: 'Alert'
    },
    appName: {
      ar: 'محطات نور',
      en: 'Noor Stations'
    },
    loading: {
      ar: 'جاري التحميل...',
      en: 'Loading...'
    },
    save: {
      ar: 'حفظ',
      en: 'Save'
    },
    cancel: {
      ar: 'إلغاء',
      en: 'Cancel'
    },
    edit: {
      ar: 'تعديل',
      en: 'Edit'
    },
    delete: {
      ar: 'حذف',
      en: 'Delete'
    },
    add: {
      ar: 'إضافة',
      en: 'Add'
    },
    search: {
      ar: 'بحث',
      en: 'Search'
    },
    filter: {
      ar: 'تصفية',
      en: 'Filter'
    },
    yes: {
      ar: 'نعم',
      en: 'Yes'
    },
    no: {
      ar: 'لا',
      en: 'No'
    },
    confirm: {
      ar: 'تأكيد',
      en: 'Confirm'
    },
    back: {
      ar: 'رجوع',
      en: 'Back'
    },
    next: {
      ar: 'التالي',
      en: 'Next'
    },
    previous: {
      ar: 'السابق',
      en: 'Previous'
    },
    home: {
      ar: 'الصفحة الرئيسية',
      en: 'Home'
    },
    dashboard: {
      ar: 'لوحة التحكم',
      en: 'Dashboard'
    },
    profile: {
      ar: 'الملف الشخصي',
      en: 'Profile'
    },
    logout: {
      ar: 'تسجيل الخروج',
      en: 'Logout'
    },
    login: {
      ar: 'تسجيل الدخول',
      en: 'Login'
    },
    email: {
      ar: 'البريد الإلكتروني',
      en: 'Email'
    },
    password: {
      ar: 'كلمة المرور',
      en: 'Password'
    },
    name: {
      ar: 'الاسم',
      en: 'Name'
    },
    role: {
      ar: 'الدور',
      en: 'Role'
    },
    actions: {
      ar: 'الإجراءات',
      en: 'Actions'
    },
    status: {
      ar: 'الحالة',
      en: 'Status'
    },
    date: {
      ar: 'التاريخ',
      en: 'Date'
    },
    time: {
      ar: 'الوقت',
      en: 'Time'
    },
    description: {
      ar: 'الوصف',
      en: 'Description'
    },
    details: {
      ar: 'التفاصيل',
      en: 'Details'
    },
    settings: {
      ar: 'الإعدادات',
      en: 'Settings'
    },
    language: {
      ar: 'اللغة',
      en: 'Language'
    },
    arabic: {
      ar: 'العربية',
      en: 'Arabic'
    },
    english: {
      ar: 'الإنجليزية',
      en: 'English'
    },
    changeLanguage: {
      ar: 'تغيير اللغة',
      en: 'Change Language'
    },
    allRightsReserved: {
      ar: 'جميع الحقوق محفوظة',
      en: 'All rights reserved'
    }
  },

  // ترجمات الصفحة الرئيسية
  home: {
    welcome: {
      ar: 'مرحباً بك في محطات نور',
      en: 'Welcome to Noor Stations'
    },
    description: {
      ar: 'نظام إدارة محطات الوقود',
      en: 'Fuel Station Management System'
    },
    loginButton: {
      ar: 'تسجيل الدخول للوحة التحكم',
      en: 'Login to Dashboard'
    },
    stationsCount: {
      ar: 'عدد المحطات',
      en: 'Stations Count'
    },
    searchPlaceholder: {
      ar: 'ابحث عن محطة...',
      en: 'Search for a station...'
    },
    loadingError: {
      ar: 'حدث خطأ أثناء تحميل بيانات المحطات',
      en: 'Error loading station data'
    },
    map: {
      ar: 'الخريطة',
      en: 'Map'
    },
    stationsList: {
      ar: 'قائمة المحطات',
      en: 'Stations List'
    },
    adminPanel: {
      ar: 'لوحة التحكم',
      en: 'Admin Panel'
    }
  },

  // ترجمات لوحة التحكم
  dashboard: {
    title: {
      ar: 'لوحة تحكم محطات نور',
      en: 'Noor Stations Dashboard'
    },
    subtitle: {
      ar: 'إدارة محطات الوقود',
      en: 'Fuel Station Management'
    },
    addStation: {
      ar: 'إضافة محطة جديدة',
      en: 'Add New Station'
    },
    editStation: {
      ar: 'تعديل المحطة',
      en: 'Edit Station'
    },
    deleteStation: {
      ar: 'حذف المحطة',
      en: 'Delete Station'
    },
    deleteConfirmation: {
      ar: 'هل أنت متأكد من حذف المحطة؟',
      en: 'Are you sure you want to delete this station?'
    },
    stationName: {
      ar: 'اسم المحطة',
      en: 'Station Name'
    },
    region: {
      ar: 'المنطقة',
      en: 'Region'
    },
    subRegion: {
      ar: 'الموقع الفرعي',
      en: 'Sub-location'
    },
    location: {
      ar: 'الموقع',
      en: 'Location'
    },
    latitude: {
      ar: 'خط العرض',
      en: 'Latitude'
    },
    longitude: {
      ar: 'خط الطول',
      en: 'Longitude'
    },
    fuelTypes: {
      ar: 'أنواع الوقود',
      en: 'Fuel Types'
    },
    additionalInfo: {
      ar: 'معلومات إضافية',
      en: 'Additional Info'
    },
    stations: {
      ar: 'المحطات',
      en: 'Stations'
    },
    importExport: {
      ar: 'استيراد/تصدير',
      en: 'Import/Export'
    },
    analytics: {
      ar: 'التحليلات',
      en: 'Analytics'
    },
    comingSoon: {
      ar: 'قادم قريباً',
      en: 'Coming Soon'
    },
    analyticsDescription: {
      ar: 'سيتم إضافة ميزات تحليلية متقدمة في التحديث القادم',
      en: 'Advanced analytics features will be added in the next update'
    },
    deleteDuplicates: {
      ar: 'حذف المحطات المكررة',
      en: 'Delete Duplicate Stations'
    }
  },

  // ترجمات إدارة المستخدمين
  userManagement: {
    title: {
      ar: 'إدارة المستخدمين',
      en: 'User Management'
    },
    subtitle: {
      ar: 'إدارة حسابات المستخدمين والصلاحيات',
      en: 'Manage user accounts and permissions'
    },
    addUser: {
      ar: 'إضافة مستخدم جديد',
      en: 'Add New User'
    },
    editUser: {
      ar: 'تعديل المستخدم',
      en: 'Edit User'
    },
    deleteUser: {
      ar: 'حذف المستخدم',
      en: 'Delete User'
    },
    deleteConfirmation: {
      ar: 'هل أنت متأكد من حذف هذا المستخدم؟',
      en: 'Are you sure you want to delete this user?'
    },
    resetPassword: {
      ar: 'إعادة تعيين كلمة المرور',
      en: 'Reset Password'
    },
    sendResetLink: {
      ar: 'إرسال رابط إعادة التعيين',
      en: 'Send Reset Link'
    },
    changePassword: {
      ar: 'تغيير كلمة المرور',
      en: 'Change Password'
    },
    newPassword: {
      ar: 'كلمة المرور الجديدة',
      en: 'New Password'
    },
    confirmPassword: {
      ar: 'تأكيد كلمة المرور',
      en: 'Confirm Password'
    },
    passwordMismatch: {
      ar: 'كلمات المرور غير متطابقة',
      en: 'Passwords do not match'
    },
    owner: {
      ar: 'مالك',
      en: 'Owner'
    },
    admin: {
      ar: 'مدير',
      en: 'Admin'
    },
    user: {
      ar: 'مستخدم',
      en: 'User'
    }
  },

  // ترجمات الملف الشخصي
  profile: {
    title: {
      ar: 'الملف الشخصي',
      en: 'Profile'
    },
    subtitle: {
      ar: 'إدارة معلومات الحساب وكلمة المرور',
      en: 'Manage account information and password'
    },
    accountInfo: {
      ar: 'معلومات الحساب',
      en: 'Account Information'
    },
    changePassword: {
      ar: 'تغيير كلمة المرور',
      en: 'Change Password'
    },
    currentPassword: {
      ar: 'كلمة المرور الحالية',
      en: 'Current Password'
    },
    newPassword: {
      ar: 'كلمة المرور الجديدة',
      en: 'New Password'
    },
    confirmPassword: {
      ar: 'تأكيد كلمة المرور',
      en: 'Confirm Password'
    },
    updatePassword: {
      ar: 'تحديث كلمة المرور',
      en: 'Update Password'
    },
    passwordUpdated: {
      ar: 'تم تحديث كلمة المرور بنجاح',
      en: 'Password updated successfully'
    }
  },

  // ترجمات استيراد/تصدير
  importExport: {
    title: {
      ar: 'استيراد المحطات',
      en: 'Import Stations'
    },
    description: {
      ar: 'قم بتنزيل القالب أدناه للتأكد من صحة تنسيق البيانات',
      en: 'Download the template below to ensure correct data format'
    },
    downloadTemplate: {
      ar: 'تنزيل قالب Excel',
      en: 'Download Excel Template'
    },
    uploadFile: {
      ar: 'تحميل ملف Excel',
      en: 'Upload Excel File'
    },
    chooseFile: {
      ar: 'اختر ملف',
      en: 'Choose File'
    },
    importButton: {
      ar: 'استيراد المحطات',
      en: 'Import Stations'
    },
    exportButton: {
      ar: 'تصدير المحطات',
      en: 'Export Stations'
    },
    importResults: {
      ar: 'نتائج الاستيراد',
      en: 'Import Results'
    },
    successCount: {
      ar: 'تم استيراد {count} محطة بنجاح',
      en: '{count} stations imported successfully'
    },
    failedCount: {
      ar: 'فشل استيراد {count} محطة',
      en: 'Failed to import {count} stations'
    },
    allowDuplicates: {
      ar: 'السماح بإضافة المحطات المكررة',
      en: 'Allow duplicate stations'
    },
    hasHeaderRow: {
      ar: 'الملف يحتوي على صف عناوين',
      en: 'File contains header row'
    },
    expectedFormat: {
      ar: 'تنسيق الملف المتوقع',
      en: 'Expected file format'
    },
    requiredField: {
      ar: 'حقل إلزامي',
      en: 'Required field'
    },
    optionalField: {
      ar: 'حقل اختياري',
      en: 'Optional field'
    }
  },

  // ترجمات تسجيل الدخول
  login: {
    title: {
      ar: 'تسجيل الدخول',
      en: 'Login'
    },
    subtitle: {
      ar: 'قم بتسجيل الدخول للوصول إلى لوحة التحكم',
      en: 'Sign in to access the dashboard'
    },
    emailPlaceholder: {
      ar: 'أدخل البريد الإلكتروني',
      en: 'Enter your email'
    },
    passwordPlaceholder: {
      ar: 'أدخل كلمة المرور',
      en: 'Enter your password'
    },
    loginButton: {
      ar: 'تسجيل الدخول',
      en: 'Login'
    },
    forgotPassword: {
      ar: 'نسيت كلمة المرور؟',
      en: 'Forgot password?'
    },
    invalidCredentials: {
      ar: 'بريد إلكتروني أو كلمة مرور غير صحيحة',
      en: 'Invalid email or password'
    },
    notAdmin: {
      ar: 'هذا الحساب لا يملك صلاحيات المشرف',
      en: 'This account does not have admin privileges'
    },
    checkingSession: {
      ar: 'جاري التحقق من الجلسة...',
      en: 'Checking session...'
    },
    error: {
      ar: 'خطأ في البيانات',
      en: 'Input Error'
    },
    enterCredentials: {
      ar: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور',
      en: 'Please enter your email and password'
    },
    loginError: {
      ar: 'خطأ في تسجيل الدخول',
      en: 'Login Error'
    },
    loginSuccess: {
      ar: 'تم تسجيل الدخول بنجاح',
      en: 'Login Successful'
    },
    redirecting: {
      ar: 'جاري تحويلك إلى لوحة التحكم',
      en: 'Redirecting to dashboard'
    },
    loggingIn: {
      ar: 'جاري تسجيل الدخول...',
      en: 'Logging in...'
    },
    testAccounts: {
      ar: 'حسابات للاختبار:',
      en: 'Test accounts:'
    }
  }
};
