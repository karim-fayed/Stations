-- سياسات أمان الصفوف لجدول المدن (المالك فقط للتعديل)
-- تمكين سياسة أمان الصفوف لجدول المدن
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة إذا كانت موجودة
DROP POLICY IF EXISTS "Allow public read access to cities" ON cities;
DROP POLICY IF EXISTS "Allow admins to insert cities" ON cities;
DROP POLICY IF EXISTS "Allow admins to update cities" ON cities;
DROP POLICY IF EXISTS "Allow admins to delete cities" ON cities;
DROP POLICY IF EXISTS "Allow owner to manage cities" ON cities;
DROP POLICY IF EXISTS "Allow authenticated to insert cities" ON cities;
DROP POLICY IF EXISTS "Allow owner to update cities" ON cities;

-- سياسة للسماح للجميع بقراءة المدن
CREATE POLICY "Allow public read access to cities"
    ON cities FOR SELECT
    USING (true);

-- سياسة للسماح للمستخدمين المسجلين بإضافة مدن جديدة
CREATE POLICY "Allow authenticated to insert cities"
    ON cities FOR INSERT
    WITH CHECK (
        -- التحقق من أن المستخدم مسجل الدخول
        auth.role() = 'authenticated'
    );

-- سياسة للسماح للمالك فقط بتعديل المدن
CREATE POLICY "Allow owner to update cities"
    ON cities FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'owner'
        )
    );

-- سياسة للسماح للمالك فقط بحذف المدن
CREATE POLICY "Allow owner to delete cities"
    ON cities FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'owner'
        )
    );

-- إضافة تعليق توضيحي
COMMENT ON TABLE cities IS 'جدول المدن مع سياسات أمان الصفوف التي تسمح للمستخدمين المسجلين بالإضافة وللمالك فقط بالتعديل والحذف';
