"use client";

import { useState, useEffect } from "react";
import { Button } from "@web/components/ui/button";
import { 
  MapPin, 
  Search, 
  Plus, 
  Navigation, 
  Sparkles,
  ChevronRight,
  CheckCircle,
  Zap,
  Users,
  Target,
  ArrowDown
} from "lucide-react";

interface MapOnboardingProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const MapOnboarding = ({ isVisible, onComplete, onSkip }: MapOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      title: "Welcome to Your Community Map! 🌟",
      subtitle: "Discover and fix issues around you",
      content: "Join thousands of community members making your neighborhood better, one fix at a time.",
      icon: <Sparkles size={48} className="text-purple-500" />,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Find Issues Near You 📍",
      subtitle: "Real-time community reports",
      content: "See what's happening around you with our live map. From broken streetlights to potholes - everything the community has spotted.",
      icon: <MapPin size={48} className="text-blue-500" />,
      gradient: "from-blue-500 to-cyan-500",
      highlight: "search"
    },
    {
      title: "Report Issues Instantly ⚡",
      subtitle: "One tap to make a difference",
      content: "Spot something that needs fixing? Tap the red button to report it instantly with your location and photos.",
      icon: <Plus size={48} className="text-red-500" />,
      gradient: "from-red-500 to-orange-500",
      highlight: "report"
    },
    {
      title: "Track & Navigate 🧭",
      subtitle: "Get there efficiently",
      content: "Navigate to issues, track your contributions, and see your impact grow as you help your community.",
      icon: <Navigation size={48} className="text-green-500" />,
      gradient: "from-green-500 to-emerald-500",
      highlight: "navigation"
    },
    {
      title: "Level Up & Earn Rewards 🏆",
      subtitle: "Gamified community building",
      content: "Earn points, unlock badges, and climb the leaderboard as you contribute to your community's wellbeing.",
      icon: <Zap size={48} className="text-yellow-500" />,
      gradient: "from-yellow-500 to-orange-400"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  const skipOnboarding = () => {
    onSkip();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 text-white">
        {/* Progress bar */}
        <div className="absolute top-12 left-6 right-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/80">
              {currentStep + 1} of {steps.length}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={skipOnboarding}
              className="text-white/80 hover:text-white hover:bg-white/20"
            >
              Skip
            </Button>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main content */}
        <div className={`text-center max-w-sm transition-all duration-300 ${
          isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}>
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className={`p-6 rounded-3xl bg-gradient-to-br ${currentStepData.gradient} 
              shadow-2xl transform hover:scale-110 transition-transform duration-300`}>
              {currentStepData.icon}
            </div>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-3xl font-bold mb-3 text-white">
            {currentStepData.title}
          </h1>
          <h2 className="text-xl font-medium mb-6 text-white/90">
            {currentStepData.subtitle}
          </h2>

          {/* Description */}
          <p className="text-lg text-white/80 leading-relaxed mb-8">
            {currentStepData.content}
          </p>

          {/* Feature highlights for specific steps */}
          {currentStep === 1 && (
            <div className="mb-8 space-y-3">
              <div className="flex items-center justify-center space-x-2 text-white/90">
                <Target size={20} className="text-blue-300" />
                <span className="text-sm">Real-time issue tracking</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-white/90">
                <Users size={20} className="text-green-300" />
                <span className="text-sm">Community-driven reports</span>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="mb-8 grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/20 rounded-2xl p-4">
                <div className="text-2xl mb-1">🏅</div>
                <div className="text-xs text-white/80">Badges</div>
              </div>
              <div className="bg-white/20 rounded-2xl p-4">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-xs text-white/80">Points</div>
              </div>
              <div className="bg-white/20 rounded-2xl p-4">
                <div className="text-2xl mb-1">🏆</div>
                <div className="text-xs text-white/80">Leaderboard</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="absolute bottom-12 left-6 right-6">
          <Button
            onClick={nextStep}
            size="lg"
            className="w-full bg-white text-gray-900 hover:bg-white/90 font-semibold py-4 rounded-2xl
              shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>
                {currentStep === steps.length - 1 ? "Let's Get Started!" : "Continue"}
              </span>
              {currentStep === steps.length - 1 ? (
                <CheckCircle size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
            </span>
          </Button>

          {/* Step indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-white scale-125' 
                    : index < currentStep 
                      ? 'bg-white/70' 
                      : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Floating hint arrow for first step */}
        {currentStep === 0 && (
          <div className="absolute bottom-32 animate-bounce">
            <ArrowDown size={24} className="text-white/60" />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};