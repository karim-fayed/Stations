
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const Header: React.FC = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAdmin(!!data.session);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdmin(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { key: 'home', path: '/', textAr: 'الرئيسية', textEn: 'Home' },
    { key: 'services', path: '/services', textAr: 'خدماتنا', textEn: 'Services' },
    { key: 'about', path: '/about', textAr: 'عن نور', textEn: 'About' },
    { key: 'contact', path: '/contact', textAr: 'اتصل بنا', textEn: 'Contact' },
  ];

  return (
    <header
      className={cn(
        'bg-gradient-to-r from-noor-purple to-noor-orange text-white py-4 w-full z-40 transition-all duration-300',
        isSticky ? 'sticky top-0 shadow-md' : ''
      )}
    >
      <div className="container mx-auto px-4">
        {/* Welcome message */}
        <div className="text-center mb-2">
          <h1 className="text-lg font-medium">
            {language === 'ar' ? 'مرحباً بك في محطات نور' : 'Welcome to Noor Stations'}
          </h1>
        </div>

        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <img
              src="/lovable-uploads/7d04d515-ba22-4ed7-9bba-9b93a0f1eba3.png"
              alt="Noor Stations"
              className="h-10"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            {menuItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={cn(
                  'text-white hover:text-noor-light-orange transition-colors py-2 px-1 relative font-semibold',
                  location.pathname === item.path && 'text-noor-light-orange'
                )}
              >
                {language === 'ar' ? item.textAr : item.textEn}
              </Link>
            ))}

            {/* Language Switcher */}
            <div className="bg-white/20 rounded-full px-3 py-1">
              <LanguageSwitcher variant="ghost" className="text-white" />
            </div>
          </nav>

          {/* Admin Dashboard Button (Desktop) */}
          {isAdmin && (
            <div className="hidden md:block">
              <Link to="/admin/dashboard">
                <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30">
                  {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Navigation Button */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse md:hidden">
            <div className="bg-white/20 rounded-full px-3 py-1">
              <LanguageSwitcher variant="ghost" className="text-white" />
            </div>
            <Button variant="ghost" size="sm" className="text-white" onClick={toggleMenu}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <motion.div
              className="fixed inset-0 z-50 bg-gradient-to-r from-noor-purple to-noor-orange pt-20"
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.3 }}
            >
              <div className="container mx-auto px-4">
                <div className="flex flex-col items-center space-y-6">
                  {menuItems.map((item) => (
                    <Link
                      key={item.key}
                      to={item.path}
                      className={cn(
                        'text-xl font-semibold text-white hover:text-noor-light-orange transition-colors',
                        location.pathname === item.path && 'text-noor-light-orange'
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {language === 'ar' ? item.textAr : item.textEn}
                    </Link>
                  ))}

                  {/* Admin Dashboard Link for Mobile */}
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="text-xl font-semibold text-white hover:text-noor-light-orange transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
