"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";

export default function LocationPermissionPage() {
    const router = useRouter();
    const [requesting, setRequesting] = useState(false);

    const requestLocationPermission = async () => {
        setRequesting(true);
        try {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        console.log('Location permission granted:', position.coords);
                        toast.success('Location access enabled successfully!');
                        // Small delay to show success before navigating
                        setTimeout(() => {
                            router.replace("/home"); // Navigate to main app
                        }, 1000);
                    },
                    (error) => {
                        console.error('Location permission denied:', error);
                        toast.error('Location permission denied');
                        router.replace("/home"); // Still proceed to app
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            } else {
                toast.error('Location services not supported in this browser');
                router.replace("/home");
            }
        } catch (error) {
            console.error('Error requesting location permission:', error);
            toast.error('Failed to request location access');
            router.replace("/home");
        } finally {
            setRequesting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
            <div className="w-full max-w-md mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-16 animate-fade-in">
                    <button 
                        onClick={() => router.back()} 
                        aria-label="Back" 
                        className="w-10 h-10 rounded-xl border-2 border-blue-400 text-white flex items-center justify-center hover:border-white hover:scale-105 transition-all duration-200 hover:shadow-md"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="w-10" />
                </div>

                {/* Illustration */}
                <div className="text-center mb-12 animate-slide-up animation-delay-200">
                    <div className="w-32 h-32 mx-auto mb-8 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-float">
                        <div className="relative">
                            <MapPin className="w-16 h-16 text-blue-600" />
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center mb-12 animate-slide-up animation-delay-300">
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Find issues closest to you
                    </h1>
                    <p className="text-blue-100 text-lg leading-relaxed">
                        Allow location access to discover and report issues in your area and get relevant updates.
                    </p>
                </div>

                {/* Buttons */}
                <div className="space-y-4 animate-slide-up animation-delay-500">
                    <Button
                        className="w-full h-12 bg-white hover:bg-blue-50 text-blue-900 font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] transform group"
                        onClick={requestLocationPermission}
                        disabled={requesting}
                    >
                        <span className="flex items-center justify-center gap-2">
                            {requesting ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Requesting...
                                </>
                            ) : (
                                <>
                                    <Navigation className="w-4 h-4 group-hover:animate-pulse" />
                                    Turn on location services
                                </>
                            )}
                        </span>
                    </Button>
                    
                    <Button
                        className="w-full h-12 bg-transparent border-2 border-blue-400 text-white hover:border-white hover:bg-white hover:text-blue-900 font-medium rounded-xl transition-all duration-300 hover:scale-[1.02] transform"
                        onClick={() => router.replace("/home")}
                    >
                        Skip for now
                    </Button>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-blue-300 animate-fade-in animation-delay-700">
                    <p>© 2025 Broken Experiences. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}


