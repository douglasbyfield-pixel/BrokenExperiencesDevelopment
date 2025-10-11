-- Fix duplicate claims issue
-- Run this in Supabase SQL Editor

-- Step 1: Check current duplicates
SELECT "experienceId", "claimedBy", COUNT(*) 
FROM experience_fix 
GROUP BY "experienceId", "claimedBy" 
HAVING COUNT(*) > 1;

-- Step 2: Remove duplicate records (keep the earliest one)
DELETE FROM experience_fix 
WHERE id IN (
    SELECT id
    FROM (
        SELECT id, 
               ROW_NUMBER() OVER (
                   PARTITION BY "experienceId", "claimedBy" 
                   ORDER BY "createdAt" ASC
               ) as row_num
        FROM experience_fix
    ) t 
    WHERE t.row_num > 1
);

-- Step 3: Verify the constraint exists (should show the constraint)
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'experience_fix'::regclass 
AND conname = 'unique_user_experience_fix';