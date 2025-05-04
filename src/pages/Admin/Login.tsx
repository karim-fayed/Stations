
import { motion } from "framer-motion";
import LoginHeader from "@/components/admin/LoginHeader";
import AuthForm from "@/components/admin/AuthForm";
import { useLanguage } from "@/i18n/LanguageContext";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // تتبع حركة الماوس لتأثير الضوء التفاعلي
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}
      style={{
        background: "linear-gradient(135deg, #2c0f56 0%, #130f40 100%)",
      }}
    >
      {/* كرات زخرفية متحركة في الخلفية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
            x: [0, 20, 0],
            y: [0, -30, 0]
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-noor-purple opacity-20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
          className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-noor-orange opacity-10 blur-3xl"
        />
      </div>

      {/* أضواء تفاعلية تتبع الماوس */}
      <div 
        className="light-effect absolute pointer-events-none opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(102,51,204,0.8) 0%, rgba(102,51,204,0) 70%)",
          width: "30rem",
          height: "30rem",
          borderRadius: "50%",
          transform: `translate(${mousePosition.x - 240}px, ${mousePosition.y - 240}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />

      {/* التأثير المتموج للخلفية */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20"
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(102, 51, 204, 0.4)" }}
          transition={{ duration: 0.5 }}
        >
          <LoginHeader />
          <AuthForm />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
