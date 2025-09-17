import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PointsAnimationProps {
  points: number;
  visible: boolean;
  onComplete?: () => void;
  color?: string;
}

const PointsAnimation: React.FC<PointsAnimationProps> = ({
  points,
  visible,
  onComplete,
  color = '#FFD700'
}) => {
  const [animatedValue] = useState(new Animated.Value(0));
  const [opacityValue] = useState(new Animated.Value(0));
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Reset values
      animatedValue.setValue(0);
      opacityValue.setValue(0);
      scaleValue.setValue(0);

      // Start animation sequence
      Animated.sequence([
        // Fade in and scale up
        Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleValue, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        // Move up
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        // Fade out
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete?.();
      });
    }
  }, [visible, animatedValue, opacityValue, scaleValue, onComplete]);

  if (!visible) return null;

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityValue,
          transform: [
            { translateY },
            { scale: scaleValue },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.pointsBadge, { backgroundColor: color }]}>
        <Ionicons name="star" size={16} color="white" />
        <Text style={styles.pointsText}>+{points}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -50,
    right: 20,
    zIndex: 1000,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    gap: 4,
  },
  pointsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PointsAnimation;