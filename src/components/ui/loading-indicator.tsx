import React, { useState, useEffect } from 'react';

interface LoadingIndicatorProps {
  delay?: number; // تأخير قبل إظهار المؤشر (بالمللي ثانية)
  minDisplay?: number; // الحد الأدنى لوقت العرض (بالمللي ثانية)
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  delay = 300,
  minDisplay = 500
}) => {
  const [visible, setVisible] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    // تأخير إظهار المؤشر لتجنب الوميض السريع
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => {
      clearTimeout(showTimer);
    };
  }, [delay]);

  // إضافة تأثير الاختفاء عند إزالة المكون
  useEffect(() => {
    return () => {
      setRemoving(true);
      // تأخير الإزالة للسماح بتأثير الاختفاء
      setTimeout(() => {
        setVisible(false);
      }, 300);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${
        removing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
        <div className="flex space-x-2 justify-center items-center">
          <div className="h-3 w-3 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-3 w-3 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-3 w-3 bg-purple-600 rounded-full animate-bounce"></div>
        </div>
        <p className="mt-4 text-gray-600">جاري تحميل التطبيق...</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
