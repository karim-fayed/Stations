import React from 'react';
import { motion } from 'framer-motion';
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserCircle, Fuel, Wrench, Truck, ShoppingBag, Coffee } from "lucide-react";

const Services = () => {
  const { language, t } = useLanguage();

  const services = [
    {
      icon: <Fuel size={40} />,
      titleAr: 'خدمات الوقود',
      titleEn: 'Fuel Services',
      descriptionAr: 'نقدم أنواع متعددة من الوقود عالي الجودة لجميع أنواع المركبات.',
      descriptionEn: 'We offer multiple types of high-quality fuel for all types of vehicles.',
    },
    {
      icon: <Wrench size={40} />,
      titleAr: 'غسيل السيارات',
      titleEn: 'Car Washing',
      descriptionAr: 'خدمات غسيل متكاملة للسيارات من قبل فنيين متخصصين.',
      descriptionEn: 'Comprehensive car washing services by specialized technicians.',
    },
    {
      icon: <Truck size={40} />,
      titleAr: 'خدمات النقل',
      titleEn: 'Transport Services',
      descriptionAr: 'خدمات نقل الوقود للشركات والمؤسسات بأسعار تنافسية.',
      descriptionEn: 'Fuel transportation services for companies and institutions at competitive prices.',
    },
    {
      icon: <ShoppingBag size={40} />,
      titleAr: 'متاجر التسوق',
      titleEn: 'Convenience Stores',
      descriptionAr: 'متاجر متكاملة توفر جميع احتياجاتك اليومية.',
      descriptionEn: 'Integrated stores that provide all your daily needs.',
    },
    {
      icon: <Coffee size={40} />,
      titleAr: 'المقاهي',
      titleEn: 'Cafes',
      descriptionAr: 'مقاهي مريحة لاستراحة ممتعة أثناء رحلتك.',
      descriptionEn: 'Comfortable cafes for an enjoyable break during your journey.',
    },
  ];

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
        >
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-noor-purple to-noor-orange bg-clip-text text-transparent">
            {language === 'ar' ? 'خدماتنا' : 'Our Services'}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-t-4 border-noor-purple"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 text-noor-purple">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {language === 'ar' ? service.titleAr : service.titleEn}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'ar' ? service.descriptionAr : service.descriptionEn}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-gray-50 p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {language === 'ar' ? 'خدمات للشركات' : 'Corporate Services'}
            </h2>
            <p className="text-center mb-6">
              {language === 'ar'
                ? 'نقدم خدمات خاصة للشركات والمؤسسات بأسعار تنافسية وجودة عالية.'
                : 'We offer special services for companies and institutions at competitive prices and high quality.'}
            </p>
            <div className="flex justify-center">
              <Button className="bg-gradient-to-r from-noor-purple to-noor-orange text-white hover:opacity-90">
                {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className={`bg-noor-purple text-white p-4`}>
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
