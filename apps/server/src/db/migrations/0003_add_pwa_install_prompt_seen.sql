-- Add pwa_install_prompt_seen column to user_settings table
ALTER TABLE user_settings 
ADD COLUMN pwa_install_prompt_seen BOOLEAN DEFAULT false;