-- Check existing policies on issues table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'issues';

-- Check if RLS is enabled on issues table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'issues';

-- Enable RLS on issues table if not already enabled
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Create delete policy for issues (users can delete their own issues)
CREATE POLICY "Users can delete their own issues" ON issues
FOR DELETE USING (auth.uid() = reported_by);

-- Create select policy for issues (if not exists)
CREATE POLICY "Anyone can view issues" ON issues
FOR SELECT USING (true);

-- Create insert policy for issues (if not exists)
CREATE POLICY "Authenticated users can create issues" ON issues
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create update policy for issues (users can update their own issues)
CREATE POLICY "Users can update their own issues" ON issues
FOR UPDATE USING (auth.uid() = reported_by);

-- Test delete functionality (replace with actual issue ID and user ID)
-- DELETE FROM issues WHERE id = 'your-issue-id' AND reported_by = 'your-user-id';