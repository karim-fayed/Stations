/**
 * خدمة حماية الكود - تستخدم لحماية التطبيق من العبث والتلاعب
 *
 * توفر هذه الخدمة آليات متعددة لحماية الكود من:
 * 1. التلاعب بالكود عبر أدوات المطور
 * 2. استخراج المفاتيح والتوكن
 * 3. حقن كود ضار
 * 4. التصيد والهجمات الأخرى
 */

// التحقق مما إذا كان التطبيق في وضع الإنتاج
const isProduction = import.meta.env.MODE === 'production';

// التحقق مما إذا كان تفعيل حماية الكود مطلوباً
const isCodeProtectionEnabled = import.meta.env.VITE_ENABLE_CODE_PROTECTION === 'true';

// التحقق مما إذا كان تفعيل حماية وحدة التحكم مطلوباً
const isConsoleProtectionEnabled = import.meta.env.VITE_ENABLE_CONSOLE_PROTECTION === 'true';

/**
 * تقييد وحدة التحكم (console) في المتصفح
 * يمنع استخدام وحدة التحكم للوصول إلى معلومات حساسة
 * تم تعديله لتجنب المشاكل مع بعض المتصفحات
 */
export const disableConsole = (): void => {
  if (!isProduction || !isConsoleProtectionEnabled) return;

  try {
    // حفظ الدوال الأصلية
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };

    // تعريف رسالة تحذير
    const warningMessage = 'تم تقييد وحدة التحكم لأسباب أمنية.';

    // إنشاء وظيفة مراقبة لتصفية المعلومات الحساسة
    const sensitivePatterns = [
      /api[-_]?key/i,
      /auth[-_]?token/i,
      /password/i,
      /secret/i,
      /supabase/i,
      /mapbox/i,
      /firebase/i,
      /credential/i
    ];

    // وظيفة للتحقق مما إذا كانت البيانات تحتوي على معلومات حساسة
    const containsSensitiveInfo = (data: any): boolean => {
      if (!data) return false;

      // تحويل البيانات إلى سلسلة نصية
      const str = typeof data === 'string' ? data : JSON.stringify(data);

      // التحقق من وجود أنماط حساسة
      return sensitivePatterns.some(pattern => pattern.test(str));
    };

    // تعديل دوال وحدة التحكم للتحقق من المعلومات الحساسة
    console.log = function(...args) {
      // التحقق من وجود معلومات حساسة
      if (args.some(arg => containsSensitiveInfo(arg))) {
        originalConsole.warn(warningMessage);
        return;
      }

      // استدعاء الدالة الأصلية إذا لم تكن هناك معلومات حساسة
      originalConsole.log.apply(console, args);
    };

    console.info = function(...args) {
      if (args.some(arg => containsSensitiveInfo(arg))) {
        originalConsole.warn(warningMessage);
        return;
      }
      originalConsole.info.apply(console, args);
    };

    console.debug = function(...args) {
      if (args.some(arg => containsSensitiveInfo(arg))) {
        originalConsole.warn(warningMessage);
        return;
      }
      originalConsole.debug.apply(console, args);
    };

    // الاحتفاظ بوظيفة التحذير والخطأ كما هي
    // لأنها مهمة للتشخيص وتصحيح الأخطاء

    // إضافة رسالة تحذير عند محاولة استخدام وحدة التحكم بطريقة غير مشروعة
    window.addEventListener('error', function(e) {
      if (e.message && e.message.indexOf('console') !== -1) {
        console.warn(warningMessage);
      }
    });

    console.log('Console protection enabled - sensitive information will be filtered');
  } catch (error) {
    // تجاهل الأخطاء في وضع التطوير
    console.error('Error setting up console protection:', error);
  }
};

/**
 * تقييد استخدام أدوات المطور
 * يكتشف فتح أدوات المطور ويتخذ إجراءات مناسبة
 * تم تعديله ليكون أكثر توافقًا مع المتصفحات المختلفة
 */
export const preventDevTools = (): void => {
  if (!isProduction || !isCodeProtectionEnabled) return;

  try {
    // تخزين المحتوى الأصلي للصفحة
    const originalContent = document.body.innerHTML;
    let devToolsWarningShown = false;

    // رسالة التحذير
    const warningMessage = `
      <div style="position:fixed; top:0; left:0; width:100%; height:100%; background-color:#f8f9fa; z-index:9999; display:flex; flex-direction:column; justify-content:center; align-items:center; font-family:Arial, sans-serif;">
        <div style="background-color:#dc3545; color:white; padding:20px; border-radius:10px; text-align:center; max-width:80%;">
          <h1 style="margin-bottom:20px;">تنبيه أمني</h1>
          <p style="font-size:18px; margin-bottom:20px;">تم اكتشاف محاولة استخدام أدوات المطور.</p>
          <p style="font-size:16px; margin-bottom:20px;">لأسباب أمنية، تم تقييد الوصول إلى بعض ميزات التطبيق.</p>
          <button onclick="window.location.reload()" style="background-color:white; color:#dc3545; border:none; padding:10px 20px; border-radius:5px; font-size:16px; cursor:pointer;">إعادة تحميل الصفحة</button>
        </div>
      </div>
    `;

    // وظيفة للتحقق من فتح أدوات المطور بطرق مختلفة
    const checkDevTools = () => {
      try {
        // طريقة 1: التحقق من الفرق بين أبعاد النافذة
        const widthThreshold = window.outerWidth - window.innerWidth > 200;
        const heightThreshold = window.outerHeight - window.innerHeight > 200;

        // طريقة 2: التحقق من وجود عناصر أدوات المطور
        const hasDevTools = !!window.Firebug ||
                          window.console && (window.console.firebug ||
                          (window.console.clear && window.console.profiles));

        // طريقة 3: قياس وقت تنفيذ debugger
        let devToolsOpen = false;
        const startTime = new Date().getTime();
        debugger; // سيتوقف التنفيذ هنا إذا كانت أدوات المطور مفتوحة
        const endTime = new Date().getTime();
        if (endTime - startTime > 100) {
          devToolsOpen = true;
        }

        // إذا تم اكتشاف أدوات المطور بأي طريقة
        if ((widthThreshold || heightThreshold || hasDevTools || devToolsOpen) && !devToolsWarningShown) {
          // عرض تحذير بدلاً من تغيير محتوى الصفحة بالكامل
          const warningDiv = document.createElement('div');
          warningDiv.id = 'dev-tools-warning';
          warningDiv.innerHTML = warningMessage;
          document.body.appendChild(warningDiv);

          // تعطيل بعض الوظائف الحساسة مؤقتًا
          localStorage.setItem('security_warning_shown', 'true');

          devToolsWarningShown = true;

          // إعادة المحتوى الأصلي بعد إغلاق أدوات المطور
          setTimeout(() => {
            const warning = document.getElementById('dev-tools-warning');
            if (warning && !widthThreshold && !heightThreshold && !devToolsOpen) {
              warning.remove();
              devToolsWarningShown = false;
            }
          }, 5000);
        }
      } catch (e) {
        // تجاهل أي أخطاء
      }
    };

    // فحص دوري بفترات متباعدة لتقليل التأثير على الأداء
    const checkInterval = setInterval(checkDevTools, 3000);

    // تنظيف عند مغادرة الصفحة
    window.addEventListener('beforeunload', () => {
      clearInterval(checkInterval);
    });

    // منع بعض مفاتيح الاختصار لأدوات المطور في وضع الإنتاج فقط
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12') {
        console.warn('تم تعطيل مفتاح F12 لأسباب أمنية');
        e.preventDefault();
      }

      // Ctrl+Shift+I / Cmd+Option+I
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') ||
          (e.metaKey && e.altKey && e.key.toLowerCase() === 'i')) {
        console.warn('تم تعطيل اختصار فتح أدوات المطور لأسباب أمنية');
        e.preventDefault();
      }
    });

    console.log('تم تفعيل حماية أدوات المطور');
  } catch (error) {
    console.error('خطأ في تفعيل حماية أدوات المطور:', error);
  }
};

/**
 * تهيئة جميع آليات الحماية
 * تم تحسينها لتكون أكثر مرونة وتوافقًا
 */
export const initializeProtection = (): void => {
  try {
    // تأخير تفعيل الحماية لضمان تحميل التطبيق بشكل كامل أولاً
    setTimeout(() => {
      // تفعيل حماية أدوات المطور إذا كانت مفعلة في الإعدادات
      if (isCodeProtectionEnabled) {
        try {
          preventDevTools();
          console.log('تم تفعيل حماية أدوات المطور');
        } catch (error) {
          console.error('فشل في تفعيل حماية أدوات المطور:', error);
        }
      }

      // تفعيل حماية وحدة التحكم إذا كانت مفعلة في الإعدادات
      if (isConsoleProtectionEnabled) {
        try {
          disableConsole();
          console.log('تم تفعيل حماية وحدة التحكم');
        } catch (error) {
          console.error('فشل في تفعيل حماية وحدة التحكم:', error);
        }
      }

      // إضافة طبقة حماية إضافية للمتغيرات البيئية
      try {
        // إخفاء المتغيرات البيئية من الكائنات العامة
        if (window.process && window.process.env) {
          Object.keys(window.process.env).forEach(key => {
            if (key.includes('API_KEY') || key.includes('SECRET') || key.includes('TOKEN')) {
              window.process.env[key] = '[PROTECTED]';
            }
          });
        }
      } catch (error) {
        console.error('فشل في إخفاء المتغيرات البيئية:', error);
      }
    }, 2000); // تأخير التفعيل لمدة 2 ثانية
  } catch (error) {
    console.error('فشل في تهيئة آليات الحماية:', error);
  }
};

export default {
  initializeProtection,
  disableConsole,
  preventDevTools
};
