import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import UserTable from "./components/UserTable";
import CreateUserDialog from "./components/CreateUserDialog";
import PasswordResetDialog from "./components/PasswordResetDialog";
import DeleteUserDialog from "./components/DeleteUserDialog";
import { useUserManagement, User } from "./hooks/useUserManagement";
import { Loader2, Home, ArrowLeft, Plus } from "lucide-react";
import { motion } from "framer-motion";

const UserManagement = () => {
  const navigate = useNavigate();
  const {
    users,
    loading,
    currentUser,
    createUser,
    initiatePasswordReset,
    changeUserPassword,
    changeUserRole,
    deleteUser
  } = useUserManagement();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  // التحقق من صلاحيات المستخدم
  useEffect(() => {
    const checkPermissions = async () => {
      setCheckingPermissions(true);

      // إذا كان المستخدم ليس مالكًا، قم بتوجيهه إلى لوحة التحكم
      if (currentUser && currentUser.role !== 'owner') {
        navigate('/admin/dashboard');
      }

      setCheckingPermissions(false);
    };

    if (currentUser !== null) {
      checkPermissions();
    }
  }, [currentUser, navigate]);

  const handleOpenPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setIsPasswordDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      const success = await deleteUser(selectedUser);
      if (success) {
        setIsDeleteDialogOpen(false);
      }
    }
  };

  // تغيير دور المستخدم
  const handleChangeRole = async (user: User, newRole: string) => {
    await changeUserRole(user, newRole);
  };

  // تغيير كلمة المرور مباشرة
  const handleDirectPasswordChange = async (user: User, newPassword: string) => {
    return await changeUserPassword(user, newPassword);
  };

  if (checkingPermissions || (loading && currentUser === null)) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-noor-purple" />
      </div>
    );
  }

  // إذا كان المستخدم ليس مالكًا، لا تعرض الصفحة
  if (currentUser && currentUser.role !== 'owner') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-orange-50">
      <div className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8 border-b-4 border-noor-purple"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center">
              <div className="relative mr-4">
                <img
                  src="https://noor.com.sa/wp-content/themes/noor/images/apple-touch-icon-72x72.png"
                  alt="Noor Logo"
                  className="h-14 w-14 animate-spin-slow"
                  style={{ animationDuration: '15s' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-noor-purple to-noor-orange rounded-full blur-md opacity-30 animate-pulse" style={{ animationDuration: '3s' }}></div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-noor-purple to-noor-orange bg-clip-text text-transparent">إدارة المستخدمين</h1>
                <p className="text-gray-600 mt-1">إدارة حسابات المستخدمين والصلاحيات</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <Link to="/">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-green-600 border-green-300 hover:bg-green-50 transition-all duration-300 hover:scale-105"
                >
                  <Home size={16} /> الصفحة الرئيسية
                </Button>
              </Link>
              <Link to="/admin/dashboard">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                >
                  <ArrowLeft size={16} /> العودة للوحة التحكم
                </Button>
              </Link>
              <Button
                className="flex items-center gap-2 bg-gradient-to-r from-noor-purple to-noor-orange text-white hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-md"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus size={16} /> إضافة مستخدم جديد
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg border border-purple-100 overflow-hidden"
        >
          <UserTable
            users={users}
            loading={loading}
            onChangePassword={handleOpenPasswordDialog}
            onChangeRole={handleChangeRole}
            onDeleteUser={handleOpenDeleteDialog}
            currentUserId={currentUser?.id}
            isOwner={currentUser?.role === 'owner'}
          />
        </motion.div>

        <CreateUserDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateUser={createUser}
        />

        <PasswordResetDialog
          isOpen={isPasswordDialogOpen}
          onOpenChange={setIsPasswordDialogOpen}
          onResetPassword={initiatePasswordReset}
          onDirectPasswordChange={handleDirectPasswordChange}
          selectedUser={selectedUser}
          canDirectChange={true}
          currentUserId={currentUser?.id}
        />

        <DeleteUserDialog
          isOpen={isDeleteDialogOpen}
          user={selectedUser}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteUser}
        />
      </div>
    </div>
  );
};

export default UserManagement;
