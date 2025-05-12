-- إنشاء وظيفة لتنفيذ استعلامات SQL مباشرة
-- ملاحظة: هذه الوظيفة تمثل مخاطر أمنية محتملة، استخدمها فقط للتطوير وليس في بيئة الإنتاج
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- تنفيذ الاستعلام وإرجاع النتيجة
    EXECUTE sql_query INTO result;
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    -- إرجاع معلومات الخطأ
    RETURN jsonb_build_object(
        'error', SQLERRM,
        'detail', SQLSTATE,
        'query', sql_query
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- منح صلاحيات تنفيذ الوظيفة للمستخدمين المصرح لهم
GRANT EXECUTE ON FUNCTION public.execute_sql TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_sql TO service_role;

-- بديل أكثر أمانًا: وظيفة لإضافة محطة مباشرة بدون استخدام استعلامات SQL ديناميكية
CREATE OR REPLACE FUNCTION public.direct_insert_station(
    station_data JSONB
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    INSERT INTO stations (
        name,
        region,
        sub_region,
        latitude,
        longitude,
        fuel_types,
        additional_info
    ) VALUES (
        station_data->>'name',
        station_data->>'region',
        station_data->>'sub_region',
        (station_data->>'latitude')::NUMERIC,
        (station_data->>'longitude')::NUMERIC,
        station_data->>'fuel_types',
        station_data->>'additional_info'
    )
    RETURNING to_jsonb(stations.*) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- منح صلاحيات تنفيذ الوظيفة للمستخدمين المصرح لهم
GRANT EXECUTE ON FUNCTION public.direct_insert_station TO authenticated;
GRANT EXECUTE ON FUNCTION public.direct_insert_station TO service_role;
