import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

interface ConfettiAnimationProps {
  visible: boolean;
  duration?: number;
  colors?: string[];
  particleCount?: number;
  onComplete?: () => void;
}

const { width, height } = Dimensions.get('window');

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  visible,
  duration = 3000,
  colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'],
  particleCount = 50,
  onComplete
}) => {
  const [particles] = useState(() => 
    Array.from({ length: particleCount }, (_, index) => ({
      id: index,
      animatedValue: new Animated.Value(0),
      x: Math.random() * width,
      rotation: new Animated.Value(0),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      swayAmount: (Math.random() - 0.5) * 100,
    }))
  );

  useEffect(() => {
    if (visible) {
      // Reset all particles
      particles.forEach(particle => {
        particle.animatedValue.setValue(0);
        particle.rotation.setValue(0);
        particle.x = Math.random() * width;
      });

      // Start animations
      const animations = particles.map(particle => {
        return Animated.parallel([
          // Fall down
          Animated.timing(particle.animatedValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          // Rotate
          Animated.loop(
            Animated.timing(particle.rotation, {
              toValue: 1,
              duration: 1000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            { iterations: -1 }
          ),
        ]);
      });

      Animated.parallel(animations).start(() => {
        onComplete?.();
      });
    }
  }, [visible, particles, duration, onComplete]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map(particle => {
        const translateY = particle.animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, height + 50],
        });

        const translateX = particle.animatedValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, particle.swayAmount, particle.swayAmount * 2],
        });

        const rotate = particle.rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });

        const opacity = particle.animatedValue.interpolate({
          inputRange: [0, 0.1, 0.9, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: particle.x,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                opacity,
                transform: [
                  { translateY },
                  { translateX },
                  { rotate },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  particle: {
    position: 'absolute',
    borderRadius: 2,
  },
});

export default ConfettiAnimation;