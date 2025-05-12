// سكريبت لتطبيق سياسات أمان الصفوف لجدول المدن
// يمكن تشغيل هذا السكريبت باستخدام Node.js

const { createClient } = require('@supabase/supabase-js');

// معلومات المشروع
const SUPABASE_URL = 'https://jtnqcyouncjoebqcalzh.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0bnFjeW91bmNqb2VicWNhbHpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTUxOTIxMiwiZXhwIjoyMDYxMDk1MjEyfQ.Rh0RyUqeJ_oU8AK5lG1e_Zqz8taS3vuH8q8KjGnLZrA';

// إنشاء عميل Supabase باستخدام مفتاح الخدمة
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// استعلام SQL لتطبيق سياسات أمان الصفوف
const sql = `
-- تمكين سياسة أمان الصفوف لجدول المدن
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة إذا كانت موجودة
DROP POLICY IF EXISTS "Allow public read access to cities" ON cities;
DROP POLICY IF EXISTS "Allow admins to insert cities" ON cities;
DROP POLICY IF EXISTS "Allow admins to update cities" ON cities;
DROP POLICY IF EXISTS "Allow admins to delete cities" ON cities;
DROP POLICY IF EXISTS "Allow owner to manage cities" ON cities;

-- سياسة للسماح للجميع بقراءة المدن
CREATE POLICY "Allow public read access to cities"
    ON cities FOR SELECT
    USING (true);

-- سياسة للسماح للمشرفين بإضافة مدن جديدة
CREATE POLICY "Allow admins to insert cities"
    ON cities FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND (admin_users.role = 'admin' OR admin_users.role = 'owner')
        )
    );

-- سياسة للسماح للمشرفين بتعديل المدن
CREATE POLICY "Allow admins to update cities"
    ON cities FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND (admin_users.role = 'admin' OR admin_users.role = 'owner')
        )
    );

-- سياسة للسماح للمشرفين بحذف المدن
CREATE POLICY "Allow admins to delete cities"
    ON cities FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND (admin_users.role = 'admin' OR admin_users.role = 'owner')
        )
    );

-- سياسة شاملة للسماح للمالك بإدارة المدن (قراءة، إضافة، تعديل، حذف)
CREATE POLICY "Allow owner to manage cities"
    ON cities
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'owner'
        )
    );

-- إضافة تعليق توضيحي
COMMENT ON TABLE cities IS 'جدول المدن مع سياسات أمان الصفوف التي تسمح للمشرفين والمالكين بإدارة المدن';
`;

// دالة لتنفيذ الاستعلام
async function applyRLS() {
  console.log('جاري تطبيق سياسات أمان الصفوف لجدول المدن...');
  
  try {
    // تنفيذ الاستعلام SQL
    const { error } = await supabaseAdmin.rpc('pgexec', { sql });
    
    if (error) {
      console.error('خطأ في تطبيق سياسات أمان الصفوف:', error);
    } else {
      console.log('تم تطبيق سياسات أمان الصفوف بنجاح!');
    }
  } catch (error) {
    console.error('خطأ غير متوقع:', error);
  }
}

// تنفيذ الدالة
applyRLS();
