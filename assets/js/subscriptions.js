'use strict';

// Pesewa.com - Subscription Management Module

// Subscription state
const SubscriptionState = {
    activeSubscription: null,
    subscriptionHistory: [],
    upcomingPayments: [],
    subscriptionPlans: {
        borrower: {
            basic: {
                name: 'Basic Borrower',
                price: 50,
                period: 'monthly',
                features: [
                    'Weekly loan limit: ₵1,500',
                    'Access to all 12 loan categories',
                    'Basic borrower support',
                    'No CRB check required'
                ],
                maxLoans: 3,
                interestRate: 15
            },
            premium: {
                name: 'Premium Borrower',
                price: 250,
                period: 'monthly',
                features: [
                    'Weekly loan limit: ₵5,000',
                    'Priority lender matching',
                    'Advanced loan analytics',
                    'Extended repayment periods',
                    'No CRB check required'
                ],
                maxLoans: 5,
                interestRate: 14
            }
        },
        lender: {
            basic: {
                name: 'Basic Lender',
                price: 50,
                period: 'monthly',
                features: [
                    'Weekly lending limit: ₵1,500',
                    'Access to all borrower categories',
                    'Basic lender dashboard',
                    'No CRB check for borrowers'
                ],
                commissionRate: 5,
                maxActiveLoans: 10
            },
            premium: {
                name: 'Premium Lender',
                price: 250,
                period: 'monthly',
                features: [
                    'Weekly lending limit: ₵5,000',
                    'Priority borrower access',
                    'Advanced risk analytics',
                    'Dedicated support',
                    'Reduced commission (3%)'
                ],
                commissionRate: 3,
                maxActiveLoans: 25
            },
            super: {
                name: 'Super Lender',
                price: 1000,
                period: 'monthly',
                features: [
                    'Weekly lending limit: ₵20,000',
                    'CRB check for borrowers',
                    'Premium support 24/7',
                    'Cross-group lending insights',
                    'Debt collection assistance',
                    'No commission on loans'
                ],
                commissionRate: 0,
                maxActiveLoans: 50
            }
        }
    },
    paymentMethods: []
};

// Subscription status
const SubscriptionStatus = {
    ACTIVE: 'active',
    PENDING: 'pending',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    SUSPENDED: 'suspended'
};

// Payment status
const PaymentStatus = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

// Initialize subscription module
function initSubscriptions() {
    console.log('Subscriptions: Initializing subscription management module...');
    
    // Load subscription state
    loadSubscriptionState();
    
    // Initialize subscription UI
    initSubscriptionUI();
    
    // Initialize subscription event listeners
    initSubscriptionEvents();
    
    // Load active subscription
    loadActiveSubscription();
    
    // Load subscription history
    loadSubscriptionHistory();
    
    // Update subscription stats
    updateSubscriptionStats();
}

// Load subscription state from localStorage
function loadSubscriptionState() {
    try {
        const savedState = localStorage.getItem('pesewa_subscriptions');
        if (savedState) {
            const state = JSON.parse(savedState);
            Object.assign(SubscriptionState, state);
            console.log('Subscriptions: Loaded subscription state from localStorage');
        } else {
            // Initialize with default state
            initializeDefaultSubscriptionState();
        }
    } catch (error) {
        console.error('Subscriptions: Error loading subscription state:', error);
        initializeDefaultSubscriptionState();
    }
}

// Initialize default subscription state
function initializeDefaultSubscriptionState() {
    SubscriptionState.activeSubscription = null;
    SubscriptionState.subscriptionHistory = [];
    SubscriptionState.upcomingPayments = [];
    SubscriptionState.paymentMethods = [];
}

// Save subscription state to localStorage
function saveSubscriptionState() {
    try {
        localStorage.setItem('pesewa_subscriptions', JSON.stringify(SubscriptionState));
        console.log('Subscriptions: Saved subscription state');
    } catch (error) {
        console.error('Subscriptions: Error saving subscription state:', error);
    }
}

// Initialize subscription UI
function initSubscriptionUI() {
    // Initialize subscription tabs
    initSubscriptionTabs();
    
    // Initialize plan selection
    initPlanSelection();
    
    // Initialize payment method modal
    initPaymentMethodModal();
    
    // Initialize upgrade modal
    initUpgradeModal();
    
    // Initialize auto-renewal toggle
    initAutoRenewalToggle();
    
    // Initialize invoice download
    initInvoiceDownload();
}

// Initialize subscription tabs
function initSubscriptionTabs() {
    const subscriptionTabs = document.querySelectorAll('.subscription-tab');
    
    subscriptionTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab
            subscriptionTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            showSubscriptionTab(targetTab);
        });
    });
    
    // Set initial active tab
    const initialTab = document.querySelector('.subscription-tab.active');
    if (initialTab) {
        const initialTabId = initialTab.getAttribute('data-tab');
        showSubscriptionTab(initialTabId);
    }
}

// Show subscription tab content
function showSubscriptionTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.subscription-tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected tab content
    const targetContent = document.getElementById(`${tabId}Tab`);
    if (targetContent) {
        targetContent.style.display = 'block';
        
        // Load content based on tab
        switch(tabId) {
            case 'my-plan':
                loadMyPlanDetails();
                break;
            case 'plans':
                loadAvailablePlans();
                break;
            case 'history':
                loadSubscriptionHistoryList();
                break;
            case 'payment-methods':
                loadPaymentMethodsList();
                break;
            case 'invoices':
                loadInvoicesList();
                break;
        }
    }
}

// Initialize plan selection
function initPlanSelection() {
    const planCards = document.querySelectorAll('.plan-card');
    
    planCards.forEach(card => {
        card.addEventListener('click', function() {
            const planType = this.getAttribute('data-plan-type');
            const planTier = this.getAttribute('data-plan-tier');
            
            // Update active plan
            planCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            // Update plan details
            updatePlanDetails(planType, planTier);
        });
    });
}

// Initialize payment method modal
function initPaymentMethodModal() {
    const addPaymentMethodBtn = document.getElementById('addPaymentMethodBtn');
    const paymentMethodModal = document.getElementById('paymentMethodModal');
    const closePaymentMethod = document.getElementById('closePaymentMethod');
    
    if (addPaymentMethodBtn && paymentMethodModal) {
        addPaymentMethodBtn.addEventListener('click', function() {
            paymentMethodModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closePaymentMethod) {
        closePaymentMethod.addEventListener('click', function() {
            paymentMethodModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close modal on outside click
    if (paymentMethodModal) {
        paymentMethodModal.addEventListener('click', function(e) {
            if (e.target === paymentMethodModal) {
                paymentMethodModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Payment method form submission
    const paymentMethodForm = document.getElementById('paymentMethodForm');
    if (paymentMethodForm) {
        paymentMethodForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddPaymentMethod();
        });
    }
}

// Initialize upgrade modal
function initUpgradeModal() {
    const upgradeModal = document.getElementById('upgradeModal');
    const closeUpgrade = document.getElementById('closeUpgrade');
    
    if (closeUpgrade) {
        closeUpgrade.addEventListener('click', function() {
            upgradeModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close modal on outside click
    if (upgradeModal) {
        upgradeModal.addEventListener('click', function(e) {
            if (e.target === upgradeModal) {
                upgradeModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Upgrade form submission
    const upgradeForm = document.getElementById('upgradeForm');
    if (upgradeForm) {
        upgradeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleUpgrade();
        });
    }
}

// Initialize auto-renewal toggle
function initAutoRenewalToggle() {
    const autoRenewToggle = document.getElementById('autoRenewToggle');
    if (autoRenewToggle) {
        autoRenewToggle.addEventListener('change', function() {
            toggleAutoRenewal(this.checked);
        });
    }
}

// Initialize invoice download
function initInvoiceDownload() {
    // Event delegation for invoice download buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.download-invoice-btn')) {
            const button = e.target.closest('.download-invoice-btn');
            const invoiceId = button.getAttribute('data-invoice-id');
            downloadInvoice(invoiceId);
        }
    });
}

// Initialize subscription event listeners
function initSubscriptionEvents() {
    // Subscribe buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.subscribe-btn')) {
            const button = e.target.closest('.subscribe-btn');
            const planType = button.getAttribute('data-plan-type');
            const planTier = button.getAttribute('data-plan-tier');
            openSubscribeModal(planType, planTier);
        }
        
        // Upgrade buttons
        if (e.target.closest('.upgrade-btn')) {
            const button = e.target.closest('.upgrade-btn');
            const newTier = button.getAttribute('data-plan-tier');
            openUpgradeModal(newTier);
        }
        
        // Cancel subscription buttons
        if (e.target.closest('.cancel-subscription-btn')) {
            const button = e.target.closest('.cancel-subscription-btn');
            const subscriptionId = button.getAttribute('data-subscription-id');
            cancelSubscription(subscriptionId);
        }
        
        // Set default payment method buttons
        if (e.target.closest('.set-default-payment-btn')) {
            const button = e.target.closest('.set-default-payment-btn');
            const methodId = button.getAttribute('data-method-id');
            setDefaultPaymentMethod(methodId);
        }
        
        // Remove payment method buttons
        if (e.target.closest('.remove-payment-btn')) {
            const button = e.target.closest('.remove-payment-btn');
            const methodId = button.getAttribute('data-method-id');
            removePaymentMethod(methodId);
        }
    });
}

// Load active subscription
function loadActiveSubscription() {
    // In a real app, this would fetch from API
    const demoActiveSubscription = {
        id: 'sub_001',
        userId: 'user_001',
        planType: 'lender',
        planTier: 'premium',
        planName: 'Premium Lender',
        price: 250,
        period: 'monthly',
        status: SubscriptionStatus.ACTIVE,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        autoRenew: true,
        paymentMethod: 'mobile_money_1',
        nextPaymentDate: '2024-01-31',
        nextPaymentAmount: 250,
        features: [
            'Weekly lending limit: ₵5,000',
            'Priority borrower access',
            'Advanced risk analytics',
            'Dedicated support',
            'Reduced commission (3%)'
        ],
        limits: {
            weeklyLending: 5000,
            maxActiveLoans: 25,
            commissionRate: 3
        }
    };
    
    SubscriptionState.activeSubscription = demoActiveSubscription;
    console.log('Subscriptions: Loaded active subscription');
}

// Load my plan details
function loadMyPlanDetails() {
    const container = document.getElementById('myPlanDetails');
    if (!container) return;
    
    const subscription = SubscriptionState.activeSubscription;
    
    if (!subscription) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No Active Subscription</h3>
                <p>You don't have an active subscription. Choose a plan to get started.</p>
                <button class="btn btn-primary" onclick="showSubscriptionTab('plans')">
                    View Plans
                </button>
            </div>
        `;
        return;
    }
    
    const daysRemaining = calculateDaysRemaining(subscription.endDate);
    const progressPercentage = calculateSubscriptionProgress(subscription.startDate, subscription.endDate);
    
    container.innerHTML = `
        <div class="plan-details-card ${subscription.planTier}">
            <div class="plan-header">
                <div class="plan-tier-badge ${subscription.planTier}">
                    ${subscription.planTier.toUpperCase()}
                </div>
                <div class="plan-status-badge ${subscription.status}">
                    ${subscription.status.toUpperCase()}
                </div>
            </div>
            
            <div class="plan-body">
                <h2 class="plan-name">${subscription.planName}</h2>
                <div class="plan-price">
                    <span class="price-amount">₵${subscription.price}</span>
                    <span class="price-period">/${subscription.period}</span>
                </div>
                
                <div class="plan-progress">
                    <div class="progress-header">
                        <span>Subscription Progress</span>
                        <span>${daysRemaining} days remaining</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="progress-dates">
                        <span>Started: ${formatDate(subscription.startDate)}</span>
                        <span>Renews: ${formatDate(subscription.endDate)}</span>
                    </div>
                </div>
                
                <div class="plan-limits">
                    <h4>Plan Limits</h4>
                    <div class="limits-grid">
                        ${Object.entries(subscription.limits).map(([key, value]) => `
                            <div class="limit-item">
                                <span class="limit-label">${formatLimitLabel(key)}:</span>
                                <span class="limit-value">${formatLimitValue(key, value)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="plan-features">
                    <h4>Plan Features</h4>
                    <ul class="features-list">
                        ${subscription.features.map(feature => `
                            <li>${feature}</li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="plan-actions">
                    <div class="action-row">
                        <span>Auto-renewal:</span>
                        <div class="toggle-switch">
                            <input type="checkbox" id="autoRenewToggle" 
                                   ${subscription.autoRenew ? 'checked' : ''}>
                            <label for="autoRenewToggle"></label>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn btn-outline-secondary" onclick="viewSubscriptionDetails()">
                            View Details
                        </button>
                        ${subscription.planTier !== 'super' ? `
                            <button class="btn btn-primary upgrade-btn" data-plan-tier="${getNextTier(subscription.planTier)}">
                                Upgrade Plan
                            </button>
                        ` : ''}
                        <button class="btn btn-danger cancel-subscription-btn" 
                                data-subscription-id="${subscription.id}">
                            Cancel Subscription
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="upcoming-payment">
            <h3>Upcoming Payment</h3>
            <div class="payment-card">
                <div class="payment-info">
                    <div class="payment-amount">₵${subscription.nextPaymentAmount}</div>
                    <div class="payment-date">Due on ${formatDate(subscription.nextPaymentDate)}</div>
                    <div class="payment-method">Payment method: Mobile Money</div>
                </div>
                <div class="payment-actions">
                    <button class="btn btn-success" onclick="payNow('${subscription.id}')">
                        Pay Now
                    </button>
                    <button class="btn btn-outline-secondary" onclick="changePaymentMethod()">
                        Change Method
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Re-initialize auto-renewal toggle
    const autoRenewToggle = document.getElementById('autoRenewToggle');
    if (autoRenewToggle) {
        autoRenewToggle.addEventListener('change', function() {
            toggleAutoRenewal(this.checked);
        });
    }
}

// Load available plans
function loadAvailablePlans() {
    const container = document.getElementById('availablePlans');
    if (!container) return;
    
    // Get user role
    const userRole = window.PesewaAuth ? window.PesewaAuth.getCurrentUserRole() : 'borrower';
    const plans = SubscriptionState.subscriptionPlans[userRole] || SubscriptionState.subscriptionPlans.borrower;
    
    // Get current plan tier if any
    const currentSubscription = SubscriptionState.activeSubscription;
    const currentTier = currentSubscription ? currentSubscription.planTier : null;
    
    let plansHTML = '<div class="plans-grid">';
    
    Object.entries(plans).forEach(([tier, plan]) => {
        const isCurrentPlan = currentTier === tier;
        
        plansHTML += `
            <div class="plan-card ${tier} ${isCurrentPlan ? 'current' : ''}" 
                 data-plan-type="${userRole}" data-plan-tier="${tier}">
                <div class="plan-header">
                    <div class="plan-tier">${tier.toUpperCase()}</div>
                    ${isCurrentPlan ? '<div class="current-badge">CURRENT PLAN</div>' : ''}
                </div>
                
                <div class="plan-body">
                    <h3 class="plan-name">${plan.name}</h3>
                    <div class="plan-price">
                        <span class="price-amount">₵${plan.price}</span>
                        <span class="price-period">/${plan.period}</span>
                    </div>
                    
                    <ul class="plan-features">
                        ${plan.features.map(feature => `
                            <li>${feature}</li>
                        `).join('')}
                    </ul>
                    
                    ${userRole === 'borrower' ? `
                        <div class="plan-limits">
                            <div class="limit">
                                <span class="limit-label">Max Loans:</span>
                                <span class="limit-value">${plan.maxLoans}</span>
                            </div>
                            <div class="limit">
                                <span class="limit-label">Interest Rate:</span>
                                <span class="limit-value">${plan.interestRate}%</span>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${userRole === 'lender' ? `
                        <div class="plan-limits">
                            <div class="limit">
                                <span class="limit-label">Commission:</span>
                                <span class="limit-value">${plan.commissionRate}%</span>
                            </div>
                            <div class="limit">
                                <span class="limit-label">Max Active Loans:</span>
                                <span class="limit-value">${plan.maxActiveLoans}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="plan-footer">
                    ${isCurrentPlan ? `
                        <button class="btn btn-success" disabled>
                            Current Plan
                        </button>
                    ` : `
                        <button class="btn btn-primary subscribe-btn" 
                                data-plan-type="${userRole}" 
                                data-plan-tier="${tier}">
                            ${currentSubscription ? 'Switch to This Plan' : 'Subscribe Now'}
                        </button>
                    `}
                </div>
            </div>
        `;
    });
    
    plansHTML += '</div>';
    container.innerHTML = plansHTML;
    
    // Re-initialize plan selection
    initPlanSelection();
}

// Load subscription history
function loadSubscriptionHistory() {
    // In a real app, this would fetch from API
    const demoHistory = [
        {
            id: 'sub_001',
            planName: 'Premium Lender',
            amount: 250,
            period: 'monthly',
            status: SubscriptionStatus.ACTIVE,
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            paymentStatus: PaymentStatus.COMPLETED
        },
        {
            id: 'sub_002',
            planName: 'Basic Lender',
            amount: 50,
            period: 'monthly',
            status: SubscriptionStatus.CANCELLED,
            startDate: '2023-12-01',
            endDate: '2023-12-31',
            paymentStatus: PaymentStatus.COMPLETED
        },
        {
            id: 'sub_003',
            planName: 'Basic Borrower',
            amount: 50,
            period: 'monthly',
            status: SubscriptionStatus.EXPIRED,
            startDate: '2023-11-01',
            endDate: '2023-11-30',
            paymentStatus: PaymentStatus.COMPLETED
        }
    ];
    
    SubscriptionState.subscriptionHistory = demoHistory;
    console.log('Subscriptions: Loaded subscription history:', SubscriptionState.subscriptionHistory.length);
}

// Load subscription history list
function loadSubscriptionHistoryList() {
    const container = document.getElementById('subscriptionHistoryList');
    if (!container) return;
    
    if (SubscriptionState.subscriptionHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No Subscription History</h3>
                <p>You don't have any subscription history yet.</p>
            </div>
        `;
        return;
    }
    
    let historyHTML = '<div class="history-table-container"><table class="history-table"><thead><tr>';
    historyHTML += '<th>Plan</th><th>Amount</th><th>Period</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead><tbody>';
    
    SubscriptionState.subscriptionHistory.forEach(subscription => {
        historyHTML += `
            <tr class="${subscription.status}">
                <td>${subscription.planName}</td>
                <td>₵${subscription.amount}</td>
                <td>${subscription.period}</td>
                <td>${formatDate(subscription.startDate)}</td>
                <td>${formatDate(subscription.endDate)}</td>
                <td>
                    <span class="status-badge ${subscription.status}">
                        ${subscription.status}
                    </span>
                </td>
                <td>
                    <span class="payment-status ${subscription.paymentStatus}">
                        ${subscription.paymentStatus}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary" onclick="viewSubscriptionInvoice('${subscription.id}')">
                        Invoice
                    </button>
                </td>
            </tr>
        `;
    });
    
    historyHTML += '</tbody></table></div>';
    container.innerHTML = historyHTML;
}

// Load payment methods
function loadPaymentMethods() {
    // In a real app, this would fetch from API
    const demoPaymentMethods = [
        {
            id: 'pm_001',
            type: 'mobile_money',
            provider: 'MTN',
            number: '055****567',
            isDefault: true,
            addedAt: '2024-01-01'
        },
        {
            id: 'pm_002',
            type: 'bank',
            provider: 'GCB Bank',
            number: '****1234',
            isDefault: false,
            addedAt: '2024-01-05'
        },
        {
            id: 'pm_003',
            type: 'card',
            provider: 'Visa',
            number: '****4321',
            isDefault: false,
            addedAt: '2024-01-10'
        }
    ];
    
    SubscriptionState.paymentMethods = demoPaymentMethods;
    console.log('Subscriptions: Loaded payment methods:', SubscriptionState.paymentMethods.length);
}

// Load payment methods list
function loadPaymentMethodsList() {
    const container = document.getElementById('paymentMethodsList');
    if (!container) return;
    
    loadPaymentMethods();
    
    if (SubscriptionState.paymentMethods.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💳</div>
                <h3>No Payment Methods</h3>
                <p>You haven't added any payment methods yet.</p>
                <button class="btn btn-primary" onclick="document.getElementById('addPaymentMethodBtn').click()">
                    Add Payment Method
                </button>
            </div>
        `;
        return;
    }
    
    let methodsHTML = '<div class="payment-methods-grid">';
    
    SubscriptionState.paymentMethods.forEach(method => {
        const icon = getPaymentMethodIcon(method.type);
        const formattedNumber = method.number;
        
        methodsHTML += `
            <div class="payment-method-card ${method.isDefault ? 'default' : ''}">
                <div class="method-header">
                    <div class="method-icon">${icon}</div>
                    <div class="method-provider">${method.provider}</div>
                    ${method.isDefault ? '<div class="default-badge">DEFAULT</div>' : ''}
                </div>
                
                <div class="method-body">
                    <div class="method-number">${formattedNumber}</div>
                    <div class="method-type">${formatPaymentMethodType(method.type)}</div>
                    <div class="method-added">Added ${formatDate(method.addedAt)}</div>
                </div>
                
                <div class="method-footer">
                    ${!method.isDefault ? `
                        <button class="btn btn-sm btn-outline-primary set-default-payment-btn" 
                                data-method-id="${method.id}">
                            Set as Default
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-danger remove-payment-btn" 
                            data-method-id="${method.id}">
                        Remove
                    </button>
                </div>
            </div>
        `;
    });
    
    methodsHTML += '</div>';
    container.innerHTML = methodsHTML;
}

// Load invoices list
function loadInvoicesList() {
    const container = document.getElementById('invoicesList');
    if (!container) return;
    
    // In a real app, this would fetch from API
    const demoInvoices = [
        {
            id: 'inv_001',
            subscriptionId: 'sub_001',
            amount: 250,
            date: '2024-01-01',
            dueDate: '2024-01-01',
            status: 'paid',
            planName: 'Premium Lender',
            period: 'January 2024',
            downloadUrl: '#'
        },
        {
            id: 'inv_002',
            subscriptionId: 'sub_002',
            amount: 50,
            date: '2023-12-01',
            dueDate: '2023-12-01',
            status: 'paid',
            planName: 'Basic Lender',
            period: 'December 2023',
            downloadUrl: '#'
        },
        {
            id: 'inv_003',
            subscriptionId: 'sub_003',
            amount: 50,
            date: '2023-11-01',
            dueDate: '2023-11-01',
            status: 'paid',
            planName: 'Basic Borrower',
            period: 'November 2023',
            downloadUrl: '#'
        }
    ];
    
    if (demoInvoices.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🧾</div>
                <h3>No Invoices</h3>
                <p>You don't have any invoices yet.</p>
            </div>
        `;
        return;
    }
    
    let invoicesHTML = '<div class="invoices-table-container"><table class="invoices-table"><thead><tr>';
    invoicesHTML += '<th>Invoice #</th><th>Plan</th><th>Period</th><th>Amount</th><th>Date</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    demoInvoices.forEach(invoice => {
        invoicesHTML += `
            <tr class="${invoice.status}">
                <td>${invoice.id}</td>
                <td>${invoice.planName}</td>
                <td>${invoice.period}</td>
                <td>₵${invoice.amount}</td>
                <td>${formatDate(invoice.date)}</td>
                <td>${formatDate(invoice.dueDate)}</td>
                <td>
                    <span class="status-badge ${invoice.status}">
                        ${invoice.status.toUpperCase()}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary download-invoice-btn" 
                            data-invoice-id="${invoice.id}">
                        Download
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="viewInvoice('${invoice.id}')">
                        View
                    </button>
                </td>
            </tr>
        `;
    });
    
    invoicesHTML += '</tbody></table></div>';
    container.innerHTML = invoicesHTML;
}

// Update subscription stats
function updateSubscriptionStats() {
    const stats = {
        totalSpent: SubscriptionState.subscriptionHistory.reduce((sum, sub) => sum + sub.amount, 0),
        activeSince: SubscriptionState.activeSubscription ? 
            formatDate(SubscriptionState.activeSubscription.startDate) : 'N/A',
        nextPayment: SubscriptionState.activeSubscription ? 
            SubscriptionState.activeSubscription.nextPaymentAmount : 0,
        paymentMethods: SubscriptionState.paymentMethods.length
    };
    
    // Update UI
    updateStatCard('totalSpent', stats.totalSpent, '₵');
    updateStatCard('activeSince', stats.activeSince);
    updateStatCard('nextPayment', stats.nextPayment, '₵');
    updateStatCard('paymentMethods', stats.paymentMethods);
}

// Update stat card
function updateStatCard(elementId, value, prefix = '') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = `${prefix}${typeof value === 'number' ? value.toLocaleString() : value}`;
    }
}

// Update plan details
function updatePlanDetails(planType, planTier) {
    const plan = SubscriptionState.subscriptionPlans[planType][planTier];
    const detailsContainer = document.getElementById('planDetails');
    
    if (!detailsContainer || !plan) return;
    
    detailsContainer.innerHTML = `
        <div class="plan-details">
            <h3>${plan.name} Details</h3>
            <div class="price-display">
                <span class="price">₵${plan.price}</span>
                <span class="period">per ${plan.period}</span>
            </div>
            
            <div class="features-list">
                <h4>Features:</h4>
                <ul>
                    ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            
            ${planType === 'borrower' ? `
                <div class="plan-limits">
                    <h4>Limits:</h4>
                    <div class="limits">
                        <div class="limit">
                            <span>Maximum Loans:</span>
                            <strong>${plan.maxLoans}</strong>
                        </div>
                        <div class="limit">
                            <span>Interest Rate:</span>
                            <strong>${plan.interestRate}%</strong>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            ${planType === 'lender' ? `
                <div class="plan-limits">
                    <h4>Limits:</h4>
                    <div class="limits">
                        <div class="limit">
                            <span>Commission Rate:</span>
                            <strong>${plan.commissionRate}%</strong>
                        </div>
                        <div class="limit">
                            <span>Maximum Active Loans:</span>
                            <strong>${plan.maxActiveLoans}</strong>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="plan-actions">
                <button class="btn btn-primary btn-block subscribe-btn" 
                        data-plan-type="${planType}" 
                        data-plan-tier="${planTier}">
                    Subscribe Now
                </button>
            </div>
        </div>
    `;
}

// Open subscribe modal
function openSubscribeModal(planType, planTier) {
    const plan = SubscriptionState.subscriptionPlans[planType][planTier];
    if (!plan) {
        showToast('Plan not found', 'error');
        return;
    }
    
    const currentSubscription = SubscriptionState.activeSubscription;
    const isUpgrade = currentSubscription && planTier !== currentSubscription.planTier;
    const isDowngrade = currentSubscription && getTierLevel(planTier) < getTierLevel(currentSubscription.planTier);
    
    const modalContent = `
        <div class="subscribe-modal">
            <h3>${isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Subscribe'} to ${plan.name}</h3>
            
            <div class="plan-summary">
                <div class="summary-item">
                    <span class="summary-label">Plan:</span>
                    <span class="summary-value">${plan.name}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Price:</span>
                    <span class="summary-value">₵${plan.price} per ${plan.period}</span>
                </div>
                ${currentSubscription ? `
                    <div class="summary-item">
                        <span class="summary-label">Current Plan:</span>
                        <span class="summary-value">${currentSubscription.planName}</span>
                    </div>
                ` : ''}
            </div>
            
            <form id="subscribeForm">
                <input type="hidden" name="planType" value="${planType}">
                <input type="hidden" name="planTier" value="${planTier}">
                
                <div class="form-group">
                    <label for="paymentMethodSelect">Payment Method</label>
                    <select class="form-control" id="paymentMethodSelect" name="paymentMethod" required>
                        <option value="">Select payment method</option>
                        ${SubscriptionState.paymentMethods.map(method => `
                            <option value="${method.id}" ${method.isDefault ? 'selected' : ''}>
                                ${method.provider} - ${method.number}
                            </option>
                        `).join('')}
                        <option value="new">Add New Payment Method</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="subscriptionPeriod">Subscription Period</label>
                    <select class="form-control" id="subscriptionPeriod" name="period" required>
                        <option value="monthly" ${plan.period === 'monthly' ? 'selected' : ''}>Monthly</option>
                        <option value="quarterly">Quarterly (Save 10%)</option>
                        <option value="annual">Annual (Save 20%)</option>
                    </select>
                    <small class="form-text text-muted">
                        Longer periods offer better savings
                    </small>
                </div>
                
                <div class="form-group">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="autoRenew" name="autoRenew" checked>
                        <label class="form-check-label" for="autoRenew">
                            Enable auto-renewal
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="agreeTerms" required>
                        <label class="form-check-label" for="agreeTerms">
                            I agree to the subscription terms and conditions
                        </label>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">
                    ${isUpgrade ? 'Upgrade Now' : isDowngrade ? 'Downgrade Now' : 'Subscribe Now'}
                </button>
            </form>
            
            <div class="payment-note">
                <p><strong>Note:</strong> Your subscription will start immediately upon successful payment.</p>
                ${isUpgrade ? '<p>Upgrade will be prorated based on your current billing cycle.</p>' : ''}
                ${isDowngrade ? '<p>Downgrade will take effect at the end of your current billing cycle.</p>' : ''}
            </div>
        </div>
    `;
    
    showModal('Subscribe to Plan', modalContent);
    
    // Initialize form submission
    const form = document.getElementById('subscribeForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSubscribe(planType, planTier);
        });
    }
    
    // Handle payment method selection
    const paymentMethodSelect = document.getElementById('paymentMethodSelect');
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', function() {
            if (this.value === 'new') {
                closeModal();
                document.getElementById('addPaymentMethodBtn').click();
            }
        });
    }
}

// Handle subscribe
function handleSubscribe(planType, planTier) {
    const form = document.getElementById('subscribeForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const paymentMethod = formData.get('paymentMethod');
    const period = formData.get('period');
    const autoRenew = formData.get('autoRenew') === 'on';
    
    if (paymentMethod === 'new') {
        showToast('Please add a payment method first', 'warning');
        return;
    }
    
    const plan = SubscriptionState.subscriptionPlans[planType][planTier];
    if (!plan) {
        showToast('Plan not found', 'error');
        return;
    }
    
    // Calculate price based on period
    let price = plan.price;
    if (period === 'quarterly') price = price * 3 * 0.9; // 10% discount
    if (period === 'annual') price = price * 12 * 0.8; // 20% discount
    
    // Simulate API call
    simulateAPI('/api/subscriptions/subscribe', {
        planType,
        planTier,
        paymentMethod,
        period,
        autoRenew,
        price
    })
    .then(response => {
        if (response.success) {
            // Update active subscription
            const startDate = new Date().toISOString().split('T')[0];
            const endDate = calculateEndDate(startDate, period);
            
            SubscriptionState.activeSubscription = {
                id: 'sub_' + Date.now(),
                userId: 'current_user',
                planType: planType,
                planTier: planTier,
                planName: plan.name,
                price: price,
                period: period,
                status: SubscriptionStatus.ACTIVE,
                startDate: startDate,
                endDate: endDate,
                autoRenew: autoRenew,
                paymentMethod: paymentMethod,
                nextPaymentDate: endDate,
                nextPaymentAmount: price,
                features: plan.features,
                limits: planType === 'borrower' ? {
                    maxLoans: plan.maxLoans,
                    interestRate: plan.interestRate
                } : {
                    weeklyLending: plan.weeklyLending,
                    commissionRate: plan.commissionRate,
                    maxActiveLoans: plan.maxActiveLoans
                }
            };
            
            // Add to history
            SubscriptionState.subscriptionHistory.unshift({
                id: SubscriptionState.activeSubscription.id,
                planName: plan.name,
                amount: price,
                period: period,
                status: SubscriptionStatus.ACTIVE,
                startDate: startDate,
                endDate: endDate,
                paymentStatus: PaymentStatus.COMPLETED
            });
            
            // Save state
            saveSubscriptionState();
            
            // Close modal
            closeModal();
            
            // Update UI
            showSubscriptionTab('my-plan');
            loadMyPlanDetails();
            updateSubscriptionStats();
            
            showToast('Subscription activated successfully!', 'success');
        } else {
            showToast('Subscription failed', 'error');
        }
    })
    .catch(error => {
        console.error('Subscriptions: Error subscribing:', error);
        showToast('Error processing subscription', 'error');
    });
}

// Open upgrade modal
function openUpgradeModal(newTier) {
    const currentSubscription = SubscriptionState.activeSubscription;
    if (!currentSubscription) {
        showToast('No active subscription found', 'error');
        return;
    }
    
    const plan = SubscriptionState.subscriptionPlans[currentSubscription.planType][newTier];
    if (!plan) {
        showToast('Plan not found', 'error');
        return;
    }
    
    // Calculate prorated upgrade cost
    const daysUsed = calculateDaysUsed(currentSubscription.startDate);
    const totalDays = calculateDaysBetween(currentSubscription.startDate, currentSubscription.endDate);
    const remainingDays = totalDays - daysUsed;
    const dailyRate = currentSubscription.price / totalDays;
    const newDailyRate = plan.price / 30; // Assuming 30-day month
    const proratedCost = Math.max(0, (newDailyRate * remainingDays) - (dailyRate * remainingDays));
    
    const modalContent = `
        <div class="upgrade-modal">
            <h3>Upgrade to ${plan.name}</h3>
            
            <div class="upgrade-comparison">
                <div class="comparison-current">
                    <h4>Current Plan</h4>
                    <div class="plan-name">${currentSubscription.planName}</div>
                    <div class="plan-price">₵${currentSubscription.price}/${currentSubscription.period}</div>
                    <ul class="plan-features">
                        ${currentSubscription.features.slice(0, 3).map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="comparison-arrow">→</div>
                
                <div class="comparison-new">
                    <h4>New Plan</h4>
                    <div class="plan-name">${plan.name}</div>
                    <div class="plan-price">₵${plan.price}/month</div>
                    <ul class="plan-features">
                        ${plan.features.slice(0, 3).map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="upgrade-details">
                <div class="detail-item">
                    <span class="detail-label">Prorated Upgrade Cost:</span>
                    <span class="detail-value">₵${proratedCost.toFixed(2)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Effective Date:</span>
                    <span class="detail-value">Immediately</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Next Billing Date:</span>
                    <span class="detail-value">${formatDate(currentSubscription.endDate)}</span>
                </div>
            </div>
            
            <form id="upgradeForm">
                <input type="hidden" name="newTier" value="${newTier}">
                
                <div class="form-group">
                    <label for="upgradePaymentMethod">Payment Method</label>
                    <select class="form-control" id="upgradePaymentMethod" name="paymentMethod" required>
                        ${SubscriptionState.paymentMethods.map(method => `
                            <option value="${method.id}" ${method.isDefault ? 'selected' : ''}>
                                ${method.provider} - ${method.number}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="upgradeAutoRenew" name="autoRenew" checked>
                        <label class="form-check-label" for="upgradeAutoRenew">
                            Keep auto-renewal enabled
                        </label>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">
                    Confirm Upgrade (₵${proratedCost.toFixed(2)})
                </button>
            </form>
        </div>
    `;
    
    // Show modal
    const modal = document.getElementById('upgradeModal');
    const modalBody = document.querySelector('#upgradeModal .modal-body');
    
    if (modalBody) {
        modalBody.innerHTML = modalContent;
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Handle upgrade
function handleUpgrade() {
    const form = document.getElementById('upgradeForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const newTier = formData.get('newTier');
    const paymentMethod = formData.get('paymentMethod');
    const autoRenew = formData.get('autoRenew') === 'on';
    
    const currentSubscription = SubscriptionState.activeSubscription;
    if (!currentSubscription) {
        showToast('No active subscription found', 'error');
        return;
    }
    
    const newPlan = SubscriptionState.subscriptionPlans[currentSubscription.planType][newTier];
    if (!newPlan) {
        showToast('New plan not found', 'error');
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/subscriptions/upgrade', {
        subscriptionId: currentSubscription.id,
        newTier: newTier,
        paymentMethod: paymentMethod,
        autoRenew: autoRenew
    })
    .then(response => {
        if (response.success) {
            // Update subscription
            currentSubscription.planTier = newTier;
            currentSubscription.planName = newPlan.name;
            currentSubscription.price = newPlan.price;
            currentSubscription.features = newPlan.features;
            currentSubscription.autoRenew = autoRenew;
            
            // Update limits based on plan type
            if (currentSubscription.planType === 'borrower') {
                currentSubscription.limits = {
                    maxLoans: newPlan.maxLoans,
                    interestRate: newPlan.interestRate
                };
            } else {
                currentSubscription.limits = {
                    weeklyLending: newPlan.weeklyLending,
                    commissionRate: newPlan.commissionRate,
                    maxActiveLoans: newPlan.maxActiveLoans
                };
            }
            
            // Save state
            saveSubscriptionState();
            
            // Close modal
            const modal = document.getElementById('upgradeModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Update UI
            loadMyPlanDetails();
            
            showToast('Subscription upgraded successfully!', 'success');
        } else {
            showToast('Upgrade failed', 'error');
        }
    })
    .catch(error => {
        console.error('Subscriptions: Error upgrading:', error);
        showToast('Error processing upgrade', 'error');
    });
}

// Cancel subscription
function cancelSubscription(subscriptionId) {
    const subscription = SubscriptionState.activeSubscription;
    if (!subscription || subscription.id !== subscriptionId) {
        showToast('Subscription not found', 'error');
        return;
    }
    
    if (!confirm(`Are you sure you want to cancel your ${subscription.planName} subscription?`)) {
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/subscriptions/cancel', { subscriptionId })
        .then(response => {
            if (response.success) {
                // Update subscription status
                subscription.status = SubscriptionStatus.CANCELLED;
                subscription.autoRenew = false;
                
                // Update history
                const historyEntry = SubscriptionState.subscriptionHistory.find(
                    h => h.id === subscriptionId
                );
                if (historyEntry) {
                    historyEntry.status = SubscriptionStatus.CANCELLED;
                }
                
                // Save state
                saveSubscriptionState();
                
                // Update UI
                loadMyPlanDetails();
                loadSubscriptionHistoryList();
                
                showToast('Subscription cancelled successfully', 'success');
            } else {
                showToast('Failed to cancel subscription', 'error');
            }
        })
        .catch(error => {
            console.error('Subscriptions: Error cancelling subscription:', error);
            showToast('Error cancelling subscription', 'error');
        });
}

// Toggle auto-renewal
function toggleAutoRenewal(enabled) {
    const subscription = SubscriptionState.activeSubscription;
    if (!subscription) {
        showToast('No active subscription found', 'error');
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/subscriptions/auto-renew', {
        subscriptionId: subscription.id,
        autoRenew: enabled
    })
    .then(response => {
        if (response.success) {
            subscription.autoRenew = enabled;
            saveSubscriptionState();
            showToast(`Auto-renewal ${enabled ? 'enabled' : 'disabled'}`, 'success');
        } else {
            showToast('Failed to update auto-renewal', 'error');
        }
    })
    .catch(error => {
        console.error('Subscriptions: Error toggling auto-renewal:', error);
        showToast('Error updating auto-renewal', 'error');
    });
}

// Handle add payment method
function handleAddPaymentMethod() {
    const form = document.getElementById('paymentMethodForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const methodType = formData.get('methodType');
    const provider = formData.get('provider');
    const number = formData.get('number');
    
    // Validate payment method
    const validationErrors = validatePaymentMethod(methodType, number);
    if (validationErrors.length > 0) {
        showToast(validationErrors.join(', '), 'error');
        return;
    }
    
    // Create payment method
    const paymentMethod = {
        id: 'pm_' + Date.now(),
        type: methodType,
        provider: provider,
        number: maskPaymentNumber(number, methodType),
        isDefault: SubscriptionState.paymentMethods.length === 0,
        addedAt: new Date().toISOString().split('T')[0]
    };
    
    // Simulate API call
    simulateAPI('/api/subscriptions/add-payment-method', paymentMethod)
        .then(response => {
            if (response.success) {
                // Add to payment methods
                SubscriptionState.paymentMethods.push(paymentMethod);
                
                // Save state
                saveSubscriptionState();
                
                // Close modal
                const modal = document.getElementById('paymentMethodModal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Update UI
                loadPaymentMethodsList();
                updateSubscriptionStats();
                
                showToast('Payment method added successfully', 'success');
            } else {
                showToast('Failed to add payment method', 'error');
            }
        })
        .catch(error => {
            console.error('Subscriptions: Error adding payment method:', error);
            showToast('Error adding payment method', 'error');
        });
}

// Set default payment method
function setDefaultPaymentMethod(methodId) {
    const method = SubscriptionState.paymentMethods.find(m => m.id === methodId);
    if (!method) {
        showToast('Payment method not found', 'error');
        return;
    }
    
    if (method.isDefault) {
        showToast('This is already your default payment method', 'info');
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/subscriptions/set-default-payment', { methodId })
        .then(response => {
            if (response.success) {
                // Update all payment methods
                SubscriptionState.paymentMethods.forEach(m => {
                    m.isDefault = m.id === methodId;
                });
                
                // Save state
                saveSubscriptionState();
                
                // Update UI
                loadPaymentMethodsList();
                
                showToast('Default payment method updated', 'success');
            } else {
                showToast('Failed to update default payment method', 'error');
            }
        })
        .catch(error => {
            console.error('Subscriptions: Error setting default payment:', error);
            showToast('Error updating default payment method', 'error');
        });
}

// Remove payment method
function removePaymentMethod(methodId) {
    const method = SubscriptionState.paymentMethods.find(m => m.id === methodId);
    if (!method) {
        showToast('Payment method not found', 'error');
        return;
    }
    
    if (method.isDefault && SubscriptionState.paymentMethods.length > 1) {
        showToast('Please set another payment method as default before removing this one', 'warning');
        return;
    }
    
    if (!confirm('Remove this payment method?')) {
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/subscriptions/remove-payment-method', { methodId })
        .then(response => {
            if (response.success) {
                // Remove payment method
                SubscriptionState.paymentMethods = SubscriptionState.paymentMethods.filter(
                    m => m.id !== methodId
                );
                
                // If this was the default and there are other methods, set first as default
                if (method.isDefault && SubscriptionState.paymentMethods.length > 0) {
                    SubscriptionState.paymentMethods[0].isDefault = true;
                }
                
                // Save state
                saveSubscriptionState();
                
                // Update UI
                loadPaymentMethodsList();
                updateSubscriptionStats();
                
                showToast('Payment method removed', 'success');
            } else {
                showToast('Failed to remove payment method', 'error');
            }
        })
        .catch(error => {
            console.error('Subscriptions: Error removing payment method:', error);
            showToast('Error removing payment method', 'error');
        });
}

// Download invoice
function downloadInvoice(invoiceId) {
    // In a real app, this would generate and download the invoice
    showToast(`Downloading invoice ${invoiceId}...`, 'info');
    
    // Simulate download
    setTimeout(() => {
        showToast('Invoice downloaded successfully', 'success');
    }, 1000);
}

// Pay now
function payNow(subscriptionId) {
    const subscription = SubscriptionState.activeSubscription;
    if (!subscription || subscription.id !== subscriptionId) {
        showToast('Subscription not found', 'error');
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/subscriptions/pay-now', { subscriptionId })
        .then(response => {
            if (response.success) {
                // Update next payment date
                const newEndDate = calculateEndDate(subscription.endDate, subscription.period);
                subscription.endDate = newEndDate;
                subscription.nextPaymentDate = newEndDate;
                
                // Save state
                saveSubscriptionState();
                
                // Update UI
                loadMyPlanDetails();
                
                showToast('Payment processed successfully', 'success');
            } else {
                showToast('Payment failed', 'error');
            }
        })
        .catch(error => {
            console.error('Subscriptions: Error processing payment:', error);
            showToast('Error processing payment', 'error');
        });
}

// Change payment method
function changePaymentMethod() {
    showToast('Redirecting to payment method selection...', 'info');
    showSubscriptionTab('payment-methods');
}

// View subscription details
function viewSubscriptionDetails() {
    const subscription = SubscriptionState.activeSubscription;
    if (!subscription) {
        showToast('No active subscription found', 'error');
        return;
    }
    
    const modalContent = `
        <div class="subscription-details-modal">
            <h3>Subscription Details</h3>
            
            <div class="details-grid">
                <div class="detail-item">
                    <span class="detail-label">Subscription ID:</span>
                    <span class="detail-value">${subscription.id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Plan Name:</span>
                    <span class="detail-value">${subscription.planName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value badge ${subscription.status}">${subscription.status}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Start Date:</span>
                    <span class="detail-value">${formatDate(subscription.startDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">End Date:</span>
                    <span class="detail-value">${formatDate(subscription.endDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Auto-renewal:</span>
                    <span class="detail-value">${subscription.autoRenew ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">Mobile Money (055****567)</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Next Payment:</span>
                    <span class="detail-value">₵${subscription.nextPaymentAmount} on ${formatDate(subscription.nextPaymentDate)}</span>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-outline-secondary" onclick="closeModal()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    showModal('Subscription Details', modalContent);
}

// View subscription invoice
function viewSubscriptionInvoice(subscriptionId) {
    showToast(`Viewing invoice for subscription ${subscriptionId}`, 'info');
}

// View invoice
function viewInvoice(invoiceId) {
    showToast(`Viewing invoice ${invoiceId}`, 'info');
}

// Helper functions
function calculateDaysRemaining(dateString) {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calculateSubscriptionProgress(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    const totalDuration = end - start;
    const elapsed = today - start;
    
    if (elapsed <= 0) return 0;
    if (elapsed >= totalDuration) return 100;
    
    return (elapsed / totalDuration) * 100;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatLimitLabel(key) {
    return key.split(/(?=[A-Z])/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatLimitValue(key, value) {
    if (key.includes('Rate') || key.includes('rate')) {
        return `${value}%`;
    }
    if (key.includes('Amount') || key.includes('amount') || key.includes('Lending') || key.includes('Loans')) {
        return `₵${value.toLocaleString()}`;
    }
    return value;
}

function getNextTier(currentTier) {
    const tiers = ['basic', 'premium', 'super'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : currentTier;
}

function getTierLevel(tier) {
    const tiers = ['basic', 'premium', 'super'];
    return tiers.indexOf(tier);
}

function calculateEndDate(startDate, period) {
    const date = new Date(startDate);
    
    switch(period) {
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'quarterly':
            date.setMonth(date.getMonth() + 3);
            break;
        case 'annual':
            date.setFullYear(date.getFullYear() + 1);
            break;
        default:
            date.setMonth(date.getMonth() + 1);
    }
    
    return date.toISOString().split('T')[0];
}

function calculateDaysUsed(startDate) {
    const start = new Date(startDate);
    const today = new Date();
    return Math.ceil((today - start) / (1000 * 60 * 60 * 24));
}

function calculateDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function getPaymentMethodIcon(type) {
    const icons = {
        'mobile_money': '📱',
        'bank': '🏦',
        'card': '💳',
        'cash': '💵'
    };
    return icons[type] || '💰';
}

function formatPaymentMethodType(type) {
    return type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function validatePaymentMethod(type, number) {
    const errors = [];
    
    if (!type) {
        errors.push('Payment method type is required');
    }
    
    if (!number || number.trim().length < 4) {
        errors.push('Payment method number is required');
    }
    
    // Basic validation based on type
    if (type === 'mobile_money') {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(number.replace(/\D/g, ''))) {
            errors.push('Invalid mobile money number');
        }
    } else if (type === 'card') {
        const cardRegex = /^[0-9]{16}$/;
        if (!cardRegex.test(number.replace(/\D/g, ''))) {
            errors.push('Invalid card number (must be 16 digits)');
        }
    }
    
    return errors;
}

function maskPaymentNumber(number, type) {
    if (type === 'mobile_money') {
        return number.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
    } else if (type === 'card') {
        return '****' + number.slice(-4);
    } else if (type === 'bank') {
        return '****' + number.slice(-4);
    }
    return number;
}

function showModal(title, content) {
    let modal = document.getElementById('dynamicModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dynamicModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-modal" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('dynamicModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function simulateAPI(endpoint, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
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

function showToast(message, type = 'info') {
    if (window.PesewaAuth && window.PesewaAuth.showToast) {
        window.PesewaAuth.showToast(message, type);
    } else if (window.PesewaApp && window.PesewaApp.showToast) {
        window.PesewaApp.showToast(message, type);
    } else {
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// Initialize subscription module when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initSubscriptions();
});

// Export for use in other modules
window.PesewaSubscriptions = {
    initSubscriptions,
    loadMyPlanDetails,
    loadAvailablePlans,
    loadPaymentMethodsList,
    openSubscribeModal,
    openUpgradeModal,
    cancelSubscription,
    toggleAutoRenewal,
    handleAddPaymentMethod
};