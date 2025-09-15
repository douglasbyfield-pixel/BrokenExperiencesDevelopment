import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View, StatusBar, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import GoogleIcon from '../assets/GoogleIcon';
import AppleIcon from '../assets/AppleIcon';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { setIsAuthenticated } = useAuth();

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }
        if (password.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters long');
          return;
        }
        
        console.log('Attempting to sign up user:', email);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        console.log('Sign up successful:', data);
        Alert.alert('Success', 'Account created! You can now sign in.');
        setIsSignUp(false); // Switch to sign in mode
      } else {
        console.log('Attempting to sign in user:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        console.log('Sign in successful:', data);
        // The AuthContext will handle setting isAuthenticated via onAuthStateChange
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      
      Alert.alert('Success', 'Supabase connection working!');
      console.log('Connection test successful');
    } catch (error) {
      console.error('Connection test failed:', error);
      Alert.alert('Error', 'Supabase connection failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#E0EFFF']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>BROKEN</Text>
            <Text style={styles.titleSecondary}>EXPERIENCES</Text>
            <Text style={styles.subtitle}>Report and fix issues in your community.</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            )}
            <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
              <Text style={styles.authButtonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.testButton} onPress={testConnection}>
              <Text style={styles.testButtonText}>Test Connection</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => console.log('Continue with Google')}>
                <GoogleIcon />
                <Text style={styles.buttonText}>Continue with Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => console.log('Continue with Apple')}>
                <AppleIcon />
                <Text style={styles.buttonText}>Continue with Apple</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.switchText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  titleSecondary: {
    fontSize: 42,
    textAlign: 'center',
    marginBottom: 12,
    color: '#18181B',
    letterSpacing: -2,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#334155',
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    gap: 12,
  },
  input: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  authButton: {
    backgroundColor: '#18181B',
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#18181B',
    letterSpacing: -0.015,
    fontWeight: '500',
  },
  switchText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    marginBottom: 16,
    textDecorationLine: 'underline',
  },
  footerText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
