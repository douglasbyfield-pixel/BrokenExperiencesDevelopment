import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { AnimationUtils } from '../utils/animations';

interface LoadingAnimationProps {
  visible: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const { width } = Dimensions.get('window');

export default function LoadingAnimation({ 
  visible, 
  size = 'medium', 
  color = '#000' 
}: LoadingAnimationProps) {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Start animations
      Animated.parallel([
        AnimationUtils.bounceIn(scaleValue, 1, 500),
        AnimationUtils.fadeIn(opacityValue, 300),
        AnimationUtils.rotate(rotateValue, 1000, -1)
      ]).start();
    } else {
      // Hide animations
      Animated.parallel([
        AnimationUtils.fadeOut(scaleValue, 200),
        AnimationUtils.fadeOut(opacityValue, 200)
      ]).start();
    }
  }, [visible]);

  const getSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 60;
      default: return 40;
    }
  };

  const getStrokeWidth = () => {
    switch (size) {
      case 'small': return 2;
      case 'large': return 6;
      default: return 4;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: opacityValue,
          transform: [
            { scale: scaleValue },
            { 
              rotate: rotateValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg']
              })
            }
          ]
        }
      ]}
    >
      <View style={[
        styles.loader,
        {
          width: getSize(),
          height: getSize(),
          borderWidth: getStrokeWidth(),
          borderColor: color,
          borderTopColor: 'transparent'
        }
      ]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    borderRadius: 50,
  },
});
