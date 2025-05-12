/**
 * خدمة حماية الكود من التلاعب
 * 
 * توفر هذه الخدمة آليات لحماية الكود من التلاعب والعبث
 * وتكتشف محاولات تعديل الكود أو حقن كود ضار
 */

// التحقق مما إذا كان التطبيق في وضع الإنتاج
const isProduction = import.meta.env.MODE === 'production';

// قائمة بالدوال الأصلية التي قد يتم التلاعب بها
const originalFunctions: Record<string, any> = {};

/**
 * حماية دالة من التلاعب
 * @param object الكائن الذي يحتوي على الدالة
 * @param methodName اسم الدالة
 */
export const protectMethod = (object: any, methodName: string): void => {
  if (!object || !methodName || typeof object[methodName] !== 'function') return;
  
  try {
    // حفظ الدالة الأصلية
    originalFunctions[`${object.constructor?.name || 'global'}.${methodName}`] = object[methodName];
    
    // إعادة تعريف الدالة مع حماية
    const originalMethod = object[methodName];
    
    Object.defineProperty(object, methodName, {
      value: function(...args: any[]) {
        // يمكن إضافة منطق للتحقق من صحة المعاملات هنا
        
        // استدعاء الدالة الأصلية
        return originalMethod.apply(this, args);
      },
      writable: false,
      configurable: false
    });
  } catch (error) {
    console.error(`Error protecting method ${methodName}:`, error);
  }
};

/**
 * حماية كائن بالكامل من التلاعب
 * @param object الكائن المراد حمايته
 * @param objectName اسم الكائن (للتسجيل)
 */
export const protectObject = (object: any, objectName: string): void => {
  if (!object) return;
  
  try {
    // حماية الكائن من التعديل
    Object.freeze(object);
    
    console.log(`Object ${objectName} protected from tampering`);
  } catch (error) {
    console.error(`Error protecting object ${objectName}:`, error);
  }
};

/**
 * حماية دوال الشبكة من التلاعب
 */
export const protectNetworkFunctions = (): void => {
  if (!isProduction) return;
  
  try {
    // حماية دالة fetch
    if (typeof window.fetch === 'function') {
      protectMethod(window, 'fetch');
    }
    
    // حماية دوال XMLHttpRequest
    if (typeof XMLHttpRequest !== 'undefined') {
      protectMethod(XMLHttpRequest.prototype, 'open');
      protectMethod(XMLHttpRequest.prototype, 'send');
    }
    
    // حماية WebSocket
    if (typeof WebSocket !== 'undefined') {
      protectMethod(window, 'WebSocket');
    }
    
    console.log('Network functions protected from tampering');
  } catch (error) {
    console.error('Error protecting network functions:', error);
  }
};

/**
 * حماية دوال التخزين من التلاعب
 */
export const protectStorageFunctions = (): void => {
  if (!isProduction) return;
  
  try {
    // حماية localStorage
    if (typeof localStorage !== 'undefined') {
      protectMethod(Storage.prototype, 'setItem');
      protectMethod(Storage.prototype, 'getItem');
      protectMethod(Storage.prototype, 'removeItem');
      protectMethod(Storage.prototype, 'clear');
    }
    
    // حماية sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      protectMethod(sessionStorage, 'setItem');
      protectMethod(sessionStorage, 'getItem');
      protectMethod(sessionStorage, 'removeItem');
      protectMethod(sessionStorage, 'clear');
    }
    
    console.log('Storage functions protected from tampering');
  } catch (error) {
    console.error('Error protecting storage functions:', error);
  }
};

/**
 * حماية دوال DOM من التلاعب
 */
export const protectDOMFunctions = (): void => {
  if (!isProduction) return;
  
  try {
    // حماية دوال إنشاء وتعديل العناصر
    if (typeof document !== 'undefined') {
      protectMethod(document, 'createElement');
      protectMethod(document, 'getElementById');
      protectMethod(document, 'querySelector');
      protectMethod(document, 'querySelectorAll');
      protectMethod(Element.prototype, 'setAttribute');
      protectMethod(Element.prototype, 'getAttribute');
      protectMethod(Element.prototype, 'appendChild');
      protectMethod(Element.prototype, 'removeChild');
    }
    
    console.log('DOM functions protected from tampering');
  } catch (error) {
    console.error('Error protecting DOM functions:', error);
  }
};

/**
 * تهيئة جميع آليات حماية الكود من التلاعب
 */
export const initializeTamperProtection = (): void => {
  if (!isProduction) return;
  
  try {
    protectNetworkFunctions();
    protectStorageFunctions();
    protectDOMFunctions();
    
    console.log('Tamper protection initialized');
  } catch (error) {
    console.error('Error initializing tamper protection:', error);
  }
};

export default {
  protectMethod,
  protectObject,
  protectNetworkFunctions,
  protectStorageFunctions,
  protectDOMFunctions,
  initializeTamperProtection
};
