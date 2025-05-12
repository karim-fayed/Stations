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
      },
      hmr: {
        overlay: false,
      },
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
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Eliminamos la línea problemática con el comodín
          // y dejamos que Vite maneje los paquetes de Radix UI automáticamente
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
}));
