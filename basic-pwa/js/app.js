// Main app functionality for BrokenExp PWA
class PWAManager {
    constructor() {
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        this.setupPWAPrompt();
        this.setupThemeDetection();
        this.setupNetworkDetection();
        this.setupKeyboardHandling();
    }

    setupPWAPrompt() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('PWA install prompt available');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Listen for the app being installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.deferredPrompt = null;
            this.hideInstallButton();
        });
    }

    showInstallButton() {
        // Create install button if it doesn't exist
        if (!document.getElementById('installButton')) {
            const installButton = document.createElement('button');
            installButton.id = 'installButton';
            installButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Install App</span>
            `;
            
            // Style the button
            Object.assign(installButton.style, {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                zIndex: '1000',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
            });

            installButton.addEventListener('click', () => this.installPWA());
            document.body.appendChild(installButton);
        }
    }

    hideInstallButton() {
        const installButton = document.getElementById('installButton');
        if (installButton) {
            installButton.remove();
        }
    }

    async installPWA() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted PWA install');
        } else {
            console.log('User dismissed PWA install');
        }
        
        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    setupThemeDetection() {
        // Listen for theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleThemeChange = (e) => {
            console.log('Theme changed to:', e.matches ? 'dark' : 'light');
            // Update theme-color meta tag
            const themeColorMeta = document.querySelector('meta[name="theme-color"]');
            if (themeColorMeta) {
                themeColorMeta.content = e.matches ? '#18181B' : '#FFFFFF';
            }
        };

        mediaQuery.addEventListener('change', handleThemeChange);
        handleThemeChange(mediaQuery); // Initial check
    }

    setupNetworkDetection() {
        // Network status detection
        const updateNetworkStatus = () => {
            const isOnline = navigator.onLine;
            console.log('Network status:', isOnline ? 'online' : 'offline');
            
            if (!isOnline) {
                this.showNetworkMessage('You are currently offline. Some features may be limited.');
            } else {
                this.hideNetworkMessage();
            }
        };

        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);
        updateNetworkStatus(); // Initial check
    }

    setupKeyboardHandling() {
        // Handle form submission with Enter key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const activeElement = document.activeElement;
                
                // If we're in an input field, find the form and submit it
                if (activeElement && activeElement.tagName === 'INPUT') {
                    const form = activeElement.closest('form');
                    if (form) {
                        const submitButton = form.querySelector('button[type="submit"]') || 
                                           form.querySelector('.auth-button');
                        if (submitButton && !submitButton.disabled) {
                            submitButton.click();
                        }
                    }
                }
            }
        });

        // Handle Escape key to dismiss messages
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const message = document.querySelector('.auth-message');
                if (message) {
                    message.remove();
                }
                
                const networkMessage = document.querySelector('.network-message');
                if (networkMessage) {
                    networkMessage.remove();
                }
            }
        });
    }

    showNetworkMessage(message) {
        // Remove existing network message
        const existingMessage = document.querySelector('.network-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'network-message';
        messageElement.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
            <span>${message}</span>
        `;

        Object.assign(messageElement.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            padding: '12px 20px',
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '1001',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            borderBottom: '1px solid #FBBF24'
        });

        document.body.appendChild(messageElement);
    }

    hideNetworkMessage() {
        const networkMessage = document.querySelector('.network-message');
        if (networkMessage) {
            networkMessage.remove();
        }
    }

    // Utility methods for other parts of the app
    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;

        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '1000',
            maxWidth: 'calc(100vw - 40px)',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            backgroundColor: type === 'error' ? '#FEF2F2' : type === 'success' ? '#F0FDF4' : '#F8FAFC',
            color: type === 'error' ? '#DC2626' : type === 'success' ? '#16A34A' : '#475569',
            border: `1px solid ${type === 'error' ? '#FECACA' : type === 'success' ? '#BBF7D0' : '#E2E8F0'}`,
            animation: 'slideInUp 0.3s ease-out'
        });

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideInUp 0.3s ease-out reverse';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    static vibrate(pattern = [100]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    static async share(data) {
        if (navigator.share) {
            try {
                await navigator.share(data);
                return true;
            } catch (error) {
                console.error('Error sharing:', error);
                return false;
            }
        }
        return false;
    }
}

// Initialize PWA manager
document.addEventListener('DOMContentLoaded', () => {
    new PWAManager();
});

// Make PWAManager available globally
window.PWAManager = PWAManager;