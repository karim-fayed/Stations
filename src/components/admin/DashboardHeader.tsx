
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, UserCog, User, Home, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import NotificationsPopup from "@/components/notifications/NotificationsPopup";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  onLogout: () => void;
  onAddStation: () => void;
  onDeleteDuplicates?: () => void;
  duplicateCount?: number;
}

const DashboardHeader = ({
  onLogout,
  onAddStation,
  onDeleteDuplicates,
  duplicateCount = 0,
}: DashboardHeaderProps) => {
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
              لوحة تحكم محطات نور
            </h1>
            <p className="text-gray-600 mt-1">إدارة محطات الوقود</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Link to="/">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-green-600 border-green-300 hover:bg-green-50 transition-all duration-300"
            >
              <Home size={16} /> الصفحة الرئيسية
            </Button>
          </Link>
          
          <Link to="/admin/users">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50 transition-all duration-300"
            >
              <UserCog size={16} /> إدارة المستخدمين
            </Button>
          </Link>
          
          <Link to="/admin/profile">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-purple-600 border-purple-300 hover:bg-purple-50 transition-all duration-300"
            >
              <User size={16} /> الملف الشخصي
            </Button>
          </Link>

          <LanguageSwitcher 
            variant="outline" 
            size="default" 
            className="border-indigo-300 text-indigo-600 hover:bg-indigo-50" 
          />

          <NotificationsPopup className="border-orange-300 text-orange-600 hover:text-orange-700 hover:bg-orange-50" />

          <Button
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 transition-all duration-300"
            onClick={onLogout}
          >
            <LogOut size={16} /> تسجيل الخروج
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        <Button
          className="flex items-center gap-2 bg-gradient-to-r from-noor-purple to-noor-orange text-white hover:opacity-90 transition-all duration-300 shadow-md"
          onClick={onAddStation}
        >
          <Plus size={16} /> إضافة محطة جديدة
        </Button>

        {duplicateCount > 0 && onDeleteDuplicates && (
          <Button
            variant="outline"
            className="flex items-center gap-2 text-amber-600 border-amber-300 hover:bg-amber-50 transition-all duration-300"
            onClick={onDeleteDuplicates}
          >
            <AlertTriangle size={16} /> حذف المحطات المكررة ({duplicateCount})
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
