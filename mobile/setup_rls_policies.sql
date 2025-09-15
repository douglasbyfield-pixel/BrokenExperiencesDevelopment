-- Enable RLS on upvotes and comments tables if not already enabled
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view upvotes" ON upvotes;
DROP POLICY IF EXISTS "Authenticated users can manage their upvotes" ON upvotes;
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- UPVOTES policies
-- Allow anyone to view upvotes (needed for counts)
CREATE POLICY "Anyone can view upvotes" ON upvotes
FOR SELECT USING (true);

-- Allow authenticated users to insert their own upvotes
CREATE POLICY "Authenticated users can create upvotes" ON upvotes
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Allow users to delete their own upvotes
CREATE POLICY "Users can delete their own upvotes" ON upvotes
FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS policies
-- Allow anyone to view comments
CREATE POLICY "Anyone can view comments" ON comments
FOR SELECT USING (true);

-- Allow authenticated users to create comments
CREATE POLICY "Authenticated users can create comments" ON comments
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments" ON comments
FOR UPDATE USING (auth.uid() = author_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments" ON comments
FOR DELETE USING (auth.uid() = author_id);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('upvotes', 'comments')
ORDER BY tablename, policyname;