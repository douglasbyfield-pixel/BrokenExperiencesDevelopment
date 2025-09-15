import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder } from 'react-native';
import { AnimationUtils } from '../utils/animations';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  swipeThreshold?: number;
}

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  swipeThreshold = 100
}: SwipeableCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        
        // Haptic feedback
        AnimationUtils.lightHaptic();

        if (Math.abs(dx) > swipeThreshold || Math.abs(vx) > 0.5) {
          if (dx > 0) {
            // Swipe right
            onSwipeRight?.();
            AnimationUtils.successHaptic();
          } else {
            // Swipe left
            onSwipeLeft?.();
            AnimationUtils.successHaptic();
          }
          
          // Animate out
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: dx > 0 ? 300 : -300,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 0.8,
              duration: 200,
              useNativeDriver: true,
            })
          ]).start();
        } else {
          // Snap back to center
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
            AnimationUtils.scaleRelease(scaleValue)
          ]).start();
        }
      },
    })
  ).current;

  const progress = translateX.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.container}>
      {/* Background Actions */}
      <View style={styles.backgroundActions}>
        {leftAction && (
          <Animated.View 
            style={[
              styles.leftAction,
              { opacity: translateX.interpolate({
                inputRange: [0, 100],
                outputRange: [0, 1],
                extrapolate: 'clamp'
              })}
            ]}
          >
            {leftAction}
          </Animated.View>
        )}
        
        {rightAction && (
          <Animated.View 
            style={[
              styles.rightAction,
              { opacity: translateX.interpolate({
                inputRange: [-100, 0],
                outputRange: [1, 0],
                extrapolate: 'clamp'
              })}
            ]}
          >
            {rightAction}
          </Animated.View>
        )}
      </View>

      {/* Main Card */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { translateX },
              { scale: scaleValue }
            ]
          }
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  leftAction: {
    flex: 1,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  rightAction: {
    flex: 1,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    zIndex: 1,
  },
});
