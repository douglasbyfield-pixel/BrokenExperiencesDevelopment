import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LevelConfig } from '../hooks/useGamification';

interface LevelUpAnimationProps {
  visible: boolean;
  newLevel: LevelConfig;
  onComplete?: () => void;
}

const { width, height } = Dimensions.get('window');

const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
  visible,
  newLevel,
  onComplete
}) => {
  const [scaleValue] = useState(new Animated.Value(0));
  const [opacityValue] = useState(new Animated.Value(0));
  const [slideValue] = useState(new Animated.Value(height));
  const [sparkleValues] = useState(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  );

  useEffect(() => {
    if (visible) {
      // Reset all values
      scaleValue.setValue(0);
      opacityValue.setValue(0);
      slideValue.setValue(height);
      sparkleValues.forEach(value => value.setValue(0));

      // Main animation sequence
      Animated.sequence([
        // Slide up background
        Animated.timing(slideValue, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        // Fade in and scale content
        Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleValue, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          // Sparkle effects
          Animated.stagger(100, 
            sparkleValues.map(value =>
              Animated.sequence([
                Animated.timing(value, {
                  toValue: 1,
                  duration: 600,
                  useNativeDriver: true,
                }),
                Animated.timing(value, {
                  toValue: 0,
                  duration: 400,
                  useNativeDriver: true,
                }),
              ])
            )
          ),
        ]),
        // Hold for celebration
        Animated.delay(2000),
        // Slide out
        Animated.parallel([
          Animated.timing(slideValue, {
            toValue: -height,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onComplete?.();
      });
    }
  }, [visible, scaleValue, opacityValue, slideValue, sparkleValues, onComplete]);

  if (!visible) return null;

  const sparklePositions = [
    { top: 100, left: 50 },
    { top: 120, right: 60 },
    { top: 200, left: 80 },
    { top: 180, right: 40 },
    { top: 300, left: 100 },
    { top: 320, right: 80 },
    { top: 250, left: 30 },
    { top: 280, right: 120 },
  ];

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          transform: [{ translateY: slideValue }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityValue,
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <View style={styles.badgeContainer}>
          <Text style={styles.badge}>{newLevel.badge}</Text>
        </View>
        
        <Text style={styles.congratsText}>Congratulations!</Text>
        <Text style={styles.levelText}>Level {newLevel.level}</Text>
        <Text style={styles.titleText}>{newLevel.title}</Text>
        
        <View style={styles.perksContainer}>
          <Text style={styles.perksTitle}>New Perks Unlocked:</Text>
          {newLevel.perks.map((perk, index) => (
            <View key={index} style={styles.perkItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
              <Text style={styles.perkText}>{perk}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Sparkle effects */}
      {sparkleValues.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.sparkle,
            sparklePositions[index],
            {
              opacity: value,
              transform: [
                {
                  scale: value.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1.5, 0],
                  }),
                },
                {
                  rotate: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="star" size={20} color="#FFD700" />
        </Animated.View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  badgeContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  badge: {
    fontSize: 40,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 24,
  },
  perksContainer: {
    alignSelf: 'stretch',
  },
  perksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  perkText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  sparkle: {
    position: 'absolute',
  },
});

export default LevelUpAnimation;