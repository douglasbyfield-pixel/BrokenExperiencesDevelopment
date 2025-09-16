import { InteractionManager, Platform } from 'react-native';

export class PerformanceUtils {
  /**
   * Defer execution until after interactions are complete
   */
  static runAfterInteractions(callback: () => void): void {
    InteractionManager.runAfterInteractions(() => {
      callback();
    });
  }

  /**
   * Throttle function calls to improve performance
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function (this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Debounce function calls to improve performance
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return function (this: any, ...args: Parameters<T>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Check if the device is low-end to adjust performance
   */
  static isLowEndDevice(): boolean {
    // Simple heuristic - can be enhanced based on device capabilities
    return Platform.OS === 'android' && Platform.Version < 21;
  }

  /**
   * Get optimized batch size based on device performance
   */
  static getOptimalBatchSize(): number {
    return this.isLowEndDevice() ? 5 : 10;
  }

  /**
   * Get optimized window size for FlatList based on device performance
   */
  static getOptimalWindowSize(): number {
    return this.isLowEndDevice() ? 5 : 10;
  }

  /**
   * Memory-conscious image loading helper
   */
  static shouldLoadImage(index: number, visibleRange: { start: number; end: number }): boolean {
    const buffer = 5; // Load images 5 items ahead/behind visible range
    return index >= visibleRange.start - buffer && index <= visibleRange.end + buffer;
  }

  /**
   * Optimize animation performance based on device capabilities
   */
  static getAnimationConfig() {
    const isLowEnd = this.isLowEndDevice();
    return {
      useNativeDriver: true,
      duration: isLowEnd ? 200 : 300,
      enableReducedMotion: isLowEnd,
    };
  }
}