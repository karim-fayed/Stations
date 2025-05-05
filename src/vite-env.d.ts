/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // أضف المزيد من متغيرات البيئة هنا
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// تعريف متغير process لحل مشكلة "process is not defined"
declare const process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  };
};
