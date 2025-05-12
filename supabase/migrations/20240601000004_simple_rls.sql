-- سياسات أمان الصفوف البسيطة لجدول المدن
-- تمكين سياسة أمان الصفوف لجدول المدن
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة إذا كانت موجودة
DROP POLICY IF EXISTS "Allow public read access to cities" ON cities;
DROP POLICY IF EXISTS "Allow admins to insert cities" ON cities;
DROP POLICY IF EXISTS "Allow admins to update cities" ON cities;
DROP POLICY IF EXISTS "Allow admins to delete cities" ON cities;
DROP POLICY IF EXISTS "Allow owner to manage cities" ON cities;
DROP POLICY IF EXISTS "Allow authenticated to insert cities" ON cities;

-- سياسة للسماح للجميع بقراءة المدن
CREATE POLICY "Allow public read access to cities"
    ON cities FOR SELECT
    USING (true);

-- سياسة للسماح للمستخدمين المسجلين بإضافة مدن جديدة
CREATE POLICY "Allow authenticated to insert cities"
    ON cities FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

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
