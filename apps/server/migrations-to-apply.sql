-- ================================================
-- MIGRATION: Add missing experience_image columns
-- ================================================

-- Add missing columns to experience_image table
ALTER TABLE "experience_image" 
ADD COLUMN IF NOT EXISTS "imageDescription" text,
ADD COLUMN IF NOT EXISTS "uploadedBy" text,
ADD COLUMN IF NOT EXISTS "experienceFixId" uuid;

-- Add foreign key constraints if they don't exist and the referenced tables exist
DO $$ 
BEGIN
    -- Add user foreign key if user table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user')
       AND NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'experience_image_uploadedBy_user_id_fk'
    ) THEN
        ALTER TABLE "experience_image" 
        ADD CONSTRAINT "experience_image_uploadedBy_user_id_fk" 
        FOREIGN KEY ("uploadedBy") REFERENCES "user"("id") ON DELETE CASCADE;
    END IF;

    -- Add experience_fix foreign key only if experience_fix table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'experience_fix')
       AND NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'experience_image_experienceFixId_experience_fix_id_fk'
    ) THEN
        ALTER TABLE "experience_image" 
        ADD CONSTRAINT "experience_image_experienceFixId_experience_fix_id_fk" 
        FOREIGN KEY ("experienceFixId") REFERENCES "experience_fix"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS "idx_experience_image_uploaded_by" ON "experience_image"("uploadedBy");
CREATE INDEX IF NOT EXISTS "idx_experience_image_experience_fix_id" ON "experience_image"("experienceFixId");

-- ================================================
-- MIGRATION: Add proximity settings to user_settings
-- ================================================

-- Add proximity notification settings to user_settings table
ALTER TABLE "user_settings" 
ADD COLUMN IF NOT EXISTS "proximity_notifications" boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS "proximity_radius" numeric(10,2) DEFAULT 5.0;

-- ================================================
-- MIGRATION: Add geofencing tables
-- ================================================

-- Create geofence_regions table
CREATE TABLE IF NOT EXISTS "geofence_regions" (
	"id" text PRIMARY KEY NOT NULL,
	"experience_id" text NOT NULL,
	"latitude" text NOT NULL,
	"longitude" text NOT NULL,
	"radius" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);

-- Create proximity_notifications table
CREATE TABLE IF NOT EXISTS "proximity_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"region_id" text NOT NULL,
	"experience_id" text NOT NULL,
	"distance" integer NOT NULL,
	"notified" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for geofencing performance
CREATE INDEX IF NOT EXISTS "idx_geofence_regions_experience_id" ON "geofence_regions"("experience_id");
CREATE INDEX IF NOT EXISTS "idx_geofence_regions_active" ON "geofence_regions"("active");
CREATE INDEX IF NOT EXISTS "idx_geofence_regions_coordinates" ON "geofence_regions"("latitude", "longitude");

CREATE INDEX IF NOT EXISTS "idx_proximity_notifications_user_id" ON "proximity_notifications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_proximity_notifications_created_at" ON "proximity_notifications"("created_at");
CREATE INDEX IF NOT EXISTS "idx_proximity_notifications_region_id" ON "proximity_notifications"("region_id");

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Verify the changes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('experience_image', 'user_settings', 'geofence_regions', 'proximity_notifications')
    AND (
        (table_name = 'experience_image' AND column_name IN ('imageDescription', 'uploadedBy', 'experienceFixId'))
        OR (table_name = 'user_settings' AND column_name IN ('proximity_notifications', 'proximity_radius'))
        OR (table_name IN ('geofence_regions', 'proximity_notifications'))
    )
ORDER BY table_name, ordinal_position;

-- Verify indexes were created
SELECT 
    schemaname,
    tablename, 
    indexname
FROM pg_indexes 
WHERE tablename IN ('experience_image', 'geofence_regions', 'proximity_notifications')
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

