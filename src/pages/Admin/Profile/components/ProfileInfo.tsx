import React from "react";

interface ProfileInfoProps {
  user: any;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  if (!user) return null;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2">
        <div className="text-sm font-medium text-gray-500">البريد الإلكتروني</div>
        <div className="text-base font-medium">{user.email}</div>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        <div className="text-sm font-medium text-gray-500">الاسم</div>
        <div className="text-base font-medium">{user.profile?.name || "غير محدد"}</div>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        <div className="text-sm font-medium text-gray-500">الدور</div>
        <div className="text-base font-medium">{user.profile?.role || "مستخدم"}</div>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        <div className="text-sm font-medium text-gray-500">تاريخ الإنشاء</div>
        <div className="text-base font-medium">
          {user.profile?.created_at 
            ? new Date(user.profile.created_at).toLocaleDateString("ar-SA") 
            : "غير محدد"}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        <div className="text-sm font-medium text-gray-500">آخر تحديث</div>
        <div className="text-base font-medium">
          {user.profile?.updated_at 
            ? new Date(user.profile.updated_at).toLocaleDateString("ar-SA") 
            : "غير محدد"}
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
