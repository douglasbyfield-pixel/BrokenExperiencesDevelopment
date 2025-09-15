-- Check if there's an enum type for issue_category
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%category%' OR t.typname LIKE '%issue%'
ORDER BY t.typname, e.enumsortorder;

-- Check the column definition for issues.category
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'issues' 
AND column_name = 'category';

-- Check existing category values in the issues table
SELECT 
    category,
    COUNT(*) as count
FROM issues 
GROUP BY category 
ORDER BY count DESC;

-- Check the table structure for issues
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'issues' 
ORDER BY ordinal_position;

-- Check if there are any constraints on the category column
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'issues' 
AND tc.constraint_type = 'CHECK'
AND cc.check_clause LIKE '%category%';