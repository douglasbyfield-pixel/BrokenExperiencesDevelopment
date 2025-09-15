-- Check RLS policies for upvotes and comments tables
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('upvotes', 'comments', 'issues')
ORDER BY tablename, policyname;

-- Check if RLS is enabled on these tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('upvotes', 'comments', 'issues');

-- Test queries to see what data is accessible
-- SELECT COUNT(*) FROM upvotes;
-- SELECT COUNT(*) FROM comments;
-- SELECT issue_id, COUNT(*) as upvote_count FROM upvotes GROUP BY issue_id LIMIT 5;
-- SELECT issue_id, COUNT(*) as comment_count FROM comments GROUP BY issue_id LIMIT 5;