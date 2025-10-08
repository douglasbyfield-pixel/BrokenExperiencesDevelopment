"use client";

import { useOfflineDetection } from '@web/hooks/use-offline-detection';
import { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';

export function OfflineNotification() {
    const { isOnline, wasOffline } = useOfflineDetection();
    const [showNotification, setShowNotification] = useState(false);
    const [showReconnected, setShowReconnected] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isAnimatingIn, setIsAnimatingIn] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setShowNotification(true);
            setShowReconnected(false);
            setIsAnimatingOut(false);
            setIsAnimatingIn(true);
            // Trigger slide-in animation
            setTimeout(() => setIsAnimatingIn(false), 100);
        } else if (wasOffline && isOnline) {
            // User just came back online
            setShowNotification(false);
            setShowReconnected(true);
            setIsAnimatingOut(false);
            setIsAnimatingIn(true);
            // Trigger slide-in animation
            setTimeout(() => setIsAnimatingIn(false), 100);
            
            // Hide reconnected message after 3 seconds
            const timer = setTimeout(() => {
                setIsAnimatingOut(true);
                // Wait for animation to complete before hiding
                setTimeout(() => {
                    setShowReconnected(false);
                    setIsAnimatingOut(false);
                }, 500);
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline]);

    const handleDismiss = (type: 'offline' | 'online') => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            if (type === 'offline') {
                setShowNotification(false);
            } else {
                setShowReconnected(false);
            }
            setIsAnimatingOut(false);
        }, 500);
    };

    // Show offline notification
    if (!isOnline && showNotification) {
        return (
            <div className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-500 ease-out ${
                isAnimatingOut ? '-translate-y-full' : isAnimatingIn ? '-translate-y-full' : 'translate-y-0'
            }`}>
                <div className="bg-red-600 text-white px-4 py-2 shadow-lg flex items-center justify-center gap-3 w-full">
                    <WifiOff className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 text-center">
                        <p className="font-medium text-sm">You're offline - Some features may not work properly</p>
                    </div>
                    <button
                        onClick={() => handleDismiss('offline')}
                        className="text-red-100 hover:text-white transition-colors flex-shrink-0"
                        aria-label="Dismiss notification"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    // Show reconnected notification
    if (showReconnected) {
        return (
            <div className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-500 ease-out ${
                isAnimatingOut ? '-translate-y-full' : isAnimatingIn ? '-translate-y-full' : 'translate-y-0'
            }`}>
                <div className="bg-green-600 text-white px-4 py-2 shadow-lg flex items-center justify-center gap-3 w-full">
                    <Wifi className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 text-center">
                        <p className="font-medium text-sm">You're back online! All features are now available</p>
                    </div>
                    <button
                        onClick={() => handleDismiss('online')}
                        className="text-green-100 hover:text-white transition-colors flex-shrink-0"
                        aria-label="Dismiss notification"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    return null;
}