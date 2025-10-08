"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone, Share2, Plus, MoreHorizontal } from "lucide-react";
import { useSettings } from "@web/context/SettingsContext";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Export global functions for logo to use
let globalShowInstallPrompt: (() => void) | null = null;
let globalCanInstall = false;

export function triggerPWAInstall() {
  if (globalShowInstallPrompt) {
    globalShowInstallPrompt();
  }
}

export function canInstallPWA() {
  return globalCanInstall;
}

export function AddToHomeScreen() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({ name: '', isSupported: false });
  const [isActuallyInstalled, setIsActuallyInstalled] = useState(false);
  const { settings, updateSettings } = useSettings();
  
  // Debug component mount and state (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 AddToHomeScreen Component State:', {
        showPrompt,
        isStandalone,
        hasDeferredPrompt: !!deferredPrompt,
        isIOS,
        browserInfo: browserInfo.name,
        timestamp: new Date().toISOString()
      });
    }
  }, [showPrompt, isStandalone, deferredPrompt, isIOS, browserInfo]);

  // Set global functions for logo to use
  globalShowInstallPrompt = () => {
    console.log('🔘 Global PWA install triggered from logo');
    setShowPrompt(true);
  };
  
  // Update global can install status
  const hasDismissedPrompt = settings?.app?.pwaInstallPromptSeen === true;
  globalCanInstall = !isStandalone && !hasDismissedPrompt && !isActuallyInstalled;

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Enhanced PWA detection - check multiple methods
    const checkIfInstalled = () => {
      // Method 1: Display mode media query (most reliable)
      const displayMode = window.matchMedia('(display-mode: standalone)').matches ||
                         window.matchMedia('(display-mode: fullscreen)').matches ||
                         window.matchMedia('(display-mode: minimal-ui)').matches;
      
      // Method 2: iOS specific
      const iosStandalone = (window.navigator as any).standalone === true;
      
      // Method 3: Check URL - PWAs often have specific URL parameters
      const isPWAUrl = window.location.href.includes('mode=standalone');
      
      // Method 4: Check installed related apps (if available)
      if ('getInstalledRelatedApps' in navigator) {
        (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
          if (apps.length > 0) {
            console.log('PWA is installed via getInstalledRelatedApps');
          }
        });
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 PWA Detection:', {
          displayMode,
          iosStandalone,
          isPWAUrl
        });
      }
      
      // For now, let's be more conservative and only consider it installed
      // if we're really sure (require multiple signals)
      return (displayMode && isPWAUrl) || iosStandalone;
    };

    const standalone = checkIfInstalled();
    setIsStandalone(standalone);
    
    // Check if actually installed using appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA was successfully installed!');
      setIsActuallyInstalled(true);
      // Hide the button since it's now installed
      setShowPrompt(false);
    });

    // Detect browser for better instructions
    const userAgent = navigator.userAgent.toLowerCase();
    let browser = { name: 'other', isSupported: false };
    
    // Advanced Chrome detection - handles DevTools mobile simulation
    const isActualChrome = () => {
      // Method 1: Check for Chrome-specific window.chrome object
      const hasChrome = (window as any).chrome !== undefined;
      
      // Method 2: Check userAgentData brands (Chrome/Chromium only)
      const isChromeFromBrands = (window.navigator as any).userAgentData?.brands?.some(
        (brand: any) => brand.brand.includes('Chrome') || brand.brand.includes('Chromium')
      ) || false;
      
      // Method 3: Check if we're in DevTools mobile simulation
      // Real mobile devices have > 1 touch points, DevTools always has 1
      const isDevToolsSimulation = navigator.maxTouchPoints === 1 && 
                                   ('ontouchstart' in window);
      
      // Method 4: Fallback to user agent check
      const isUserAgentChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
      
      return hasChrome || isChromeFromBrands || (isDevToolsSimulation && !userAgent.includes('safari')) || isUserAgentChrome;
    };
    
    if (isActualChrome()) {
      browser = { name: 'chrome', isSupported: true };
    } else if (userAgent.includes('edg')) {
      browser = { name: 'edge', isSupported: true };
    } else if (userAgent.includes('opera')) {
      browser = { name: 'opera', isSupported: true };
    } else if (userAgent.includes('firefox')) {
      browser = { name: 'firefox', isSupported: false };
    } else if (userAgent.includes('safari')) {
      // True Safari (not Chrome pretending to be Safari)
      browser = { name: 'safari', isSupported: iOS }; // Safari on iOS supports PWA
    }
    
    setBrowserInfo(browser);
    
    console.log('🌐 Browser detected:', {
      browser,
      userAgent: navigator.userAgent,
      hasWindowChrome: (window as any).chrome !== undefined,
      userAgentData: (window.navigator as any).userAgentData,
      maxTouchPoints: navigator.maxTouchPoints,
      hasTouch: 'ontouchstart' in window,
      isDevToolsSimulation: navigator.maxTouchPoints === 1 && ('ontouchstart' in window),
      detectedAsChrome: browser.name === 'chrome'
    });

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log('📱 PWA install prompt available - waiting for logo click');
      
      // NO auto-prompt - only show when logo is clicked
    };

    // NO AUTO-PROMPT - PWA only shows when logo is clicked

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [settings]);

  const handleInstallClick = async () => {
    console.log('🔧 Install button clicked', { 
      browser: browserInfo.name, 
      hasDeferredPrompt: !!deferredPrompt 
    });
    
    if (deferredPrompt) {
      // Chrome/Edge with native prompt available
      try {
        console.log('📱 Triggering native install prompt');
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('👤 User choice:', outcome);
        if (outcome === 'accepted') {
          console.log('✅ User accepted the install prompt');
          // Track successful installation in Supabase
          await trackPWAInstall('accepted');
        } else {
          console.log('❌ User dismissed the install prompt');
          // Track dismissal in Supabase
          await trackPWAInstall('dismissed');
        }
        
        setDeferredPrompt(null);
        setShowPrompt(false);
      } catch (error) {
        console.error('❌ Install prompt failed:', error);
        await trackPWAInstall('error');
        setShowPrompt(false);
      }
    } else {
      // Fallback for Chrome/Edge without native prompt - just dismiss
      console.log('ℹ️ No native install prompt available, user needs to add manually');
      setShowPrompt(false);
      await trackPWAInstall('manual_instructions_shown');
    }
  };

  const handleDismiss = async () => {
    console.log('❌ User dismissed PWA prompt');
    setShowPrompt(false);
    // Track dismissal in Supabase
    await trackPWAInstall('dismissed');
  };

  const trackPWAInstall = async (action: 'accepted' | 'dismissed' | 'error' | 'manual_instructions_shown') => {
    try {
      console.log('💾 Tracking PWA install action in Supabase:', action);
      
      // Always mark as seen when they interact with it
      await updateSettings({
        app: { pwaInstallPromptSeen: true }
      });
      
      // You could add additional tracking here if needed
      // For example, analytics or user behavior tracking
      console.log('✅ Successfully tracked PWA action:', action);
    } catch (error) {
      console.error('❌ Failed to track PWA action in Supabase:', error);
      // Fallback to localStorage if Supabase fails
      localStorage.setItem('pwa-install-prompt-seen', 'true');
      localStorage.setItem('pwa-install-action', action);
      console.log('💾 Saved to localStorage as fallback');
    }
  };


  // For testing: Add ?pwa=test to URL to force show button
  const forceShow = new URLSearchParams(window.location.search).get('pwa') === 'test';
  const forceInstallButton = new URLSearchParams(window.location.search).get('pwa') === 'install';
  
  // Don't show if already installed (unless forced for testing)
  if (isStandalone && !forceShow) {
    console.log('🚫 PWA already installed, not showing prompt');
    return null;
  }

  // Don't render any button - just the modal when showPrompt is true
  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm mx-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-background/95 backdrop-blur-lg border border-border shadow-2xl">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        
        <div className="relative p-6">
          <div className="flex items-start gap-4">
            {/* App icon with glow effect */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center">
                  <img src="/images/logo.png" alt="App Icon" className="w-7 h-7 filter drop-shadow-sm" />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 w-12 h-12 rounded-xl bg-primary/10 blur-sm -z-10" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground tracking-tight">
                Install App
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Add to your home screen for instant access
              </p>
              
              <div className="mt-4 w-full">
                {(() => {
                  // Debug: Log the decision path
                  console.log('🎯 Modal render decision:', { 
                    browserName: browserInfo.name, 
                    isIOS, 
                    hasDeferredPrompt: !!deferredPrompt,
                    willShowInstallButton: browserInfo.name === 'chrome' || browserInfo.name === 'edge' || browserInfo.name === 'opera'
                  });
                  return null;
                })()}
                {browserInfo.name === 'chrome' || browserInfo.name === 'edge' || browserInfo.name === 'opera' || forceInstallButton ? (
                  // Chrome/Edge/Opera - Always show install button
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md animate-pulse-subtle"
                  >
                    <Smartphone className="w-4 h-4" />
                    {deferredPrompt ? 'Install App' : 'Install App'}
                  </button>
                ) : isIOS ? (
                  // iOS Safari - Show share instructions
                  <button
                    onClick={handleDismiss}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-muted/50 hover:bg-muted/70 text-foreground text-sm font-medium rounded-lg transition-all duration-200"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Tap Share → Add to Home Screen</span>
                  </button>
                ) : (
                  // Firefox/Safari Desktop - Show manual instructions
                  <button
                    onClick={handleDismiss}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-muted/50 hover:bg-muted/70 text-foreground text-sm font-medium rounded-lg transition-all duration-200"
                  >
                    {browserInfo.name === 'safari' ? (
                      <>
                        <MoreHorizontal className="w-4 h-4" />
                        <span>File → Add to Dock</span>
                      </>
                    ) : browserInfo.name === 'firefox' ? (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Menu → Install</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add to Home Screen</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}