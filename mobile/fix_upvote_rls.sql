-- Fix RLS policies for upvotes table

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'upvotes';

-- Drop all existing upvote policies to start fresh
DROP POLICY IF EXISTS "Anyone can view upvotes" ON upvotes;
DROP POLICY IF EXISTS "Authenticated users can create upvotes" ON upvotes;
DROP POLICY IF EXISTS "Users can delete their own upvotes" ON upvotes;
DROP POLICY IF EXISTS "Authenticated users can manage their upvotes" ON upvotes;

-- Create comprehensive policies for upvotes
-- 1. Allow anyone to view upvotes (needed for counts)
CREATE POLICY "upvotes_select_policy" ON upvotes
FOR SELECT USING (true);

-- 2. Allow authenticated users to insert their own upvotes
CREATE POLICY "upvotes_insert_policy" ON upvotes
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' 
  AND auth.uid() = user_id
);

-- 3. Allow users to delete their own upvotes
CREATE POLICY "upvotes_delete_policy" ON upvotes
FOR DELETE USING (
  auth.role() = 'authenticated' 
  AND auth.uid() = user_id
);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'upvotes'
ORDER BY policyname;

-- Test deletion manually (replace with actual IDs to test)
-- DELETE FROM upvotes WHERE id = '1999172d-87fe-4893-a4cc-c2b718ffbcb0' AND user_id = '81356ea9-1bb0-4858-a1f7-0381df7d2889';