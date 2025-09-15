-- Step 1: Check existing policies on issues table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'issues';

-- Step 2: Check if RLS is enabled on issues table (fixed query)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'issues';

-- Step 3: Enable RLS on issues table if not already enabled
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can delete their own issues" ON issues;
DROP POLICY IF EXISTS "Anyone can view issues" ON issues;
DROP POLICY IF EXISTS "Authenticated users can create issues" ON issues;
DROP POLICY IF EXISTS "Users can update their own issues" ON issues;

-- Step 5: Create new policies
-- Allow anyone to view issues
CREATE POLICY "Anyone can view issues" ON issues
FOR SELECT USING (true);

-- Allow authenticated users to create issues
CREATE POLICY "Authenticated users can create issues" ON issues
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own issues
CREATE POLICY "Users can update their own issues" ON issues
FOR UPDATE USING (auth.uid() = reported_by)
WITH CHECK (auth.uid() = reported_by);

-- Allow users to delete their own issues
CREATE POLICY "Users can delete their own issues" ON issues
FOR DELETE USING (auth.uid() = reported_by);

-- Step 6: Test query to see if policies work
-- SELECT id, title, reported_by FROM issues WHERE reported_by = auth.uid() LIMIT 3;