import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserCircle, Award, Users, Target, Globe, Lightbulb, PlayCircle } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { supabase } from '@/integrations/supabase/client';
import { TablesInsert } from '@/integrations/supabase/types';
import { useUserLocation } from '@/hooks/useUserLocation';

import noor1 from '../assets/noor1.jpg';
import noor2 from '../assets/noor2.jpg';
import noor3 from '../assets/noor3.jpg';
import noor4 from '../assets/noor4.jpg';
import aboutVideo from '../assets/video.mp4';

const aboutImages = [noor1, noor2, noor3, noor4];

const About = () => {
  const { language, t } = useLanguage();
  const [showVideo, setShowVideo] = useState(false);

  const introText = language === 'ar'
    ? 'محطات نور: الجودة، الابتكار، والراحة في كل محطة. منذ 2010 ونحن نرتقي بتجربة التزود بالوقود في المملكة.'
    : 'Noor Stations: Quality, innovation, and comfort at every stop. Since 2010, we elevate the fueling experience in Saudi Arabia.';

  const values = [
    {
      icon: <Award size={28} />, titleAr: 'الجودة', titleEn: 'Quality',
      descAr: 'معايير عالمية في كل خدمة ومنتج.', descEn: 'World-class standards in every service and product.'
    },
    {
      icon: <Users size={28} />, titleAr: 'العميل أولاً', titleEn: 'Customer First',
      descAr: 'رضاكم هدفنا وراحتكم رسالتنا.', descEn: 'Your satisfaction is our goal, your comfort our mission.'
    },
    {
      icon: <Target size={28} />, titleAr: 'الابتكار', titleEn: 'Innovation',
      descAr: 'حلول ذكية وتجربة عصرية.', descEn: 'Smart solutions and a modern experience.'
    },
    {
      icon: <Globe size={28} />, titleAr: 'الاستدامة', titleEn: 'Sustainability',
      descAr: 'نحافظ على البيئة ونلتزم بالتطوير.', descEn: 'We care for the environment and commit to progress.'
    },
  ];
  
  const carouselImages = [
    "https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  ];

  const FeedbackForm = () => {
    const [customerName, setCustomerName] = useState('');
    const [qualityRating, setQualityRating] = useState(5);
    const [appRating, setAppRating] = useState(5);
    const [suggestion, setSuggestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const location = useUserLocation();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess(false);
      const feedbackData: any = {
        customer_name: customerName,
        quality_rating: qualityRating,
        app_rating: appRating,
        suggestion,
        latitude: location?.latitude,
        longitude: location?.longitude,
      };
      const { error } = await supabase.from('feedback').insert([feedbackData]);
      setLoading(false);
      if (error) {
        setError('حدث خطأ أثناء إرسال التقييم. حاول مرة أخرى.');
      } else {
        setSuccess(true);
        setCustomerName('');
        setQualityRating(5);
        setAppRating(5);
        setSuggestion('');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="bg-white/90 rounded-xl shadow p-6 max-w-xl mx-auto mt-8">
        <h3 className="text-xl font-bold mb-4 text-noor-purple">شاركنا رأيك في الخدمة والبرنامج</h3>
        <div className="mb-3">
          <label className="block mb-1 font-medium">اسم العميل</label>
          <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-noor-purple" placeholder="اكتب اسمك" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">تقييم الجودة</label>
          <StarRating value={qualityRating} onChange={setQualityRating} />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">تقييم البرنامج</label>
          <StarRating value={appRating} onChange={setAppRating} />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">اقتراح (اختياري)</label>
          <textarea value={suggestion} onChange={e => setSuggestion(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-noor-purple" rows={3} placeholder="اكتب اقتراحك إن وجد" />
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">تم إرسال التقييم بنجاح. شكرًا لملاحظاتك!</div>}
        <button type="submit" disabled={loading} className="bg-noor-purple text-white px-6 py-2 rounded hover:bg-noor-orange transition">
          {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
        </button>
      </form>
    );
  };

  // مكون تقييم النجوم
  const StarRating = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          onClick={() => onChange(star)}
          className={`cursor-pointer text-2xl ${star <= value ? 'text-noor-orange' : 'text-gray-300'}`}
        >★</span>
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-gradient-to-br from-white via-noor-orange/10 to-noor-purple/10"
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

      <main className="flex-grow container mx-auto p-4 md:p-8">
        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-4 bg-gradient-to-r from-noor-purple to-noor-orange bg-clip-text text-transparent drop-shadow-lg"
        >
          {language === 'ar' ? 'من نحن' : 'Who we are'}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center text-lg md:text-xl mb-8 text-gray-700 max-w-2xl mx-auto"
        >
          {introText}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {aboutImages.map((img, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="rounded-xl overflow-hidden shadow-lg bg-white/80 border border-noor-purple/10"
            >
              <img
                src={img}
                alt={`Noor Station ${idx + 1}`}
                className="w-full h-40 object-cover transition duration-300"
                loading="lazy"
                onError={e => (e.currentTarget.src = 'https://via.placeholder.com/300x160?text=Noor+Station')}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mb-12 flex flex-col items-center"
        >
          <div className="relative w-full max-w-2xl rounded-xl overflow-hidden shadow-lg">
            {!showVideo ? (
              <div className="relative cursor-pointer group" onClick={() => setShowVideo(true)}>
                <img
                  src={aboutImages[0]}
                  alt="Noor Station Video Preview"
                  className="w-full h-64 object-cover group-hover:brightness-90 transition duration-300"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40"
                >
                  <PlayCircle size={64} className="text-white drop-shadow-lg" />
                </motion.button>
              </div>
            ) : (
              <video
                src={aboutVideo}
                controls
                autoPlay
                className="w-full h-64 object-cover bg-black"
                poster={aboutImages[0]}
              />
            )}
          </div>
          <span className="mt-2 text-gray-600 text-sm">
            {language === 'ar' ? 'شاهد الفيديو التعريفي لنور خوي' : 'Watch Noor Khouy Intro Video'}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mb-12"
        >
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
                className="bg-white rounded-lg shadow p-6 flex items-start gap-4 border-l-4 border-noor-purple hover:scale-[1.03] transition-transform duration-300"
              >
                <div className="text-noor-purple">
                  {value.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {language === 'ar' ? value.titleAr : value.titleEn}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'ar' ? value.descAr : value.descEn}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="bg-gradient-to-r from-noor-purple/10 to-noor-orange/10 p-6 rounded-lg shadow-md max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-4">
            <Lightbulb size={32} className="text-noor-purple" />
            <h2 className="text-2xl font-bold">
              {language === 'ar' ? 'رؤيتنا' : 'Our Vision'}
            </h2>
          </div>
          <p className="mb-6">
            {language === 'ar'
              ? 'أن نكون الخيار الأول لمحطات الوقود في المملكة، ونقود الابتكار في الخدمات والراحة.'
              : 'To be the first choice for fuel stations in the Kingdom, leading innovation in service and comfort.'}
          </p>
          <div className="flex items-center gap-4">
            <Target size={32} className="text-noor-orange" />
            <h2 className="text-2xl font-bold">
              {language === 'ar' ? 'مهمتنا' : 'Our Mission'}
            </h2>
          </div>
          <p>
            {language === 'ar'
              ? 'تقديم خدمات وقود متطورة وآمنة، مع ضمان راحة ورضا عملائنا في كل زيارة.'
              : 'To provide advanced and safe fueling services, ensuring comfort and satisfaction for our customers at every visit.'}
          </p>
        </motion.div>

        <FeedbackForm />
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
