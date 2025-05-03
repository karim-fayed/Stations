
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { exportStationsToExcel, importStationsFromExcel, downloadExcelTemplate } from "@/services/excelService";
import { fetchStations } from "@/services/stationService";
import { GasStation } from "@/types/station";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const ExcelImportExport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [skipDuplicateCheck, setSkipDuplicateCheck] = useState(true); // تغيير القيمة الافتراضية إلى true
  const [hasHeaderRow, setHasHeaderRow] = useState(true); // الملف يحتوي على صف عناوين
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      // إعادة تعيين نتائج الاستيراد السابقة
      setImportResults(null);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const stations = await fetchStations();
      exportStationsToExcel(stations);
      toast({
        title: "تم التصدير بنجاح",
        description: `تم تصدير ${stations.length} محطة إلى ملف Excel`,
      });
    } catch (error) {
      console.error("خطأ في تصدير المحطات:", error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleTemplateDownload = () => {
    try {
      downloadExcelTemplate();
      toast({
        title: "تم تنزيل القالب بنجاح",
        description: "تم تنزيل قالب Excel للمحطات",
      });
    } catch (error) {
      console.error("خطأ في تنزيل القالب:", error);
      toast({
        title: "خطأ في تنزيل القالب",
        description: "حدث خطأ أثناء تنزيل القالب",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "لم يتم اختيار ملف",
        description: "الرجاء اختيار ملف Excel لاستيراده",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsImporting(true);
      setProgress(10);

      // تحقق من امتداد الملف
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        throw new Error("يجب أن يكون الملف بصيغة Excel (.xlsx أو .xls)");
      }

      setProgress(30);
      console.log(`استيراد المحطات من Excel مع تجاوز التحقق: ${skipDuplicateCheck}, الملف يحتوي على صف عناوين: ${hasHeaderRow}`);
      const results = await importStationsFromExcel(file, skipDuplicateCheck, hasHeaderRow);
      setProgress(100);
      setImportResults(results);

      toast({
        title: "اكتمل الاستيراد",
        description: `تمت إضافة ${results.success} محطة بنجاح، فشل استيراد ${results.failed} محطة`,
        variant: results.failed > 0 ? "default" : "default",
      });

    } catch (error) {
      console.error("خطأ في استيراد المحطات:", error);
      toast({
        title: "خطأ في الاستيراد",
        description: `${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-noor-purple">استيراد وتصدير محطات الوقود</h2>

        <div className="space-y-6">
          {/* قسم التصدير */}
          <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-semibold text-lg">تصدير المحطات</h3>
            <p className="text-sm text-gray-600">
              تصدير جميع محطات الوقود إلى ملف Excel
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Download size={16} /> تصدير جميع المحطات
              </Button>
            </div>
          </div>

          {/* قسم الاستيراد */}
          <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-semibold text-lg">استيراد المحطات</h3>
            <p className="text-sm text-gray-600">
              استيراد محطات الوقود من ملف Excel. قم بتنزيل القالب أدناه للتأكد من صحة تنسيق البيانات.
            </p>

            <Button
              variant="outline"
              onClick={handleTemplateDownload}
              className="flex items-center gap-2 text-blue-600"
            >
              <FileSpreadsheet size={16} /> تنزيل قالب Excel
            </Button>

            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="max-w-sm"
              />
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id="skip-duplicate-check"
                    checked={skipDuplicateCheck}
                    onCheckedChange={(checked) => setSkipDuplicateCheck(checked as boolean)}
                  />
                  <Label
                    htmlFor="skip-duplicate-check"
                    className="flex items-center gap-1 text-green-600 font-medium cursor-pointer"
                  >
                    {skipDuplicateCheck ? (
                      <>
                        <CheckCircle size={16} />
                        السماح بإضافة المحطات المكررة (موصى به)
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} className="text-amber-600" />
                        منع المحطات المكررة (قد يفشل الاستيراد)
                      </>
                    )}
                  </Label>
                </div>
                {!skipDuplicateCheck && (
                  <Alert className="bg-amber-50 border-amber-200 py-2 px-3 mt-1">
                    <AlertDescription className="text-xs text-amber-700">
                      تحذير: سيتم رفض المحطات المكررة، مما قد يؤدي إلى فشل استيراد معظم المحطات. يُنصح بتفعيل خيار "السماح بإضافة المحطات المكررة".
                    </AlertDescription>
                  </Alert>
                )}
                {skipDuplicateCheck && (
                  <Alert className="bg-green-50 border-green-200 py-2 px-3 mt-1">
                    <AlertDescription className="text-xs text-green-700">
                      سيتم استيراد جميع المحطات بغض النظر عن وجود محطات مكررة. يمكنك استخدام زر "حذف المحطات المكررة" لاحقًا لتنظيف قاعدة البيانات.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                  <Checkbox
                    id="has-header-row"
                    checked={hasHeaderRow}
                    onCheckedChange={(checked) => setHasHeaderRow(checked as boolean)}
                  />
                  <Label
                    htmlFor="has-header-row"
                    className="flex items-center gap-1 font-medium cursor-pointer"
                  >
                    الملف يحتوي على صف عناوين (الصف الأول يحتوي على أسماء الأعمدة)
                  </Label>
                </div>

                <Alert className="bg-blue-50 border-blue-200 py-2 px-3 mt-1">
                  <AlertDescription className="text-xs text-blue-700">
                    <p className="font-semibold mb-1">تنسيق الملف المتوقع:</p>
                    <ul className="list-disc list-inside">
                      <li className="font-semibold">الاسم: اسم المحطة (إلزامي)</li>
                      <li className="font-semibold">المنطقة: المنطقة/المدينة (إلزامي)</li>
                      <li className="font-semibold">الموقع الفرعي: الموقع الفرعي (إلزامي)</li>
                      <li className="font-semibold">خط العرض: إحداثية خط العرض (إلزامي)</li>
                      <li className="font-semibold">خط الطول: إحداثية خط الطول (إلزامي)</li>
                      <li>أنواع الوقود: أنواع الوقود المتوفرة (اختياري)</li>
                      <li>معلومات إضافية: أي معلومات إضافية (اختياري)</li>
                    </ul>
                    <p className="mt-2 text-red-600 font-medium">ملاحظة: جميع الحقول إلزامية باستثناء "أنواع الوقود" و"معلومات إضافية" فقط.</p>
                  </AlertDescription>
                </Alert>
              </div>
              <Button
                onClick={handleImport}
                disabled={!file || isImporting}
                className="flex items-center gap-2 bg-noor-purple hover:bg-noor-purple/90"
              >
                <Upload size={16} /> استيراد المحطات
              </Button>
            </div>

            {isImporting && (
              <div className="space-y-2">
                <p className="text-sm">جاري استيراد البيانات...</p>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {importResults && (
              <Alert className={importResults.failed > 0 ? "bg-yellow-50" : "bg-green-50"}>
                <div className="flex items-start gap-2">
                  {importResults.failed > 0 ? (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  <div>
                    <AlertTitle className="mb-2">نتائج الاستيراد</AlertTitle>
                    <AlertDescription>
                      <p>تم استيراد {importResults.success} محطة بنجاح.</p>
                      {importResults.failed > 0 && (
                        <div className="mt-2">
                          <p className="text-yellow-600 font-semibold">فشل استيراد {importResults.failed} محطة:</p>

                          {/* تجميع الأخطاء المتشابهة */}
                          {(() => {
                            // تجميع الأخطاء المتشابهة
                            const errorGroups: Record<string, number> = {};
                            importResults.errors.forEach(error => {
                              // استخراج نوع الخطأ (الجزء قبل المعرف)
                              const errorType = error.includes('ID:')
                                ? error.substring(0, error.indexOf('ID:') + 3)
                                : error.includes('JSON object')
                                  ? 'خطأ في قاعدة البيانات: JSON object requested'
                                  : error;

                              if (errorGroups[errorType]) {
                                errorGroups[errorType]++;
                              } else {
                                errorGroups[errorType] = 1;
                              }
                            });

                            // عرض ملخص الأخطاء
                            return (
                              <div className="space-y-2 mt-2">
                                {Object.entries(errorGroups).map(([errorType, count], index) => (
                                  <div key={index} className="text-sm text-yellow-700 p-2 bg-yellow-50 rounded border border-yellow-200">
                                    <span className="font-semibold">{count} محطة: </span>
                                    {errorType.includes('محطة مكررة') ? (
                                      <span>
                                        محطات مكررة - تأكد من تفعيل خيار "السماح بإضافة المحطات المكررة"
                                      </span>
                                    ) : errorType.includes('JSON object') ? (
                                      <span>
                                        خطأ في قاعدة البيانات - حاول مرة أخرى مع تقليل عدد المحطات
                                      </span>
                                    ) : errorType.includes('بيانات غير مكتملة') ? (
                                      <span>
                                        بيانات غير مكتملة - تأكد من أن الملف يحتوي على الإحداثيات (خط العرض وخط الطول) بشكل صحيح
                                      </span>
                                    ) : (
                                      <span>{errorType}</span>
                                    )}
                                  </div>
                                ))}

                                {/* عرض بعض الأمثلة التفصيلية */}
                                <details className="mt-2">
                                  <summary className="cursor-pointer text-sm text-yellow-700 font-medium">
                                    عرض أمثلة تفصيلية للأخطاء ({Math.min(5, importResults.errors.length)} من {importResults.errors.length})
                                  </summary>
                                  <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                                    {importResults.errors.slice(0, 5).map((error, idx) => (
                                      <li key={idx}>{error}</li>
                                    ))}
                                    {importResults.errors.length > 5 && (
                                      <li>...و {importResults.errors.length - 5} أخطاء أخرى</li>
                                    )}
                                  </ul>
                                </details>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelImportExport;
