"use client";

import { useEffect, useRef } from "react";

interface GestureHandlerProps {
  onPinch?: (scale: number) => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onLongPress?: (x: number, y: number) => void;
  onDoubleTap?: (x: number, y: number) => void;
  children: React.ReactNode;
}

export const GestureHandler = ({
  onPinch,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  onDoubleTap,
  children
}: GestureHandlerProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const gestureState = useRef({
    isTouch: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    lastTap: 0,
    longPressTimer: null as NodeJS.Timeout | null,
    touches: [] as Touch[],
    initialDistance: 0,
    lastScale: 1
  });

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 50,
        medium: 100,
        heavy: 200
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    const state = gestureState.current;
    
    state.isTouch = true;
    state.startX = touch.clientX;
    state.startY = touch.clientY;
    state.startTime = Date.now();
    state.touches = Array.from(e.touches);

    // Handle pinch start
    if (e.touches.length === 2 && onPinch) {
      state.initialDistance = getDistance(e.touches[0], e.touches[1]);
    }

    // Long press detection
    if (onLongPress) {
      state.longPressTimer = setTimeout(() => {
        triggerHaptic('medium');
        onLongPress(touch.clientX, touch.clientY);
      }, 500);
    }

    // Double tap detection
    if (onDoubleTap) {
      const now = Date.now();
      const timeDiff = now - state.lastTap;
      if (timeDiff < 300) {
        triggerHaptic('light');
        onDoubleTap(touch.clientX, touch.clientY);
      }
      state.lastTap = now;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    const state = gestureState.current;
    
    // Clear long press if user moves
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }

    // Handle pinch
    if (e.touches.length === 2 && onPinch && state.initialDistance > 0) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / state.initialDistance;
      
      // Only trigger on significant scale changes
      if (Math.abs(scale - state.lastScale) > 0.1) {
        onPinch(scale);
        state.lastScale = scale;
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const state = gestureState.current;
    
    if (!state.isTouch) return;
    
    // Clear timers
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }

    // Only process swipes for single touch
    if (state.touches.length === 1) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;
      const deltaTime = Date.now() - state.startTime;
      
      // Check if it's a swipe (fast movement, significant distance)
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;
      
      if (velocity > 0.5 && distance > 50) {
        triggerHaptic('light');
        
        // Determine swipe direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }
    }

    state.isTouch = false;
    state.initialDistance = 0;
    state.lastScale = 1;
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add passive event listeners for better performance
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      // Clean up any pending timers
      const state = gestureState.current;
      if (state.longPressTimer) {
        clearTimeout(state.longPressTimer);
      }
    };
  }, [onPinch, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, onLongPress, onDoubleTap]);

  return (
    <div ref={elementRef} className="w-full h-full">
      {children}
    </div>
  );
};