import React, { useState, useEffect, useRef } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Dimensions, View, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

type UserRole = 'reporter' | 'fixer' | 'sponsor' | 'organization';

const roleOptions = [
  { 
    value: 'reporter' as UserRole, 
    label: 'Reporter', 
    icon: 'location-outline',
    description: 'Identify and report community issues'
  },
  { 
    value: 'fixer' as UserRole, 
    label: 'Fixer', 
    icon: 'construct-outline',
    description: 'Solve problems and implement solutions'
  },
  { 
    value: 'sponsor' as UserRole, 
    label: 'Sponsor', 
    icon: 'heart-outline',
    description: 'Provide resources and funding for fixes'
  },
  { 
    value: 'organization' as UserRole, 
    label: 'Organization', 
    icon: 'business-outline',
    description: 'Coordinate large-scale community initiatives'
  },
];

export default function LoginScreen() {
  const { setIsAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('reporter');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

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

    // Continuous pulse animation for the explore button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Continuous rotation for the compass icon
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    // Floating animation for decorative elements
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    floatAnimation.start();

    // Glow animation for sign-in mode
    if (!isSignUp) {
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      );
      glowAnimation.start();
    }
  }, [isSignUp]);

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
        // Validate passwords match
        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }
        
        // Validate password length
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
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const handleExploreApp = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Set authentication to true to show main app
      setIsAuthenticated(true);
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const float = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  const glow = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Animated background elements */}
      <Animated.View style={[styles.compassContainer, { transform: [{ rotate: spin }] }]}>
        <Ionicons name="compass-outline" size={80} color="#000" />
      </Animated.View>

      {/* Decorative floating elements for sign-in */}
      {!isSignUp && (
        <>
          <Animated.View style={[styles.floatingElement1, { transform: [{ translateY: float }] }]}>
            <Ionicons name="location" size={24} color="#000" />
          </Animated.View>
          <Animated.View style={[styles.floatingElement2, { transform: [{ translateY: float }] }]}>
            <Ionicons name="construct" size={20} color="#000" />
          </Animated.View>
          <Animated.View style={[styles.floatingElement3, { transform: [{ translateY: float }] }]}>
            <Ionicons name="heart" size={18} color="#000" />
          </Animated.View>
        </>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Animated.View 
          style={[
            styles.contentContainer, 
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
          <View style={styles.titleSection}>
            <Text style={styles.title}>BROKEN</Text>
            <Text style={styles.titleSecondary}>EXPERIENCES</Text>
            <Text style={styles.subtitle}>Report and fix issues in your community</Text>
            
            {/* Welcome message for sign-in */}
            {!isSignUp && (
              <Animated.View style={[styles.welcomeContainer, { opacity: glow }]}>
                <Text style={styles.welcomeText}>Welcome back! 👋</Text>
                <Text style={styles.welcomeSubtext}>Ready to make your community better?</Text>
              </Animated.View>
            )}
          </View>

          <View style={styles.formSection}>
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

            {isSignUp && (
              <Animated.View style={[styles.roleSection, { opacity: fadeAnim }]}>
                <Text style={styles.roleTitle}>Choose Your Role</Text>
                <Text style={styles.roleSubtitle}>How would you like to contribute?</Text>
                
                <View style={styles.roleGrid}>
                  {roleOptions.map((role) => (
                    <TouchableOpacity
                      key={role.value}
                      style={[
                        styles.roleCard,
                        selectedRole === role.value && styles.roleCardActive
                      ]}
                      onPress={() => setSelectedRole(role.value)}
                    >
                      <Ionicons 
                        name={role.icon as any} 
                        size={32} 
                        color={selectedRole === role.value ? '#fff' : '#000'} 
                      />
                      <Text style={[
                        styles.roleLabel, 
                        selectedRole === role.value && styles.roleLabelActive
                      ]}>
                        {role.label}
                      </Text>
                      <Text style={[
                        styles.roleDescription, 
                        selectedRole === role.value && styles.roleDescriptionActive
                      ]}>
                        {role.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}

            <TouchableOpacity style={styles.button} onPress={handleAuth}>
              <Text style={styles.buttonText}>
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              setIsSignUp(!isSignUp);
              // Clear confirm password when switching modes
              setConfirmPassword('');
            }}>
              <Text style={styles.switchText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Explore App Button */}
      <Animated.View style={[styles.exploreContainer, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity style={styles.exploreButton} onPress={handleExploreApp}>
          <Ionicons name="arrow-forward-outline" size={24} color="#000" />
          <Text style={styles.exploreText}>Explore App</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 120,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  formSection: {
    flex: 1,
  },
  compassContainer: {
    position: 'absolute',
    top: 100,
    right: 30,
    opacity: 0.1,
  },
  floatingElement1: {
    position: 'absolute',
    top: height * 0.2,
    left: 20,
    opacity: 0.3,
  },
  floatingElement2: {
    position: 'absolute',
    top: height * 0.4,
    right: 40,
    opacity: 0.2,
  },
  floatingElement3: {
    position: 'absolute',
    top: height * 0.6,
    left: 50,
    opacity: 0.25,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
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
    marginBottom: 20,
    color: '#666',
    fontWeight: '500',
    lineHeight: 24,
  },
  input: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
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
    marginBottom: 25,
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
  exploreContainer: {
    position: 'absolute',
    bottom: 50,
    right: 30,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  exploreText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  roleSection: {
    marginBottom: 30,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  roleSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  roleCard: {
    width: (width - 90) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    minHeight: 140,
  },
  roleCardActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  roleLabelActive: {
    color: '#fff',
  },
  roleDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '500',
  },
  roleDescriptionActive: {
    color: '#ccc',
  },
});