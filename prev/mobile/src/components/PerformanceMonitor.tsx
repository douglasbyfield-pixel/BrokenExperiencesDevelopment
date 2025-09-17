import { useEffect } from 'react';
import { InteractionManager } from 'react-native';

export const PerformanceMonitor = () => {
  useEffect(() => {
    if (__DEV__) {
      // Monitor long interactions
      let interactionHandle: any;
      const monitorInteractions = () => {
        interactionHandle = InteractionManager.createInteractionHandle();
        
        setTimeout(() => {
          if (interactionHandle) {
            console.warn('Long interaction detected (>500ms)');
            InteractionManager.clearInteractionHandle(interactionHandle);
          }
        }, 500);
      };

      // Monitor render performance
      const renderStart = performance.now();
      requestAnimationFrame(() => {
        const renderTime = performance.now() - renderStart;
        if (renderTime > 16.67) { // 60fps threshold
          console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`);
        }
      });

      return () => {
        if (interactionHandle) {
          InteractionManager.clearInteractionHandle(interactionHandle);
        }
      };
    }
  }, []);

  return null;
};

export default PerformanceMonitor;