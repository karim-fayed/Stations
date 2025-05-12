-- Disable RLS for stations table temporarily
ALTER TABLE stations DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow public read access to stations" ON stations;
DROP POLICY IF EXISTS "Allow authenticated to insert stations" ON stations;
DROP POLICY IF EXISTS "Allow authenticated to update stations" ON stations;
DROP POLICY IF EXISTS "Allow authenticated to delete stations" ON stations;

-- Create a simple policy that allows all operations
CREATE POLICY "Allow all operations on stations"
    ON stations
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Add a comment explaining the temporary nature of this change
COMMENT ON TABLE stations IS 'Temporarily disabled RLS to fix insert issues. Will be re-enabled with proper policies later.'; 