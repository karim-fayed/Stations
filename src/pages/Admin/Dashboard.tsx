
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GasStation } from "@/types/station";
import DashboardHeader from '@/components/admin/DashboardHeader';
import StationsTable from '@/components/admin/StationsTable';
import ExcelImportExport from '@/components/admin/ExcelImportExport';
import CreateNotificationForm from '@/components/admin/CreateNotificationForm';
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("stations");
  const [stations, setStations] = useState<GasStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch stations on component mount
  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('stations').select('*');
      
      if (error) {
        throw error;
      }
      
      setStations(data || []);
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل بيانات المحطات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleAddStation = () => {
    // This function would typically open a dialog to add a station
    toast({
      title: "إضافة محطة",
      description: "هذه الميزة قيد التطوير",
    });
  };

  const handleEditStation = (station: GasStation) => {
    // This function would typically open a dialog to edit a station
    toast({
      title: "تعديل المحطة",
      description: `تعديل المحطة: ${station.name}`,
    });
  };

  const handleDeleteStation = (station: GasStation) => {
    // This function would typically open a confirmation dialog to delete a station
    toast({
      title: "حذف المحطة",
      description: `حذف المحطة: ${station.name}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        onLogout={handleLogout} 
        onAddStation={handleAddStation}
      />
      
      <div className="container mx-auto p-4">
        <Tabs defaultValue="stations" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="stations">المحطات</TabsTrigger>
            <TabsTrigger value="import-export">استيراد/تصدير</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stations" className="border rounded-md p-4 bg-white shadow-sm">
            <StationsTable 
              stations={stations} 
              onEdit={handleEditStation} 
              onDelete={handleDeleteStation} 
            />
          </TabsContent>
          
          <TabsContent value="import-export" className="border rounded-md p-4 bg-white shadow-sm">
            <ExcelImportExport />
          </TabsContent>
          
          <TabsContent value="notifications" className="border rounded-md p-4 bg-white shadow-sm">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">إدارة الإشعارات</h2>
              <p className="mb-6 text-gray-600 text-center">
                يمكنك إنشاء إشعارات جديدة لإبلاغ المستخدمين بالتحديثات المهمة
              </p>
              <CreateNotificationForm />
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="border rounded-md p-4 bg-white shadow-sm">
            <div className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">قادم قريباً</h2>
              <p className="text-gray-500">
                سيتم إضافة ميزات تحليلية متقدمة في التحديث القادم
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
