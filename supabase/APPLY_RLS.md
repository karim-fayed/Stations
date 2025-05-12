# تعليمات تطبيق سياسات أمان الصفوف لجدول المدن

## الطريقة 1: تطبيق السياسات باستخدام لوحة تحكم Supabase

1. قم بتسجيل الدخول إلى لوحة تحكم Supabase على الرابط:
   https://app.supabase.com/project/jtnqcyouncjoebqcalzh

2. انتقل إلى قسم "SQL Editor" من القائمة الجانبية.

3. انسخ محتوى الملف التالي:
   `supabase/migrations/20240601000002_cities_rls_final.sql`

4. الصق المحتوى في محرر SQL وانقر على زر "Run" لتنفيذ الاستعلام.

5. تحقق من نجاح تنفيذ الاستعلام من خلال عدم ظهور أي أخطاء.

## الطريقة 2: تطبيق السياسات باستخدام Supabase CLI

1. تأكد من أن Supabase CLI مثبت على جهازك:
   ```bash
   npm install -g supabase
   ```

2. قم بتسجيل الدخول إلى Supabase:
   ```bash
   supabase login
   ```

3. قم بربط المشروع المحلي بمشروع Supabase:
   ```bash
   supabase link --project-ref jtnqcyouncjoebqcalzh
   ```

4. قم بتطبيق ملف الترحيل:
   ```bash
   supabase db push
   ```

## الطريقة 3: تطبيق السياسات باستخدام API مباشرة

إذا كنت تفضل تطبيق السياسات مباشرة باستخدام API، يمكنك استخدام الكود التالي:

```javascript
// استخدام مفتاح الخدمة (service role key) للوصول إلى قاعدة البيانات
const supabaseAdmin = createClient(
  'https://jtnqcyouncjoebqcalzh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0bnFjeW91bmNqb2VicWNhbHpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTUxOTIxMiwiZXhwIjoyMDYxMDk1MjEyfQ.Rh0RyUqeJ_oU8AK5lG1e_Zqz8taS3vuH8q8KjGnLZrA'
);

// تنفيذ استعلام SQL لتطبيق سياسات أمان الصفوف
const applyRLS = async () => {
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
  `;

  const { error } = await supabaseAdmin.rpc('pgexec', { sql });
  if (error) {
    console.error('Error applying RLS policies:', error);
  } else {
    console.log('RLS policies applied successfully');
  }
};

applyRLS();
```

## التحقق من تطبيق السياسات

بعد تطبيق السياسات، يمكنك التحقق من نجاح التطبيق من خلال:

1. الذهاب إلى قسم "Authentication" > "Policies" في لوحة تحكم Supabase.
2. البحث عن جدول "cities" والتأكد من وجود السياسات المطلوبة.
3. محاولة إضافة مدينة جديدة باستخدام التطبيق وهو مسجل الدخول كمشرف أو مالك.

## استكشاف الأخطاء وإصلاحها

إذا كنت لا تزال تواجه مشكلة في إضافة المدن، تحقق من:

1. أن المستخدم مسجل الدخول بشكل صحيح.
2. أن المستخدم لديه دور "admin" أو "owner" في جدول `admin_users`.
3. أن سياسات أمان الصفوف تم تطبيقها بشكل صحيح.

يمكنك التحقق من صلاحيات المستخدم الحالي باستخدام الاستعلام التالي:

```sql
SELECT * FROM admin_users WHERE id = auth.uid();
```

## ملاحظة هامة

تأكد من عدم مشاركة مفتاح الخدمة (service role key) مع أي شخص غير موثوق به، حيث يمنح هذا المفتاح صلاحيات كاملة للوصول إلى قاعدة البيانات.
