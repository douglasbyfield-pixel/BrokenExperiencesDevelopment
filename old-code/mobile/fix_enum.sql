-- First, check what values are currently in the issue_category enum
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'issue_category'
ORDER BY e.enumsortorder;

-- Option 1: Add 'road_maintenance' to the existing enum
-- Only run this if road_maintenance is not already in the enum
ALTER TYPE issue_category ADD VALUE 'road_maintenance';

-- Option 2: If you want to see all enum types related to issues
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%issue%' OR t.typname LIKE '%category%'
ORDER BY t.typname, e.enumsortorder;