"use client";

import { useEffect, useState } from "react";

interface DynamicThemeControllerProps {
  timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night';
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  userActivity?: 'exploring' | 'navigating' | 'reporting';
  onThemeChange?: (theme: string) => void;
}

export const DynamicThemeController = ({
  timeOfDay,
  weather = 'sunny',
  userActivity = 'exploring',
  onThemeChange
}: DynamicThemeControllerProps) => {
  const [currentTheme, setCurrentTheme] = useState('mapbox://styles/mapbox/dark-v11');

  // Auto-detect time of day if not provided
  const getTimeOfDay = (): 'dawn' | 'day' | 'dusk' | 'night' => {
    if (timeOfDay) return timeOfDay;
    
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'dusk';
    return 'night';
  };

  // Theme configurations
  const themes = {
    dawn: {
      style: 'mapbox://styles/mapbox/outdoors-v12',
      overlay: 'from-orange-200/20 to-pink-200/20',
      description: 'Soft dawn lighting with warm tones'
    },
    day: {
      style: 'mapbox://styles/mapbox/streets-v12',
      overlay: 'from-blue-100/10 to-cyan-100/10',
      description: 'Bright daylight with clear visibility'
    },
    dusk: {
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      overlay: 'from-purple-200/20 to-orange-200/20',
      description: 'Golden hour with enhanced contrast'
    },
    night: {
      style: 'mapbox://styles/mapbox/dark-v11',
      overlay: 'from-indigo-900/30 to-purple-900/30',
      description: 'Dark theme optimized for night use'
    }
  };

  // Weather-based overlays
  const weatherOverlays = {
    sunny: 'brightness-110 contrast-105',
    cloudy: 'brightness-95 contrast-100 saturate-90',
    rainy: 'brightness-85 contrast-110 saturate-120 hue-rotate-15',
    stormy: 'brightness-75 contrast-125 saturate-80'
  };

  // Activity-based adjustments
  const activityStyles = {
    exploring: 'default',
    navigating: 'contrast-110 saturate-110',
    reporting: 'brightness-105 contrast-105'
  };

  useEffect(() => {
    const detectedTimeOfDay = getTimeOfDay();
    const newTheme = themes[detectedTimeOfDay].style;
    
    if (newTheme !== currentTheme) {
      setCurrentTheme(newTheme);
      onThemeChange?.(newTheme);
    }
  }, [timeOfDay, currentTheme, onThemeChange]);

  // Create dynamic overlay styles
  const overlayClasses = [
    themes[getTimeOfDay()].overlay,
    weatherOverlays[weather],
    activityStyles[userActivity]
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Dynamic overlay for atmospheric effects */}
      <div 
        className={`absolute inset-0 pointer-events-none z-5 bg-gradient-to-br ${overlayClasses} transition-all duration-1000`}
        style={{
          mixBlendMode: 'soft-light'
        }}
      />
      
      {/* Weather effects */}
      {weather === 'rainy' && (
        <div className="absolute inset-0 pointer-events-none z-6 opacity-30">
          <div className="rain-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="rain-drop"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {weather === 'stormy' && (
        <div className="absolute inset-0 pointer-events-none z-6">
          <div className="lightning-effect opacity-0 animate-pulse" />
        </div>
      )}

      <style jsx>{`
        .rain-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .rain-drop {
          position: absolute;
          width: 2px;
          height: 20px;
          background: linear-gradient(to bottom, transparent, rgba(174, 194, 224, 0.6));
          animation: rain-fall linear infinite;
        }
        
        @keyframes rain-fall {
          to {
            transform: translateY(100vh);
          }
        }
        
        .lightning-effect {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          animation: lightning 3s infinite;
        }
        
        @keyframes lightning {
          0%, 90%, 100% { opacity: 0; }
          1%, 3% { opacity: 1; }
        }
      `}</style>
    </>
  );
};