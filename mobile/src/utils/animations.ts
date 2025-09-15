import { Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';

export class AnimationUtils {
  // Bounce animation for buttons
  static bounceIn(animatedValue: Animated.Value, toValue: number = 1, duration: number = 300) {
    return Animated.spring(animatedValue, {
      toValue,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    });
  }

  // Scale press animation
  static scalePress(animatedValue: Animated.Value, scale: number = 0.95, duration: number = 100) {
    return Animated.timing(animatedValue, {
      toValue: scale,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
  }

  // Scale release animation
  static scaleRelease(animatedValue: Animated.Value, duration: number = 100) {
    return Animated.spring(animatedValue, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    });
  }

  // Fade in animation
  static fadeIn(animatedValue: Animated.Value, duration: number = 300) {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
  }

  // Fade out animation
  static fadeOut(animatedValue: Animated.Value, duration: number = 200) {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    });
  }

  // Slide up animation
  static slideUp(animatedValue: Animated.Value, toValue: number = 0, duration: number = 300) {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.bezier(0.25, 0.46, 0.45, 0.94)),
      useNativeDriver: true,
    });
  }

  // Slide down animation
  static slideDown(animatedValue: Animated.Value, toValue: number = 100, duration: number = 200) {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.in(Easing.bezier(0.55, 0.06, 0.68, 0.19)),
      useNativeDriver: true,
    });
  }

  // Rotation animation
  static rotate(animatedValue: Animated.Value, duration: number = 1000, loops: number = -1) {
    return Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: loops }
    );
  }

  // Pulse animation
  static pulse(animatedValue: Animated.Value, minScale: number = 1, maxScale: number = 1.1, duration: number = 1000) {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: maxScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: minScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  }

  // Shake animation
  static shake(animatedValue: Animated.Value, intensity: number = 10, duration: number = 500) {
    return Animated.sequence([
      Animated.timing(animatedValue, { toValue: intensity, duration: duration / 8, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: -intensity, duration: duration / 8, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: intensity, duration: duration / 8, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: -intensity, duration: duration / 8, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: intensity / 2, duration: duration / 8, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: -intensity / 2, duration: duration / 8, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: intensity / 4, duration: duration / 8, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: 0, duration: duration / 8, useNativeDriver: true }),
    ]);
  }

  // Celebration burst animation
  static celebrationBurst(animatedValue: Animated.Value) {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.3,
        duration: 150,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
      Animated.spring(animatedValue, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]);
  }

  // Heart beat animation
  static heartBeat(animatedValue: Animated.Value) {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: 80,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 80,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]);
  }

  // Stagger animation for list items
  static staggerFadeIn(items: Animated.Value[], delay: number = 100) {
    return Animated.stagger(
      delay,
      items.map(item =>
        Animated.timing(item, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      )
    );
  }

  // Haptic feedback helpers
  static async lightHaptic() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available');
    }
  }

  static async mediumHaptic() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available');
    }
  }

  static async heavyHaptic() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.log('Haptics not available');
    }
  }

  static async successHaptic() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Haptics not available');
    }
  }

  static async warningHaptic() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.log('Haptics not available');
    }
  }

  static async errorHaptic() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.log('Haptics not available');
    }
  }
}

// Gamification animations and effects
export class GamificationAnimations {
  // Points earned animation
  static pointsEarned(animatedValue: Animated.Value, points: number) {
    return Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]);
  }

  // Badge unlock animation
  static badgeUnlock(scaleValue: Animated.Value, rotateValue: Animated.Value) {
    return Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.3,
          duration: 200,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]);
  }

  // Level up animation
  static levelUp(animatedValue: Animated.Value) {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.5,
        duration: 200,
        easing: Easing.out(Easing.back(3)),
        useNativeDriver: true,
      }),
      Animated.spring(animatedValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]);
  }

  // Streak counter animation
  static streakCounter(animatedValue: Animated.Value) {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]);
  }

  // Progress bar fill animation
  static progressFill(animatedValue: Animated.Value, toValue: number, duration: number = 1000) {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // Width animations can't use native driver
    });
  }
}