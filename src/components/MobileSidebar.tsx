
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Users, UserCircle, LogOut, FileSpreadsheet, BarChart, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";

interface MobileSidebarProps {
  isOwner?: boolean;
  onLogout?: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOwner = false, onLogout }) => {
  const [open, setOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      setOpen(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const menuItems = [
    {
      icon: <Home size={20} />,
      label: t('common', 'home'),
      href: '/',
    },
    {
      icon: <Home size={20} />,
      label: t('dashboard', 'stations'),
      href: '/admin/dashboard',
    },
    {
      icon: <FileSpreadsheet size={20} />,
      label: t('dashboard', 'importExport'),
      href: '/admin/dashboard?tab=import-export',
    },
    {
      icon: <BarChart size={20} />,
      label: t('dashboard', 'analytics'),
      href: '/admin/dashboard?tab=analytics',
    },
    {
      icon: <UserCircle size={20} />,
      label: t('common', 'profile'),
      href: '/admin/profile',
    },
  ];

  if (isOwner) {
    menuItems.splice(4, 0, {
      icon: <Users size={20} />,
      label: t('userManagement', 'title'),
      href: '/admin/users',
    });

    menuItems.push({
      icon: null,
      label: 'إدارة المناطق',
      href: '/admin/regions',
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
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
            <nav className="px-2 space-y-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  onClick={() => setOpen(false)}
                >
                  <motion.div
                    whileHover={{ scale: 1.03, x: 5 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200"
                  >
                    <span className="text-noor-purple">{item.icon}</span>
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-100 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={toggleLanguage}
            >
              <Languages size={20} />
              {t('common', 'changeLanguage')}
            </Button>

            {onLogout && (
              <Button
                variant="outline"
                className="w-full justify-start gap-3 text-red-500 border-red-200 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut size={20} />
                {t('common', 'logout')}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
