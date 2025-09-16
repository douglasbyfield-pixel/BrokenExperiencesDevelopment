# BrokenExp PWA - Supabase Integration

This PWA now includes full Supabase backend integration matching your native app functionality.

## 🔧 Setup Instructions

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy your:
   - **Project URL** (looks like: `https://your-project-ref.supabase.co`)
   - **anon/public key** (the anon key)

### 2. Configure the PWA

✅ **Already configured!** The PWA is now using your actual Supabase credentials from the native app:
- **Project URL**: `https://yvsmfemwyfexaelthoed.supabase.co`
- **Anon Key**: Configured in `js/supabase.js`

### 3. Use the Real Integration

**For Mock Data (Testing):**
- Use `index.html` and `home.html` (current files)
- These use simulated data and local storage

**For Real Supabase Data:**
- Use `index-real.html` and `home-real.html`
- These connect to your actual Supabase database

## 📁 File Structure

### Core Files:
- `js/supabase.js` - Supabase client configuration
- `js/dataService.js` - Database operations (matches native app)
- `js/authService.js` - Authentication service
- `js/auth-real.js` - Real Supabase auth UI
- `js/home-real.js` - Real Supabase home page

### HTML Files:
- `index-real.html` - Login page with real Supabase auth
- `home-real.html` - Home page with real database data

## 🚀 Features Integrated

### ✅ Authentication
- Email/password sign up and sign in
- Google OAuth (configured for web)
- Apple OAuth (configured for web)
- User profile creation
- Session management
- Sign out functionality

### ✅ Issues Management
- Fetch issues from database
- Real-time upvoting with database sync
- Bookmark issues with database sync
- Filter issues by status and priority
- Community stats from real data
- User-specific data (upvotes, bookmarks)

### ✅ Database Operations
- Full CRUD operations for issues
- Comments system
- User profiles
- Upvotes and bookmarks tracking
- Community statistics

## 🎯 Database Schema

The PWA expects the following Supabase tables (matching your native app):

- `issues` - Community issues
- `profiles` - User profiles  
- `comments` - Issue comments
- `upvotes` - Issue upvotes
- `bookmarks` - User bookmarks

## 🔄 Migration Path

1. **Start with Mock Data** - Test with `index.html` and `home.html`
2. **Configure Supabase** - Update credentials in `js/supabase.js`
3. **Test Real Data** - Switch to `index-real.html` and `home-real.html`
4. **Deploy** - Both versions work, choose based on your needs

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure your domain is added to Supabase allowed origins
2. **Auth Errors**: Check your OAuth provider settings in Supabase
3. **Database Errors**: Verify your RLS policies allow the operations
4. **Missing Data**: Ensure your database tables exist and have data

### Debug Mode:
- Open browser DevTools
- Check Console for detailed error messages
- All operations include extensive logging

## 🔒 Security Notes

- The PWA uses Supabase RLS (Row Level Security)
- Users can only modify their own data
- Auth state is managed securely
- OAuth redirects are properly configured

## 📱 PWA Features Maintained

- ✅ Offline functionality via Service Worker
- ✅ Installable as native app
- ✅ Push notifications ready
- ✅ Responsive design
- ✅ Dark mode support

The Supabase integration maintains all PWA capabilities while adding real backend functionality!

## 🚀 **Ready to Use:**

✅ **No setup required!** The PWA is pre-configured with your Supabase credentials.

**Choose your version:**
- **Testing with Mock Data**: Use `index.html` and `home.html` 
- **Real Database Integration**: Use `index-real.html` and `home-real.html`

**To test the real integration:**
1. Open `index-real.html` in your browser at http://localhost:3000/index-real.html
2. Sign in with your existing account or create a new one
3. View real issues from your Supabase database