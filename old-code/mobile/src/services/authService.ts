import { Platform, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';

// Conditional imports for native modules
let GoogleSignin: any = null;
let statusCodes: any = null;

try {
  const googleSignInModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSignInModule.GoogleSignin;
  statusCodes = googleSignInModule.statusCodes;
} catch (error) {
  console.log('Google Sign-In not available in this environment (requires development build)');
}

// Configuration
const GOOGLE_WEB_CLIENT_ID = 'your-google-web-client-id.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = 'your-google-ios-client-id.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = 'your-google-android-client-id.googleusercontent.com';

export class AuthService {
  static isGoogleSignInAvailable() {
    return GoogleSignin !== null;
  }

  static async initializeGoogleSignIn() {
    if (!GoogleSignin) {
      console.log('Google Sign-In not available - requires development build');
      return false;
    }
    
    try {
      await GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        iosClientId: Platform.OS === 'ios' ? GOOGLE_IOS_CLIENT_ID : undefined,
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });
      console.log('Google Sign-In configured successfully');
      return true;
    } catch (error) {
      console.error('Error configuring Google Sign-In:', error);
      return false;
    }
  }

  static async signInWithGoogle() {
    if (!GoogleSignin) {
      Alert.alert(
        'Google Sign-In Unavailable', 
        'Google Sign-In requires a development build. It\'s not available in Expo Go.'
      );
      return { success: false, message: 'Google Sign-In requires development build' };
    }

    try {
      console.log('Starting Google Sign-In...');
      
      // Initialize Google Sign-In if not already done
      const initialized = await this.initializeGoogleSignIn();
      if (!initialized) {
        throw new Error('Failed to initialize Google Sign-In');
      }
      
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices();
      
      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In successful:', userInfo.data?.user.email);
      
      if (userInfo.data?.idToken) {
        // Sign in to Supabase with Google ID token
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });
        
        if (error) {
          console.error('Supabase Google sign-in error:', error);
          throw error;
        }
        
        console.log('Supabase Google sign-in successful');
        return { success: true, user: data.user };
      } else {
        throw new Error('No ID token received from Google');
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      
      if (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) {
        return { success: false, cancelled: true };
      } else if (statusCodes && error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Sign-In in Progress', 'Google sign-in is already in progress');
        return { success: false, message: 'Sign-in in progress' };
      } else if (statusCodes && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play Services', 'Google Play Services are not available on this device');
        return { success: false, message: 'Google Play Services not available' };
      } else {
        Alert.alert('Google Sign-In Error', error.message || 'Failed to sign in with Google');
        return { success: false, error: error.message };
      }
    }
  }

  static async signInWithApple() {
    try {
      console.log('Starting Apple Sign-In...');
      
      // Check if Apple Sign-In is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Apple Sign-In Unavailable', 'Apple Sign-In is not available on this device');
        return { success: false, message: 'Apple Sign-In not available' };
      }
      
      // Generate a random nonce
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce,
        { encoding: Crypto.CryptoEncoding.BASE64URL }
      );
      
      // Request Apple authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      
      console.log('Apple Sign-In successful:', credential.email);
      
      if (credential.identityToken) {
        // Sign in to Supabase with Apple ID token
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
          nonce,
        });
        
        if (error) {
          console.error('Supabase Apple sign-in error:', error);
          throw error;
        }
        
        // Update user profile with Apple data if available
        if (credential.fullName?.givenName || credential.fullName?.familyName) {
          const displayName = [credential.fullName.givenName, credential.fullName.familyName]
            .filter(Boolean)
            .join(' ');
          
          if (displayName && data.user) {
            await supabase.auth.updateUser({
              data: { full_name: displayName }
            });
          }
        }
        
        console.log('Supabase Apple sign-in successful');
        return { success: true, user: data.user };
      } else {
        throw new Error('No identity token received from Apple');
      }
    } catch (error: any) {
      console.error('Apple Sign-In error:', error);
      
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return { success: false, cancelled: true };
      } else {
        Alert.alert('Apple Sign-In Error', error.message || 'Failed to sign in with Apple');
        return { success: false, error: error.message };
      }
    }
  }

  static async signOut() {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Sign out from Google if available and signed in
      if (GoogleSignin) {
        try {
          if (await GoogleSignin.isSignedIn()) {
            await GoogleSignin.signOut();
          }
        } catch (error) {
          console.log('Google sign-out not available:', error);
        }
      }
      
      console.log('Sign-out successful');
      return { success: true };
    } catch (error: any) {
      console.error('Sign-out error:', error);
      return { success: false, error: error.message };
    }
  }
}