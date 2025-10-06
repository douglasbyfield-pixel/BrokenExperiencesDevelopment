-- Database Inspection Queries
-- Run these to check your database structure

-- 1. List all tables in public schema
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check activity_points table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'activity_points' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check user_profile table structure  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profile' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check if there's data in activity_points
SELECT COUNT(*) as activity_points_count FROM activity_points;

-- 5. Check if there's data in user_profile
SELECT COUNT(*) as user_profile_count FROM user_profile;

-- 6. View sample data from activity_points (if any)
SELECT * FROM activity_points LIMIT 5;

-- 7. View sample data from user_profile (if any)
SELECT * FROM user_profile LIMIT 5;

-- 8. Check for foreign key constraints that might be causing issues
SELECT
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public' 
    AND (tc.table_name = 'activity_points' OR tc.table_name = 'user_profile');

-- 9. Check indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND (tablename = 'activity_points' OR tablename = 'user_profile')
ORDER BY tablename, indexname;