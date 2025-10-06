-- Leaderboard SQL Setup Commands
-- Run these commands to set up the necessary tables and data for the leaderboard

-- 1. First, ensure the activity_points table exists (if not already created)
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

-- 2. Create index for better performance
CREATE INDEX idx_activity_points_total_points ON activity_points(total_points DESC);
CREATE INDEX idx_activity_points_user_id ON activity_points(user_id);

-- 3. Insert sample data for testing (replace user IDs with actual Supabase auth user IDs)
-- You can get user IDs from the auth.users table

-- Example: Insert activity points for existing users
-- First, let's see what users exist in your system
-- SELECT id, email FROM auth.users LIMIT 5;

-- Then insert activity data (replace the user_id values with actual IDs from above query)
INSERT INTO activity_points (user_id, experiences_added, experiences_fixed, experiences_verified, experiences_sponsored, total_points)
VALUES 
    -- User 1: Sarah Johnson (top scorer)
    ('user-id-1', 50, 30, 25, 10, 1500),
    -- User 2: Mike Chen 
    ('user-id-2', 45, 28, 22, 8, 1490),
    -- User 3: Emma Davis
    ('user-id-3', 48, 25, 20, 7, 1480),
    -- User 4: Alex Rodriguez
    ('user-id-4', 42, 27, 18, 8, 1470)
ON CONFLICT (user_id) DO UPDATE
SET 
    experiences_added = EXCLUDED.experiences_added,
    experiences_fixed = EXCLUDED.experiences_fixed,
    experiences_verified = EXCLUDED.experiences_verified,
    experiences_sponsored = EXCLUDED.experiences_sponsored,
    total_points = EXCLUDED.total_points,
    updated_at = NOW();

-- 4. Create a view for leaderboard with user info (optional but helpful)
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    ap.user_id,
    ap.total_points,
    ap.experiences_added,
    ap.experiences_fixed,
    ap.experiences_verified,
    ap.experiences_sponsored,
    up.display_name,
    up.handle,
    up.avatar_url,
    up.level,
    u.email,
    RANK() OVER (ORDER BY ap.total_points DESC) as rank
FROM activity_points ap
LEFT JOIN user_profile up ON ap.user_id = up.auth_user_id
LEFT JOIN auth.users u ON ap.user_id = u.id
ORDER BY ap.total_points DESC;

-- 5. Function to award points (useful for backend)
CREATE OR REPLACE FUNCTION award_points(
    p_user_id UUID,
    p_activity_type TEXT,
    p_points INTEGER
) RETURNS VOID AS $$
BEGIN
    CASE p_activity_type
        WHEN 'add_experience' THEN
            INSERT INTO activity_points (user_id, experiences_added, total_points)
            VALUES (p_user_id, 1, p_points)
            ON CONFLICT (user_id) DO UPDATE
            SET 
                experiences_added = activity_points.experiences_added + 1,
                total_points = activity_points.total_points + p_points,
                updated_at = NOW();
                
        WHEN 'fix_experience' THEN
            INSERT INTO activity_points (user_id, experiences_fixed, total_points)
            VALUES (p_user_id, 1, p_points)
            ON CONFLICT (user_id) DO UPDATE
            SET 
                experiences_fixed = activity_points.experiences_fixed + 1,
                total_points = activity_points.total_points + p_points,
                updated_at = NOW();
                
        WHEN 'verify_experience' THEN
            INSERT INTO activity_points (user_id, experiences_verified, total_points)
            VALUES (p_user_id, 1, p_points)
            ON CONFLICT (user_id) DO UPDATE
            SET 
                experiences_verified = activity_points.experiences_verified + 1,
                total_points = activity_points.total_points + p_points,
                updated_at = NOW();
                
        WHEN 'sponsor_experience' THEN
            INSERT INTO activity_points (user_id, experiences_sponsored, total_points)
            VALUES (p_user_id, 1, p_points)
            ON CONFLICT (user_id) DO UPDATE
            SET 
                experiences_sponsored = activity_points.experiences_sponsored + 1,
                total_points = activity_points.total_points + p_points,
                updated_at = NOW();
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to get user rank and stats
CREATE OR REPLACE FUNCTION get_user_rank_stats(p_user_id UUID)
RETURNS TABLE (
    rank BIGINT,
    total_users BIGINT,
    current_points INTEGER,
    current_level INTEGER,
    next_level_points INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH user_rank AS (
        SELECT 
            RANK() OVER (ORDER BY total_points DESC) as user_rank,
            total_points
        FROM activity_points
    ),
    total_count AS (
        SELECT COUNT(*) as total FROM activity_points
    )
    SELECT 
        ur.user_rank,
        tc.total,
        ap.total_points,
        FLOOR(ap.total_points / 100) + 1 as current_level,
        ((FLOOR(ap.total_points / 100) + 2) * 100) as next_level_points
    FROM activity_points ap
    JOIN user_rank ur ON ap.total_points = ur.total_points
    CROSS JOIN total_count tc
    WHERE ap.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Queries to get data for different leaderboard views

-- Overall Leaderboard
SELECT 
    ap.user_id,
    COALESCE(up.display_name, u.email, 'Anonymous') as name,
    up.avatar_url,
    ap.total_points,
    FLOOR(ap.total_points / 100) + 1 as level,
    ap.experiences_added,
    ap.experiences_fixed,
    ap.experiences_verified,
    ap.experiences_sponsored
FROM activity_points ap
LEFT JOIN user_profile up ON ap.user_id = up.auth_user_id
LEFT JOIN auth.users u ON ap.user_id = u.id
ORDER BY ap.total_points DESC
LIMIT 10;

-- Experience Reporters Leaderboard
SELECT 
    ap.user_id,
    COALESCE(up.display_name, u.email, 'Anonymous') as name,
    up.avatar_url,
    ap.total_points,
    ap.experiences_added as count
FROM activity_points ap
LEFT JOIN user_profile up ON ap.user_id = up.auth_user_id
LEFT JOIN auth.users u ON ap.user_id = u.id
WHERE ap.experiences_added > 0
ORDER BY ap.experiences_added DESC
LIMIT 10;

-- Problem Solvers Leaderboard
SELECT 
    ap.user_id,
    COALESCE(up.display_name, u.email, 'Anonymous') as name,
    up.avatar_url,
    ap.total_points,
    ap.experiences_fixed as count
FROM activity_points ap
LEFT JOIN user_profile up ON ap.user_id = up.auth_user_id
LEFT JOIN auth.users u ON ap.user_id = u.id
WHERE ap.experiences_fixed > 0
ORDER BY ap.experiences_fixed DESC
LIMIT 10;

-- 8. Example: Award points when a user adds an experience
-- Call this after a user creates an experience
SELECT award_points('user-id-here', 'add_experience', 10);

-- 9. Get current user's rank and progress
SELECT * FROM get_user_rank_stats('user-id-here');

-- 10. Community Stats Queries

-- Total Reports
SELECT COUNT(*) as total_reports FROM experience;

-- Resolved Count
SELECT COUNT(*) as resolved FROM experience WHERE status = 'resolved';

-- Active Contributors (users who have any points)
SELECT COUNT(DISTINCT user_id) as active_contributors FROM activity_points WHERE total_points > 0;

-- Trending Categories (top categories by recent activity)
SELECT 
    c.name as category_name,
    COUNT(e.id) as report_count
FROM experience e
JOIN category c ON e.category_id = c.id
WHERE e.created_at >= NOW() - INTERVAL '30 days'
GROUP BY c.id, c.name
ORDER BY report_count DESC
LIMIT 5;