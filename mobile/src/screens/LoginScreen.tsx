import React, { useState, useEffect, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { supabase } from '../services/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Parallel animations for smooth entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
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
      <Text style={styles.title}>BrokenExperiences</Text>
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
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 50,
    color: '#666',
    fontWeight: '500',
    lineHeight: 24,
  },
  input: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#000',
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  switchText: {
    textAlign: 'center',
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});