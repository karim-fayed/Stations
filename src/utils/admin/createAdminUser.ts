
import { supabase } from "@/integrations/supabase/client";
import { SupabaseUserResponse } from "./types";

/**
 * Clean a string by removing spaces
 */
const cleanString = (str: string): string => {
  return str.replace(/\s/g, '');
};

/**
 * يقوم بإنشاء مستخدم مشرف في Supabase إذا لم يكن موجوداً.
 */
export async function createAdminUser(email: string, password: string, name: string): Promise<void> {
  try {
    // Clean inputs by removing spaces
    const cleanedEmail = cleanString(email);
    const cleanedPassword = cleanString(password);
    const cleanedName = name.trim();

    // For development/test purposes only
    // Try to sign up with the credentials
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: cleanedEmail,
      password: cleanedPassword,
      options: {
        data: {
          name: cleanedName,
          role: "admin"
        },
      }
    });

    if (signUpError) {
      if (signUpError.message.includes("User already registered")) {
        console.log(`المستخدم المشرف موجود بالفعل: ${cleanedEmail}`);
        // Try to sign in to check if the user exists and is valid
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanedEmail,
          password: cleanedPassword
        });
        
        if (signInData?.user) {
          // User exists and credentials are valid
          await addUserToAdminTable(signInData.user.id, cleanedEmail, cleanedName);
          // Sign out after checking
          await supabase.auth.signOut();
        } else {
          console.error(`خطأ في تسجيل الدخول للمستخدم الموجود: ${signInError?.message || "Unknown error"}`);
        }
      } else {
        console.error(`خطأ في إنشاء المستخدم المشرف: ${signUpError.message}`);
      }
    } else if (signUpData?.user?.id) {
      console.log(`تم إنشاء المستخدم المشرف بنجاح: ${cleanedEmail}`);
      
      // Add the user to admin_users table
      await addUserToAdminTable(signUpData.user.id, cleanedEmail, cleanedName);
      
      // Sign out after creating the user
      await supabase.auth.signOut();
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
  try {
    // Remove any spaces from email
    const cleanedEmail = cleanString(email);
    const cleanedName = name.trim();
    
    // First check if the user already exists in the admin_users table
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (existingUser) {
      console.log(`المستخدم موجود بالفعل في جدول admin_users: ${cleanedEmail}`);
      return;
    }
    
    // Add the user to admin_users table
    const { error } = await supabase
      .from('admin_users')
      .upsert({
        id: userId,
        email: cleanedEmail,
        name: cleanedName,
        role: "admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      console.error(`خطأ في إضافة المستخدم إلى جدول admin_users: ${error.message}`);
    } else {
      console.log("تم إضافة المستخدم إلى جدول admin_users بنجاح");
    }
  } catch (error: any) {
    console.error(`خطأ في إضافة المستخدم إلى جدول admin_users: ${error.message}`);
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
  try {
    // Remove any spaces from email
    const cleanedEmail = cleanString(email);
    const cleanedName = name.trim();
    
    // Check if user exists in admin_users table
    const { data: adminUserInTable, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (fetchError || !adminUserInTable) {
      // إضافة المستخدم إلى جدول admin_users إذا لم يكن موجودًا
      await addUserToAdminTable(userId, cleanedEmail, cleanedName);
    } else {
      console.log(`المستخدم موجود بالفعل في جدول admin_users: ${cleanedEmail}`);
    }
  } catch (error: any) {
    console.error(`خطأ في التحقق من وجود المستخدم في جدول admin_users: ${error.message}`);
  }
}
