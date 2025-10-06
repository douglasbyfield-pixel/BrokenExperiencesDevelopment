# Development Environment Deployment Guide

This guide will help you create and deploy a separate development environment for BrokenExperiences.

## Overview

We'll create a completely separate dev environment with:
- Separate Vercel project for frontend (web app)
- Separate Render deployment for backend (server)
- Separate Supabase project for database
- Separate environment variables

## Step 1: Set Up Dev Database (Supabase)

1. **Create a new Supabase project for dev:**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "New project"
   - Name it: "brokenexperiences-dev"
   - Choose a strong database password (save this!)
   - Select the same region as your production

2. **Get your dev Supabase credentials:**
   - Go to Settings > API
   - Copy these values:
     - Project URL (starts with https://)
     - anon public key
     - service_role key (keep this secret!)

3. **Set up database schema:**
   ```bash
   # From the server directory
   cd apps/server
   
   # Create a new .env.dev file with your dev Supabase credentials
   cp .env.example .env.dev
   # Edit .env.dev with your new Supabase dev credentials
   
   # Run migrations on dev database
   DATABASE_URL="postgresql://postgres.[your-dev-project-ref]:[your-password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true" bun run db:migrate
   ```

## Step 2: Deploy Dev Backend (Render)

1. **Create a new Render web service:**
   - Go to [https://render.com](https://render.com)
   - Click "New +" > "Web Service"
   - Connect your GitHub repo (if not already connected)
   - Configure:
     - Name: "brokenexperiences-server-dev"
     - Environment: Node
     - Branch: Create a new branch called `dev` or use `main`
     - Root Directory: `apps/server`
     - Build Command: `bun install && bun run build`
     - Start Command: `bun run start`

2. **Add environment variables in Render:**
   ```
   NODE_ENV=development
   PORT=3001
   JWT_SECRET=[generate-new-secret]
   DATABASE_URL=[your-dev-supabase-database-url]
   SUPABASE_URL=[your-dev-supabase-url]
   SUPABASE_ANON_KEY=[your-dev-supabase-anon-key]
   SUPABASE_SERVICE_KEY=[your-dev-supabase-service-key]
   OPENAI_API_KEY=[your-openai-key]
   ```

3. **Deploy and get your dev backend URL**
   - It will be something like: `https://brokenexperiences-server-dev.onrender.com`

## Step 3: Deploy Dev Frontend (Vercel)

1. **Create environment files for dev:**
   ```bash
   cd apps/web
   cp .env.example .env.development.local
   ```

2. **Edit `.env.development.local`:**
   ```env
   # Dev Backend API URL
   NEXT_PUBLIC_SERVER_URL=https://brokenexperiences-server-dev.onrender.com
   
   # Mapbox (can use same token)
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
   
   # Dev Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://[your-dev-project-ref].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-dev-anon-key]
   ```

3. **Deploy to Vercel:**
   
   Option A: Using Vercel CLI
   ```bash
   # Install Vercel CLI if you haven't
   npm i -g vercel
   
   # From the root directory
   vercel --prod --name brokenexperiences-dev
   ```
   
   Option B: Using Vercel Dashboard
   - Go to [https://vercel.com](https://vercel.com)
   - Click "Add New..." > "Project"
   - Import your repository
   - Configure:
     - Project Name: "brokenexperiences-dev"
     - Framework Preset: Next.js
     - Root Directory: `apps/web`
     - Build Command: `bun run build`
     - Install Command: `bun install`
   - Add environment variables from `.env.development.local`

## Step 4: Configure Git Branches (Optional)

To maintain separate dev and production code:

```bash
# Create a dev branch
git checkout -b dev

# Push to GitHub
git push origin dev
```

Configure your deployments:
- Vercel production: Deploy from `main` branch
- Vercel dev: Deploy from `dev` branch
- Render production: Deploy from `main` branch
- Render dev: Deploy from `dev` branch

## Step 5: Test Your Dev Environment

1. **Check backend health:**
   ```bash
   curl https://brokenexperiences-server-dev.onrender.com/health
   ```

2. **Visit your dev frontend:**
   - Go to your Vercel dev URL
   - Test all features

## Environment Variables Summary

### Dev Backend (.env.dev in apps/server):
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=[new-dev-secret]
DATABASE_URL=[dev-supabase-database-url]
SUPABASE_URL=[dev-supabase-url]
SUPABASE_ANON_KEY=[dev-supabase-anon-key]
SUPABASE_SERVICE_KEY=[dev-supabase-service-key]
OPENAI_API_KEY=[your-openai-key]
```

### Dev Frontend (.env.development.local in apps/web):
```env
NEXT_PUBLIC_SERVER_URL=https://brokenexperiences-server-dev.onrender.com
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=[your-mapbox-token]
NEXT_PUBLIC_SUPABASE_URL=[dev-supabase-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[dev-supabase-anon-key]
```

## Managing Multiple Environments

### Local Development:
```bash
# Start with dev environment variables
cd apps/server
cp .env.dev .env
cd ../..
bun run dev
```

### Switching Between Environments:
```bash
# For production work
git checkout main

# For development work
git checkout dev
```

## Important Security Notes

1. **Never commit .env files** - They should be in .gitignore
2. **Use different JWT secrets** for dev and production
3. **Keep service keys secret** - Only use in backend, never in frontend
4. **Separate databases** - Never use production database for development

## Troubleshooting

1. **CORS Issues:**
   - Make sure your dev backend URL is correctly set in frontend env vars
   - Check that backend CORS settings allow your dev frontend URL

2. **Database Connection:**
   - Verify DATABASE_URL is using the correct dev Supabase credentials
   - Check that migrations have run successfully

3. **API Errors:**
   - Check backend logs in Render dashboard
   - Verify all environment variables are set correctly

## Next Steps

After deployment:
1. Set up monitoring for your dev environment
2. Configure CI/CD pipelines for automatic deployments
3. Set up branch protection rules on GitHub
4. Consider adding staging environment between dev and production