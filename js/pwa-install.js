// PWA Install Prompt Handling
class PWAInstallHandler {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.init();
    }
    
    init() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt fired');
            
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            
            // Show install button or banner
            this.showInstallPrompt();
            
            // Log event for analytics
            this.logInstallEvent('install-promt-shown');
        });
        
        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.deferredPrompt = null;
            
            // Hide install button
            this.hideInstallPrompt();
            
            // Log installation
            this.logInstallEvent('app-installed');
            
            // Show welcome message
            this.showWelcomeMessage();
        });
        
        // Check if app is already installed
        this.checkIfInstalled();
    }
    
    showInstallPrompt() {
        // Create install button if not exists
        if (!this.installButton) {
            this.installButton = this.createInstallButton();
        }
        
        // Show button after a delay
        setTimeout(() => {
            this.installButton.classList.remove('hidden');
        }, 5000); // Show after 5 seconds
    }
    
    createInstallButton() {
        const button = document.createElement('button');
        button.id = 'pwa-install-btn';
        button.className = 'pwa-install-btn hidden';
        button.innerHTML = `
            <svg class="install-icon" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            <span>Install App</span>
        `;
        
        // Add styles
        if (!document.querySelector('#pwa-install-styles')) {
            const styles = document.createElement('style');
            styles.id = 'pwa-install-styles';
            styles.textContent = `
                .pwa-install-btn {
                    position: fixed;
                    bottom: 90px;
                    right: 20px;
                    z-index: 1000;
                    background: linear-gradient(135deg, #7B2CBF 0%, #9D4EDD 100%);
                    color: white;
                    border: none;
                    border-radius: 50px;
                    padding: 12px 24px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(123, 44, 191, 0.3);
                    animation: float 3s ease-in-out infinite;
                }
                
                .pwa-install-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(123, 44, 191, 0.4);
                }
                
                .install-icon {
                    width: 20px;
                    height: 20px;
                    fill: currentColor;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                
                @media (max-width: 640px) {
                    .pwa-install-btn {
                        bottom: 80px;
                        right: 16px;
                        padding: 10px 20px;
                        font-size: 13px;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Add click handler
        button.addEventListener('click', () => this.promptInstall());
        
        // Add to DOM
        document.body.appendChild(button);
        return button;
    }
    
    async promptInstall() {
        if (!this.deferredPrompt) {
            console.log('No install prompt available');
            return;
        }
        
        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const choiceResult = await this.deferredPrompt.userChoice;
            
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                this.logInstallEvent('install-accepted');
            } else {
                console.log('User dismissed the install prompt');
                this.logInstallEvent('install-dismissed');
            }
            
            // Clear the deferredPrompt variable
            this.deferredPrompt = null;
            
            // Hide the install button
            this.hideInstallPrompt();
            
        } catch (error) {
            console.error('Install prompt error:', error);
            this.logInstallEvent('install-error', error.message);
        }
    }
    
    hideInstallPrompt() {
        if (this.installButton) {
            this.installButton.classList.add('hidden');
        }
    }
    
    checkIfInstalled() {
        // Check if app is running in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('App is running in standalone mode');
            this.logInstallEvent('running-standalone');
            return true;
        }
        
        // Check for iOS standalone mode
        if (window.navigator.standalone === true) {
            console.log('App is running in iOS standalone mode');
            this.logInstallEvent('running-standalone-ios');
            return true;
        }
        
        return false;
    }
    
    showWelcomeMessage() {
        if (window.appUtils) {
            window.appUtils.showToast(
                'Welcome to Marmaid.com! App installed successfully.',
                'success'
            );
        }
    }
    
    logInstallEvent(eventName, details = null) {
        // Here you would typically send this to your analytics service
        console.log(`Install event: ${eventName}`, details);
        
        // Example: Send to Google Analytics
        if (window.gtag) {
            window.gtag('event', 'pwa_install', {
                'event_category': 'pwa',
                'event_label': eventName,
                'value': details ? 1 : 0
            });
        }
    }
    
    // Manual install guide for browsers that don't support beforeinstallprompt
    showManualInstallGuide() {
        const guide = document.createElement('div');
        guide.className = 'pwa-install-guide';
        guide.innerHTML = `
            <div class="guide-content">
                <h3>Install Marmaid.com</h3>
                <p>To install this app:</p>
                <ul>
                    <li><strong>Chrome:</strong> Tap ⋮ menu → "Install app"</li>
                    <li><strong>Safari:</strong> Tap share icon → "Add to Home Screen"</li>
                    <li><strong>Firefox:</strong> Tap ⋮ menu → "Install"</li>
                </ul>
                <button class="btn btn-primary guide-close">Got it</button>
            </div>
        `;
        
        // Add styles
        if (!document.querySelector('#pwa-guide-styles')) {
            const styles = document.createElement('style');
            styles.id = 'pwa-guide-styles';
            styles.textContent = `
                .pwa-install-guide {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1001;
                    padding: 20px;
                }
                
                .guide-content {
                    background: var(--color-bg-card);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-xl);
                    max-width: 400px;
                    width: 100%;
                    border: 1px solid var(--color-border-light);
                    box-shadow: var(--shadow-xl);
                }
                
                .guide-content h3 {
                    margin-bottom: var(--spacing-md);
                    color: var(--color-text-primary);
                }
                
                .guide-content p {
                    margin-bottom: var(--spacing-md);
                    color: var(--color-text-secondary);
                }
                
                .guide-content ul {
                    margin-bottom: var(--spacing-xl);
                    padding-left: var(--spacing-md);
                }
                
                .guide-content li {
                    margin-bottom: var(--spacing-sm);
                    color: var(--color-text-secondary);
                    font-size: 14px;
                }
                
                .guide-close {
                    width: 100%;
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Add close handler
        const closeBtn = guide.querySelector('.guide-close');
        closeBtn.addEventListener('click', () => {
            guide.remove();
        });
        
        // Add to DOM
        document.body.appendChild(guide);
    }
}

// Initialize PWA install handler
function initPWAInstall() {
    window.pwaHandler = new PWAInstallHandler();
}

// Add manual install button in footer (for browsers without beforeinstallprompt)
function addManualInstallButton() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if ((isIOS && isSafari) || !('beforeinstallprompt' in window)) {
        const manualBtn = document.createElement('button');
        manualBtn.className = 'manual-install-btn';
        manualBtn.innerHTML = '📱 Install App';
        manualBtn.addEventListener('click', () => {
            window.pwaHandler.showManualInstallGuide();
        });
        
        // Add to bottom nav or create separate container
        const nav = document.querySelector('.bottom-nav');
        if (nav) {
            nav.insertAdjacentElement('beforebegin', manualBtn);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initPWAInstall();
    addManualInstallButton();
});

// Export for module use
export { PWAInstallHandler, initPWAInstall };