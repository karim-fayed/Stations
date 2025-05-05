/**
 * وحدة لتعطيل أدوات المطور في بيئة الإنتاج
 * يجب استيراد هذا الملف في بداية التطبيق (في ملف main.tsx)
 */

// تحقق مما إذا كنا في بيئة الإنتاج
// استخدام import.meta.env بدلاً من process.env
const isProduction = import.meta.env.PROD === true;

if (isProduction) {
  // تعطيل أدوات المطور
  const disableDevTools = () => {
    // تعطيل مفتاح F12
    document.addEventListener('keydown', (event) => {
      if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
        event.preventDefault();
      }
    });

    // تعطيل النقر بزر الماوس الأيمن
    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    // تعطيل console.log
    if (window.console) {
      // تم تنفيذ هذا في disableConsoleInProduction.ts
    }

    // محاولة تعطيل أدوات المطور
    setInterval(() => {
      const devtools = {
        isOpen: false,
        orientation: undefined as undefined | string
      };

      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (
        !(heightThreshold && widthThreshold) &&
        ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) ||
          widthThreshold ||
          heightThreshold)
      ) {
        devtools.isOpen = true;
        devtools.orientation = widthThreshold ? 'vertical' : 'horizontal';
      }

      if (devtools.isOpen && window.console) {
        console.clear();
        alert('أدوات المطور غير مسموح بها في هذا التطبيق');
      }
    }, 1000);
  };

  // تنفيذ تعطيل أدوات المطور عند تحميل الصفحة
  if (document.readyState === 'complete') {
    disableDevTools();
  } else {
    window.addEventListener('load', disableDevTools);
  }
}

export default {};
