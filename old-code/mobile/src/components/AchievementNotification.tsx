import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimationUtils, GamificationAnimations } from '../utils/animations';

interface AchievementNotificationProps {
  visible: boolean;
  title: string;
  description: string;
  icon?: string;
  points?: number;
  onHide?: () => void;
}

const { width } = Dimensions.get('window');

export default function AchievementNotification({
  visible,
  title,
  description,
  icon = 'trophy',
  points,
  onHide
}: AchievementNotificationProps) {
  const slideValue = useRef(new Animated.Value(-200)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const pointsScaleValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        AnimationUtils.slideUp(slideValue, 0, 400),
        AnimationUtils.bounceIn(scaleValue, 1, 600),
        AnimationUtils.fadeIn(opacityValue, 300)
      ]).start();

      // Points animation with delay
      if (points) {
        setTimeout(() => {
          AnimationUtils.bounceIn(pointsScaleValue, 1, 400).start();
        }, 300);
      }

      // Auto hide after 3 seconds
      setTimeout(() => {
        hideNotification();
      }, 3000);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      AnimationUtils.slideDown(slideValue, -200, 300),
      AnimationUtils.fadeOut(opacityValue, 200)
    ]).start(() => {
      onHide?.();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: opacityValue,
          transform: [
            { translateY: slideValue },
            { scale: scaleValue }
          ]
        }
      ]}
    >
      <View style={styles.notification}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={24} color="#FFD700" />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {points && (
          <Animated.View 
            style={[
              styles.pointsContainer,
              { transform: [{ scale: pointsScaleValue }] }
            ]}
          >
            <Text style={styles.pointsText}>+{points}</Text>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  notification: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF8DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  pointsContainer: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
});
