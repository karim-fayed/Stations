
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Users, UserCircle, AlertTriangle, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";
import MobileSidebar from "@/components/MobileSidebar";

interface DashboardHeaderProps {
  onLogout: () => void;
  onAddStation: () => void;
  onDeleteDuplicates?: () => void;
  duplicateCount?: number;
}

const DashboardHeader = ({ onLogout, onAddStation, onDeleteDuplicates, duplicateCount = 0 }: DashboardHeaderProps) => {
  const [isOwner, setIsOwner] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const { data: userData, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', sessionData.session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return;
      }

      setIsOwner(userData.role === 'owner');
    };

    checkUserRole();
  }, []);
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-b-4 border-noor-purple">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center w-full justify-between md:justify-start">
          <div className="flex items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-noor-purple to-noor-orange bg-clip-text text-transparent flex items-center">
                {language === 'ar' ? (
                  <>
                    <span>لوحة تحكم محطات نور</span>
                    <div className="relative mx-2">
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
                    <span>Noor Stations Dashboard</span>
                    <div className="relative mx-2">
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
              </h1>
              <p className="text-gray-600 mt-1">{t('dashboard', 'subtitle')}</p>
            </div>
          </div>

          {/* Mobile Sidebar */}
          <div className="md:hidden">
            <MobileSidebar isOwner={isOwner} onLogout={onLogout} />
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-wrap gap-2 mt-4 md:mt-0">
          <Link to="/">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-green-600 border-green-300 hover:bg-green-50 transition-all duration-300 hover:scale-105"
            >
              <Home size={16} /> {t('common', 'home')}
            </Button>
          </Link>

          {isOwner && (
            <Link to="/admin/users">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
              >
                <Users size={16} /> {t('common', 'manageUsers')}
              </Button>
            </Link>
          )}

          <Link to="/admin/profile">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-indigo-600 border-indigo-300 hover:bg-indigo-50 transition-all duration-300 hover:scale-105"
            >
              <UserCircle size={16} /> {t('common', 'profile')}
            </Button>
          </Link>

          <Button
            variant="outline"
            className="flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
            onClick={onLogout}
          >
            <LogOut size={16} /> {t('common', 'logout')}
          </Button>

          {onDeleteDuplicates && duplicateCount > 0 && (
            <Button
              variant="outline"
              className="flex items-center gap-2 text-amber-600 border-amber-300 hover:bg-amber-50 transition-all duration-300 hover:scale-105"
              onClick={onDeleteDuplicates}
            >
              <AlertTriangle size={16} /> {t('dashboard', 'deleteDuplicates')} ({duplicateCount})
            </Button>
          )}

          <LanguageSwitcher
            variant="outline"
            className="flex items-center gap-2 text-purple-600 border-purple-300 hover:bg-purple-50 transition-all duration-300 hover:scale-105"
          />

          <Button
            className="flex items-center gap-2 bg-gradient-to-r from-noor-purple to-noor-orange text-white hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-md"
            onClick={onAddStation}
          >
            <Plus size={16} /> {t('dashboard', 'addStation')}
          </Button>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex md:hidden w-full justify-between mt-4">
          {onDeleteDuplicates && duplicateCount > 0 && (
            <Button
              variant="outline"
              className="flex items-center gap-1 text-amber-600 border-amber-300 hover:bg-amber-50 transition-all duration-300 hover:scale-105 text-sm px-2"
              onClick={onDeleteDuplicates}
            >
              <AlertTriangle size={14} /> ({duplicateCount})
            </Button>
          )}

          <Button
            className="flex items-center gap-1 bg-gradient-to-r from-noor-purple to-noor-orange text-white hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-md ml-auto"
            onClick={onAddStation}
          >
            <Plus size={16} />
            <span className="sm:inline hidden">{t('dashboard', 'addStation')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
