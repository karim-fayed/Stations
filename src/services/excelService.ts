
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
 * @param file ملف Excel المراد استيراده
 * @param skipDuplicateCheck تجاوز التحقق من المحطات المكررة
 * @returns نتائج الاستيراد مع عدد المحطات التي تم إضافتها وأي أخطاء
 */
export const importStationsFromExcel = async (
  file: File,
  skipDuplicateCheck: boolean = false,
  hasHeaderRow: boolean = true
): Promise<{ success: number; failed: number; errors: string[] }> => {
  console.log(`بدء استيراد المحطات من Excel مع تجاوز التحقق: ${skipDuplicateCheck}`);
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
    let rawData: Record<string, any>[];

    if (hasHeaderRow) {
      // استخدام الصف الأول كأسماء أعمدة
      rawData = XLSX.utils.sheet_to_json<Record<string, any>>(ws);
    } else {
      // إنشاء أسماء أعمدة افتراضية
      rawData = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { header: ['الاسم (إلزامي)', 'المنطقة (إلزامي)', 'الموقع الفرعي (إلزامي)', 'خط العرض (إلزامي)', 'خط الطول (إلزامي)', 'أنواع الوقود (اختياري)', 'معلومات إضافية (اختياري)'] });
    }

    // طباعة عدد الصفوف المستوردة للتشخيص
    console.log(`تم استيراد ${rawData.length} صف من ملف Excel`);
    console.log(`أسماء الأعمدة: ${Object.keys(rawData[0] || {}).join(', ')}`);

    // التحقق من صحة الهيئة المتوقعة للبيانات
    // استخدام Promise.all لمعالجة الصفوف بشكل متوازي بدلاً من متسلسل
    // تقسيم المعالجة إلى مجموعات صغيرة لتجنب الضغط على الخادم
    const batchSize = 5; // تقليل حجم المجموعة إلى 5 بدلاً من 10
    const batches = [];

    console.log(`تقسيم ${rawData.length} محطة إلى مجموعات بحجم ${batchSize}`);

    for (let i = 0; i < rawData.length; i += batchSize) {
      const batch = rawData.slice(i, i + batchSize);
      batches.push(batch);
    }

    console.log(`تم إنشاء ${batches.length} مجموعة للمعالجة`);

    // معالجة كل مجموعة على حدة
    for (const batch of batches) {
      const batchPromises = batch.map(async (row, index) => {
        try {
          // طباعة بيانات الصف للتشخيص
          console.log(`بيانات الصف ${index + 1}:`, JSON.stringify(row));

          // استخراج البيانات وتحويلها إلى الهيكل المطلوب
          const station: Omit<GasStation, "id"> = {
            name: row['الاسم'] || row['الاسم (إلزامي)'] || row['name'] || row['Station Name'] || row['station_name'] || "",
            region: row['المنطقة'] || row['المنطقة (إلزامي)'] || row['region'] || row['Region'] || "",
            sub_region: row['الموقع الفرعي'] || row['الموقع الفرعي (إلزامي)'] || row['sub_region'] || row['Sub Region'] || row['Location'] || "",
            latitude: parseFloat(String(row['خط العرض'] || row['خط العرض (إلزامي)'] || row['latitude'] || row['Latitude'] || 0)),
            longitude: parseFloat(String(row['خط الطول'] || row['خط الطول (إلزامي)'] || row['longitude'] || row['Longitude'] || 0)),
            fuel_types: row['أنواع الوقود'] || row['أنواع الوقود (اختياري)'] || row['fuel_types'] || row['Fuel Types'] || "",
            additional_info: row['معلومات إضافية'] || row['معلومات إضافية (اختياري)'] || row['additional_info'] || row['Additional Info'] || ""
          };

          // طباعة البيانات المستخرجة للتشخيص
          console.log(`البيانات المستخرجة للمحطة ${index + 1}:`, JSON.stringify(station));

          // التحقق من صحة الإحداثيات
          if (isNaN(station.latitude) || isNaN(station.longitude) ||
              (station.latitude === 0 && station.longitude === 0)) {
            console.log(`إحداثيات غير صالحة للصف ${index + 1}: ${station.latitude}, ${station.longitude}`);

            // محاولة استخراج الإحداثيات من أعمدة أخرى محتملة
            const possibleLatColumns = ['lat', 'Lat', 'LAT', 'latitude', 'Latitude', 'LATITUDE'];
            const possibleLngColumns = ['lng', 'Lng', 'LNG', 'long', 'Long', 'LONG', 'longitude', 'Longitude', 'LONGITUDE'];

            for (const key of Object.keys(row)) {
              if (possibleLatColumns.some(col => key.includes(col)) && !isNaN(parseFloat(String(row[key])))) {
                station.latitude = parseFloat(String(row[key]));
                console.log(`تم العثور على خط العرض في العمود ${key}: ${station.latitude}`);
              }
              if (possibleLngColumns.some(col => key.includes(col)) && !isNaN(parseFloat(String(row[key])))) {
                station.longitude = parseFloat(String(row[key]));
                console.log(`تم العثور على خط الطول في العمود ${key}: ${station.longitude}`);
              }
            }
          }

          // التحقق من البيانات الإلزامية وإضافة قيم افتراضية إذا لزم الأمر
          let missingFields = [];

          // التحقق من الاسم (إجباري)
          if (!station.name || station.name.trim() === "") {
            missingFields.push("الاسم");
          }

          // التحقق من المنطقة (إجبارية)
          if (!station.region || station.region.trim() === "") {
            missingFields.push("المنطقة");
          }

          // التحقق من الموقع الفرعي (إجباري)
          if (!station.sub_region || station.sub_region.trim() === "") {
            missingFields.push("الموقع الفرعي");
          }

          // التحقق من الإحداثيات (إجبارية)
          if (isNaN(station.latitude) || station.latitude === 0) {
            missingFields.push("خط العرض");
          }

          if (isNaN(station.longitude) || station.longitude === 0) {
            missingFields.push("خط الطول");
          }

          // أنواع الوقود ومعلومات إضافية اختيارية، لا نتحقق منها

          if (missingFields.length > 0) {
            throw new Error(`بيانات غير مكتملة للمحطة: ${missingFields.join(", ")} غير موجودة أو غير صالحة`);
          }

          // إضافة المحطة مع تمرير خيار تجاوز التحقق من المحطات المكررة
          console.log(`محاولة إضافة محطة من Excel: ${station.name}, تجاوز التحقق: ${skipDuplicateCheck}`);
          try {
            const addedStation = await addStation(station, skipDuplicateCheck);
            console.log(`تمت إضافة المحطة بنجاح: ${station.name}, ID: ${addedStation.id}`);
            return { success: true, index };
          } catch (addError) {
            console.error(`فشل إضافة المحطة ${station.name}:`, addError);
            // تحسين رسالة الخطأ
            let errorMessage = (addError as Error).message;
            if (errorMessage.includes('JSON object requested, multiple (or no) rows returned')) {
              errorMessage = 'خطأ في قاعدة البيانات: تم إرجاع أكثر من صف أو لم يتم إرجاع أي صف';
            }
            throw new Error(errorMessage);
          }
        } catch (error) {
          return {
            success: false,
            index,
            error: `خطأ في الصف ${index + 1}: ${(error as Error).message}`
          };
        }
      });

      // انتظار اكتمال معالجة المجموعة الحالية
      const batchResults = await Promise.all(batchPromises);

      // تحديث النتائج
      batchResults.forEach(res => {
        if (res.success) {
          result.success++;
        } else {
          result.failed++;
          result.errors.push(res.error);
        }
      });

      // إضافة تأخير بين المجموعات لتجنب الضغط على الخادم
      if (batches.length > 1) {
        console.log(`انتظار قبل معالجة المجموعة التالية...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // زيادة التأخير إلى 1 ثانية
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
    // إنشاء قالب فارغ مع أسماء الأعمدة وأمثلة
    const template = [
      {
        'الاسم (إلزامي)': 'محطة نور الرياض',
        'المنطقة (إلزامي)': 'الرياض',
        'الموقع الفرعي (إلزامي)': 'حي النزهة',
        'خط العرض (إلزامي)': '24.7136',
        'خط الطول (إلزامي)': '46.6753',
        'أنواع الوقود (اختياري)': '91, 95, ديزل',
        'معلومات إضافية (اختياري)': 'مفتوحة 24 ساعة'
      },
      {
        'الاسم (إلزامي)': 'محطة نور جدة',
        'المنطقة (إلزامي)': 'جدة',
        'الموقع الفرعي (إلزامي)': 'حي الروضة',
        'خط العرض (إلزامي)': '21.5433',
        'خط الطول (إلزامي)': '39.1728',
        'أنواع الوقود (اختياري)': '91, 95',
        'معلومات إضافية (اختياري)': 'تحتوي على مطعم وسوبرماركت'
      },
      {
        'الاسم (إلزامي)': '',
        'المنطقة (إلزامي)': '',
        'الموقع الفرعي (إلزامي)': '',
        'خط العرض (إلزامي)': '',
        'خط الطول (إلزامي)': '',
        'أنواع الوقود (اختياري)': '',
        'معلومات إضافية (اختياري)': ''
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(template);

    // إضافة ورقة العمل إلى الملف
    XLSX.utils.book_append_sheet(wb, ws, "قالب محطات الوقود");

    // إضافة تنسيق للخلايا
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:G3');

    // تعيين عرض الأعمدة
    const wscols = [
      { wch: 25 }, // الاسم (إلزامي)
      { wch: 20 }, // المنطقة (إلزامي)
      { wch: 25 }, // الموقع الفرعي (إلزامي)
      { wch: 20 }, // خط العرض (إلزامي)
      { wch: 20 }, // خط الطول (إلزامي)
      { wch: 25 }, // أنواع الوقود (اختياري)
      { wch: 30 }, // معلومات إضافية (اختياري)
    ];
    ws['!cols'] = wscols;

    // تحميل الملف
    XLSX.writeFile(wb, "قالب_محطات_نور.xlsx");
  } catch (error) {
    console.error("خطأ في تنزيل القالب:", error);
    throw error;
  }
};
