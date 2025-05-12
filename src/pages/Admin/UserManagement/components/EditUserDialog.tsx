import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UserUpdate } from "../types";

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (user: User, updates: UserUpdate) => Promise<boolean>;
  onInitiatePasswordReset: (user: User) => Promise<void>;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onClose,
  user,
  onUpdateUser,
  onInitiatePasswordReset,
}) => {
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const updates: UserUpdate = {};
      if (password) updates.password = password;
      if (role !== user.role) updates.role = role;

      if (Object.keys(updates).length > 0) {
        const success = await onUpdateUser(user, updates);
        if (success) {
          setPassword("");
          onClose();
        }
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تحديث المستخدم");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await onInitiatePasswordReset(user);
      onClose();
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل المستخدم: {user.email}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور الجديدة (اختياري)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">الدور</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">مستخدم</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePasswordReset}
              disabled={loading}
            >
              إعادة تعيين كلمة المرور
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 