
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from '@/components/admin/DashboardHeader';
import StationsTable from '@/components/admin/StationsTable';
import ExcelImportExport from '@/components/admin/ExcelImportExport';
import CreateNotificationForm from '@/components/admin/CreateNotificationForm';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("stations");

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="container mx-auto p-4">
        <Tabs defaultValue="stations" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="stations">المحطات</TabsTrigger>
            <TabsTrigger value="import-export">استيراد/تصدير</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stations" className="border rounded-md p-4 bg-white shadow-sm">
            <StationsTable />
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
