import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardHeader from "@/components/admin/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SaudiCity } from "@/types/station";
import { useToast } from "@/hooks/use-toast";
import { fetchCities } from "@/services/cityService";
import RegionsTable from "@/components/admin/RegionsTable";
import AddCityDialog from "@/components/admin/AddCityDialog";
import AuthGuard from "@/components/admin/AuthGuard";
import { supabase } from "@/integrations/supabase/client";

const RegionsManagement: React.FC = () => {
  const [regions, setRegions] = useState<SaudiCity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  // دالة لتسجيل الخروج
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  // جلب قائمة المناطق
  useEffect(() => {
    const getRegions = async () => {
      try {
        setIsLoading(true);
        const citiesData = await fetchCities();
        setRegions(citiesData);
      } catch (error) {
        console.error("خطأ في جلب المناطق:", error);
        toast({
          title: "خطأ في جلب المناطق",
          description: "حدث خطأ أثناء محاولة جلب قائمة المناطق.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getRegions();
  }, [toast, refreshTrigger]);

  // دالة لتحديث قائمة المناطق
  const refreshRegions = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // دالة لإضافة منطقة جديدة
  const handleAddRegion = () => {
    setIsAddDialogOpen(true);
  };

  // دالة لمعالجة إضافة منطقة جديدة
  const handleRegionAdded = (newRegion: SaudiCity) => {
    refreshRegions();
  };

  return (
    <AuthGuard requireOwner={true}>
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-orange-50 rtl">
        <div className="container mx-auto py-8 px-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <DashboardHeader
              onLogout={handleLogout}
              onAddStation={() => {}}
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6"
          >
            <div className="bg-white rounded-lg shadow-lg border border-purple-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-noor-purple">إدارة المناطق</h2>
                <Button
                  onClick={handleAddRegion}
                  className="bg-noor-purple hover:bg-noor-purple/90"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة منطقة جديدة
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-noor-purple"></div>
                </div>
              ) : (
                <RegionsTable
                  regions={regions}
                  onRegionUpdated={refreshRegions}
                  onRegionDeleted={refreshRegions}
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* نافذة إضافة منطقة جديدة */}
        <AddCityDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onCityAdded={handleRegionAdded}
        />
      </div>
    </AuthGuard>
  );
};

export default RegionsManagement;
