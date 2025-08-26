import React, { useState, useEffect, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Dimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Smooth entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();


  }, []);

  const handleButtonPress = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAuth = async () => {
    handleButtonPress();
    
    try {
      if (isSignUp) {
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
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >


      {/* Clean title text */}
      <Text style={styles.title}>BROKEN</Text>
      <Text style={styles.titleSecondary}>EXPERIENCES</Text>
      <Text style={styles.subtitle}>Report issues in your community</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.switchText}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  glitchOverlay: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  glitchRed: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#dc2626',
    mixBlendMode: 'screen',
    opacity: 0.3,
  },
  glitchBlue: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#2563eb',
    mixBlendMode: 'screen',
    opacity: 0.3,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: -2,
    color: '#000',
    letterSpacing: -2,
    textShadowColor: '#00000040',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  letterB: {},
  letterR: {},
  letterO: {},
  letterK: {},
  letterE1: {},
  letterN: {},
  titleSecondary: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    color: '#000',
    letterSpacing: -2,
    textShadowColor: '#00000040',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 50,
    color: '#666',
    fontWeight: '500',
    lineHeight: 24,
  },

  crackLine1: {
    position: 'absolute',
    top: height * 0.3,
    left: -20,
    width: width * 0.4,
    height: 2,
    backgroundColor: '#000',
    opacity: 0.1,
    transform: [{ rotate: '15deg' }],
  },
  crackLine2: {
    position: 'absolute',
    bottom: height * 0.35,
    right: -30,
    width: width * 0.35,
    height: 1,
    backgroundColor: '#000',
    opacity: 0.08,
    transform: [{ rotate: '-25deg' }],
  },
  input: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    fontSize: 17,
    borderWidth: 3,
    borderColor: '#000',
    fontWeight: '600',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    letterSpacing: 0.5,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 2,
    borderColor: '#000',
  },
  buttonText: {
    color: 'white',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  switchText: {
    textAlign: 'center',
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
    textDecorationLine: 'underline',
    letterSpacing: 0.5,
  },
  debris1: {
    position: 'absolute',
    top: height * 0.25,
    left: width * 0.33,
    width: 8,
    height: 8,
    backgroundColor: '#6b7280',
    borderRadius: 4,
  },
  debris2: {
    position: 'absolute',
    top: height * 0.33,
    right: width * 0.25,
    width: 4,
    height: 4,
    backgroundColor: '#9ca3af',
    borderRadius: 2,
  },
  debris3: {
    position: 'absolute',
    bottom: height * 0.33,
    left: width * 0.25,
    width: 12,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  debris4: {
    position: 'absolute',
    bottom: height * 0.25,
    right: width * 0.33,
    width: 4,
    height: 8,
    backgroundColor: '#4b5563',
    borderRadius: 2,
  },
  debris5: {
    position: 'absolute',
    top: height * 0.67,
    left: width * 0.67,
    width: 8,
    height: 4,
    backgroundColor: '#6b7280',
    borderRadius: 2,
  },
  debris6: {
    position: 'absolute',
    top: height * 0.5,
    right: width * 0.5,
    width: 4,
    height: 4,
    backgroundColor: '#9ca3af',
    borderRadius: 2,
  },
});