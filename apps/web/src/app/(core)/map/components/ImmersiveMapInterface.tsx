"use client";

import { useState, useEffect } from "react";
import { Button } from "@web/components/ui/button";
import { 
  Search, 
  MapPin, 
  Navigation, 
  Plus, 
  Layers, 
  Target,
  Zap,
  Heart,
  Star,
  TrendingUp,
  Users
} from "lucide-react";

interface ImmersiveMapInterfaceProps {
  onSearchToggle: () => void;
  onLocationCenter: () => void;
  onQuickReport: () => void;
  onLayersToggle: () => void;
  isTracking: boolean;
  onTrackingToggle: () => void;
  nearbyIssuesCount: number;
  userLevel?: number;
  userPoints?: number;
}

export const ImmersiveMapInterface = ({
  onSearchToggle,
  onLocationCenter,
  onQuickReport,
  onLayersToggle,
  isTracking,
  onTrackingToggle,
  nearbyIssuesCount,
  userLevel = 1,
  userPoints = 0
}: ImmersiveMapInterfaceProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleActionPress = (action: string, callback: () => void) => {
    setActiveAction(action);
    triggerHaptic();
    callback();
    setTimeout(() => setActiveAction(null), 200);
  };

  return (
    <>
      {/* Floating Action Button - Quick Report */}
      <div 
        className={`fixed bottom-6 right-6 z-50 transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
      >
        <Button
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 shadow-2xl border-0 transform hover:scale-110 active:scale-95 transition-all duration-200 relative overflow-hidden group"
          onClick={() => handleActionPress('report', onQuickReport)}
        >
          {/* Animated background ripple */}
          <div className="absolute inset-0 bg-white opacity-20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
          
          {/* Pulsing ring effect */}
          <div className="absolute -inset-2 bg-red-500 opacity-30 rounded-full animate-ping" />
          
          <Plus 
            size={28} 
            className="text-white relative z-10 transform group-hover:rotate-90 transition-transform duration-300" 
          />
          
          {/* Floating notification badge */}
          {nearbyIssuesCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              {nearbyIssuesCount > 9 ? '9+' : nearbyIssuesCount}
            </div>
          )}
        </Button>
      </div>

      {/* Floating Control Panel - Left Side */}
      <div 
        className={`fixed top-6 left-4 z-40 space-y-3 transition-all duration-500 delay-200 ${
          isVisible ? 'translate-x-0 opacity-100' : '-translate-x-16 opacity-0'
        }`}
      >
        {/* Search Button */}
        <Button
          size="icon"
          variant="outline"
          className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md border-white/20 shadow-xl hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 relative overflow-hidden group"
          onClick={() => handleActionPress('search', onSearchToggle)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Search size={20} className="text-gray-700 relative z-10" />
        </Button>

        {/* Location Center Button */}
        <Button
          size="icon"
          variant="outline"
          className={`w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md border-white/20 shadow-xl hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 relative overflow-hidden group ${isTracking ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => handleActionPress('location', onLocationCenter)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Navigation 
            size={20} 
            className={`relative z-10 transition-colors duration-200 ${
              isTracking ? 'text-blue-600' : 'text-gray-700'
            }`} 
          />
          {isTracking && (
            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl animate-pulse" />
          )}
        </Button>

        {/* Layers Toggle */}
        <Button
          size="icon"
          variant="outline"
          className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md border-white/20 shadow-xl hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 relative overflow-hidden group"
          onClick={() => handleActionPress('layers', onLayersToggle)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Layers size={20} className="text-gray-700 relative z-10" />
        </Button>
      </div>

      {/* User Stats Panel - Top Right */}
      <div 
        className={`fixed top-6 right-4 z-40 transition-all duration-500 delay-300 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'
        }`}
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-white/20 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center space-x-3">
            {/* Level Badge */}
            <div className="flex items-center space-x-1">
              <Star size={16} className="text-yellow-500" />
              <span className="text-xs font-bold text-gray-700">L{userLevel}</span>
            </div>
            
            {/* Points */}
            <div className="flex items-center space-x-1">
              <Zap size={16} className="text-orange-500" />
              <span className="text-xs font-bold text-gray-700">{userPoints}</span>
            </div>
            
            {/* Streak indicator */}
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div 
        className={`fixed bottom-6 left-4 right-20 z-40 transition-all duration-700 delay-400 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
          <div className="grid grid-cols-3 gap-4">
            {/* Quick Stats */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Target size={16} className="text-blue-500" />
                <span className="text-xs font-bold text-gray-700">{nearbyIssuesCount}</span>
              </div>
              <p className="text-xs text-gray-500">Nearby</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <TrendingUp size={16} className="text-green-500" />
                <span className="text-xs font-bold text-gray-700">12</span>
              </div>
              <p className="text-xs text-gray-500">Resolved</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Users size={16} className="text-purple-500" />
                <span className="text-xs font-bold text-gray-700">8</span>
              </div>
              <p className="text-xs text-gray-500">Community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS for additional animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};