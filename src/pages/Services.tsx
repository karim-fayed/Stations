import React from 'react';
import { motion } from 'framer-motion';
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserCircle } from "lucide-react";

const Services = () => {
  const { language, t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col"
    >
      <Toaster />

      <div className="absolute top-4 right-4 z-10">
        <Link to="/admin/login">
          <Button variant="outline" className="flex items-center gap-2 bg-white/80 hover:bg-white">
            <UserCircle size={18} />
            <span className="hidden sm:inline">{t('home', 'adminPanel')}</span>
          </Button>
        </Link>
      </div>

      <Header />

      <main className="flex-grow container mx-auto p-4 md:p-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-noor-purple to-noor-orange bg-clip-text text-transparent">
            {language === 'ar' ? 'خدماتنا' : 'Our Services'}
          </h1>

          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="text-2xl font-bold mb-4">
              {language === 'ar' ? 'خدمات محطات الوقود' : 'Fuel Station Services'}
            </h2>
            <p className="mb-6">
              {language === 'ar'
                ? 'نقدم مجموعة واسعة من خدمات محطات الوقود لتلبية احتياجات عملائنا. تشمل خدماتنا توفير الوقود بأنواعه المختلفة، وخدمات تغيير الزيوت، وغسيل السيارات، وخدمات الصيانة الخفيفة.'
                : 'We offer a wide range of fuel station services to meet the needs of our customers. Our services include providing fuel of various types, oil change services, car wash, and light maintenance services.'}
            </p>
            <h2 className="text-2xl font-bold mb-4">
              {language === 'ar' ? 'خدمات المتجر' : 'Store Services'}
            </h2>
            <p>
              {language === 'ar'
                ? 'بالإضافة إلى خدمات الوقود، نوفر أيضًا مجموعة متنوعة من المنتجات والخدمات في متجرنا. يمكنك العثور على مجموعة متنوعة من المشروبات والوجبات الخفيفة والمنتجات الأخرى التي تحتاجها أثناء التوقف في محطتنا.'
                : 'In addition to fuel services, we also offer a variety of products and services in our store. You can find a variety of drinks, snacks, and other products you need while stopping at our station.'}
            </p>
          </div>

          <div className="bg-gradient-to-r from-noor-purple/10 to-noor-orange/10 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">
              {language === 'ar' ? 'خدمات إضافية' : 'Additional Services'}
            </h2>
            <ul className="list-disc list-inside">
              <li>
                {language === 'ar' ? 'خدمة الواي فاي المجانية' : 'Free Wi-Fi service'}
              </li>
              <li>
                {language === 'ar' ? 'أماكن جلوس مريحة' : 'Comfortable seating areas'}
              </li>
              <li>
                {language === 'ar' ? 'دورات مياه نظيفة' : 'Clean restrooms'}
              </li>
            </ul>
          </div>
        </motion.div>
      </main>

      <footer className={`bg-noor-purple text-white p-4 mt-12`}>
        <div className="container mx-auto text-center">
          <p>
            {language === 'ar'
              ? '© 2025 محطات نور. جميع الحقوق محفوظة.'
              : '© 2025 Noor Stations. All rights reserved.'}
          </p>
        </div>
      </footer>
    </motion.div>
  );
};

export default Services;
