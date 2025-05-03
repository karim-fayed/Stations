
import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";

const LoginHeader = () => {
  const { t } = useLanguage();
  return (
    <div className="text-center mb-6">
      <img
        src="/lovable-uploads/5ec2160b-7bc2-4387-87e5-5f1f264a0aa1.png"
        alt="Noor Stations Logo"
        className="mx-auto h-28 w-auto mb-4"
      />
      <h2 className="mt-2 text-5xl font-bold text-gray-900 mb-2">
        {t('login', 'title')}
      </h2>
      <p className="mt-2 text-xl text-gray-600">
        {t('login', 'subtitle')}
      </p>
    </div>
  );
};

export default LoginHeader;
