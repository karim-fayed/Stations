import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserCircle, Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Contact = () => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: language === 'ar' ? 'تم إرسال رسالتك بنجاح' : 'Your message has been sent successfully',
        description: language === 'ar' ? 'سنتواصل معك قريبًا' : 'We will contact you soon',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <Phone size={24} />,
      titleAr: 'اتصل بنا',
      titleEn: 'Call Us',
      contentAr: '+966 12 345 6789',
      contentEn: '+966 12 345 6789',
    },
    {
      icon: <Mail size={24} />,
      titleAr: 'البريد الإلكتروني',
      titleEn: 'Email',
      contentAr: 'info@noor-stations.com',
      contentEn: 'info@noor-stations.com',
    },
    {
      icon: <MapPin size={24} />,
      titleAr: 'العنوان',
      titleEn: 'Address',
      contentAr: 'الرياض، المملكة العربية السعودية',
      contentEn: 'Riyadh, Saudi Arabia',
    },
    {
      icon: <Clock size={24} />,
      titleAr: 'ساعات العمل',
      titleEn: 'Working Hours',
      contentAr: '24 ساعة / 7 أيام في الأسبوع',
      contentEn: '24 hours / 7 days a week',
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
            {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">
                  {language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                </h2>
                <div className="space-y-4">
                  {contactInfo.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="text-noor-purple">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {language === 'ar' ? item.titleAr : item.titleEn}
                        </h3>
                        <p className="text-gray-600">
                          {language === 'ar' ? item.contentAr : item.contentEn}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 h-[300px]">
                <h2 className="text-xl font-bold mb-4">
                  {language === 'ar' ? 'موقعنا' : 'Our Location'}
                </h2>
                <div className="bg-gray-200 h-full rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">
                    {language === 'ar' ? 'خريطة جوجل ستظهر هنا' : 'Google Map will appear here'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">
                {language === 'ar' ? 'أرسل لنا رسالة' : 'Send Us a Message'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder={language === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">
                    {language === 'ar' ? 'الرسالة' : 'Message'}
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="mt-1 min-h-[120px]"
                    placeholder={language === 'ar' ? 'اكتب رسالتك هنا' : 'Write your message here'}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-noor-purple to-noor-orange text-white hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>{language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send size={16} />
                      <span>{language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}</span>
                    </div>
                  )}
                </Button>
              </form>
            </div>
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

export default Contact;
