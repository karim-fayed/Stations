-- Create a table to track sync status
CREATE TABLE IF NOT EXISTS station_sync_status (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    station_id uuid NOT NULL REFERENCES stations(id),
    sync_status text NOT NULL CHECK (sync_status IN ('PENDING', 'SYNCED', 'FAILED')),
    last_sync_attempt timestamptz,
    sync_error text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create a function to handle station sync
CREATE OR REPLACE FUNCTION sync_station_data(
    p_station_id uuid,
    p_sync_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_station_exists boolean;
    v_sync_result jsonb;
BEGIN
    -- Check if station exists
    SELECT EXISTS(SELECT 1 FROM stations WHERE id = p_station_id) INTO v_station_exists;
    
    IF NOT v_station_exists THEN
        RAISE EXCEPTION 'Station not found';
    END IF;

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

    -- Process sync data (implement your sync logic here)
    -- This is a placeholder for your actual sync logic
    v_sync_result := jsonb_build_object(
        'status', 'success',
        'message', 'Sync completed successfully',
        'timestamp', now()
    );

    -- Update sync status to success
    UPDATE station_sync_status
    SET 
        sync_status = 'SYNCED',
        last_sync_attempt = now(),
        updated_at = now()
    WHERE station_id = p_station_id;

    RETURN v_sync_result;
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

-- Create a function to get sync status
CREATE OR REPLACE FUNCTION get_station_sync_status(
    p_station_id uuid DEFAULT NULL
)
RETURNS TABLE (
    station_id uuid,
    sync_status text,
    last_sync_attempt timestamptz,
    sync_error text,
    created_at timestamptz,
    updated_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ss.station_id,
        ss.sync_status,
        ss.last_sync_attempt,
        ss.sync_error,
        ss.created_at,
        ss.updated_at
    FROM station_sync_status ss
    WHERE 
        (p_station_id IS NULL OR ss.station_id = p_station_id)
    ORDER BY ss.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON station_sync_status TO authenticated;
GRANT EXECUTE ON FUNCTION sync_station_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_station_sync_status TO authenticated;

-- Add RLS policies
ALTER TABLE station_sync_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view sync status"
    ON station_sync_status
    FOR SELECT
    TO authenticated
    USING (true);

-- Add comments
COMMENT ON TABLE station_sync_status IS 'Tracks synchronization status of stations';
COMMENT ON FUNCTION sync_station_data IS 'Handles secure synchronization of station data';
COMMENT ON FUNCTION get_station_sync_status IS 'Retrieves synchronization status of stations'; 