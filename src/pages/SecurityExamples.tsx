import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import secureIO from '@/utils/secureIO';
import secureStorage from '@/utils/secureStorage';
import secureApi from '@/utils/secureApi';

const SecurityExamples: React.FC = () => {
  const [activeTab, setActiveTab] = useState('input-sanitization');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">أمثلة على حماية الكود</h1>
      <p className="text-gray-600 mb-6">
        هذه الصفحة تعرض أمثلة على كيفية استخدام وحدات الأمان المختلفة في التطبيق.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="input-sanitization">تطهير المدخلات</TabsTrigger>
          <TabsTrigger value="secure-storage">التخزين الآمن</TabsTrigger>
        </TabsList>

        <TabsContent value="input-sanitization">
          <InputSanitizationExample />
        </TabsContent>

        <TabsContent value="secure-storage">
          <SecureStorageExample />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// مثال تطهير المدخلات
const InputSanitizationExample: React.FC = () => {
  const [input, setInput] = useState('');
  const [sanitizedOutput, setSanitizedOutput] = useState('');
  const [htmlInput, setHtmlInput] = useState('<p>هذا نص <script>alert("خطير")</script> يحتوي على كود خطير</p>');
  const [sanitizedHtml, setSanitizedHtml] = useState('');
  const [error, setError] = useState('');

  // معالجة تطهير النص
  const handleSanitize = () => {
    try {
      setError('');

      // تطهير النص
      const sanitized = secureIO.sanitizeFormInput(input);
      setSanitizedOutput(sanitized);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // معالجة تطهير HTML
  const handleSanitizeHtml = () => {
    try {
      setError('');

      // تطهير HTML
      const sanitized = secureIO.sanitizeHTMLAllowSome(htmlInput);
      setSanitizedHtml(sanitized);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">تطهير المدخلات</h2>

      {/* عرض الخطأ */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* تطهير النص */}
        <div className="border rounded-md p-4">
          <h3 className="text-lg font-semibold mb-2">تطهير النص</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">النص المدخل:</label>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="أدخل نصًا يحتوي على رموز خاصة مثل < > & ' /"
              />
            </div>

            <Button onClick={handleSanitize}>تطهير النص</Button>

            {sanitizedOutput && (
              <div>
                <label className="block text-sm font-medium mb-1">النص بعد التطهير:</label>
                <div className="bg-gray-50 p-2 rounded-md border">
                  {sanitizedOutput}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* تطهير HTML */}
        <div className="border rounded-md p-4">
          <h3 className="text-lg font-semibold mb-2">تطهير HTML</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">HTML المدخل:</label>
              <Textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleSanitizeHtml}>تطهير HTML</Button>

            {sanitizedHtml && (
              <div>
                <label className="block text-sm font-medium mb-1">HTML بعد التطهير:</label>
                <div className="bg-gray-50 p-2 rounded-md border">
                  <pre className="whitespace-pre-wrap">{sanitizedHtml}</pre>
                </div>

                <label className="block text-sm font-medium mt-4 mb-1">عرض HTML المطهر:</label>
                <div className="bg-white p-2 rounded-md border" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// مثال التخزين الآمن
const SecureStorageExample: React.FC = () => {
  const [key, setKey] = useState('test_key');
  const [value, setValue] = useState('');
  const [storedValue, setStoredValue] = useState('');
  const [forceEncryption, setForceEncryption] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // معالجة تخزين القيمة
  const handleStore = () => {
    try {
      setError('');
      setSuccess('');

      // تخزين القيمة بشكل آمن
      secureStorage.setItem(key, value, forceEncryption);

      setSuccess('تم تخزين القيمة بنجاح');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // معالجة استرجاع القيمة
  const handleRetrieve = () => {
    try {
      setError('');
      setSuccess('');

      // استرجاع القيمة المخزنة
      const retrieved = secureStorage.getItem<string>(key, '');

      setStoredValue(retrieved);
      setSuccess('تم استرجاع القيمة بنجاح');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // معالجة حذف القيمة
  const handleRemove = () => {
    try {
      setError('');
      setSuccess('');

      // حذف القيمة المخزنة
      secureStorage.removeItem(key);

      setStoredValue('');
      setSuccess('تم حذف القيمة بنجاح');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">التخزين الآمن</h2>

      {/* عرض الخطأ */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* عرض النجاح */}
      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertTitle>نجاح</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="border rounded-md p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">المفتاح:</label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="أدخل المفتاح"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">القيمة:</label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="أدخل القيمة"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="force-encryption"
              checked={forceEncryption}
              onChange={(e) => setForceEncryption(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="force-encryption">إجبار التشفير</label>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleStore}>تخزين</Button>
            <Button onClick={handleRetrieve} variant="outline">استرجاع</Button>
            <Button onClick={handleRemove} variant="destructive">حذف</Button>
          </div>

          {storedValue && (
            <div>
              <label className="block text-sm font-medium mb-1">القيمة المخزنة:</label>
              <div className="bg-gray-50 p-2 rounded-md border">
                {storedValue}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityExamples;
