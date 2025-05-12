-- 1. تعطيل سياسة أمان الصفوف للمحطات
ALTER TABLE stations DISABLE ROW LEVEL SECURITY;

-- 2. التحقق من وجود triggers قد تسبب المشكلة
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

-- 3. حذف أي triggers قد تسبب المشكلة (قم بتعديل اسم الـ trigger حسب نتائج الاستعلام السابق)
-- DROP TRIGGER IF EXISTS trigger_name ON stations;

-- 4. التحقق من وجود قيود قد تسبب المشكلة
SELECT con.*
FROM pg_catalog.pg_constraint con
INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
INNER JOIN pg_catalog.pg_namespace nsp ON nsp.oid = connamespace
WHERE rel.relname = 'stations';

-- 5. إنشاء وظيفة بديلة لإضافة محطة جديدة
CREATE OR REPLACE FUNCTION public.insert_station(
    station_name TEXT,
    station_region TEXT,
    station_sub_region TEXT DEFAULT '',
    station_latitude NUMERIC,
    station_longitude NUMERIC,
    station_fuel_types TEXT DEFAULT '',
    station_additional_info TEXT DEFAULT ''
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- إضافة المحطة مباشرة باستخدام استعلام SQL بدلاً من استخدام INSERT .. RETURNING
    EXECUTE 'INSERT INTO stations (name, region, sub_region, latitude, longitude, fuel_types, additional_info) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING to_jsonb(stations.*)'
    INTO result
    USING station_name, station_region, station_sub_region, station_latitude, station_longitude, station_fuel_types, station_additional_info;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- منح صلاحيات تنفيذ الوظيفة للمستخدمين المصرح لهم
GRANT EXECUTE ON FUNCTION public.insert_station TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_station TO service_role;

-- 6. إنشاء وظيفة لحذف المحطات المكررة
CREATE OR REPLACE FUNCTION public.delete_duplicate_stations() RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- حذف المحطات المكررة باستخدام استعلام SQL مباشر
    WITH duplicates AS (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY name, latitude, longitude ORDER BY created_at) as row_num
        FROM stations
    ),
    deleted AS (
        DELETE FROM stations
        WHERE id IN (SELECT id FROM duplicates WHERE row_num > 1)
        RETURNING id
    )
    SELECT jsonb_build_object(
        'deleted_count', (SELECT COUNT(*) FROM deleted),
        'remaining_count', (SELECT COUNT(*) FROM stations)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- منح صلاحيات تنفيذ الوظيفة للمستخدمين المصرح لهم
GRANT EXECUTE ON FUNCTION public.delete_duplicate_stations TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_duplicate_stations TO service_role;

-- 7. إعادة تمكين سياسة أمان الصفوف مع سياسات أكثر تساهلاً (اختياري - استخدم هذا فقط إذا كنت تريد إعادة تمكين RLS)
-- ALTER TABLE stations ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS stations_select_policy ON stations;
-- CREATE POLICY stations_select_policy ON stations FOR SELECT USING (true);

-- DROP POLICY IF EXISTS stations_insert_policy ON stations;
-- CREATE POLICY stations_insert_policy ON stations FOR INSERT WITH CHECK (true);

-- DROP POLICY IF EXISTS stations_update_policy ON stations;
-- CREATE POLICY stations_update_policy ON stations FOR UPDATE USING (true);

-- DROP POLICY IF EXISTS stations_delete_policy ON stations;
-- CREATE POLICY stations_delete_policy ON stations FOR DELETE USING (true);
