
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet } from "lucide-react";
import ExcelImportExport from "./ExcelImportExport";
import StationsTable from "./StationsTable";
import { GasStation } from "@/types/station";

interface DashboardTabsProps {
  stations: GasStation[];
  onEdit: (station: GasStation) => void;
  onDelete: (station: GasStation) => void;
}

const DashboardTabs = ({ stations, onEdit, onDelete }: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="stations" className="mb-6">
      <TabsList className="mb-4">
        <TabsTrigger value="stations">المحطات</TabsTrigger>
        <TabsTrigger value="import-export" className="flex items-center gap-1">
          <FileSpreadsheet size={14} /> استيراد/تصدير
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="stations">
        <StationsTable
          stations={stations}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TabsContent>
      
      <TabsContent value="import-export">
        <ExcelImportExport />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
