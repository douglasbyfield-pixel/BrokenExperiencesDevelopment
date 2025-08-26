import React, { useState, useEffect, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Dimensions } from 'react-native';
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
  const glitchAnim = useRef(new Animated.Value(0)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

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

    // Floating animations for decorative elements
    const startFloatingAnimations = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim1, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim1, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim2, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim2, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim3, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim3, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    setTimeout(startFloatingAnimations, 1000);

    // Subtle glitch effect every 8 seconds
    const glitchInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(glitchAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(glitchAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, 8000);

    return () => clearInterval(glitchInterval);
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
      {/* Floating decorative elements */}
      <Animated.View
        style={[
          styles.floatingElement1,
          {
            transform: [
              {
                translateY: floatAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -15],
                }),
              },
              {
                rotate: floatAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '5deg'],
                }),
              },
            ],
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.floatingIcon}>🔒</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingElement2,
          {
            transform: [
              {
                translateY: floatAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 12],
                }),
              },
              {
                rotate: floatAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-3deg'],
                }),
              },
            ],
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.floatingIcon}>📧</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingElement3,
          {
            transform: [
              {
                translateY: floatAnim3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -8],
                }),
              },
              {
                scale: floatAnim3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                }),
              },
            ],
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.floatingIcon}>✨</Text>
      </Animated.View>

      {/* Crack line decorative elements */}
      <Animated.View style={[styles.crackLine1, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.crackLine2, { opacity: fadeAnim }]} />

      <Animated.Text 
        style={[
          styles.title,
          {
            transform: [
              {
                translateX: glitchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 2],
                }),
              },
            ],
          },
        ]}
      >
        BROKEN
      </Animated.Text>
      <Animated.Text 
        style={[
          styles.titleSecondary,
          {
            transform: [
              {
                translateX: glitchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -1],
                }),
              },
            ],
          },
        ]}
      >
        EXPERIENCES
      </Animated.Text>
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
  title: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: -2,
    color: '#000',
    letterSpacing: -2,
    textShadowColor: '#00000020',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  titleSecondary: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    color: '#000',
    letterSpacing: -2,
    textShadowColor: '#00000020',
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
  floatingElement1: {
    position: 'absolute',
    top: height * 0.15,
    left: width * 0.15,
    zIndex: 1,
  },
  floatingElement2: {
    position: 'absolute',
    top: height * 0.25,
    right: width * 0.15,
    zIndex: 1,
  },
  floatingElement3: {
    position: 'absolute',
    bottom: height * 0.2,
    left: width * 0.2,
    zIndex: 1,
  },
  floatingIcon: {
    fontSize: 24,
    opacity: 0.6,
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
});