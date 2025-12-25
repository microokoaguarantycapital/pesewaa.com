'use strict';

// Pesewa.com - Role Management Module

// Role definitions and permissions
const RoleDefinitions = {
    borrower: {
        name: 'Borrower',
        description: 'Users who request and receive loans',
        permissions: [
            'request_loan',
            'view_loan_requests',
            'view_repayment_schedule',
            'view_borrowing_history',
            'update_profile',
            'manage_guarantors',
            'view_available_lenders',
            'join_borrowing_groups',
            'view_blacklist_status',
            'make_repayments'
        ],
        limits: {
            maxLoanPerWeek: {
                basic: 1500,
                premium: 5000,
                super: 20000
            },
            maxActiveLoans: 3,
            maxGuarantors: 2,
            canJoinMultipleGroups: true
        },
        dashboard: {
            defaultView: 'borrower-dashboard.html',
            sections: ['my-loans', 'repayment-schedule', 'borrowing-history', 'available-lenders', 'my-groups']
        }
    },
    lender: {
        name: 'Lender',
        description: 'Users who provide loans to borrowers',
        permissions: [
            'view_loan_requests',
            'fund_loans',
            'set_lending_terms',
            'view_lending_portfolio',
            'manage_subscription',
            'view_borrower_profiles',
            'manage_lending_groups',
            'track_repayments',
            'initiate_collections',
            'view_ledger'
        ],
        tiers: {
            basic: {
                name: 'Basic Tier',
                maxWeeklyLending: 1500,
                subscription: {
                    monthly: 50,
                    biAnnual: 250,
                    annual: 500
                },
                features: [
                    'Access to all 12 loan categories',
                    'No CRB check required',
                    'Basic ledger access'
                ]
            },
            premium: {
                name: 'Premium Tier',
                maxWeeklyLending: 5000,
                subscription: {
                    monthly: 250,
                    biAnnual: 1500,
                    annual: 2500
                },
                features: [
                    'Priority borrower matching',
                    'Advanced ledger analytics',
                    'No CRB check required',
                    'Higher lending limits'
                ]
            },
            super: {
                name: 'Super Tier',
                maxWeeklyLending: 20000,
                subscription: {
                    monthly: 1000,
                    biAnnual: 5000,
                    annual: 8500
                },
                features: [
                    'CRB check for borrowers',
                    'Premium support',
                    'Cross-group lending insights',
                    'Debt collection assistance',
                    'Highest lending limits'
                ]
            }
        },
        dashboard: {
            defaultView: 'lender-dashboard.html',
            sections: ['lending-portfolio', 'available-borrowers', 'loan-requests', 'subscription', 'ledger', 'collections']
        }
    },
    collector: {
        name: 'Collector',
        description: 'Users who help collect overdue payments',
        permissions: [
            'view_overdue_loans',
            'assign_collection_tasks',
            'update_collection_status',
            'receive_collection_commission',
            'view_collection_history',
            'communicate_with_borrowers'
        ],
        dashboard: {
            defaultView: 'collector-dashboard.html',
            sections: ['collection-tasks', 'overdue-loans', 'commission', 'collection-history']
        }
    },
    admin: {
        name: 'Administrator',
        description: 'System administrators with full access',
        permissions: [
            'manage_users',
            'manage_roles',
            'view_all_transactions',
            'manage_system_settings',
            'handle_disputes',
            'manage_blacklist',
            'generate_reports',
            'approve_lenders',
            'approve_borrowers'
        ],
        dashboard: {
            defaultView: 'admin-dashboard.html',
            sections: ['user-management', 'transaction-monitoring', 'system-settings', 'reports', 'disputes', 'blacklist']
        }
    }
};

// Current user role state
const RoleState = {
    currentRole: null,
    currentTier: null,
    permissions: [],
    roleData: null,
    isSwitching: false
};

// Initialize role management module
function initRoles() {
    console.log('Roles: Initializing role management module...');
    
    // Load user role from auth state
    loadUserRole();
    
    // Initialize role switching
    initRoleSwitching();
    
    // Initialize role-based UI
    initRoleBasedUI();
    
    // Initialize permission checks
    initPermissionChecks();
}

// Load user role from authentication state
function loadUserRole() {
    const authState = window.PesewaAuth;
    if (authState && authState.getCurrentUserRole) {
        RoleState.currentRole = authState.getCurrentUserRole();
        RoleState.roleData = RoleDefinitions[RoleState.currentRole] || null;
        
        // Load additional role data from localStorage
        loadRolePreferences();
        
        console.log(`Roles: Loaded user role - ${RoleState.currentRole}`);
        
        // Update permissions
        updatePermissions();
    }
}

// Load role preferences from localStorage
function loadRolePreferences() {
    try {
        const savedRolePrefs = localStorage.getItem('pesewa_role_preferences');
        if (savedRolePrefs) {
            const prefs = JSON.parse(savedRolePrefs);
            if (prefs.role === RoleState.currentRole) {
                RoleState.currentTier = prefs.tier;
                console.log('Roles: Loaded role preferences');
            }
        }
    } catch (error) {
        console.error('Roles: Error loading role preferences:', error);
    }
}

// Save role preferences to localStorage
function saveRolePreferences() {
    try {
        const prefs = {
            role: RoleState.currentRole,
            tier: RoleState.currentTier,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('pesewa_role_preferences', JSON.stringify(prefs));
        console.log('Roles: Saved role preferences');
    } catch (error) {
        console.error('Roles: Error saving role preferences:', error);
    }
}

// Update permissions based on current role and tier
function updatePermissions() {
    if (!RoleState.roleData) {
        RoleState.permissions = [];
        return;
    }
    
    // Start with base permissions for the role
    RoleState.permissions = [...RoleState.roleData.permissions];
    
    // Add tier-specific permissions for lenders
    if (RoleState.currentRole === 'lender' && RoleState.currentTier) {
        const tier = RoleState.currentTier;
        // Add tier-specific features as permissions
        RoleState.roleData.tiers[tier].features.forEach(feature => {
            const permissionName = feature.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
            if (!RoleState.permissions.includes(permissionName)) {
                RoleState.permissions.push(permissionName);
            }
        });
    }
    
    console.log(`Roles: Updated permissions for ${RoleState.currentRole}:`, RoleState.permissions);
}

// Initialize role switching functionality
function initRoleSwitching() {
    // Role switch buttons (for users with multiple roles)
    const roleSwitchButtons = document.querySelectorAll('[data-switch-role]');
    
    roleSwitchButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetRole = this.getAttribute('data-switch-role');
            switchUserRole(targetRole);
        });
    });
    
    // Tier selection for lenders
    const tierSelect = document.getElementById('lenderTier');
    if (tierSelect) {
        tierSelect.addEventListener('change', function() {
            updateLenderTier(this.value);
        });
        
        // Set current tier if available
        if (RoleState.currentTier) {
            tierSelect.value = RoleState.currentTier;
            updateLenderTier(RoleState.currentTier);
        }
    }
}

// Switch user role (for users with multiple roles)
function switchUserRole(newRole) {
    if (RoleState.isSwitching) return;
    
    if (!RoleDefinitions[newRole]) {
        showToast('Invalid role selected', 'error');
        return;
    }
    
    // Check if user has permission to switch to this role
    if (!hasPermission('switch_to_' + newRole) && !hasPermission('admin')) {
        showToast('You do not have permission to switch to this role', 'error');
        return;
    }
    
    RoleState.isSwitching = true;
    
    // Show loading state
    showToast(`Switching to ${RoleDefinitions[newRole].name} role...`, 'info');
    
    // Simulate API call to switch role
    simulateAPI('/api/users/switch-role', { newRole })
        .then(response => {
            if (response.success) {
                // Update role state
                RoleState.currentRole = newRole;
                RoleState.roleData = RoleDefinitions[newRole];
                RoleState.currentTier = response.data.tier || null;
                
                // Update permissions
                updatePermissions();
                
                // Save preferences
                saveRolePreferences();
                
                // Update UI
                updateRoleBasedUI();
                
                // Redirect to appropriate dashboard
                setTimeout(() => {
                    const dashboardUrl = RoleState.roleData.dashboard.defaultView;
                    window.location.href = `pages/dashboard/${dashboardUrl}`;
                }, 1500);
                
                showToast(`Successfully switched to ${RoleDefinitions[newRole].name}`, 'success');
            } else {
                showToast('Failed to switch role', 'error');
            }
        })
        .catch(error => {
            console.error('Roles: Error switching role:', error);
            showToast('Error switching role', 'error');
        })
        .finally(() => {
            RoleState.isSwitching = false;
        });
}

// Update lender tier
function updateLenderTier(newTier) {
    if (RoleState.currentRole !== 'lender') return;
    
    const tiers = RoleDefinitions.lender.tiers;
    if (!tiers[newTier]) {
        showToast('Invalid tier selected', 'error');
        return;
    }
    
    // Show tier confirmation modal
    const tier = tiers[newTier];
    const confirmMessage = `
        <h4>Confirm Tier Change</h4>
        <p>You are about to change to <strong>${tier.name}</strong>.</p>
        <p>Monthly Subscription: <strong>₵${tier.subscription.monthly}</strong></p>
        <p>Weekly Lending Limit: <strong>₵${tier.maxWeeklyLending.toLocaleString()}</strong></p>
        <ul>
            ${tier.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
        <p>Do you want to proceed?</p>
    `;
    
    if (confirm(confirmMessage.replace(/<[^>]*>/g, ''))) {
        // Simulate API call to update tier
        simulateAPI('/api/lenders/update-tier', { tier: newTier })
            .then(response => {
                if (response.success) {
                    RoleState.currentTier = newTier;
                    updatePermissions();
                    saveRolePreferences();
                    updateTierDisplay();
                    showToast(`Successfully updated to ${tier.name}`, 'success');
                } else {
                    showToast('Failed to update tier', 'error');
                }
            })
            .catch(error => {
                console.error('Roles: Error updating tier:', error);
                showToast('Error updating tier', 'error');
            });
    }
}

// Update tier display in UI
function updateTierDisplay() {
    if (RoleState.currentRole !== 'lender' || !RoleState.currentTier) return;
    
    const tier = RoleDefinitions.lender.tiers[RoleState.currentTier];
    const tierDisplay = document.getElementById('currentTierDisplay');
    const tierBadge = document.getElementById('tierBadge');
    const lendingLimit = document.getElementById('lendingLimit');
    
    if (tierDisplay) {
        tierDisplay.textContent = tier.name;
        tierDisplay.className = `tier-display ${RoleState.currentTier}`;
    }
    
    if (tierBadge) {
        tierBadge.textContent = tier.name;
        tierBadge.className = `tier-badge ${RoleState.currentTier}`;
    }
    
    if (lendingLimit) {
        lendingLimit.textContent = `₵${tier.maxWeeklyLending.toLocaleString()}`;
    }
}

// Initialize role-based UI
function initRoleBasedUI() {
    // Hide/show elements based on current role
    updateRoleBasedUI();
    
    // Initialize role-specific forms
    initRoleSpecificForms();
    
    // Initialize role-specific event listeners
    initRoleSpecificEvents();
}

// Update UI based on current role
function updateRoleBasedUI() {
    // Update page title and header based on role
    updatePageTitle();
    
    // Show/hide role-specific sections
    toggleRoleSections();
    
    // Update navigation based on role
    updateRoleNavigation();
    
    // Update dashboard widgets based on role
    updateDashboardWidgets();
    
    // Update footer based on role
    updateRoleFooter();
}

// Update page title based on role
function updatePageTitle() {
    const pageTitle = document.querySelector('title');
    const pageHeader = document.querySelector('.page-header h1');
    
    if (RoleState.roleData) {
        const roleName = RoleState.roleData.name;
        
        if (pageTitle) {
            const currentTitle = pageTitle.textContent;
            if (!currentTitle.includes(roleName)) {
                pageTitle.textContent = `${roleName} - Pesewa.com`;
            }
        }
        
        if (pageHeader) {
            pageHeader.textContent = `${roleName} Dashboard`;
        }
    }
}

// Toggle role-specific sections visibility
function toggleRoleSections() {
    // Get all role-specific sections
    const roleSections = document.querySelectorAll('[data-role-section]');
    
    roleSections.forEach(section => {
        const allowedRoles = section.getAttribute('data-role-section').split(' ');
        const isVisible = allowedRoles.includes(RoleState.currentRole) || allowedRoles.includes('all');
        
        section.style.display = isVisible ? 'block' : 'none';
        
        // Add role-specific class for styling
        if (isVisible) {
            section.classList.add(`role-${RoleState.currentRole}`);
        } else {
            section.classList.remove(`role-${RoleState.currentRole}`);
        }
    });
}

// Update navigation based on role
function updateRoleNavigation() {
    const navItems = document.querySelectorAll('[data-role-nav]');
    
    navItems.forEach(item => {
        const allowedRoles = item.getAttribute('data-role-nav').split(' ');
        const isVisible = allowedRoles.includes(RoleState.currentRole) || allowedRoles.includes('all');
        
        item.style.display = isVisible ? 'flex' : 'none';
    });
}

// Update dashboard widgets based on role
function updateDashboardWidgets() {
    const widgets = document.querySelectorAll('.dashboard-widget');
    
    widgets.forEach(widget => {
        const widgetRole = widget.getAttribute('data-widget-role');
        const isRelevant = !widgetRole || widgetRole === RoleState.currentRole;
        
        if (isRelevant) {
            widget.style.display = 'block';
            updateWidgetContent(widget);
        } else {
            widget.style.display = 'none';
        }
    });
}

// Update widget content based on role
function updateWidgetContent(widget) {
    const widgetType = widget.getAttribute('data-widget-type');
    if (!widgetType) return;
    
    switch(widgetType) {
        case 'loan-summary':
            if (RoleState.currentRole === 'borrower') {
                updateBorrowerLoanSummary(widget);
            } else if (RoleState.currentRole === 'lender') {
                updateLenderLoanSummary(widget);
            }
            break;
        case 'recent-activity':
            updateRecentActivityWidget(widget);
            break;
        case 'quick-actions':
            updateQuickActionsWidget(widget);
            break;
        case 'stats':
            updateStatsWidget(widget);
            break;
    }
}

// Update borrower loan summary widget
function updateBorrowerLoanSummary(widget) {
    // In a real app, this would fetch data from API
    const summaryData = {
        activeLoans: 2,
        totalBorrowed: 3500,
        totalDue: 4025,
        nextPayment: 575,
        nextPaymentDate: '2024-01-15'
    };
    
    const content = `
        <div class="widget-content">
            <h4>My Loans Summary</h4>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Active Loans</span>
                    <span class="stat-value">${summaryData.activeLoans}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Borrowed</span>
                    <span class="stat-value">₵${summaryData.totalBorrowed.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Due</span>
                    <span class="stat-value">₵${summaryData.totalDue.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Next Payment</span>
                    <span class="stat-value">₵${summaryData.nextPayment.toLocaleString()}</span>
                    <span class="stat-subtext">Due: ${formatDate(summaryData.nextPaymentDate)}</span>
                </div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.location.href='pages/borrowing/my-loans.html'">
                View All Loans
            </button>
        </div>
    `;
    
    widget.querySelector('.widget-body').innerHTML = content;
}

// Update lender loan summary widget
function updateLenderLoanSummary(widget) {
    // In a real app, this would fetch data from API
    const summaryData = {
        activeInvestments: 5,
        totalLent: 12500,
        totalEarned: 1875,
        pendingReturns: 3125,
        availableBalance: RoleState.currentTier ? RoleDefinitions.lender.tiers[RoleState.currentTier].maxWeeklyLending - 12500 : 0
    };
    
    const content = `
        <div class="widget-content">
            <h4>Lending Portfolio</h4>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Active Investments</span>
                    <span class="stat-value">${summaryData.activeInvestments}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Lent</span>
                    <span class="stat-value">₵${summaryData.totalLent.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Interest Earned</span>
                    <span class="stat-value">₵${summaryData.totalEarned.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Pending Returns</span>
                    <span class="stat-value">₵${summaryData.pendingReturns.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Available Balance</span>
                    <span class="stat-value">₵${summaryData.availableBalance.toLocaleString()}</span>
                </div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.location.href='pages/lending/portfolio.html'">
                View Portfolio
            </button>
        </div>
    `;
    
    widget.querySelector('.widget-body').innerHTML = content;
}

// Update recent activity widget
function updateRecentActivityWidget(widget) {
    // This would be populated with actual recent activities
    const activities = [
        { type: 'loan_request', amount: 1500, date: '2024-01-10', status: 'pending' },
        { type: 'repayment', amount: 575, date: '2024-01-09', status: 'completed' },
        { type: 'loan_approved', amount: 2000, date: '2024-01-08', status: 'completed' }
    ];
    
    let activitiesHTML = '';
    activities.forEach(activity => {
        let icon, text, color;
        
        switch(activity.type) {
            case 'loan_request':
                icon = '📝';
                text = 'Loan Request';
                color = 'warning';
                break;
            case 'repayment':
                icon = '💵';
                text = 'Repayment Made';
                color = 'success';
                break;
            case 'loan_approved':
                icon = '✅';
                text = 'Loan Approved';
                color = 'info';
                break;
            default:
                icon = 'ℹ️';
                text = 'Activity';
                color = 'secondary';
        }
        
        activitiesHTML += `
            <div class="activity-item ${color}">
                <span class="activity-icon">${icon}</span>
                <div class="activity-content">
                    <span class="activity-text">${text}</span>
                    <span class="activity-amount">₵${activity.amount.toLocaleString()}</span>
                    <span class="activity-date">${formatDate(activity.date)}</span>
                </div>
                <span class="activity-status badge badge-${color}">${activity.status}</span>
            </div>
        `;
    });
    
    const content = `
        <div class="widget-content">
            <h4>Recent Activity</h4>
            <div class="activity-list">
                ${activitiesHTML}
            </div>
            <button class="btn btn-outline-secondary btn-sm" onclick="window.location.href='pages/activity.html'">
                View All Activity
            </button>
        </div>
    `;
    
    widget.querySelector('.widget-body').innerHTML = content;
}

// Update quick actions widget
function updateQuickActionsWidget(widget) {
    let actions = [];
    
    switch(RoleState.currentRole) {
        case 'borrower':
            actions = [
                { icon: '📝', label: 'Request Loan', url: 'pages/borrowing/request-loan.html', color: 'primary' },
                { icon: '💵', label: 'Make Payment', url: 'pages/borrowing/make-payment.html', color: 'success' },
                { icon: '👥', label: 'Find Lenders', url: 'pages/borrowing/find-lenders.html', color: 'info' },
                { icon: '📊', label: 'View Schedule', url: 'pages/borrowing/repayment-schedule.html', color: 'warning' }
            ];
            break;
        case 'lender':
            actions = [
                { icon: '💰', label: 'Fund Loan', url: 'pages/lending/fund-loan.html', color: 'primary' },
                { icon: '👤', label: 'View Borrowers', url: 'pages/lending/available-borrowers.html', color: 'info' },
                { icon: '📈', label: 'View Ledger', url: 'pages/lending/ledger.html', color: 'success' },
                { icon: '⚙️', label: 'Settings', url: 'pages/lending/settings.html', color: 'secondary' }
            ];
            break;
        default:
            actions = [
                { icon: '📊', label: 'Dashboard', url: '#', color: 'primary' },
                { icon: '👤', label: 'Profile', url: '#', color: 'info' },
                { icon: '⚙️', label: 'Settings', url: '#', color: 'secondary' }
            ];
    }
    
    let actionsHTML = '';
    actions.forEach(action => {
        actionsHTML += `
            <a href="${action.url}" class="quick-action btn btn-${action.color}">
                <span class="action-icon">${action.icon}</span>
                <span class="action-label">${action.label}</span>
            </a>
        `;
    });
    
    const content = `
        <div class="widget-content">
            <h4>Quick Actions</h4>
            <div class="quick-actions-grid">
                ${actionsHTML}
            </div>
        </div>
    `;
    
    widget.querySelector('.widget-body').innerHTML = content;
}

// Update stats widget
function updateStatsWidget(widget) {
    // This would show different stats based on role
    const content = `
        <div class="widget-content">
            <h4>Performance Stats</h4>
            <div class="stats-placeholder">
                <p>Performance statistics will appear here based on your activity.</p>
                <div class="progress">
                    <div class="progress-bar" style="width: 75%"></div>
                </div>
                <p class="text-muted mt-2">Loading detailed statistics...</p>
            </div>
        </div>
    `;
    
    widget.querySelector('.widget-body').innerHTML = content;
}

// Update footer based on role
function updateRoleFooter() {
    const footerRoleInfo = document.getElementById('footerRoleInfo');
    if (footerRoleInfo && RoleState.roleData) {
        footerRoleInfo.textContent = `Logged in as ${RoleState.roleData.name}`;
        
        if (RoleState.currentRole === 'lender' && RoleState.currentTier) {
            const tier = RoleDefinitions.lender.tiers[RoleState.currentTier];
            footerRoleInfo.innerHTML += ` • ${tier.name}`;
        }
    }
}

// Initialize role-specific forms
function initRoleSpecificForms() {
    // Borrower-specific forms
    if (RoleState.currentRole === 'borrower') {
        initBorrowerForms();
    }
    
    // Lender-specific forms
    if (RoleState.currentRole === 'lender') {
        initLenderForms();
    }
}

// Initialize borrower-specific forms
function initBorrowerForms() {
    const loanRequestForm = document.getElementById('loanRequestForm');
    if (loanRequestForm) {
        loanRequestForm.addEventListener('submit', handleLoanRequest);
    }
    
    const repaymentForm = document.getElementById('repaymentForm');
    if (repaymentForm) {
        repaymentForm.addEventListener('submit', handleRepayment);
    }
}

// Initialize lender-specific forms
function initLenderForms() {
    const fundLoanForm = document.getElementById('fundLoanForm');
    if (fundLoanForm) {
        fundLoanForm.addEventListener('submit', handleFundLoan);
    }
    
    const lenderSettingsForm = document.getElementById('lenderSettingsForm');
    if (lenderSettingsForm) {
        lenderSettingsForm.addEventListener('submit', handleLenderSettings);
    }
}

// Initialize role-specific event listeners
function initRoleSpecificEvents() {
    // Add any role-specific event listeners here
}

// Initialize permission checks
function initPermissionChecks() {
    // Check permissions for all protected elements
    const protectedElements = document.querySelectorAll('[data-permission]');
    
    protectedElements.forEach(element => {
        const requiredPermission = element.getAttribute('data-permission');
        if (!hasPermission(requiredPermission)) {
            element.style.display = 'none';
        }
    });
}

// Check if user has specific permission
function hasPermission(permission) {
    if (!RoleState.permissions || RoleState.permissions.length === 0) {
        updatePermissions();
    }
    
    // Always allow if user has admin role
    if (RoleState.currentRole === 'admin') return true;
    
    // Check if permission is in the list
    return RoleState.permissions.includes(permission);
}

// Check if user can perform action
function canPerformAction(action) {
    return hasPermission(action);
}

// Get role limits
function getRoleLimits() {
    if (!RoleState.roleData) return null;
    
    const limits = { ...RoleState.roleData.limits };
    
    // Add tier-specific limits for lenders
    if (RoleState.currentRole === 'lender' && RoleState.currentTier) {
        const tier = RoleDefinitions.lender.tiers[RoleState.currentTier];
        limits.maxWeeklyLending = tier.maxWeeklyLending;
        limits.subscription = tier.subscription;
    }
    
    return limits;
}

// Get available actions for current role
function getAvailableActions() {
    if (!RoleState.roleData) return [];
    
    const actions = [];
    
    // Add actions based on permissions
    RoleState.permissions.forEach(permission => {
        // Map permissions to user-friendly actions
        const actionMap = {
            'request_loan': { label: 'Request Loan', icon: '📝', category: 'borrowing' },
            'fund_loans': { label: 'Fund Loan', icon: '💰', category: 'lending' },
            'view_ledger': { label: 'View Ledger', icon: '📊', category: 'reports' },
            'make_repayments': { label: 'Make Payment', icon: '💵', category: 'payments' }
            // Add more mappings as needed
        };
        
        if (actionMap[permission]) {
            actions.push(actionMap[permission]);
        }
    });
    
    return actions;
}

// Handle loan request (borrower)
function handleLoanRequest(e) {
    e.preventDefault();
    // Implementation in borrowing.js
    console.log('Loan request form submitted');
}

// Handle repayment (borrower)
function handleRepayment(e) {
    e.preventDefault();
    // Implementation in borrowing.js
    console.log('Repayment form submitted');
}

// Handle fund loan (lender)
function handleFundLoan(e) {
    e.preventDefault();
    // Implementation in lending.js
    console.log('Fund loan form submitted');
}

// Handle lender settings (lender)
function handleLenderSettings(e) {
    e.preventDefault();
    // Implementation in lending.js
    console.log('Lender settings form submitted');
}

// Format date helper function
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Simulate API call
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

// Show toast notification
function showToast(message, type = 'info') {
    // Use existing toast function if available, otherwise create basic alert
    if (window.PesewaAuth && window.PesewaAuth.showToast) {
        window.PesewaAuth.showToast(message, type);
    } else if (window.PesewaApp && window.PesewaApp.showToast) {
        window.PesewaApp.showToast(message, type);
    } else {
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// Initialize roles module when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initRoles();
});

// Export for use in other modules
window.PesewaRoles = {
    initRoles,
    hasPermission,
    canPerformAction,
    getRoleLimits,
    getAvailableActions,
    getCurrentRole: () => RoleState.currentRole,
    getCurrentTier: () => RoleState.currentTier,
    getRoleData: () => RoleState.roleData,
    switchUserRole,
    updateLenderTier,
    updateRoleBasedUI
};