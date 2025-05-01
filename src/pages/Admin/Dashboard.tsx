
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { GasStation } from "@/types/station";
import { 
  fetchStations, 
  addStation, 
  updateStation, 
  deleteStation, 
  adminLogout,
  checkAdminStatus
} from "@/services/stationService";
import { Plus, Edit, Trash2, LogOut, FileSpreadsheet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExcelImportExport from "@/components/admin/ExcelImportExport";

const Dashboard = () => {
  const [stations, setStations] = useState<GasStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStation, setCurrentStation] = useState<Partial<GasStation>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  // التحقق من صلاحية المشرف
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const { isAuthenticated } = await checkAdminStatus();
        if (!isAuthenticated) {
          navigate("/admin/login");
        }
      } catch (error) {
        navigate("/admin/login");
      } finally {
        loadStations();
      }
    };

    verifyAdmin();
  }, [navigate]);

  const loadStations = async () => {
    try {
      const data = await fetchStations();
      setStations(data);
    } catch (error) {
      console.error("Error loading stations:", error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل بيانات المحطات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStation = async () => {
    try {
      if (!currentStation.name || !currentStation.region || !currentStation.latitude || !currentStation.longitude) {
        toast({
          title: "بيانات غير مكتملة",
          description: "يرجى إدخال جميع البيانات المطلوبة",
          variant: "destructive",
        });
        return;
      }

      const newStation = await addStation(currentStation as Omit<GasStation, 'id'>);
      setStations([...stations, newStation]);
      setIsAddDialogOpen(false);
      setCurrentStation({});
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: `تمت إضافة محطة ${newStation.name} بنجاح`,
      });
    } catch (error) {
      console.error("Error adding station:", error);
      toast({
        title: "خطأ في إضافة المحطة",
        description: "حدث خطأ أثناء إضافة المحطة الجديدة",
        variant: "destructive",
      });
    }
  };

  const handleEditStation = async () => {
    try {
      if (!currentStation.id) return;
      
      const updatedStation = await updateStation(currentStation.id, currentStation);
      setStations(stations.map(s => s.id === updatedStation.id ? updatedStation : s));
      setIsEditDialogOpen(false);
      setCurrentStation({});
      
      toast({
        title: "تم التحديث بنجاح",
        description: `تم تحديث محطة ${updatedStation.name} بنجاح`,
      });
    } catch (error) {
      console.error("Error updating station:", error);
      toast({
        title: "خطأ في تحديث المحطة",
        description: "حدث خطأ أثناء تحديث بيانات المحطة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStation = async () => {
    try {
      if (!currentStation.id) return;
      
      await deleteStation(currentStation.id);
      setStations(stations.filter(s => s.id !== currentStation.id));
      setIsDeleteDialogOpen(false);
      setCurrentStation({});
      
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المحطة بنجاح",
      });
    } catch (error) {
      console.error("Error deleting station:", error);
      toast({
        title: "خطأ في حذف المحطة",
        description: "حدث خطأ أثناء حذف المحطة",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate("/admin/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // تحويل القيم العددية
    if (name === 'latitude' || name === 'longitude') {
      setCurrentStation({ ...currentStation, [name]: parseFloat(value) });
    } else {
      setCurrentStation({ ...currentStation, [name]: value });
    }
  };

  return (
    <div className="container mx-auto py-8 rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-noor-purple">لوحة تحكم محطات نور</h1>
          <p className="text-gray-600">إدارة محطات الوقود</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut size={16} /> تسجيل الخروج
          </Button>
          <Button 
            className="flex items-center gap-2 bg-noor-purple hover:bg-noor-purple/90"
            onClick={() => {
              setCurrentStation({});
              setIsAddDialogOpen(true);
            }}
          >
            <Plus size={16} /> إضافة محطة جديدة
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-noor-purple"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="stations" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="stations">المحطات</TabsTrigger>
              <TabsTrigger value="import-export" className="flex items-center gap-1">
                <FileSpreadsheet size={14} /> استيراد/تصدير
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stations">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>الاسم</TableHead>
                      <TableHead>المنطقة</TableHead>
                      <TableHead>الموقع الفرعي</TableHead>
                      <TableHead className="hidden md:table-cell">أنواع الوقود</TableHead>
                      <TableHead className="text-center">الإحداثيات</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                          لا توجد محطات مضافة
                        </TableCell>
                      </TableRow>
                    ) : (
                      stations.map((station, index) => (
                        <TableRow key={station.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{station.name}</TableCell>
                          <TableCell>{station.region}</TableCell>
                          <TableCell>{station.sub_region}</TableCell>
                          <TableCell className="hidden md:table-cell">{station.fuel_types || "-"}</TableCell>
                          <TableCell className="text-center text-xs">
                            <div>خط العرض: {station.latitude}</div>
                            <div>خط الطول: {station.longitude}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCurrentStation(station);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit size={16} className="text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCurrentStation(station);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="import-export">
              <ExcelImportExport />
            </TabsContent>
          </Tabs>
        </motion.div>
      )}

      {/* إضافة محطة جديدة */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="rtl max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-noor-purple">إضافة محطة جديدة</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل محطة الوقود الجديدة
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label htmlFor="name" className="text-sm font-medium">اسم المحطة *</label>
              <Input
                id="name"
                name="name"
                value={currentStation.name || ""}
                onChange={handleInputChange}
                placeholder="مثال: محطة نور الرياض"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="region" className="text-sm font-medium">المنطقة *</label>
              <Input
                id="region"
                name="region"
                value={currentStation.region || ""}
                onChange={handleInputChange}
                placeholder="مثال: الرياض"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="sub_region" className="text-sm font-medium">الموقع الفرعي *</label>
              <Input
                id="sub_region"
                name="sub_region"
                value={currentStation.sub_region || ""}
                onChange={handleInputChange}
                placeholder="مثال: حي النزهة"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="latitude" className="text-sm font-medium">خط العرض *</label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="0.000001"
                value={currentStation.latitude || ""}
                onChange={handleInputChange}
                placeholder="مثال: 24.774265"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="longitude" className="text-sm font-medium">خط الطول *</label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="0.000001"
                value={currentStation.longitude || ""}
                onChange={handleInputChange}
                placeholder="مثال: 46.738586"
                required
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label htmlFor="fuel_types" className="text-sm font-medium">أنواع الوقود</label>
              <Input
                id="fuel_types"
                name="fuel_types"
                value={currentStation.fuel_types || ""}
                onChange={handleInputChange}
                placeholder="مثال: بنزين 91، بنزين 95، ديزل"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label htmlFor="additional_info" className="text-sm font-medium">معلومات إضافية</label>
              <Textarea
                id="additional_info"
                name="additional_info"
                value={currentStation.additional_info || ""}
                onChange={handleInputChange}
                placeholder="أي معلومات إضافية عن المحطة"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              className="bg-noor-purple hover:bg-noor-purple/90" 
              onClick={handleAddStation}
            >
              إضافة المحطة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* تحرير محطة */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rtl max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-noor-purple">تعديل محطة</DialogTitle>
            <DialogDescription>
              تحديث بيانات محطة الوقود
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label htmlFor="name" className="text-sm font-medium">اسم المحطة *</label>
              <Input
                id="name"
                name="name"
                value={currentStation.name || ""}
                onChange={handleInputChange}
                placeholder="اسم المحطة"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="region" className="text-sm font-medium">المنطقة *</label>
              <Input
                id="region"
                name="region"
                value={currentStation.region || ""}
                onChange={handleInputChange}
                placeholder="المنطقة"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="sub_region" className="text-sm font-medium">الموقع الفرعي *</label>
              <Input
                id="sub_region"
                name="sub_region"
                value={currentStation.sub_region || ""}
                onChange={handleInputChange}
                placeholder="الموقع الفرعي"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="latitude" className="text-sm font-medium">خط العرض *</label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="0.000001"
                value={currentStation.latitude || ""}
                onChange={handleInputChange}
                placeholder="خط العرض"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="longitude" className="text-sm font-medium">خط الطول *</label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="0.000001"
                value={currentStation.longitude || ""}
                onChange={handleInputChange}
                placeholder="خط الطول"
                required
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label htmlFor="fuel_types" className="text-sm font-medium">أنواع الوقود</label>
              <Input
                id="fuel_types"
                name="fuel_types"
                value={currentStation.fuel_types || ""}
                onChange={handleInputChange}
                placeholder="أنواع الوقود"
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <label htmlFor="additional_info" className="text-sm font-medium">معلومات إضافية</label>
              <Textarea
                id="additional_info"
                name="additional_info"
                value={currentStation.additional_info || ""}
                onChange={handleInputChange}
                placeholder="معلومات إضافية"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              className="bg-noor-purple hover:bg-noor-purple/90" 
              onClick={handleEditStation}
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* حذف محطة */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rtl">
          <DialogHeader>
            <DialogTitle className="text-red-500">تأكيد حذف المحطة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف محطة "{currentStation.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteStation}
            >
              نعم، حذف المحطة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
