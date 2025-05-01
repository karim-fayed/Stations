
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { exportStationsToExcel, importStationsFromExcel, downloadExcelTemplate } from "@/services/excelService";
import { fetchStations } from "@/services/stationService";
import { GasStation } from "@/types/station";

const ExcelImportExport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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
      const results = await importStationsFromExcel(file);
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
                          <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                            {importResults.errors.slice(0, 5).map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                            {importResults.errors.length > 5 && (
                              <li>...و {importResults.errors.length - 5} أخطاء أخرى</li>
                            )}
                          </ul>
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
