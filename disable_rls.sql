-- تعطيل سياسة أمان الصفوف للمحطات
ALTER TABLE stations DISABLE ROW LEVEL SECURITY;

-- التحقق من وجود triggers قد تسبب المشكلة
SELECT event_object_schema as table_schema,
       event_object_table as table_name,
       trigger_schema,
       trigger_name,
       string_agg(event_manipulation, ',') as event,
       action_timing as activation,
       action_condition as condition,
       action_statement as definition
FROM information_schema.triggers
WHERE event_object_table = 'stations'
GROUP BY 1,2,3,4,6,7,8
ORDER BY table_schema, table_name;
