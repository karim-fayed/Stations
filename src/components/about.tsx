import React from 'react';
import { motion } from 'framer-motion';
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserCircle, Award, Users, Target, Globe, Lightbulb } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const About = () => {
  const { language, t } = useLanguage();

  const values = [
    {
      icon: <Award size={32} />,
      titleAr: 'الجودة',
      titleEn: 'Quality',
      descriptionAr: 'نلتزم بتقديم أعلى معايير الجودة في جميع خدماتنا ومنتجاتنا.',
      descriptionEn: 'We are committed to providing the highest quality standards in all our services and products.',
    },
    {
      icon: <Users size={32} />,
      titleAr: 'خدمة العملاء',
      titleEn: 'Customer Service',
      descriptionAr: 'نضع عملاءنا في المقام الأول ونسعى دائمًا لتجاوز توقعاتهم.',
      descriptionEn: 'We put our customers first and always strive to exceed their expectations.',
    },
    {
      icon: <Target size={32} />,
      titleAr: 'الابتكار',
      titleEn: 'Innovation',
      descriptionAr: 'نسعى دائمًا للتطوير والابتكار في جميع جوانب أعمالنا.',
      descriptionEn: 'We constantly seek development and innovation in all aspects of our business.',
    },
    {
      icon: <Globe size={32} />,
      titleAr: 'الاستدامة',
      titleEn: 'Sustainability',
      descriptionAr: 'نلتزم بممارسات الاستدامة والحفاظ على البيئة في جميع عملياتنا.',
      descriptionEn: 'We are committed to sustainability practices and environmental preservation in all our operations.',
    },
  ];
  
  const carouselImages = [
    "https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
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
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-noor-purple to-noor-orange bg-clip-text text-transparent">
            {language === 'ar' ? 'عن نور' : 'About Noor'}
          </h1>

          <div className="mb-12 relative">
            <Carousel
              opts={{
                align: "center",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {carouselImages.map((image, index) => (
                  <CarouselItem key={index} className="relative">
                    <div className="relative h-64 md:h-80 overflow-hidden rounded-lg">
                      <div className="absolute inset-0 bg-gradient-to-r from-noor-purple/20 to-noor-orange/20 rounded-lg z-10"></div>
                      <img 
                        src={image} 
                        alt={`Noor Stations ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-5000 hover:scale-105"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-4">
                <CarouselPrevious className={`relative ${language === 'ar' ? 'mr-2' : 'ml-2'} static`} />
                <CarouselNext className={`relative ${language === 'ar' ? 'ml-2' : 'mr-2'} static`} />
              </div>
            </Carousel>
          </div>

          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="text-2xl font-bold mb-4">
              {language === 'ar' ? 'من نحن' : 'Who We Are'}
            </h2>
            <p className="mb-6">
              {language === 'ar'
                ? 'شركة نور هي واحدة من الشركات الرائدة في مجال محطات الوقود في المملكة العربية السعودية. تأسست الشركة في عام 2010 بهدف تقديم خدمات متميزة في مجال محطات الوقود والخدمات المرافقة لها.'
                : 'Noor Company is one of the leading companies in the field of fuel stations in the Kingdom of Saudi Arabia. The company was established in 2010 with the aim of providing distinguished services in the field of fuel stations and their accompanying services.'}
            </p>
            <p>
              {language === 'ar'
                ? 'نحن نسعى جاهدين لتوفير تجربة متميزة لعملائنا من خلال تقديم خدمات عالية الجودة وضمان راحتهم ورضاهم. نحن نؤمن بأن نجاحنا يعتمد على رضا عملائنا، ولذلك نحرص على تطوير خدماتنا باستمرار لتلبية احتياجاتهم المتغيرة.'
                : 'We strive to provide a distinguished experience for our customers by providing high-quality services and ensuring their comfort and satisfaction. We believe that our success depends on the satisfaction of our customers, and therefore we are keen to continuously develop our services to meet their changing needs.'}
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {language === 'ar' ? 'قيمنا' : 'Our Values'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow p-6 flex items-start gap-4 border-l-4 border-noor-purple"
                >
                  <div className="text-noor-purple">
                    {value.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {language === 'ar' ? value.titleAr : value.titleEn}
                    </h3>
                    <p className="text-gray-600">
                      {language === 'ar' ? value.descriptionAr : value.descriptionEn}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-noor-purple/10 to-noor-orange/10 p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <Lightbulb size={32} className="text-noor-purple" />
              <h2 className="text-2xl font-bold">
                {language === 'ar' ? 'رؤيتنا' : 'Our Vision'}
              </h2>
            </div>
            <p className="mb-6">
              {language === 'ar'
                ? 'أن نكون الشركة الرائدة في مجال محطات الوقود في المملكة العربية السعودية، وأن نقدم خدمات متميزة تلبي احتياجات عملائنا وتتجاوز توقعاتهم.'
                : 'To be the leading company in the field of fuel stations in the Kingdom of Saudi Arabia, and to provide distinguished services that meet the needs of our customers and exceed their expectations.'}
            </p>
            <div className="flex items-center gap-4">
              <Target size={32} className="text-noor-orange" />
              <h2 className="text-2xl font-bold">
                {language === 'ar' ? 'مهمتنا' : 'Our Mission'}
              </h2>
            </div>
            <p>
              {language === 'ar'
                ? 'توفير خدمات عالية الجودة في مجال محطات الوقود والخدمات المرافقة لها، وضمان راحة ورضا عملائنا من خلال الالتزام بأعلى معايير الجودة والسلامة.'
                : 'To provide high-quality services in the field of fuel stations and their accompanying services, and to ensure the comfort and satisfaction of our customers by adhering to the highest standards of quality and safety.'}
            </p>
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

export default About;
