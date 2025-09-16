// PWA Install Prompt Handler
let deferredPrompt;
let installButton = null;

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA: beforeinstallprompt fired');
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

// Listen for appinstalled event
window.addEventListener('appinstalled', (evt) => {
  console.log('PWA: App was installed');
  hideInstallButton();
  deferredPrompt = null;
});

// Show install button
function showInstallButton() {
  // Don't show if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }

  if (!installButton) {
    installButton = document.createElement('button');
    installButton.innerHTML = '⬇️ Install App';
    installButton.className = 'pwa-install-btn';
    installButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #007AFF;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
      transition: all 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;
    
    // Hover effects
    installButton.addEventListener('mouseover', () => {
      installButton.style.transform = 'translateY(-2px)';
      installButton.style.boxShadow = '0 6px 16px rgba(0, 122, 255, 0.4)';
    });
    
    installButton.addEventListener('mouseout', () => {
      installButton.style.transform = 'translateY(0)';
      installButton.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3)';
    });
    
    installButton.addEventListener('click', installPWA);
    document.body.appendChild(installButton);
  }
}

// Hide install button
function hideInstallButton() {
  if (installButton && installButton.parentNode) {
    installButton.parentNode.removeChild(installButton);
    installButton = null;
  }
}

// Install PWA
async function installPWA() {
  if (deferredPrompt) {
    installButton.innerHTML = '⏳ Installing...';
    installButton.disabled = true;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`PWA: User response to install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      console.log('PWA: User accepted the install prompt');
    } else {
      console.log('PWA: User dismissed the install prompt');
      // Reset button
      installButton.innerHTML = '⬇️ Install App';
      installButton.disabled = false;
    }
    
    deferredPrompt = null;
  }
}

// Check if already installed
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('PWA: App is running in standalone mode');
} else {
  console.log('PWA: App is running in browser mode');
}

// iOS Safari specific handling
const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

const isInStandaloneMode = () => {
  return ('standalone' in window.navigator) && (window.navigator.standalone);
};

// Show iOS install instructions if needed
if (isIos() && !isInStandaloneMode()) {
  console.log('PWA: iOS device detected, install via Share > Add to Home Screen');
  
  // Show iOS install hint
  setTimeout(() => {
    if (!installButton) {
      const iosHint = document.createElement('div');
      iosHint.innerHTML = '📱 Add to Home Screen';
      iosHint.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #007AFF;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        animation: fadeIn 0.3s ease;
      `;
      
      // Add fade in animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(iosHint);
      
      // Remove after 5 seconds
      setTimeout(() => {
        if (iosHint.parentNode) {
          iosHint.parentNode.removeChild(iosHint);
        }
      }, 5000);
    }
  }, 2000);
}