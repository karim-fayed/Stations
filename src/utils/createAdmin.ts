
import { supabase } from "@/integrations/supabase/client";

/**
 * يقوم بإنشاء مستخدم مشرف اختباري في Supabase إذا لم يكن موجودًا.
 * هذا للأغراض التطويرية فقط.
 */
export async function createTestAdmin() {
  try {
    // التأكد من عدم وجود مسافات في البريد الإلكتروني وكلمة المرور
    const adminEmail = "karim-it@outlook.sa";
    const adminPassword = "|l0v3N@fes";

    // بيانات اعتماد الاختبار
    const testEmail = "admin@example.com";
    const testPassword = "Admin123!";

    console.log("محاولة إنشاء أو التحقق من المستخدمين المشرفين");

    // إنشاء المستخدم المشرف الأول
    try {
      // 1. التحقق مما إذا كان المستخدم موجودًا بالفعل في Auth
      const { data: existingUserData } = await supabase.auth.admin.listUsers();
      const adminExists = existingUserData?.users?.some(user => user.email === adminEmail);
      
      if (!adminExists) {
        // 2. إنشاء مستخدم في Auth
        const { data: adminUserData, error: adminUserError } = await supabase.auth.signUp({
          email: adminEmail,
          password: adminPassword,
          options: {
            data: {
              name: "Admin",
              role: "admin"
            },
          }
        });

        if (adminUserError) {
          if (adminUserError.message.includes("User already registered")) {
            console.log("المستخدم المشرف موجود بالفعل:", adminEmail);
          } else {
            console.error("خطأ في إنشاء المستخدم المشرف:", adminUserError);
          }
        } else {
          console.log("تم إنشاء المستخدم المشرف بنجاح:", adminUserData);
          
          // 3. إضافة المستخدم إلى جدول admin_users
          if (adminUserData?.user?.id) {
            const { error: adminTableError } = await supabase
              .from('admin_users')
              .upsert({
                id: adminUserData.user.id,
                email: adminEmail,
                name: "Admin",
                role: "admin",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (adminTableError) {
              console.error("خطأ في إضافة المستخدم إلى جدول admin_users:", adminTableError);
            } else {
              console.log("تم إضافة المستخدم إلى جدول admin_users بنجاح");
            }
          }
        }
      } else {
        console.log("المستخدم المشرف موجود بالفعل:", adminEmail);
        
        // التأكد من وجود المستخدم في جدول admin_users
        const { data: adminUserFromAuth } = await supabase.auth.admin.getUserById(
          existingUserData.users.find(user => user.email === adminEmail)?.id || ""
        );
        
        if (adminUserFromAuth?.user) {
          const { data: adminUserInTable, error: fetchError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', adminUserFromAuth.user.id)
            .single();
            
          if (fetchError || !adminUserInTable) {
            // إضافة المستخدم إلى جدول admin_users إذا لم يكن موجودًا
            const { error: adminTableError } = await supabase
              .from('admin_users')
              .upsert({
                id: adminUserFromAuth.user.id,
                email: adminEmail,
                name: "Admin",
                role: "admin",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (adminTableError) {
              console.error("خطأ في إضافة المستخدم إلى جدول admin_users:", adminTableError);
            } else {
              console.log("تم إضافة المستخدم إلى جدول admin_users بنجاح");
            }
          }
        }
      }
    } catch (error) {
      console.error("خطأ في إنشاء المستخدم المشرف:", error);
    }

    // إنشاء مستخدم الاختبار
    try {
      // 1. التحقق مما إذا كان المستخدم موجودًا بالفعل في Auth
      const { data: existingUserData } = await supabase.auth.admin.listUsers();
      const testUserExists = existingUserData?.users?.some(user => user.email === testEmail);
      
      if (!testUserExists) {
        // 2. إنشاء مستخدم في Auth
        const { data: testUserData, error: testUserError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: {
            data: {
              name: "Test Admin",
              role: "admin"
            },
          }
        });

        if (testUserError) {
          if (testUserError.message.includes("User already registered")) {
            console.log("مستخدم الاختبار موجود بالفعل:", testEmail);
          } else {
            console.error("خطأ في إنشاء مستخدم الاختبار:", testUserError);
          }
        } else {
          console.log("تم إنشاء مستخدم الاختبار بنجاح:", testUserData);
          
          // 3. إضافة المستخدم إلى جدول admin_users
          if (testUserData?.user?.id) {
            const { error: testTableError } = await supabase
              .from('admin_users')
              .upsert({
                id: testUserData.user.id,
                email: testEmail,
                name: "Test Admin",
                role: "admin",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (testTableError) {
              console.error("خطأ في إضافة مستخدم الاختبار إلى جدول admin_users:", testTableError);
            } else {
              console.log("تم إضافة مستخدم الاختبار إلى جدول admin_users بنجاح");
            }
          }
        }
      } else {
        console.log("مستخدم الاختبار موجود بالفعل:", testEmail);
        
        // التأكد من وجود المستخدم في جدول admin_users
        const { data: testUserFromAuth } = await supabase.auth.admin.getUserById(
          existingUserData.users.find(user => user.email === testEmail)?.id || ""
        );
        
        if (testUserFromAuth?.user) {
          const { data: testUserInTable, error: fetchError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', testUserFromAuth.user.id)
            .single();
            
          if (fetchError || !testUserInTable) {
            // إضافة المستخدم إلى جدول admin_users إذا لم يكن موجودًا
            const { error: testTableError } = await supabase
              .from('admin_users')
              .upsert({
                id: testUserFromAuth.user.id,
                email: testEmail,
                name: "Test Admin",
                role: "admin",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
            if (testTableError) {
              console.error("خطأ في إضافة مستخدم الاختبار إلى جدول admin_users:", testTableError);
            } else {
              console.log("تم إضافة مستخدم الاختبار إلى جدول admin_users بنجاح");
            }
          }
        }
      }
    } catch (error) {
      console.error("خطأ في إنشاء مستخدم الاختبار:", error);
    }
    
    // تسجيل الخروج بعد إنشاء/التحقق من المستخدمين
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error("خطأ في createTestAdmin:", error);
  }
}

/**
 * يجب استدعاء هذه الوظيفة مرة واحدة أثناء تهيئة التطبيق
 * للتأكد من وجود مستخدم مشرف
 */
export async function ensureAdminExists() {
  try {
    // تشغيل هذا في وضع التطوير فقط
    if (process.env.NODE_ENV !== "production") {
      await createTestAdmin();
    }
  } catch (error) {
    console.error("خطأ في ensureAdminExists:", error);
  }
}
