-- Fix for the update_station function to match the expected parameter names in the code

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.update_station(UUID, JSONB);

-- Create the function with the correct parameter names
CREATE OR REPLACE FUNCTION public.update_station(
    p_station_id UUID,
    p_station_data JSONB
) RETURNS SETOF stations AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_station(UUID, JSONB) TO authenticated;

-- NOTE: The SECURITY DEFINER tag is crucial - it makes the function run with the 
-- permissions of the function creator (typically the database owner), bypassing RLS.
