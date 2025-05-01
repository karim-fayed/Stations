
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Plus } from "lucide-react";

interface DashboardHeaderProps {
  onLogout: () => void;
  onAddStation: () => void;
}

const DashboardHeader = ({ onLogout, onAddStation }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-noor-purple">لوحة تحكم محطات نور</h1>
        <p className="text-gray-600">إدارة محطات الوقود</p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={onLogout}
        >
          <LogOut size={16} /> تسجيل الخروج
        </Button>
        <Button 
          className="flex items-center gap-2 bg-noor-purple hover:bg-noor-purple/90"
          onClick={onAddStation}
        >
          <Plus size={16} /> إضافة محطة جديدة
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
