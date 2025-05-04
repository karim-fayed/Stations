
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, MapPin, BarChart } from "lucide-react";
import ExcelImportExport from "./ExcelImportExport";
import StationsTable from "./StationsTable";
import { GasStation } from "@/types/station";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

interface DashboardTabsProps {
  stations: GasStation[];
  onEdit: (station: GasStation) => void;
  onDelete: (station: GasStation) => void;
}

const DashboardTabs = ({ stations, onEdit, onDelete }: DashboardTabsProps) => {
  const { t } = useLanguage();
  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <Tabs defaultValue="stations" className="mb-6">
      <TabsList className="mb-6 bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-md border border-purple-100 flex flex-wrap justify-center">
        <TabsTrigger
          value="stations"
          className="rounded-full px-3 sm:px-6 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-noor-purple data-[state=active]:to-noor-orange data-[state=active]:text-white transition-all duration-300 flex-1"
        >
          <MapPin size={16} className="sm:mr-2" /> <span className="hidden sm:inline">{t('dashboard', 'stations')}</span>
        </TabsTrigger>
        <TabsTrigger
          value="import-export"
          className="rounded-full px-3 sm:px-6 py-2 flex items-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-noor-purple data-[state=active]:to-noor-orange data-[state=active]:text-white transition-all duration-300 flex-1 justify-center"
        >
          <FileSpreadsheet size={16} /> <span className="hidden sm:inline">{t('dashboard', 'importExport')}</span>
        </TabsTrigger>
        <TabsTrigger
          value="analytics"
          className="rounded-full px-3 sm:px-6 py-2 flex items-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-noor-purple data-[state=active]:to-noor-orange data-[state=active]:text-white transition-all duration-300 flex-1 justify-center"
        >
          <BarChart size={16} /> <span className="hidden sm:inline">{t('dashboard', 'analytics')}</span>
        </TabsTrigger>
      </TabsList>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={tabVariants}
      >
        <TabsContent value="stations" className="bg-white rounded-lg shadow-lg p-6 border border-purple-100">
          <StationsTable
            stations={stations}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </TabsContent>

        <TabsContent value="import-export" className="bg-white rounded-lg shadow-lg p-6 border border-purple-100">
          <ExcelImportExport />
        </TabsContent>

        <TabsContent value="analytics" className="bg-white rounded-lg shadow-lg p-6 border border-purple-100">
          <div className="text-center py-12">
            <BarChart size={64} className="mx-auto text-noor-purple opacity-50 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">{t('dashboard', 'comingSoon')}</h3>
            <p className="text-gray-500">{t('dashboard', 'analyticsDescription')}</p>
          </div>
        </TabsContent>
      </motion.div>
    </Tabs>
  );
};

export default DashboardTabs;
