import React, { useState } from 'react';
import secureFiles from '@/utils/secureFiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Upload, Trash2, Download } from 'lucide-react';

const FileUploadExample: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // معالجة تغيير الملف
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // التحقق من نوع الملف
      if (!secureFiles.isValidFileType(selectedFile, [
        ...secureFiles.SUPPORTED_IMAGE_TYPES,
        ...secureFiles.SUPPORTED_DOCUMENT_TYPES
      ])) {
        setError('نوع ملف غير مدعوم');
        setFile(null);
        return;
      }
      
      // التحقق من حجم الملف
      if (!secureFiles.isValidFileSize(selectedFile)) {
        setError('حجم الملف كبير جدًا. الحد الأقصى هو 5 ميجابايت');
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
      setIsUploading(true);
      setError('');
      setSuccess('');
      
      // رفع الملف بشكل آمن
      const fileUrl = await secureFiles.uploadFileSecurely(
        file,
        'public',
        'uploads'
      );
      
      setUploadedFileUrl(fileUrl);
      setSuccess('تم رفع الملف بنجاح');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  // معالجة حذف الملف
  const handleDelete = async () => {
    if (!uploadedFileUrl) {
      setError('لا يوجد ملف لحذفه');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      // استخراج المسار من الرابط
      const url = new URL(uploadedFileUrl);
      const path = url.pathname.split('/').slice(-2).join('/');
      
      // حذف الملف بشكل آمن
      await secureFiles.deleteFileSecurely(path, 'public');
      
      setUploadedFileUrl('');
      setSuccess('تم حذف الملف بنجاح');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // معالجة تحميل الملف
  const handleDownload = async () => {
    if (!uploadedFileUrl) {
      setError('لا يوجد ملف لتحميله');
      return;
    }

    try {
      setError('');
      
      // استخراج المسار من الرابط
      const url = new URL(uploadedFileUrl);
      const path = url.pathname.split('/').slice(-2).join('/');
      
      // تحميل الملف بشكل آمن
      const blob = await secureFiles.downloadFileSecurely(path, 'public');
      
      // إنشاء رابط تحميل
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = secureFiles.sanitizeFileName(file?.name || 'downloaded_file');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      
      setSuccess('تم تحميل الملف بنجاح');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">مثال رفع الملفات بشكل آمن</h2>
      
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
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileChange}
            className="flex-1"
          />
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'جاري الرفع...' : 'رفع الملف'}
          </Button>
        </div>
        
        {/* عرض الملف المرفوع */}
        {uploadedFileUrl && (
          <div className="mt-4 border rounded-md p-4">
            <h3 className="text-lg font-semibold mb-2">الملف المرفوع</h3>
            
            {/* معاينة الملف */}
            <div className="mb-4">
              {secureFiles.SUPPORTED_IMAGE_TYPES.includes(file?.type || '') ? (
                <img 
                  src={uploadedFileUrl} 
                  alt="معاينة الملف" 
                  className="max-h-64 max-w-full rounded-md"
                />
              ) : (
                <div className="bg-gray-100 p-4 rounded-md flex items-center justify-center">
                  <span className="text-gray-500">
                    {file?.name || 'ملف'}
                  </span>
                </div>
              )}
            </div>
            
            {/* أزرار التحكم */}
            <div className="flex gap-2">
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تحميل الملف
              </Button>
              <Button onClick={handleDelete} variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                حذف الملف
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadExample;
