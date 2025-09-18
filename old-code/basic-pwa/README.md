# BrokenExp React PWA

A modern React Progressive Web App for reporting and tracking community issues in Jamaica.

## 🚀 Features

- **Modern React 18** with hooks and functional components
- **Progressive Web App** with offline support
- **Interactive Map** with custom markers and clustering
- **Real-time Issue Reporting** with location services
- **Community Dashboard** with stats and analytics
- **User Authentication** with Supabase
- **Responsive Design** optimized for mobile and desktop
- **Styled Components** for modern, maintainable CSS

## 📱 PWA Features

- **Installable** - Add to home screen on mobile devices
- **Offline Support** - Basic functionality works without internet
- **Fast Loading** - Optimized bundle size and loading
- **Native Feel** - Smooth animations and intuitive UX

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router, Styled Components
- **Maps**: React Leaflet with OpenStreetMap
- **Backend**: Supabase (Database, Auth, Storage)
- **PWA**: Service Worker, Web App Manifest
- **Build**: Create React App

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 16+ and npm
- Supabase account and project

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Supabase**:
   - Update `src/services/supabase.js` with your Supabase URL and anon key
   - Set up your database schema (see Database Setup below)

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Serve production build**:
   ```bash
   npm run serve
   ```

## 🗄️ Database Setup

Create the following tables in your Supabase project:

### Issues Table
```sql
CREATE TABLE issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  latitude DECIMAL,
  longitude DECIMAL,
  address TEXT,
  image_url TEXT,
  reported_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Issues policies
CREATE POLICY "Anyone can view issues" ON issues FOR SELECT USING (true);
CREATE POLICY "Users can create issues" ON issues FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Users can update own issues" ON issues FOR UPDATE USING (auth.uid() = reported_by);

-- Profiles policies
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR ALL USING (auth.uid() = id);
```

## 📦 Project Structure

```
src/
├── components/           # Reusable UI components
│   └── BottomNav.js     # Bottom navigation
├── pages/               # Main application pages
│   ├── Login.js         # Authentication page
│   ├── Home.js          # Community dashboard
│   ├── Map.js           # Interactive map
│   ├── Report.js        # Issue reporting form
│   └── Profile.js       # User profile
├── services/            # External service integrations
│   ├── supabase.js      # Database and auth
│   └── AuthContext.js   # Authentication context
└── App.js              # Main application component
```

## 🎨 Design System

### Colors
- **Primary**: `#000000` (Black)
- **Background**: Linear gradient `#FFFFFF` to `#E0EFFF` (White to Light Blue)
- **Success**: `#22c55e` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Error**: `#ef4444` (Red)
- **Gray Scale**: `#f8fafc` to `#1e293b`

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)

### Components
- **Border Radius**: 8px (small), 12px (medium), 16px (large)
- **Shadows**: Layered box-shadows for depth
- **Animations**: Smooth 0.2s ease transitions

## 🌍 PWA Configuration

### Manifest Features
- **App Name**: BrokenExp
- **Theme Color**: `#000000`
- **Display Mode**: Standalone
- **Start URL**: `/home`
- **Icons**: Multiple sizes for different devices

### Service Worker
- **Caching Strategy**: Cache-first for static assets
- **Offline Support**: Basic navigation and cached content
- **Update Notifications**: Automatic updates on new deployments

## 📱 Mobile Optimization

- **Responsive Design**: Mobile-first approach
- **Touch Interactions**: Optimized for touch screens
- **Performance**: Optimized images and lazy loading
- **Native Feel**: iOS/Android style adaptations

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your Git repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy automatically on push

### Vercel
1. Import project from Git
2. Framework preset: Create React App
3. Deploy with zero configuration

### Manual Deployment
1. Build the project: `npm run build`
2. Upload the `build` folder to your web server
3. Configure server for SPA routing

## 🧪 Testing

Run the development server and test:

1. **Basic Functionality**:
   - User registration/login
   - Issue reporting with location
   - Map visualization
   - Profile management

2. **PWA Features**:
   - Install prompt on mobile
   - Offline functionality
   - Home screen icon

3. **Responsive Design**:
   - Mobile devices (320px+)
   - Tablets (768px+)
   - Desktop (1024px+)

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Customization
- **Colors**: Update styled-components color values
- **Fonts**: Change Google Fonts import in `public/index.html`
- **Icons**: Replace icon files in `public/` folder
- **Map Style**: Update tile layer URL in `Map.js`

## 📄 License

MIT License - feel free to use this project for your community initiatives!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in `/docs` folder
- Review Supabase documentation for backend setup

---

**Built with ❤️ for Jamaica's community** 🇯🇲