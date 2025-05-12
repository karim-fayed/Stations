import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, UserCog, User, Home, AlertTriangle, Database, Shield, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import DataMigrationButton from "./DataMigrationButton";
import { useLanguage } from "@/i18n/LanguageContext";

interface DashboardHeaderProps {
  onLogout: () => void;
  onAddStation: () => void;
  onDeleteDuplicates?: () => void;
  duplicateCount?: number;
  isAddingInProgress?: boolean;
}

const DashboardHeader = ({
  onLogout,
  onAddStation,
  onDeleteDuplicates,
  duplicateCount = 0,
  isAddingInProgress = false,
}: DashboardHeaderProps) => {
  const [isOwner, setIsOwner] = useState(false);
  const [isAddingStation, setIsAddingStation] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', user.id)
          .single();

        setIsOwner(userData?.role === 'owner');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const handleAddStation = () => {
    if (isAddingStation || isAddingInProgress) return;

    setIsAddingStation(true);
    try {
      onAddStation();
    } finally {
      setTimeout(() => setIsAddingStation(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-b-4 border-noor-purple">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center">
          <div className="relative mr-4">
            <img
              src="https://noor.com.sa/wp-content/themes/noor/images/apple-touch-icon-72x72.png"
              alt="Noor Logo"
              className="h-14 w-14 animate-spin-slow"
              style={{ animationDuration: "15s" }}
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-noor-purple to-noor-orange rounded-full blur-md opacity-30 animate-pulse"
              style={{ animationDuration: "3s" }}
            ></div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-noor-purple to-noor-orange bg-clip-text text-transparent">
              {language === 'ar' ? 'لوحة تحكم محطات نور' : 'Noor Stations Dashboard'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'ar' ? 'إدارة محطات الوقود' : 'Fuel Station Management'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Link to="/">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-green-600 border-green-300 hover:bg-green-50 transition-all duration-300"
            >
              <Home size={16} /> {language === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
            </Button>
          </Link>

          {isOwner && (
            <Link to="/admin/users">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50 transition-all duration-300"
              >
                <UserCog size={16} /> {language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
              </Button>
            </Link>
          )}

          <Link to="/admin/profile">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-purple-600 border-purple-300 hover:bg-purple-50 transition-all duration-300"
            >
              <User size={16} /> {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
            </Button>
          </Link>

          {isOwner && (
            <Link to="/admin/database">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-cyan-600 border-cyan-300 hover:bg-cyan-50 transition-all duration-300"
              >
                <Database size={16} /> {language === 'ar' ? 'إدارة قاعدة البيانات' : 'Database Management'}
              </Button>
            </Link>
          )}

          {isOwner && (
            <Link to="/admin/regions">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-amber-600 border-amber-300 hover:bg-amber-50 transition-all duration-300"
              >
                {language === 'ar' ? 'إدارة المناطق' : 'Regions Management'}
              </Button>
            </Link>
          )}

          {isOwner && (
            <Link to="/admin/feedbacks">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-pink-600 border-pink-300 hover:bg-pink-50 transition-all duration-300"
              >
                <Shield size={16} /> {language === 'ar' ? 'تقييمات العملاء' : 'Customer Feedback'}
              </Button>
            </Link>
          )}

          {isOwner && (
            <Link to="/admin/security-examples">
              <Button
                variant="outline"
                className="flex items-center gap-2 text-amber-600 border-amber-300 hover:bg-amber-50 transition-all duration-300"
              >
                <Shield size={16} /> {language === 'ar' ? 'أمثلة الأمان' : 'Security Examples'}
              </Button>
            </Link>
          )}

          <LanguageSwitcher
            variant="outline"
            size="default"
            className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
          />

          <Button
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 transition-all duration-300"
            onClick={onLogout}
          >
            <LogOut size={16} /> {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        <Button
          className="flex items-center gap-2 bg-gradient-to-r from-noor-purple to-noor-orange text-white hover:opacity-90 transition-all duration-300 shadow-md"
          onClick={handleAddStation}
          disabled={isAddingStation || isAddingInProgress}
        >
          {isAddingStation || isAddingInProgress ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{language === 'ar' ? 'جاري الإضافة...' : 'Adding...'}</span>
            </>
          ) : (
            <>
              <Plus size={16} /> {language === 'ar' ? 'إضافة محطة جديدة' : 'Add New Station'}
            </>
          )}
        </Button>

        {duplicateCount > 0 && onDeleteDuplicates && (
          <Button
            variant="outline"
            className="flex items-center gap-2 text-amber-600 border-amber-300 hover:bg-amber-50 transition-all duration-300"
            onClick={onDeleteDuplicates}
          >
            <Trash2 size={16} /> {language === 'ar' ? `حذف المحطات المكررة (${duplicateCount})` : `Delete Duplicate Stations (${duplicateCount})`}
          </Button>
        )}

        {/* زر ترحيل البيانات - يظهر فقط للمالك والمشرفين */}
        {isOwner && (
          <DataMigrationButton />
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
