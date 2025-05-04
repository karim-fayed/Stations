
import { motion } from "framer-motion";
import LoginHeader from "@/components/admin/LoginHeader";
import AuthForm from "@/components/admin/AuthForm";
import { useLanguage } from "@/i18n/LanguageContext";

const LoginPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <LoginHeader />
        <AuthForm />
      </motion.div>
    </div>
  );
};

export default LoginPage;
