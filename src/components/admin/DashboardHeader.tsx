
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Trash2, Bell } from "lucide-react";
import { motion } from "framer-motion";
import CreateNotificationDialog from "./CreateNotificationDialog";

interface DashboardHeaderProps {
  onLogout: () => Promise<void>;
  onAddStation: () => void;
  onDeleteDuplicates?: () => void;
  duplicateCount?: number;
}

const DashboardHeader = ({
  onLogout,
  onAddStation,
  onDeleteDuplicates,
  duplicateCount = 0
}: DashboardHeaderProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            لوحة التحكم
            <motion.div
              className="mr-2 p-1 bg-gradient-to-r from-noor-purple to-noor-orange rounded-full"
              animate={{ rotate: [0, 360] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <div className="h-5 w-5 bg-white rounded-full"></div>
            </motion.div>
          </h1>
          <p className="text-gray-600 mt-1">إدارة محطات نور</p>
        </div>

        <div className="flex flex-wrap gap-3 mr-auto md:mr-0">
          {duplicateCount > 0 && onDeleteDuplicates && (
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center"
              onClick={onDeleteDuplicates}
            >
              <Trash2 className="ml-1 h-4 w-4" />
              <span>حذف {duplicateCount} محطة مكررة</span>
            </Button>
          )}

          <CreateNotificationDialog />
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={onAddStation}
          >
            <Plus className="ml-1 h-4 w-4" />
            <span>إضافة محطة</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={onLogout}
          >
            <LogOut className="ml-1 h-4 w-4" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
