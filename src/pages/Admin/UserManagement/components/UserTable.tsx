import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, ChevronDown, ChevronUp, Circle, Lock } from "lucide-react";
import { User } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  currentUserId?: string;
  isOwner?: boolean;
  handleDeleteUser: (userId: string) => Promise<boolean>;
  onUserDeleted: (userId: string) => void;
  loading?: boolean;
  onResetPassword?: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  currentUserId,
  isOwner = false,
  handleDeleteUser,
  onUserDeleted,
  loading = false,
  onResetPassword
}) => {
  const [sortBy, setSortBy] = useState<'email' | 'role' | 'created_at' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleSort = (col: 'email' | 'role' | 'created_at') => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const sortedUsers = React.useMemo(() => {
    if (!sortBy) return users;
    return [...users].sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      if (sortBy === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      } else {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      }
    });
  }, [users, sortBy, sortDir]);

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      const success = await handleDeleteUser(userToDelete.id);
      if (success) {
        onUserDeleted(userToDelete.id);
      }
    }
    setConfirmDialogOpen(false);
    setUserToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-noor-purple"></span>
      </div>
    );
  }

  return (
    <>
      <Card>
        <Table className="min-w-full text-sm md:text-base overflow-x-auto">
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('email')} className="cursor-pointer select-none">
                البريد الإلكتروني
                {sortBy === 'email' && (sortDir === 'asc' ? <ChevronUp size={16} className="inline ml-1" /> : <ChevronDown size={16} className="inline ml-1" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('role')} className="cursor-pointer select-none">
                الدور
                {sortBy === 'role' && (sortDir === 'asc' ? <ChevronUp size={16} className="inline ml-1" /> : <ChevronDown size={16} className="inline ml-1" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('created_at')} className="cursor-pointer select-none">
                تاريخ الإنشاء
                {sortBy === 'created_at' && (sortDir === 'asc' ? <ChevronUp size={16} className="inline ml-1" /> : <ChevronDown size={16} className="inline ml-1" />)}
              </TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>آخر تسجيل دخول</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user) => {
              let status: 'active' | 'inactive' = 'inactive';
              if (user.last_sign_in_at) {
                const lastSignIn = new Date(user.last_sign_in_at);
                const now = new Date();
                const diffDays = (now.getTime() - lastSignIn.getTime()) / (1000 * 60 * 60 * 24);
                if (diffDays <= 30) status = 'active';
              }
              let badgeClass = '';
              if (user.role === 'owner') badgeClass = 'bg-gradient-to-r from-purple-600 to-orange-400 text-white';
              else if (user.role === 'admin') badgeClass = 'bg-blue-100 text-blue-700';
              else badgeClass = 'bg-gray-100 text-gray-700';
              const rowClass = user.role === 'owner' ? 'bg-gradient-to-r from-purple-50 to-orange-50 border-l-4 border-noor-purple shadow-sm' : '';
              return (
                <TableRow key={user.id} className={rowClass}>
                  <TableCell className="break-all max-w-xs">{user.email}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${badgeClass}`}>{user.role === 'owner' ? 'مالك' : user.role === 'admin' ? 'مدير' : 'مستخدم'}</span>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Circle size={12} className={status === 'active' ? 'text-green-500' : 'text-gray-400'} fill={status === 'active' ? '#22c55e' : '#d1d5db'} />
                      {status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString('ar-SA')
                      : 'لم يسجل الدخول بعد'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => onEditUser(user)}
                      >
                        <Edit2 className="h-4 w-4" />
                        تعديل
                      </Button>
                      {isOwner && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-200"
                          onClick={() => onResetPassword && onResetPassword(user)}
                        >
                          <Lock className="h-4 w-4" />
                          إعادة تعيين كلمة المرور
                        </Button>
                      )}
                      {isOwner && user.id !== currentUserId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                          حذف
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد حذف المستخدم</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            {userToDelete && (
              <>
                <div className="mb-2 text-lg font-semibold text-red-600">هل أنت متأكد أنك تريد حذف هذا المستخدم؟</div>
                <div className="mb-1">البريد: <span className="font-mono">{userToDelete.email}</span></div>
              </>
            )}
            <div className="text-sm text-gray-500 mt-2">لا يمكن التراجع عن هذه العملية.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={confirmDelete}>تأكيد الحذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
