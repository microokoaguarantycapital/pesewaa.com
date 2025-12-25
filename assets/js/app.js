'use strict';

// Pesewa.com - Main Application JavaScript

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// Initialize Application
function initApp() {
    console.log('Pesewa.com - Initializing application...');
    
    // Initialize components
    initNavigation();
    initRoleSelection();
    initForms();
    initModals();
    initMobileMenu();
    initScrollAnimations();
    initPWA();
    
    // Calculate initial loan values
    updateLoanCalculator();
    
    // Load demo data for categories
    loadCategories();
    
    // Set current year in footer
    setCurrentYear();
    
    // Check for PWA install prompt
    checkPWAInstallPrompt();
}

// Navigation Initialization
function initNavigation() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const closeLogin = document.getElementById('closeLogin');
    const loginModal = document.getElementById('loginModal');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = 'register';
            scrollToRegistration();
        });
    }
    
    if (closeLogin) {
        closeLogin.addEventListener('click', function() {
            loginModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close modal on outside click
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
}

// Role Selection
function initRoleSelection() {
    const roleTabs = document.querySelectorAll('.role-tab');
    const roleForms = document.querySelectorAll('.role-form');
    
    roleTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const role = this.getAttribute('data-role');
            
            // Update active tab
            roleTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding form
            roleForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${role}Form`) {
                    form.classList.add('active');
                }
            });
            
            // Scroll to form
            scrollToRegistration();
        });
    });
    
    // Initialize tier details
    const tierSelect = document.getElementById('lTier');
    const tierDetails = document.getElementById('tierDetails');
    
    if (tierSelect && tierDetails) {
        tierSelect.addEventListener('change', updateTierDetails);
        updateTierDetails(); // Initial update
    }
    
    // Select all categories checkbox
    const selectAllCheckbox = document.querySelector('input[name="lCategories"][value="all"]');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('input[name="lCategories"]:not([value="all"])');
            checkboxes.forEach(cb => {
                cb.checked = this.checked;
            });
        });
    }
}

// Update Tier Details Display
function updateTierDetails() {
    const tierSelect = document.getElementById('lTier');
    const tierDetails = document.getElementById('tierDetails');
    
    if (!tierSelect || !tierDetails) return;
    
    const tier = tierSelect.value;
    let details = '';
    
    switch(tier) {
        case 'basic':
            details = `
                <div class="tier-details-content">
                    <h4>Basic Tier Details</h4>
                    <ul>
                        <li>Maximum loan per week: ₵1,500</li>
                        <li>Monthly subscription: ₵50</li>
                        <li>Bi-annual subscription: ₵250</li>
                        <li>Annual subscription: ₵500</li>
                        <li>No CRB check required</li>
                        <li>Access to all 12 loan categories</li>
                    </ul>
                </div>
            `;
            break;
        case 'premium':
            details = `
                <div class="tier-details-content">
                    <h4>Premium Tier Details</h4>
                    <ul>
                        <li>Maximum loan per week: ₵5,000</li>
                        <li>Monthly subscription: ₵250</li>
                        <li>Bi-annual subscription: ₵1,500</li>
                        <li>Annual subscription: ₵2,500</li>
                        <li>No CRB check required</li>
                        <li>Priority borrower matching</li>
                        <li>Advanced ledger analytics</li>
                    </ul>
                </div>
            `;
            break;
        case 'super':
            details = `
                <div class="tier-details-content">
                    <h4>Super Tier Details</h4>
                    <ul>
                        <li>Maximum loan per week: ₵20,000</li>
                        <li>Monthly subscription: ₵1,000</li>
                        <li>Bi-annual subscription: ₵5,000</li>
                        <li>Annual subscription: ₵8,500</li>
                        <li>CRB check required for borrowers</li>
                        <li>Premium support</li>
                        <li>Cross-group lending insights</li>
                        <li>Debt collection assistance</li>
                    </ul>
                </div>
            `;
            break;
        default:
            details = '<p class="text-muted">Select a tier to see details</p>';
    }
    
    tierDetails.innerHTML = details;
}

// Forms Initialization
function initForms() {
    // Borrower registration form
    const borrowerForm = document.getElementById('borrowerRegistration');
    if (borrowerForm) {
        borrowerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBorrowerRegistration();
        });
    }
    
    // Lender registration form
    const lenderForm = document.getElementById('lenderRegistration');
    if (lenderForm) {
        lenderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLenderRegistration();
        });
    }
    
    // Initialize form validation
    initFormValidation();
    
    // Initialize loan calculator inputs
    initCalculatorInputs();
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form[novalidate]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                showToast('Please fill in all required fields correctly.', 'warning');
            }
        });
    });
    
    // Real-time validation for required fields
    const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

// Validate Form
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Validate Field
function validateField(field) {
    const value = field.value.trim();
    const parent = field.closest('.form-group');
    const feedback = parent.querySelector('.invalid-feedback') || createFeedbackElement(parent);
    
    // Clear previous states
    field.classList.remove('error', 'success');
    feedback.textContent = '';
    
    // Check required
    if (field.required && !value) {
        field.classList.add('error');
        feedback.textContent = 'This field is required';
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            field.classList.add('error');
            feedback.textContent = 'Please enter a valid email address';
            return false;
        }
    }
    
    // Phone validation (basic)
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
            field.classList.add('error');
            feedback.textContent = 'Please enter a valid phone number';
            return false;
        }
    }
    
    // If all validations pass
    if (value) {
        field.classList.add('success');
    }
    
    return true;
}

// Create Feedback Element
function createFeedbackElement(parent) {
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    parent.appendChild(feedback);
    return feedback;
}

// Handle Borrower Registration
function handleBorrowerRegistration() {
    const form = document.getElementById('borrowerRegistration');
    if (!validateForm(form)) return;
    
    const formData = new FormData(form);
    const data = {
        name: formData.get('bName'),
        nationalId: formData.get('bNationalId'),
        phone: formData.get('bPhone'),
        email: formData.get('bEmail'),
        country: formData.get('bCountry'),
        location: formData.get('bLocation'),
        occupation: formData.get('bOccupation'),
        nextOfKin: formData.get('bNextOfKin'),
        guarantor1: formData.get('bGuarantor1'),
        guarantor2: formData.get('bGuarantor2'),
        role: 'borrower',
        timestamp: new Date().toISOString()
    };
    
    // In a real app, this would be an API call
    console.log('Borrower registration data:', data);
    
    // Simulate API call
    simulateAPI('/api/borrowers/register', data)
        .then(response => {
            showToast('Borrower registration successful! Redirecting to dashboard...', 'success');
            
            // Redirect to borrower dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = 'pages/dashboard/borrower-dashboard.html';
            }, 2000);
        })
        .catch(error => {
            showToast('Registration failed. Please try again.', 'error');
            console.error('Registration error:', error);
        });
}

// Handle Lender Registration
function handleLenderRegistration() {
    const form = document.getElementById('lenderRegistration');
    if (!validateForm(form)) return;
    
    const formData = new FormData(form);
    const selectedCategories = Array.from(form.querySelectorAll('input[name="lCategories"]:checked:not([value="all"])'))
        .map(cb => cb.value);
    
    const data = {
        name: formData.get('lName'),
        nickname: formData.get('lNickname'),
        phone: formData.get('lPhone'),
        email: formData.get('lEmail'),
        tier: formData.get('lTier'),
        categories: selectedCategories,
        role: 'lender',
        timestamp: new Date().toISOString()
    };
    
    // In a real app, this would be an API call
    console.log('Lender registration data:', data);
    
    // Simulate API call
    simulateAPI('/api/lenders/register', data)
        .then(response => {
            showToast('Lender registration successful! Redirecting to payment...', 'success');
            
            // In a real app, redirect to payment gateway
            // For demo, redirect to lender dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = 'pages/dashboard/lender-dashboard.html';
            }, 2000);
        })
        .catch(error => {
            showToast('Registration failed. Please try again.', 'error');
            console.error('Registration error:', error);
        });
}

// Handle Login
function handleLogin() {
    const form = document.getElementById('loginForm');
    if (!validateForm(form)) return;
    
    const formData = new FormData(form);
    const data = {
        country: formData.get('loginCountry'),
        phone: formData.get('loginPhone'),
        password: formData.get('loginPassword')
    };
    
    // Simulate API call
    simulateAPI('/api/auth/login', data)
        .then(response => {
            showToast('Login successful! Redirecting...', 'success');
            
            // Close login modal
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Redirect based on user role (simulated)
            setTimeout(() => {
                // For demo, randomly redirect to borrower or lender dashboard
                const dashboards = [
                    'pages/dashboard/borrower-dashboard.html',
                    'pages/dashboard/lender-dashboard.html'
                ];
                const randomDashboard = dashboards[Math.floor(Math.random() * dashboards.length)];
                window.location.href = randomDashboard;
            }, 1000);
        })
        .catch(error => {
            showToast('Login failed. Please check your credentials.', 'error');
            console.error('Login error:', error);
        });
}

// Simulate API Call
function simulateAPI(endpoint, data) {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            // Simulate success 90% of the time
            if (Math.random() > 0.1) {
                resolve({
                    success: true,
                    message: 'Operation successful',
                    data: data
                });
            } else {
                reject({
                    success: false,
                    message: 'Server error. Please try again.'
                });
            }
        }, 1000);
    });
}

// Mobile Menu
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
}

// Loan Calculator
function initCalculatorInputs() {
    const loanAmount = document.getElementById('loanAmount');
    const loanDays = document.getElementById('loanDays');
    const loanTier = document.getElementById('loanTier');
    
    if (loanAmount) {
        loanAmount.addEventListener('input', updateLoanCalculator);
    }
    
    if (loanDays) {
        loanDays.addEventListener('input', updateLoanCalculator);
    }
    
    if (loanTier) {
        loanTier.addEventListener('change', updateLoanCalculator);
    }
}

// Update Loan Calculator
function updateLoanCalculator() {
    const amountInput = document.getElementById('loanAmount');
    const daysInput = document.getElementById('loanDays');
    const tierSelect = document.getElementById('loanTier');
    
    if (!amountInput || !daysInput) return;
    
    const amount = parseInt(amountInput.value) || 0;
    const days = parseInt(daysInput.value) || 7;
    const tier = tierSelect ? tierSelect.value : 'super';
    
    // Update display values
    const amountValue = document.getElementById('amountValue');
    const daysValue = document.getElementById('daysValue');
    
    if (amountValue) {
        amountValue.textContent = `₵${amount.toLocaleString()}`;
    }
    
    if (daysValue) {
        daysValue.textContent = `${days} day${days !== 1 ? 's' : ''}`;
    }
    
    // Calculate interest (15% weekly = 2.142857% daily)
    const dailyInterestRate = 15 / 7; // 2.142857% per day
    const totalInterest = (amount * dailyInterestRate * days) / 100;
    const totalRepayment = amount + totalInterest;
    const dailyPayment = totalRepayment / days;
    
    // Update result displays
    const totalRepaymentEl = document.getElementById('totalRepayment');
    const interestAmountEl = document.getElementById('interestAmount');
    const dailyPaymentEl = document.getElementById('dailyPayment');
    
    if (totalRepaymentEl) {
        totalRepaymentEl.textContent = `₵${totalRepayment.toFixed(2)}`;
    }
    
    if (interestAmountEl) {
        interestAmountEl.textContent = `₵${totalInterest.toFixed(2)}`;
    }
    
    if (dailyPaymentEl) {
        dailyPaymentEl.textContent = `₵${dailyPayment.toFixed(2)}`;
    }
    
    // Update tier limits
    updateTierLimits(tier, amountInput);
}

// Update Tier Limits
function updateTierLimits(tier, amountInput) {
    let maxAmount = 20000; // Super tier default
    
    switch(tier) {
        case 'basic':
            maxAmount = 1500;
            break;
        case 'premium':
            maxAmount = 5000;
            break;
        case 'super':
            maxAmount = 20000;
            break;
    }
    
    // Update slider max
    if (amountInput) {
        amountInput.max = maxAmount;
        
        // Adjust current value if it exceeds new max
        if (parseInt(amountInput.value) > maxAmount) {
            amountInput.value = maxAmount;
        }
        
        // Update display
        const rangeDisplay = amountInput.closest('.form-group').querySelector('.range-display small');
        if (rangeDisplay) {
            rangeDisplay.textContent = `Max: ₵${maxAmount.toLocaleString()} (${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier)`;
        }
    }
}

// Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for browsers without IntersectionObserver
        animatedElements.forEach(el => el.classList.add('animated'));
    }
}

// PWA Initialization
function initPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
    
    // Handle PWA install prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Show custom install prompt
        showPWAInstallPrompt();
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('PWA installed successfully');
        // Hide the custom install prompt
        hidePWAInstallPrompt();
        // Clear the deferredPrompt so it can be garbage collected
        deferredPrompt = null;
    });
}

// Show PWA Install Prompt
function showPWAInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    if (installPrompt) {
        installPrompt.classList.remove('hidden');
        
        const installConfirm = document.getElementById('installConfirm');
        const installCancel = document.getElementById('installCancel');
        
        if (installConfirm) {
            installConfirm.addEventListener('click', async () => {
                // Hide the custom prompt
                hidePWAInstallPrompt();
                
                // Show the native install prompt
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response to the install prompt: ${outcome}`);
                    deferredPrompt = null;
                }
            });
        }
        
        if (installCancel) {
            installCancel.addEventListener('click', () => {
                hidePWAInstallPrompt();
                // User declined install, maybe remind them later
                localStorage.setItem('pwaInstallDismissed', Date.now());
            });
        }
    }
}

// Hide PWA Install Prompt
function hidePWAInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    if (installPrompt) {
        installPrompt.classList.add('hidden');
    }
}

// Check PWA Install Prompt
function checkPWAInstallPrompt() {
    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        return;
    }
    
    // Check if user recently dismissed
    const dismissed = localStorage.getItem('pwaInstallDismissed');
    if (dismissed) {
        const daysSinceDismiss = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismiss < 7) { // Remind after 7 days
            return;
        }
    }
}

// Load Categories
function loadCategories() {
    // In a real app, this would fetch from an API
    const categories = [
        { id: 'fare', name: 'PesewaFare', icon: '🚌', description: 'Transport fare for your journey' },
        { id: 'data', name: 'PesewaData', icon: '📱', description: 'Internet, WiFi, and airtime' },
        { id: 'gas', name: 'PesewaCookingGas', icon: '🔥', description: 'Cooking gas for your home' },
        { id: 'food', name: 'PesewaFood', icon: '🍲', description: 'Food when paycheck is delayed' },
        { id: 'repairs', name: 'Pesewacredo', icon: '🔧', description: 'Urgent repairs and tools' },
        { id: 'water', name: 'PesewaWaterBill', icon: '💧', description: 'Water bills and needs' },
        { id: 'fuel', name: 'PesewaBikeCarTuktukFuel', icon: '⛽', description: 'Fuel for your vehicle' },
        { id: 'vehicle-repair', name: 'PesewaBikeCarTuktukRepair', icon: '🛠️', description: 'Minor vehicle repairs' },
        { id: 'medicine', name: 'PesewaMedicine', icon: '💊', description: 'Urgent medical needs' },
        { id: 'electricity', name: 'PesewaElectricityTokens', icon: '💡', description: 'Electricity tokens' },
        { id: 'school', name: 'Pesewaschoolfees', icon: '🎓', description: 'School fees' },
        { id: 'tv', name: 'PesewaTVSubscription', icon: '📺', description: 'TV subscription' }
    ];
    
    // Could be used to dynamically populate categories
    console.log('Loaded categories:', categories);
}

// Set Current Year in Footer
function setCurrentYear() {
    const yearElement = document.querySelector('.current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Scroll to Registration Section
function scrollToRegistration() {
    const registrationSection = document.getElementById('register');
    if (registrationSection) {
        registrationSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Show Toast Notification
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

// Initialize Modals
function initModals() {
    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.active');
            if (openModal) {
                openModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

// Utility Functions
function formatCurrency(amount, currency = '₵') {
    return `${currency}${parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for use in other modules (if needed)
window.PesewaApp = {
    initApp,
    showToast,
    formatCurrency,
    formatDate,
    debounce
};