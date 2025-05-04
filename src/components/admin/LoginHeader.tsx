import { useLanguage } from "@/i18n/LanguageContext";

const LoginHeader = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className={`text-center mb-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <img
        src="/lovable-uploads/7d04d515-ba22-4ed7-9bba-9b93a0f1eba3.png"
        alt="Noor Stations Logo"
        className="mx-auto h-24 w-auto"
      />
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
        لوحة المشرفين
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        الرجاء تسجيل الدخول للوصول إلى لوحة التحكم
      </p>
    </div>
  );
};

export default LoginHeader;
