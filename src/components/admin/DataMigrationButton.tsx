import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Database, Loader2 } from "lucide-react";
import { migrateAllData } from "@/services/dataMigrationService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DataMigrationButtonProps {
  className?: string;
}

const DataMigrationButton: React.FC<DataMigrationButtonProps> = ({ className }) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationStage, setMigrationStage] = useState("");
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    message: string;
    stations?: { success: boolean; message: string };
    cities?: { success: boolean; message: string };
  } | null>(null);
  const { toast } = useToast();

  const handleMigrateClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmMigration = async () => {
    try {
      // إعادة تعيين الحالة
      setIsMigrating(true);
      setMigrationResult(null);
      setMigrationProgress(0);
      setMigrationStage("بدء عملية الترحيل");

      // دالة تحديث التقدم
      const updateProgress = (progress: number, stage: string) => {
        setMigrationProgress(progress);
        setMigrationStage(stage);
      };

      // ترحيل البيانات مع تمرير دالة تحديث التقدم
      const result = await migrateAllData(updateProgress);

      // تعيين نتيجة الترحيل
      setMigrationResult(result);

      // عرض رسالة نجاح/فشل
      toast({
        title: result.success ? "تم ترحيل البيانات بنجاح" : "فشل ترحيل البيانات",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("خطأ في ترحيل البيانات:", error);

      // تعيين نتيجة الترحيل في حالة الخطأ
      setMigrationResult({
        success: false,
        message: `فشل ترحيل البيانات: ${(error as Error).message}`,
      });

      // عرض رسالة الخطأ
      toast({
        title: "خطأ في ترحيل البيانات",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      // إنهاء حالة الترحيل
      setIsMigrating(false);

      // تأكد من أن شريط التقدم يظهر 100% في حالة الانتهاء
      if (!migrationResult) {
        setMigrationProgress(100);
      }
    }
  };

  const handleCloseDialog = () => {
    setShowConfirmDialog(false);
    // إذا كانت هناك نتيجة ترحيل، نحتفظ بها لعرضها
    if (!migrationResult) {
      setMigrationResult(null);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className={`flex items-center gap-2 text-indigo-600 border-indigo-300 hover:bg-indigo-50 transition-all duration-300 ${className}`}
        onClick={handleMigrateClick}
        disabled={isMigrating}
      >
        {isMigrating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>جاري الترحيل...</span>
          </>
        ) : (
          <>
            <Database className="h-4 w-4" />
            <span>ترحيل المحطات والمناطق</span>
          </>
        )}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ترحيل البيانات</DialogTitle>
            <DialogDescription>
              سيتم ترحيل بيانات جداول المحطات والمناطق إلى قاعدة البيانات. هل أنت متأكد؟
            </DialogDescription>
          </DialogHeader>

          {isMigrating && !migrationResult && (
            <div className="space-y-4 my-4">
              <div className="text-center mb-2">
                <p className="text-sm font-medium mb-2">{migrationStage}</p>
                <Progress value={migrationProgress} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground">{migrationProgress}%</p>
              </div>
            </div>
          )}

          {migrationResult && (
            <div className="space-y-4 my-4">
              <Alert variant={migrationResult.success ? "default" : "destructive"}>
                <div className="flex items-center gap-2">
                  {migrationResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <AlertTitle>{migrationResult.success ? "تم الترحيل بنجاح" : "فشل الترحيل"}</AlertTitle>
                </div>
                <AlertDescription>{migrationResult.message}</AlertDescription>
              </Alert>

              {migrationResult.stations && (
                <Alert variant={migrationResult.stations.success ? "default" : "destructive"}>
                  <div className="flex items-center gap-2">
                    {migrationResult.stations.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    <AlertTitle>المحطات</AlertTitle>
                  </div>
                  <AlertDescription>{migrationResult.stations.message}</AlertDescription>
                </Alert>
              )}

              {migrationResult.cities && (
                <Alert variant={migrationResult.cities.success ? "default" : "destructive"}>
                  <div className="flex items-center gap-2">
                    {migrationResult.cities.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    <AlertTitle>المناطق</AlertTitle>
                  </div>
                  <AlertDescription>{migrationResult.cities.message}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isMigrating}
            >
              إغلاق
            </Button>
            {!migrationResult && (
              <Button
                type="button"
                onClick={handleConfirmMigration}
                disabled={isMigrating}
                className="bg-gradient-to-r from-noor-purple to-noor-orange text-white hover:opacity-90"
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري الترحيل...
                  </>
                ) : (
                  "تأكيد الترحيل"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataMigrationButton;
