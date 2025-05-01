
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Key } from "lucide-react";
import { User } from "../hooks/useUserManagement";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onChangePassword: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, loading, onChangePassword }) => {
  return (
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name || "-"}</TableCell>
                    <TableCell>{user.role || "مستخدم"}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => onChangePassword(user)}
                      >
                        <Key className="h-4 w-4" />
                        تغيير كلمة المرور
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTable;
