
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { Link } from "react-router-dom";
import HomeSidebar from "./HomeSidebar";

const Header = () => {
  const { language, t, dir } = useLanguage();

  return (
    <header className={`w-full bg-gradient-to-r from-noor-purple to-noor-orange py-2 sm:py-4 px-2 sm:px-4 md:px-6`} dir={dir}>
      <div className="container mx-auto">
        <div className="relative flex items-center justify-center mb-2 sm:mb-4">
          <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold text-center flex items-center justify-center">
            {language === 'ar' ? (
              <>
                <span className="hidden xs:inline">مرحباً بك في محطات نور</span>
                <span className="xs:hidden">محطات نور</span>
                <div className="relative mr-2">
                  <img
                    src="https://noor.com.sa/wp-content/themes/noor/images/apple-touch-icon-72x72.png"
                    alt="Noor Logo"
                    className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 animate-spin-slow"
                    style={{ animationDuration: '15s' }}
                  />
                  <div className="absolute inset-0 bg-white rounded-full blur-md opacity-30 animate-pulse" style={{ animationDuration: '3s' }}></div>
                </div>
              </>
            ) : (
              <>
                <span className="hidden xs:inline">Welcome to Noor Stations</span>
                <span className="xs:hidden">Noor Stations</span>
                <div className="relative mr-2">
                  <img
                    src="https://noor.com.sa/wp-content/themes/noor/images/apple-touch-icon-72x72.png"
                    alt="Noor Logo"
                    className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 animate-spin-slow"
                    style={{ animationDuration: '15s' }}
                  />
                  <div className="absolute inset-0 bg-white rounded-full blur-md opacity-30 animate-pulse" style={{ animationDuration: '3s' }}></div>
                </div>
              </>
            )}
          </h1>

          {/* Floating Menu Button */}
          <div className={`absolute ${language === 'ar' ? 'right-0' : 'left-0'} top-1/2 transform -translate-y-1/2`}>
            <div className="md:hidden">
              <HomeSidebar />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            {/* Logo placeholder */}
            <div className="w-6 h-6 sm:w-8 sm:h-8"></div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block w-full md:w-auto mt-2 md:mt-0">
            <NavigationMenu className="flex-col md:flex-row">
              <NavigationMenuList className="flex flex-col md:flex-row gap-1 md:gap-2">
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

                <NavigationMenuItem>
                  <Link to="/about">
                    <Button variant="ghost" className="text-white text-sm h-8 px-2 md:h-10 md:px-4">
                      {language === 'ar' ? 'عن نور' : 'About Noor'}
                    </Button>
                  </Link>
                </NavigationMenuItem>

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
