
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { Link } from "react-router-dom";
import HomeSidebar from "./HomeSidebar";

const Header = () => {
  const { language, t, dir } = useLanguage();


  return (
    <header className={`w-full bg-gradient-to-r from-noor-purple to-noor-orange py-2 px-2 sm:px-4 md:px-6`} dir={dir}>
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Menu Button (mobile) - now on the other side */}
          {language === 'ar' ? (
            <div className="hidden md:flex items-center gap-2"></div>
          ) : (
            <div className="flex-shrink-0 order-3 md:order-none">
              <div className="md:hidden">
                <HomeSidebar />
              </div>
            </div>
          )}

          {/* Center: Logo & Title */}
          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
              <span className="hidden xs:inline">{language === 'ar' ? 'مرحباً بك في محطات نور' : 'Welcome to Noor Stations'}</span>
              <span className="xs:hidden">{language === 'ar' ? 'محطات نور' : 'Noor Stations'}</span>
              <span className="relative mr-2">
                <img
                  src="https://noor.com.sa/wp-content/themes/noor/images/apple-touch-icon-72x72.png"
                  alt="Noor Logo"
                  className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 animate-spin-slow"
                  style={{ animationDuration: '15s' }}
                />
                <div className="absolute inset-0 bg-white rounded-full blur-md opacity-30 animate-pulse" style={{ animationDuration: '3s' }}></div>
              </span>
            </h1>
          </div>

          {/* Desktop Menu & Language Switcher */}
          <div className="hidden md:flex items-center gap-2"></div>

          {/* Menu Button (mobile) - now on the other side for Arabic */}
          {language === 'ar' ? (
            <div className="flex-shrink-0 order-3 md:order-none">
              <div className="md:hidden">
                <HomeSidebar />
              </div>
            </div>
          ) : null}

          {/* Desktop Menu & Language Switcher (actual) */}
          <div className="hidden md:flex items-center gap-2">
            <NavigationMenu className="flex-row">
              <NavigationMenuList className="flex flex-row gap-1 md:gap-2">
                <NavigationMenuItem>
                  <Link to="/">
                    <Button variant="ghost" className="text-white text-sm h-8 px-2 md:h-10 md:px-4">
                      {t('common', 'home')}
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/services">
                    <Button variant="ghost" className="text-white text-sm h-8 px-2 md:h-10 md:px-4">
                      {language === 'ar' ? 'الخدمات' : 'Services'}
                    </Button>
                  </Link>
                </NavigationMenuItem>
                {/* <NavigationMenuItem>
                  <Link to="/about">
                    <Button variant="ghost" className="text-white text-sm h-8 px-2 md:h-10 md:px-4">
                      {language === 'ar' ? 'عن نور' : 'About Noor'}
                    </Button>
                  </Link>
                </NavigationMenuItem> */}
                <NavigationMenuItem>
                  <Link to="/contact">
                    <Button variant="ghost" className="text-white text-sm h-8 px-2 md:h-10 md:px-4">
                      {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <LanguageSwitcher
                    variant="secondary"
                    className="bg-white text-noor-purple hover:bg-white/90 text-sm h-8 px-2 md:h-10 md:px-4"
                  />
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
