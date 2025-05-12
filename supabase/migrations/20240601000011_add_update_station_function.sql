-- Create a function to handle station updates
CREATE OR REPLACE FUNCTION update_station(
    p_station_id uuid,
    p_station_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_station_exists boolean;
    v_updated_station jsonb;
BEGIN
    -- Check if station exists
    SELECT EXISTS(SELECT 1 FROM stations WHERE id = p_station_id) INTO v_station_exists;
    
    IF NOT v_station_exists THEN
        RAISE EXCEPTION 'Station not found';
    END IF;

    -- Update the station
    UPDATE stations
    SET 
        name = COALESCE(p_station_data->>'name', name),
        region = COALESCE(p_station_data->>'region', region),
        sub_region = COALESCE(p_station_data->>'sub_region', sub_region),
        latitude = COALESCE((p_station_data->>'latitude')::numeric, latitude),
        longitude = COALESCE((p_station_data->>'longitude')::numeric, longitude),
        fuel_types = COALESCE(p_station_data->>'fuel_types', fuel_types),
        additional_info = COALESCE(p_station_data->>'additional_info', additional_info),
        updated_at = now()
    WHERE id = p_station_id
    RETURNING to_jsonb(stations.*) INTO v_updated_station;

    -- Update sync status
    INSERT INTO station_sync_status (
        station_id,
        sync_status,
        last_sync_attempt
    ) VALUES (
        p_station_id,
        'PENDING',
        now()
    )
    ON CONFLICT (station_id) 
    DO UPDATE SET 
        sync_status = 'PENDING',
        last_sync_attempt = now(),
        updated_at = now();

    RETURN v_updated_station;
EXCEPTION
    WHEN OTHERS THEN
        -- Update sync status to failed
        UPDATE station_sync_status
        SET 
            sync_status = 'FAILED',
            last_sync_attempt = now(),
            sync_error = SQLERRM,
            updated_at = now()
        WHERE station_id = p_station_id;

        RAISE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_station TO authenticated;

-- Add comment explaining the purpose
COMMENT ON FUNCTION update_station IS 'Updates station data and tracks sync status'; 