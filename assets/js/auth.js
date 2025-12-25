'use strict';

// Pesewa.com - Authentication Module

// Authentication state
const AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    role: null,
    loginTime: null
};

// Initialize authentication module
function initAuth() {
    console.log('Auth: Initializing authentication module...');
    
    // Load saved authentication state
    loadAuthState();
    
    // Check token expiration
    checkTokenExpiration();
    
    // Initialize logout handlers
    initLogoutHandlers();
    
    // Initialize session monitoring
    initSessionMonitoring();
}

// Load authentication state from localStorage
function loadAuthState() {
    try {
        const savedAuth = localStorage.getItem('pesewa_auth');
        if (savedAuth) {
            const authData = JSON.parse(savedAuth);
            
            // Check if token is still valid
            if (authData.token && authData.expiresAt && new Date(authData.expiresAt) > new Date()) {
                AuthState.isAuthenticated = true;
                AuthState.user = authData.user;
                AuthState.token = authData.token;
                AuthState.role = authData.role;
                AuthState.loginTime = authData.loginTime;
                
                console.log('Auth: Loaded saved authentication state');
                updateUIForAuthState();
            } else {
                // Token expired, clear saved state
                clearAuthState();
                console.log('Auth: Token expired, clearing saved state');
            }
        }
    } catch (error) {
        console.error('Auth: Error loading authentication state:', error);
        clearAuthState();
    }
}

// Save authentication state to localStorage
function saveAuthState() {
    try {
        const authData = {
            user: AuthState.user,
            token: AuthState.token,
            role: AuthState.role,
            loginTime: AuthState.loginTime,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        };
        
        localStorage.setItem('pesewa_auth', JSON.stringify(authData));
        console.log('Auth: Saved authentication state');
    } catch (error) {
        console.error('Auth: Error saving authentication state:', error);
    }
}

// Clear authentication state
function clearAuthState() {
    AuthState.isAuthenticated = false;
    AuthState.user = null;
    AuthState.token = null;
    AuthState.role = null;
    AuthState.loginTime = null;
    
    try {
        localStorage.removeItem('pesewa_auth');
        sessionStorage.removeItem('pesewa_session');
        console.log('Auth: Cleared authentication state');
    } catch (error) {
        console.error('Auth: Error clearing authentication state:', error);
    }
    
    updateUIForAuthState();
}

// Update UI based on authentication state
function updateUIForAuthState() {
    // Update navigation based on auth state
    updateNavigation();
    
    // Update dashboard content if on dashboard page
    updateDashboardContent();
    
    // Update any auth-dependent UI components
    updateAuthDependentUI();
}

// Update navigation based on auth state
function updateNavigation() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const dashboardLink = document.getElementById('dashboardLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const userMenu = document.getElementById('userMenu');
    
    if (AuthState.isAuthenticated) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (dashboardLink) dashboardLink.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userMenu) {
            userMenu.style.display = 'flex';
            updateUserMenu();
        }
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (dashboardLink) dashboardLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Update user menu with user info
function updateUserMenu() {
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    
    if (AuthState.user) {
        if (userName) {
            userName.textContent = AuthState.user.name || AuthState.user.email;
        }
        
        if (userRole) {
            userRole.textContent = AuthState.role ? AuthState.role.charAt(0).toUpperCase() + AuthState.role.slice(1) : 'User';
        }
        
        if (userAvatar) {
            // Generate avatar based on user initials
            const initials = getInitials(AuthState.user.name || AuthState.user.email);
            userAvatar.textContent = initials;
            
            // Add color based on role
            userAvatar.className = 'user-avatar';
            if (AuthState.role === 'lender') {
                userAvatar.classList.add('lender');
            } else if (AuthState.role === 'borrower') {
                userAvatar.classList.add('borrower');
            }
        }
    }
}

// Get initials from name
function getInitials(name) {
    if (!name) return '??';
    
    return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Update dashboard content based on role
function updateDashboardContent() {
    const dashboardContainer = document.querySelector('.dashboard-container');
    if (!dashboardContainer) return;
    
    // This function would be expanded based on specific dashboard requirements
    // For now, just update the welcome message
    const welcomeMsg = document.getElementById('welcomeMessage');
    if (welcomeMsg && AuthState.user) {
        welcomeMsg.textContent = `Welcome back, ${AuthState.user.name || 'User'}!`;
    }
}

// Update auth-dependent UI components
function updateAuthDependentUI() {
    // Update loan calculator visibility
    updateCalculatorVisibility();
    
    // Update group access
    updateGroupAccess();
    
    // Update ledger access
    updateLedgerAccess();
}

// Update calculator visibility based on auth
function updateCalculatorVisibility() {
    const calculatorSection = document.getElementById('loanCalculator');
    if (calculatorSection) {
        if (AuthState.isAuthenticated) {
            calculatorSection.style.display = 'block';
        } else {
            calculatorSection.style.display = 'none';
        }
    }
}

// Update group access based on auth
function updateGroupAccess() {
    // Implementation depends on specific group functionality
    // This would be expanded in groups.js
}

// Update ledger access based on auth
function updateLedgerAccess() {
    // Implementation depends on specific ledger functionality
    // This would be expanded in ledger.js
}

// Initialize logout handlers
function initLogoutHandlers() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Also handle logout from user menu dropdown
    const logoutMenuOption = document.getElementById('logoutMenuOption');
    if (logoutMenuOption) {
        logoutMenuOption.addEventListener('click', handleLogout);
    }
}

// Handle logout
function handleLogout(e) {
    if (e) e.preventDefault();
    
    // Show confirmation dialog
    if (confirm('Are you sure you want to log out?')) {
        performLogout();
    }
}

// Perform logout
function performLogout() {
    // Simulate API call to invalidate token
    simulateAPI('/api/auth/logout', { token: AuthState.token })
        .then(() => {
            showToast('Logged out successfully', 'success');
            clearAuthState();
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        })
        .catch(error => {
            console.error('Auth: Logout error:', error);
            showToast('Error during logout', 'error');
            clearAuthState();
            window.location.href = '/';
        });
}

// Initialize session monitoring
function initSessionMonitoring() {
    // Check session every minute
    setInterval(checkSession, 60000);
    
    // Monitor user activity
    monitorUserActivity();
}

// Check session status
function checkSession() {
    if (!AuthState.isAuthenticated) return;
    
    // Check token expiration
    checkTokenExpiration();
    
    // Check for session timeout (30 minutes of inactivity)
    const lastActivity = sessionStorage.getItem('pesewa_last_activity');
    if (lastActivity) {
        const inactiveTime = Date.now() - parseInt(lastActivity);
        const thirtyMinutes = 30 * 60 * 1000;
        
        if (inactiveTime > thirtyMinutes) {
            console.log('Auth: Session timeout due to inactivity');
            showToast('Your session has expired due to inactivity', 'warning');
            clearAuthState();
        }
    }
}

// Monitor user activity
function monitorUserActivity() {
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
        document.addEventListener(event, () => {
            if (AuthState.isAuthenticated) {
                sessionStorage.setItem('pesewa_last_activity', Date.now().toString());
            }
        });
    });
}

// Check token expiration
function checkTokenExpiration() {
    if (!AuthState.token || !AuthState.loginTime) return;
    
    // Check if token is about to expire (within 5 minutes)
    const tokenAge = Date.now() - new Date(AuthState.loginTime).getTime();
    const tokenLifetime = 7 * 24 * 60 * 60 * 1000; // 7 days
    const fiveMinutes = 5 * 60 * 1000;
    
    if (tokenAge > tokenLifetime - fiveMinutes) {
        // Token is about to expire, try to refresh
        refreshToken();
    }
}

// Refresh authentication token
function refreshToken() {
    if (!AuthState.token) return;
    
    simulateAPI('/api/auth/refresh', { token: AuthState.token })
        .then(response => {
            if (response.success && response.data.newToken) {
                AuthState.token = response.data.newToken;
                AuthState.loginTime = new Date().toISOString();
                saveAuthState();
                console.log('Auth: Token refreshed successfully');
            }
        })
        .catch(error => {
            console.error('Auth: Token refresh failed:', error);
            // If refresh fails, log out user
            showToast('Session expired. Please log in again.', 'warning');
            clearAuthState();
        });
}

// Validate user credentials
function validateCredentials(credentials) {
    const errors = [];
    
    // Validate phone number
    if (credentials.phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(credentials.phone)) {
            errors.push('Invalid phone number format');
        }
    }
    
    // Validate email
    if (credentials.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
            errors.push('Invalid email address');
        }
    }
    
    // Validate password
    if (credentials.password) {
        if (credentials.password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }
    }
    
    return errors;
}

// Authenticate user (login)
function authenticateUser(credentials) {
    return new Promise((resolve, reject) => {
        // Validate credentials
        const validationErrors = validateCredentials(credentials);
        if (validationErrors.length > 0) {
            reject({ success: false, errors: validationErrors });
            return;
        }
        
        // Simulate API call
        simulateAPI('/api/auth/login', credentials)
            .then(response => {
                if (response.success && response.data.user && response.data.token) {
                    // Update auth state
                    AuthState.isAuthenticated = true;
                    AuthState.user = response.data.user;
                    AuthState.token = response.data.token;
                    AuthState.role = response.data.user.role;
                    AuthState.loginTime = new Date().toISOString();
                    
                    // Save auth state
                    saveAuthState();
                    
                    // Update UI
                    updateUIForAuthState();
                    
                    // Set last activity timestamp
                    sessionStorage.setItem('pesewa_last_activity', Date.now().toString());
                    
                    console.log('Auth: User authenticated successfully');
                    resolve(response);
                } else {
                    reject({ success: false, message: 'Authentication failed' });
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Register new user
function registerUser(userData) {
    return new Promise((resolve, reject) => {
        // Validate user data
        const validationErrors = validateUserData(userData);
        if (validationErrors.length > 0) {
            reject({ success: false, errors: validationErrors });
            return;
        }
        
        // Simulate API call
        simulateAPI('/api/auth/register', userData)
            .then(response => {
                if (response.success) {
                    console.log('Auth: User registered successfully');
                    resolve(response);
                } else {
                    reject(response);
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Validate user registration data
function validateUserData(userData) {
    const errors = [];
    
    // Validate required fields based on role
    if (userData.role === 'borrower') {
        if (!userData.name) errors.push('Name is required');
        if (!userData.nationalId) errors.push('National ID is required');
        if (!userData.phone) errors.push('Phone number is required');
        if (!userData.country) errors.push('Country is required');
    } else if (userData.role === 'lender') {
        if (!userData.name) errors.push('Name is required');
        if (!userData.phone) errors.push('Phone number is required');
        if (!userData.email) errors.push('Email is required');
        if (!userData.tier) errors.push('Tier selection is required');
    }
    
    // Validate phone
    if (userData.phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(userData.phone)) {
            errors.push('Invalid phone number format');
        }
    }
    
    // Validate email
    if (userData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            errors.push('Invalid email address');
        }
    }
    
    return errors;
}

// Request password reset
function requestPasswordReset(email) {
    return new Promise((resolve, reject) => {
        if (!email) {
            reject({ success: false, message: 'Email is required' });
            return;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            reject({ success: false, message: 'Invalid email address' });
            return;
        }
        
        // Simulate API call
        simulateAPI('/api/auth/password-reset', { email })
            .then(response => {
                if (response.success) {
                    showToast('Password reset instructions sent to your email', 'success');
                    resolve(response);
                } else {
                    reject(response);
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Verify OTP
function verifyOTP(phone, otp) {
    return new Promise((resolve, reject) => {
        if (!phone || !otp) {
            reject({ success: false, message: 'Phone and OTP are required' });
            return;
        }
        
        if (otp.length !== 6) {
            reject({ success: false, message: 'OTP must be 6 digits' });
            return;
        }
        
        // Simulate API call
        simulateAPI('/api/auth/verify-otp', { phone, otp })
            .then(response => {
                if (response.success) {
                    resolve(response);
                } else {
                    reject(response);
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Get current user info
function getCurrentUser() {
    return AuthState.user;
}

// Get current user role
function getCurrentUserRole() {
    return AuthState.role;
}

// Check if user is authenticated
function isUserAuthenticated() {
    return AuthState.isAuthenticated;
}

// Check if user has specific role
function hasRole(role) {
    return AuthState.isAuthenticated && AuthState.role === role;
}

// Check if user has permission (for future use)
function hasPermission(permission) {
    if (!AuthState.isAuthenticated || !AuthState.user) return false;
    
    // This would be expanded based on actual permission system
    // For now, check based on role
    switch(AuthState.role) {
        case 'admin':
            return true;
        case 'lender':
            return ['view_dashboard', 'manage_loans', 'view_ledger'].includes(permission);
        case 'borrower':
            return ['view_dashboard', 'request_loans', 'view_history'].includes(permission);
        default:
            return false;
    }
}

// Simulate API call (duplicate from app.js, but needed here)
function simulateAPI(endpoint, data) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            // Simulate success 90% of the time
            if (Math.random() > 0.1) {
                // For auth endpoints, return appropriate responses
                if (endpoint.includes('/api/auth/login')) {
                    // Mock successful login
                    resolve({
                        success: true,
                        message: 'Login successful',
                        data: {
                            user: {
                                id: 'user_' + Math.random().toString(36).substr(2, 9),
                                name: data.phone === '+233501234567' ? 'Demo User' : 'New User',
                                email: data.email || 'user@example.com',
                                phone: data.phone,
                                role: data.role || (Math.random() > 0.5 ? 'lender' : 'borrower')
                            },
                            token: 'mock_jwt_token_' + Math.random().toString(36).substr(2, 10)
                        }
                    });
                } else if (endpoint.includes('/api/auth/register')) {
                    // Mock successful registration
                    resolve({
                        success: true,
                        message: 'Registration successful',
                        data: {
                            userId: 'user_' + Math.random().toString(36).substr(2, 9)
                        }
                    });
                } else if (endpoint.includes('/api/auth/logout')) {
                    // Mock successful logout
                    resolve({
                        success: true,
                        message: 'Logged out successfully'
                    });
                } else if (endpoint.includes('/api/auth/refresh')) {
                    // Mock token refresh
                    resolve({
                        success: true,
                        data: {
                            newToken: 'refreshed_mock_jwt_token_' + Math.random().toString(36).substr(2, 10)
                        }
                    });
                } else if (endpoint.includes('/api/auth/password-reset')) {
                    // Mock password reset
                    resolve({
                        success: true,
                        message: 'Reset email sent'
                    });
                } else if (endpoint.includes('/api/auth/verify-otp')) {
                    // Mock OTP verification
                    resolve({
                        success: true,
                        message: 'OTP verified'
                    });
                } else {
                    // Generic success response
                    resolve({
                        success: true,
                        message: 'Operation successful',
                        data: data
                    });
                }
            } else {
                // Simulate error
                reject({
                    success: false,
                    message: 'Server error. Please try again.'
                });
            }
        }, 1000);
    });
}

// Show toast notification (duplicate from app.js, but needed here)
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : 
                 type === 'error' ? '❌' : 
                 type === 'warning' ? '⚠️' : 'ℹ️';
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    // Add to container
    container.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
    
    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    });
}

// Initialize auth module when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
});

// Export for use in other modules
window.PesewaAuth = {
    initAuth,
    authenticateUser,
    registerUser,
    requestPasswordReset,
    verifyOTP,
    getCurrentUser,
    getCurrentUserRole,
    isUserAuthenticated,
    hasRole,
    hasPermission,
    handleLogout,
    clearAuthState,
    updateUIForAuthState
};