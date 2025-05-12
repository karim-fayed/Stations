# الحل البسيط لمشكلة إضافة المناطق إلى قاعدة البيانات

## المشكلة

هناك مشكلة في إضافة المناطق إلى جدول `cities` في قاعدة البيانات بسبب سياسات أمان الصفوف (RLS) التي تمنع المستخدمين من إضافة صفوف جديدة.

## الحل

تم تبسيط الحل بطريقتين:

1. تبسيط ملف `cityService.ts` لتجنب الأخطاء.
2. إضافة سياسة أمان صفوف جديدة للسماح للمستخدمين المسجلين بإضافة مدن جديدة.

## خطوات تطبيق الحل

### الخطوة 1: تطبيق سياسات أمان الصفوف البسيطة

قم بتنفيذ الاستعلام التالي في لوحة تحكم Supabase:

```sql
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
```

### الخطوة 2: إعادة تشغيل التطبيق

بعد تطبيق التغييرات، قم بإعادة تشغيل التطبيق وتسجيل الدخول، ثم حاول إضافة منطقة جديدة.

## كيفية تطبيق الحل

1. انتقل إلى لوحة تحكم Supabase: https://app.supabase.com/project/jtnqcyouncjoebqcalzh
2. انتقل إلى قسم "SQL Editor" من القائمة الجانبية.
3. انسخ الاستعلام أعلاه والصقه في محرر SQL.
4. انقر على زر "Run" لتنفيذ الاستعلام.

## استكشاف الأخطاء وإصلاحها

إذا كنت لا تزال تواجه مشكلة في إضافة المناطق، يمكنك:

1. التحقق من سجلات وحدة التحكم في المتصفح للحصول على مزيد من المعلومات حول الأخطاء.
2. التأكد من أن المستخدم مسجل الدخول بشكل صحيح.
3. تعطيل سياسات أمان الصفوف مؤقتًا للاختبار باستخدام الاستعلام التالي:

```sql
-- تعطيل سياسات أمان الصفوف لجدول المدن
ALTER TABLE cities DISABLE ROW LEVEL SECURITY;
```

بعد الانتهاء من الاختبار، تأكد من إعادة تمكين سياسات أمان الصفوف:

```sql
-- تمكين سياسات أمان الصفوف لجدول المدن
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
```
