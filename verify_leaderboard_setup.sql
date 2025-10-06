-- SQL Commands to Verify Leaderboard Setup

-- 1. Check if activity_points table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'activity_points'
) AS table_exists;

-- 2. If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS activity_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    experiences_added INTEGER DEFAULT 0,
    experiences_fixed INTEGER DEFAULT 0,
    experiences_verified INTEGER DEFAULT 0,
    experiences_sponsored INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'activity_points'
ORDER BY ordinal_position;

-- 4. Check if any data exists
SELECT COUNT(*) as row_count FROM activity_points;

-- 5. View existing data (if any)
SELECT * FROM activity_points LIMIT 10;

-- 6. Insert test data with real user IDs from your auth.users table
-- First, see what users exist
SELECT id, email FROM auth.users LIMIT 5;

-- 7. Insert sample data for testing (replace user_id with actual IDs from above)
-- Example:
/*
INSERT INTO activity_points (user_id, experiences_added, experiences_fixed, experiences_verified, experiences_sponsored, total_points)
VALUES 
    ('YOUR-USER-ID-HERE', 10, 5, 3, 1, 300)
ON CONFLICT (user_id) DO UPDATE
SET 
    experiences_added = EXCLUDED.experiences_added,
    experiences_fixed = EXCLUDED.experiences_fixed,
    experiences_verified = EXCLUDED.experiences_verified,
    experiences_sponsored = EXCLUDED.experiences_sponsored,
    total_points = EXCLUDED.total_points,
    updated_at = NOW();
*/

-- 8. Test the leaderboard query that your backend uses
SELECT * FROM activity_points 
ORDER BY total_points DESC 
LIMIT 10;