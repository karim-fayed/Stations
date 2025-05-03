
import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";

const LoginHeader = () => {
  const { t } = useLanguage();
  return (
    <div className="text-center mb-0">
      <img
        src="/lovable-uploads/682544b4-087b-4c88-953b-36902a93d35b.png"
        alt="Noor Stations Logo"
        className="mx-auto h-28 w-auto mb-4"
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
