import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, BarChart3, Building2, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GasStation } from "@/types/station";
import { supabase, insertStationDirect } from "@/integrations/supabase/client";
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
import { useLanguage } from "@/i18n/LanguageContext";

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
  const [page, setPage] = useState(1);
  const [pageSize] = useState(1000); // زيادة حجم الصفحة لتحميل جميع المحطات - تم تغييره من 50 إلى 1000
  const [totalStationsCount, setTotalStationsCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAddingInProgress, setIsAddingInProgress] = useState(false);
  const { language, t } = useLanguage();

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
        loadStationsOptimized();
      }
    };

    verifyAdmin();
  }, [navigate, page]);

  const checkDuplicates = useCallback(async (stationsList: GasStation[]) => {
    if (stationsList.length > 0) {
      try {
        const duplicateMap = await checkDuplicateStationsInList(stationsList);
        let count = 0;
        duplicateMap.forEach(isDuplicate => {
          if (isDuplicate) count++;
        });
        setDuplicateStationsCount(count);
      } catch (error) {
        console.error("Error checking for duplicate stations:", error);
      }
    }
  }, []);

  useEffect(() => {
    checkDuplicates(stations);
  }, [stations, checkDuplicates]);

  const loadStationsOptimized = async () => {
    try {
      setIsLoading(true);

      // إنشاء مهمتين متوازيتين: واحدة للعدد وواحدة للبيانات
      const [countPromise, dataPromise] = await Promise.allSettled([
        // مهمة الحصول على العدد الإجمالي
        supabase
          .from('stations')
          .select('*', { count: 'exact', head: true }),

        // مهمة الحصول على البيانات المصفحة مع الترتيب
        supabase
          .from('stations')
          .select('*')
          .range((page - 1) * pageSize, page * pageSize - 1)
          .order('created_at', { ascending: false })
      ]);

      // معالجة نتيجة العد
      if (countPromise.status === 'fulfilled') {
        setTotalStationsCount(countPromise.value.count || 0);
      } else {
        console.error("Error fetching count:", countPromise.reason);
        setTotalStationsCount(0);
      }

      // معالجة نتيجة البيانات
      if (dataPromise.status === 'fulfilled') {
        setStations(dataPromise.value.data || []);
      } else {
        console.error("Error fetching data:", dataPromise.reason);
        setStations([]);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ أثناء تحميل بيانات المحطات",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading stations:", error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل بيانات المحطات",
        variant: "destructive",
      });
      setStations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // تم إزالة وظائف التنقل بين الصفحات لأننا نقوم بتحميل جميع المحطات مرة واحدة

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
      if (!currentStation.name || !currentStation.region ||
          currentStation.latitude === undefined || currentStation.longitude === undefined) {
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
          currentStation.name,
          Number(currentStation.latitude),
          Number(currentStation.longitude)
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

      // بدء عملية الإضافة
      setIsAddingInProgress(true);

      try {
        // تحضير بيانات المحطة
        const stationData = {
          name: currentStation.name,
          region: currentStation.region || '',
          sub_region: currentStation.sub_region || '',
          latitude: Number(currentStation.latitude),
          longitude: Number(currentStation.longitude),
          fuel_types: currentStation.fuel_types || '',
          additional_info: currentStation.additional_info || ''
        };

        let stationResult;
        let attempts = 0;
        const maxAttempts = 3;
        let lastError;

        // محاولة الإضافة عدة مرات مع تأخير متزايد بين المحاولات
        while (attempts < maxAttempts) {
          attempts++;
          try {
            console.log(`Attempt ${attempts} to add station`);

            // إظهار رسالة أثناء المحاولة إذا كانت ليست المحاولة الأولى
            if (attempts > 1) {
              toast({
                title: `المحاولة ${attempts} من ${maxAttempts}`,
                description: "يتم إعادة محاولة إضافة المحطة...",
                duration: 2000,
              });
            }

            // استخدام الدالة الجديدة المحسنة
            stationResult = await insertStationDirect(stationData);
            console.log(`Station added successfully on attempt ${attempts}:`, stationResult);

            // إذا نجحت العملية، نتوقف
            break;
          } catch (error) {
            console.error(`Error on attempt ${attempts}:`, error);
            lastError = error;

            // إذا وصلنا للمحاولة الأخيرة، نرمي الخطأ للمعالجة الخارجية
            if (attempts === maxAttempts) {
              throw error;
            }

            // انتظار قبل المحاولة التالية (زيادة الانتظار مع كل محاولة)
            const delayTime = attempts * 1500; // زيادة التأخير مع كل محاولة
            await new Promise(resolve => setTimeout(resolve, delayTime));
          }
        }

        if (!stationResult) {
          throw new Error("فشلت إضافة المحطة بعد عدة محاولات");
        }

        // تحديث قائمة المحطات
        setStations(prevStations => [stationResult, ...prevStations]);
        setIsAddDialogOpen(false);
        setCurrentStation({});

        // إعادة تحميل البيانات لتحديث العدد الإجمالي
        loadStationsOptimized();

        toast({
          title: "تمت الإضافة بنجاح",
          description: `تمت إضافة محطة ${stationResult.name} بنجاح`,
        });
      } finally {
        setIsAddingInProgress(false);
      }
    } catch (error) {
      console.error("Error adding station:", error);

      // تحسين رسالة الخطأ المعروضة للمستخدم
      let errorMsg = "حدث خطأ أثناء إضافة المحطة الجديدة";

      if (error instanceof Error) {
        // إذا كان الخطأ له رسالة محددة
        errorMsg = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // إذا كان من نوع خطأ Supabase
        if ('code' in error && typeof error.code === 'string') {
          if (error.code === '21000') {
            errorMsg = "خطأ في سياسات قاعدة البيانات. يرجى التواصل مع المطور.";
          } else if (error.code === '42501') {
            errorMsg = "ليس لديك صلاحيات كافية لإضافة محطة جديدة.";
          } else if ('message' in error && typeof error.message === 'string') {
            errorMsg = error.message;
          }
        }
      }

      toast({
        title: "خطأ في إضافة المحطة",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  // إضافة المحطة بالقوة رغم وجود محطة مكررة
  const handleForceAddStation = async () => {
    try {
      if (!pendingAddStation) {
        console.error("No pending station to add");
        return;
      }

      console.log("Force adding station:", pendingAddStation);

      // بدء عملية الإضافة
      setIsAddingInProgress(true);

      try {
        // تحضير بيانات المحطة
        const stationData = {
          name: pendingAddStation.name,
          region: pendingAddStation.region || '',
          sub_region: pendingAddStation.sub_region || '',
          latitude: Number(pendingAddStation.latitude),
          longitude: Number(pendingAddStation.longitude),
          fuel_types: pendingAddStation.fuel_types || '',
          additional_info: pendingAddStation.additional_info || ''
        };

        let stationResult;
        let attempts = 0;
        const maxAttempts = 3;

        // محاولة الإضافة عدة مرات مع تأخير متزايد بين المحاولات
        while (attempts < maxAttempts) {
          attempts++;
          try {
            console.log(`Force add attempt ${attempts}`);

            // استخدام الدالة الجديدة المحسنة
            stationResult = await insertStationDirect(stationData);
            console.log(`Station force-added successfully on attempt ${attempts}:`, stationResult);

            // إذا نجحت العملية، نتوقف
            break;
          } catch (error) {
            console.error(`Error on force add attempt ${attempts}:`, error);

            // إذا وصلنا للمحاولة الأخيرة، نرمي الخطأ للمعالجة الخارجية
            if (attempts === maxAttempts) {
              throw error;
            }

            // انتظار قبل المحاولة التالية (زيادة الانتظار مع كل محاولة)
            await new Promise(resolve => setTimeout(resolve, attempts * 1000));
          }
        }

        if (!stationResult) {
          throw new Error("فشلت إضافة المحطة بالقوة بعد عدة محاولات");
        }

        // تحديث قائمة المحطات
        setStations(prevStations => [...prevStations, stationResult]);

        // إغلاق النوافذ وإعادة تعيين الحالة
        setIsDuplicateDialogOpen(false);
        setIsAddDialogOpen(false);
        setPendingAddStation(null);
        setDuplicateStation(null);
        setCurrentStation({});

        // إعادة تحميل البيانات لتحديث العدد الإجمالي
        loadStationsOptimized();

        toast({
          title: "تمت الإضافة بنجاح",
          description: `تمت إضافة محطة ${stationResult.name} بنجاح`,
        });
      } finally {
        setIsAddingInProgress(false);
      }
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

  // التعامل مع تغيير القيم في القوائم المنسدلة
  const handleSelectChange = (name: string, value: string) => {
    setCurrentStation({ ...currentStation, [name]: value });
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

  // حذف المحطات المكررة
  const handleDeleteDuplicates = async () => {
    try {
      const result = await deleteDuplicateStations(stations);

      // تحديث قائمة المحطات بعد الحذف
      loadStationsOptimized();

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

  const handleOpenDeleteDuplicatesDialog = () => {
    setIsDeleteDuplicatesDialogOpen(true);
  };

  const handleCloseDeleteDuplicatesDialog = () => {
    setIsDeleteDuplicatesDialogOpen(false);
  };

  // إحصائيات
  // استخدام العدد الإجمالي من قاعدة البيانات بدلاً من طول المصفوفة المحلية
  const totalStations = totalStationsCount;
  const duplicateCount = duplicateStationsCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-orange-50">
      {/* هيدر متحرك */}
      <DashboardHeader
        onLogout={handleLogout}
        onAddStation={handleOpenAddDialog}
        onDeleteDuplicates={duplicateCount > 0 ? handleOpenDeleteDuplicatesDialog : undefined}
        duplicateCount={duplicateCount}
        isAddingInProgress={isAddingInProgress}
      />

      {/* بطاقات إحصائية */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4 border-b-4 border-noor-purple"
        >
          <Building2 className="h-10 w-10 text-noor-purple" />
          <div>
            <div className="text-2xl font-bold text-noor-purple">{totalStations}</div>
            <div className="text-gray-600">{language === 'ar' ? 'إجمالي المحطات' : 'Total Stations'}</div>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4 border-b-4 border-orange-400"
        >
          <BarChart3 className="h-10 w-10 text-orange-400" />
          <div>
            <div className="text-2xl font-bold text-orange-500">{duplicateCount}</div>
            <div className="text-gray-600">{language === 'ar' ? 'محطات مكررة' : 'Duplicate Stations'}</div>
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4 border-b-4 border-green-400"
        >
          {isLoading ? (
            <Loader2 className="h-10 w-10 text-green-400 animate-spin" />
          ) : (
            <RefreshCw className="h-10 w-10 text-green-400" />
          )}
          <div>
            <div className="text-2xl font-bold text-green-500">
              {isLoading
                ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...')
                : (language === 'ar' ? 'محدث' : 'Updated')}
            </div>
            <div className="text-gray-600">{language === 'ar' ? 'حالة البيانات' : 'Data Status'}</div>
          </div>
        </motion.div>
      </motion.div>

      {/* تبويبات وإدارة المحطات */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="container mx-auto"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="h-12 w-12 text-noor-purple animate-spin mb-4" />
            <div className="text-xl text-noor-purple">جاري تحميل بيانات المحطات...</div>
          </div>
        ) : (
          <DashboardTabs
            stations={stations}
            onEdit={handleOpenEditDialog}
            onDelete={handleOpenDeleteDialog}
          />
        )}
      </motion.div>

      {/* النوافذ المنبثقة */}
      <StationDialog
        isOpen={isAddDialogOpen || isEditDialogOpen}
        onClose={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }}
        station={currentStation}
        isEditing={isEditDialogOpen}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onSubmit={isAddDialogOpen ? handleAddStation : handleEditStation}
      />
      <DeleteStationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        stationName={currentStation.name || ''}
        stationId={currentStation.id as string}
        onConfirm={handleDeleteStation}
      />
      <DuplicateStationDialog
        isOpen={isDuplicateDialogOpen}
        onClose={() => setIsDuplicateDialogOpen(false)}
        duplicateStation={duplicateStation}
        onDelete={id => handleDeleteStation(id)}
        onContinueAnyway={handleForceAddStation}
      />
      <DeleteDuplicatesDialog
        isOpen={isDeleteDuplicatesDialogOpen}
        onClose={handleCloseDeleteDuplicatesDialog}
        duplicateCount={duplicateCount}
        onConfirm={handleDeleteDuplicates}
      />

      {/* Se eliminaron los controles de paginación duplicados */}

      {isAddingInProgress && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-noor-purple animate-spin mb-4" />
            <div className="text-lg font-semibold">
              {language === 'ar' ? 'جاري إضافة المحطة...' : 'Adding station...'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
