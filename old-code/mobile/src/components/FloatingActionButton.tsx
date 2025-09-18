import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimationUtils } from '../utils/animations';
import AnimatedLogo from './AnimatedLogo';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  size?: number;
  backgroundColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'center';
  useLogo?: boolean;
  disabled?: boolean;
}

const { width, height } = Dimensions.get('window');

export default function FloatingActionButton({
  onPress,
  icon = 'add',
  size = 56,
  backgroundColor = '#FFD700',
  position = 'bottom-right',
  useLogo = false,
  disabled = false
}: FloatingActionButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const shadowValue = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = async () => {
    if (disabled) return;
    
    setIsPressed(true);
    await AnimationUtils.lightHaptic();
    
    Animated.parallel([
      AnimationUtils.scalePress(scaleValue, 0.9),
      Animated.timing(shadowValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      })
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    setIsPressed(false);
    
    Animated.parallel([
      AnimationUtils.scaleRelease(scaleValue),
      Animated.timing(shadowValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      })
    ]).start();
  };

  const handlePress = async () => {
    if (disabled) return;
    
    await AnimationUtils.mediumHaptic();
    
    // Celebration animation
    AnimationUtils.celebrationBurst(scaleValue).start();
    
    onPress();
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return {
          position: 'absolute' as const,
          bottom: 20,
          left: 20,
        };
      case 'center':
        return {
          position: 'absolute' as const,
          bottom: height / 2 - size / 2,
          right: width / 2 - size / 2,
        };
      default: // bottom-right
        return {
          position: 'absolute' as const,
          bottom: 20,
          right: 20,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyles(),
        {
          transform: [{ scale: scaleValue }],
          shadowOpacity: shadowValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.6]
          }),
          elevation: shadowValue.interpolate({
            inputRange: [0, 1],
            outputRange: [8, 16]
          })
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: disabled ? '#cccccc' : backgroundColor,
          }
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
        disabled={disabled}
      >
        {useLogo ? (
          <AnimatedLogo
            size={size * 0.5}
            color={disabled ? '#666' : '#000'}
            animationType={isPressed ? 'bounce' : 'breathe'}
            visible={true}
            duration={1500}
          />
        ) : (
          <Ionicons 
            name={icon as any} 
            size={size * 0.5} 
            color={disabled ? '#666' : '#000'} 
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    zIndex: 1000,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
});
