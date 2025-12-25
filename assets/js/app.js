'use strict';

/**
 * Pesewa.com - Main Application JavaScript
 * Emergency Micro-Lending in Trusted Circles PWA
 */

const PesewaApp = {
    // Application state
    state: {
        currentUser: null,
        categories: [],
        countries: [],
        isOnline: navigator.onLine,
        isInstalled: window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    },

    // Initialize application
    init() {
        console.log('Pesewa App Initializing...');
        
        // Load categories and countries
        this.loadCategories();
        this.loadCountries();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check authentication status
        this.checkAuthStatus();
        
        // Setup mobile menu
        this.setupMobileMenu();
        
        // Setup role selection
        this.setupRoleSelection();
        
        // Initialize calculator
        if (typeof LoanCalculator !== 'undefined') {
            LoanCalculator.init();
        }
        
        console.log('Pesewa App Initialized');
    },

    // Load emergency categories
    async loadCategories() {
        try {
            const response = await fetch('data/categories.json');
            this.state.categories = await response.json();
            this.renderCategories();
        } catch (error) {
            console.error('Failed to load categories:', error);
            // Fallback to default categories
            this.state.categories = this.getDefaultCategories();
            this.renderCategories();
        }
    },

    // Load countries data
    async loadCountries() {
        try {
            const response = await fetch('data/countries.json');
            this.state.countries = await response.json();
        } catch (error) {
            console.error('Failed to load countries:', error);
            this.state.countries = this.getDefaultCountries();
        }
    },

    // Get default categories (fallback)
    getDefaultCategories() {
        return [
            {
                id: 'pesewa-fare',
                name: 'PesewaFare',
                icon: '🚌',
                tagline: 'Move on, don\'t stall—borrow for your journey.',
                description: 'Transport fees for emergencies'
            },
            {
                id: 'pesewa-data',
                name: 'PesewaData',
                icon: '📱',
                tagline: 'Stay connected, stay informed—borrow when your bundle runs out.',
                description: 'Internet/Wi-Fi/Airtime data bundles'
            },
            {
                id: 'pesewa-cooking-gas',
                name: 'PesewaCookingGas',
                icon: '🔥',
                tagline: 'Cook with confidence—borrow when your gas is low.',
                description: 'Cooking gas refills'
            },
            {
                id: 'pesewa-food',
                name: 'PesewaFood',
                icon: '🍲',
                tagline: 'Don\'t sleep hungry when paycheck is delayed—borrow and eat today.',
                description: 'Food and groceries'
            },
            {
                id: 'pesewacredo',
                name: 'Pesewacredo',
                icon: '🛠️',
                tagline: 'Fix it fast—borrow for urgent repairs or tools.',
                description: 'Urgent auto repairs and tools'
            },
            {
                id: 'pesewa-water-bill',
                name: 'PesewaWaterBill',
                icon: '💧',
                tagline: 'Stay hydrated—borrow for water needs or bills.',
                description: 'Water bills and refills'
            },
            {
                id: 'pesewa-fuel',
                name: 'PesewaBikeCarTuktukFuel',
                icon: '⛽',
                tagline: 'Keep moving—borrow for fuel, no matter your ride.',
                description: 'Fuel for bikes, cars, tuktuks'
            },
            {
                id: 'pesewa-repair',
                name: 'PesewaBikeCarTuktukRepair',
                icon: '🔧',
                tagline: 'Fix it quick—borrow for minor repairs and keep going.',
                description: 'Minor vehicle repairs'
            },
            {
                id: 'pesewa-medicine',
                name: 'PesewaMedicine',
                icon: '💊',
                tagline: 'Health first—borrow for urgent medicines.',
                description: 'Emergency medical needs'
            },
            {
                id: 'pesewa-electricity',
                name: 'PesewaElectricityTokens',
                icon: '💡',
                tagline: 'Stay lit, stay powered—borrow tokens when you need it.',
                description: 'Electricity token purchases'
            },
            {
                id: 'pesewa-school-fees',
                name: 'Pesewaschoolfees',
                icon: '🎓',
                tagline: 'Education first—urgent school fees.',
                description: 'Emergency school fees'
            },
            {
                id: 'pesewa-tv',
                name: 'PesewaTVSubscription',
                icon: '📺',
                tagline: 'Stay informed—TV subscription.',
                description: 'TV subscription renewals'
            }
        ];
    },

    // Get default countries (fallback)
    getDefaultCountries() {
        return [
            { id: 'kenya', name: 'Kenya', currency: 'KSh', code: 'KE', flag: '🇰🇪' },
            { id: 'uganda', name: 'Uganda', currency: 'UGX', code: 'UG', flag: '🇺🇬' },
            { id: 'tanzania', name: 'Tanzania', currency: 'TZS', code: 'TZ', flag: '🇹🇿' },
            { id: 'rwanda', name: 'Rwanda', currency: 'RWF', code: 'RW', flag: '🇷🇼' },
            { id: 'burundi', name: 'Burundi', currency: 'BIF', code: 'BI', flag: '🇧🇮' },
            { id: 'somalia', name: 'Somalia', currency: 'SOS', code: 'SO', flag: '🇸🇴' },
            { id: 'south-sudan', name: 'South Sudan', currency: 'SSP', code: 'SS', flag: '🇸🇸' },
            { id: 'ethiopia', name: 'Ethiopia', currency: 'ETB', code: 'ET', flag: '🇪🇹' },
            { id: 'congo', name: 'DR Congo', currency: 'CDF', code: 'CD', flag: '🇨🇩' },
            { id: 'nigeria', name: 'Nigeria', currency: 'NGN', code: 'NG', flag: '🇳🇬' },
            { id: 'ghana', name: 'Ghana', currency: 'GHS', code: 'GH', flag: '🇬🇭' },
            { id: 'south-africa', name: 'South Africa', currency: 'ZAR', code: 'ZA', flag: '🇿🇦' }
        ];
    },

    // Render categories on the page
    renderCategories() {
        // Render floating cards in hero
        const floatingCardsContainer = document.getElementById('floatingCards');
        if (floatingCardsContainer) {
            // Take first 6 categories for floating cards
            const floatingCategories = this.state.categories.slice(0, 6);
            floatingCardsContainer.innerHTML = floatingCategories.map(category => `
                <div class="floating-card" data-category="${category.id}">
                    <div class="card-icon">${category.icon}</div>
                    <div class="card-title">${category.name}</div>
                    <div class="card-tagline">${category.tagline}</div>
                </div>
            `).join('');
        }

        // Render categories grid
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (categoriesGrid) {
            categoriesGrid.innerHTML = this.state.categories.map(category => `
                <div class="category-card" data-category="${category.id}">
                    <div class="category-icon">${category.icon}</div>
                    <h3>${category.name}</h3>
                    <p>${category.tagline}</p>
                </div>
            `).join('');
        }

        // Render categories in registration forms
        const borrowerCategories = document.getElementById('borrowerCategories');
        const lenderCategories = document.getElementById('lenderCategories');
        
        const categoryCheckboxes = this.state.categories.map(category => `
            <div class="checkbox-item">
                <input type="checkbox" id="cat-${category.id}" name="categories" value="${category.id}">
                <label for="cat-${category.id}">
                    <span class="category-icon-small">${category.icon}</span>
                    ${category.name}
                </label>
            </div>
        `).join('');

        if (borrowerCategories) {
            borrowerCategories.innerHTML = categoryCheckboxes;
        }

        if (lenderCategories) {
            lenderCategories.innerHTML = `
                <div class="checkbox-item">
                    <input type="checkbox" id="select-all-categories">
                    <label for="select-all-categories">
                        <strong>Select All Categories</strong>
                    </label>
                </div>
                ${categoryCheckboxes}
            `;
            
            // Add select all functionality
            const selectAllCheckbox = document.getElementById('select-all-categories');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => {
                    const checkboxes = lenderCategories.querySelectorAll('input[type="checkbox"]:not(#select-all-categories)');
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = e.target.checked;
                    });
                });
            }
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Online/offline status
        window.addEventListener('online', () => {
            this.state.isOnline = true;
            this.showNotification('You are back online', 'success');
        });

        window.addEventListener('offline', () => {
            this.state.isOnline = false;
            this.showNotification('You are offline. Some features may not work.', 'warning');
        });

        // PWA install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // App installed event
        window.addEventListener('appinstalled', () => {
            this.state.isInstalled = true;
            this.showNotification('Pesewa app installed successfully!', 'success');
            const installPrompt = document.getElementById('installPrompt');
            if (installPrompt) installPrompt.style.display = 'none';
        });

        // Form submissions
        const borrowerForm = document.getElementById('borrowerRegistration');
        const lenderForm = document.getElementById('lenderRegistration');

        if (borrowerForm) {
            borrowerForm.addEventListener('submit', this.handleBorrowerRegistration.bind(this));
        }

        if (lenderForm) {
            lenderForm.addEventListener('submit', this.handleLenderRegistration.bind(this));
        }

        // Country selector in footer
        const countrySelector = document.getElementById('countrySelector');
        if (countrySelector) {
            countrySelector.addEventListener('change', (e) => {
                this.showCountryContactInfo(e.target.value);
            });
        }
    },

    // Setup mobile menu
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.querySelector('.nav-menu');
        const navActions = document.querySelector('.nav-actions');

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
                mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
                
                if (navMenu) navMenu.style.display = isExpanded ? 'none' : 'flex';
                if (navActions) navActions.style.display = isExpanded ? 'none' : 'flex';
                
                // Animate hamburger icon
                const spans = mobileMenuBtn.querySelectorAll('span');
                if (isExpanded) {
                    spans[0].style.transform = 'rotate(0)';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'rotate(0)';
                } else {
                    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
                }
            });
        }

        // Close mobile menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                if (navMenu) navMenu.style.display = 'flex';
                if (navActions) navActions.style.display = 'flex';
                if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
            } else {
                if (navMenu) navMenu.style.display = 'none';
                if (navActions) navActions.style.display = 'none';
            }
        });
    },

    // Setup role selection
    setupRoleSelection() {
        const roleTabs = document.querySelectorAll('.role-tab');
        const registrationForms = document.querySelectorAll('.registration-form');

        roleTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const role = tab.getAttribute('data-role');
                
                // Update active tab
                roleTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding form
                registrationForms.forEach(form => {
                    form.classList.remove('active');
                    if (form.id === `${role}Form`) {
                        form.classList.add('active');
                    }
                });

                // Handle "both" role
                if (role === 'both') {
                    const borrowerForm = document.getElementById('borrowerForm');
                    const lenderForm = document.getElementById('lenderForm');
                    
                    if (borrowerForm && lenderForm) {
                        borrowerForm.classList.add('active');
                        lenderForm.classList.add('active');
                    }
                }
            });
        });
    },

    // Check authentication status
    checkAuthStatus() {
        // For now, check localStorage
        // In production, this will check Firebase auth
        const userData = localStorage.getItem('pesewa_user');
        if (userData) {
            try {
                this.state.currentUser = JSON.parse(userData);
                this.updateUIForAuth();
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('pesewa_user');
            }
        }
    },

    // Update UI for authenticated user
    updateUIForAuth() {
        const loginButtons = document.querySelectorAll('a[href="#register"]');
        const userAvatar = document.querySelector('.user-avatar');
        
        if (this.state.currentUser) {
            loginButtons.forEach(button => {
                button.textContent = 'Dashboard';
                button.href = this.getDashboardUrl();
            });
            
            if (userAvatar && this.state.currentUser.name) {
                const initials = this.state.currentUser.name
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);
                userAvatar.textContent = initials;
            }
        }
    },

    // Get dashboard URL based on user role
    getDashboardUrl() {
        if (!this.state.currentUser) return 'pages/dashboard/borrower-dashboard.html';
        
        const role = this.state.currentUser.role || 'borrower';
        return `pages/dashboard/${role}-dashboard.html`;
    },

    // Handle borrower registration
    async handleBorrowerRegistration(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate form
        if (!this.validateBorrowerForm(data)) {
            return;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Registering...';
        submitButton.disabled = true;
        
        try {
            // In production, this would send to backend API
            // For now, simulate API call
            await this.simulateApiCall();
            
            // Create user object
            const user = {
                id: 'user_' + Date.now(),
                name: data.borrowerFullName,
                phone: data.borrowerPhone,
                email: data.borrowerEmail || '',
                nationalId: data.borrowerNationalID,
                location: data.borrowerLocation,
                occupation: data.borrowerOccupation,
                country: data.borrowerCountry,
                nextOfKin: data.nextOfKin,
                guarantors: [data.guarantor1, data.guarantor2],
                categories: data.categories || [],
                role: 'borrower',
                createdAt: new Date().toISOString(),
                rating: 5,
                isBlacklisted: false
            };
            
            // Save to localStorage (simulated)
            localStorage.setItem('pesewa_user', JSON.stringify(user));
            this.state.currentUser = user;
            
            // Show success message
            this.showNotification('Borrower registration successful!', 'success');
            
            // Update UI
            this.updateUIForAuth();
            
            // Redirect to dashboard after delay
            setTimeout(() => {
                window.location.href = this.getDashboardUrl();
            }, 1500);
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    },

    // Handle lender registration
    async handleLenderRegistration(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate form
        if (!this.validateLenderForm(data)) {
            return;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Registering...';
        submitButton.disabled = true;
        
        try {
            // In production, this would send to backend API
            await this.simulateApiCall();
            
            // Create user object
            const user = {
                id: 'user_' + Date.now(),
                name: data.lenderName,
                nickname: data.lenderNickname || '',
                phone: data.lenderPhone,
                email: data.lenderEmail,
                country: data.lenderCountry,
                tier: data.lenderTier,
                categories: data.categories || [],
                role: 'lender',
                subscription: {
                    tier: data.lenderTier,
                    status: 'pending', // Requires payment
                    expiresAt: this.calculateSubscriptionExpiry()
                },
                createdAt: new Date().toISOString(),
                rating: 5,
                totalLent: 0,
                activeLoans: 0,
                totalBorrowers: 0
            };
            
            // Save to localStorage (simulated)
            localStorage.setItem('pesewa_user', JSON.stringify(user));
            this.state.currentUser = user;
            
            // Show success message with payment instruction
            this.showNotification('Lender registration successful! Redirecting to payment...', 'success');
            
            // Update UI
            this.updateUIForAuth();
            
            // Simulate payment redirect
            setTimeout(() => {
                // In production, this would redirect to payment gateway
                // For now, redirect to subscriptions page
                window.location.href = 'pages/subscriptions.html';
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    },

    // Validate borrower form
    validateBorrowerForm(data) {
        const errors = [];
        
        if (!data.borrowerFullName || data.borrowerFullName.trim().length < 3) {
            errors.push('Full name is required and must be at least 3 characters');
        }
        
        if (!data.borrowerPhone || !this.validatePhoneNumber(data.borrowerPhone)) {
            errors.push('Valid phone number is required');
        }
        
        if (!data.borrowerNationalID || data.borrowerNationalID.trim().length < 5) {
            errors.push('National ID is required');
        }
        
        if (!data.borrowerLocation || data.borrowerLocation.trim().length < 3) {
            errors.push('Location is required');
        }
        
        if (!data.borrowerOccupation || data.borrowerOccupation.trim().length < 2) {
            errors.push('Occupation is required');
        }
        
        if (!data.borrowerCountry) {
            errors.push('Country is required');
        }
        
        if (!data.nextOfKin || !this.validatePhoneNumber(data.nextOfKin)) {
            errors.push('Valid next of kin contact is required');
        }
        
        if (!data.guarantor1 || !this.validatePhoneNumber(data.guarantor1)) {
            errors.push('Valid guarantor 1 phone number is required');
        }
        
        if (!data.guarantor2 || !this.validatePhoneNumber(data.guarantor2)) {
            errors.push('Valid guarantor 2 phone number is required');
        }
        
        if (errors.length > 0) {
            this.showNotification(errors.join('<br>'), 'error');
            return false;
        }
        
        return true;
    },

    // Validate lender form
    validateLenderForm(data) {
        const errors = [];
        
        if (!data.lenderName || data.lenderName.trim().length < 3) {
            errors.push('Full name is required and must be at least 3 characters');
        }
        
        if (!data.lenderPhone || !this.validatePhoneNumber(data.lenderPhone)) {
            errors.push('Valid phone number is required');
        }
        
        if (!data.lenderEmail || !this.validateEmail(data.lenderEmail)) {
            errors.push('Valid email is required');
        }
        
        if (!data.lenderCountry) {
            errors.push('Country is required');
        }
        
        if (!data.lenderTier) {
            errors.push('Subscription tier is required');
        }
        
        if (!data.categories || data.categories.length === 0) {
            errors.push('Please select at least one loan category');
        }
        
        if (errors.length > 0) {
            this.showNotification(errors.join('<br>'), 'error');
            return false;
        }
        
        return true;
    },

    // Validate phone number
    validatePhoneNumber(phone) {
        // Simple validation - can be enhanced for specific countries
        const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
        return phoneRegex.test(phone);
    },

    // Validate email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Simulate API call
    simulateApiCall() {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000);
        });
    },

    // Calculate subscription expiry (28th of next month)
    calculateSubscriptionExpiry() {
        const now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth() + 1; // Next month
        
        if (month === 12) {
            month = 1;
            year += 1;
        }
        
        const expiryDate = new Date(year, month - 1, 28);
        return expiryDate.toISOString();
    },

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
            background: ${this.getNotificationColor(type)};
            color: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: fadeInUp 0.3s ease-out;
        `;
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        // Add to document
        document.body.appendChild(notification);
    },

    // Get notification icon based on type
    getNotificationIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    },

    // Get notification color based on type
    getNotificationColor(type) {
        const colors = {
            success: 'var(--mutual-green)',
            error: 'var(--gentle-alert)',
            warning: 'var(--friendly-highlight)',
            info: 'var(--primary-blue)'
        };
        return colors[type] || colors.info;
    },

    // Show PWA install prompt
    showInstallPrompt() {
        const installPrompt = document.getElementById('installPrompt');
        if (installPrompt) {
            installPrompt.style.display = 'block';
            
            const installNowBtn = document.getElementById('installNow');
            const installLaterBtn = document.getElementById('installLater');
            
            if (installNowBtn) {
                installNowBtn.addEventListener('click', async () => {
                    if (window.deferredPrompt) {
                        window.deferredPrompt.prompt();
                        const { outcome } = await window.deferredPrompt.userChoice;
                        console.log(`User response to install prompt: ${outcome}`);
                        window.deferredPrompt = null;
                    }
                    installPrompt.style.display = 'none';
                });
            }
            
            if (installLaterBtn) {
                installLaterBtn.addEventListener('click', () => {
                    installPrompt.style.display = 'none';
                });
            }
        }
    },

    // Show country contact info
    showCountryContactInfo(countryId) {
        const contactInfo = document.getElementById('contactInfo');
        if (!contactInfo) return;
        
        const country = this.state.countries.find(c => c.id === countryId);
        if (country) {
            contactInfo.innerHTML = `
                <h5>${country.name} ${country.flag}</h5>
                <p><strong>Email:</strong> ${country.id}@pesewa.com</p>
                <p><strong>Support Hours:</strong> 8:00 AM - 6:00 PM (Local Time)</p>
                <p><strong>Currency:</strong> ${country.currency}</p>
                <p>Use the contact form for specific inquiries</p>
            `;
        } else {
            contactInfo.innerHTML = `
                <p>Select a country to view contact information</p>
            `;
        }
    },

    // Format currency
    formatCurrency(amount, currency = '₵') {
        return `${currency}${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    },

    // Calculate loan details
    calculateLoanDetails(amount, days = 7) {
        const weeklyInterestRate = 0.15; // 15% weekly
        const dailyInterestRate = weeklyInterestRate / 7; // ~2.14% daily
        
        const interest = amount * weeklyInterestRate * (days / 7);
        const totalRepayment = amount + interest;
        const dailyPayment = totalRepayment / days;
        
        // Calculate penalty (5% daily after 7 days)
        let penalty = 0;
        if (days > 7) {
            const extraDays = days - 7;
            penalty = amount * 0.05 * extraDays;
        }
        
        return {
            amount,
            days,
            interest,
            totalRepayment,
            dailyPayment,
            penalty,
            weeklyInterestRate,
            dailyInterestRate
        };
    },

    // Get user's subscription status
    getUserSubscriptionStatus() {
        if (!this.state.currentUser || !this.state.currentUser.subscription) {
            return { status: 'none', message: 'No subscription' };
        }
        
        const subscription = this.state.currentUser.subscription;
        const now = new Date();
        const expiresAt = new Date(subscription.expiresAt);
        
        if (expiresAt < now) {
            return { 
                status: 'expired', 
                message: 'Subscription expired',
                expiresAt: subscription.expiresAt
            };
        }
        
        // Calculate days remaining
        const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
        
        return {
            status: 'active',
            message: `Subscription active - ${daysRemaining} days remaining`,
            expiresAt: subscription.expiresAt,
            daysRemaining
        };
    }
};

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PesewaApp.init());
} else {
    PesewaApp.init();
}

// Export for use in other modules
window.PesewaApp = PesewaApp;