-- Simple database diagnostic

-- Check if experience table has any records
SELECT COUNT(*) as experience_count FROM experience;

-- Check if user table has any records  
SELECT COUNT(*) as user_count FROM "user";

-- Check if categories exist
SELECT COUNT(*) as category_count FROM category;

-- If experiences exist, show a sample
SELECT id, title, status 
FROM experience 
LIMIT 3;

-- Show column names in experience table to verify structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'experience' 
ORDER BY ordinal_position;