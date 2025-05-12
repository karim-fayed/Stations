import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, AlertCircle } from "lucide-react";
import { SaudiCity } from "@/types/station";
import EditCityDialog from "./EditCityDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RegionsTableProps {
  regions: SaudiCity[];
  onRegionUpdated: () => void;
  onRegionDeleted: () => void;
}

const RegionsTable: React.FC<RegionsTableProps> = ({
  regions,
  onRegionUpdated,
  onRegionDeleted,
}) => {
  const [editingRegion, setEditingRegion] = useState<SaudiCity | null>(null);
  const [deletingRegion, setDeletingRegion] = useState<SaudiCity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // دالة لفتح نافذة تعديل المنطقة
  const handleEditRegion = (region: SaudiCity) => {
    setEditingRegion(region);
  };

  // دالة لفتح نافذة حذف المنطقة
  const handleDeleteRegion = (region: SaudiCity) => {
    setDeletingRegion(region);
  };

  // دالة لتنفيذ حذف المنطقة
  const confirmDeleteRegion = async () => {
    if (!deletingRegion) return;

    try {
      setIsLoading(true);

      // الحصول على معرف المنطقة من قاعدة البيانات
      const { data: regionData, error: regionError } = await supabase
        .from("cities")
        .select("id")
        .eq("name_ar", deletingRegion.name)
        .eq("name_en", deletingRegion.nameEn)
        .single();

      if (regionError) {
        console.error("خطأ في الحصول على معرف المنطقة:", regionError);
        throw new Error("فشل في العثور على المنطقة في قاعدة البيانات");
      }

      // حذف المنطقة من قاعدة البيانات
      const { error } = await supabase
        .from("cities")
        .delete()
        .eq("id", regionData.id);

      if (error) {
        console.error("خطأ في حذف المنطقة:", error);
        throw error;
      }

      // إغلاق نافذة الحذف
      setDeletingRegion(null);

      // عرض رسالة نجاح
      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف منطقة ${deletingRegion.name} بنجاح`,
        variant: "default",
      });

      // استدعاء دالة رد النداء
      onRegionDeleted();
    } catch (error) {
      console.error("خطأ في حذف المنطقة:", error);
      toast({
        title: "خطأ في حذف المنطقة",
        description: error.message || "حدث خطأ أثناء حذف المنطقة",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // دالة لتحديث المنطقة بعد التعديل
  const handleRegionUpdated = (updatedRegion: SaudiCity) => {
    setEditingRegion(null);
    onRegionUpdated();
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم بالعربية</TableHead>
              <TableHead className="text-right">الاسم بالإنجليزية</TableHead>
              <TableHead className="text-right">خط العرض</TableHead>
              <TableHead className="text-right">خط الطول</TableHead>
              <TableHead className="text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <AlertCircle className="h-10 w-10 mb-2" />
                    <p>لا توجد مناطق لعرضها</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              regions.map((region) => (
                <TableRow key={`${region.name}-${region.nameEn}`}>
                  <TableCell className="font-medium">{region.name}</TableCell>
                  <TableCell>{region.nameEn}</TableCell>
                  <TableCell>{region.latitude}</TableCell>
                  <TableCell>{region.longitude}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditRegion(region)}
                        title="تعديل المنطقة"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteRegion(region)}
                        title="حذف المنطقة"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* نافذة تعديل المنطقة */}
      {editingRegion && (
        <EditCityDialog
          isOpen={!!editingRegion}
          onClose={() => setEditingRegion(null)}
          onCityUpdated={handleRegionUpdated}
          city={editingRegion}
        />
      )}

      {/* نافذة تأكيد الحذف */}
      <AlertDialog open={!!deletingRegion} onOpenChange={() => !isLoading && setDeletingRegion(null)}>
        <AlertDialogContent className="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه المنطقة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف منطقة "{deletingRegion?.name}" نهائيًا من قاعدة البيانات. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRegion}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RegionsTable;
