
import React from "react";
import { useLanguage } from "@/i18n/LanguageContext";

const LoginHeader = () => {
  const { t } = useLanguage();
  return (
    <div className="text-center mb-8">
      <img
        src="/lovable-uploads/7d04d515-ba22-4ed7-9bba-9b93a0f1eba3.png"
        alt="Noor Stations Logo"
        className="mx-auto h-24 w-auto"
      />
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
        {t('login', 'title')}
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        {t('login', 'subtitle')}
      </p>
    </div>
  );
};

export default LoginHeader;
