# Supabase Setup for Station Noor

This document explains how to configure your Supabase database to resolve the "DELETE requires a WHERE clause" error and improve overall performance.

## Issue Description

The application shows this error when adding stations:
```
DELETE requires a WHERE clause
```

This error occurs because:
- The Row Level Security (RLS) policies are configured incorrectly
- The application is trying to perform operations that require elevated privileges
- Despite the error mentioning DELETE, it's happening on INSERT operations

## Solution: SQL Functions with SECURITY DEFINER

To bypass RLS restrictions for administrative operations, we'll create SQL functions with the `SECURITY DEFINER` attribute, which makes them run with the permissions of the database owner.

## Implementation Steps

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the `supabase_sql_functions.sql` file
5. Execute the query

### The SQL Functions

The file contains three key functions:

1. `insert_station(station_data JSONB)` - Securely adds new stations
2. `delete_station(station_id UUID)` - Securely deletes stations
3. `update_station(station_id UUID, station_data JSONB)` - Securely updates stations

These functions are designed to:
- Run with elevated privileges (bypassing RLS)
- Accept parameters in a safe way to prevent SQL injection
- Return appropriate data when needed

## Testing the Implementation

After implementing these functions, test them by:

1. Logging into the admin dashboard
2. Attempting to add a new station
3. Verifying that no errors occur
4. Checking that the station was added successfully

## Troubleshooting

If you still encounter errors:

1. Check the browser console for specific error messages
2. Verify that the functions were created correctly in Supabase
3. Make sure the authenticated users have EXECUTE permissions on these functions
4. Examine the RLS policies for the stations table to understand the underlying issue

## Additional RLS Policy Recommendations

If you want to improve your RLS policies directly (in addition to these functions):

```sql
-- Example RLS policy for station reads (everyone can read)
CREATE POLICY "Stations are viewable by everyone" ON stations
  FOR SELECT USING (true);

-- Example RLS policy for station inserts (only authenticated users)
CREATE POLICY "Authenticated users can insert stations" ON stations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Example RLS policy for station updates (only authenticated users)
CREATE POLICY "Authenticated users can update stations" ON stations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Example RLS policy for station deletes (only authenticated users)
CREATE POLICY "Authenticated users can delete stations" ON stations
  FOR DELETE USING (auth.role() = 'authenticated');
```

## Contact

If you encounter any issues implementing these changes, please contact the system administrator for assistance.
