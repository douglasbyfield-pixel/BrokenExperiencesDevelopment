-- Debug the upvote deletion issue
-- Check the specific upvote that's not being deleted
SELECT * FROM upvotes WHERE id = 'fdb072cd-ec99-4e86-8a89-80d7a9aa6e4a';

-- Check all upvotes for this issue
SELECT * FROM upvotes WHERE issue_id = 'c6653946-fddd-41fa-8af1-531d75b9b5ca';

-- Check if there are any triggers on upvotes table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'upvotes';

-- Check foreign key constraints
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
    AND tc.table_name = 'upvotes';

-- Test manual deletion (run this to see what happens)
-- DELETE FROM upvotes WHERE id = 'fdb072cd-ec99-4e86-8a89-80d7a9aa6e4a';

-- Check the current count after manual deletion
-- SELECT COUNT(*) FROM upvotes WHERE issue_id = 'c6653946-fddd-41fa-8af1-531d75b9b5ca';