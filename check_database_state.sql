-- Check database state after migration

-- 1. Check if experience table exists and has data
SELECT 'experience' as table_name, COUNT(*) as record_count 
FROM experience
UNION ALL
SELECT 'user' as table_name, COUNT(*) as record_count 
FROM "user"
UNION ALL  
SELECT 'category' as table_name, COUNT(*) as record_count
FROM category
UNION ALL
SELECT 'user_settings' as table_name, COUNT(*) as record_count
FROM user_settings;

-- 2. Check for any experiences in detail
SELECT id, title, status, "createdAt" 
FROM experience 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- 3. Check if proximity settings were added correctly
SELECT proximity_notifications, proximity_radius 
FROM user_settings 
LIMIT 3;

-- 4. Verify geofencing tables exist
SELECT COUNT(*) as geofence_regions_count FROM geofence_regions;
SELECT COUNT(*) as proximity_notifications_count FROM proximity_notifications;