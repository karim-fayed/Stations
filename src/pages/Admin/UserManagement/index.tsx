
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import UserTable from "./components/UserTable";
import CreateUserDialog from "./components/CreateUserDialog";
import PasswordResetDialog from "./components/PasswordResetDialog";
import { useUserManagement, User } from "./hooks/useUserManagement";

const UserManagement = () => {
  const { users, loading, createUser, initiatePasswordReset } = useUserManagement();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleOpenPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setIsPasswordDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-noor-purple">إدارة المستخدمين</h1>
        <Button 
          className="bg-noor-purple hover:bg-noor-purple/90"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          إضافة مستخدم جديد
        </Button>
      </div>

      <UserTable 
        users={users}
        loading={loading}
        onChangePassword={handleOpenPasswordDialog}
      />

      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateUser={createUser}
      />

      <PasswordResetDialog
        isOpen={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        onResetPassword={initiatePasswordReset}
        selectedUser={selectedUser}
      />
    </div>
  );
};

export default UserManagement;
