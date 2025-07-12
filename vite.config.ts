import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
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
        // overlay: false, // تم الحذف لأن الخاصية غير مدعومة هنا
      },
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // تعريف متغيرات البيئة
  define: {
    // تعريف متغير process.env لحل مشكلة "process is not defined"
    'process.env': {
      NODE_ENV: process.env.NODE_ENV,
    },
  },
  build: {
    // استهدف ES2017 لضمان التوافق مع سفاري iOS
    target: 'es2017',
    // استخدم Terser مع إعدادات حماية إضافية
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // إزالة console
        drop_debugger: true, // إزالة debugger
      },
      mangle: true, // تشويش الأسماء
      format: {
        comments: false, // إزالة التعليقات
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mapbox: ['mapbox-gl'],
          framer: ['framer-motion'],
          supabase: ['@supabase/supabase-js'],
          reactquery: ['@tanstack/react-query'],
        },
      },
      // إضافة polyfills تلقائياً
      plugins: [
        {
          name: 'inject-polyfills',
          renderChunk(code) {
            return {
              code: `import '/public/polyfills.js';\n` + code,
              map: null,
            };
          },
        },
      ],
    },
    chunkSizeWarningLimit: 1000,
    // تفعيل إنتاج sourcemap فقط في التطوير
    sourcemap: process.env.NODE_ENV !== 'production',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
