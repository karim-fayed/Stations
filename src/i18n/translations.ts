
// تصدير نوع اللغة
export enum Language {
  ENGLISH = 'en',
  ARABIC = 'ar'
}

// تعريف نموذج لهيكل الترجمات
export interface TranslationSchema {
  common: {
    language: string;
    arabic: string;
    english: string;
    home: string;
    about: string;
    services: string;
    contact: string;
    login: string;
    logout: string;
    dashboard: string;
    adminPanel: string;
  };
  home: {
    stations: string;
    map: string;
    stationsList: string;
    loadingError: string;
  };
  map: {
    getLocation: string;
    directions: string;
    nearestStation: string;
    reset: string;
    findNearest: string;
    locationDetecting: string;
    pleaseWait: string;
    locationDetected: string;
    nearestStationIs: string;
    showingDirections: string;
    directionsTo: string;
    meters: string;
    kilometers: string;
    locationError: string;
    enableLocation: string;
    fuelTypes: string;
    region: string;
    subRegion: string;
    distance: string;
    name: string;
    clickForDetails: string;
    selectCity: string;
    searchStation: string;
    noResults: string;
    searchResults: string;
  };
  admin: {
    about: string;
    contact: string;
    services: string;
    login: string;
    logout: string;
    dashboard: string;
    profile: string;
    users: string;
    stations: string;
    overview: string;
    manageUsers: string;
    addStation: string;
    editStation: string;
    deleteStation: string;
    name: string;
    region: string;
    subRegion: string;
    latitude: string;
    longitude: string;
    fuelTypes: string;
    additionalInfo: string;
    save: string;
    cancel: string;
    areYouSure: string;
    thisActionCannotBeUndone: string;
    delete: string;
    edit: string;
    noStationsFound: string;
    search: string;
    userManagement: string;
    createUser: string;
    email: string;
    role: string;
    password: string;
    confirmPassword: string;
    updateUser: string;
    resetPassword: string;
    admin: string;
    user: string;
    phoneNumber: string;
    address: string;
    updateProfile: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    updatePassword: string;
    passwordNotMatch: string;
    profileUpdatedSuccessfully: string;
    passwordUpdatedSuccessfully: string;
    invalidCurrentPassword: string;
    create: string;
    pleaseWait: string;
    userCreatedSuccessfully: string;
    userUpdatedSuccessfully: string;
    userDeletedSuccessfully: string;
    invalidEmailFormat: string;
    passwordMustBeAtLeast8Characters: string;
    passwordsDoNotMatch: string;
    errorCreatingUser: string;
    errorUpdatingUser: string;
    errorDeletingUser: string;
    errorResettingPassword: string;
  };
  services: {
    title: string;
    corporateServices: string;
    corporateDescription: string;
    contactUs: string;
  };
}

// تعريف الترجمات بشكل منظم حسب اللغة والقسم
export const translations: Record<Language, TranslationSchema> = {
  [Language.ENGLISH]: {
    common: {
      language: "Language",
      arabic: "Arabic",
      english: "English",
      home: "Home",
      about: "About",
      services: "Services",
      contact: "Contact",
      login: "Login",
      logout: "Logout",
      dashboard: "Dashboard",
      adminPanel: "Admin Panel",
    },
    home: {
      stations: "Stations",
      map: "Map",
      stationsList: "Stations List",
      loadingError: "Error loading stations",
    },
    map: {
      getLocation: "Get Your Location",
      directions: "Show Directions",
      nearestStation: "Nearest Station",
      reset: "Reset",
      findNearest: "Find Nearest Station",
      locationDetecting: "Detecting your location",
      pleaseWait: "Please wait a moment...",
      locationDetected: "Location detected",
      nearestStationIs: "Your nearest station is",
      showingDirections: "Showing Directions",
      directionsTo: "Showing directions to",
      meters: "meters",
      kilometers: "km",
      locationError: "Location Error",
      enableLocation: "Please enable location services",
      fuelTypes: "Fuel Types:",
      region: "Region:",
      subRegion: "Location:",
      distance: "Distance:",
      name: "Name:",
      clickForDetails: "Click for details",
      selectCity: "Select City",
      searchStation: "Search for a station...",
      noResults: "No search results",
      searchResults: "Search results",
    },
    admin: {
      about: "About",
      contact: "Contact",
      services: "Services",
      login: "Login",
      logout: "Logout",
      dashboard: "Dashboard",
      profile: "Profile",
      users: "Users",
      stations: "Stations",
      overview: "Overview",
      manageUsers: "Manage Users",
      addStation: "Add Station",
      editStation: "Edit Station",
      deleteStation: "Delete Station",
      name: "Name",
      region: "Region",
      subRegion: "Sub Region",
      latitude: "Latitude",
      longitude: "Longitude",
      fuelTypes: "Fuel Types",
      additionalInfo: "Additional Info",
      save: "Save",
      cancel: "Cancel",
      areYouSure: "Are you sure?",
      thisActionCannotBeUndone: "This action cannot be undone.",
      delete: "Delete",
      edit: "Edit",
      noStationsFound: "No stations found.",
      search: "Search...",
      userManagement: "User Management",
      createUser: "Create User",
      email: "Email",
      role: "Role",
      password: "Password",
      confirmPassword: "Confirm Password",
      updateUser: "Update User",
      resetPassword: "Reset Password",
      admin: "Admin",
      user: "User",
      phoneNumber: "Phone Number",
      address: "Address",
      updateProfile: "Update Profile",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      updatePassword: "Update Password",
      passwordNotMatch: "Passwords do not match",
      profileUpdatedSuccessfully: "Profile updated successfully",
      passwordUpdatedSuccessfully: "Password updated successfully",
      invalidCurrentPassword: "Invalid current password",
      create: "Create",
      pleaseWait: "Please wait...",
      userCreatedSuccessfully: "User created successfully",
      userUpdatedSuccessfully: "User updated successfully",
      userDeletedSuccessfully: "User deleted successfully",
      invalidEmailFormat: "Invalid email format",
      passwordMustBeAtLeast8Characters: "Password must be at least 8 characters",
      passwordsDoNotMatch: "Passwords do not match",
      errorCreatingUser: "Error creating user",
      errorUpdatingUser: "Error updating user",
      errorDeletingUser: "Error deleting user",
      errorResettingPassword: "Error resetting password",
    },
    services: {
      title: "Our Services",
      corporateServices: "Corporate Services",
      corporateDescription: "We offer special services for companies and institutions at competitive prices and high quality.",
      contactUs: "Contact Us",
    }
  },
  [Language.ARABIC]: {
    common: {
      language: "اللغة",
      arabic: "عربي",
      english: "إنجليزي",
      home: "الرئيسية",
      about: "عن المحطات",
      services: "الخدمات",
      contact: "اتصل بنا",
      login: "تسجيل الدخول",
      logout: "تسجيل الخروج",
      dashboard: "لوحة التحكم",
      adminPanel: "لوحة الإدارة",
    },
    home: {
      stations: "المحطات",
      map: "الخريطة",
      stationsList: "قائمة المحطات",
      loadingError: "خطأ في تحميل المحطات",
    },
    map: {
      getLocation: "تحديد موقعك",
      directions: "عرض الاتجاهات",
      nearestStation: "أقرب محطة إليك",
      reset: "إعادة تعيين",
      findNearest: "البحث عن أقرب محطة",
      locationDetecting: "جاري تحديد موقعك",
      pleaseWait: "يرجى الانتظار قليلاً...",
      locationDetected: "تم تحديد موقعك",
      nearestStationIs: "أقرب محطة إليك هي",
      showingDirections: "جاري عرض الاتجاهات",
      directionsTo: "جاري عرض الاتجاهات إلى",
      meters: "متر",
      kilometers: "كم",
      locationError: "خطأ في تحديد الموقع",
      enableLocation: "يرجى تفعيل خدمة تحديد الموقع",
      fuelTypes: "أنواع الوقود:",
      region: "المنطقة:",
      subRegion: "الموقع:",
      distance: "المسافة:",
      name: "الاسم:",
      clickForDetails: "اضغط للتفاصيل",
      selectCity: "اختر مدينة",
      searchStation: "البحث عن محطة...",
      noResults: "لا توجد نتائج للبحث",
      searchResults: "نتائج البحث",
    },
    admin: {
      about: "عن",
      contact: "اتصل",
      services: "خدمات",
      login: "تسجيل الدخول",
      logout: "تسجيل الخروج",
      dashboard: "لوحة التحكم",
      profile: "الملف الشخصي",
      users: "المستخدمين",
      stations: "المحطات",
      overview: "نظرة عامة",
      manageUsers: "إدارة المستخدمين",
      addStation: "إضافة محطة",
      editStation: "تعديل محطة",
      deleteStation: "حذف محطة",
      name: "اسم",
      region: "منطقة",
      subRegion: "المنطقة الفرعية",
      latitude: "خط العرض",
      longitude: "خط الطول",
      fuelTypes: "أنواع الوقود",
      additionalInfo: "معلومات إضافية",
      save: "حفظ",
      cancel: "إلغاء",
      areYouSure: "هل أنت متأكد؟",
      thisActionCannotBeUndone: "لا يمكن التراجع عن هذا الإجراء.",
      delete: "حذف",
      edit: "تعديل",
      noStationsFound: "لم يتم العثور على محطات.",
      search: "بحث...",
      userManagement: "إدارة المستخدمين",
      createUser: "إنشاء مستخدم",
      email: "بريد إلكتروني",
      role: "وظيفة",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      updateUser: "تحديث المستخدم",
      resetPassword: "إعادة تعيين كلمة المرور",
      admin: "مدير",
      user: "مستخدم",
      phoneNumber: "رقم الهاتف",
      address: "عنوان",
      updateProfile: "تحديث الملف الشخصي",
      currentPassword: "كلمة المرور الحالية",
      newPassword: "كلمة المرور الجديدة",
      confirmNewPassword: "تأكيد كلمة المرور الجديدة",
      updatePassword: "تحديث كلمة المرور",
      passwordNotMatch: "كلمات المرور غير متطابقة",
      profileUpdatedSuccessfully: "تم تحديث الملف الشخصي بنجاح",
      passwordUpdatedSuccessfully: "تم تحديث كلمة المرور بنجاح",
      invalidCurrentPassword: "كلمة المرور الحالية غير صحيحة",
      create: "إنشاء",
      pleaseWait: "أرجو الإنتظار...",
      userCreatedSuccessfully: "تم إنشاء المستخدم بنجاح",
      userUpdatedSuccessfully: "تم تحديث المستخدم بنجاح",
      userDeletedSuccessfully: "تم حذف المستخدم بنجاح",
      invalidEmailFormat: "تنسيق البريد الإلكتروني غير صالح",
      passwordMustBeAtLeast8Characters: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل",
      passwordsDoNotMatch: "كلمات المرور غير متطابقة",
      errorCreatingUser: "خطأ في إنشاء المستخدم",
      errorUpdatingUser: "خطأ في تحديث المستخدم",
      errorDeletingUser: "خطأ في حذف المستخدم",
      errorResettingPassword: "خطأ في إعادة تعيين كلمة المرور",
    },
    services: {
      title: "خدماتنا",
      corporateServices: "خدمات للشركات",
      corporateDescription: "نقدم خدمات خاصة للشركات والمؤسسات بأسعار تنافسية وجودة عالية.",
      contactUs: "تواصل معنا",
    }
  }
};
