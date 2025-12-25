'use strict';

/**
 * Pesewa.com - Authentication Module
 * Handles user authentication, registration, and session management
 */

const PesewaAuth = {
    // Firebase configuration (mock for frontend)
    firebaseConfig: {
        apiKey: "AIzaSyDummyKeyForFrontendOnly",
        authDomain: "pesewa-com.firebaseapp.com",
        projectId: "pesewa-com",
        storageBucket: "pesewa-com.appspot.com",
        messagingSenderId: "123456789012",
        appId: "1:123456789012:web:dummyappid",
        measurementId: "G-DUMMYID"
    },

    // Current user session
    currentUser: null,

    // Initialize authentication
    init() {
        console.log('Pesewa Auth Initializing...');
        
        // Check for existing session
        this.checkExistingSession();
        
        // Setup login form if exists
        this.setupLoginForm();
        
        // Setup registration forms
        this.setupRegistrationForms();
        
        // Setup logout
        this.setupLogout();
        
        // Listen for auth state changes
        this.setupAuthStateListener();
        
        console.log('Pesewa Auth Initialized');
    },

    // Check for existing session
    checkExistingSession() {
        // Check localStorage for user data
        const userData = localStorage.getItem('pesewa_user');
        const authToken = localStorage.getItem('pesewa_auth_token');
        
        if (userData && authToken) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateAuthUI(true);
                this.emitAuthStateChange('login', this.currentUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.clearSession();
            }
        } else {
            this.updateAuthUI(false);
        }
    },

    // Setup login form
    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const phone = document.getElementById('loginPhone')?.value;
            const password = document.getElementById('loginPassword')?.value;
            const country = document.getElementById('loginCountry')?.value;
            
            if (!phone || !password) {
                this.showAuthError('Please enter phone and password');
                return;
            }
            
            await this.handleLogin(phone, password, country);
        });
    },

    // Setup registration forms
    setupRegistrationForms() {
        // Borrower registration
        const borrowerForm = document.getElementById('borrowerRegistration');
        if (borrowerForm) {
            borrowerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleBorrowerRegistration(borrowerForm);
            });
        }

        // Lender registration
        const lenderForm = document.getElementById('lenderRegistration');
        if (lenderForm) {
            lenderForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLenderRegistration(lenderForm);
            });
        }

        // Setup role tabs
        const roleTabs = document.querySelectorAll('.role-tab');
        roleTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const role = tab.getAttribute('data-role');
                this.switchRegistrationForm(role);
            });
        });
    },

    // Setup logout
    setupLogout() {
        const logoutButtons = document.querySelectorAll('[data-action="logout"]');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        });
    },

    // Setup auth state listener
    setupAuthStateListener() {
        // Custom event for auth state changes
        document.addEventListener('authStateChange', (e) => {
            const { type, user } = e.detail;
            console.log(`Auth state changed: ${type}`, user);
            
            // Update any UI that depends on auth state
            this.updateNavigation(user);
            this.updateDashboardAccess(user);
        });
    },

    // Handle login
    async handleLogin(phone, password, country = null) {
        try {
            this.showAuthLoading(true);
            
            // Validate inputs
            if (!this.validatePhone(phone)) {
                throw new Error('Please enter a valid phone number');
            }
            
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }
            
            // Simulate API call (replace with actual Firebase/backend)
            const user = await this.mockLogin(phone, password, country);
            
            // Store session
            this.setSession(user, 'mock-token-' + Date.now());
            
            // Update UI
            this.updateAuthUI(true);
            this.emitAuthStateChange('login', user);
            
            // Show success
            this.showAuthSuccess('Login successful! Redirecting...');
            
            // Redirect based on role
            setTimeout(() => {
                this.redirectAfterLogin(user);
            }, 1500);
            
        } catch (error) {
            this.showAuthError(error.message || 'Login failed');
        } finally {
            this.showAuthLoading(false);
        }
    },

    // Handle borrower registration
    async handleBorrowerRegistration(form) {
        try {
            this.showAuthLoading(true, 'Registering borrower...');
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Validate data
            const validation = this.validateBorrowerData(data);
            if (!validation.valid) {
                throw new Error(validation.errors.join(', '));
            }
            
            // Create user object
            const user = this.createBorrowerUser(data);
            
            // Simulate registration
            await this.mockRegister(user);
            
            // Store session
            this.setSession(user, 'mock-token-reg-' + Date.now());
            
            // Update UI
            this.updateAuthUI(true);
            this.emitAuthStateChange('register', user);
            
            // Show success
            this.showAuthSuccess('Borrower registration successful!');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'pages/dashboard/borrower-dashboard.html';
            }, 2000);
            
        } catch (error) {
            this.showAuthError(error.message || 'Registration failed');
        } finally {
            this.showAuthLoading(false);
        }
    },

    // Handle lender registration
    async handleLenderRegistration(form) {
        try {
            this.showAuthLoading(true, 'Registering lender...');
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Validate data
            const validation = this.validateLenderData(data);
            if (!validation.valid) {
                throw new Error(validation.errors.join(', '));
            }
            
            // Create user object
            const user = this.createLenderUser(data);
            
            // Simulate registration
            await this.mockRegister(user);
            
            // Store session
            this.setSession(user, 'mock-token-reg-' + Date.now());
            
            // Update UI
            this.updateAuthUI(true);
            this.emitAuthStateChange('register', user);
            
            // Show success with subscription reminder
            this.showAuthSuccess('Lender registration successful! Please complete subscription payment.');
            
            // Redirect to subscription page
            setTimeout(() => {
                window.location.href = 'pages/subscriptions.html';
            }, 2000);
            
        } catch (error) {
            this.showAuthError(error.message || 'Registration failed');
        } finally {
            this.showAuthLoading(false);
        }
    },

    // Handle logout
    handleLogout() {
        // Clear session
        this.clearSession();
        
        // Update UI
        this.updateAuthUI(false);
        this.emitAuthStateChange('logout', null);
        
        // Show message
        this.showAuthSuccess('Logged out successfully');
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    },

    // Validate phone number
    validatePhone(phone) {
        // Simple validation - can be enhanced for specific countries
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 8 && cleaned.length <= 15;
    },

    // Validate borrower registration data
    validateBorrowerData(data) {
        const errors = [];
        
        // Required fields
        const required = [
            'borrowerFullName',
            'borrowerPhone',
            'borrowerNationalID',
            'borrowerLocation',
            'borrowerOccupation',
            'borrowerCountry',
            'nextOfKin',
            'guarantor1',
            'guarantor2'
        ];
        
        required.forEach(field => {
            if (!data[field] || data[field].trim() === '') {
                errors.push(`${field.replace('borrower', '').replace(/([A-Z])/g, ' $1').trim()} is required`);
            }
        });
        
        // Phone validation
        if (data.borrowerPhone && !this.validatePhone(data.borrowerPhone)) {
            errors.push('Please enter a valid phone number');
        }
        
        // National ID validation
        if (data.borrowerNationalID && data.borrowerNationalID.length < 5) {
            errors.push('National ID must be at least 5 characters');
        }
        
        // Categories validation
        const categories = data.categories || [];
        if (!Array.isArray(categories)) {
            const catArray = typeof categories === 'string' ? [categories] : [];
            if (catArray.length === 0) {
                errors.push('Please select at least one loan category');
            }
        } else if (categories.length === 0) {
            errors.push('Please select at least one loan category');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Validate lender registration data
    validateLenderData(data) {
        const errors = [];
        
        // Required fields
        const required = [
            'lenderName',
            'lenderPhone',
            'lenderEmail',
            'lenderCountry',
            'lenderTier'
        ];
        
        required.forEach(field => {
            if (!data[field] || data[field].trim() === '') {
                errors.push(`${field.replace('lender', '').replace(/([A-Z])/g, ' $1').trim()} is required`);
            }
        });
        
        // Phone validation
        if (data.lenderPhone && !this.validatePhone(data.lenderPhone)) {
            errors.push('Please enter a valid phone number');
        }
        
        // Email validation
        if (data.lenderEmail && !this.validateEmail(data.lenderEmail)) {
            errors.push('Please enter a valid email address');
        }
        
        // Categories validation
        const categories = data.categories || [];
        if (!Array.isArray(categories)) {
            const catArray = typeof categories === 'string' ? [categories] : [];
            if (catArray.length === 0) {
                errors.push('Please select at least one loan category');
            }
        } else if (categories.length === 0) {
            errors.push('Please select at least one loan category');
        }
        
        // Agreement validation
        if (!data.agreement || data.agreement !== 'on') {
            errors.push('You must agree to the terms and conditions');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Validate email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Create borrower user object
    createBorrowerUser(data) {
        return {
            id: 'borrower_' + Date.now(),
            type: 'borrower',
            name: data.borrowerFullName,
            phone: data.borrowerPhone,
            email: data.borrowerEmail || '',
            nationalId: data.borrowerNationalID,
            location: data.borrowerLocation,
            occupation: data.borrowerOccupation,
            country: data.borrowerCountry,
            nextOfKin: data.nextOfKin,
            guarantors: [
                { phone: data.guarantor1, verified: false },
                { phone: data.guarantor2, verified: false }
            ],
            categories: Array.isArray(data.categories) ? data.categories : [data.categories],
            rating: 5,
            totalBorrowed: 0,
            activeLoans: 0,
            completedLoans: 0,
            blacklisted: false,
            groups: [],
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
    },

    // Create lender user object
    createLenderUser(data) {
        return {
            id: 'lender_' + Date.now(),
            type: 'lender',
            name: data.lenderName,
            nickname: data.lenderNickname || '',
            phone: data.lenderPhone,
            email: data.lenderEmail,
            country: data.lenderCountry,
            tier: data.lenderTier,
            categories: Array.isArray(data.categories) ? data.categories : [data.categories],
            subscription: {
                tier: data.lenderTier,
                status: 'pending',
                expiresAt: this.calculateSubscriptionExpiry(),
                paymentRequired: true
            },
            rating: 5,
            totalLent: 0,
            activeLoans: 0,
            totalBorrowers: 0,
            profit: 0,
            groups: [],
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
    },

    // Calculate subscription expiry (28th of next month)
    calculateSubscriptionExpiry() {
        const now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth() + 2; // Next month
        
        if (month > 12) {
            month = month - 12;
            year += 1;
        }
        
        // Set to 28th of the month
        const expiryDate = new Date(year, month - 1, 28);
        return expiryDate.toISOString();
    },

    // Mock login function (replace with actual Firebase)
    async mockLogin(phone, password, country) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check mock users in localStorage
        const mockUsers = JSON.parse(localStorage.getItem('pesewa_mock_users') || '[]');
        const user = mockUsers.find(u => u.phone === phone && u.password === password);
        
        if (!user) {
            throw new Error('Invalid phone number or password');
        }
        
        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;
        
        return userWithoutPassword;
    },

    // Mock registration function
    async mockRegister(user) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store in mock users (for demo purposes)
        const mockUsers = JSON.parse(localStorage.getItem('pesewa_mock_users') || '[]');
        
        // Add user to mock database
        mockUsers.push({
            ...user,
            password: 'hashed_password_mock' // In real app, this would be hashed
        });
        
        localStorage.setItem('pesewa_mock_users', JSON.stringify(mockUsers));
        
        return { success: true, userId: user.id };
    },

    // Set user session
    setSession(user, token) {
        this.currentUser = user;
        
        // Store in localStorage
        localStorage.setItem('pesewa_user', JSON.stringify(user));
        localStorage.setItem('pesewa_auth_token', token);
        localStorage.setItem('pesewa_auth_time', Date.now().toString());
        
        // Update last login
        user.lastLogin = new Date().toISOString();
    },

    // Clear session
    clearSession() {
        this.currentUser = null;
        
        // Clear localStorage
        localStorage.removeItem('pesewa_user');
        localStorage.removeItem('pesewa_auth_token');
        localStorage.removeItem('pesewa_auth_time');
    },

    // Update authentication UI
    updateAuthUI(isAuthenticated) {
        // Update login/logout buttons
        const loginButtons = document.querySelectorAll('[data-auth="login"]');
        const logoutButtons = document.querySelectorAll('[data-auth="logout"]');
        const userMenus = document.querySelectorAll('.user-menu');
        
        if (isAuthenticated && this.currentUser) {
            // User is logged in
            loginButtons.forEach(btn => {
                btn.style.display = 'none';
            });
            logoutButtons.forEach(btn => {
                btn.style.display = 'block';
            });
            
            // Update user info in menus
            userMenus.forEach(menu => {
                const userInfo = menu.querySelector('.user-info');
                if (userInfo && this.currentUser.name) {
                    userInfo.textContent = this.currentUser.name;
                }
                
                const userAvatar = menu.querySelector('.user-avatar');
                if (userAvatar && this.currentUser.name) {
                    const initials = this.currentUser.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .substring(0, 2);
                    userAvatar.textContent = initials;
                }
            });
        } else {
            // User is not logged in
            loginButtons.forEach(btn => {
                btn.style.display = 'block';
            });
            logoutButtons.forEach(btn => {
                btn.style.display = 'none';
            });
            
            // Clear user info in menus
            userMenus.forEach(menu => {
                const userInfo = menu.querySelector('.user-info');
                if (userInfo) {
                    userInfo.textContent = 'Guest';
                }
                
                const userAvatar = menu.querySelector('.user-avatar');
                if (userAvatar) {
                    userAvatar.textContent = '👤';
                }
            });
        }
    },

    // Update navigation based on user role
    updateNavigation(user) {
        if (!user) return;
        
        // Show/hide role-specific navigation items
        const borrowerNav = document.querySelectorAll('[data-role="borrower"]');
        const lenderNav = document.querySelectorAll('[data-role="lender"]');
        const adminNav = document.querySelectorAll('[data-role="admin"]');
        
        if (user.type === 'borrower') {
            borrowerNav.forEach(item => item.style.display = 'block');
            lenderNav.forEach(item => item.style.display = 'none');
            adminNav.forEach(item => item.style.display = 'none');
        } else if (user.type === 'lender') {
            borrowerNav.forEach(item => item.style.display = 'none');
            lenderNav.forEach(item => item.style.display = 'block');
            adminNav.forEach(item => item.style.display = 'none');
        } else if (user.type === 'admin') {
            borrowerNav.forEach(item => item.style.display = 'none');
            lenderNav.forEach(item => item.style.display = 'none');
            adminNav.forEach(item => item.style.display = 'block');
        }
    },

    // Update dashboard access
    updateDashboardAccess(user) {
        const dashboardLinks = document.querySelectorAll('[href*="dashboard"]');
        
        dashboardLinks.forEach(link => {
            if (user) {
                // Update href based on user type
                if (user.type === 'borrower') {
                    link.href = 'pages/dashboard/borrower-dashboard.html';
                } else if (user.type === 'lender') {
                    link.href = 'pages/dashboard/lender-dashboard.html';
                } else if (user.type === 'admin') {
                    link.href = 'pages/dashboard/admin-dashboard.html';
                }
                link.style.display = 'block';
            } else {
                link.style.display = 'none';
            }
        });
    },

    // Switch registration form based on role
    switchRegistrationForm(role) {
        const forms = document.querySelectorAll('.registration-form');
        const tabs = document.querySelectorAll('.role-tab');
        
        // Update active tab
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-role') === role) {
                tab.classList.add('active');
            }
        });
        
        // Show/hide forms
        forms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${role}Form`) {
                form.classList.add('active');
            }
        });
        
        // Special handling for "both" role
        if (role === 'both') {
            const borrowerForm = document.getElementById('borrowerForm');
            const lenderForm = document.getElementById('lenderForm');
            if (borrowerForm) borrowerForm.classList.add('active');
            if (lenderForm) lenderForm.classList.add('active');
        }
    },

    // Redirect after login based on role
    redirectAfterLogin(user) {
        if (!user) return;
        
        let redirectUrl = 'index.html';
        
        switch (user.type) {
            case 'borrower':
                redirectUrl = 'pages/dashboard/borrower-dashboard.html';
                break;
            case 'lender':
                redirectUrl = 'pages/dashboard/lender-dashboard.html';
                break;
            case 'admin':
                redirectUrl = 'pages/dashboard/admin-dashboard.html';
                break;
        }
        
        // Check if subscription is required for lenders
        if (user.type === 'lender' && user.subscription?.status === 'pending') {
            redirectUrl = 'pages/subscriptions.html';
        }
        
        window.location.href = redirectUrl;
    },

    // Show auth loading state
    showAuthLoading(show, message = 'Processing...') {
        const buttons = document.querySelectorAll('button[type="submit"]');
        
        buttons.forEach(button => {
            if (show) {
                const originalText = button.textContent;
                button.setAttribute('data-original-text', originalText);
                button.textContent = message;
                button.disabled = true;
            } else {
                const originalText = button.getAttribute('data-original-text');
                if (originalText) {
                    button.textContent = originalText;
                    button.removeAttribute('data-original-text');
                }
                button.disabled = false;
            }
        });
    },

    // Show auth error
    showAuthError(message) {
        // Create or update error display
        let errorDiv = document.querySelector('.auth-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'auth-error';
            errorDiv.style.cssText = `
                background-color: var(--warning-background);
                color: var(--gentle-alert);
                padding: 12px 16px;
                border-radius: 8px;
                margin: 16px 0;
                border: 1px solid var(--gentle-alert);
            `;
            
            const forms = document.querySelectorAll('.registration-form, #loginForm');
            forms.forEach(form => {
                if (form.parentNode) {
                    form.parentNode.insertBefore(errorDiv, form);
                }
            });
        }
        
        errorDiv.innerHTML = `
            <strong>Error:</strong> ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; cursor: pointer;">×</button>
        `;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.display = 'none';
            }
        }, 5000);
    },

    // Show auth success
    showAuthSuccess(message) {
        // Create or update success display
        let successDiv = document.querySelector('.auth-success');
        
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'auth-success';
            successDiv.style.cssText = `
                background-color: var(--trust-mint);
                color: var(--stability-green);
                padding: 12px 16px;
                border-radius: 8px;
                margin: 16px 0;
                border: 1px solid var(--mutual-green);
            `;
            
            const forms = document.querySelectorAll('.registration-form, #loginForm');
            forms.forEach(form => {
                if (form.parentNode) {
                    form.parentNode.insertBefore(successDiv, form);
                }
            });
        }
        
        successDiv.innerHTML = `
            <strong>Success:</strong> ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; cursor: pointer;">×</button>
        `;
        successDiv.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.style.display = 'none';
            }
        }, 3000);
    },

    // Emit auth state change event
    emitAuthStateChange(type, user) {
        const event = new CustomEvent('authStateChange', {
            detail: { type, user }
        });
        document.dispatchEvent(event);
    },

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    },

    // Check if user has specific role
    hasRole(role) {
        if (!this.currentUser) return false;
        return this.currentUser.type === role;
    },

    // Check subscription status for lenders
    checkSubscriptionStatus() {
        if (!this.currentUser || this.currentUser.type !== 'lender') {
            return { valid: true, message: 'Not a lender' };
        }
        
        const subscription = this.currentUser.subscription;
        if (!subscription) {
            return { valid: false, message: 'No subscription found' };
        }
        
        const now = new Date();
        const expiresAt = new Date(subscription.expiresAt);
        
        if (subscription.status === 'pending') {
            return { valid: false, message: 'Subscription payment required' };
        }
        
        if (subscription.status === 'expired' || expiresAt < now) {
            return { valid: false, message: 'Subscription expired' };
        }
        
        return { valid: true, message: 'Subscription active' };
    }
};

// Initialize auth when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PesewaAuth.init());
} else {
    PesewaAuth.init();
}

// Export for use in other modules
window.PesewaAuth = PesewaAuth;