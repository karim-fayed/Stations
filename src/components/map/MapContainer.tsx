
import React, { useRef, useState, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { RefreshCcw, ChevronDown, ChevronUp } from "lucide-react";

interface MapContainerProps {
  mapContainerRef: React.RefObject<HTMLDivElement>;
  onResetMap: () => void;
  language: 'ar' | 'en';
  children?: React.ReactNode;
}

const MapContainer: React.FC<MapContainerProps> = ({
  mapContainerRef,
  onResetMap,
  language,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // التحقق مما إذا كانت الشاشة صغيرة
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileScreen = window.innerWidth < 480;
      setIsMobile(isMobileScreen);

      // إذا كانت الشاشة صغيرة، نجعل الخريطة موسعة تلقائيًا
      if (isMobileScreen) {
        setIsExpanded(true);
      }
    };

    // التحقق عند التحميل
    checkScreenSize();

    // التحقق عند تغيير حجم الشاشة
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // تبديل حالة التوسيع
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative flex-grow">
      <div
        ref={mapContainerRef}
        className={`map-container rounded-lg shadow-lg ${isExpanded ? 'expanded' : ''} ${
          !isMobile ? 'h-[50px] xs:h-[200px] sm:h-[300px] md:h-[500px]' : ''
        }`}
      >
        {/* لا نحتاج إلى النص الإرشادي بعد الآن لأن الخريطة ستكون دائمًا موسعة على الأجهزة المحمولة */}
      </div>

      {/* لا نحتاج إلى زر توسيع/تصغير الخريطة بعد الآن لأن الخريطة ستكون دائمًا موسعة على الأجهزة المحمولة */}

      {/* Reset map button */}
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

      {children}
    </div>
  );
};

export default MapContainer;
