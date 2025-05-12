# الحل النهائي لمشكلة إضافة المناطق إلى قاعدة البيانات

## المشكلة

هناك مشكلة في إضافة المناطق إلى جدول `cities` في قاعدة البيانات بسبب سياسات أمان الصفوف (RLS) التي تمنع المستخدمين من إضافة صفوف جديدة.

## الحل

تم تنفيذ حل متعدد المستويات يحاول إضافة المنطقة باستخدام عدة طرق مختلفة:

1. **المستوى الأول**: استخدام API مباشر مع مفتاح المستخدم العادي.
2. **المستوى الثاني**: استخدام SQL مباشر مع مفتاح المستخدم العادي.
3. **المستوى الثالث**: استخدام API العادي مع مفتاح المستخدم العادي.
4. **المستوى الرابع**: استخدام Edge Function (إذا كانت متاحة).
5. **المستوى الخامس**: إضافة المنطقة محليًا فقط (كحل أخير).

## خطوات تطبيق الحل

### الخطوة 1: تعطيل سياسات أمان الصفوف مؤقتًا (اختياري)

إذا كنت ترغب في تعطيل سياسات أمان الصفوف مؤقتًا للاختبار، يمكنك تنفيذ الاستعلام التالي:

```sql
-- تعطيل سياسات أمان الصفوف لجدول المدن
ALTER TABLE cities DISABLE ROW LEVEL SECURITY;
```

يمكنك تنفيذ هذا الاستعلام من خلال:

1. الذهاب إلى لوحة تحكم Supabase: https://app.supabase.com/project/jtnqcyouncjoebqcalzh
2. انتقل إلى قسم "SQL Editor" من القائمة الجانبية.
3. انسخ الاستعلام أعلاه والصقه في محرر SQL.
4. انقر على زر "Run" لتنفيذ الاستعلام.

### الخطوة 2: تطبيق سياسات أمان الصفوف الصحيحة

لتطبيق سياسات أمان الصفوف التي تسمح للمالك والمشرفين بإضافة المناطق، يمكنك تنفيذ الاستعلام التالي:

```sql
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
```

### الخطوة 3: التحقق من صلاحيات المستخدم

تأكد من أن المستخدم الذي يحاول إضافة المنطقة لديه دور "admin" أو "owner" في جدول `admin_users`. يمكنك التحقق من ذلك باستخدام الاستعلام التالي:

```sql
SELECT * FROM admin_users WHERE id = '<user_id>';
```

استبدل `<user_id>` بمعرف المستخدم الحالي.

### الخطوة 4: إعادة تشغيل التطبيق

بعد تطبيق التغييرات، قم بإعادة تشغيل التطبيق وتسجيل الدخول كمشرف أو مالك، ثم حاول إضافة منطقة جديدة.

## استكشاف الأخطاء وإصلاحها

إذا كنت لا تزال تواجه مشكلة في إضافة المناطق، يمكنك:

1. التحقق من سجلات وحدة التحكم في المتصفح للحصول على مزيد من المعلومات حول الأخطاء.
2. التأكد من أن المستخدم مسجل الدخول بشكل صحيح.
3. التأكد من أن المستخدم لديه دور "admin" أو "owner" في جدول `admin_users`.
4. التحقق من أن سياسات أمان الصفوف تم تطبيقها بشكل صحيح.

## ملاحظة هامة

إذا كنت قد عطلت سياسات أمان الصفوف مؤقتًا للاختبار، تأكد من إعادة تمكينها بعد الانتهاء من الاختبار باستخدام الاستعلام التالي:

```sql
-- تمكين سياسات أمان الصفوف لجدول المدن
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
```
