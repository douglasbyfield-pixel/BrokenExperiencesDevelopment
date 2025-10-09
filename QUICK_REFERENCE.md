# Broken Experiences - Quick Reference Guide

## 🚀 Quick Start for Developers

### Project Structure at a Glance

```
BrokenExperiencesDevelopment/
├── apps/
│   ├── web/              # Next.js web app (PWA)
│   │   ├── src/
│   │   │   ├── app/      # Pages & routes
│   │   │   ├── components/ # UI components
│   │   │   ├── features/  # Feature modules
│   │   │   ├── lib/       # Utilities
│   │   │   └── action/    # Server actions
│   │   
│   ├── mobile/           # Capacitor mobile app
│   │   └── src/
│   │       ├── modules/   # Feature modules
│   │       └── components/ # Mobile components
│   │   
│   └── server/           # Elysia API backend
│       └── src/
│           ├── module/    # API modules
│           ├── db/        # Database & schemas
│           └── lib/       # Server utilities
│
└── packages/
    └── libs/             # Shared code
```

---

## 🔑 Key Concepts

### User Roles
**Single Role System:** Everyone is a `reporter` by default
- No separate "fixer" or "verifier" roles
- All users can perform all actions
- Flexibility through gamification

### Status Flow
```
Experience Lifecycle:
PENDING → IN_PROGRESS → RESOLVED → VERIFIED
```

### Priority Levels
```
LOW → MEDIUM → HIGH → URGENT
(Influenced by community votes)
```

---

## 🎮 XP & Points System

### Activity Points
```
Report Experience:  +10 XP
Fix Experience:     +20 XP
Verify Fix:         +15 XP
Sponsor Issue:      +30 XP
Badge Unlock:       +Varies
```

### Leveling Formula
```javascript
Level 1 → 2:  100 XP
Level 2 → 3:  120 XP (100 × 1.2)
Level 3 → 4:  144 XP (100 × 1.2²)
Level 4 → 5:  173 XP (100 × 1.2³)
...
Base: 100 XP
Multiplier: 1.2 (exponential)
Max Level: 100
```

---

## 🏅 Badge Categories

### Fixer Badges
- Quick Fix (1 fix) - 50 XP
- Patch Master (5 fixes) - 100 XP
- Restoration Pro (10 fixes) - 200 XP
- Rebuilder (25 fixes) - 500 XP
- City Saver (50 fixes) - 1000 XP

### Reporter Badges
- Trail Finder (1 report) - 25 XP
- Scout (5 reports) - 50 XP
- Pathfinder (10 reports) - 100 XP
- Navigator (25 reports) - 250 XP
- Sentinel (50 reports) - 500 XP

### Sponsor Badges
- Supporter (1 sponsor) - 100 XP
- Patron (5 sponsors) - 200 XP
- Benefactor (10 sponsors) - 500 XP
- Philanthropist (25 sponsors) - 1000 XP

### Community Badges
- Collaborator (5 verifications) - 75 XP
- Team Player (50 votes) - 100 XP
- Community Leader (all active) - 500 XP
- Legend (Level 50) - 2000 XP

---

## 🔄 Common Flows - Quick Reference

### 1. Report Experience Flow

```
User Action → Frontend → Backend → Database → Response
     ↓
1. Click "Report"
     ↓
2. Fill form (location, category, description)
     ↓
3. Submit → createExperienceAction()
     ↓
4. POST /api/experience
     ↓
5. ExperienceService.createExperience()
     ↓
6. Insert into experience table
     ↓
7. LevelingService.addExperience(userId, 10)
     ↓
8. Update user_profile (level, XP)
     ↓
9. BadgesService.checkAndUnlockBadges()
     ↓
10. Return success + new experience
```

**Files Involved:**
- Frontend: `apps/web/src/action/experience.ts`
- Backend: `apps/server/src/module/experience/service.ts`
- Schema: `apps/server/src/db/schema/experience.ts`

---

### 2. Fix Experience Flow

```
1. User finds experience on map/feed
     ↓
2. Click "I'll Fix This"
     ↓
3. Status → IN_PROGRESS
     ↓
4. User fixes issue in real world
     ↓
5. Returns to app, clicks "Mark as Fixed"
     ↓
6. Uploads after photos
     ↓
7. PATCH /api/experience/:id/fix
     ↓
8. Update experience status → RESOLVED
     ↓
9. LevelingService.addExperience(userId, 20)
     ↓
10. BadgesService.checkAndUnlockBadges('fixes_count')
     ↓
11. NotificationService.sendFixNotification()
```

---

### 3. Voting Flow

```
1. User sees experience card
     ↓
2. Clicks upvote/downvote
     ↓
3. POST /api/experience/:id/vote
     ↓
4. Check if user already voted
     ↓
5. If new vote:
   - Insert into vote table
   - Increment experience.upvotes/downvotes
     ↓
6. If changing vote:
   - Update vote table
   - Adjust both counts
     ↓
7. Recalculate priority if threshold met
     ↓
8. Return updated vote counts
```

---

### 4. Badge Unlock Flow

```
User performs action (report/fix/verify)
     ↓
Activity recorded in activity_points table
     ↓
BadgesService.checkAndUnlockBadges(userId, type)
     ↓
Query achievements where:
  - requirementType matches action type
  - requirement <= user's count
     ↓
For each eligible badge not already unlocked:
     ↓
  1. Insert into user_achievements
  2. LevelingService.addExperience(userId, badge.points)
  3. NotificationService.sendBadgeNotification()
     ↓
Return newly unlocked badges
```

---

### 5. Leaderboard Calculation

```
Query activity_points table
     ↓
Join with user_profile for display info
     ↓
Calculate total_points:
  (experiences_added × 10) +
  (experiences_fixed × 20) +
  (experiences_verified × 15) +
  (experiences_sponsored × 30)
     ↓
Order by total_points DESC
     ↓
Add rank numbers (1, 2, 3...)
     ↓
Filter by timeframe if needed
     ↓
Return top 100 users
```

---

## 📡 API Endpoints Cheat Sheet

### Authentication
```
POST   /api/auth/login         # Login (handled by Supabase)
POST   /api/auth/signup        # Signup (handled by Supabase)
POST   /api/auth/logout        # Logout
GET    /api/auth/session       # Check session
```

### Experiences
```
GET    /api/experience                # List all
POST   /api/experience                # Create new
GET    /api/experience/:id            # Get single
PATCH  /api/experience/:id            # Update
DELETE /api/experience/:id            # Delete
POST   /api/experience/:id/vote       # Vote (up/down)
PATCH  /api/experience/:id/fix        # Mark as fixed
POST   /api/experience/:id/verify     # Verify fix
```

### User & Profile
```
GET    /api/user/profile              # Get profile
PATCH  /api/user/profile              # Update profile
GET    /api/user/stats                # Get stats
```

### Gamification
```
GET    /api/achievements              # All badges + user status
GET    /api/achievements/obtained     # User's badges only
GET    /api/stats/leaderboard         # Leaderboard
```

### Categories
```
GET    /api/category                  # List all categories
```

### Notifications
```
POST   /api/notifications/send        # Send push notification (admin)
```

---

## 🗄️ Database Tables Quick Ref

### Core Tables

```sql
-- Users
user_profile (id, auth_user_id, handle, level, total_experience...)

-- Experiences
experience (id, reported_by, category_id, title, description, 
            latitude, longitude, status, priority, upvotes...)

-- Voting
vote (id, experience_id, user_id, vote)

-- Images
experience_image (id, experience_id, image_url)

-- Gamification
activity_points (id, user_id, experiences_added, experiences_fixed,
                 total_points...)
achievements (id, name, description, category, points, requirement...)
user_achievements (id, user_id, achievement_id, progress, unlocked_at...)

-- Categories
category (id, name)
```

---

## 🎨 Frontend Components Map

### Web App Routes
```
/                          # Landing page
/login                     # Authentication
/home                      # Main dashboard/feed
/map                       # Interactive map view
/profile                   # User profile
/leaderboard               # Rankings
/achievements              # Badges
/settings                  # User settings
/search                    # Search experiences
```

### Key Components
```
apps/web/src/
├── app/(core)/
│   ├── (dashboard)/home/
│   │   ├── page.tsx                    # Home page
│   │   └── features/
│   │       ├── feed.tsx                # Main feed
│   │       ├── experience-card.tsx     # Experience card
│   │       ├── create-experience-card.tsx  # Report form
│   │       ├── left-sidebar.tsx        # Navigation
│   │       └── right-sidebar.tsx       # Stats/actions
│   │
│   ├── map/
│   │   └── features/map-client.tsx     # Mapbox integration
│   │
│   ├── leaderboard/
│   │   └── leaderboard-client.tsx      # Rankings
│   │
│   └── profile/page.tsx                # User profile
│
├── components/
│   ├── ui/                             # shadcn components
│   ├── header.tsx                      # Top nav
│   ├── floating-nav.tsx                # Bottom nav (mobile)
│   └── user-menu.tsx                   # User dropdown
│
└── features/
    └── achievements/
        ├── badge-card.tsx              # Badge display
        └── use-badges.ts               # Badge hooks
```

---

## 🔧 Common Development Tasks

### Start Development Servers
```bash
# All services
bun dev

# Individual services
bun dev:web       # Web app (port 3001)
bun dev:server    # API server (port 4000)
bun dev:mobile    # Mobile app
```

### Database Operations
```bash
# Push schema changes
cd apps/server
bun run db:push

# Open database studio
bun run db:studio

# Seed categories
bun run src/db/seed-categories.ts
```

### Type Checking
```bash
# Check all apps
bun check-types

# Individual apps
cd apps/web && bun run type-check
cd apps/server && bun run type-check
```

### Building
```bash
# Build all
bun build

# Build individual
cd apps/web && bun run build
cd apps/server && bun run build
```

---

## 🐛 Debugging Tips

### Check Authentication
```typescript
// Frontend
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

// Backend
const userId = await AuthService.getUserIdFromToken(headers.authorization)
console.log('Authenticated user:', userId)
```

### Verify XP Addition
```typescript
// After any XP-earning action
const result = await LevelingService.addExperience(userId, points)
console.log('Leveling result:', result)
// { level, totalExperience, experienceToNextLevel, leveledUp, levelsGained }
```

### Check Badge Progress
```typescript
const badges = await BadgesService.getBadgesWithUserStatus(userId)
console.log('User badges:', badges)
// Shows progress toward each badge
```

### Verify Activity Points
```typescript
const stats = await db.query.activityPoints.findFirst({
  where: eq(activityPoints.userId, userId)
})
console.log('Activity stats:', stats)
```

---

## 🔐 Environment Variables

### Web App (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJxxx...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxx
```

### Server (.env)
```bash
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/broken_experiences
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
ADMIN_TOKEN=your-secret-admin-token
VAPID_PRIVATE_KEY=xxx
```

---

## 📱 Mobile Development

### Run on Device
```bash
cd apps/mobile

# iOS
bun run build
npx cap sync ios
npx cap open ios

# Android
bun run build
npx cap sync android
npx cap open android
```

### Key Capacitor Plugins
```typescript
import { Camera } from '@capacitor/camera'
import { Geolocation } from '@capacitor/geolocation'
import { PushNotifications } from '@capacitor/push-notifications'

// Take photo
const photo = await Camera.getPhoto({
  quality: 90,
  resultType: CameraResultType.Uri
})

// Get location
const position = await Geolocation.getCurrentPosition()

// Register for push notifications
await PushNotifications.requestPermissions()
```

---

## 🎯 Testing Checklist

### New Feature Testing

- [ ] **Authentication Required?**
  - Test with valid token
  - Test with invalid/missing token
  - Test with expired token

- [ ] **XP Awarded Correctly?**
  - Verify XP amount
  - Check level up triggers
  - Confirm profile updates

- [ ] **Badge Unlocking?**
  - Test threshold crossing
  - Verify notification sent
  - Check badge appears on profile

- [ ] **Database Updates?**
  - Confirm record created/updated
  - Check foreign key relationships
  - Verify timestamps

- [ ] **Error Handling?**
  - Missing required fields
  - Invalid data types
  - Duplicate actions
  - Network failures

- [ ] **UI/UX?**
  - Loading states
  - Success messages
  - Error messages
  - Responsive design

---

## 🚀 Deployment Quick Ref

### Vercel (Web App)
```bash
# Connect repo to Vercel
# Set environment variables
# Deploy automatically on push to main
```

### Dokploy (Full Stack)
```bash
# See DOKPLOY_DEPLOYMENT.md
# Docker-based deployment
# Supports multiple environments
```

### Database Migrations
```bash
# Generate migration
cd apps/server
bun run db:generate

# Apply to production
DATABASE_URL=production_url bun run db:push
```

---

## 📚 Documentation Index

- **USER_FLOW_GUIDE.md** - Complete user journey documentation
- **TECHNICAL_FLOW_MAPPING.md** - Code implementation mapping
- **QUICK_REFERENCE.md** - This file (quick lookup)
- **DEPLOYMENT.md** - Deployment instructions
- **SUPABASE_SETUP.md** - Database and auth setup
- **MAP_STYLE_GUIDE.md** - Map styling guide

---

## 💡 Pro Tips

1. **Always await async operations** - Don't forget to await XP additions and badge checks
2. **Use transactions** - When multiple DB operations must succeed/fail together
3. **Cache user data** - User profiles are read-often, update-rarely
4. **Optimize map queries** - Use spatial indexes for location-based searches
5. **Test with real devices** - PWA and mobile features work differently on actual devices
6. **Monitor performance** - Use the built-in PerformanceMonitor component
7. **Handle offline** - PWA should work with cached data when offline
8. **Validate on both sides** - Frontend and backend validation for security
9. **Log important actions** - Track XP awards, badge unlocks, etc.
10. **Use TypeScript** - Leverage types for safer code

---

## 🆘 Common Issues & Solutions

### Issue: "supabaseKey is required"
**Solution:** Environment variables not loaded during build
- Use lazy initialization (see `apps/web/src/app/api/notifications/send/route.ts`)
- Move client creation inside request handlers

### Issue: XP not being awarded
**Solution:** Check these points:
1. Is user authenticated?
2. Is `LevelingService.addExperience()` being called?
3. Is the transaction succeeding?
4. Check database logs

### Issue: Badge not unlocking
**Solution:**
1. Verify `activity_points` table is updated
2. Check if badge threshold is met
3. Ensure `checkAndUnlockBadges()` is called
4. Verify badge isn't already unlocked

### Issue: Map not loading
**Solution:**
1. Check Mapbox token in environment
2. Verify GPS permissions granted
3. Check network connectivity
4. Look for console errors

### Issue: Push notifications not working
**Solution:**
1. Verify VAPID keys configured
2. Check service worker registered
3. Ensure notification permissions granted
4. Test on HTTPS (required for push)

---

## 🎓 Learning Resources

### Technology Stack
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Elysia.js Guide](https://elysiajs.com/introduction.html)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/)
- [Capacitor](https://capacitorjs.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Best Practices
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [API Design](https://restfulapi.net/)
- [Database Indexing](https://use-the-index-luke.com/)

---

**Quick Reference Version:** 1.0  
**Last Updated:** October 2025  
**Keep this handy for daily development!**
