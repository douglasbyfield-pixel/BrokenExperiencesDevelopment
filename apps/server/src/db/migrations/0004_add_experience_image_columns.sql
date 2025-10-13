-- Add missing columns to experience_image table
ALTER TABLE "experience_image" 
ADD COLUMN IF NOT EXISTS "imageDescription" text,
ADD COLUMN IF NOT EXISTS "uploadedBy" text REFERENCES "user"("id") ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS "experienceFixId" uuid REFERENCES "experience_fix"("id") ON DELETE CASCADE;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS "idx_experience_image_uploaded_by" ON "experience_image"("uploadedBy");
CREATE INDEX IF NOT EXISTS "idx_experience_image_experience_fix_id" ON "experience_image"("experienceFixId");

