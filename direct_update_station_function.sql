-- إنشاء دالة لتحديث دالة update_station مباشرة
CREATE OR REPLACE FUNCTION public.direct_update_station_function()
RETURNS void AS $$
BEGIN
    -- حذف الدالة الموجودة إذا كانت موجودة
    DROP FUNCTION IF EXISTS public.update_station(UUID, JSONB);

    -- إنشاء الدالة بالمعلمات الصحيحة
    CREATE OR REPLACE FUNCTION public.update_station(
        p_station_id UUID,
        p_station_data JSONB
    ) RETURNS SETOF stations AS $inner$
    BEGIN
        RETURN QUERY
        UPDATE public.stations SET
            name = COALESCE(p_station_data->>'name', name),
            region = COALESCE(p_station_data->>'region', region),
            sub_region = COALESCE(p_station_data->>'sub_region', sub_region),
            latitude = COALESCE((p_station_data->>'latitude')::numeric, latitude),
            longitude = COALESCE((p_station_data->>'longitude')::numeric, longitude),
            fuel_types = COALESCE(p_station_data->>'fuel_types', fuel_types),
            additional_info = COALESCE(p_station_data->>'additional_info', additional_info),
            updated_at = now()
        WHERE id = p_station_id
        RETURNING *;
    END;
    $inner$ LANGUAGE plpgsql SECURITY DEFINER;

    -- منح صلاحيات تنفيذ الدالة للمستخدمين المصرح لهم
    GRANT EXECUTE ON FUNCTION public.update_station(UUID, JSONB) TO authenticated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- منح صلاحيات تنفيذ الدالة للمستخدمين المصرح لهم
GRANT EXECUTE ON FUNCTION public.direct_update_station_function() TO authenticated;
