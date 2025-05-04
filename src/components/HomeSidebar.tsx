
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Info, Phone, Settings, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import LanguageSwitcher from "./LanguageSwitcher";

interface HomeSidebarProps {
  onClose?: () => void;
}

const HomeSidebar: React.FC<HomeSidebarProps> = ({ onClose }) => {
  const [open, setOpen] = useState(false);
  const { t, language } = useLanguage();

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const menuItems = [
    {
      icon: <Home size={20} />,
      label: t('common', 'home'),
      href: '/',
    },
    {
      icon: <Settings size={20} />,
      label: language === 'ar' ? 'الخدمات' : 'Services',
      href: '/services',
    },
    {
      icon: <Info size={20} />,
      label: language === 'ar' ? 'عن نور' : 'About Noor',
      href: '/about',
    },
    {
      icon: <Phone size={20} />,
      label: language === 'ar' ? 'اتصل بنا' : 'Contact Us',
      href: '/contact',
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 rounded-full p-2 shadow-lg backdrop-blur-sm bg-white/10 border border-white/20 transition-all duration-300 hover:scale-110"
        >
          <Menu size={24} />
        </Button>
      </SheetTrigger>
      <SheetContent side={language === 'ar' ? 'left' : 'right'} className="p-0 w-[280px] bg-gradient-to-b from-white to-purple-50">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-center items-center mb-4">
              <div>
                <h3 className="font-bold text-lg bg-gradient-to-r from-noor-purple to-noor-orange bg-clip-text text-transparent flex items-center justify-center">
                  {language === 'ar' ? (
                    <>
                      <span>محطات نور</span>
                      <div className="relative mr-2">
                        <img
                          src="https://noor.com.sa/wp-content/themes/noor/images/apple-touch-icon-72x72.png"
                          alt="Noor Logo"
                          className="h-10 w-10 animate-spin-slow"
                          style={{ animationDuration: '15s' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-noor-purple to-noor-orange rounded-full blur-md opacity-30 animate-pulse" style={{ animationDuration: '3s' }}></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>Noor Stations</span>
                      <div className="relative ml-2">
                        <img
                          src="https://noor.com.sa/wp-content/themes/noor/images/apple-touch-icon-72x72.png"
                          alt="Noor Logo"
                          className="h-10 w-10 animate-spin-slow"
                          style={{ animationDuration: '15s' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-noor-purple to-noor-orange rounded-full blur-md opacity-30 animate-pulse" style={{ animationDuration: '3s' }}></div>
                      </div>
                    </>
                  )}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto py-4">
            <nav className="px-2 space-y-2">
              {menuItems.map((item, index) => (
                <Link 
                  key={index} 
                  to={item.href}
                  onClick={handleClose}
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-all duration-200 group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 transition-all duration-200">
                      <span className="text-noor-purple">{item.icon}</span>
                    </div>
                    <div>
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="mb-2 text-gray-500 text-sm">
              {language === 'ar' ? 'تغيير اللغة' : 'Change language'}
            </div>
            <LanguageSwitcher
              variant="outline"
              className="w-full"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HomeSidebar;
