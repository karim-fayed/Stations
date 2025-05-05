
import { supabase } from "@/integrations/supabase/client";
import { SupabaseUserResponse } from "./types";

/**
 * Clean a string by removing spaces
 */
const cleanString = (str: string): string => {
  return str.replace(/\s/g, '');
};

/**
 * تم إزالة وظيفة createAdminUser التي كانت تنشئ مستخدمين تلقائيًا
 * يجب إنشاء المستخدمين فقط من خلال واجهة المستخدم أو قاعدة البيانات مباشرة
 */

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
