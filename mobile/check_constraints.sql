-- Check foreign key constraints that might prevent deletion
SELECT
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    LEFT JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND (ccu.table_name = 'issues' OR tc.table_name = 'issues');

-- Check if there are any triggers on the issues table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'issues';

-- Simple test to see what happens when we try to delete
-- (Replace 'test-issue-id' with an actual issue ID you want to test)
-- SELECT id, title, reported_by FROM issues WHERE reported_by = 'your-user-id' LIMIT 5;