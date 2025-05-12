-- Create a table to track station changes
CREATE TABLE IF NOT EXISTS station_changes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    station_id uuid NOT NULL,
    change_type text NOT NULL CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE')),
    changed_at timestamptz DEFAULT now(),
    old_data jsonb,
    new_data jsonb,
    changed_by uuid REFERENCES auth.users(id)
);

-- Create a function to handle station changes
CREATE OR REPLACE FUNCTION handle_station_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO station_changes (station_id, change_type, old_data)
        VALUES (OLD.id, 'DELETE', to_jsonb(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO station_changes (station_id, change_type, old_data, new_data)
        VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO station_changes (station_id, change_type, new_data)
        VALUES (NEW.id, 'INSERT', to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for station changes
DROP TRIGGER IF EXISTS station_changes_trigger ON stations;
CREATE TRIGGER station_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON stations
    FOR EACH ROW
    EXECUTE FUNCTION handle_station_changes();

-- Create a function to get station change history
CREATE OR REPLACE FUNCTION get_station_changes(
    p_station_id uuid DEFAULT NULL,
    p_change_type text DEFAULT NULL,
    p_start_date timestamptz DEFAULT NULL,
    p_end_date timestamptz DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    station_id uuid,
    change_type text,
    changed_at timestamptz,
    old_data jsonb,
    new_data jsonb,
    changed_by uuid
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sc.id,
        sc.station_id,
        sc.change_type,
        sc.changed_at,
        sc.old_data,
        sc.new_data,
        sc.changed_by
    FROM station_changes sc
    WHERE 
        (p_station_id IS NULL OR sc.station_id = p_station_id)
        AND (p_change_type IS NULL OR sc.change_type = p_change_type)
        AND (p_start_date IS NULL OR sc.changed_at >= p_start_date)
        AND (p_end_date IS NULL OR sc.changed_at <= p_end_date)
    ORDER BY sc.changed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON station_changes TO authenticated;
GRANT EXECUTE ON FUNCTION get_station_changes TO authenticated;

-- Add RLS policies for station_changes table
ALTER TABLE station_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view station changes"
    ON station_changes
    FOR SELECT
    TO authenticated
    USING (true);

-- Add comment explaining the purpose
COMMENT ON TABLE station_changes IS 'Tracks all changes made to stations table for synchronization purposes';
COMMENT ON FUNCTION handle_station_changes() IS 'Handles automatic tracking of changes to stations table';
COMMENT ON FUNCTION get_station_changes() IS 'Retrieves the change history for stations with optional filtering'; 