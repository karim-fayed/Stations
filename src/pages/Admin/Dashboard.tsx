
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GasStation } from "@/types/station";
import { 
  fetchStations, 
  addStation, 
  updateStation, 
  deleteStation, 
  adminLogout,
  checkAdminStatus
} from "@/services/stationService";

import DashboardHeader from "@/components/admin/DashboardHeader";
import DashboardTabs from "@/components/admin/DashboardTabs";
import StationDialog from "@/components/admin/StationDialog";
import DeleteStationDialog from "@/components/admin/DeleteStationDialog";

const Dashboard = () => {
  const [stations, setStations] = useState<GasStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStation, setCurrentStation] = useState<Partial<GasStation>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  // التحقق من صلاحية المشرف
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const { isAuthenticated } = await checkAdminStatus();
        if (!isAuthenticated) {
          navigate("/admin/login");
        }
      } catch (error) {
        navigate("/admin/login");
      } finally {
        loadStations();
      }
    };

    verifyAdmin();
  }, [navigate]);

  const loadStations = async () => {
    try {
      const data = await fetchStations();
      setStations(data);
    } catch (error) {
      console.error("Error loading stations:", error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل بيانات المحطات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStation = async () => {
    try {
      if (!currentStation.name || !currentStation.region || !currentStation.latitude || !currentStation.longitude) {
        toast({
          title: "بيانات غير مكتملة",
          description: "يرجى إدخال جميع البيانات المطلوبة",
          variant: "destructive",
        });
        return;
      }

      const newStation = await addStation(currentStation as Omit<GasStation, 'id'>);
      setStations([...stations, newStation]);
      setIsAddDialogOpen(false);
      setCurrentStation({});
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: `تمت إضافة محطة ${newStation.name} بنجاح`,
      });
    } catch (error) {
      console.error("Error adding station:", error);
      toast({
        title: "خطأ في إضافة المحطة",
        description: "حدث خطأ أثناء إضافة المحطة الجديدة",
        variant: "destructive",
      });
    }
  };

  const handleEditStation = async () => {
    try {
      if (!currentStation.id) return;
      
      const updatedStation = await updateStation(currentStation.id, currentStation);
      setStations(stations.map(s => s.id === updatedStation.id ? updatedStation : s));
      setIsEditDialogOpen(false);
      setCurrentStation({});
      
      toast({
        title: "تم التحديث بنجاح",
        description: `تم تحديث محطة ${updatedStation.name} بنجاح`,
      });
    } catch (error) {
      console.error("Error updating station:", error);
      toast({
        title: "خطأ في تحديث المحطة",
        description: "حدث خطأ أثناء تحديث بيانات المحطة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStation = async () => {
    try {
      if (!currentStation.id) return;
      
      await deleteStation(currentStation.id);
      setStations(stations.filter(s => s.id !== currentStation.id));
      setIsDeleteDialogOpen(false);
      setCurrentStation({});
      
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المحطة بنجاح",
      });
    } catch (error) {
      console.error("Error deleting station:", error);
      toast({
        title: "خطأ في حذف المحطة",
        description: "حدث خطأ أثناء حذف المحطة",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate("/admin/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // تحويل القيم العددية
    if (name === 'latitude' || name === 'longitude') {
      setCurrentStation({ ...currentStation, [name]: parseFloat(value) });
    } else {
      setCurrentStation({ ...currentStation, [name]: value });
    }
  };

  const handleOpenAddDialog = () => {
    setCurrentStation({});
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (station: GasStation) => {
    setCurrentStation(station);
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (station: GasStation) => {
    setCurrentStation(station);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 rtl">
      <DashboardHeader 
        onLogout={handleLogout}
        onAddStation={handleOpenAddDialog}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-noor-purple"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <DashboardTabs 
            stations={stations}
            onEdit={handleOpenEditDialog}
            onDelete={handleOpenDeleteDialog}
          />
        </motion.div>
      )}

      {/* نافذة إضافة محطة جديدة */}
      <StationDialog
        isOpen={isAddDialogOpen}
        station={currentStation}
        isEditing={false}
        onInputChange={handleInputChange}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddStation}
      />

      {/* نافذة تحرير محطة */}
      <StationDialog
        isOpen={isEditDialogOpen}
        station={currentStation}
        isEditing={true}
        onInputChange={handleInputChange}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleEditStation}
      />

      {/* نافذة حذف محطة */}
      <DeleteStationDialog
        isOpen={isDeleteDialogOpen}
        stationName={currentStation.name || ""}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteStation}
      />
    </div>
  );
};

export default Dashboard;
