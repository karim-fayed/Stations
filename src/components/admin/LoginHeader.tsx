
import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";

const LoginHeader = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const textVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (i: number) => ({ 
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.8,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className={`text-center mb-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 10,
          delay: 0.2
        }}
        whileHover={{ rotate: 5, scale: 1.05 }}
        className="flex justify-center"
      >
        <img
          src="/lovable-uploads/7d04d515-ba22-4ed7-9bba-9b93a0f1eba3.png"
          alt="Noor Stations Logo"
          className="h-28 w-auto drop-shadow-lg"
        />
      </motion.div>
      
      <motion.h2 
        custom={0}
        initial="hidden"
        animate="visible"
        variants={textVariants}
        className="mt-6 text-3xl font-extrabold text-white"
      >
        لوحة المشرفين
      </motion.h2>
      
      <motion.p 
        custom={1}
        initial="hidden"
        animate="visible"
        variants={textVariants}
        className="mt-2 text-sm text-white/80"
      >
        الرجاء تسجيل الدخول للوصول إلى لوحة التحكم
      </motion.p>
    </div>
  );
};

export default LoginHeader;
