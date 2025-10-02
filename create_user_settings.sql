-- Create default settings for ALL existing users who don't have settings yet
-- This is a one-time script to backfill settings for existing users

INSERT INTO user_settings (
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
  pwa_install_prompt_seen,
  created_at,
  updated_at
)
SELECT 
  u.id as user_id,
  true as email_notifications,
  true as push_notifications, 
  true as issue_updates,
  false as weekly_report,
  true as show_profile,
  true as show_activity,
  true as show_stats,
  'light' as theme,
  'en' as language,
  'satellite-v9' as map_style,
  false as pwa_install_prompt_seen,
  NOW() as created_at,
  NOW() as updated_at
FROM "user" u
WHERE u.id NOT IN (
  SELECT user_id FROM user_settings WHERE user_id IS NOT NULL
);

-- Verify the settings were created
SELECT 
  us.user_id, 
  u.email,
  us.pwa_install_prompt_seen, 
  us.created_at 
FROM user_settings us
JOIN "user" u ON us.user_id = u.id
ORDER BY us.created_at DESC;