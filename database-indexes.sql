-- Database Performance Indexes for Map Loading
-- Run these in your Supabase SQL Editor

-- Indexes for experience table (most important for map queries)
CREATE INDEX IF NOT EXISTS idx_experience_latitude ON experience (latitude);
CREATE INDEX IF NOT EXISTS idx_experience_longitude ON experience (longitude);
CREATE INDEX IF NOT EXISTS idx_experience_created_at ON experience ("createdAt");
CREATE INDEX IF NOT EXISTS idx_experience_reported_by ON experience ("reportedBy");
CREATE INDEX IF NOT EXISTS idx_experience_category_id ON experience ("categoryId");
CREATE INDEX IF NOT EXISTS idx_experience_status ON experience (status);
CREATE INDEX IF NOT EXISTS idx_experience_priority ON experience (priority);

-- Composite index for map queries (latitude + longitude together)
CREATE INDEX IF NOT EXISTS idx_experience_location ON experience (latitude, longitude);

-- Index for experience_image table
CREATE INDEX IF NOT EXISTS idx_experience_image_experience_id ON experience_image ("experienceId");

-- Index for vote table
CREATE INDEX IF NOT EXISTS idx_vote_experience_id ON vote ("experienceId");
CREATE INDEX IF NOT EXISTS idx_vote_user_id ON vote ("userId");

-- Index for user table
CREATE INDEX IF NOT EXISTS idx_user_id ON "user" (id);

-- Index for category table
CREATE INDEX IF NOT EXISTS idx_category_id ON category (id);
