# Broken Experiences - Dokploy Deployment Guide

This guide explains how to deploy the Broken Experiences application using Dokploy with Docker containers for both the server and Next.js frontend.

## Project Overview

The Broken Experiences application consists of:
- **Server**: Bun-based Elysia.js API server with PostgreSQL database
- **Web Frontend**: Next.js 15 application
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with Supabase integration

## Prerequisites

1. **Dokploy Installation**: Ensure Dokploy is installed and running on your server
2. **Domain Setup**: Configure your domain to point to your Dokploy server
3. **SSL Certificate**: Dokploy can handle SSL certificates automatically
4. **Environment Variables**: Prepare all required environment variables

## Environment Variables

### Server Environment Variables

Create a `.env` file for the server with the following variables:

```env
# Server Configuration
PORT=3000
BETTER_AUTH_URL=https://your-domain.com
BETTER_AUTH_SECRET=your-super-secret-key-here

# Database Configuration
DATABASE_URL=postgresql://postgres:password@postgres:5432/broken-experiences

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Web Frontend Environment Variables

Create a `.env.local` file for the web app:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

## Docker Configuration

### 1. Server Dockerfile

Create `apps/server/Dockerfile`:

```dockerfile
# Use Bun's official image
FROM oven/bun:1.2.21-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY apps/server/package.json ./apps/server/
COPY packages/ ./packages/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY apps/server/ ./apps/server/

# Build the application
WORKDIR /app/apps/server
RUN bun run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["bun", "run", "start"]
```

### 2. Web Frontend Dockerfile

Create `apps/web/Dockerfile`:

```dockerfile
# Use Node.js 18 Alpine
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

# Install dependencies
RUN npm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
WORKDIR /app/apps/web
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 3. Docker Compose for Local Development

Update `apps/server/docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: broken-experiences-postgres
    environment:
      POSTGRES_DB: broken-experiences
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  server:
    build:
      context: ../../
      dockerfile: apps/server/Dockerfile
    container_name: broken-experiences-server
    environment:
      - PORT=3000
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/broken-experiences
      - BETTER_AUTH_URL=http://localhost:3000
      - BETTER_AUTH_SECRET=your-secret-key
      - SUPABASE_URL=your-supabase-url
      - SUPABASE_ANON_KEY=your-supabase-key
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  web:
    build:
      context: ../../
      dockerfile: apps/web/Dockerfile
    container_name: broken-experiences-web
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
      - NEXT_PUBLIC_API_URL=http://localhost:3000
    ports:
      - "3001:3001"
    depends_on:
      - server
    restart: unless-stopped

volumes:
  postgres_data:
```

## Dokploy Deployment Steps

### 1. Create Applications in Dokploy

#### Server Application
1. **Name**: `broken-experiences-server`
2. **Repository**: Your Git repository URL
3. **Branch**: `main` (or your deployment branch)
4. **Dockerfile Path**: `apps/server/Dockerfile`
5. **Build Context**: Root directory (`.`)
6. **Port**: `3000`
7. **Environment Variables**: Add all server environment variables

#### Web Application
1. **Name**: `broken-experiences-web`
2. **Repository**: Your Git repository URL
3. **Branch**: `main` (or your deployment branch)
4. **Dockerfile Path**: `apps/web/Dockerfile`
5. **Build Context**: Root directory (`.`)
6. **Port**: `3001`
7. **Environment Variables**: Add all web environment variables

### 2. Database Setup

#### Option A: External Database (Recommended)
- Use a managed PostgreSQL service (Supabase, AWS RDS, etc.)
- Update `DATABASE_URL` in server environment variables

#### Option B: Dokploy Database Container
1. Create a PostgreSQL service in Dokploy
2. Use the internal network for database connection
3. Update `DATABASE_URL` to use the internal service name

### 3. Domain Configuration

#### Server API
- **Domain**: `api.your-domain.com`
- **SSL**: Enable automatic SSL certificate
- **Proxy**: Configure to forward to server container port 3000

#### Web Frontend
- **Domain**: `your-domain.com`
- **SSL**: Enable automatic SSL certificate
- **Proxy**: Configure to forward to web container port 3001

### 4. Environment Variables in Dokploy

#### Server Environment Variables
```
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database
BETTER_AUTH_URL=https://api.your-domain.com
BETTER_AUTH_SECRET=your-super-secret-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Web Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### 5. Build and Deploy

1. **Push to Repository**: Ensure all code is pushed to your Git repository
2. **Trigger Build**: In Dokploy, trigger the build for both applications
3. **Monitor Logs**: Check build logs for any errors
4. **Health Checks**: Verify both applications are running and healthy

## Post-Deployment Configuration

### 1. Database Migrations
After deployment, run database migrations:

```bash
# Connect to your server container
docker exec -it broken-experiences-server bash

# Run migrations
bun run db:migrate

# Optional: Seed the database
bun run db:seed
```

### 2. SSL Certificates
- Dokploy should automatically handle SSL certificates
- Verify certificates are properly configured
- Test HTTPS endpoints

### 3. CORS Configuration
Ensure your server CORS configuration allows requests from your web domain:

```typescript
// In your server configuration
app.use(cors({
  origin: ['https://your-domain.com'],
  credentials: true
}))
```

## Monitoring and Maintenance

### 1. Health Checks
- **Server**: `https://api.your-domain.com/health`
- **Web**: `https://your-domain.com`

### 2. Logs
- Monitor application logs in Dokploy dashboard
- Set up log rotation to prevent disk space issues

### 3. Updates
- Push changes to your Git repository
- Trigger rebuilds in Dokploy
- Monitor deployment logs for issues

### 4. Database Backups
- Set up regular database backups
- Test restore procedures

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Dockerfile syntax
   - Verify all dependencies are included
   - Check build context and paths

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Check network connectivity between containers
   - Ensure database is running and accessible

3. **CORS Issues**
   - Verify CORS configuration in server
   - Check domain configuration in Dokploy
   - Ensure HTTPS is properly configured

4. **Environment Variable Issues**
   - Double-check all environment variables are set
   - Verify variable names match exactly
   - Check for typos in values

### Debug Commands

```bash
# Check container logs
docker logs broken-experiences-server
docker logs broken-experiences-web

# Check container status
docker ps -a

# Connect to container
docker exec -it broken-experiences-server bash
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive environment variables to Git
2. **Database Security**: Use strong passwords and restrict database access
3. **SSL/TLS**: Always use HTTPS in production
4. **CORS**: Configure CORS properly to prevent unauthorized access
5. **Secrets Management**: Consider using Dokploy's secrets management features

## Performance Optimization

1. **Docker Images**: Use multi-stage builds to reduce image size
2. **Caching**: Enable Docker layer caching in Dokploy
3. **Database**: Optimize database queries and add indexes
4. **CDN**: Consider using a CDN for static assets
5. **Monitoring**: Set up application performance monitoring

## Backup and Recovery

1. **Database Backups**: Regular automated backups
2. **Application Backups**: Git repository serves as code backup
3. **Configuration Backups**: Document all configuration changes
4. **Recovery Testing**: Regularly test recovery procedures

This deployment guide should help you successfully deploy your Broken Experiences application using Dokploy with Docker containers.
