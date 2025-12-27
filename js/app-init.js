// App Initialization
function initApp() {
    console.log('Marmaid.com PWA Initializing...');
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        });
    }
    
    // Initialize theme
    initTheme();
    
    // Initialize router
    initRouter();
    
    // Initialize event listeners
    initEventListeners();
    
    // Check for updates
    checkForUpdates();
    
    console.log('Marmaid.com PWA Initialized');
}

function initTheme() {
    // Check for saved theme or prefer dark mode
    const savedTheme = localStorage.getItem('marmaid-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
    } else {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
    }
}

function initEventListeners() {
    // Header buttons
    const escortLoginBtn = document.getElementById('escort-login-btn');
    const escortSignupBtn = document.getElementById('escort-signup-btn');
    
    if (escortLoginBtn) {
        escortLoginBtn.addEventListener('click', () => {
            window.location.hash = '/escort-login';
        });
    }
    
    if (escortSignupBtn) {
        escortSignupBtn.addEventListener('click', () => {
            window.location.hash = '/escort-signup';
        });
    }
    
    // Bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Back button handling
    window.addEventListener('popstate', () => {
        initRouter();
    });
    
    // Online/offline detection
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // App visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

function updateOnlineStatus() {
    const status = navigator.onLine ? 'online' : 'offline';
    const event = new CustomEvent('network-status', { detail: { status } });
    document.dispatchEvent(event);
    
    if (status === 'offline') {
        showToast('You are offline. Some features may be limited.', 'warning');
    } else {
        showToast('You are back online!', 'success');
    }
}

function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        // App came to foreground
        document.dispatchEvent(new CustomEvent('app-visible'));
    } else {
        // App went to background
        document.dispatchEvent(new CustomEvent('app-hidden'));
    }
}

function checkForUpdates() {
    // Check for app updates every hour
    setInterval(async () => {
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            const registration = await navigator.serviceWorker.ready;
            registration.update();
        }
    }, 60 * 60 * 1000); // 1 hour
}

function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('hidden');
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast {
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 1000;
                max-width: 350px;
                animation: slideIn 0.3s ease;
            }
            
            .toast-content {
                background: var(--color-bg-card);
                border: 1px solid var(--color-border-light);
                border-radius: var(--radius-md);
                padding: var(--spacing-md);
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-shadow: var(--shadow-lg);
            }
            
            .toast-message {
                color: var(--color-text-primary);
                font-size: 14px;
            }
            
            .toast-close {
                background: none;
                border: none;
                color: var(--color-text-secondary);
                font-size: 20px;
                cursor: pointer;
                margin-left: var(--spacing-sm);
            }
            
            .toast-info .toast-content {
                border-left: 4px solid var(--color-accent-blue);
            }
            
            .toast-success .toast-content {
                border-left: 4px solid var(--color-accent-green);
            }
            
            .toast-warning .toast-content {
                border-left: 4px solid #F59E0B;
            }
            
            .toast-error .toast-content {
                border-left: 4px solid #EF4444;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Add close event
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Add slideOut animation
if (!document.querySelector('#toast-animations')) {
    const animations = document.createElement('style');
    animations.id = 'toast-animations';
    animations.textContent = `
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(animations);
}

// Export for use in other modules
window.appUtils = {
    showLoading,
    hideLoading,
    showToast,
    initApp
};