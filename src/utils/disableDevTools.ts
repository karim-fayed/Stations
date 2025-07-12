/**
 * وحدة لتعطيل أدوات المطور في بيئة الإنتاج
 * يجب استيراد هذا الملف في بداية التطبيق (في ملف main.tsx)
 */

// تحقق مما إذا كنا في بيئة الإنتاج
// استخدام import.meta.env بدلاً من process.env
const isProduction = import.meta.env.PROD === true;

// دالة لاكتشاف iOS/Safari
function isIOS() {
// استخدام window كـ unknown ثم تحويله إلى Record<string, unknown> لتجاوز تحذيرات any
const win = window as unknown as Record<string, unknown>;
return /iPad|iPhone|iPod/.test(navigator.userAgent) && !win.MSStream;
}
function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

if (isProduction) {
  // تعطيل أدوات المطور (ما عدا iOS/Safari)
  const disableDevTools = () => {
    if (isIOS() || isSafari()) {
      // لا تفعل أي شيء على iOS/Safari
      return;
    }
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

      // استخدام window كـ unknown ثم تحويله إلى Record<string, unknown> لتجاوز تحذيرات any
      const win = window as unknown as Record<string, unknown>;
      // تعريف نوع Firebug بشكل آمن
      const firebug = win.Firebug as { chrome?: { isInitialized?: boolean } } | undefined;
      if (
        !(heightThreshold && widthThreshold) &&
        ((firebug && firebug.chrome && firebug.chrome.isInitialized) ||
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
