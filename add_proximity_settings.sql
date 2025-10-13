-- Add proximity notification settings to user_settings table
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS proximity_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS proximity_radius NUMERIC(10,2) DEFAULT 5.0;