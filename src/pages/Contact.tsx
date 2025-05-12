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
import FeedbackForm from '@/components/FeedbackForm';

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
      contentAr: '+966 8003033313',
      contentEn: '+966 8003033313',
      onClick: () => window.open('tel:+9668003033313', '_self'),
    },
    {
      icon: <Mail size={24} />,
      titleAr: 'البريد الإلكتروني',
      titleEn: 'Email',
      contentAr: 'info@noor.com.sa',
      contentEn: 'info@noor.com.sa',
      onClick: () => window.open('mailto:info@noor.com.sa', '_self'),
    },
    {
      icon: <MapPin size={24} />,
      titleAr: 'العنوان',
      titleEn: 'Address',
      contentAr: 'نجران، المملكة العربية السعودية',
      contentEn: 'Najran, Saudi Arabia',
      onClick: () => {
        if (confirm('هل تود الانتقال إلى موقع الشركة على خريطة Google؟')) {
          window.open(
            'https://www.google.com/maps/place/NJGA8170،+8170+الغويلا+144،+3330،+حي+الغويلا+ب،+نجران+66231',
            '_blank'
          );
        }
      },
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
                      <div className="text-noor-purple">{item.icon}</div>
                      <div>
                        <h3 className="font-medium">
                          {language === 'ar' ? item.titleAr : item.titleEn}
                        </h3>
                        <p
                          onClick={item.onClick ? item.onClick : undefined} // إضافة onClick للنص فقط
                          className={`text-gray-600 ${
                            item.onClick ? 'cursor-pointer underline hover:text-noor-purple' : ''
                          }`} // تسطير النص وتغيير اللون عند التمرير
                          title={
                            item.onClick
                              ? language === 'ar'
                                ? 'انقر للتفاعل'
                                : 'Click to interact'
                              : undefined
                          } // إضافة تلميح عند التمرير
                        >
                          {language === 'ar' ? item.contentAr : item.contentEn}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 h-[350px]">
                <h2 className="text-xl font-bold mb-4">
                  {language === 'ar' ? 'موقعنا' : 'Our Location'}
                </h2>
                <iframe
                  title="Google Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3623.976795093967!2d44.333933!3d17.5670539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15fed944db4cb7b1%3A0xc976f5bbaf6d674f!2zTmFqcmFuLCDYp9mE2YjZhtin2YYg2YTZhNix2KfZhSDZhdin2YTZitmG2Kk!5e0!3m2!1sar!2ssa!4v1715179640373!5m2!1sar!2ssa&disableDefaultUI=true"
                  style={{
                    width: '100%',
                    height: '258px',
                    border: 0,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',

                  }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

           {/*  <div className="bg-white rounded-lg shadow-lg p-6">
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
            </div> */}

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-center text-noor-purple">
                {language === 'ar'
                  ? 'هل لديك فكرة أو اقتراح؟ نحن هنا للاستماع إليك!'
                  : 'Do you have an idea or suggestion? We are here to listen to you!'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Name Input */}
                <div className="relative input-field">
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="peer mt-1 block w-full rounded-lg border border-[#ecedec] bg-transparent px-4 py-3 text-lg focus:outline-none focus:border-[#2d79f3] focus:ring-0 focus:shadow-none"
                    placeholder=" "
                  />
                  <Label
                    htmlFor="name"
                    className={`absolute transition-all duration-300 text-gray-400 bg-transparent
                      peer-placeholder-shown:top-[5px] peer-placeholder-shown:left-[15px] peer-placeholder-shown:text-lg
                      peer-focus:top-[-22px] peer-focus:left-[12px] peer-focus:text-xl peer-focus:text-[#2d79f3] peer-focus:font-bold
                      ${language === 'ar' ? 'right-4 left-auto text-right' : 'left-4 text-left'}`}
                  >
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </Label>
                </div>

                {/* Email Input */}
                <div className="relative input-field mt-6">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="peer mt-1 block w-full rounded-lg border border-[#ecedec] bg-transparent px-4 py-3 text-lg focus:outline-none focus:border-[#2d79f3] focus:ring-0 focus:shadow-none"
                    placeholder=" "
                  />
                  <Label
                    htmlFor="email"
                    className={`absolute transition-all duration-300 text-gray-400 bg-transparent
                      peer-placeholder-shown:top-[5px] peer-placeholder-shown:left-[15px] peer-placeholder-shown:text-lg
                      peer-focus:top-[-22px] peer-focus:left-[12px] peer-focus:text-xl peer-focus:text-[#2d79f3] peer-focus:font-bold
                      ${language === 'ar' ? 'right-4 left-auto text-right' : 'left-4 text-left'}`}
                  >
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </Label>
                </div>

                {/* Phone Input */}
                <div className="relative input-field mt-6">
                  {/* Prefix +966 */}
                  <span
                    className={`absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 text-lg select-none ${
                      formData.phone ? '' : ''
                    }`}
                  >
                    +966
                  </span>

                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      // نسمح فقط بالأرقام
                      const digitsOnly = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: digitsOnly });
                    }}
                    required
                    maxLength={9} // لأن أرقام السعودية عادة 9 بعد +966
                    className="peer mt-1 block w-full rounded-lg border border-[#ecedec] bg-transparent px-20 py-3 text-lg focus:outline-none focus:border-[#2d79f3] focus:ring-0 focus:shadow-none"
                    placeholder=" "
                    dir="ltr"
                  />

                  <Label
                    htmlFor="phone"
                    className={`absolute transition-all duration-300 text-gray-400 bg-transparent
                      peer-placeholder-shown:top-[5px] peer-placeholder-shown:left-[15px] peer-placeholder-shown:text-lg
                      peer-focus:top-[-22px] peer-focus:left-[12px] peer-focus:text-xl peer-focus:text-[#2d79f3] peer-focus:font-bold
                      ${language === 'ar' ? 'right-4 left-auto text-right' : 'left-4 text-left'}`}
                  >
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                  </Label>
                </div>



                {/* Message Textarea */}
                <div className="relative input-field mt-6">
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="peer mt-1 block w-full rounded-lg border border-[#ecedec] bg-transparent px-4 py-3 text-lg focus:outline-none focus:border-[#2d79f3] focus:ring-0 focus:shadow-none"
                    placeholder=" "
                  />
                  <Label
                    htmlFor="message"
                    className={`absolute transition-all duration-300 text-gray-400 bg-transparent
                      peer-placeholder-shown:top-[5px] peer-placeholder-shown:left-[15px] peer-placeholder-shown:text-lg
                      peer-focus:top-[-22px] peer-focus:left-[12px] peer-focus:text-xl peer-focus:text-[#2d79f3] peer-focus:font-bold
                      ${language === 'ar' ? 'right-4 left-auto text-right' : 'left-4 text-left'}`}
                  >
                    {language === 'ar' ? 'الرسالة' : 'Message'}
                  </Label>
                </div>


                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-noor-purple to-noor-orange text-white hover:opacity-90 py-3 text-lg rounded-lg focus:outline-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⌛</span>
                      {language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send size={18} />
                      {language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                    </span>
                  )}
                </Button>
              </form>
            </div>

            <FeedbackForm />




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
