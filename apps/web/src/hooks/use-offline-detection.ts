"use client";

import { useState, useEffect } from 'react';

export function useOfflineDetection() {
    const [isOnline, setIsOnline] = useState(true);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        // Set initial status
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                // User just came back online
                setWasOffline(false);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
        };

        // Add event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Also check periodically by trying to fetch a small resource
        const checkConnection = async () => {
            try {
                const response = await fetch('/favicon.ico', {
                    cache: 'no-cache',
                    method: 'HEAD',
                });
                
                if (response.ok) {
                    if (!isOnline) {
                        setIsOnline(true);
                        if (wasOffline) {
                            setWasOffline(false);
                        }
                    }
                } else {
                    throw new Error('Network response not ok');
                }
            } catch {
                if (isOnline) {
                    setIsOnline(false);
                    setWasOffline(true);
                }
            }
        };

        // Check connection every 30 seconds
        const interval = setInterval(checkConnection, 30000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, [isOnline, wasOffline]);

    return { isOnline, wasOffline };
}