
import React from 'react';
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Language } from '@/i18n/translations';

interface MapControlPanelProps {
  onResetMap: () => void;
  language: Language;
}

const MapControlPanel: React.FC<MapControlPanelProps> = ({ onResetMap, language }) => {
  return (
    <div className="absolute top-2 left-2 z-10">
      <Button
        variant="outline" 
        size="icon"
        className="bg-white hover:bg-gray-100 shadow-md"
        onClick={onResetMap}
        title={language === 'ar' ? 'إعادة تعيين الخريطة' : 'Reset map'}
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MapControlPanel;
