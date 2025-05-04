
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fixDatabaseFunctions, fixAuthIssues } from '@/services/dbFunctions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const DatabaseMaintenance = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState({
    fixFunctions: false,
    fixAuth: false
  });
  const [results, setResults] = useState({
    functions: null as any,
    auth: null as any
  });

  const handleFixFunctions = async () => {
    setLoading(prev => ({ ...prev, fixFunctions: true }));
    try {
      const result = await fixDatabaseFunctions();
      setResults(prev => ({ ...prev, functions: result }));
      toast({
        title: result.success ? "تم بنجاح" : "فشلت العملية",
        description: result.success ? result.message : result.error,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error("Error:", error);
      setResults(prev => ({ 
        ...prev, 
        functions: { 
          success: false, 
          error: "حدث خطأ غير متوقع أثناء المعالجة" 
        } 
      }));
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع أثناء محاولة إصلاح المشكلات",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, fixFunctions: false }));
    }
  };

  const handleFixAuth = async () => {
    setLoading(prev => ({ ...prev, fixAuth: true }));
    try {
      const result = await fixAuthIssues();
      setResults(prev => ({ ...prev, auth: result }));
      toast({
        title: result.success ? "تم بنجاح" : "ملاحظة",
        description: result.message,
        variant: "default"
      });
    } catch (error) {
      console.error("Error:", error);
      setResults(prev => ({ 
        ...prev, 
        auth: { 
          success: false, 
          error: "حدث خطأ غير متوقع أثناء المعالجة" 
        } 
      }));
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع أثناء محاولة إصلاح المشكلات",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, fixAuth: false }));
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">صيانة قاعدة البيانات</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>مشاكل دوال قاعدة البيانات</CardTitle>
            <CardDescription>
              معالجة مشاكل Search Path في دوال قاعدة البيانات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4 text-sm">
              <li>• public.update_station_location</li>
              <li>• public.update_location_column</li>
              <li>• public.extract_cities_from_stations</li>
              <li>• public.find_nearest_stations</li>
              <li>• public.execute_sql</li>
              <li>• public.update_cities_after_station_changes</li>
              <li>• public.handle_new_user</li>
            </ul>
            
            {results.functions && (
              <Alert className={`mb-4 ${results.functions.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-start">
                  {results.functions.success ? 
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2" /> : 
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2" />
                  }
                  <div>
                    <AlertTitle>{results.functions.success ? "تم بنجاح" : "فشلت العملية"}</AlertTitle>
                    <AlertDescription>
                      {results.functions.success ? results.functions.message : results.functions.error}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
            
            <Button 
              onClick={handleFixFunctions} 
              disabled={loading.fixFunctions}
              className="w-full"
            >
              {loading.fixFunctions && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              إصلاح مشاكل الدوال
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>مشاكل المصادقة (Auth)</CardTitle>
            <CardDescription>
              معالجة مشاكل Auth OTP وحماية كلمات المرور
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4 text-sm">
              <li>• مدة صلاحية OTP تتجاوز الحد الموصى به</li>
              <li>• حماية كلمات المرور المسربة غير مفعلة</li>
            </ul>
            
            {results.auth && (
              <Alert className="mb-4 bg-blue-50">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2" />
                  <div>
                    <AlertTitle>ملاحظة</AlertTitle>
                    <AlertDescription>
                      {results.auth.message}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
            
            <Button 
              onClick={handleFixAuth} 
              disabled={loading.fixAuth}
              className="w-full"
              variant="outline"
            >
              {loading.fixAuth && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              عرض معلومات الإصلاح
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>معلومات إضافية</CardTitle>
            <CardDescription>
              بعض مشاكل المصادقة تتطلب الوصول إلى لوحة تحكم Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2">لإصلاح مشاكل المصادقة:</h3>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>توجه إلى لوحة تحكم Supabase <a href="https://app.supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">https://app.supabase.com</a></li>
              <li>انتقل إلى مشروعك</li>
              <li>اذهب إلى قسم Authentication &gt; Settings</li>
              <li>قم بتعديل مدة صلاحية رموز OTP إلى قيمة موصى بها (مثل 5 دقائق)</li>
              <li>قم بتفعيل خيار "حماية كلمات المرور المسربة"</li>
            </ol>

            <img 
              src="/lovable-uploads/7e24e3e7-5a13-4492-8c45-a770bf22e7f0.png" 
              alt="صورة لمشاكل قاعدة البيانات" 
              className="w-full rounded-md border border-gray-200" 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseMaintenance;
