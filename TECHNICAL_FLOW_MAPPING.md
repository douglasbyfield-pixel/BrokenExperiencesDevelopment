# Technical Flow Mapping - Broken Experiences

## 📋 Overview

This document maps the user flows from `USER_FLOW_GUIDE.md` to actual code implementation in the Broken Experiences platform. Use this as a reference when building new features or debugging existing flows.

---

## 🗂️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Client Layer                      │
├──────────────────────┬──────────────────────────────┤
│   Web App (Next.js)  │   Mobile App (Capacitor)    │
│   apps/web/          │   apps/mobile/              │
└──────────────────────┴──────────────────────────────┘
                        ↓
         Authentication (Supabase Auth)
                        ↓
┌─────────────────────────────────────────────────────┐
│              API Layer (Elysia + Eden)               │
│              apps/server/src/                        │
├─────────────────────────────────────────────────────┤
│  • module/experience/  (CRUD operations)            │
│  • module/auth/        (Authentication)             │
│  • module/badges/      (Achievement system)         │
│  • module/leveling/    (XP & levels)               │
│  • module/scoring/     (Point calculations)        │
│  • module/stats/       (User statistics)           │
│  • module/report/      (Reporting system)          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│           Database (PostgreSQL + Drizzle)            │
│           apps/server/src/db/schema/                 │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Phase 1: Authentication Flow

### User Journey: Sign Up / Login

#### Frontend (Web)
**Location:** `apps/web/src/app/login/`

**Files:**
- `page.tsx` - Main login page
- `login-form.tsx` - Login form component
- `social-buttons.tsx` - OAuth buttons

**Key Code:**
```typescript
// Authentication handled by Supabase
import { createClient } from '@web/lib/supabase/client'

// Google OAuth
const supabase = createClient()
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: '/home' }
})

// Email/Password
await supabase.auth.signInWithPassword({
  email, password
})
```

#### Backend
**Location:** `apps/server/src/module/auth/`

**Files:**
- `router.ts` - Auth endpoints
- `service.ts` - Auth business logic

**Database Schema:**
```typescript
// apps/server/src/db/schema/profile.ts
export const userProfile = pgTable("user_profile", {
  id: uuid().primaryKey(),
  auth_user_id: text().notNull(),  // Supabase user ID
  handle: varchar({ length: 64 }).notNull(),
  display_name: varchar({ length: 120 }),
  role: userRoleEnum("role").default("reporter"),
  level: integer("level").default(1),
  total_experience: integer("total_experience").default(0),
  experience_to_next_level: integer("experience_to_next_level").default(100),
  // ...
})
```

**Auto-Profile Creation:**
When a user signs up via Supabase, a profile is automatically created:
```typescript
// Triggered on first API call with valid auth token
if (!userProfile) {
  await db.insert(userProfile).values({
    auth_user_id: userId,
    handle: `user_${userId.slice(0, 8)}`,
    level: 1,
    total_experience: 0,
    experience_to_next_level: 100
  })
}
```

---

## 🏠 Phase 2: Home Dashboard

### User Journey: View Experience Feed

#### Frontend (Web)
**Location:** `apps/web/src/app/(core)/(dashboard)/home/`

**Key Files:**
- `page.tsx` - Main home page
- `features/feed.tsx` - Experience feed component
- `features/experience-card.tsx` - Individual experience card
- `features/left-sidebar.tsx` - Navigation sidebar
- `features/right-sidebar.tsx` - Stats sidebar

**Data Fetching:**
```typescript
// apps/web/src/app/(core)/(dashboard)/home/page.tsx
import { eden } from '@web/lib/eden'

// Fetch experiences
const { data: experiences } = await eden.api.experience.index.get({
  $query: {
    limit: 20,
    offset: 0,
    status: 'pending'
  }
})
```

#### Backend
**Location:** `apps/server/src/module/experience/`

**Files:**
- `router.ts` - Experience CRUD endpoints
- `service.ts` - Business logic
- `schema.ts` - Validation schemas

**Key Endpoint:**
```typescript
// GET /api/experience
.get("/", async ({ query }) => {
  const experiences = await ExperienceService.getExperiences({
    limit: query.limit,
    offset: query.offset,
    status: query.status,
    categoryId: query.categoryId
  })
  return { success: true, data: experiences }
})
```

**Service Method:**
```typescript
// apps/server/src/module/experience/service.ts
static async getExperiences(options: GetExperiencesOptions) {
  return await db.query.experience.findMany({
    where: options.status ? eq(experience.status, options.status) : undefined,
    limit: options.limit || 20,
    offset: options.offset || 0,
    orderBy: desc(experience.createdAt),
    with: {
      category: true,
      reporter: true,
      images: true
    }
  })
}
```

---

## 🗺️ Phase 2B: Map View

### User Journey: Browse Issues on Map

#### Frontend (Web)
**Location:** `apps/web/src/app/(core)/map/`

**Key Files:**
- `page.tsx` - Map page wrapper
- `features/map-client.tsx` - Mapbox implementation

**Mapbox Integration:**
```typescript
import mapboxgl from 'mapbox-gl'

// Initialize map
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!
const map = new mapboxgl.Map({
  container: mapRef.current,
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [lng, lat],
  zoom: 12
})

// Add markers for experiences
experiences.forEach(exp => {
  const marker = new mapboxgl.Marker({
    color: getPriorityColor(exp.priority)
  })
  .setLngLat([exp.longitude, exp.latitude])
  .setPopup(new mapboxgl.Popup().setHTML(`
    <h3>${exp.title}</h3>
    <p>${exp.description}</p>
  `))
  .addTo(map)
})
```

#### Mobile App
**Location:** `apps/mobile/src/modules/map/`

**Key Files:**
- `pages/map.tsx` - Mobile map page
- `components/map-view.tsx` - Map component
- `services/location.ts` - Geolocation service

**Capacitor Geolocation:**
```typescript
import { Geolocation } from '@capacitor/geolocation'

// Get current position
const position = await Geolocation.getCurrentPosition()
const { latitude, longitude } = position.coords
```

---

## 📍 Phase 3: Report Experience Flow

### User Journey: Submit New Experience Report

#### Frontend (Web)
**Location:** `apps/web/src/app/(core)/(dashboard)/home/`

**Key Files:**
- `features/create-experience-card.tsx` - Report form
- `action/experience.ts` - Server action for submission

**Report Form Component:**
```typescript
// apps/web/src/app/(core)/(dashboard)/home/features/create-experience-card.tsx
export function CreateExperienceCard() {
  const [location, setLocation] = useState<{lat: number, lng: number}>()
  
  // Get current location
  const getCurrentLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      }
    )
  }
  
  // Submit form
  const handleSubmit = async (data: FormData) => {
    await createExperienceAction({
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      address: data.address,
      imageUrls: data.images
    })
  }
}
```

**Server Action:**
```typescript
// apps/web/src/action/experience.ts
export const createExperienceAction = actionClient
  .inputSchema(z.object({
    categoryId: z.string(),
    title: z.string().optional(),
    description: z.string().min(1),
    latitude: z.string(),
    longitude: z.string(),
    address: z.string(),
    imageUrls: z.array(z.string()).optional(),
  }))
  .action(async ({ parsedInput }) => {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error("Must be logged in")
    
    // Get session token
    const { data: { session } } = await supabase.auth.getSession()
    
    // Call backend API with authentication
    const response = await fetch(`${apiUrl}/experience`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsedInput)
    })
    
    return await response.json()
  })
```

#### Backend
**Location:** `apps/server/src/module/experience/`

**Create Experience Endpoint:**
```typescript
// POST /api/experience
.post("/", async ({ body, headers }) => {
  // Extract user from JWT token
  const userId = await AuthService.getUserIdFromToken(headers.authorization)
  
  // Create experience
  const newExperience = await ExperienceService.createExperience({
    ...body,
    reportedBy: userId
  })
  
  // Award XP for reporting
  await LevelingService.addExperience(userId, ACTIVITY_POINTS.ADD_EXPERIENCE) // +10 XP
  
  // Update activity points
  await ScoringService.recordActivity(userId, 'add_experience')
  
  // Check for badge unlocks
  await BadgesService.checkAndUnlockBadges(userId, 'reports_count')
  
  return { success: true, data: newExperience }
})
```

**Experience Service:**
```typescript
// apps/server/src/module/experience/service.ts
static async createExperience(data: CreateExperienceInput) {
  const [newExp] = await db.insert(experience).values({
    reportedBy: data.reportedBy,
    categoryId: data.categoryId,
    title: data.title,
    description: data.description,
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address,
    status: 'pending',
    priority: data.priority || 'medium',
    upvotes: 0,
    downvotes: 0
  }).returning()
  
  // Handle image uploads if provided
  if (data.imageUrls?.length) {
    await db.insert(experienceImage).values(
      data.imageUrls.map(url => ({
        experienceId: newExp.id,
        imageUrl: url
      }))
    )
  }
  
  return newExp
}
```

#### Mobile App
**Location:** `apps/mobile/src/modules/reporting/`

**Key Files:**
- `pages/report.tsx` - Mobile report page
- `components/experience-form.tsx` - Report form component
- `services/location.ts` - Location service

**Mobile Report Flow:**
```typescript
// Use device camera for photos
import { Camera } from '@capacitor/camera'

const takePhoto = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  })
  return image.webPath
}

// Get current location
import { Geolocation } from '@capacitor/geolocation'

const position = await Geolocation.getCurrentPosition()
```

---

## 🎖️ Phase 4: Gamification - XP & Leveling

### User Journey: Earn XP and Level Up

#### XP System Configuration
**Location:** `apps/server/src/db/schema/gamification.ts`

**XP Values:**
```typescript
export const ACTIVITY_POINTS = {
  ADD_EXPERIENCE: 10,
  FIX_EXPERIENCE: 20,
  VERIFY_EXPERIENCE: 15,
  SPONSOR_EXPERIENCE: 30,
} as const
```

**Leveling Config:**
```typescript
export const LEVELING_CONFIG = {
  BASE_EXPERIENCE: 100,
  EXPERIENCE_MULTIPLIER: 1.2,
  MAX_LEVEL: 100,
  
  // Calculate XP needed for specific level
  calculateExperienceForLevel: (level: number): number => {
    if (level <= 1) return 0
    return Math.floor(100 * Math.pow(1.2, level - 2))
  },
  
  // Calculate total XP for a level
  calculateTotalExperienceForLevel: (level: number): number => {
    let total = 0
    for (let i = 2; i <= level; i++) {
      total += LEVELING_CONFIG.calculateExperienceForLevel(i)
    }
    return total
  },
  
  // Get level from total XP
  calculateLevelFromExperience: (totalExperience: number): number => {
    let level = 1
    let requiredExp = 0
    
    while (level < 100) {
      const expForNextLevel = LEVELING_CONFIG.calculateExperienceForLevel(level + 1)
      if (totalExperience < requiredExp + expForNextLevel) break
      requiredExp += expForNextLevel
      level++
    }
    
    return level
  }
}
```

#### Leveling Service
**Location:** `apps/server/src/module/leveling/service.ts`

**Add Experience Method:**
```typescript
export class LevelingService {
  static async addExperience(userId: string, experiencePoints: number) {
    return await db.transaction(async (tx) => {
      // Get current user profile
      const profile = await tx.query.userProfile.findFirst({
        where: eq(userProfile.auth_user_id, userId)
      })
      
      if (!profile) {
        // Create new profile with initial XP
        const newLevel = LEVELING_CONFIG.calculateLevelFromExperience(experiencePoints)
        const expToNext = LEVELING_CONFIG.calculateExperienceToNextLevel(newLevel, experiencePoints)
        
        await tx.insert(userProfile).values({
          auth_user_id: userId,
          handle: `user_${userId.slice(0, 8)}`,
          level: newLevel,
          total_experience: experiencePoints,
          experience_to_next_level: expToNext
        })
        
        return {
          level: newLevel,
          totalExperience: experiencePoints,
          experienceToNextLevel: expToNext,
          leveledUp: newLevel > 1,
          levelsGained: newLevel - 1
        }
      }
      
      // Add XP to existing profile
      const newTotal = profile.total_experience + experiencePoints
      const newLevel = LEVELING_CONFIG.calculateLevelFromExperience(newTotal)
      const expToNext = LEVELING_CONFIG.calculateExperienceToNextLevel(newLevel, newTotal)
      
      const leveledUp = newLevel > profile.level
      const levelsGained = newLevel - profile.level
      
      await tx.update(userProfile)
        .set({
          level: newLevel,
          total_experience: newTotal,
          experience_to_next_level: expToNext,
          updated_at: new Date()
        })
        .where(eq(userProfile.auth_user_id, userId))
      
      // Send push notification if leveled up
      if (leveledUp) {
        await NotificationService.sendLevelUpNotification(userId, newLevel)
      }
      
      return {
        level: newLevel,
        totalExperience: newTotal,
        experienceToNextLevel: expToNext,
        leveledUp,
        levelsGained
      }
    })
  }
}
```

**Usage in Experience Creation:**
```typescript
// After creating experience
const levelingResult = await LevelingService.addExperience(
  userId, 
  ACTIVITY_POINTS.ADD_EXPERIENCE
)

if (levelingResult.leveledUp) {
  console.log(`🎉 User leveled up to level ${levelingResult.level}!`)
}
```

---

## 🏅 Phase 4B: Badges & Achievements

### User Journey: Unlock Badges

#### Badge Definition
**Location:** `apps/server/src/db/seeders/achievements.ts`

**Badge Structure:**
```typescript
{
  id: "quick_fix",
  name: "Quick Fix",
  description: "Awarded for fixing your first broken issue.",
  icon: "🔧",
  category: "fixer",
  points: 50,
  requirement: 1,
  requirementType: "fixes_count",
  rarity: "common"
}
```

**Badge Categories:**
- `fixer` - For fixing experiences
- `reporter` - For reporting experiences
- `sponsor` - For sponsoring experiences
- `community` - For community engagement

#### Badges Service
**Location:** `apps/server/src/module/badges/service.ts`

**Check and Unlock Badges:**
```typescript
export class BadgesService {
  static async checkAndUnlockBadges(
    userId: string, 
    requirementType: string
  ) {
    // Get user's activity stats
    const stats = await db.query.activityPoints.findFirst({
      where: eq(activityPoints.userId, userId)
    })
    
    if (!stats) return []
    
    // Get relevant count based on requirement type
    const count = requirementType === 'reports_count' 
      ? stats.experiencesAdded
      : requirementType === 'fixes_count'
      ? stats.experiencesFixed
      : 0
    
    // Find badges user is eligible for
    const eligibleBadges = await db.query.achievements.findMany({
      where: and(
        eq(achievements.requirementType, requirementType),
        lte(achievements.requirement, count)
      )
    })
    
    // Get badges user already has
    const existingBadges = await db.query.userAchievements.findMany({
      where: eq(userAchievements.userId, userId)
    })
    
    const existingBadgeIds = new Set(existingBadges.map(b => b.achievementId))
    
    // Unlock new badges
    const newBadges = []
    for (const badge of eligibleBadges) {
      if (!existingBadgeIds.has(badge.id)) {
        await db.insert(userAchievements).values({
          userId,
          achievementId: badge.id,
          progress: count,
          maxProgress: badge.requirement,
          isCompleted: true
        })
        
        // Award badge XP
        await LevelingService.addExperience(userId, badge.points)
        
        // Send notification
        await NotificationService.sendBadgeUnlockedNotification(
          userId, 
          badge
        )
        
        newBadges.push(badge)
      }
    }
    
    return newBadges
  }
}
```

**Frontend Badge Display:**
```typescript
// apps/web/src/features/achievements/badge-card.tsx
export function BadgeCard({ badge }: { badge: BadgeData }) {
  return (
    <div className={cn(
      "badge-card",
      badge.isObtained ? "obtained" : "locked"
    )}>
      <div className="badge-icon">
        {badge.isObtained ? badge.icon : "🔒"}
      </div>
      <h3>{badge.name}</h3>
      <p>{badge.description}</p>
      
      {!badge.isObtained && (
        <div className="progress">
          <ProgressBar 
            value={badge.progress} 
            max={badge.maxProgress} 
          />
          <span>{badge.progress}/{badge.maxProgress}</span>
        </div>
      )}
      
      {badge.isObtained && badge.unlockedAt && (
        <span className="unlocked-date">
          Unlocked {formatDate(badge.unlockedAt)}
        </span>
      )}
    </div>
  )
}
```

---

## 🏆 Phase 4C: Leaderboards

### User Journey: View Rankings

#### Frontend
**Location:** `apps/web/src/app/(core)/(dashboard)/leaderboard/`

**Key Files:**
- `page.tsx` - Leaderboard page
- `leaderboard-client.tsx` - Client component with filters

**Leaderboard Component:**
```typescript
export function LeaderboardClient() {
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all')
  const [category, setCategory] = useState<'overall' | 'fixers' | 'reporters'>('overall')
  
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard', timeframe, category],
    queryFn: async () => {
      const response = await eden.api.stats.leaderboard.get({
        $query: { timeframe, category }
      })
      return response.data
    }
  })
  
  return (
    <div>
      <h1>🏆 Leaderboard</h1>
      
      <div className="filters">
        <Select value={timeframe} onValueChange={setTimeframe}>
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="week">This Week</option>
        </Select>
        
        <Select value={category} onValueChange={setCategory}>
          <option value="overall">Overall</option>
          <option value="fixers">Top Fixers</option>
          <option value="reporters">Top Reporters</option>
        </Select>
      </div>
      
      <LeaderboardTable data={leaderboard} />
    </div>
  )
}
```

#### Backend
**Location:** `apps/server/src/module/stats/`

**Leaderboard Service:**
```typescript
// apps/server/src/module/stats/service.ts
export class StatsService {
  static async getLeaderboard(options: LeaderboardOptions) {
    // Base query
    let query = db
      .select({
        userId: activityPoints.userId,
        totalPoints: activityPoints.totalPoints,
        experiencesAdded: activityPoints.experiencesAdded,
        experiencesFixed: activityPoints.experiencesFixed,
        experiencesVerified: activityPoints.experiencesVerified,
        experiencesSponsored: activityPoints.experiencesSponsored,
        // Join user profile for display info
        displayName: userProfile.display_name,
        handle: userProfile.handle,
        avatarUrl: userProfile.avatar_url,
        level: userProfile.level
      })
      .from(activityPoints)
      .leftJoin(userProfile, eq(activityPoints.userId, userProfile.auth_user_id))
      .orderBy(desc(activityPoints.totalPoints))
      .limit(100)
    
    // Apply timeframe filter if needed
    if (options.timeframe !== 'all') {
      const startDate = options.timeframe === 'month'
        ? subMonths(new Date(), 1)
        : subWeeks(new Date(), 1)
      
      query = query.where(gte(activityPoints.updatedAt, startDate))
    }
    
    const results = await query
    
    // Add rank numbers
    return results.map((row, index) => ({
      ...row,
      rank: index + 1
    }))
  }
}
```

**Router Endpoint:**
```typescript
// GET /api/stats/leaderboard
.get("/leaderboard", async ({ query }) => {
  const leaderboard = await StatsService.getLeaderboard({
    timeframe: query.timeframe || 'all',
    category: query.category || 'overall'
  })
  
  return { success: true, data: leaderboard }
})
```

---

## 📲 Phase 6: Push Notifications

### User Journey: Receive Notifications

#### Notification Setup
**Location:** `apps/web/src/app/api/notifications/send/route.ts`

**Send Notification API:**
```typescript
export async function POST(req: Request) {
  // Admin authentication check
  if (req.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 })
  }
  
  const { userId, title, body, broadcast } = await req.json()
  
  // Get user's push subscriptions
  let query = supabaseAdmin.from('push_subscriptions').select('*')
  
  if (broadcast) {
    // Send to all users
  } else {
    // Send to specific user
    query = query.eq('user_id', userId)
  }
  
  const { data: subscriptions } = await query
  
  // Prepare notification payload
  const payload = JSON.stringify({
    title: `🔥 ${title}`,
    body: `${body} • Community Power`,
    icon: '/notification-icon.png',
    badge: '/notification-icon.png',
    vibrate: [100, 50, 100],
    data: {
      url: '/home',
      timestamp: Date.now()
    }
  })
  
  // Send to each subscription
  let sent = 0
  for (const sub of subscriptions ?? []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        },
        payload
      )
      sent++
    } catch (error) {
      // Clean up stale subscriptions
      if (error.statusCode === 404 || error.statusCode === 410) {
        await supabaseAdmin
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', sub.endpoint)
      }
    }
  }
  
  return new Response(JSON.stringify({ ok: true, sent }), { status: 200 })
}
```

**Notification Service (Backend):**
```typescript
// apps/server/src/lib/notifications.ts
export class NotificationService {
  static async sendLevelUpNotification(userId: string, newLevel: number) {
    await fetch(`${webAppUrl}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': process.env.ADMIN_TOKEN!
      },
      body: JSON.stringify({
        userId,
        title: 'Level Up!',
        body: `Congratulations! You're now Level ${newLevel}!`,
        broadcast: false
      })
    })
  }
  
  static async sendBadgeUnlockedNotification(
    userId: string, 
    badge: Achievement
  ) {
    await fetch(`${webAppUrl}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': process.env.ADMIN_TOKEN!
      },
      body: JSON.stringify({
        userId,
        title: 'Badge Unlocked!',
        body: `You earned the "${badge.name}" badge! +${badge.points} XP`,
        broadcast: false
      })
    })
  }
}
```

---

## 🔄 Complete Flow Examples

### Example 1: User Reports → Someone Fixes → Verification

```typescript
// Step 1: User A reports issue
// POST /api/experience
const newExperience = await ExperienceService.createExperience({
  reportedBy: userA_id,
  categoryId: "infrastructure_id",
  title: "Broken sidewalk",
  description: "Large crack creating trip hazard",
  latitude: "40.7128",
  longitude: "-74.0060",
  address: "123 Main St",
  status: "pending"
})
// User A earns +10 XP
await LevelingService.addExperience(userA_id, 10)
await BadgesService.checkAndUnlockBadges(userA_id, 'reports_count')

// Step 2: User B fixes issue
// PATCH /api/experience/:id/fix
await ExperienceService.markAsFixed(experience.id, {
  fixedBy: userB_id,
  fixDescription: "Repaired crack with concrete",
  afterPhotos: ["url1", "url2"]
})
// User B earns +20 XP
await LevelingService.addExperience(userB_id, 20)
await BadgesService.checkAndUnlockBadges(userB_id, 'fixes_count')

// Step 3: User C verifies fix
// POST /api/experience/:id/verify
await ExperienceService.verifyFix(experience.id, {
  verifiedBy: userC_id,
  verificationNotes: "Confirmed fix looks good"
})
// User C earns +15 XP
await LevelingService.addExperience(userC_id, 15)
// User B gets bonus reputation
await ScoringService.addVerificationBonus(userB_id, 5)
```

### Example 2: Voting Flow

```typescript
// User votes on experience
// POST /api/experience/:id/vote
await VoteService.castVote({
  experienceId: experience.id,
  userId: user.id,
  vote: true  // true = upvote, false = downvote
})

// Update experience vote counts
await db.update(experience)
  .set({ upvotes: experience.upvotes + 1 })
  .where(eq(experience.id, experienceId))

// Recalculate priority if needed
if (experience.upvotes > 10) {
  await ExperienceService.adjustPriority(experienceId, 'high')
}
```

---

## 🗄️ Database Schema Reference

### Key Tables

#### `user_profile`
```sql
CREATE TABLE user_profile (
  id UUID PRIMARY KEY,
  auth_user_id TEXT UNIQUE NOT NULL,
  handle VARCHAR(64) UNIQUE NOT NULL,
  display_name VARCHAR(120),
  role user_role DEFAULT 'reporter',
  level INTEGER DEFAULT 1,
  total_experience INTEGER DEFAULT 0,
  experience_to_next_level INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `experience`
```sql
CREATE TABLE experience (
  id UUID PRIMARY KEY,
  reported_by TEXT REFERENCES user_profile(auth_user_id),
  category_id UUID REFERENCES category(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  address TEXT NOT NULL,
  status VARCHAR DEFAULT 'pending',
  priority VARCHAR DEFAULT 'medium',
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `activity_points`
```sql
CREATE TABLE activity_points (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  experiences_added INTEGER DEFAULT 0,
  experiences_fixed INTEGER DEFAULT 0,
  experiences_verified INTEGER DEFAULT 0,
  experiences_sponsored INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `achievements`
```sql
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER NOT NULL,
  requirement INTEGER NOT NULL,
  requirement_type TEXT NOT NULL,
  rarity TEXT DEFAULT 'common',
  is_hidden BOOLEAN DEFAULT FALSE
);
```

#### `user_achievements`
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id TEXT REFERENCES achievements(id),
  progress INTEGER DEFAULT 0,
  max_progress INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔍 API Endpoints Reference

### Experience Endpoints
```
GET    /api/experience           - List experiences
POST   /api/experience           - Create experience
GET    /api/experience/:id       - Get single experience
PATCH  /api/experience/:id       - Update experience
DELETE /api/experience/:id       - Delete experience
POST   /api/experience/:id/vote  - Vote on experience
POST   /api/experience/:id/fix   - Mark as fixed
POST   /api/experience/:id/verify - Verify fix
```

### User/Profile Endpoints
```
GET    /api/user/profile         - Get current user profile
PATCH  /api/user/profile         - Update profile
GET    /api/user/stats           - Get user statistics
```

### Gamification Endpoints
```
GET    /api/achievements         - Get all badges with user status
GET    /api/achievements/obtained - Get user's obtained badges
GET    /api/stats/leaderboard    - Get leaderboard
```

### Category Endpoints
```
GET    /api/category             - List all categories
```

---

## 🚀 Development Workflow

### Adding a New Feature

1. **Define User Flow** (in USER_FLOW_GUIDE.md)
2. **Design Database Schema** (in `apps/server/src/db/schema/`)
3. **Create Migration** (`bun run db:push`)
4. **Build Backend Service** (in `apps/server/src/module/`)
5. **Create API Endpoints** (router.ts)
6. **Implement Frontend** (in `apps/web/src/`)
7. **Add Mobile Support** (in `apps/mobile/src/`)
8. **Test End-to-End**

### Example: Adding "Comments" Feature

```typescript
// 1. Schema
// apps/server/src/db/schema/comment.ts
export const comment = pgTable("comment", {
  id: uuid().primaryKey(),
  experienceId: uuid().references(() => experience.id),
  userId: text().notNull(),
  content: text().notNull(),
  createdAt: timestamp().defaultNow()
})

// 2. Service
// apps/server/src/module/comment/service.ts
export class CommentService {
  static async createComment(data: CreateCommentInput) {
    const newComment = await db.insert(comment).values(data).returning()
    // Award XP for engagement
    await LevelingService.addExperience(data.userId, 5)
    return newComment
  }
}

// 3. Router
// apps/server/src/module/comment/router.ts
export const commentRouter = new Elysia({ prefix: '/comment' })
  .post("/", async ({ body }) => {
    const comment = await CommentService.createComment(body)
    return { success: true, data: comment }
  })

// 4. Frontend
// apps/web/src/features/comments/comment-list.tsx
export function CommentList({ experienceId }: Props) {
  const { data: comments } = useQuery({
    queryKey: ['comments', experienceId],
    queryFn: () => eden.api.comment.index.get({ experienceId })
  })
  // ... render comments
}
```

---

## 📚 Additional Resources

### Key Documentation Files
- `USER_FLOW_GUIDE.md` - Complete user journey documentation
- `DEPLOYMENT.md` - Deployment instructions
- `SUPABASE_SETUP.md` - Database and auth setup
- `README.md` - Project overview

### External Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Elysia Docs](https://elysiajs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Supabase Docs](https://supabase.com/docs)
- [Mapbox GL JS](https://docs.mapbox.com/)
- [Capacitor](https://capacitorjs.com/docs)

---

**Last Updated:** October 2025  
**Version:** 1.0
