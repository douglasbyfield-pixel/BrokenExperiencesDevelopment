-- Fix User Creation Triggers for Auth Flow
-- This script ensures all necessary records are created when a new user signs up

-- 1. First, check and fix the user_settings table structure
-- Add any missing columns
DO $$
BEGIN
    -- Check if pwa_install_prompt_seen column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_settings' 
        AND column_name = 'pwa_install_prompt_seen'
    ) THEN
        ALTER TABLE user_settings ADD COLUMN pwa_install_prompt_seen BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Drop existing trigger to recreate it properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_settings() CASCADE;

-- 3. Create improved function that handles both user_settings and activity_points
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user settings with error handling
    BEGIN
        INSERT INTO public.user_settings (
            user_id,
            email_notifications,
            push_notifications,
            issue_updates,
            weekly_report,
            show_profile,
            show_activity,
            show_stats,
            theme,
            language,
            map_style,
            pwa_install_prompt_seen
        ) VALUES (
            NEW.id,
            true,
            true,
            true,
            false,
            true,
            true,
            true,
            'light',
            'en',
            'satellite-v9',
            false
        )
        ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Failed to create user_settings for user %: %', NEW.id, SQLERRM;
    END;

    -- Create activity points entry for leaderboard
    BEGIN
        INSERT INTO public.activity_points (
            user_id,
            experiences_added,
            experiences_fixed,
            experiences_verified,
            experiences_sponsored,
            total_points
        ) VALUES (
            NEW.id,
            0,
            0,
            0,
            0,
            0
        )
        ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Failed to create activity_points for user %: %', NEW.id, SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- 6. Ensure RLS policies are correct
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;

-- Recreate policies
CREATE POLICY "Users can view their own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Add RLS policies for activity_points if not exists
ALTER TABLE activity_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all activity points" ON activity_points;
DROP POLICY IF EXISTS "System can manage activity points" ON activity_points;

CREATE POLICY "Users can view all activity points" ON activity_points
    FOR SELECT USING (true);

CREATE POLICY "System can manage activity points" ON activity_points
    FOR ALL USING (auth.role() = 'service_role');

-- 8. Fix any existing users who might be missing these records
-- Create user_settings for users who don't have them
INSERT INTO user_settings (user_id)
SELECT id FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_settings us WHERE us.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Create activity_points for users who don't have them
INSERT INTO activity_points (user_id, total_points)
SELECT id, 0 FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM activity_points ap WHERE ap.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- 9. Verify the setup
SELECT 
    'Users without settings' as check_type,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN user_settings us ON u.id = us.user_id
WHERE us.id IS NULL

UNION ALL

SELECT 
    'Users without activity_points' as check_type,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN activity_points ap ON u.id = ap.user_id
WHERE ap.id IS NULL;