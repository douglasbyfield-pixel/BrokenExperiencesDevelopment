-- Check what values are actually in the category column currently
SELECT DISTINCT category FROM issues;

-- Try to insert a test record with road_maintenance to see the exact error
INSERT INTO issues (
    title, 
    description, 
    category, 
    priority, 
    latitude, 
    longitude, 
    address
) VALUES (
    'Test Road Issue', 
    'Testing road_maintenance category', 
    'road_maintenance', 
    'medium',
    18.1096, 
    -77.2975, 
    'Kingston, Jamaica'
);

-- Check if there are any triggers or functions that might be causing this
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'issues';

-- Check if there's a user-defined type
SELECT 
    n.nspname AS schema_name,
    t.typname AS type_name,
    t.typcategory,
    t.typtype
FROM pg_type t
LEFT JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname LIKE '%category%' OR t.typname LIKE '%issue%'
ORDER BY schema_name, type_name;