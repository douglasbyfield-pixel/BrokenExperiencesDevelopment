# Database Migrations - Fix Production Errors

## Issue
The production database is missing columns in the `experience_image` table and the geofencing tables, causing this error:
```
PostgresError: column "imageDescription" does not exist
```

## Solution
Apply the pending migrations to add the missing columns and tables.

## Option 1: Using the Migration Script (Recommended)

From the `apps/server` directory, run:

```bash
cd apps/server
bun run db:migrate
```

This will apply all pending migrations in the `src/db/migrations/` folder.

## Option 2: Manual SQL Execution

If you prefer to apply the migrations manually or need to do it directly in your database:

1. Connect to your production database (Supabase, RDS, etc.)
2. Run the SQL from: `apps/server/migrations-to-apply.sql`

### Using Supabase Dashboard:
1. Go to your Supabase project
2. Navigate to "SQL Editor"
3. Copy and paste the contents of `migrations-to-apply.sql`
4. Click "Run"

### Using psql:
```bash
psql $DATABASE_URL -f apps/server/migrations-to-apply.sql
```

## What Gets Applied

### Migration 0004: Add Experience Image Columns
- Adds `imageDescription` (text, nullable)
- Adds `uploadedBy` (text, nullable, FK to user.id)
- Adds `experienceFixId` (uuid, nullable, FK to experience_fix.id)
- Creates indexes for the new columns

### Migration 0005: Add Geofencing Tables
- Creates `geofence_regions` table
- Creates `proximity_notifications` table

## Verification

After applying migrations, verify with:

```sql
-- Check experience_image columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'experience_image'
ORDER BY ordinal_position;

-- Check geofencing tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('geofence_regions', 'proximity_notifications');
```

## Post-Migration Steps

1. Restart your backend server
2. Monitor logs to ensure no more "column does not exist" errors
3. Test experience image upload functionality
4. Test geofencing features (if enabled)

## Rollback (if needed)

If something goes wrong, you can rollback the experience_image changes:

```sql
-- Remove columns from experience_image
ALTER TABLE "experience_image" 
DROP COLUMN IF EXISTS "imageDescription",
DROP COLUMN IF EXISTS "uploadedBy",
DROP COLUMN IF EXISTS "experienceFixId";

-- Drop geofencing tables
DROP TABLE IF EXISTS "proximity_notifications";
DROP TABLE IF EXISTS "geofence_regions";
```

## Notes

- All migrations use `IF NOT EXISTS` / `IF EXISTS` clauses to be idempotent
- Foreign key constraints are added safely with existence checks
- Indexes are created only if they don't already exist
- The migrations are safe to run multiple times

