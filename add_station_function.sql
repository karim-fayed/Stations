-- وظيفة لإضافة محطة جديدة
CREATE OR REPLACE FUNCTION add_station(
  name TEXT,
  region TEXT,
  sub_region TEXT DEFAULT '',
  latitude NUMERIC,
  longitude NUMERIC,
  fuel_types TEXT DEFAULT '',
  additional_info TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- تنفيذ الوظيفة بصلاحيات المالك
AS $$
DECLARE
  new_station JSONB;
BEGIN
  -- التحقق من وجود البيانات المطلوبة
  IF name IS NULL OR latitude IS NULL OR longitude IS NULL THEN
    RAISE EXCEPTION 'Station name, latitude and longitude are required';
  END IF;

  -- إضافة المحطة الجديدة
  INSERT INTO stations (
    name,
    region,
    sub_region,
    latitude,
    longitude,
    fuel_types,
    additional_info
  ) VALUES (
    name,
    region,
    sub_region,
    latitude,
    longitude,
    fuel_types,
    additional_info
  )
  RETURNING to_jsonb(stations.*) INTO new_station;

  RETURN new_station;
END;
$$;

-- منح صلاحيات تنفيذ الوظيفة للمستخدمين المصرح لهم
GRANT EXECUTE ON FUNCTION add_station TO authenticated;
GRANT EXECUTE ON FUNCTION add_station TO service_role;

-- تعطيل سياسة أمان الصفوف للمحطات (اختياري - استخدم هذا فقط إذا كنت تواجه مشاكل مع RLS)
-- ALTER TABLE stations DISABLE ROW LEVEL SECURITY;

-- أو بدلاً من ذلك، يمكنك إنشاء سياسات أمان أكثر تحديدًا
CREATE POLICY insert_stations_policy
  ON stations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY select_stations_policy
  ON stations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY update_stations_policy
  ON stations
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY delete_stations_policy
  ON stations
  FOR DELETE
  TO authenticated
  USING (true);
