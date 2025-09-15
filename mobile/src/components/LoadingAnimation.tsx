import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { AnimationUtils } from '../utils/animations';
import AnimatedLogo from './AnimatedLogo';

interface LoadingAnimationProps {
  visible: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  useCustomLoader?: boolean;
  animationType?: 'rotate' | 'pulse' | 'bounce' | 'fade' | 'breathe';
}

const { width } = Dimensions.get('window');

export default function LoadingAnimation({ 
  visible, 
  size = 'medium', 
  color = '#000',
  useCustomLoader = false,
  animationType = 'pulse'
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
      case 'small': return useCustomLoader ? 30 : 20;
      case 'large': return useCustomLoader ? 80 : 60;
      default: return useCustomLoader ? 50 : 40;
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

  // Use custom SVG logo loader
  if (useCustomLoader) {
    return (
      <View style={styles.container}>
        <AnimatedLogo
          size={getSize()}
          color={color}
          animationType={animationType}
          visible={visible}
          duration={2000}
        />
      </View>
    );
  }

  // Use default circular loader
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
