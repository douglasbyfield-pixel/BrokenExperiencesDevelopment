# Supabase + Better Auth Setup Guide

## Step 1: Get Your Supabase Database Password

1. Go to your Supabase project: https://supabase.com/dashboard/project/yvsmfemwyfexaelthoed
2. Navigate to **Settings** → **Database**
3. Look for the **Connection string** section
4. Copy the **Connection string** (it will look like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.yvsmfemwyfexaelthoed.supabase.co:5432/postgres
   ```

## Step 2: Update Your Environment File

1. Open `apps/server/.env`
2. Replace the `DATABASE_URL` line with your Supabase connection string:
   ```bash
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.yvsmfemwyfexaelthoed.supabase.co:5432/postgres
   ```

## Step 3: Push Schema to Supabase

After updating the DATABASE_URL, run:
```bash
cd apps/server
bun run db:push
```

This will create all the Better Auth tables (user, session, account, etc.) in your Supabase database.

## Step 4: Seed Categories

```bash
bun run src/db/seed-categories.ts
```

## Architecture Overview

```
Next.js Web App (localhost:3001)
    ↓ API calls
Elysia Server (localhost:3000) 
    ↓ Auth requests
Better Auth (handles authentication)
    ↓ Database queries  
Supabase PostgreSQL (stores all data)
```

## Benefits
- ✅ Keep your Elysia backend as single API
- ✅ Better Auth handles all auth complexity
- ✅ Supabase provides managed PostgreSQL
- ✅ Access to Supabase dashboard for data management
- ✅ All existing routes continue to work

## Next Steps
1. Complete the setup above
2. Test authentication flow
3. Verify data is being stored in Supabase dashboard