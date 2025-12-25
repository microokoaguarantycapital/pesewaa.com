'use strict';

/**
 * Pesewa.com - Roles Module
 * Handles user role management and role-based permissions
 */

const PesewaRoles = {
    // Role definitions
    roles: {
        borrower: {
            name: 'Borrower',
            permissions: [
                'request_loan',
                'view_own_loans',
                'view_groups',
                'join_group',
                'rate_lender',
                'update_profile'
            ],
            limits: {
                maxGroups: 4,
                maxActiveLoans: 1,
                maxLoanAmount: {
                    basic: 1500,
                    premium: 5000,
                    super: 20000
                }
            }
        },
        lender: {
            name: 'Lender',
            permissions: [
                'approve_loan',
                'create_ledger',
                'update_ledger',
                'rate_borrower',
                'blacklist_borrower',
                'view_borrowers',
                'update_profile',
                'manage_subscription'
            ],
            requirements: {
                subscription: true,
                verification: true
            }
        },
        admin: {
            name: 'Administrator',
            permissions: [
                'manage_users',
                'manage_groups',
                'manage_blacklist',
                'override_ledgers',
                'manage_subscriptions',
                'view_reports',
                'system_settings'
            ]
        },
        both: {
            name: 'Both Borrower & Lender',
            permissions: [
                'request_loan',
                'view_own_loans',
                'view_groups',
                'join_group',
                'rate_lender',
                'approve_loan',
                'create_ledger',
                'update_ledger',
                'rate_borrower',
                'blacklist_borrower',
                'view_borrowers',
                'update_profile',
                'manage_subscription'
            ]
        }
    },

    // Current user's role
    currentRole: null,

    // Initialize roles module
    init() {
        console.log('Pesewa Roles Initializing...');
        
        // Get current user from auth
        this.loadCurrentUser();
        
        // Setup role switching
        this.setupRoleSwitching();
        
        // Apply role-based UI
        this.applyRoleBasedUI();
        
        console.log('Pesewa Roles Initialized');
    },

    // Load current user from auth
    loadCurrentUser() {
        if (typeof PesewaAuth !== 'undefined' && PesewaAuth.currentUser) {
            this.currentRole = PesewaAuth.currentUser.type || 'borrower';
        } else {
            // Check localStorage as fallback
            const userData = localStorage.getItem('pesewa_user');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    this.currentRole = user.type || 'borrower';
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    this.currentRole = 'borrower';
                }
            }
        }
    },

    // Setup role switching functionality
    setupRoleSwitching() {
        // Role switch buttons in dashboard
        const roleSwitchButtons = document.querySelectorAll('[data-switch-role]');
        
        roleSwitchButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetRole = button.getAttribute('data-switch-role');
                this.switchUserRole(targetRole);
            });
        });
        
        // Role tabs in registration
        const roleTabs = document.querySelectorAll('.role-tab');
        roleTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const role = tab.getAttribute('data-role');
                this.showRoleForm(role);
            });
        });
    },

    // Apply role-based UI changes
    applyRoleBasedUI() {
        if (!this.currentRole) return;
        
        // Show/hide role-specific elements
        this.toggleRoleElements();
        
        // Update dashboard based on role
        this.updateDashboardForRole();
        
        // Update navigation based on role
        this.updateNavigationForRole();
        
        // Apply role-specific styling
        this.applyRoleStyling();
    },

    // Switch user role
    switchUserRole(newRole) {
        if (!this.roles[newRole]) {
            console.error('Invalid role:', newRole);
            return;
        }
        
        // Check if user can switch to this role
        if (!this.canSwitchToRole(newRole)) {
            this.showRoleSwitchError('You cannot switch to this role at this time');
            return;
        }
        
        // Update current role
        const oldRole = this.currentRole;
        this.currentRole = newRole;
        
        // Update user data in localStorage
        this.updateUserRoleInStorage(newRole);
        
        // Update UI
        this.applyRoleBasedUI();
        
        // Show success message
        this.showRoleSwitchSuccess(`Switched to ${this.roles[newRole].name} role`);
        
        // Emit role change event
        this.emitRoleChange(oldRole, newRole);
        
        // Refresh dashboard if needed
        if (window.location.pathname.includes('dashboard')) {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    },

    // Check if user can switch to a role
    canSwitchToRole(newRole) {
        const user = this.getCurrentUser();
        
        // If not authenticated, can only be borrower
        if (!user && newRole !== 'borrower') {
            return false;
        }
        
        // Special handling for "both" role
        if (newRole === 'both') {
            // Check if user is eligible for both roles
            return this.isEligibleForBothRoles();
        }
        
        // Check lender requirements
        if (newRole === 'lender') {
            return this.meetsLenderRequirements();
        }
        
        // Check admin requirements
        if (newRole === 'admin') {
            return this.isAdminUser();
        }
        
        return true;
    },

    // Check if user is eligible for both roles
    isEligibleForBothRoles() {
        const user = this.getCurrentUser();
        
        // For new users, they can register as both
        if (!user) {
            return true;
        }
        
        // Existing users need to meet both role requirements
        const canBeBorrower = true; // Anyone can be borrower
        const canBeLender = this.meetsLenderRequirements();
        
        return canBeBorrower && canBeLender;
    },

    // Check if user meets lender requirements
    meetsLenderRequirements() {
        const user = this.getCurrentUser();
        
        if (!user) return false;
        
        // Check if user already has lender profile
        if (user.type === 'lender' || user.type === 'both') {
            return true;
        }
        
        // Check borrower rating (must be at least 3 stars)
        if (user.rating && user.rating < 3) {
            return false;
        }
        
        // Check if user has any blacklist history
        if (user.blacklisted || user.blacklistHistory) {
            return false;
        }
        
        // Check completed loans (at least 3 successful loans)
        if (user.completedLoans && user.completedLoans < 3) {
            return false;
        }
        
        return true;
    },

    // Check if user is admin
    isAdminUser() {
        const user = this.getCurrentUser();
        return user && user.type === 'admin';
    },

    // Show role form based on selected role
    showRoleForm(role) {
        const forms = document.querySelectorAll('.registration-form');
        const tabs = document.querySelectorAll('.role-tab');
        
        // Update active tabs
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

    // Toggle role-specific UI elements
    toggleRoleElements() {
        const role = this.currentRole;
        
        // Show elements for current role
        document.querySelectorAll(`[data-role="${role}"]`).forEach(el => {
            el.style.display = 'block';
        });
        
        // Hide elements for other roles
        Object.keys(this.roles).forEach(otherRole => {
            if (otherRole !== role) {
                document.querySelectorAll(`[data-role="${otherRole}"]`).forEach(el => {
                    el.style.display = 'none';
                });
            }
        });
        
        // Show elements visible to all authenticated users
        if (this.isAuthenticated()) {
            document.querySelectorAll('[data-role="authenticated"]').forEach(el => {
                el.style.display = 'block';
            });
        }
    },

    // Update dashboard for current role
    updateDashboardForRole() {
        const dashboard = document.querySelector('.dashboard');
        if (!dashboard) return;
        
        // Update dashboard title and description
        const title = dashboard.querySelector('.dashboard-title');
        const description = dashboard.querySelector('.dashboard-description');
        
        if (title) {
            const roleName = this.roles[this.currentRole]?.name || 'User';
            title.textContent = `${roleName} Dashboard`;
        }
        
        if (description) {
            description.textContent = this.getRoleDescription(this.currentRole);
        }
        
        // Update quick stats based on role
        this.updateDashboardStats();
        
        // Update action buttons
        this.updateDashboardActions();
    },

    // Update navigation for current role
    updateNavigationForRole() {
        const navLinks = document.querySelectorAll('.nav-link, .sidebar-link');
        
        navLinks.forEach(link => {
            const roleRestriction = link.getAttribute('data-requires-role');
            
            if (roleRestriction) {
                const requiredRoles = roleRestriction.split(',');
                const hasAccess = requiredRoles.includes(this.currentRole) || 
                                 (this.currentRole === 'both' && requiredRoles.some(r => r === 'borrower' || r === 'lender'));
                
                link.style.display = hasAccess ? 'block' : 'none';
            }
        });
    },

    // Apply role-specific styling
    applyRoleStyling() {
        const role = this.currentRole;
        
        // Remove existing role classes
        document.body.classList.remove('role-borrower', 'role-lender', 'role-admin', 'role-both');
        
        // Add current role class
        document.body.classList.add(`role-${role}`);
        
        // Update color accents based on role
        this.updateRoleColors();
    },

    // Update role-specific colors
    updateRoleColors() {
        const roleColors = {
            borrower: '#20BF6F', // Green
            lender: '#0A65FC',   // Blue
            admin: '#FF9F1C',    // Orange
            both: '#9B51E0'      // Purple (mix of green and blue)
        };
        
        const color = roleColors[this.currentRole] || roleColors.borrower;
        
        // Update CSS variables
        document.documentElement.style.setProperty('--role-primary', color);
        document.documentElement.style.setProperty('--role-light', this.lightenColor(color, 40));
        document.documentElement.style.setProperty('--role-dark', this.darkenColor(color, 20));
    },

    // Lighten a color
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return "#" + (
            0x1000000 + 
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    },

    // Darken a color
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        
        return "#" + (
            0x1000000 + 
            (R > 0 ? R : 0) * 0x10000 + 
            (G > 0 ? G : 0) * 0x100 + 
            (B > 0 ? B : 0)
        ).toString(16).slice(1);
    },

    // Update dashboard statistics
    updateDashboardStats() {
        const user = this.getCurrentUser();
        if (!user) return;
        
        // Update stat cards
        const statCards = document.querySelectorAll('.stat-card, .quick-stat');
        
        statCards.forEach(card => {
            const statType = card.getAttribute('data-stat');
            if (!statType) return;
            
            const valueElement = card.querySelector('.stat-value, .value');
            if (!valueElement) return;
            
            let value = '';
            
            switch (statType) {
                case 'total_borrowed':
                    value = this.formatCurrency(user.totalBorrowed || 0);
                    break;
                case 'active_loans':
                    value = user.activeLoans || 0;
                    break;
                case 'completed_loans':
                    value = user.completedLoans || 0;
                    break;
                case 'rating':
                    value = user.rating ? `${user.rating}/5` : '5/5';
                    break;
                case 'total_lent':
                    value = this.formatCurrency(user.totalLent || 0);
                    break;
                case 'total_borrowers':
                    value = user.totalBorrowers || 0;
                    break;
                case 'profit':
                    value = this.formatCurrency(user.profit || 0);
                    break;
                case 'groups':
                    value = user.groups?.length || 0;
                    break;
                default:
                    value = '0';
            }
            
            valueElement.textContent = value;
        });
    },

    // Update dashboard action buttons
    updateDashboardActions() {
        const actionButtons = document.querySelectorAll('.dashboard-action');
        
        actionButtons.forEach(button => {
            const action = button.getAttribute('data-action');
            const requiredRole = button.getAttribute('data-requires-role');
            
            // Check if button should be visible
            const shouldShow = !requiredRole || requiredRole === this.currentRole || 
                             (this.currentRole === 'both' && (requiredRole === 'borrower' || requiredRole === 'lender'));
            
            button.style.display = shouldShow ? 'block' : 'none';
            
            // Update button text and icons based on role
            if (shouldShow) {
                this.customizeActionButton(button, action);
            }
        });
    },

    // Customize action button based on role
    customizeActionButton(button, action) {
        const roleConfigs = {
            borrower: {
                request_loan: { text: 'Request New Loan', icon: '📝', class: 'btn-success' },
                view_loans: { text: 'My Loans', icon: '💰', class: 'btn-primary' },
                join_group: { text: 'Join Group', icon: '👥', class: 'btn-outline' }
            },
            lender: {
                approve_loans: { text: 'Approve Loans', icon: '✅', class: 'btn-success' },
                view_ledgers: { text: 'My Ledgers', icon: '📊', class: 'btn-primary' },
                manage_borrowers: { text: 'Borrowers', icon: '👥', class: 'btn-outline' }
            },
            admin: {
                manage_users: { text: 'Manage Users', icon: '👥', class: 'btn-primary' },
                view_reports: { text: 'Reports', icon: '📈', class: 'btn-success' },
                system_settings: { text: 'Settings', icon: '⚙️', class: 'btn-outline' }
            }
        };
        
        const config = roleConfigs[this.currentRole]?.[action];
        if (config) {
            button.innerHTML = `<span class="btn-icon">${config.icon}</span> ${config.text}`;
            button.className = `btn ${config.class}`;
        }
    },

    // Get role description
    getRoleDescription(role) {
        const descriptions = {
            borrower: 'Manage your emergency loans, track repayments, and build your reputation',
            lender: 'Lend to trusted borrowers, manage ledgers, and earn weekly returns',
            admin: 'Monitor platform activity, manage users, and ensure system integrity',
            both: 'Switch between borrowing and lending to maximize financial flexibility'
        };
        
        return descriptions[role] || 'Manage your account and activities';
    },

    // Update user role in storage
    updateUserRoleInStorage(newRole) {
        const userData = localStorage.getItem('pesewa_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                user.type = newRole;
                localStorage.setItem('pesewa_user', JSON.stringify(user));
                
                // Update in auth module if available
                if (typeof PesewaAuth !== 'undefined' && PesewaAuth.currentUser) {
                    PesewaAuth.currentUser.type = newRole;
                }
            } catch (error) {
                console.error('Error updating user role:', error);
            }
        }
    },

    // Get current user
    getCurrentUser() {
        if (typeof PesewaAuth !== 'undefined') {
            return PesewaAuth.currentUser;
        }
        
        const userData = localStorage.getItem('pesewa_user');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        
        return null;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },

    // Check permission for current user
    hasPermission(permission) {
        if (!this.currentRole || !this.roles[this.currentRole]) {
            return false;
        }
        
        return this.roles[this.currentRole].permissions.includes(permission);
    },

    // Get user's loan limits
    getLoanLimits() {
        if (this.currentRole !== 'borrower' && this.currentRole !== 'both') {
            return null;
        }
        
        const user = this.getCurrentUser();
        const tier = user?.tier || 'basic';
        
        return {
            maxAmount: this.roles.borrower.limits.maxLoanAmount[tier] || 1500,
            maxGroups: this.roles.borrower.limits.maxGroups,
            maxActiveLoans: this.roles.borrower.limits.maxActiveLoans
        };
    },

    // Format currency
    formatCurrency(amount) {
        return `₵${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    },

    // Show role switch error
    showRoleSwitchError(message) {
        const notification = document.createElement('div');
        notification.className = 'role-notification error';
        notification.innerHTML = `
            <strong>Cannot Switch Role:</strong> ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; cursor: pointer;">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: var(--warning-background);
            color: var(--gentle-alert);
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid var(--gentle-alert);
            z-index: 9999;
            max-width: 400px;
            animation: fadeInUp 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    },

    // Show role switch success
    showRoleSwitchSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'role-notification success';
        notification.innerHTML = `
            <strong>Role Updated:</strong> ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; cursor: pointer;">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: var(--trust-mint);
            color: var(--stability-green);
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid var(--mutual-green);
            z-index: 9999;
            max-width: 400px;
            animation: fadeInUp 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    },

    // Emit role change event
    emitRoleChange(oldRole, newRole) {
        const event = new CustomEvent('roleChanged', {
            detail: { oldRole, newRole, user: this.getCurrentUser() }
        });
        document.dispatchEvent(event);
    },

    // Get all available roles for current user
    getAvailableRoles() {
        const roles = ['borrower']; // Everyone can be borrower
        
        if (this.meetsLenderRequirements()) {
            roles.push('lender');
        }
        
        if (this.isEligibleForBothRoles()) {
            roles.push('both');
        }
        
        if (this.isAdminUser()) {
            roles.push('admin');
        }
        
        return roles;
    }
};

// Initialize roles when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PesewaRoles.init());
} else {
    PesewaRoles.init();
}

// Export for use in other modules
window.PesewaRoles = PesewaRoles;