
import { supabase } from "@/integrations/supabase/client";
import { SupabaseUserResponse } from "./types";

/**
 * يقوم بإنشاء مستخدم مشرف في Supabase إذا لم يكن موجوداً.
 */
export async function createAdminUser(email: string, password: string, name: string): Promise<void> {
  try {
    // 1. التحقق مما إذا كان المستخدم موجودًا بالفعل في Auth
    const { data: existingUserData } = await supabase.auth.admin.listUsers() as { data: SupabaseUserResponse };
    const userExists = existingUserData?.users?.some(user => user.email === email);
    
    if (!userExists) {
      // 2. إنشاء مستخدم في Auth
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: "admin"
          },
        }
      });

      if (userError) {
        if (userError.message.includes("User already registered")) {
          console.log(`المستخدم المشرف موجود بالفعل: ${email}`);
        } else {
          console.error(`خطأ في إنشاء المستخدم المشرف: ${userError}`);
        }
      } else {
        console.log(`تم إنشاء المستخدم المشرف بنجاح: ${userData}`);
        
        // 3. إضافة المستخدم إلى جدول admin_users
        if (userData?.user?.id) {
          await addUserToAdminTable(userData.user.id, email, name);
        }
      }
    } else {
      console.log(`المستخدم المشرف موجود بالفعل: ${email}`);
      
      // التأكد من وجود المستخدم في جدول admin_users
      const foundUser = existingUserData.users?.find(user => user.email === email);
      if (foundUser) {
        await ensureUserInAdminTable(foundUser.id, email, name);
      }
    }
  } catch (error) {
    console.error(`خطأ في إنشاء المستخدم المشرف: ${error}`);
  }
}

/**
 * يضيف مستخدمًا إلى جدول admin_users
 */
export async function addUserToAdminTable(
  userId: string, 
  email: string, 
  name: string = "Admin"
): Promise<void> {
  const { error } = await supabase
    .from('admin_users')
    .upsert({
      id: userId,
      email,
      name,
      role: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
  if (error) {
    console.error(`خطأ في إضافة المستخدم إلى جدول admin_users: ${error}`);
  } else {
    console.log("تم إضافة المستخدم إلى جدول admin_users بنجاح");
  }
}

/**
 * يتأكد من وجود المستخدم في جدول admin_users
 */
export async function ensureUserInAdminTable(
  userId: string, 
  email: string, 
  name: string = "Admin"
): Promise<void> {
  const { data: adminUserFromAuth } = await supabase.auth.admin.getUserById(userId);
  
  if (adminUserFromAuth?.user) {
    const { data: adminUserInTable, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', adminUserFromAuth.user.id)
      .single();
      
    if (fetchError || !adminUserInTable) {
      // إضافة المستخدم إلى جدول admin_users إذا لم يكن موجودًا
      await addUserToAdminTable(adminUserFromAuth.user.id, email, name);
    }
  }
}
