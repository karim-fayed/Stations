
import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";

const LoginHeader = () => {
  const { t } = useLanguage();
  return (
    <div className="text-center mb-0">
      <img
        src="/lovable-uploads/27c1f136-856b-4b61-b332-3cea9403770a.png"
        alt="Noor Stations Logo"
        className="mx-auto h-32 w-auto mb-4"
      />
      <h2 className="mt-2 text-4xl font-bold text-gray-900 mb-2">
        {t('login', 'title')}
      </h2>
      <p className="mt-1 text-lg text-gray-600">
        {t('login', 'subtitle')}
      </p>
    </div>
  );
};

export default LoginHeader;
