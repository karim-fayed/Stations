/**
 * وحدة لتأمين استخدام Excel في التطبيق
 * توفر وظائف آمنة للتعامل مع ملفات Excel
 */

import * as XLSX from 'xlsx';

/**
 * خيارات آمنة لقراءة ملفات Excel
 */
const SECURE_EXCEL_OPTIONS = {
  dense: true,        // استخدام مصفوفات كثيفة لتجنب هجمات الذاكرة
  cellFormula: false, // تعطيل الصيغ التي قد تكون خطرة
  cellHTML: false,    // تعطيل HTML في الخلايا
  cellStyles: false,  // تعطيل أنماط الخلايا لتحسين الأداء
  cellDates: true,    // تحويل التواريخ إلى كائنات Date
  cellNF: false,      // تعطيل تنسيقات الأرقام
  cellText: true,     // تحويل القيم إلى نصوص
  bookVBA: false,     // تعطيل ماكرو VBA
  bookDeps: false,    // تعطيل التبعيات
  WTF: false,         // تعطيل وضع التصحيح
  type: 'array'       // استخدام نوع مصفوفة لتجنب مشاكل التوافق
};

/**
 * أنواع الملفات المدعومة
 */
const SUPPORTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

/**
 * التحقق من نوع ملف Excel
 * @param fileName اسم الملف
 * @returns صحيح إذا كان الملف مدعومًا
 */
export const isValidExcelFile = (fileName: string): boolean => {
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(extension);
};

/**
 * تطهير بيانات Excel من الرموز الخطرة
 * @param data البيانات المراد تطهيرها
 * @returns البيانات بعد التطهير
 */
export const sanitizeExcelData = (data: string): string => {
  if (typeof data !== 'string') return '';

  // إزالة الرموز الخطرة
  return data.replace(/[<>"'&=+\-@\/*]/g, '');
};

/**
 * تطهير مصفوفة بيانات Excel
 * @param data مصفوفة البيانات
 * @returns مصفوفة البيانات بعد التطهير
 */
export const sanitizeExcelArray = (data: any[][]): any[][] => {
  return data.map(row =>
    row.map(cell => {
      if (typeof cell === 'string') {
        return sanitizeExcelData(cell);
      }
      return cell;
    })
  );
};

/**
 * قراءة ملف Excel بشكل آمن
 * @param file ملف Excel
 * @returns وعد بمصفوفة البيانات
 */
export const readExcelSecurely = (file: File): Promise<any[][]> => {
  return new Promise((resolve, reject) => {
    // التحقق من نوع الملف
    if (!isValidExcelFile(file.name)) {
      reject(new Error('نوع ملف غير مدعوم. الأنواع المدعومة هي: ' + SUPPORTED_EXTENSIONS.join(', ')));
      return;
    }

    // التحقق من حجم الملف (الحد الأقصى 5 ميجابايت)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('حجم الملف كبير جدًا. الحد الأقصى هو 5 ميجابايت.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, SECURE_EXCEL_OPTIONS);

        // استخدام الورقة الأولى فقط
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // تحويل الورقة إلى مصفوفة
        const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

        // تطهير البيانات
        const sanitizedData = sanitizeExcelArray(jsonData);

        resolve(sanitizedData);
      } catch (error) {
        reject(new Error('فشل في قراءة ملف Excel: ' + (error as Error).message));
      }
    };

    reader.onerror = () => {
      reject(new Error('فشل في قراءة الملف'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * تصدير بيانات إلى ملف Excel بشكل آمن
 * @param data البيانات المراد تصديرها
 * @param fileName اسم الملف
 */
export const exportToExcelSecurely = (data: any[][], fileName: string = 'export.xlsx'): void => {
  try {
    // التحقق من البيانات
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('البيانات غير صالحة للتصدير');
    }

    // تطهير البيانات
    const sanitizedData = sanitizeExcelArray(data);

    // إنشاء ورقة عمل
    const worksheet = XLSX.utils.aoa_to_sheet(sanitizedData);

    // إنشاء مصنف عمل
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // تصدير المصنف
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('فشل في تصدير البيانات إلى Excel:', error);
    throw new Error('فشل في تصدير البيانات إلى Excel: ' + (error as Error).message);
  }
};

export default {
  readExcelSecurely,
  exportToExcelSecurely,
  isValidExcelFile,
  sanitizeExcelData,
  sanitizeExcelArray
};
