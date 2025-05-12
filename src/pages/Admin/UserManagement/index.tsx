import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserTable } from "./components/UserTable";
import CreateUserDialog from "./components/CreateUserDialog";
import PasswordResetDialog from "./components/PasswordResetDialog";
import DeleteUserDialog from "./components/DeleteUserDialog";
import PromoteToOwnerDialog from "./components/PromoteToOwnerDialog";
import { useUserManagement, User } from "./hooks/useUserManagement";
import { Loader2, Home, ArrowLeft, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { AddUserDialog } from "./components/AddUserDialog";
import { EditUserDialog } from "./components/EditUserDialog";
import { NewUser, UserUpdate } from "./types";

const UserManagement = () => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [lastSignInFilter, setLastSignInFilter] = useState("all");
  const {
    users: fetchedUsers,
    loading,
    currentUser,
    checkingPermissions,
    fetchUsers,
    createUser,
    initiatePasswordReset,
    changeUserPassword,
    changeUserRole,
    handleDeleteUser
  } = useUserManagement();

  useEffect(() => {
    if (fetchedUsers) {
      setUsers(fetchedUsers);
    }
  }, [fetchedUsers]);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleAddUser = async (newUser: NewUser) => {
    const success = await createUser(newUser);
    if (success) {
      setShowAddUser(false);
      await fetchUsers();
    }
    return success;
  };

  const handleUpdateUser = async (user: User, updates: UserUpdate) => {
    if (updates.password) {
      return await changeUserPassword(user, updates.password);
    }
    if (updates.role) {
      return await changeUserRole(user, updates.role);
    }
    return false;
  };

  const handleUserDeleted = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  // تصفية المستخدمين حسب البحث والفلترة
  const filteredUsers = users.filter(user => {
    const q = search.trim().toLowerCase();
    let match = true;
    if (q) {
      match = (
        user.email.toLowerCase().includes(q) ||
        (user.name && user.name.toLowerCase().includes(q)) ||
        (user.role && user.role.toLowerCase().includes(q))
      );
    }
    // فلترة حسب حالة آخر تسجيل دخول
    if (lastSignInFilter !== "all") {
      const now = new Date();
      let isActive = false;
      if (user.last_sign_in_at) {
        const lastSignIn = new Date(user.last_sign_in_at);
        const diffDays = (now.getTime() - lastSignIn.getTime()) / (1000 * 60 * 60 * 24);
        isActive = diffDays <= 30;
      }
      if (lastSignInFilter === "active" && !isActive) return false;
      if (lastSignInFilter === "inactive" && isActive) return false;
      if (lastSignInFilter === "inactive" && !user.last_sign_in_at) return true;
    }
    return match;
  });

  if (checkingPermissions || (loading && currentUser === null)) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-noor-purple" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'owner') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">غير مصرح</h1>
          <p className="text-gray-600">عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    );
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
                onClick={() => setShowAddUser(true)}
              >
                <Plus size={16} /> إضافة مستخدم جديد
              </Button>
            </div>
          </div>
          {/* مربع البحث وفلترة النشاط */}
          <div className="mt-6 flex flex-col md:flex-row items-center gap-2 max-w-2xl">
            <div className="relative w-full md:w-72">
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-noor-purple"
                placeholder="ابحث عن مستخدم..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-noor-purple bg-white text-gray-700"
              value={lastSignInFilter}
              onChange={e => setLastSignInFilter(e.target.value)}
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشط (آخر 30 يومًا)</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg border border-purple-100 overflow-hidden"
        >
          <UserTable
            users={filteredUsers}
            loading={loading}
            onEditUser={handleEditUser}
            currentUserId={currentUser?.id}
            isOwner={currentUser?.role === 'owner'}
            handleDeleteUser={handleDeleteUser}
            onUserDeleted={handleUserDeleted}
            onResetPassword={initiatePasswordReset}
          />
        </motion.div>
        {showAddUser && (
          <AddUserDialog
            open={showAddUser}
            onClose={() => setShowAddUser(false)}
            onAddUser={handleAddUser}
          />
        )}
        {editingUser && (
          <EditUserDialog
            open={!!editingUser}
            onClose={() => setEditingUser(null)}
            user={editingUser}
            onUpdateUser={handleUpdateUser}
            onInitiatePasswordReset={initiatePasswordReset}
          />
        )}
      </div>
    </div>
  );
};

export default UserManagement;
