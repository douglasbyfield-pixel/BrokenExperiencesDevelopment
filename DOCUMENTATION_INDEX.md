# 📚 Broken Experiences - Documentation Index

## Overview

This is your central hub for all Broken Experiences platform documentation. Use this index to quickly find the information you need.

---

## 🎯 What is Broken Experiences?

**Broken Experiences** is a unified, gamified community platform where users report, fix, and track real-world issues in their neighborhoods. The platform encourages civic engagement through:

- 📍 **Location-based reporting** of infrastructure and service issues
- 🔧 **Community-driven fixes** where anyone can help resolve problems
- 🎮 **Gamification** with XP, levels, badges, and leaderboards
- 👥 **Single unified platform** - no separate apps for different user types
- 📱 **Cross-platform** support (Web PWA + iOS/Android)

---

## 📖 Documentation Files

### 1. **USER_FLOW_GUIDE.md** 📘
**Purpose:** Complete end-to-end user journey documentation  
**Audience:** Product managers, designers, developers, stakeholders  
**Length:** ~500 lines

**What's Inside:**
- ✅ Platform overview and core concepts
- ✅ Complete user journey from signup to advanced features
- ✅ Detailed flow for each major action (report, fix, vote, etc.)
- ✅ Gamification system explained (XP, leveling, badges)
- ✅ Leaderboard mechanics
- ✅ Notification system
- ✅ Mobile-specific features (PWA, camera, GPS)
- ✅ Visual flow diagrams
- ✅ Design principles and rationale
- ✅ Future enhancements roadmap

**When to Use:**
- Understanding how users interact with the platform
- Designing new features
- Onboarding team members
- Planning product roadmap
- Writing user stories
- Creating marketing materials

---

### 2. **TECHNICAL_FLOW_MAPPING.md** 🔧
**Purpose:** Maps user flows to actual code implementation  
**Audience:** Developers (frontend, backend, full-stack)  
**Length:** ~600 lines

**What's Inside:**
- ✅ Architecture overview
- ✅ Code location for each feature
- ✅ Step-by-step implementation flows
- ✅ Database schema details
- ✅ API endpoint documentation
- ✅ Service layer explanations
- ✅ Frontend component structure
- ✅ Authentication flow details
- ✅ Gamification implementation
- ✅ Complete working examples
- ✅ How to add new features

**When to Use:**
- Implementing new features
- Debugging existing functionality
- Understanding code organization
- API integration
- Database schema changes
- Code reviews
- Onboarding new developers

---

### 3. **QUICK_REFERENCE.md** ⚡
**Purpose:** Quick lookup guide for daily development  
**Audience:** Developers (all levels)  
**Length:** ~400 lines

**What's Inside:**
- ✅ Project structure overview
- ✅ XP and points system cheat sheet
- ✅ Badge categories quick list
- ✅ Common flow diagrams (condensed)
- ✅ API endpoints reference
- ✅ Database tables quick ref
- ✅ Frontend components map
- ✅ Common development tasks (commands)
- ✅ Debugging tips
- ✅ Environment variables
- ✅ Testing checklist
- ✅ Common issues & solutions
- ✅ Pro tips

**When to Use:**
- Daily development work
- Quick lookups (XP values, endpoints, etc.)
- Running common commands
- Troubleshooting
- Learning the codebase
- Keep it open while coding

---

### 4. **DOCUMENTATION_INDEX.md** 📚
**Purpose:** This file - central navigation for all docs  
**Audience:** Everyone  

---

## 🗺️ Documentation Navigation Guide

### "I want to understand..."

#### ...how users interact with the platform
→ **USER_FLOW_GUIDE.md**
- Read "Platform Overview" section
- Check "Complete User Journey" section
- Review flow diagrams at the end

#### ...the gamification system
→ **USER_FLOW_GUIDE.md** → Phase 4: Gamification System
- XP sources and amounts
- Leveling formula
- Badge categories
- Leaderboard mechanics

#### ...how to implement a feature
→ **TECHNICAL_FLOW_MAPPING.md**
- Find similar feature in the guide
- Follow the code examples
- Check "Adding a New Feature" section

#### ...where specific code lives
→ **TECHNICAL_FLOW_MAPPING.md** → Architecture Overview
- Locate feature in the file structure
- Check the code location references
- Review the implementation examples

#### ...API endpoints and schemas
→ **QUICK_REFERENCE.md** → API Endpoints Cheat Sheet
→ **QUICK_REFERENCE.md** → Database Tables Quick Ref

#### ...development commands
→ **QUICK_REFERENCE.md** → Common Development Tasks

#### ...how to debug an issue
→ **QUICK_REFERENCE.md** → Debugging Tips
→ **QUICK_REFERENCE.md** → Common Issues & Solutions

---

## 🎓 Learning Path

### For New Developers

**Day 1: Understanding the Platform**
1. Read **USER_FLOW_GUIDE.md** (sections 1-3)
   - Understand what the platform does
   - Learn the user journey
   - See how everything connects

2. Skim **QUICK_REFERENCE.md**
   - Get familiar with structure
   - Bookmark for later reference

**Day 2-3: Technical Deep Dive**
1. Read **TECHNICAL_FLOW_MAPPING.md** (Architecture section)
   - Understand tech stack
   - See how frontend/backend connect
   - Review database schema

2. Follow one complete flow in **TECHNICAL_FLOW_MAPPING.md**
   - Choose "Report Experience Flow"
   - Trace through all code files
   - Run the code locally

**Week 1: Hands-On Practice**
1. Set up development environment
   - Use **QUICK_REFERENCE.md** for commands
   - Follow setup in README.md

2. Make a small change
   - Use **TECHNICAL_FLOW_MAPPING.md** as guide
   - Test locally
   - Submit PR

**Ongoing: Reference As Needed**
- Keep **QUICK_REFERENCE.md** open while coding
- Refer to **TECHNICAL_FLOW_MAPPING.md** when implementing features
- Check **USER_FLOW_GUIDE.md** when designing UX

---

### For Product/Design

**Understanding the Product**
1. **USER_FLOW_GUIDE.md** (complete read)
   - Understand all features
   - See user journeys
   - Review design principles

**Planning New Features**
1. Check **USER_FLOW_GUIDE.md** → Design Principles
2. Review similar existing flows
3. Document new flow following same format
4. Share with dev team who can use **TECHNICAL_FLOW_MAPPING.md** to implement

---

### For QA/Testing

**Test Planning**
1. **USER_FLOW_GUIDE.md** → Complete User Journey
   - Map out test scenarios
   - Identify critical paths
   - Create test cases

2. **QUICK_REFERENCE.md** → Testing Checklist
   - Use as test template
   - Verify all points

**Bug Investigation**
1. **QUICK_REFERENCE.md** → Common Issues
   - Check if it's a known issue
   - Find solution steps

2. **TECHNICAL_FLOW_MAPPING.md** → Relevant flow
   - Understand expected behavior
   - Identify where it breaks

---

## 🔍 Quick Lookup Table

| I Need To... | Go To... |
|--------------|----------|
| Understand user journey | **USER_FLOW_GUIDE.md** |
| Find XP values | **QUICK_REFERENCE.md** → XP & Points System |
| Locate code file | **TECHNICAL_FLOW_MAPPING.md** → Architecture |
| Check API endpoints | **QUICK_REFERENCE.md** → API Endpoints |
| See badge list | **QUICK_REFERENCE.md** → Badge Categories |
| Implement feature | **TECHNICAL_FLOW_MAPPING.md** → Relevant section |
| Debug issue | **QUICK_REFERENCE.md** → Debugging Tips |
| Run commands | **QUICK_REFERENCE.md** → Development Tasks |
| Understand gamification | **USER_FLOW_GUIDE.md** → Phase 4 |
| Check database schema | **QUICK_REFERENCE.md** → Database Tables |

---

## 📊 Document Comparison

| Aspect | USER_FLOW_GUIDE | TECHNICAL_FLOW_MAPPING | QUICK_REFERENCE |
|--------|----------------|----------------------|-----------------|
| **Focus** | User experience | Code implementation | Quick lookup |
| **Audience** | Non-technical + Technical | Developers | Developers |
| **Detail Level** | High-level concepts | Deep technical | Condensed essentials |
| **Use Case** | Planning, design | Development | Daily coding |
| **Read Time** | 30-45 min | 45-60 min | 10-15 min |
| **Format** | Narrative | Tutorial-style | Reference tables |

---

## 🔄 Keeping Documentation Updated

### When to Update Docs

**New Feature Added:**
1. Add user flow to **USER_FLOW_GUIDE.md**
2. Add technical implementation to **TECHNICAL_FLOW_MAPPING.md**
3. Add quick reference entries to **QUICK_REFERENCE.md**

**XP/Badge Values Changed:**
1. Update **USER_FLOW_GUIDE.md** → Gamification section
2. Update **QUICK_REFERENCE.md** → XP & Points System
3. Update code in `apps/server/src/db/schema/gamification.ts`

**API Endpoint Changed:**
1. Update **TECHNICAL_FLOW_MAPPING.md** → API section
2. Update **QUICK_REFERENCE.md** → API Endpoints
3. Update any frontend code using the endpoint

**New Database Table:**
1. Update **TECHNICAL_FLOW_MAPPING.md** → Database Schema
2. Update **QUICK_REFERENCE.md** → Database Tables
3. Document relationships and usage

---

## 🌟 Documentation Best Practices

### When Writing New Docs

1. **Start with the user perspective**
   - What problem does this solve?
   - How does the user interact with it?

2. **Show, don't just tell**
   - Include code examples
   - Add flow diagrams
   - Use visual aids

3. **Be consistent**
   - Follow existing doc structure
   - Use same terminology
   - Match coding style

4. **Keep it practical**
   - Real-world examples
   - Common use cases
   - Actual code snippets

5. **Link related sections**
   - Cross-reference between docs
   - Point to relevant code files
   - Connect user flows to tech implementation

---

## 🚀 Getting Started Checklist

### New Team Member Onboarding

- [ ] Read this **DOCUMENTATION_INDEX.md**
- [ ] Read **USER_FLOW_GUIDE.md** (overview + first 3 phases)
- [ ] Bookmark **QUICK_REFERENCE.md**
- [ ] Set up development environment (see README.md)
- [ ] Read **TECHNICAL_FLOW_MAPPING.md** (architecture section)
- [ ] Clone repository and run locally
- [ ] Follow one complete flow in **TECHNICAL_FLOW_MAPPING.md**
- [ ] Make a small test change
- [ ] Ask questions in team chat
- [ ] Review additional docs (DEPLOYMENT.md, SUPABASE_SETUP.md)

---

## 📞 Additional Resources

### Other Documentation Files

| File | Purpose |
|------|---------|
| README.md | Project setup and overview |
| DEPLOYMENT.md | Deployment instructions (Vercel) |
| DOKPLOY_DEPLOYMENT.md | Dokploy deployment guide |
| SUPABASE_SETUP.md | Database and auth configuration |
| MAP_STYLE_GUIDE.md | Mapbox styling guide |
| PERFORMANCE_OPTIMIZATION_GUIDE.md | Performance tips |

### External Links

- [Project Repository](https://github.com/BrokenExperiencesIntellibus/BrokenExperiencesDevelopment)
- [Staging Environment](#) (TBD)
- [Production Environment](#) (TBD)
- [API Documentation](#) (TBD - Swagger/OpenAPI)

---

## 📝 Document Versions

| Document | Version | Last Updated | Author |
|----------|---------|--------------|--------|
| USER_FLOW_GUIDE.md | 1.0 | Oct 2025 | Team |
| TECHNICAL_FLOW_MAPPING.md | 1.0 | Oct 2025 | Team |
| QUICK_REFERENCE.md | 1.0 | Oct 2025 | Team |
| DOCUMENTATION_INDEX.md | 1.0 | Oct 2025 | Team |

---

## 💡 Tips for Using These Docs

1. **Bookmark this index** - Your starting point for all documentation
2. **Use Cmd/Ctrl+F** - Search within docs for specific topics
3. **Keep QUICK_REFERENCE.md open** - While coding for instant lookups
4. **Follow the learning path** - Structured approach for new developers
5. **Cross-reference** - Connect user flows to technical implementation
6. **Update as you go** - Found something missing? Add it!
7. **Share knowledge** - Help improve docs for the next person

---

## 🎯 Success Metrics

These documents are successful if:

✅ **New developers** can get up to speed in < 1 week  
✅ **Common questions** are answered in docs (not Slack)  
✅ **Feature implementation** follows consistent patterns  
✅ **Code reviews** reference doc sections  
✅ **Product decisions** align with documented principles  
✅ **Bugs** are reduced through better understanding  
✅ **Onboarding** is smooth and self-service  

---

## 🙏 Contributing to Docs

Found something unclear? Want to add examples? See a typo?

1. Open an issue or PR
2. Follow existing doc structure
3. Add value, don't just add words
4. Keep it practical and actionable
5. Update this index if needed

---

**Welcome to Broken Experiences! 🚀**

*These docs are your roadmap to building and understanding our platform. Use them, improve them, and share them.*

---

**Documentation Index Version:** 1.0  
**Last Updated:** October 2025  
**Maintained By:** Broken Experiences Team
