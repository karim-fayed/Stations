
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Key, UserCog, Trash2, ShieldAlert } from "lucide-react";
import { User } from "../hooks/useUserManagement";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onChangePassword: (user: User) => void;
  onChangeRole?: (user: User, newRole: string) => Promise<void>;
  onDeleteUser?: (user: User) => void;
  currentUserId?: string;
  isOwner?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  onChangePassword,
  onChangeRole,
  onDeleteUser,
  currentUserId,
  isOwner = false
}) => {
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
                    <TableCell>
                      {isOwner && user.id !== currentUserId ? (
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={user.role || "admin"}
                            onValueChange={(value) => onChangeRole && onChangeRole(user, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="اختر الدور" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">مشرف</SelectItem>
                              <SelectItem value="owner">مالك</SelectItem>
                            </SelectContent>
                          </Select>
                          {user.role === 'owner' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <ShieldAlert className="h-4 w-4 text-orange-500" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>هذا المستخدم لديه صلاحيات مالك</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={user.role === 'owner' ? 'font-bold text-noor-purple' : ''}>
                            {user.role === 'owner' ? 'مالك' : 'مشرف'}
                          </span>
                          {user.role === 'owner' && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <ShieldAlert className="h-4 w-4 text-orange-500" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>هذا المستخدم لديه صلاحيات مالك</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => onChangePassword(user)}
                        >
                          <Key className="h-4 w-4" />
                          كلمة المرور
                        </Button>
                        {isOwner && user.id !== currentUserId && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => onDeleteUser && onDeleteUser(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف
                          </Button>
                        )}
                      </div>
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
