# Broken Experiences - Multi-Environment Dokploy Deployment Guide

This guide explains how to deploy the Broken Experiences application across **Development**, **Staging**, and **Production** environments on Digital Ocean using Dokploy.

## Environment Overview

| Environment | Purpose | Domain | Database | Features |
|-------------|---------|--------|----------|----------|
| **Development** | Local development & testing | `dev.your-domain.com` | Supabase Dev Project | Hot reload, debug logs |
| **Staging** | Pre-production testing | `staging.your-domain.com` | Supabase Staging Project | Production-like setup |
| **Production** | Live application | `your-domain.com` | Supabase Production Project | Optimized, monitored |

## Prerequisites

1. **Digital Ocean Account** with sufficient resources
2. **Dokploy Installation** on Digital Ocean droplets
3. **Domain Configuration** with subdomains
4. **Supabase Projects** (separate projects for each environment)
5. **SSL Certificates** (handled by Dokploy)

## Digital Ocean Infrastructure Setup

### 1. Droplet Configuration

#### Development Environment
- **Size**: 1GB RAM, 1 vCPU (Basic Droplet)
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 25GB SSD
- **Purpose**: Development and testing

#### Staging Environment
- **Size**: 2GB RAM, 1 vCPU (Basic Droplet)
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 50GB SSD
- **Purpose**: Pre-production testing

#### Production Environment
- **Size**: 4GB RAM, 2 vCPU (Basic Droplet) or higher
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 100GB SSD
- **Purpose**: Live application

### 2. Supabase Database Setup

#### Create Supabase Projects
Create separate Supabase projects for each environment:

- **Development**: `broken-experiences-dev` (Free tier)
- **Staging**: `broken-experiences-staging` (Pro tier)
- **Production**: `broken-experiences-prod` (Pro tier)

#### Supabase Configuration Benefits
- **Managed PostgreSQL**: No need to manage database infrastructure
- **Built-in Auth**: Leverage Supabase Auth features
- **Real-time**: Built-in real-time subscriptions
- **Storage**: File storage capabilities
- **Edge Functions**: Serverless functions if needed
- **Backups**: Automatic backups and point-in-time recovery
- **Scaling**: Automatic scaling based on usage

## Supabase Project Setup

### 1. Create Supabase Projects

#### Development Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and enter project name: `broken-experiences-dev`
4. Set database password (save this securely)
5. Choose region closest to your development team
6. Click "Create new project"

#### Staging Project
1. Create new project: `broken-experiences-staging`
2. Choose Pro tier plan
3. Set database password (different from dev)
4. Choose region closest to your staging environment
5. Configure backup settings

#### Production Project
1. Create new project: `broken-experiences-prod`
2. Choose Pro tier plan
3. Set strong database password
4. Choose region closest to your users
5. Configure backup and monitoring settings

### 2. Database Schema Migration

For each environment, you'll need to run your database migrations:

```bash
# Development
DATABASE_URL="postgresql://postgres:[password]@db.[dev-project-ref].supabase.co:5432/postgres" bun run db:push

# Staging
DATABASE_URL="postgresql://postgres:[password]@db.[staging-project-ref].supabase.co:5432/postgres" bun run db:push

# Production
DATABASE_URL="postgresql://postgres:[password]@db.[prod-project-ref].supabase.co:5432/postgres" bun run db:push
```

### 3. Supabase Configuration

#### Row Level Security (RLS)
Enable RLS on all tables for security:

```sql
-- Enable RLS on all tables
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ... enable for all tables
```

#### Auth Configuration
Configure authentication settings in each Supabase project:
- Set up OAuth providers (Google, etc.)
- Configure redirect URLs for each environment
- Set up email templates

## Environment-Specific Configuration

### 1. Development Environment

#### Server Dockerfile (`apps/server/Dockerfile.dev`)
```dockerfile
FROM oven/bun:1.2.21-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY apps/server/package.json ./apps/server/
COPY packages/ ./packages/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY apps/server/ ./apps/server/

# Development mode - no build step
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start in development mode with hot reload
CMD ["bun", "run", "dev"]
```

#### Web Dockerfile (`apps/web/Dockerfile.dev`)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

# Install dependencies
RUN npm install --frozen-lockfile

# Copy source code
COPY . .

# Development mode
WORKDIR /app/apps/web
EXPOSE 3001

CMD ["npm", "run", "dev"]
```

### 2. Staging Environment

#### Server Dockerfile (`apps/server/Dockerfile.staging`)
```dockerfile
FROM oven/bun:1.2.21-alpine

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
RUN bun run build

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["bun", "run", "start"]
```

#### Web Dockerfile (`apps/web/Dockerfile.staging`)
```dockerfile
FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json bun.lockb ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

RUN npm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

WORKDIR /app/apps/web
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3001
ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 3. Production Environment

#### Server Dockerfile (`apps/server/Dockerfile.prod`)
```dockerfile
FROM oven/bun:1.2.21-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY apps/server/package.json ./apps/server/
COPY packages/ ./packages/

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY apps/server/ ./apps/server/

# Build the application
RUN bun run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bunuser -u 1001

# Change ownership
RUN chown -R bunuser:nodejs /app
USER bunuser

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["bun", "run", "start"]
```

#### Web Dockerfile (`apps/web/Dockerfile.prod`)
```dockerfile
FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json bun.lockb ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

WORKDIR /app/apps/web
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3001
ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## Docker Compose Files

### 1. Development (`docker-compose.dev.yml`)
```yaml
version: '3.8'

services:
  server-dev:
    build:
      context: ../../
      dockerfile: apps/server/Dockerfile.dev
    container_name: broken-experiences-server-dev
    environment:
      - NODE_ENV=development
      - PORT=3000
      - DATABASE_URL=${SUPABASE_DATABASE_URL_DEV}
      - BETTER_AUTH_URL=http://localhost:3000
      - BETTER_AUTH_SECRET=dev-secret-key
      - SUPABASE_URL=${SUPABASE_URL_DEV}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY_DEV}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    ports:
      - "3000:3000"
    restart: unless-stopped
    volumes:
      - ../../apps/server:/app/apps/server

  web-dev:
    build:
      context: ../../
      dockerfile: apps/web/Dockerfile.dev
    container_name: broken-experiences-web-dev
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL_DEV}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY_DEV}
      - NEXT_PUBLIC_API_URL=http://localhost:3000
    ports:
      - "3001:3001"
    depends_on:
      - server-dev
    restart: unless-stopped
    volumes:
      - ../../apps/web:/app/apps/web
```

### 2. Staging (`docker-compose.staging.yml`)
```yaml
version: '3.8'

services:
  server-staging:
    build:
      context: ../../
      dockerfile: apps/server/Dockerfile.staging
    container_name: broken-experiences-server-staging
    environment:
      - NODE_ENV=staging
      - PORT=3000
      - DATABASE_URL=${SUPABASE_DATABASE_URL_STAGING}
      - BETTER_AUTH_URL=https://api-staging.your-domain.com
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - SUPABASE_URL=${SUPABASE_URL_STAGING}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY_STAGING}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    ports:
      - "3000:3000"
    restart: unless-stopped

  web-staging:
    build:
      context: ../../
      dockerfile: apps/web/Dockerfile.staging
    container_name: broken-experiences-web-staging
    environment:
      - NODE_ENV=staging
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL_STAGING}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY_STAGING}
      - NEXT_PUBLIC_API_URL=https://api-staging.your-domain.com
    ports:
      - "3001:3001"
    depends_on:
      - server-staging
    restart: unless-stopped
```

### 3. Production (`docker-compose.prod.yml`)
```yaml
version: '3.8'

services:
  server-prod:
    build:
      context: ../../
      dockerfile: apps/server/Dockerfile.prod
    container_name: broken-experiences-server-prod
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=${SUPABASE_DATABASE_URL_PROD}
      - BETTER_AUTH_URL=https://api.your-domain.com
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - SUPABASE_URL=${SUPABASE_URL_PROD}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY_PROD}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    ports:
      - "3000:3000"
    restart: unless-stopped

  web-prod:
    build:
      context: ../../
      dockerfile: apps/web/Dockerfile.prod
    container_name: broken-experiences-web-prod
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL_PROD}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY_PROD}
      - NEXT_PUBLIC_API_URL=https://api.your-domain.com
    ports:
      - "3001:3001"
    depends_on:
      - server-prod
    restart: unless-stopped
```

## Environment Variables

### Development Environment Variables

#### Server (`.env.dev`)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=dev-secret-key-change-in-production
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=your-dev-supabase-anon-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Web (`.env.local.dev`)
```env
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Staging Environment Variables

#### Server (`.env.staging`)
```env
NODE_ENV=staging
PORT=3000
DATABASE_URL=postgresql://postgres:[password]@db.[staging-project-ref].supabase.co:5432/postgres
BETTER_AUTH_URL=https://api-staging.your-domain.com
BETTER_AUTH_SECRET=staging-secret-key
SUPABASE_URL=https://[staging-project-ref].supabase.co
SUPABASE_ANON_KEY=your-staging-supabase-anon-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Web (`.env.local.staging`)
```env
NODE_ENV=staging
NEXT_PUBLIC_SUPABASE_URL=https://[staging-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-supabase-anon-key
NEXT_PUBLIC_API_URL=https://api-staging.your-domain.com
```

### Production Environment Variables

#### Server (`.env.prod`)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:[password]@db.[prod-project-ref].supabase.co:5432/postgres
BETTER_AUTH_URL=https://api.your-domain.com
BETTER_AUTH_SECRET=super-secure-production-secret-key
SUPABASE_URL=https://[prod-project-ref].supabase.co
SUPABASE_ANON_KEY=your-prod-supabase-anon-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Web (`.env.local.prod`)
```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://[prod-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-supabase-anon-key
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

## Dokploy Deployment Configuration

### 1. Development Environment Setup

#### Server Application
- **Name**: `broken-experiences-server-dev`
- **Repository**: Your Git repository URL
- **Branch**: `develop` or `dev`
- **Dockerfile Path**: `apps/server/Dockerfile.dev`
- **Build Context**: Root directory (`.`)
- **Port**: `3000`
- **Domain**: `api-dev.your-domain.com`
- **Environment Variables**: Development server variables

#### Web Application
- **Name**: `broken-experiences-web-dev`
- **Repository**: Your Git repository URL
- **Branch**: `develop` or `dev`
- **Dockerfile Path**: `apps/web/Dockerfile.dev`
- **Build Context**: Root directory (`.`)
- **Port**: `3001`
- **Domain**: `dev.your-domain.com`
- **Environment Variables**: Development web variables

### 2. Staging Environment Setup

#### Server Application
- **Name**: `broken-experiences-server-staging`
- **Repository**: Your Git repository URL
- **Branch**: `staging`
- **Dockerfile Path**: `apps/server/Dockerfile.staging`
- **Build Context**: Root directory (`.`)
- **Port**: `3000`
- **Domain**: `api-staging.your-domain.com`
- **Environment Variables**: Staging server variables

#### Web Application
- **Name**: `broken-experiences-web-staging`
- **Repository**: Your Git repository URL
- **Branch**: `staging`
- **Dockerfile Path**: `apps/web/Dockerfile.staging`
- **Build Context**: Root directory (`.`)
- **Port**: `3001`
- **Domain**: `staging.your-domain.com`
- **Environment Variables**: Staging web variables

### 3. Production Environment Setup

#### Server Application
- **Name**: `broken-experiences-server-prod`
- **Repository**: Your Git repository URL
- **Branch**: `main` or `production`
- **Dockerfile Path**: `apps/server/Dockerfile.prod`
- **Build Context**: Root directory (`.`)
- **Port**: `3000`
- **Domain**: `api.your-domain.com`
- **Environment Variables**: Production server variables

#### Web Application
- **Name**: `broken-experiences-web-prod`
- **Repository**: Your Git repository URL
- **Branch**: `main` or `production`
- **Dockerfile Path**: `apps/web/Dockerfile.prod`
- **Build Context**: Root directory (`.`)
- **Port**: `3001`
- **Domain**: `your-domain.com`
- **Environment Variables**: Production web variables

## Deployment Workflow

### 1. Development Workflow
```bash
# Make changes
git add .
git commit -m "Feature: Add new feature"
git push origin develop

# Deploy to development
# Dokploy automatically builds and deploys from develop branch
```

### 2. Staging Workflow
```bash
# Merge develop to staging
git checkout staging
git merge develop
git push origin staging

# Deploy to staging
# Dokploy automatically builds and deploys from staging branch
```

### 3. Production Workflow
```bash
# Merge staging to main
git checkout main
git merge staging
git tag v1.0.0
git push origin main --tags

# Deploy to production
# Dokploy automatically builds and deploys from main branch
```

## Monitoring and Maintenance

### 1. Health Checks
- **Development**: `https://api-dev.your-domain.com/health`
- **Staging**: `https://api-staging.your-domain.com/health`
- **Production**: `https://api.your-domain.com/health`

### 2. Log Management
- **Development**: Verbose logging, debug information
- **Staging**: Moderate logging, error tracking
- **Production**: Minimal logging, performance monitoring

### 3. Database Management
- **Development**: Reset and seed frequently using Supabase dashboard
- **Staging**: Regular backups via Supabase, test data management
- **Production**: Automated backups via Supabase, monitoring through Supabase dashboard

## Security Considerations

### 1. Environment Isolation
- Separate Supabase projects for each environment
- Different API keys and secrets for each environment
- Isolated network access and database connections

### 2. Access Control
- **Development**: Open access for developers
- **Staging**: Limited access for testing
- **Production**: Restricted access, monitoring

### 3. Secrets Management
- Use Dokploy's secrets management
- Rotate secrets regularly
- Monitor secret usage

## Cost Optimization

### 1. Resource Allocation
- **Development**: Minimal resources
- **Staging**: Moderate resources
- **Production**: Optimized resources

### 2. Auto-scaling
- Configure auto-scaling for production
- Use smaller instances for dev/staging
- Monitor resource usage

### 3. Database Optimization
- Use Supabase Pro tier for production and staging
- Free tier for development
- Regular cleanup of old data
- Monitor database performance through Supabase dashboard

## Troubleshooting

### Common Issues by Environment

#### Development
- Hot reload not working
- Database connection issues
- CORS problems

#### Staging
- Build failures
- Environment variable mismatches
- Performance issues

#### Production
- SSL certificate problems
- Database performance
- Memory leaks

### Debug Commands
```bash
# Check container status
docker ps -a

# View logs
docker logs broken-experiences-server-dev
docker logs broken-experiences-web-dev

# Connect to container
docker exec -it broken-experiences-server-dev bash
```

## Benefits of Using Supabase

### 1. Simplified Infrastructure
- **No Database Management**: Supabase handles PostgreSQL infrastructure
- **Automatic Backups**: Built-in backup and point-in-time recovery
- **Scaling**: Automatic scaling based on usage
- **Monitoring**: Built-in database monitoring and alerts

### 2. Enhanced Features
- **Real-time Subscriptions**: Built-in real-time capabilities
- **Authentication**: Complete auth system with multiple providers
- **Storage**: File storage for images and documents
- **Edge Functions**: Serverless functions for custom logic

### 3. Cost Efficiency
- **Development**: Free tier for development
- **Staging/Production**: Pay only for what you use
- **No Infrastructure Overhead**: No need to manage database servers

### 4. Security
- **Row Level Security**: Built-in RLS for data protection
- **SSL/TLS**: Automatic SSL encryption
- **Access Control**: Fine-grained access control
- **Audit Logs**: Built-in audit logging

### 5. Developer Experience
- **Dashboard**: Easy-to-use web interface
- **API Generation**: Automatic API generation from schema
- **Documentation**: Auto-generated API documentation
- **CLI Tools**: Command-line tools for migrations

This multi-environment setup with Supabase provides a robust, scalable, and cost-effective deployment strategy for your Broken Experiences application across development, staging, and production environments on Digital Ocean.
