
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface HeaderProps {
  language: 'ar' | 'en';
  onChangeLanguage: (lang: 'ar' | 'en') => void;
}

const Header: React.FC<HeaderProps> = ({ language, onChangeLanguage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const translations = {
    home: language === 'ar' ? 'الرئيسية' : 'Home',
    stations: language === 'ar' ? 'المحطات' : 'Stations',
    services: language === 'ar' ? 'الخدمات' : 'Services',
    about: language === 'ar' ? 'عن نور' : 'About Noor',
    contact: language === 'ar' ? 'اتصل بنا' : 'Contact Us',
    welcome: language === 'ar' ? 'مرحبا بكم في محطات نور' : 'Welcome to Noor Stations'
  };

  return (
    <header className={`w-full bg-gradient-to-r from-noor-purple to-noor-orange py-4 px-4 md:px-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <div className="text-white font-bold text-3xl">
            <span className="text-white">نور</span>
            <span className="text-yellow-300">⚡</span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </Button>

        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-auto mt-4 md:mt-0`}>
          <NavigationMenu className="flex-col md:flex-row">
            <NavigationMenuList className="flex flex-col md:flex-row gap-1 md:gap-2">
              <NavigationMenuItem>
                <Button variant="ghost" className="text-white">
                  {translations.home}
                </Button>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-white bg-transparent hover:bg-white/20">
                  {translations.stations}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 w-[200px]">
                    {['نجران', 'الرياض', 'جدة', 'الدمام'].map((region) => (
                      <li key={region}>
                        <NavigationMenuLink asChild>
                          <Button variant="ghost" className="w-full justify-start">
                            {region}
                          </Button>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Button variant="ghost" className="text-white">
                  {translations.services}
                </Button>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Button variant="ghost" className="text-white">
                  {translations.about}
                </Button>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Button variant="ghost" className="text-white">
                  {translations.contact}
                </Button>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Button 
                  variant="secondary" 
                  className="bg-white text-noor-purple hover:bg-white/90"
                  onClick={() => onChangeLanguage(language === 'ar' ? 'en' : 'ar')}
                >
                  {language === 'ar' ? 'English' : 'العربية'}
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
      <div className="container mx-auto mt-4">
        <h1 className="text-white text-xl md:text-2xl font-bold text-center">{translations.welcome}</h1>
      </div>
    </header>
  );
};

export default Header;
