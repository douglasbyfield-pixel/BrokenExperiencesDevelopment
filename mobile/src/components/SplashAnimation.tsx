import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { AnimationUtils } from '../utils/animations';
import AnimatedLogo from './AnimatedLogo';

interface SplashAnimationProps {
  onAnimationComplete?: () => void;
  appName?: string;
  tagline?: string;
}

const { width, height } = Dimensions.get('window');

export default function SplashAnimation({
  onAnimationComplete,
  appName = "BrokenExp",
  tagline = "Report. Track. Fix."
}: SplashAnimationProps) {
  const logoScaleValue = useRef(new Animated.Value(0)).current;
  const logoOpacityValue = useRef(new Animated.Value(0)).current;
  const titleOpacityValue = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const taglineOpacityValue = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(20)).current;
  const backgroundOpacityValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start the splash animation sequence
    startSplashAnimation();
  }, []);

  const startSplashAnimation = () => {
    Animated.sequence([
      // Phase 1: Logo entrance (0-800ms)
      Animated.parallel([
        AnimationUtils.bounceIn(logoScaleValue, 1, 600),
        AnimationUtils.fadeIn(logoOpacityValue, 400)
      ]),
      
      // Phase 2: Title entrance (800-1200ms)
      Animated.delay(200),
      Animated.parallel([
        AnimationUtils.fadeIn(titleOpacityValue, 400),
        AnimationUtils.slideUp(titleTranslateY, 0, 400)
      ]),
      
      // Phase 3: Tagline entrance (1200-1600ms)
      Animated.delay(200),
      Animated.parallel([
        AnimationUtils.fadeIn(taglineOpacityValue, 400),
        AnimationUtils.slideUp(taglineTranslateY, 0, 400)
      ]),
      
      // Phase 4: Hold for a moment (1600-2600ms)
      Animated.delay(1000),
      
      // Phase 5: Exit animation (2600-3000ms)
      Animated.parallel([
        AnimationUtils.fadeOut(backgroundOpacityValue, 400),
        Animated.timing(logoScaleValue, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        AnimationUtils.fadeOut(logoOpacityValue, 400),
        AnimationUtils.fadeOut(titleOpacityValue, 300),
        AnimationUtils.fadeOut(taglineOpacityValue, 300)
      ])
    ]).start(() => {
      // Animation complete
      onAnimationComplete?.();
    });
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { opacity: backgroundOpacityValue }
      ]}
    >
      <View style={styles.content}>
        {/* Animated Logo */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacityValue,
              transform: [{ scale: logoScaleValue }]
            }
          ]}
        >
          <AnimatedLogo
            size={120}
            color="#000"
            animationType="breathe"
            visible={true}
            duration={3000}
          />
        </Animated.View>

        {/* App Name */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacityValue,
              transform: [{ translateY: titleTranslateY }]
            }
          ]}
        >
          <Text style={styles.appName}>{appName}</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={[
            styles.taglineContainer,
            {
              opacity: taglineOpacityValue,
              transform: [{ translateY: taglineTranslateY }]
            }
          ]}
        >
          <Text style={styles.tagline}>{tagline}</Text>
        </Animated.View>
      </View>

      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  titleContainer: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -1,
    textAlign: 'center',
  },
  taglineContainer: {
    paddingHorizontal: 40,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 249, 250, 0.3)',
    zIndex: -1,
  },
});
