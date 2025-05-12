# وظائف Supabase Edge Functions

## وظيفة إضافة مدينة (add-city)

هذه الوظيفة تسمح بإضافة مدينة جديدة إلى جدول `cities` في قاعدة البيانات، متجاوزة سياسات أمان الصفوف (RLS) باستخدام مفتاح الخدمة (service role key).

### كيفية نشر الوظيفة

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
   supabase link --project-ref <project-id>
   ```
   يمكنك العثور على `project-id` في إعدادات مشروعك في لوحة تحكم Supabase.

4. قم بنشر الوظيفة:
   ```bash
   supabase functions deploy add-city
   ```

### كيفية استخدام الوظيفة

يمكن استدعاء الوظيفة من التطبيق باستخدام `fetch` كما يلي:

```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/add-city`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      name_ar: "اسم المدينة بالعربية",
      name_en: "City Name in English",
      latitude: 24.7136,
      longitude: 46.6753,
      zoom: 10,
    }),
  }
);

const result = await response.json();
```

### متطلبات الأمان

- يجب أن يكون المستخدم مسجل الدخول ولديه رمز مصادقة صالح.
- يجب أن يكون المستخدم مشرفًا أو مالكًا (له دور "admin" أو "owner" في جدول `admin_users`).

### استكشاف الأخطاء وإصلاحها

إذا واجهت مشكلة في استدعاء الوظيفة، تحقق من:

1. أن المستخدم مسجل الدخول ولديه رمز مصادقة صالح.
2. أن المستخدم لديه دور "admin" أو "owner" في جدول `admin_users`.
3. أن الوظيفة تم نشرها بشكل صحيح.
4. أن متغيرات البيئة `SUPABASE_URL` و `SUPABASE_SERVICE_ROLE_KEY` تم تعيينها بشكل صحيح.

يمكنك مراجعة سجلات الوظيفة في لوحة تحكم Supabase للحصول على مزيد من المعلومات حول الأخطاء.
