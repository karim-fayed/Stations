import React, { useState } from 'react';
import secureExcel from '@/utils/secureExcel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileSpreadsheet, Upload, Download } from 'lucide-react';

const ExcelExample: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[][]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // معالجة تغيير الملف
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // التحقق من نوع الملف
      if (!secureExcel.isValidExcelFile(selectedFile.name)) {
        setError('نوع ملف غير مدعوم. الأنواع المدعومة هي: .xlsx, .xls, .csv');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError('');
      setSuccess('');
    }
  };

  // معالجة رفع الملف
  const handleUpload = async () => {
    if (!file) {
      setError('الرجاء اختيار ملف أولاً');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      // قراءة الملف بشكل آمن
      const excelData = await secureExcel.readExcelSecurely(file);
      
      setData(excelData);
      setSuccess('تم قراءة الملف بنجاح');
    } catch (err) {
      setError((err as Error).message);
      setData([]);
    }
  };

  // معالجة تصدير البيانات
  const handleExport = () => {
    if (data.length === 0) {
      setError('لا توجد بيانات للتصدير');
      return;
    }

    try {
      // تصدير البيانات بشكل آمن
      secureExcel.exportToExcelSecurely(data, 'exported_data.xlsx');
      
      setSuccess('تم تصدير البيانات بنجاح');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">مثال استخدام Excel بشكل آمن</h2>
      
      {/* عرض الخطأ */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* عرض النجاح */}
      {success && (
        <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
          <AlertTitle>نجاح</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col gap-4">
        {/* اختيار الملف */}
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="flex-1"
          />
          <Button onClick={handleUpload} disabled={!file}>
            <Upload className="h-4 w-4 mr-2" />
            قراءة الملف
          </Button>
        </div>
        
        {/* عرض البيانات */}
        {data.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">البيانات المقروءة</h3>
              <Button onClick={handleExport} variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                تصدير البيانات
              </Button>
            </div>
            
            <div className="border rounded-md overflow-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {data[0]?.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header || `عمود ${index + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelExample;
