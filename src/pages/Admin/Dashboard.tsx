
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GasStation } from "@/types/station";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchStations,
  addStation,
  updateStation,
  deleteStation,
  adminLogout,
  checkAdminStatus,
  checkDuplicateStation,
  checkDuplicateStationsInList,
  deleteDuplicateStations
} from "@/services/stationService";

import DashboardHeader from "@/components/admin/DashboardHeader";
import DashboardTabs from "@/components/admin/DashboardTabs";
import StationDialog from "@/components/admin/StationDialog";
import DeleteStationDialog from "@/components/admin/DeleteStationDialog";
import DuplicateStationDialog from "@/components/admin/DuplicateStationDialog";
import DeleteDuplicatesDialog from "@/components/admin/DeleteDuplicatesDialog";

const Dashboard = () => {
  const [stations, setStations] = useState<GasStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isDeleteDuplicatesDialogOpen, setIsDeleteDuplicatesDialogOpen] = useState(false);
  const [currentStation, setCurrentStation] = useState<Partial<GasStation>>({});
  const [duplicateStation, setDuplicateStation] = useState<GasStation | null>(null);
  const [pendingAddStation, setPendingAddStation] = useState<Partial<GasStation> | null>(null);
  const [duplicateStationsCount, setDuplicateStationsCount] = useState<number>(0);
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

  // التحقق من المحطات المكررة
  useEffect(() => {
    const checkDuplicates = async () => {
      if (stations.length > 0) {
        try {
          const duplicateMap = await checkDuplicateStationsInList(stations);
          let count = 0;
          duplicateMap.forEach(isDuplicate => {
            if (isDuplicate) count++;
          });
          setDuplicateStationsCount(count);
        } catch (error) {
          console.error("Error checking for duplicate stations:", error);
        }
      }
    };

    checkDuplicates();
  }, [stations]);

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
          description: "يرجى إدخال جميع البيانات المطلوبة (الاسم، المنطقة، خط العرض، خط الطول)",
          variant: "destructive",
        });
        return;
      }

      // التحقق من وجود محطة مكررة
      try {
        const { isDuplicate, duplicateStation: foundDuplicate } = await checkDuplicateStation(
          currentStation.name as string,
          currentStation.latitude as number,
          currentStation.longitude as number
        );

        if (isDuplicate && foundDuplicate) {
          // حفظ المحطة الحالية كمحطة معلقة
          setPendingAddStation({ ...currentStation });
          // حفظ المحطة المكررة
          setDuplicateStation(foundDuplicate);
          // فتح نافذة المحطة المكررة
          setIsDuplicateDialogOpen(true);
          return;
        }
      } catch (duplicateError) {
        console.error("Error checking for duplicate station:", duplicateError);
      }

      // إذا لم تكن هناك محطة مكررة، نضيف المحطة الجديدة
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
        description: (error as Error).message || "حدث خطأ أثناء إضافة المحطة الجديدة",
        variant: "destructive",
      });
    }
  };

  // إضافة المحطة بالقوة رغم وجود محطة مكررة
  const handleForceAddStation = async () => {
    try {
      if (!pendingAddStation) return;

      // تجاوز التحقق من المحطات المكررة
      const { data, error } = await supabase
        .from("stations")
        .insert({
          ...pendingAddStation,
          latitude: pendingAddStation.latitude as number,
          longitude: pendingAddStation.longitude as number,
          name: pendingAddStation.name as string,
        })
        .select()
        .single();

      if (error) throw error;

      const newStation = data as GasStation;
      setStations([...stations, newStation]);

      // إغلاق النوافذ وإعادة تعيين الحالة
      setIsDuplicateDialogOpen(false);
      setIsAddDialogOpen(false);
      setPendingAddStation(null);
      setDuplicateStation(null);
      setCurrentStation({});

      toast({
        title: "تمت الإضافة بنجاح",
        description: `تمت إضافة محطة ${newStation.name} بنجاح`,
      });
    } catch (error) {
      console.error("Error force adding station:", error);
      toast({
        title: "خطأ في إضافة المحطة",
        description: (error as Error).message || "حدث خطأ أثناء إضافة المحطة الجديدة",
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

  const handleDeleteStation = async (id?: string) => {
    try {
      // استخدام المعرف المقدم أو معرف المحطة الحالية
      const stationId = id || currentStation.id;
      if (!stationId) return;

      // حفظ اسم المحطة قبل حذفها
      const stationToDelete = stations.find(s => s.id === stationId);
      if (!stationToDelete) return;

      await deleteStation(stationId);
      setStations(stations.filter(s => s.id !== stationId));

      // إغلاق نافذة الحذف فقط إذا كانت مفتوحة وكنا نحذف المحطة الحالية
      if (!id && isDeleteDialogOpen) {
        setIsDeleteDialogOpen(false);
      }

      // إعادة تعيين المحطة الحالية فقط إذا كنا نحذف المحطة الحالية
      if (currentStation.id === stationId) {
        setCurrentStation({});
      }

      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف محطة ${stationToDelete.name} بنجاح`,
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
      // تسجيل الخروج
      const success = await adminLogout();

      // إعادة تعيين حالة التطبيق
      setStations([]);
      setCurrentStation({});
      setIsLoading(true);

      // توجيه المستخدم إلى صفحة تسجيل الدخول
      navigate("/admin/login", { replace: true });

      // إظهار رسالة نجاح
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "تم تسجيل خروجك من النظام بنجاح",
      });
    } catch (error) {
      console.error("Error logging out:", error);

      // حتى في حالة الخطأ، نقوم بتوجيه المستخدم إلى صفحة تسجيل الدخول
      navigate("/admin/login", { replace: true });
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

  // فتح نافذة حذف المحطات المكررة
  const handleOpenDeleteDuplicatesDialog = () => {
    setIsDeleteDuplicatesDialogOpen(true);
  };

  // حذف المحطات المكررة
  const handleDeleteDuplicates = async () => {
    try {
      const result = await deleteDuplicateStations(stations);

      // تحديث قائمة المحطات بعد الحذف
      loadStations();

      // إغلاق النافذة
      setIsDeleteDuplicatesDialogOpen(false);

      // عرض رسالة نجاح
      toast({
        title: "تم حذف المحطات المكررة بنجاح",
        description: `تم حذف ${result.deleted} محطة مكررة وبقي ${result.remainingStations.length} محطة`,
      });
    } catch (error) {
      console.error("Error deleting duplicate stations:", error);
      toast({
        title: "خطأ في حذف المحطات المكررة",
        description: "حدث خطأ أثناء حذف المحطات المكررة",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-orange-50 rtl">
      <div className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <DashboardHeader
            onLogout={handleLogout}
            onAddStation={handleOpenAddDialog}
            onDeleteDuplicates={duplicateStationsCount > 0 ? handleOpenDeleteDuplicatesDialog : undefined}
            duplicateCount={duplicateStationsCount}
          />
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-noor-purple border-opacity-30 border-t-noor-orange"></div>
          </div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6"
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
        stationId={currentStation.id}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteStation}
      />

      {/* نافذة المحطة المكررة */}
      <DuplicateStationDialog
        isOpen={isDuplicateDialogOpen}
        duplicateStation={duplicateStation}
        onClose={() => {
          setIsDuplicateDialogOpen(false);
          setPendingAddStation(null);
          setDuplicateStation(null);
        }}
        onDelete={(id) => {
          // حذف المحطة المكررة ثم إضافة المحطة الجديدة
          handleDeleteStation(id);
          setIsDuplicateDialogOpen(false);
          // بعد الحذف، نضيف المحطة الجديدة
          if (pendingAddStation) {
            const stationToAdd = { ...pendingAddStation };
            setPendingAddStation(null);
            setDuplicateStation(null);
            setCurrentStation(stationToAdd);
            // استخدام setTimeout لضمان اكتمال عملية الحذف قبل الإضافة
            setTimeout(() => handleAddStation(), 500);
          }
        }}
        onContinueAnyway={handleForceAddStation}
      />

      {/* نافذة حذف المحطات المكررة */}
      <DeleteDuplicatesDialog
        isOpen={isDeleteDuplicatesDialogOpen}
        duplicateCount={duplicateStationsCount}
        onClose={() => setIsDeleteDuplicatesDialogOpen(false)}
        onConfirm={handleDeleteDuplicates}
      />
      </div>
    </div>
  );
};

export default Dashboard;
