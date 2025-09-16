# App Sharing Instructions

## Option 1: Using Expo Go (Development)

1. **Publish to Expo**:
   ```bash
   npx expo publish
   ```

2. **Share the Link**:
   - After publishing, you'll get a URL like: `exp://u.expo.dev/update/[update-id]`
   - Share this link with testers
   - They need to install Expo Go app on their device
   - Open the link in Expo Go

## Option 2: Development Build with EAS

1. **Create a development build**:
   ```bash
   eas build --profile development --platform android
   ```

2. **Share the APK**:
   - Download the APK from the EAS build page
   - Share the APK file directly
   - Users can install it on their Android devices

## Option 3: Production Build

1. **Create a production build**:
   ```bash
   eas build --profile production --platform android
   ```

2. **For iOS**:
   ```bash
   eas build --profile production --platform ios
   ```

## Option 4: Using ngrok for Local Development

1. **Install ngrok**:
   ```bash
   npm install -g ngrok
   ```

2. **Start your Metro bundler**:
   ```bash
   npx expo start
   ```

3. **In another terminal, expose your local server**:
   ```bash
   ngrok http 8081
   ```

4. **Share the ngrok URL** with your testers

## Important: Backend Configuration

Your app uses Supabase which is already accessible from any network. The current configuration in `.env` points to:
- URL: https://yvsmfemwyfexaelthoed.supabase.co

This is already accessible from any network, so no changes needed for the backend.

## Quick Start (Recommended)

For immediate sharing, use Option 2 (EAS Development Build):

```bash
# Make sure you're logged in to EAS
eas login

# Build for Android
eas build --profile development --platform android

# The build will be available at the URL provided after completion
```