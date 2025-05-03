
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import ChangePasswordForm from "./components/ChangePasswordForm";
import ProfileInfo from "./components/ProfileInfo";

interface UserProfile {
  id: string;
  email: string;
  profile?: {
    name?: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
  };
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          toast({
            title: "غير مصرح",
            description: "يرجى تسجيل الدخول للوصول إلى هذه الصفحة",
            variant: "destructive",
          });
          navigate("/admin/login");
          return;
        }

        // Get user profile from admin_profiles table instead of users
        const { data: userData, error } = await supabase
          .from("admin_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "خطأ",
            description: "حدث خطأ أثناء جلب بيانات المستخدم",
            variant: "destructive",
          });
          return;
        }

        setUser({
          id: user.id,
          email: user.email || '',
          profile: userData
        });
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء جلب بيانات المستخدم",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-orange-50 rtl">
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
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-noor-purple to-noor-orange bg-clip-text text-transparent">الملف الشخصي</h1>
                <p className="text-gray-600 mt-1">إدارة معلومات الحساب وكلمة المرور</p>
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
              <Button
                variant="outline"
                className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/admin/dashboard")}
              >
                <ArrowLeft size={16} /> العودة للوحة التحكم
              </Button>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-noor-purple border-opacity-30 border-t-noor-orange"></div>
          </div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="bg-white rounded-lg shadow-lg border border-purple-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-noor-purple/10 to-noor-orange/10">
                <CardTitle className="text-noor-purple">معلومات الحساب</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ProfileInfo user={user} />
              </CardContent>
            </Card>

            <Card className="bg-white rounded-lg shadow-lg border border-purple-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-noor-purple/10 to-noor-orange/10">
                <CardTitle className="text-noor-purple">تغيير كلمة المرور</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ChangePasswordForm userId={user?.id || ''} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
