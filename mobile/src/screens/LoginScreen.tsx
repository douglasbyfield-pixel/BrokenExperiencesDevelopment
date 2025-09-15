import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View, StatusBar, SafeAreaView, TextInput, Alert } from 'react-native';
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        Alert.alert('Success', 'Check your email for confirmation link');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setIsAuthenticated(true);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Authentication failed');
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
  title: {
    fontSize: 42,
    fontFamily: 'Poppins-Bold',
  },
  titleSecondary: {
    fontSize: 42,
    textAlign: 'center',
    marginBottom: 12,
    color: '#18181B',
    letterSpacing: -2,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#334155',
    paddingHorizontal: 20,
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Medium',
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
    fontFamily: 'Poppins-Medium',
  },
  switchText: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'Poppins-Medium',
    marginBottom: 16,
    textDecorationLine: 'underline',
  },
  footerText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'Poppins-Regular',
  },
});
