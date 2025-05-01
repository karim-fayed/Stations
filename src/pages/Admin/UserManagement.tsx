
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch admin users from the admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .select('*');
      
      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "خطأ في جلب المستخدمين",
        description: error.message || "حدث خطأ أثناء جلب المستخدمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      if (!newUser.email || !newUser.password) {
        throw new Error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      }

      // Create the new user in Auth
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email.trim(),
        password: newUser.password.trim(),
        options: {
          data: {
            name: newUser.name || newUser.email,
            role: "admin",
          },
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "تم إنشاء المستخدم بنجاح",
        description: `تم إنشاء حساب لـ ${newUser.email}`,
      });

      // Reset form and close dialog
      setNewUser({ email: "", password: "", name: "" });
      setIsDialogOpen(false);
      
      // Refresh user list
      fetchUsers();

    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "خطأ في إنشاء المستخدم",
        description: error.message || "حدث خطأ أثناء إنشاء المستخدم",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-noor-purple">إدارة المستخدمين</h1>
        <Button 
          className="bg-noor-purple hover:bg-noor-purple/90"
          onClick={() => setIsDialogOpen(true)}
        >
          إضافة مستخدم جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المستخدمين المسجلين</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-noor-purple" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center py-8 text-gray-500">لا يوجد مستخدمين مسجلين حالياً</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">البريد الإلكتروني</th>
                    <th scope="col" className="px-6 py-3">الاسم</th>
                    <th scope="col" className="px-6 py-3">الدور</th>
                    <th scope="col" className="px-6 py-3">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.name || "-"}</td>
                      <td className="px-6 py-4">{user.role || "مستخدم"}</td>
                      <td className="px-6 py-4">
                        {new Date(user.created_at).toLocaleDateString("ar-SA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة مستخدم جديد</DialogTitle>
            <DialogDescription>
              قم بإنشاء حساب مستخدم جديد للوصول إلى لوحة التحكم
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                البريد الإلكتروني
              </label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                الاسم
              </label>
              <Input
                id="name"
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="اسم المستخدم"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                كلمة المرور
              </label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="********"
                required
                minLength={6}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                className="bg-noor-purple hover:bg-noor-purple/90"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : "إنشاء المستخدم"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
