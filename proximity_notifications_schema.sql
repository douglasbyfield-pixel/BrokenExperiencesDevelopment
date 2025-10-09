-- Add proximity-based notification tables for Broken Experiences app
-- This SQL file creates the necessary tables for location tracking and notification logging

-- 1. Push Subscriptions Table (for Web Push notifications)
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- 2. User Locations Table (for proximity-based notifications)
CREATE TABLE IF NOT EXISTS user_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    accuracy DECIMAL(10, 2), -- GPS accuracy in meters
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- One location per user (updates replace previous)
);

-- Spatial index for efficient proximity queries
CREATE INDEX IF NOT EXISTS idx_user_locations_coordinates ON user_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_last_updated ON user_locations(last_updated);

-- 3. Notification Logs Table (for tracking sent notifications)
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('proximity', 'status_update', 'broadcast', 'weekly_digest')),
    experience_id UUID REFERENCES experiences(id) ON DELETE SET NULL,
    recipients_count INTEGER DEFAULT 0,
    proximity_radius DECIMAL(10, 2), -- For proximity notifications only
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics and monitoring
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_experience_id ON notification_logs(experience_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);

-- 4. Add proximity notification settings to user_settings table
-- First check if the table exists and has the right structure
DO $$
BEGIN
    -- Add proximity_notifications column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_settings' 
        AND column_name = 'proximity_notifications'
    ) THEN
        ALTER TABLE user_settings ADD COLUMN proximity_notifications BOOLEAN DEFAULT true;
    END IF;
    
    -- Add proximity_radius column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_settings' 
        AND column_name = 'proximity_radius'
    ) THEN
        ALTER TABLE user_settings ADD COLUMN proximity_radius DECIMAL(10, 2) DEFAULT 5.0; -- Default 5km
    END IF;
END
$$;

-- 5. Enable Row Level Security (RLS) for privacy
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_locations  
CREATE POLICY "Users can manage their own location" ON user_locations
    FOR ALL USING (auth.uid() = user_id);

-- Service role can read locations for proximity calculations
CREATE POLICY "Service role can read all locations" ON user_locations
    FOR SELECT USING (auth.role() = 'service_role');

-- RLS Policies for notification_logs (admin only)
CREATE POLICY "Admin can manage notification logs" ON notification_logs
    FOR ALL USING (auth.role() = 'service_role');

-- 6. Functions for proximity calculations (optional - can use app logic instead)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lng1 DECIMAL, 
    lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    -- Haversine formula for calculating distance between two points
    RETURN (
        6371 * acos(
            cos(radians(lat1)) * cos(radians(lat2)) * 
            cos(radians(lng2) - radians(lng1)) + 
            sin(radians(lat1)) * sin(radians(lat2))
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to find users within proximity of a location
CREATE OR REPLACE FUNCTION find_nearby_users(
    target_lat DECIMAL, 
    target_lng DECIMAL, 
    radius_km DECIMAL DEFAULT 5.0
) RETURNS TABLE (
    user_id UUID,
    distance_km DECIMAL,
    latitude DECIMAL,
    longitude DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ul.user_id,
        calculate_distance(target_lat, target_lng, ul.latitude, ul.longitude) as distance_km,
        ul.latitude,
        ul.longitude
    FROM user_locations ul
    INNER JOIN user_settings us ON ul.user_id = us.user_id
    WHERE 
        us.notifications_enabled = true 
        AND us.proximity_notifications = true
        AND calculate_distance(target_lat, target_lng, ul.latitude, ul.longitude) <= radius_km
        AND ul.last_updated > NOW() - INTERVAL '7 days' -- Only active users
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

-- Comments for documentation
COMMENT ON TABLE push_subscriptions IS 'Stores Web Push notification subscriptions for users';
COMMENT ON TABLE user_locations IS 'Stores user location data for proximity-based notifications';
COMMENT ON TABLE notification_logs IS 'Logs all sent notifications for analytics and monitoring';
COMMENT ON FUNCTION calculate_distance IS 'Calculates distance between two geographic points using Haversine formula';
COMMENT ON FUNCTION find_nearby_users IS 'Finds users within a specified radius of a target location';