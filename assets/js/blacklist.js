'use strict';

// Pesewa.com - Blacklist Management Module

// Blacklist state
const BlacklistState = {
    blacklistedUsers: [],
    pendingReports: [],
    blacklistRules: {
        defaultStrikeLimit: 3,
        autoBlacklistThreshold: 5,
        reviewRequired: true,
        appealPeriod: 30 // days
    },
    userStrikes: {}
};

// Blacklist reasons
const BlacklistReasons = {
    LATE_REPAYMENT: 'late_repayment',
    DEFAULT: 'default',
    FRAUD: 'fraud',
    HARASSMENT: 'harassment',
    TERMS_VIOLATION: 'terms_violation',
    MULTIPLE_ACCOUNTS: 'multiple_accounts',
    OTHER: 'other'
};

// Report status
const ReportStatus = {
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    APPEALED: 'appealed'
};

// Blacklist levels
const BlacklistLevel = {
    WARNING: 'warning',
    TEMPORARY: 'temporary',
    PERMANENT: 'permanent'
};

// Initialize blacklist module
function initBlacklist() {
    console.log('Blacklist: Initializing blacklist management module...');
    
    // Load blacklist state
    loadBlacklistState();
    
    // Initialize blacklist UI
    initBlacklistUI();
    
    // Initialize blacklist event listeners
    initBlacklistEvents();
    
    // Load blacklisted users
    loadBlacklistedUsers();
    
    // Load pending reports
    loadPendingReports();
    
    // Update blacklist stats
    updateBlacklistStats();
}

// Load blacklist state from localStorage
function loadBlacklistState() {
    try {
        const savedState = localStorage.getItem('pesewa_blacklist');
        if (savedState) {
            const state = JSON.parse(savedState);
            Object.assign(BlacklistState, state);
            console.log('Blacklist: Loaded blacklist state from localStorage');
        } else {
            // Initialize with default state
            initializeDefaultBlacklistState();
        }
    } catch (error) {
        console.error('Blacklist: Error loading blacklist state:', error);
        initializeDefaultBlacklistState();
    }
}

// Initialize default blacklist state
function initializeDefaultBlacklistState() {
    BlacklistState.blacklistedUsers = [];
    BlacklistState.pendingReports = [];
    BlacklistState.blacklistRules = {
        defaultStrikeLimit: 3,
        autoBlacklistThreshold: 5,
        reviewRequired: true,
        appealPeriod: 30
    };
    BlacklistState.userStrikes = {};
}

// Save blacklist state to localStorage
function saveBlacklistState() {
    try {
        localStorage.setItem('pesewa_blacklist', JSON.stringify(BlacklistState));
        console.log('Blacklist: Saved blacklist state');
    } catch (error) {
        console.error('Blacklist: Error saving blacklist state:', error);
    }
}

// Initialize blacklist UI
function initBlacklistUI() {
    // Initialize blacklist tabs
    initBlacklistTabs();
    
    // Initialize report user modal
    initReportUserModal();
    
    // Initialize appeal modal
    initAppealModal();
    
    // Initialize blacklist filters
    initBlacklistFilters();
    
    // Initialize rules configuration
    initRulesConfiguration();
}

// Initialize blacklist tabs
function initBlacklistTabs() {
    const blacklistTabs = document.querySelectorAll('.blacklist-tab');
    
    blacklistTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab
            blacklistTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            showBlacklistTab(targetTab);
        });
    });
    
    // Set initial active tab
    const initialTab = document.querySelector('.blacklist-tab.active');
    if (initialTab) {
        const initialTabId = initialTab.getAttribute('data-tab');
        showBlacklistTab(initialTabId);
    }
}

// Show blacklist tab content
function showBlacklistTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.blacklist-tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected tab content
    const targetContent = document.getElementById(`${tabId}Tab`);
    if (targetContent) {
        targetContent.style.display = 'block';
        
        // Load content based on tab
        switch(tabId) {
            case 'blacklisted':
                loadBlacklistedUsersList();
                break;
            case 'reports':
                loadReportsList();
                break;
            case 'strikes':
                loadUserStrikes();
                break;
            case 'appeals':
                loadAppealsList();
                break;
            case 'rules':
                loadRulesConfiguration();
                break;
        }
    }
}

// Initialize report user modal
function initReportUserModal() {
    const reportUserBtn = document.getElementById('reportUserBtn');
    const reportUserModal = document.getElementById('reportUserModal');
    const closeReportUser = document.getElementById('closeReportUser');
    
    if (reportUserBtn && reportUserModal) {
        reportUserBtn.addEventListener('click', function() {
            reportUserModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeReportUser) {
        closeReportUser.addEventListener('click', function() {
            reportUserModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close modal on outside click
    if (reportUserModal) {
        reportUserModal.addEventListener('click', function(e) {
            if (e.target === reportUserModal) {
                reportUserModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Report user form submission
    const reportUserForm = document.getElementById('reportUserForm');
    if (reportUserForm) {
        reportUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleReportUser();
        });
    }
}

// Initialize appeal modal
function initAppealModal() {
    const appealModal = document.getElementById('appealModal');
    const closeAppeal = document.getElementById('closeAppeal');
    
    if (closeAppeal) {
        closeAppeal.addEventListener('click', function() {
            appealModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close modal on outside click
    if (appealModal) {
        appealModal.addEventListener('click', function(e) {
            if (e.target === appealModal) {
                appealModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Appeal form submission
    const appealForm = document.getElementById('appealForm');
    if (appealForm) {
        appealForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAppeal();
        });
    }
}

// Initialize blacklist filters
function initBlacklistFilters() {
    const blacklistFilters = document.querySelectorAll('.blacklist-filter');
    
    blacklistFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            applyBlacklistFilters();
        });
    });
}

// Initialize rules configuration
function initRulesConfiguration() {
    const rulesForm = document.getElementById('blacklistRulesForm');
    if (rulesForm) {
        rulesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveBlacklistRules();
        });
    }
}

// Initialize blacklist event listeners
function initBlacklistEvents() {
    // View user details buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.view-user-btn')) {
            const button = e.target.closest('.view-user-btn');
            const userId = button.getAttribute('data-user-id');
            viewUserDetails(userId);
        }
        
        // Remove from blacklist buttons
        if (e.target.closest('.remove-blacklist-btn')) {
            const button = e.target.closest('.remove-blacklist-btn');
            const userId = button.getAttribute('data-user-id');
            removeFromBlacklist(userId);
        }
        
        // Review report buttons
        if (e.target.closest('.review-report-btn')) {
            const button = e.target.closest('.review-report-btn');
            const reportId = button.getAttribute('data-report-id');
            reviewReport(reportId);
        }
        
        // Appeal blacklist buttons
        if (e.target.closest('.appeal-blacklist-btn')) {
            const button = e.target.closest('.appeal-blacklist-btn');
            const userId = button.getAttribute('data-user-id');
            openAppealModal(userId);
        }
        
        // Add strike buttons
        if (e.target.closest('.add-strike-btn')) {
            const button = e.target.closest('.add-strike-btn');
            const userId = button.getAttribute('data-user-id');
            addStrikeToUser(userId);
        }
        
        // Remove strike buttons
        if (e.target.closest('.remove-strike-btn')) {
            const button = e.target.closest('.remove-strike-btn');
            const strikeId = button.getAttribute('data-strike-id');
            removeStrike(strikeId);
        }
    });
}

// Load blacklisted users
function loadBlacklistedUsers() {
    // In a real app, this would fetch from API
    const demoBlacklistedUsers = [
        {
            id: 'user_bl_1',
            userId: 'user_101',
            name: 'John Doe',
            phone: '+233501234567',
            email: 'john.doe@example.com',
            role: 'borrower',
            blacklistedAt: '2024-01-10',
            blacklistedBy: 'admin_1',
            level: BlacklistLevel.TEMPORARY,
            reason: BlacklistReasons.LATE_REPAYMENT,
            duration: 90, // days
            expiresAt: '2024-04-10',
            strikes: 3,
            totalDefaults: 2,
            appealStatus: 'none',
            notes: 'Multiple late repayments across 3 different loans'
        },
        {
            id: 'user_bl_2',
            userId: 'user_102',
            name: 'Jane Smith',
            phone: '+233501234568',
            email: 'jane.smith@example.com',
            role: 'lender',
            blacklistedAt: '2024-01-05',
            blacklistedBy: 'system',
            level: BlacklistLevel.WARNING,
            reason: BlacklistReasons.TERMS_VIOLATION,
            duration: 30,
            expiresAt: '2024-02-05',
            strikes: 2,
            totalDefaults: 0,
            appealStatus: 'pending',
            notes: 'Violated lending terms by charging excessive interest'
        },
        {
            id: 'user_bl_3',
            userId: 'user_103',
            name: 'Robert Johnson',
            phone: '+233501234569',
            email: 'robert.j@example.com',
            role: 'borrower',
            blacklistedAt: '2023-12-15',
            blacklistedBy: 'admin_2',
            level: BlacklistLevel.PERMANENT,
            reason: BlacklistReasons.FRAUD,
            duration: 0, // permanent
            expiresAt: null,
            strikes: 5,
            totalDefaults: 3,
            appealStatus: 'rejected',
            notes: 'Fraudulent identity documents and loan applications'
        }
    ];
    
    BlacklistState.blacklistedUsers = demoBlacklistedUsers;
    console.log('Blacklist: Loaded blacklisted users:', BlacklistState.blacklistedUsers.length);
}

// Load blacklisted users list
function loadBlacklistedUsersList() {
    const container = document.getElementById('blacklistedUsersList');
    if (!container) return;
    
    if (BlacklistState.blacklistedUsers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🚫</div>
                <h3>No Blacklisted Users</h3>
                <p>There are no blacklisted users at the moment.</p>
            </div>
        `;
        return;
    }
    
    let usersHTML = '<div class="blacklisted-users-grid">';
    
    BlacklistState.blacklistedUsers.forEach(user => {
        const isExpired = user.expiresAt && new Date(user.expiresAt) < new Date();
        const daysRemaining = user.expiresAt ? calculateDaysRemaining(user.expiresAt) : null;
        
        usersHTML += `
            <div class="blacklisted-user-card ${user.level} ${isExpired ? 'expired' : ''}">
                <div class="user-header">
                    <div class="user-level-badge ${user.level}">
                        ${user.level.toUpperCase()}
                    </div>
                    <div class="user-role-badge ${user.role}">
                        ${user.role.toUpperCase()}
                    </div>
                </div>
                
                <div class="user-body">
                    <h3 class="user-name">${user.name}</h3>
                    
                    <div class="user-contact">
                        <div class="contact-item">
                            <span class="contact-label">📞</span>
                            <span class="contact-value">${user.phone}</span>
                        </div>
                        <div class="contact-item">
                            <span class="contact-label">✉️</span>
                            <span class="contact-value">${user.email}</span>
                        </div>
                    </div>
                    
                    <div class="blacklist-details">
                        <div class="detail-item">
                            <span class="detail-label">Blacklisted:</span>
                            <span class="detail-value">${formatDate(user.blacklistedAt)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Reason:</span>
                            <span class="detail-value">${formatReason(user.reason)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Strikes:</span>
                            <span class="detail-value">
                                <span class="strike-count ${user.strikes >= 3 ? 'high' : ''}">
                                    ${user.strikes}
                                </span>
                            </span>
                        </div>
                        ${user.expiresAt ? `
                            <div class="detail-item">
                                <span class="detail-label">Expires:</span>
                                <span class="detail-value ${daysRemaining <= 7 ? 'text-warning' : ''}">
                                    ${formatDate(user.expiresAt)}
                                    ${daysRemaining > 0 ? `(${daysRemaining} days)` : 'Expired'}
                                </span>
                            </div>
                        ` : `
                            <div class="detail-item">
                                <span class="detail-label">Duration:</span>
                                <span class="detail-value text-danger">Permanent</span>
                            </div>
                        `}
                    </div>
                    
                    <div class="user-notes">
                        <strong>Notes:</strong>
                        <p>${user.notes}</p>
                    </div>
                </div>
                
                <div class="user-footer">
                    <button class="btn btn-outline-secondary view-user-btn" data-user-id="${user.userId}">
                        View Details
                    </button>
                    ${user.level !== BlacklistLevel.PERMANENT ? `
                        <button class="btn btn-danger remove-blacklist-btn" data-user-id="${user.id}">
                            Remove
                        </button>
                    ` : ''}
                    ${user.appealStatus === 'none' ? `
                        <button class="btn btn-warning appeal-blacklist-btn" data-user-id="${user.id}">
                            Appeal
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    usersHTML += '</div>';
    container.innerHTML = usersHTML;
}

// Load pending reports
function loadPendingReports() {
    // In a real app, this would fetch from API
    const demoReports = [
        {
            id: 'report_1',
            reportedUserId: 'user_201',
            reportedUserName: 'Michael Brown',
            reportedUserRole: 'borrower',
            reporterId: 'user_202',
            reporterName: 'Sarah Wilson',
            reporterRole: 'lender',
            reason: BlacklistReasons.LATE_REPAYMENT,
            description: 'Borrower has been consistently late on repayments for 3 consecutive loans',
            evidence: ['loan_101', 'loan_102', 'loan_103'],
            submittedAt: '2024-01-14',
            status: ReportStatus.PENDING,
            priority: 'high',
            previousStrikes: 2
        },
        {
            id: 'report_2',
            reportedUserId: 'user_203',
            reportedUserName: 'David Miller',
            reportedUserRole: 'lender',
            reporterId: 'user_204',
            reporterName: 'Lisa Taylor',
            reporterRole: 'borrower',
            reason: BlacklistReasons.HARASSMENT,
            description: 'Lender has been sending threatening messages for late payment',
            evidence: ['message_1.png', 'message_2.png'],
            submittedAt: '2024-01-13',
            status: ReportStatus.UNDER_REVIEW,
            priority: 'medium',
            previousStrikes: 1
        },
        {
            id: 'report_3',
            reportedUserId: 'user_205',
            reportedUserName: 'Thomas Anderson',
            reportedUserRole: 'borrower',
            reporterId: 'system',
            reporterName: 'System Auto-Report',
            reporterRole: 'system',
            reason: BlacklistReasons.MULTIPLE_ACCOUNTS,
            description: 'User detected with multiple accounts using same identity documents',
            evidence: ['account_1', 'account_2'],
            submittedAt: '2024-01-12',
            status: ReportStatus.PENDING,
            priority: 'high',
            previousStrikes: 0
        }
    ];
    
    BlacklistState.pendingReports = demoReports;
    console.log('Blacklist: Loaded pending reports:', BlacklistState.pendingReports.length);
}

// Load reports list
function loadReportsList() {
    const container = document.getElementById('reportsList');
    if (!container) return;
    
    if (BlacklistState.pendingReports.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No Pending Reports</h3>
                <p>There are no pending reports at the moment.</p>
            </div>
        `;
        return;
    }
    
    let reportsHTML = '<div class="reports-grid">';
    
    BlacklistState.pendingReports.forEach(report => {
        reportsHTML += `
            <div class="report-card ${report.priority}">
                <div class="report-header">
                    <div class="report-priority-badge ${report.priority}">
                        ${report.priority.toUpperCase()}
                    </div>
                    <div class="report-status ${report.status}">
                        ${report.status.replace('_', ' ').toUpperCase()}
                    </div>
                </div>
                
                <div class="report-body">
                    <div class="report-parties">
                        <div class="party reported">
                            <div class="party-label">Reported:</div>
                            <div class="party-name">${report.reportedUserName}</div>
                            <div class="party-role">${report.reportedUserRole}</div>
                        </div>
                        <div class="party reporter">
                            <div class="party-label">Reporter:</div>
                            <div class="party-name">${report.reporterName}</div>
                            <div class="party-role">${report.reporterRole}</div>
                        </div>
                    </div>
                    
                    <div class="report-details">
                        <div class="detail-item">
                            <span class="detail-label">Reason:</span>
                            <span class="detail-value">${formatReason(report.reason)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Submitted:</span>
                            <span class="detail-value">${formatDate(report.submittedAt)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Previous Strikes:</span>
                            <span class="detail-value">${report.previousStrikes}</span>
                        </div>
                    </div>
                    
                    <div class="report-description">
                        <strong>Description:</strong>
                        <p>${report.description}</p>
                    </div>
                    
                    ${report.evidence && report.evidence.length > 0 ? `
                        <div class="report-evidence">
                            <strong>Evidence:</strong>
                            <div class="evidence-list">
                                ${report.evidence.map(item => `
                                    <span class="evidence-item">${item}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="report-footer">
                    <button class="btn btn-outline-secondary" onclick="viewReportDetails('${report.id}')">
                        View Details
                    </button>
                    ${report.status === ReportStatus.PENDING || report.status === ReportStatus.UNDER_REVIEW ? `
                        <button class="btn btn-primary review-report-btn" data-report-id="${report.id}">
                            Review
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    reportsHTML += '</div>';
    container.innerHTML = reportsHTML;
}

// Load user strikes
function loadUserStrikes() {
    const container = document.getElementById('userStrikesList');
    if (!container) return;
    
    // In a real app, this would fetch from API
    const demoStrikes = [
        {
            id: 'strike_1',
            userId: 'user_301',
            userName: 'Emily Clark',
            userRole: 'borrower',
            reason: BlacklistReasons.LATE_REPAYMENT,
            issuedBy: 'admin_1',
            issuedAt: '2024-01-14',
            expiresAt: '2024-04-14',
            severity: 'medium',
            notes: 'Loan #LOAN-101 was 7 days late',
            status: 'active'
        },
        {
            id: 'strike_2',
            userId: 'user_302',
            userName: 'James Wilson',
            userRole: 'lender',
            reason: BlacklistReasons.TERMS_VIOLATION,
            issuedBy: 'system',
            issuedAt: '2024-01-13',
            expiresAt: '2024-02-13',
            severity: 'low',
            notes: 'Attempted to charge above maximum interest rate',
            status: 'active'
        },
        {
            id: 'strike_3',
            userId: 'user_303',
            userName: 'Olivia Martinez',
            userRole: 'borrower',
            reason: BlacklistReasons.DEFAULT,
            issuedBy: 'admin_2',
            issuedAt: '2024-01-10',
            expiresAt: '2024-07-10',
            severity: 'high',
            notes: 'Defaulted on loan #LOAN-205 (₵2,500)',
            status: 'expired'
        }
    ];
    
    if (demoStrikes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3>No User Strikes</h3>
                <p>There are no active user strikes at the moment.</p>
            </div>
        `;
        return;
    }
    
    let strikesHTML = '<div class="strikes-table-container"><table class="strikes-table"><thead><tr>';
    strikesHTML += '<th>User</th><th>Reason</th><th>Issued</th><th>Expires</th><th>Severity</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
    
    demoStrikes.forEach(strike => {
        const isExpired = new Date(strike.expiresAt) < new Date();
        
        strikesHTML += `
            <tr class="${strike.status} ${isExpired ? 'expired' : ''}">
                <td>
                    <div class="strike-user">
                        <div class="user-name">${strike.userName}</div>
                        <div class="user-role ${strike.userRole}">${strike.userRole}</div>
                    </div>
                </td>
                <td>
                    <span class="strike-reason">${formatReason(strike.reason)}</span>
                </td>
                <td>${formatDate(strike.issuedAt)}</td>
                <td>${formatDate(strike.expiresAt)}</td>
                <td>
                    <span class="severity-badge ${strike.severity}">
                        ${strike.severity.toUpperCase()}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${strike.status}">
                        ${strike.status.toUpperCase()}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary" onclick="viewStrikeDetails('${strike.id}')">
                        View
                    </button>
                    ${strike.status === 'active' ? `
                        <button class="btn btn-sm btn-danger remove-strike-btn" data-strike-id="${strike.id}">
                            Remove
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    
    strikesHTML += '</tbody></table></div>';
    container.innerHTML = strikesHTML;
}

// Load appeals list
function loadAppealsList() {
    const container = document.getElementById('appealsList');
    if (!container) return;
    
    // In a real app, this would fetch from API
    const demoAppeals = [
        {
            id: 'appeal_1',
            userId: 'user_bl_2',
            userName: 'Jane Smith',
            blacklistId: 'user_bl_2',
            submittedAt: '2024-01-08',
            reason: 'The late repayments were due to unexpected medical expenses',
            evidence: ['medical_bill.pdf'],
            status: 'pending',
            reviewedBy: null,
            reviewedAt: null,
            decision: null,
            decisionNotes: null
        },
        {
            id: 'appeal_2',
            userId: 'user_401',
            userName: 'Daniel White',
            blacklistId: 'user_bl_4',
            submittedAt: '2024-01-06',
            reason: 'The system incorrectly flagged my account',
            evidence: ['id_document.png'],
            status: 'approved',
            reviewedBy: 'admin_1',
            reviewedAt: '2024-01-07',
            decision: 'approved',
            decisionNotes: 'User provided valid documentation, blacklist lifted'
        }
    ];
    
    if (demoAppeals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No Appeals</h3>
                <p>There are no pending appeals at the moment.</p>
            </div>
        `;
        return;
    }
    
    let appealsHTML = '<div class="appeals-grid">';
    
    demoAppeals.forEach(appeal => {
        appealsHTML += `
            <div class="appeal-card ${appeal.status}">
                <div class="appeal-header">
                    <div class="appeal-status-badge ${appeal.status}">
                        ${appeal.status.toUpperCase()}
                    </div>
                    ${appeal.decision ? `
                        <div class="appeal-decision ${appeal.decision}">
                            ${appeal.decision.toUpperCase()}
                        </div>
                    ` : ''}
                </div>
                
                <div class="appeal-body">
                    <div class="appeal-user">
                        <h4>${appeal.userName}</h4>
                        <div class="appeal-submitted">
                            Submitted: ${formatDate(appeal.submittedAt)}
                        </div>
                    </div>
                    
                    <div class="appeal-reason">
                        <strong>Appeal Reason:</strong>
                        <p>${appeal.reason}</p>
                    </div>
                    
                    ${appeal.evidence && appeal.evidence.length > 0 ? `
                        <div class="appeal-evidence">
                            <strong>Evidence:</strong>
                            <div class="evidence-list">
                                ${appeal.evidence.map(item => `
                                    <span class="evidence-item">${item}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${appeal.reviewedBy ? `
                        <div class="appeal-review">
                            <div class="review-detail">
                                <span class="detail-label">Reviewed By:</span>
                                <span class="detail-value">${appeal.reviewedBy}</span>
                            </div>
                            <div class="review-detail">
                                <span class="detail-label">Reviewed At:</span>
                                <span class="detail-value">${formatDate(appeal.reviewedAt)}</span>
                            </div>
                            ${appeal.decisionNotes ? `
                                <div class="review-notes">
                                    <strong>Decision Notes:</strong>
                                    <p>${appeal.decisionNotes}</p>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
                
                <div class="appeal-footer">
                    ${appeal.status === 'pending' ? `
                        <button class="btn btn-success" onclick="approveAppeal('${appeal.id}')">
                            Approve
                        </button>
                        <button class="btn btn-danger" onclick="rejectAppeal('${appeal.id}')">
                            Reject
                        </button>
                    ` : ''}
                    <button class="btn btn-outline-secondary" onclick="viewAppealDetails('${appeal.id}')">
                        View Details
                    </button>
                </div>
            </div>
        `;
    });
    
    appealsHTML += '</div>';
    container.innerHTML = appealsHTML;
}

// Load rules configuration
function loadRulesConfiguration() {
    const rulesForm = document.getElementById('blacklistRulesForm');
    if (!rulesForm) return;
    
    const rules = BlacklistState.blacklistRules;
    
    // Set form values
    const strikeLimit = document.getElementById('strikeLimit');
    const autoBlacklistThreshold = document.getElementById('autoBlacklistThreshold');
    const reviewRequired = document.getElementById('reviewRequired');
    const appealPeriod = document.getElementById('appealPeriod');
    
    if (strikeLimit) strikeLimit.value = rules.defaultStrikeLimit;
    if (autoBlacklistThreshold) autoBlacklistThreshold.value = rules.autoBlacklistThreshold;
    if (reviewRequired) reviewRequired.checked = rules.reviewRequired;
    if (appealPeriod) appealPeriod.value = rules.appealPeriod;
}

// Apply blacklist filters
function applyBlacklistFilters() {
    const levelFilter = document.getElementById('filterLevel');
    const reasonFilter = document.getElementById('filterReason');
    const statusFilter = document.getElementById('filterStatus');
    
    // In a real app, this would re-fetch from API
    // For now, just reload the lists
    loadBlacklistedUsersList();
    loadReportsList();
}

// Update blacklist stats
function updateBlacklistStats() {
    const stats = {
        totalBlacklisted: BlacklistState.blacklistedUsers.length,
        activeReports: BlacklistState.pendingReports.filter(r => 
            r.status === ReportStatus.PENDING || r.status === ReportStatus.UNDER_REVIEW
        ).length,
        pendingAppeals: 0, // Would be calculated from appeals
        autoBlacklists: BlacklistState.blacklistedUsers.filter(u => u.blacklistedBy === 'system').length
    };
    
    // Update UI
    updateStatCard('totalBlacklisted', stats.totalBlacklisted);
    updateStatCard('activeReports', stats.activeReports);
    updateStatCard('pendingAppeals', stats.pendingAppeals);
    updateStatCard('autoBlacklists', stats.autoBlacklists);
}

// Update stat card
function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value.toLocaleString();
    }
}

// Handle report user
function handleReportUser() {
    const form = document.getElementById('reportUserForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const userId = formData.get('userId');
    const reason = formData.get('reason');
    const description = formData.get('description');
    const evidence = formData.get('evidence');
    
    if (!userId) {
        showToast('Please select a user to report', 'error');
        return;
    }
    
    if (!description || description.length < 10) {
        showToast('Please provide a detailed description', 'error');
        return;
    }
    
    // Create report
    const report = {
        id: 'report_' + Date.now(),
        reportedUserId: userId,
        reportedUserName: 'Reported User', // Would fetch from API
        reportedUserRole: 'borrower', // Would fetch from API
        reporterId: 'current_user',
        reporterName: 'Current User',
        reporterRole: 'user',
        reason: reason,
        description: description,
        evidence: evidence ? evidence.split(',').map(e => e.trim()) : [],
        submittedAt: new Date().toISOString().split('T')[0],
        status: ReportStatus.PENDING,
        priority: 'medium',
        previousStrikes: 0
    };
    
    // Simulate API call
    simulateAPI('/api/blacklist/report', report)
        .then(response => {
            if (response.success) {
                // Add to pending reports
                BlacklistState.pendingReports.push(report);
                
                // Save state
                saveBlacklistState();
                
                // Close modal
                const modal = document.getElementById('reportUserModal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Update UI
                loadReportsList();
                updateBlacklistStats();
                
                showToast('User reported successfully', 'success');
            } else {
                showToast('Failed to report user', 'error');
            }
        })
        .catch(error => {
            console.error('Blacklist: Error reporting user:', error);
            showToast('Error reporting user', 'error');
        });
}

// View user details
function viewUserDetails(userId) {
    // Find user in blacklist
    const user = BlacklistState.blacklistedUsers.find(u => u.userId === userId);
    if (!user) {
        showToast('User not found in blacklist', 'error');
        return;
    }
    
    const modalContent = `
        <div class="user-details-modal">
            <div class="user-header">
                <h3>Blacklist Details - ${user.name}</h3>
                <span class="user-level ${user.level}">${user.level.toUpperCase()}</span>
            </div>
            
            <div class="user-info">
                <div class="info-section">
                    <h4>User Information</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Name:</span>
                            <span class="info-value">${user.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Role:</span>
                            <span class="info-value badge ${user.role}">${user.role.toUpperCase()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Phone:</span>
                            <span class="info-value">${user.phone}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span class="info-value">${user.email}</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Blacklist Information</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Blacklisted On:</span>
                            <span class="info-value">${formatDate(user.blacklistedAt)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Blacklisted By:</span>
                            <span class="info-value">${user.blacklistedBy}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Reason:</span>
                            <span class="info-value">${formatReason(user.reason)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Level:</span>
                            <span class="info-value badge ${user.level}">${user.level.toUpperCase()}</span>
                        </div>
                        ${user.expiresAt ? `
                            <div class="info-item">
                                <span class="info-label">Expires:</span>
                                <span class="info-value">${formatDate(user.expiresAt)}</span>
                            </div>
                        ` : ''}
                        <div class="info-item">
                            <span class="info-label">Strikes:</span>
                            <span class="info-value">${user.strikes}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Defaults:</span>
                            <span class="info-value">${user.totalDefaults}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Appeal Status:</span>
                            <span class="info-value">${user.appealStatus}</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Notes</h4>
                    <div class="notes-content">
                        ${user.notes}
                    </div>
                </div>
                
                ${user.level === BlacklistLevel.TEMPORARY || user.level === BlacklistLevel.WARNING ? `
                    <div class="info-section">
                        <h4>Remaining Duration</h4>
                        <div class="duration-display">
                            ${user.expiresAt ? `
                                <div class="duration-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${calculateRemainingPercentage(user.blacklistedAt, user.expiresAt)}%"></div>
                                    </div>
                                    <div class="duration-text">
                                        ${calculateDaysRemaining(user.expiresAt)} days remaining
                                    </div>
                                </div>
                            ` : 'No expiration date'}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-footer">
                ${user.level !== BlacklistLevel.PERMANENT ? `
                    <button class="btn btn-danger" onclick="removeFromBlacklist('${user.id}')">
                        Remove from Blacklist
                    </button>
                ` : ''}
                ${user.appealStatus === 'none' ? `
                    <button class="btn btn-warning" onclick="openAppealModal('${user.id}')">
                        File Appeal
                    </button>
                ` : ''}
                <button class="btn btn-outline-secondary" onclick="closeModal()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    showModal('Blacklist Details', modalContent);
}

// Remove from blacklist
function removeFromBlacklist(userId) {
    const user = BlacklistState.blacklistedUsers.find(u => u.id === userId);
    if (!user) {
        showToast('User not found in blacklist', 'error');
        return;
    }
    
    if (user.level === BlacklistLevel.PERMANENT) {
        showToast('Cannot remove permanently blacklisted users', 'error');
        return;
    }
    
    if (!confirm(`Remove ${user.name} from blacklist?`)) {
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/blacklist/remove', { userId: user.userId })
        .then(response => {
            if (response.success) {
                // Remove from blacklist
                BlacklistState.blacklistedUsers = BlacklistState.blacklistedUsers.filter(u => u.id !== userId);
                
                // Save state
                saveBlacklistState();
                
                // Update UI
                loadBlacklistedUsersList();
                updateBlacklistStats();
                
                showToast(`${user.name} removed from blacklist`, 'success');
            } else {
                showToast('Failed to remove from blacklist', 'error');
            }
        })
        .catch(error => {
            console.error('Blacklist: Error removing from blacklist:', error);
            showToast('Error removing from blacklist', 'error');
        });
}

// Review report
function reviewReport(reportId) {
    const report = BlacklistState.pendingReports.find(r => r.id === reportId);
    if (!report) {
        showToast('Report not found', 'error');
        return;
    }
    
    const modalContent = `
        <div class="review-report-modal">
            <h3>Review Report</h3>
            
            <div class="report-summary">
                <div class="summary-item">
                    <span class="summary-label">Reported User:</span>
                    <span class="summary-value">${report.reportedUserName}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Reason:</span>
                    <span class="summary-value">${formatReason(report.reason)}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Previous Strikes:</span>
                    <span class="summary-value">${report.previousStrikes}</span>
                </div>
            </div>
            
            <div class="report-description">
                <h4>Description</h4>
                <p>${report.description}</p>
            </div>
            
            ${report.evidence && report.evidence.length > 0 ? `
                <div class="report-evidence">
                    <h4>Evidence</h4>
                    <div class="evidence-grid">
                        ${report.evidence.map(item => `
                            <div class="evidence-item">${item}</div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <form id="reviewReportForm">
                <input type="hidden" name="reportId" value="${report.id}">
                
                <div class="form-group">
                    <label for="reviewDecision">Decision</label>
                    <select class="form-control" id="reviewDecision" name="decision" required>
                        <option value="">Select decision</option>
                        <option value="add_strike">Add Strike</option>
                        <option value="blacklist_warning">Issue Warning</option>
                        <option value="blacklist_temporary">Temporary Blacklist</option>
                        <option value="blacklist_permanent">Permanent Blacklist</option>
                        <option value="dismiss">Dismiss Report</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="reviewNotes">Review Notes</label>
                    <textarea class="form-control" id="reviewNotes" name="notes" 
                              rows="3" placeholder="Add notes about your decision" required></textarea>
                </div>
                
                <div class="form-group">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="notifyUser" name="notifyUser" checked>
                        <label class="form-check-label" for="notifyUser">
                            Notify user about this decision
                        </label>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">
                    Submit Decision
                </button>
            </form>
        </div>
    `;
    
    showModal('Review Report', modalContent);
    
    // Initialize form submission
    const form = document.getElementById('reviewReportForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleReviewDecision(reportId);
        });
    }
}

// Handle review decision
function handleReviewDecision(reportId) {
    const form = document.getElementById('reviewReportForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const decision = formData.get('decision');
    const notes = formData.get('notes');
    const notifyUser = formData.get('notifyUser') === 'on';
    
    const report = BlacklistState.pendingReports.find(r => r.id === reportId);
    if (!report) {
        showToast('Report not found', 'error');
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/blacklist/review', {
        reportId,
        decision,
        notes,
        notifyUser
    })
    .then(response => {
        if (response.success) {
            // Update report status
            report.status = ReportStatus.APPROVED;
            
            // Handle decision
            if (decision.startsWith('blacklist_')) {
                const level = decision.replace('blacklist_', '');
                addToBlacklist(report.reportedUserId, report.reportedUserName, level, report.reason, notes);
            } else if (decision === 'add_strike') {
                addStrikeToUser(report.reportedUserId, report.reason, notes);
            }
            
            // Save state
            saveBlacklistState();
            
            // Close modal
            closeModal();
            
            // Update UI
            loadReportsList();
            loadBlacklistedUsersList();
            updateBlacklistStats();
            
            showToast('Report reviewed successfully', 'success');
        } else {
            showToast('Failed to review report', 'error');
        }
    })
    .catch(error => {
        console.error('Blacklist: Error reviewing report:', error);
        showToast('Error reviewing report', 'error');
    });
}

// Add to blacklist
function addToBlacklist(userId, userName, level, reason, notes) {
    const blacklistEntry = {
        id: 'user_bl_' + Date.now(),
        userId: userId,
        name: userName,
        phone: 'Unknown', // Would fetch from API
        email: 'Unknown', // Would fetch from API
        role: 'user', // Would fetch from API
        blacklistedAt: new Date().toISOString().split('T')[0],
        blacklistedBy: 'current_user',
        level: level,
        reason: reason,
        duration: level === BlacklistLevel.TEMPORARY ? 90 : level === BlacklistLevel.WARNING ? 30 : 0,
        expiresAt: level === BlacklistLevel.PERMANENT ? null : 
            new Date(Date.now() + (level === BlacklistLevel.TEMPORARY ? 90 : 30) * 24 * 60 * 60 * 1000)
                .toISOString().split('T')[0],
        strikes: 1,
        totalDefaults: 0,
        appealStatus: 'none',
        notes: notes || 'Added via report review'
    };
    
    BlacklistState.blacklistedUsers.push(blacklistEntry);
}

// Add strike to user
function addStrikeToUser(userId, reason, notes) {
    const strike = {
        id: 'strike_' + Date.now(),
        userId: userId,
        userName: 'User Name', // Would fetch from API
        userRole: 'user', // Would fetch from API
        reason: reason,
        issuedBy: 'current_user',
        issuedAt: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        severity: 'medium',
        notes: notes || 'Added via report review',
        status: 'active'
    };
    
    // In a real app, this would be added to a strikes array
    console.log('Adding strike to user:', strike);
}

// Remove strike
function removeStrike(strikeId) {
    if (!confirm('Remove this strike?')) {
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/blacklist/remove-strike', { strikeId })
        .then(response => {
            if (response.success) {
                // In a real app, remove from strikes array
                showToast('Strike removed successfully', 'success');
                loadUserStrikes();
            } else {
                showToast('Failed to remove strike', 'error');
            }
        })
        .catch(error => {
            console.error('Blacklist: Error removing strike:', error);
            showToast('Error removing strike', 'error');
        });
}

// Open appeal modal
function openAppealModal(userId) {
    const user = BlacklistState.blacklistedUsers.find(u => u.id === userId);
    if (!user) {
        showToast('User not found in blacklist', 'error');
        return;
    }
    
    if (user.appealStatus !== 'none') {
        showToast(`Appeal already ${user.appealStatus}`, 'info');
        return;
    }
    
    const modalContent = `
        <div class="appeal-modal">
            <h3>File Appeal</h3>
            
            <div class="appeal-summary">
                <div class="summary-item">
                    <span class="summary-label">User:</span>
                    <span class="summary-value">${user.name}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Blacklist Level:</span>
                    <span class="summary-value">${user.level.toUpperCase()}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Reason:</span>
                    <span class="summary-value">${formatReason(user.reason)}</span>
                </div>
            </div>
            
            <form id="appealForm">
                <input type="hidden" name="userId" value="${user.id}">
                
                <div class="form-group">
                    <label for="appealReason">Appeal Reason *</label>
                    <textarea class="form-control" id="appealReason" name="reason" 
                              rows="4" placeholder="Explain why you believe the blacklist should be removed or reduced" 
                              required></textarea>
                    <small class="form-text text-muted">
                        Be specific and provide any relevant information
                    </small>
                </div>
                
                <div class="form-group">
                    <label for="appealEvidence">Evidence (Optional)</label>
                    <textarea class="form-control" id="appealEvidence" name="evidence" 
                              rows="2" placeholder="List any evidence that supports your appeal (documents, references, etc.)"></textarea>
                    <small class="form-text text-muted">
                        Separate multiple items with commas
                    </small>
                </div>
                
                <div class="form-group">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="agreeTerms" required>
                        <label class="form-check-label" for="agreeTerms">
                            I confirm that all information provided is true and accurate
                        </label>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">
                    Submit Appeal
                </button>
            </form>
            
            <div class="appeal-note">
                <p><strong>Note:</strong> Appeals are typically reviewed within 3-5 business days.</p>
            </div>
        </div>
    `;
    
    // Show modal
    const modal = document.getElementById('appealModal');
    const modalBody = document.querySelector('#appealModal .modal-body');
    
    if (modalBody) {
        modalBody.innerHTML = modalContent;
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Handle appeal
function handleAppeal() {
    const form = document.getElementById('appealForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const userId = formData.get('userId');
    const reason = formData.get('reason');
    const evidence = formData.get('evidence');
    
    const user = BlacklistState.blacklistedUsers.find(u => u.id === userId);
    if (!user) {
        showToast('User not found in blacklist', 'error');
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/blacklist/appeal', {
        blacklistId: userId,
        reason: reason,
        evidence: evidence ? evidence.split(',').map(e => e.trim()) : []
    })
    .then(response => {
        if (response.success) {
            // Update user appeal status
            user.appealStatus = 'pending';
            
            // Save state
            saveBlacklistState();
            
            // Close modal
            const modal = document.getElementById('appealModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Update UI
            loadBlacklistedUsersList();
            loadAppealsList();
            
            showToast('Appeal submitted successfully', 'success');
        } else {
            showToast('Failed to submit appeal', 'error');
        }
    })
    .catch(error => {
        console.error('Blacklist: Error submitting appeal:', error);
        showToast('Error submitting appeal', 'error');
    });
}

// Approve appeal
function approveAppeal(appealId) {
    if (!confirm('Approve this appeal?')) {
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/blacklist/approve-appeal', { appealId })
        .then(response => {
            if (response.success) {
                // In a real app, update appeal status and remove from blacklist
                showToast('Appeal approved', 'success');
                loadAppealsList();
                loadBlacklistedUsersList();
            } else {
                showToast('Failed to approve appeal', 'error');
            }
        })
        .catch(error => {
            console.error('Blacklist: Error approving appeal:', error);
            showToast('Error approving appeal', 'error');
        });
}

// Reject appeal
function rejectAppeal(appealId) {
    if (!confirm('Reject this appeal?')) {
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/blacklist/reject-appeal', { appealId })
        .then(response => {
            if (response.success) {
                // In a real app, update appeal status
                showToast('Appeal rejected', 'success');
                loadAppealsList();
            } else {
                showToast('Failed to reject appeal', 'error');
            }
        })
        .catch(error => {
            console.error('Blacklist: Error rejecting appeal:', error);
            showToast('Error rejecting appeal', 'error');
        });
}

// Save blacklist rules
function saveBlacklistRules() {
    const form = document.getElementById('blacklistRulesForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const rules = {
        defaultStrikeLimit: parseInt(formData.get('strikeLimit')),
        autoBlacklistThreshold: parseInt(formData.get('autoBlacklistThreshold')),
        reviewRequired: formData.get('reviewRequired') === 'on',
        appealPeriod: parseInt(formData.get('appealPeriod'))
    };
    
    // Validate rules
    if (rules.defaultStrikeLimit < 1 || rules.defaultStrikeLimit > 10) {
        showToast('Strike limit must be between 1 and 10', 'error');
        return;
    }
    
    if (rules.autoBlacklistThreshold < 1 || rules.autoBlacklistThreshold > 10) {
        showToast('Auto-blacklist threshold must be between 1 and 10', 'error');
        return;
    }
    
    if (rules.appealPeriod < 7 || rules.appealPeriod > 365) {
        showToast('Appeal period must be between 7 and 365 days', 'error');
        return;
    }
    
    // Update state
    BlacklistState.blacklistRules = rules;
    
    // Save state
    saveBlacklistState();
    
    showToast('Blacklist rules saved successfully', 'success');
}

// View report details
function viewReportDetails(reportId) {
    showToast(`Viewing report details: ${reportId}`, 'info');
}

// View strike details
function viewStrikeDetails(strikeId) {
    showToast(`Viewing strike details: ${strikeId}`, 'info');
}

// View appeal details
function viewAppealDetails(appealId) {
    showToast(`Viewing appeal details: ${appealId}`, 'info');
}

// Helper functions
function formatReason(reason) {
    return reason.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function calculateDaysRemaining(dateString) {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calculateRemainingPercentage(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    const totalDuration = end - start;
    const elapsed = today - start;
    
    if (elapsed <= 0) return 100;
    if (elapsed >= totalDuration) return 0;
    
    return 100 - (elapsed / totalDuration) * 100;
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

// Initialize blacklist module when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initBlacklist();
});

// Export for use in other modules
window.PesewaBlacklist = {
    initBlacklist,
    loadBlacklistedUsersList,
    loadReportsList,
    loadUserStrikes,
    loadAppealsList,
    handleReportUser,
    viewUserDetails,
    removeFromBlacklist,
    reviewReport,
    openAppealModal,
    saveBlacklistRules
};