
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { GasStation } from '@/types/station';

interface DashboardTabsProps {
  stations?: GasStation[];
  onEdit?: (station: GasStation) => void;
  onDelete?: (station: GasStation) => void;
}

const DashboardTabs = ({ stations, onEdit, onDelete }: DashboardTabsProps = {}) => {
  const { t } = useTranslation();

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
