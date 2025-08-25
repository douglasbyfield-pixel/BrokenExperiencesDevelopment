# BrokenExperiences
See Link - https://docs.google.com/document/d/153r162G8cySUiv5S7BfsZQdG2O8hiFTE7s2VbKya3ic/edit?usp=sharing


/n
A React Native app for reporting and tracking infrastructure issues in your community.

## What it does

Report broken stuff in your area - potholes, broken streetlights, damaged signs, etc. Connect with people who can fix them.

## Tech Stack

- **React Native** - Mobile app
- **Supabase** - Backend (database, auth, storage)
- **TypeScript** - Code safety

## Getting Started

```bash
# Clone repo
git clone https://github.com/[username]/BrokenExperiences.git
cd BrokenExperiences

# Install
npm install

# Add your Supabase keys to .env
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key

# Run
npm start
```

## Features

- 📍 Report issues with location
- 📸 Add photos
- 🗺️ View issues on map
- 👤 User accounts
- 📱 Real-time updates

## Project Structure

```
/mobile          # React Native app
/supabase        # Database & backend functions
```

## MVP Plan

1. **Auth & Profiles** - Sign up, login, user profiles
2. **Report Issues** - Create reports with photos and location
3. **View Issues** - Map view and list of nearby problems
4. **Updates** - Track status changes

## Contributing

Need help with:
- React Native development
- Supabase backend setup
- UI/UX design

## License

MIT
