# حل مشكلة إضافة المناطق وتعديلها (المالك فقط)

## المشكلة

1. عند تمكين سياسات أمان الصفوف (RLS)، لا يمكن إضافة مناطق جديدة إلى جدول `cities`.
2. يجب أن يكون التعديل متاحًا للمالك فقط.

## الحل

تم إنشاء سياسات أمان صفوف جديدة تسمح بما يلي:

1. السماح للجميع بقراءة المدن.
2. السماح للمستخدمين المسجلين بإضافة مدن جديدة.
3. السماح للمالك فقط بتعديل المدن.
4. السماح للمالك فقط بحذف المدن.

## خطوات تطبيق الحل

### الخطوة 1: تطبيق سياسات أمان الصفوف الجديدة

1. انتقل إلى لوحة تحكم Supabase: https://app.supabase.com/project/jtnqcyouncjoebqcalzh
2. انتقل إلى قسم "SQL Editor" من القائمة الجانبية.
3. انسخ الاستعلام التالي والصقه في محرر SQL:

```sql
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
```

4. انقر على زر "Run" لتنفيذ الاستعلام.

### الخطوة 2: التحقق من تطبيق السياسات

1. انتقل إلى قسم "Authentication" > "Policies" في لوحة تحكم Supabase.
2. ابحث عن جدول "cities" وتأكد من وجود السياسات التالية:
   - "Allow public read access to cities"
   - "Allow authenticated to insert cities"
   - "Allow owner to update cities"
   - "Allow owner to delete cities"

### الخطوة 3: اختبار الإضافة والتعديل

1. قم بتسجيل الدخول إلى التطبيق كمستخدم عادي وحاول إضافة منطقة جديدة.
2. قم بتسجيل الدخول كمالك وحاول تعديل منطقة موجودة.

## استكشاف الأخطاء وإصلاحها

إذا كنت لا تزال تواجه مشكلة في إضافة المناطق، يمكنك:

### 1. التحقق من دور المستخدم

تأكد من أن المستخدم مسجل الدخول بشكل صحيح. يمكنك التحقق من ذلك باستخدام الاستعلام التالي:

```sql
SELECT auth.uid(), auth.role();
```

### 2. التحقق من جدول admin_users

تأكد من أن المستخدم الذي يحاول تعديل المناطق موجود في جدول `admin_users` ولديه دور "owner". يمكنك التحقق من ذلك باستخدام الاستعلام التالي:

```sql
SELECT * FROM admin_users WHERE id = '<user_id>';
```

استبدل `<user_id>` بمعرف المستخدم الحالي.

### 3. تعطيل سياسات أمان الصفوف مؤقتًا للاختبار

إذا كنت ترغب في تعطيل سياسات أمان الصفوف مؤقتًا للاختبار، يمكنك استخدام الاستعلام التالي:

```sql
-- تعطيل سياسات أمان الصفوف لجدول المدن
ALTER TABLE cities DISABLE ROW LEVEL SECURITY;
```

بعد الانتهاء من الاختبار، تأكد من إعادة تمكين سياسات أمان الصفوف:

```sql
-- تمكين سياسات أمان الصفوف لجدول المدن
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
```

## ملاحظات هامة

1. سياسة "Allow authenticated to insert cities" تسمح لأي مستخدم مسجل الدخول بإضافة مدن جديدة.
2. سياسة "Allow owner to update cities" تسمح فقط للمستخدمين الذين لديهم دور "owner" في جدول `admin_users` بتعديل المدن.
3. سياسة "Allow owner to delete cities" تسمح فقط للمستخدمين الذين لديهم دور "owner" في جدول `admin_users` بحذف المدن.
