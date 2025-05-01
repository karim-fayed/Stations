
import * as XLSX from 'xlsx';
import { GasStation } from '@/types/station';
import { supabase } from '@/integrations/supabase/client';
import { addStation } from './stationService';

/**
 * تصدير محطات الوقود إلى ملف Excel
 */
export const exportStationsToExcel = (stations: GasStation[]): void => {
  try {
    // تحويل البيانات إلى تنسيق مناسب للتصدير
    const data = stations.map(station => ({
      'الاسم': station.name,
      'المنطقة': station.region,
      'الموقع الفرعي': station.sub_region,
      'خط العرض': station.latitude,
      'خط الطول': station.longitude,
      'أنواع الوقود': station.fuel_types || '',
      'معلومات إضافية': station.additional_info || ''
    }));

    // إنشاء workbook جديد
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // إضافة ورقة العمل إلى الملف
    XLSX.utils.book_append_sheet(wb, ws, "محطات الوقود");
    
    // تحميل الملف
    XLSX.writeFile(wb, "محطات_نور.xlsx");
  } catch (error) {
    console.error("خطأ في تصدير البيانات:", error);
    throw error;
  }
};

/**
 * استيراد محطات الوقود من ملف Excel
 * @returns نتائج الاستيراد مع عدد المحطات التي تم إضافتها وأي أخطاء
 */
export const importStationsFromExcel = async (
  file: File
): Promise<{ success: number; failed: number; errors: string[] }> => {
  try {
    const result = { success: 0, failed: 0, errors: [] as string[] };
    
    // قراءة الملف
    const reader = new FileReader();
    
    // انتظار تحميل الملف
    const fileData = await new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as ArrayBuffer);
        } else {
          reject(new Error("فشل في قراءة الملف"));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });

    // تحليل ملف Excel
    const wb = XLSX.read(fileData, { type: 'array' });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    
    // تحويل إلى مصفوفة من الكائنات
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

    // التحقق من صحة الهيئة المتوقعة للبيانات
    for (const row of rawData) {
      try {
        // استخراج البيانات وتحويلها إلى الهيكل المطلوب
        const station: Omit<GasStation, "id"> = {
          name: row['الاسم'] || row['name'] || "",
          region: row['المنطقة'] || row['region'] || "",
          sub_region: row['الموقع الفرعي'] || row['sub_region'] || "",
          latitude: Number(row['خط العرض'] || row['latitude'] || 0),
          longitude: Number(row['خط الطول'] || row['longitude'] || 0),
          fuel_types: row['أنواع الوقود'] || row['fuel_types'] || "",
          additional_info: row['معلومات إضافية'] || row['additional_info'] || ""
        };

        // التحقق من البيانات الإلزامية
        if (!station.name || !station.region || !station.latitude || !station.longitude) {
          throw new Error("بيانات غير مكتملة للمحطة");
        }

        // إضافة المحطة
        await addStation(station);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push(`خطأ في الصف ${result.success + result.failed}: ${(error as Error).message}`);
      }
    }

    return result;
  } catch (error) {
    console.error("خطأ في استيراد البيانات:", error);
    throw error;
  }
};

/**
 * تنزيل قالب ملف Excel فارغ
 */
export const downloadExcelTemplate = (): void => {
  try {
    // إنشاء قالب فارغ مع أسماء الأعمدة
    const template = [
      {
        'الاسم': '',
        'المنطقة': '',
        'الموقع الفرعي': '',
        'خط العرض': '',
        'خط الطول': '',
        'أنواع الوقود': '',
        'معلومات إضافية': ''
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(template);
    
    // إضافة ورقة العمل إلى الملف
    XLSX.utils.book_append_sheet(wb, ws, "قالب محطات الوقود");
    
    // تحميل الملف
    XLSX.writeFile(wb, "قالب_محطات_نور.xlsx");
  } catch (error) {
    console.error("خطأ في تنزيل القالب:", error);
    throw error;
  }
};
