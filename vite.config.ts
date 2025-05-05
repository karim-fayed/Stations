import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8980,
    proxy: {
      // Proxy API requests to Supabase Edge Functions
      '/api/create-admin-account': {
        target: 'https://jtnqcyouncjoebqcalzh.supabase.co/functions/v1/create-admin-account',
        changeOrigin: true,
        rewrite: (_path) => '',
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // تعريف متغيرات البيئة
  define: {
    // تعريف متغير process.env لحل مشكلة "process is not defined"
    'process.env': {
      NODE_ENV: mode,
    },
  },
}));
