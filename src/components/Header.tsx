
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { Link } from "react-router-dom";
import HomeSidebar from "./HomeSidebar";
import { UserCircle } from "lucide-react"; 

const Header = () => {
  const { language, t, dir } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <header className={`w-full bg-gradient-to-r from-noor-purple to-noor-orange py-1`} dir={dir}>
      <div className="container mx-auto">
        {/* Logo and Welcome Message */}
        <div className="flex items-center justify-center py-2 relative">
          <div className="flex items-center">
            <img
              src="https://noor.com.sa/wp-content/themes/noor/images/apple-touch-icon-72x72.png"
              alt="Noor Logo"
              className="h-6 w-6 sm:h-8 sm:w-8 animate-spin-slow"
              style={{ animationDuration: '15s' }}
            />
            <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold mx-2">
              {isRTL ? 'مرحباً بك في محطات نور' : 'Welcome to Noor Stations'}
            </h1>
          </div>
          
          {/* Admin Panel Button - Right side */}
          <div className="absolute top-1/2 transform -translate-y-1/2" style={{ [isRTL ? 'left' : 'right']: 0 }}>
            <Link to="/admin/login">
              <Button variant="secondary" size="sm" className="bg-white text-noor-purple hover:bg-white/90 rounded-md">
                <UserCircle className="h-4 w-4 mr-1" />
                {isRTL ? 'لوحة التحكم' : 'Admin Panel'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-1 sm:space-x-2">
              <NavigationMenuItem>
                <Link to="/">
                  <Button variant="ghost" className="text-white text-sm h-8 px-3">
                    {isRTL ? 'الصفحة الرئيسية' : 'Home'}
                  </Button>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/about">
                  <Button variant="ghost" className="text-white text-sm h-8 px-3">
                    {isRTL ? 'عن نور' : 'About'}
                  </Button>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/services">
                  <Button variant="ghost" className="text-white text-sm h-8 px-3">
                    {isRTL ? 'الخدمات' : 'Services'}
                  </Button>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/contact">
                  <Button variant="ghost" className="text-white text-sm h-8 px-3">
                    {isRTL ? 'اتصل بنا' : 'Contact'}
                  </Button>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Button variant="outline" className="text-white border-white text-sm h-8 px-3" asChild>
                  <LanguageSwitcher />
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
