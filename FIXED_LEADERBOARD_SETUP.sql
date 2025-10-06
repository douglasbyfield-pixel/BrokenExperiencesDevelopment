-- Fixed Leaderboard Setup with Proper Type Casting

-- 1) The award_points function
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_activity_type TEXT,
  p_points INTEGER
) RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- ensure row exists
  INSERT INTO activity_points (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  CASE p_activity_type
    WHEN 'add_experience' THEN
      UPDATE activity_points
      SET experiences_added = experiences_added + 1,
          total_points      = total_points + COALESCE(p_points, 0),
          updated_at        = NOW()
      WHERE user_id = p_user_id;

    WHEN 'fix_experience' THEN
      UPDATE activity_points
      SET experiences_fixed = experiences_fixed + 1,
          total_points      = total_points + COALESCE(p_points, 0),
          updated_at        = NOW()
      WHERE user_id = p_user_id;

    WHEN 'verify_experience' THEN
      UPDATE activity_points
      SET experiences_verified = experiences_verified + 1,
          total_points         = total_points + COALESCE(p_points, 0),
          updated_at           = NOW()
      WHERE user_id = p_user_id;

    WHEN 'sponsor_experience' THEN
      UPDATE activity_points
      SET experiences_sponsored = experiences_sponsored + 1,
          total_points           = total_points + COALESCE(p_points, 0),
          updated_at             = NOW()
      WHERE user_id = p_user_id;

    ELSE
      RAISE EXCEPTION 'Unsupported activity type: %', p_activity_type;
  END CASE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.award_points(UUID, TEXT, INTEGER) TO anon, authenticated, service_role;

-- 2) Fixed trigger function for experience creation
CREATE OR REPLACE FUNCTION public.trg_award_on_experience_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_points_per_added INTEGER := 10;
  v_user_id UUID;
BEGIN
  -- Check if reportedBy is a valid UUID
  IF NEW."reportedBy" IS NOT NULL 
     AND NEW."reportedBy" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' 
  THEN
    -- Convert to UUID
    v_user_id := NEW."reportedBy"::uuid;
    
    -- Verify user exists in auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
      -- Award points using the public schema function
      PERFORM public.award_points(v_user_id, 'add_experience'::text, v_points_per_added);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS experience_award_insert ON experience;
CREATE TRIGGER experience_award_insert
AFTER INSERT ON experience
FOR EACH ROW
EXECUTE FUNCTION public.trg_award_on_experience_insert();

-- 3) Initialize points for existing users based on their current experiences
INSERT INTO activity_points (user_id, experiences_added, total_points)
SELECT 
    "reportedBy"::uuid as user_id,
    COUNT(*) as experiences_added,
    COUNT(*) * 10 as total_points
FROM experience
WHERE "reportedBy" IS NOT NULL 
    AND "reportedBy" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = "reportedBy"::uuid)
GROUP BY "reportedBy"
ON CONFLICT (user_id) DO UPDATE
SET 
    experiences_added = activity_points.experiences_added + EXCLUDED.experiences_added,
    total_points = activity_points.total_points + EXCLUDED.total_points,
    updated_at = NOW();

-- 4) Create a comprehensive leaderboard view (FIXED TYPE CASTING)
CREATE OR REPLACE VIEW public.leaderboard_display AS
WITH user_stats AS (
  SELECT 
    ap.user_id,
    ap.total_points,
    ap.experiences_added,
    ap.experiences_fixed,
    ap.experiences_verified,
    ap.experiences_sponsored,
    -- Get user name from multiple sources with fallbacks
    COALESCE(
      up.display_name, 
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      u.email,
      'Anonymous User'
    ) as name,
    COALESCE(
      up.avatar_url,
      u.raw_user_meta_data->>'avatar_url',
      u.raw_user_meta_data->>'picture'
    ) as avatar,
    FLOOR(ap.total_points::numeric / 100) + 1 as level
  FROM activity_points ap
  LEFT JOIN user_profile up ON ap.user_id::text = up.auth_user_id  -- FIXED: Cast UUID to text
  LEFT JOIN auth.users u ON ap.user_id = u.id
)
SELECT 
  *,
  RANK() OVER (ORDER BY total_points DESC) as rank,
  COUNT(*) OVER () as total_users
FROM user_stats
ORDER BY total_points DESC;

-- Grant select on the view
GRANT SELECT ON public.leaderboard_display TO anon, authenticated;

-- 5) Function to get specific user's leaderboard stats
CREATE OR REPLACE FUNCTION public.get_user_leaderboard_stats(p_user_id UUID)
RETURNS TABLE (
  rank BIGINT,
  total_users BIGINT,
  current_points INTEGER,
  current_level INTEGER,
  points_to_next_level INTEGER,
  name TEXT,
  avatar TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ld.rank,
    ld.total_users,
    ld.total_points as current_points,
    ld.level::INTEGER as current_level,
    ((ld.level::INTEGER * 100) - ld.total_points) as points_to_next_level,
    ld.name,
    ld.avatar
  FROM public.leaderboard_display ld
  WHERE ld.user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_leaderboard_stats(UUID) TO anon, authenticated;

-- 6) Community stats function
CREATE OR REPLACE FUNCTION public.get_community_stats()
RETURNS TABLE (
  total_reports BIGINT,
  resolved_count BIGINT,
  active_contributors BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    (SELECT COUNT(*) FROM experience)::BIGINT as total_reports,
    (SELECT COUNT(*) FROM experience WHERE status = 'resolved')::BIGINT as resolved_count,
    (SELECT COUNT(*) FROM activity_points WHERE total_points > 0)::BIGINT as active_contributors;
$$;

GRANT EXECUTE ON FUNCTION public.get_community_stats() TO anon, authenticated;

-- 7) Trending categories function
CREATE OR REPLACE FUNCTION public.get_trending_categories(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  category_name TEXT,
  report_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    c.name as category_name,
    COUNT(e.id)::BIGINT as report_count
  FROM experience e
  JOIN category c ON e.category_id = c.id
  WHERE e.created_at >= NOW() - INTERVAL '1 day' * days_back
  GROUP BY c.id, c.name
  ORDER BY report_count DESC
  LIMIT 5;
$$;

GRANT EXECUTE ON FUNCTION public.get_trending_categories(INTEGER) TO anon, authenticated;

-- 8) Test queries to verify setup
-- Check the leaderboard view
SELECT * FROM public.leaderboard_display LIMIT 10;

-- Get specific user stats (replace with actual user ID)
-- SELECT * FROM public.get_user_leaderboard_stats('your-user-id-here'::uuid);

-- Get community stats
SELECT * FROM public.get_community_stats();

-- Get trending categories
SELECT * FROM public.get_trending_categories(30);