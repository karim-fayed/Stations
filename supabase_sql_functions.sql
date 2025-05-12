-- SQL functions to implement in your Supabase database
-- These will help bypass RLS policies for administrative operations

-- Function to safely insert a station
CREATE OR REPLACE FUNCTION public.insert_station(
    station_data JSONB
) RETURNS SETOF stations AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public.stations (
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
        (station_data->>'latitude')::numeric,
        (station_data->>'longitude')::numeric,
        station_data->>'fuel_types',
        station_data->>'additional_info'
    )
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely delete a station
CREATE OR REPLACE FUNCTION public.delete_station(
    station_id UUID
) RETURNS void AS $$
BEGIN
    DELETE FROM public.stations
    WHERE id = station_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely update a station
CREATE OR REPLACE FUNCTION public.update_station(
    station_id UUID,
    station_data JSONB
) RETURNS SETOF stations AS $$
BEGIN
    RETURN QUERY
    UPDATE public.stations SET
        name = COALESCE(station_data->>'name', name),
        region = COALESCE(station_data->>'region', region),
        sub_region = COALESCE(station_data->>'sub_region', sub_region),
        latitude = COALESCE((station_data->>'latitude')::numeric, latitude),
        longitude = COALESCE((station_data->>'longitude')::numeric, longitude),
        fuel_types = COALESCE(station_data->>'fuel_types', fuel_types),
        additional_info = COALESCE(station_data->>'additional_info', additional_info),
        updated_at = now()
    WHERE id = station_id
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- IMPORTANT: Make these functions accessible to authenticated users
-- Run these commands to grant execute permission:

GRANT EXECUTE ON FUNCTION public.insert_station(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_station(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_station(UUID, JSONB) TO authenticated;

-- NOTE: The SECURITY DEFINER tag is crucial - it makes the function run with the 
-- permissions of the function creator (typically the database owner), bypassing RLS.
