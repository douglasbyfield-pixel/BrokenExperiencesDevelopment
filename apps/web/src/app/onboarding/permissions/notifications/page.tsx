"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellRing } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPermissionPage() {
    const router = useRouter();
    const [requesting, setRequesting] = useState(false);

    const requestNotificationPermission = async () => {
        setRequesting(true);
        try {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    toast.success('Notifications enabled successfully!');
                    // Small delay to show success before navigating
                    setTimeout(() => {
                        router.replace("/onboarding/permissions/location");
                    }, 1000);
                } else {
                    toast.error('Notifications permission denied');
                    router.replace("/onboarding/permissions/location");
                }
            } else {
                toast.error('Notifications not supported in this browser');
                router.replace("/onboarding/permissions/location");
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            toast.error('Failed to request notifications');
            router.replace("/onboarding/permissions/location");
        } finally {
            setRequesting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
            <div className="w-full max-w-md mx-auto px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-16 animate-fade-in">
                    <button 
                        onClick={() => router.back()} 
                        aria-label="Back" 
                        className="w-10 h-10 rounded-xl border-2 border-gray-600 text-white flex items-center justify-center hover:border-white hover:scale-105 transition-all duration-200 hover:shadow-md"
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
                            <Bell className="w-16 h-16 text-gray-800" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center mb-12 animate-slide-up animation-delay-300">
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Stay updated on new issues
                    </h1>
                    <p className="text-gray-300 text-lg leading-relaxed">
                        Get notified when issues are reported in your area or when there are updates on your reports.
                    </p>
                </div>

                {/* Buttons */}
                <div className="space-y-4 animate-slide-up animation-delay-500">
                    <Button
                        className="w-full h-12 bg-white hover:bg-gray-100 text-black font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] transform group"
                        onClick={requestNotificationPermission}
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
                                    <BellRing className="w-4 h-4 group-hover:animate-pulse" />
                                    Enable notifications
                                </>
                            )}
                        </span>
                    </Button>
                    
                    <Button
                        className="w-full h-12 bg-transparent border-2 border-gray-600 text-white hover:border-white hover:bg-white hover:text-black font-medium rounded-xl transition-all duration-300 hover:scale-[1.02] transform"
                        onClick={() => router.replace("/onboarding/permissions/location")}
                    >
                        Skip for now
                    </Button>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-gray-500 animate-fade-in animation-delay-700">
                    <p>© 2025 Broken Experiences. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}


