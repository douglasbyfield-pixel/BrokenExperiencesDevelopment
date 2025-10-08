"use client";

import { useEffect, useState } from "react";

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  dataFetchTime: number;
  imageLoadTime: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const startTime = performance.now();
    
    // Monitor page load
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        dataFetchTime: 0, // Will be updated by data fetching hooks
        imageLoadTime: 0, // Will be updated by image components
      });
    };

    // Monitor data fetching
    const originalFetch = window.fetch;
    const wrappedFetch = async (...args: Parameters<typeof fetch>) => {
      const start = performance.now();
      const response = await originalFetch(...args);
      const end = performance.now();
      
      setMetrics(prev => prev ? {
        ...prev,
        dataFetchTime: Math.round(end - start)
      } : null);
      
      return response;
    };
    // @ts-expect-error - Next.js extends fetch with additional properties that we don't need to implement
    window.fetch = wrappedFetch as typeof fetch;

    // Monitor image loading
    const handleImageLoad = () => {
      const images = document.querySelectorAll('img');
      let totalImageTime = 0;
      let loadedImages = 0;
      
      images.forEach(img => {
        if (img.complete) {
          loadedImages++;
        } else {
          const start = performance.now();
          img.onload = () => {
            const end = performance.now();
            totalImageTime += end - start;
            loadedImages++;
            
            if (loadedImages === images.length) {
              setMetrics(prev => prev ? {
                ...prev,
                imageLoadTime: Math.round(totalImageTime)
              } : null);
            }
          };
        }
      });
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    handleImageLoad();

    // Toggle visibility with Ctrl+Shift+P
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('keydown', handleKeyDown);
      window.fetch = originalFetch;
    };
  }, []);

  if (!isVisible || !metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50">
      <div className="mb-2 font-bold">Performance Metrics</div>
      <div>Load Time: {metrics.loadTime}ms</div>
      <div>Render Time: {metrics.renderTime}ms</div>
      <div>Data Fetch: {metrics.dataFetchTime}ms</div>
      <div>Images: {metrics.imageLoadTime}ms</div>
      <div className="mt-2 text-gray-400">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}

// Hook to measure component render time
export function useRenderTime(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      console.log(`🕒 ${componentName} render time: ${Math.round(end - start)}ms`);
    };
  }, [componentName]);
}

// Hook to measure data fetching time
export function useDataFetchTime(queryKey: string) {
  const [fetchTime, setFetchTime] = useState<number>(0);
  
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const time = Math.round(end - start);
      setFetchTime(time);
      console.log(`📊 ${queryKey} fetch time: ${time}ms`);
    };
  }, [queryKey]);
  
  return fetchTime;
}
