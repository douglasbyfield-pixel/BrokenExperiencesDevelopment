# OAuth Setup Guide

This guide explains how to configure Google and Apple sign-in for your app.

## Google Sign-In Setup

### 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"

### 2. Create OAuth Clients

Create 3 OAuth client IDs:

#### Web Application (for Supabase)
- Application type: **Web application**
- Name: `BrokenExp Web Client`
- Authorized redirect URIs: `https://your-project-id.supabase.co/auth/v1/callback`

#### iOS Application
- Application type: **iOS**
- Name: `BrokenExp iOS`
- Bundle ID: Your iOS bundle identifier (e.g., `com.brokenexp.mobile`)

#### Android Application
- Application type: **Android**
- Name: `BrokenExp Android`
- Package name: Your Android package name
- SHA-1 certificate fingerprint: Get from `expo credentials:manager`

### 3. Update AuthService Configuration

Replace the placeholder client IDs in `src/services/authService.ts`:

```typescript
const GOOGLE_WEB_CLIENT_ID = 'your-web-client-id.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'your-ios-client-id.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = 'your-android-client-id.googleusercontent.com';
```

### 4. Configure Supabase

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable **Google** provider
3. Add your **Web Client ID** and **Client Secret**
4. Set redirect URL: `https://your-project-id.supabase.co/auth/v1/callback`

## Apple Sign-In Setup

### 1. Apple Developer Configuration

1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Certificates, Identifiers & Profiles → Identifiers
3. Select your App ID
4. Enable **Sign In with Apple** capability
5. Configure Sign In with Apple:
   - Primary App ID: Select your app
   - Group with existing Primary App ID (if applicable)

### 2. Create Service ID (for Web/Supabase)

1. Create new identifier → **Services IDs**
2. Description: `BrokenExp Web Service`
3. Identifier: `com.brokenexp.service`
4. Enable **Sign In with Apple**
5. Configure domains:
   - Primary App ID: Your app's identifier
   - Domain: `your-project-id.supabase.co`
   - Return URL: `https://your-project-id.supabase.co/auth/v1/callback`

### 3. Create Private Key

1. Certificates, Identifiers & Profiles → Keys
2. Register new key
3. Key name: `BrokenExp Apple Auth Key`
4. Enable **Sign In with Apple**
5. Configure → Select your Primary App ID
6. Download the `.p8` key file (save securely!)
7. Note the **Key ID** and **Team ID**

### 4. Configure Supabase

1. Supabase Dashboard → Authentication → Providers
2. Enable **Apple** provider
3. Configure with:
   - **Services ID**: `com.brokenexp.service`
   - **Team ID**: Your Apple Team ID
   - **Key ID**: From the private key
   - **Private Key**: Contents of the `.p8` file

## App Configuration

### 1. Update app.json/app.config.js

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.brokenexp.mobile",
      "usesAppleSignIn": true
    },
    "android": {
      "package": "com.brokenexp.mobile",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### 2. Add Google Services File (Android)

1. Download `google-services.json` from Firebase Console
2. Place in project root: `mobile/google-services.json`

### 3. iOS Entitlements

For iOS builds, ensure Apple Sign-In entitlement is included:

```xml
<key>com.apple.developer.applesignin</key>
<array>
    <string>Default</string>
</array>
```

## Testing

### Development
- Google: Works in Expo Go and development builds
- Apple: Requires development build (not available in Expo Go)

### Production
- Both Google and Apple require proper app store builds
- Ensure OAuth redirect URLs match your production Supabase instance

## Environment Variables (Optional)

Create `.env` file for sensitive configuration:

```env
GOOGLE_WEB_CLIENT_ID=your-web-client-id.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.googleusercontent.com
```

Then update `authService.ts` to use environment variables:

```typescript
import Constants from 'expo-constants';

const GOOGLE_WEB_CLIENT_ID = Constants.expoConfig?.extra?.googleWebClientId || 'your-fallback-id';
```

## Troubleshooting

### Google Sign-In Issues
- Verify client IDs match exactly
- Check SHA-1 fingerprints for Android
- Ensure bundle ID matches for iOS
- Check Supabase redirect URLs

### Apple Sign-In Issues
- Verify Service ID configuration
- Check domain and return URL settings
- Ensure private key is correct format
- Apple Sign-In requires iOS 13+ and development builds

### Common Errors
- `DEVELOPER_ERROR`: Wrong client ID or configuration
- `SIGN_IN_CANCELLED`: User cancelled (normal behavior)
- `PLAY_SERVICES_NOT_AVAILABLE`: Android device doesn't support Google Play