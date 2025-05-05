/**
 * وحدة لتعطيل سجلات المتصفح في بيئة الإنتاج
 * يجب استيراد هذا الملف في بداية التطبيق (في ملف main.tsx)
 */

// تحقق مما إذا كنا في بيئة الإنتاج
// استخدام import.meta.env بدلاً من process.env
const isProduction = import.meta.env.PROD === true;

// تعطيل وظائف وحدة التحكم في بيئة الإنتاج
if (isProduction) {
  // حفظ النسخة الأصلية من console.error لاستخدامها للأخطاء الحرجة
  const originalConsoleError = console.error;

  // استبدال جميع وظائف وحدة التحكم بوظائف فارغة
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};

  // الاحتفاظ بوظيفة الأخطاء ولكن مع تصفية البيانات الحساسة
  console.error = (...args: any[]) => {
    // تصفية البيانات الحساسة
    const sanitizedArgs = args.map(arg => {
      if (typeof arg === 'string') {
        // إخفاء التوكنات والمفاتيح
        return arg.replace(/eyJ[\w-\.]+/g, '[REDACTED]')
                 .replace(/(['"](key|token|secret|password|auth)["']:\s*["'])[^"']+["']/gi, '$1[REDACTED]"');
      }
      return arg;
    });

    // استدعاء وظيفة الأخطاء الأصلية مع البيانات المصفاة
    originalConsoleError(...sanitizedArgs);
  };

  // تعطيل console.table
  console.table = () => {};

  // تعطيل console.dir
  console.dir = () => {};

  // تعطيل console.trace
  console.trace = () => {};
}

export default {};
