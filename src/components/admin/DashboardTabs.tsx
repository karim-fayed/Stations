
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { GasStation } from "@/types/station";

// Custom translation hook to avoid direct dependency on react-i18next
const useCustomTranslation = () => {
  // Return a simple translation function that returns the key as value
  // This is a temporary solution until we properly set up i18next
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'overview': 'Overview',
      'stations': 'Stations',
      'users': 'Users',
      'maintenance': 'Maintenance',
      'manageUsers': 'Manage Users'
    };
    return translations[key] || key;
  };
  
  return { t };
};

interface DashboardTabsProps {
  stations?: GasStation[];
  onEdit?: (station: GasStation) => void;
  onDelete?: (station: GasStation) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ stations = [], onEdit, onDelete }) => {
  const { t } = useCustomTranslation();

  return (
    <div className="flex flex-col-reverse md:flex-row">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="stations">{t('stations')}</TabsTrigger>
          <TabsTrigger value="users">{t('users')}</TabsTrigger>
          {/* Add new tab for database maintenance */}
          <TabsTrigger value="maintenance">{t('maintenance')}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p>Overview content here</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stations">
          <div>
            <p>Stations content here</p>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="mt-4">
            <Link to="/admin/users">
              <Button variant="outline" className="mb-4">
                {t('manageUsers')}
              </Button>
            </Link>
          </div>
        </TabsContent>
        
        {/* Add new tab content for maintenance */}
        <TabsContent value="maintenance">
          <div className="mt-4">
            <Link to="/admin/db-maintenance">
              <Button variant="outline" className="mb-4">
                صيانة قاعدة البيانات
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;
