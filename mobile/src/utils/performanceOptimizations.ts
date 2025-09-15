import { InteractionManager, Platform } from 'react-native';

export class PerformanceUtils {
  /**
   * Delays heavy operations until after animations complete
   */
  static runAfterInteractions<T>(callback: () => T | Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      InteractionManager.runAfterInteractions(() => {
        try {
          const result = callback();
          if (result instanceof Promise) {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Debounce function calls to prevent excessive re-renders
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }

  /**
   * Throttle function calls to limit execution frequency
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * Request idle callback for non-critical operations
   */
  static requestIdleCallback(callback: () => void, timeout = 1000): void {
    if ('requestIdleCallback' in window && Platform.OS === 'web') {
      (window as any).requestIdleCallback(callback, { timeout });
    } else {
      // Fallback for native platforms
      setTimeout(callback, 16); // ~60fps
    }
  }

  /**
   * Batch multiple state updates to reduce re-renders
   */
  static batchUpdates<T>(updates: (() => void)[]): void {
    InteractionManager.runAfterInteractions(() => {
      updates.forEach(update => update());
    });
  }

  /**
   * Memory-efficient array chunking for large lists
   */
  static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Lazy load components after initial render
   */
  static lazyLoadAfterMount<T>(
    loadComponent: () => Promise<T>,
    delay = 100
  ): Promise<T> {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          loadComponent().then(resolve);
        }, delay);
      });
    });
  }
}