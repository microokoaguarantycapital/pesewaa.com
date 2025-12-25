'use strict';

// Pesewa.com - Borrowing Module

// Borrowing state
const BorrowingState = {
    activeLoans: [],
    pendingRequests: [],
    repaymentHistory: [],
    borrowingLimits: {
        weeklyLimit: 0,
        availableBalance: 0,
        usedThisWeek: 0
    },
    borrowerProfile: {
        creditScore: 0,
        repaymentRate: 0,
        defaultCount: 0
    },
    availableLenders: []
};

// Loan request status
const LoanRequestStatus = {
    DRAFT: 'draft',
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    FUNDED: 'funded'
};

// Repayment status
const RepaymentStatus = {
    PENDING: 'pending',
    PAID: 'paid',
    OVERDUE: 'overdue',
    PARTIAL: 'partial',
    DEFAULTED: 'defaulted'
};

// Initialize borrowing module
function initBorrowing() {
    console.log('Borrowing: Initializing borrowing module...');
    
    // Load borrowing state
    loadBorrowingState();
    
    // Initialize borrowing UI
    initBorrowingUI();
    
    // Initialize borrowing event listeners
    initBorrowingEvents();
    
    // Load active loans
    loadActiveLoans();
    
    // Load available lenders
    loadAvailableLenders();
    
    // Update borrower profile
    updateBorrowerProfile();
}

// Load borrowing state from localStorage
function loadBorrowingState() {
    try {
        const savedState = localStorage.getItem('pesewa_borrowing');
        if (savedState) {
            const state = JSON.parse(savedState);
            Object.assign(BorrowingState, state);
            console.log('Borrowing: Loaded borrowing state from localStorage');
        } else {
            // Initialize with default state
            initializeDefaultBorrowingState();
        }
    } catch (error) {
        console.error('Borrowing: Error loading borrowing state:', error);
        initializeDefaultBorrowingState();
    }
}

// Initialize default borrowing state
function initializeDefaultBorrowingState() {
    BorrowingState.activeLoans = [];
    BorrowingState.pendingRequests = [];
    BorrowingState.repaymentHistory = [];
    BorrowingState.borrowingLimits = {
        weeklyLimit: 1500, // Default basic tier limit
        availableBalance: 1500,
        usedThisWeek: 0
    };
    BorrowingState.borrowerProfile = {
        creditScore: 650,
        repaymentRate: 85,
        defaultCount: 0
    };
    BorrowingState.availableLenders = [];
}

// Save borrowing state to localStorage
function saveBorrowingState() {
    try {
        localStorage.setItem('pesewa_borrowing', JSON.stringify(BorrowingState));
        console.log('Borrowing: Saved borrowing state');
    } catch (error) {
        console.error('Borrowing: Error saving borrowing state:', error);
    }
}

// Initialize borrowing UI
function initBorrowingUI() {
    // Initialize borrowing tabs
    initBorrowingTabs();
    
    // Initialize loan request modal
    initLoanRequestModal();
    
    // Initialize repayment modal
    initRepaymentModal();
    
    // Initialize loan filters
    initLoanFilters();
    
    // Initialize quick actions
    initQuickActions();
}

// Initialize borrowing tabs
function initBorrowingTabs() {
    const borrowingTabs = document.querySelectorAll('.borrowing-tab');
    
    borrowingTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab
            borrowingTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            showBorrowingTab(targetTab);
        });
    });
    
    // Set initial active tab
    const initialTab = document.querySelector('.borrowing-tab.active');
    if (initialTab) {
        const initialTabId = initialTab.getAttribute('data-tab');
        showBorrowingTab(initialTabId);
    }
}

// Show borrowing tab content
function showBorrowingTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.borrowing-tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected tab content
    const targetContent = document.getElementById(`${tabId}Tab`);
    if (targetContent) {
        targetContent.style.display = 'block';
        
        // Load content based on tab
        switch(tabId) {
            case 'my-loans':
                loadMyLoansList();
                break;
            case 'request':
                loadLoanRequestForm();
                break;
            case 'schedule':
                loadRepaymentSchedule();
                break;
            case 'history':
                loadBorrowingHistory();
                break;
            case 'lenders':
                loadAvailableLendersList();
                break;
        }
    }
}

// Initialize loan request modal
function initLoanRequestModal() {
    const requestLoanBtn = document.getElementById('requestLoanBtn');
    const loanRequestModal = document.getElementById('loanRequestModal');
    const closeLoanRequest = document.getElementById('closeLoanRequest');
    
    if (requestLoanBtn && loanRequestModal) {
        requestLoanBtn.addEventListener('click', function() {
            loanRequestModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            loadLoanRequestForm();
        });
    }
    
    if (closeLoanRequest) {
        closeLoanRequest.addEventListener('click', function() {
            loanRequestModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close modal on outside click
    if (loanRequestModal) {
        loanRequestModal.addEventListener('click', function(e) {
            if (e.target === loanRequestModal) {
                loanRequestModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Loan request form submission
    const loanRequestForm = document.getElementById('loanRequestForm');
    if (loanRequestForm) {
        loanRequestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLoanRequest();
        });
    }
}

// Initialize repayment modal
function initRepaymentModal() {
    const repaymentModal = document.getElementById('repaymentModal');
    const closeRepayment = document.getElementById('closeRepayment');
    
    if (closeRepayment) {
        closeRepayment.addEventListener('click', function() {
            repaymentModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close modal on outside click
    if (repaymentModal) {
        repaymentModal.addEventListener('click', function(e) {
            if (e.target === repaymentModal) {
                repaymentModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Repayment form submission
    const repaymentForm = document.getElementById('repaymentForm');
    if (repaymentForm) {
        repaymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRepayment();
        });
    }
}

// Initialize loan filters
function initLoanFilters() {
    const loanFilters = document.querySelectorAll('.loan-filter');
    
    loanFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            filterMyLoans();
        });
    });
}

// Initialize quick actions
function initQuickActions() {
    // Quick repayment button
    const quickRepayBtn = document.getElementById('quickRepayBtn');
    if (quickRepayBtn) {
        quickRepayBtn.addEventListener('click', function() {
            openQuickRepayment();
        });
    }
    
    // Check eligibility button
    const checkEligibilityBtn = document.getElementById('checkEligibilityBtn');
    if (checkEligibilityBtn) {
        checkEligibilityBtn.addEventListener('click', function() {
            checkBorrowerEligibility();
        });
    }
}

// Initialize borrowing event listeners
function initBorrowingEvents() {
    // Make payment buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.make-payment-btn')) {
            const button = e.target.closest('.make-payment-btn');
            const loanId = button.getAttribute('data-loan-id');
            openRepaymentModal(loanId);
        }
        
        // View loan details buttons
        if (e.target.closest('.view-loan-btn')) {
            const button = e.target.closest('.view-loan-btn');
            const loanId = button.getAttribute('data-loan-id');
            viewLoanDetails(loanId);
        }
        
        // Cancel request buttons
        if (e.target.closest('.cancel-request-btn')) {
            const button = e.target.closest('.cancel-request-btn');
            const requestId = button.getAttribute('data-request-id');
            cancelLoanRequest(requestId);
        }
        
        // Contact lender buttons
        if (e.target.closest('.contact-lender-btn')) {
            const button = e.target.closest('.contact-lender-btn');
            const lenderId = button.getAttribute('data-lender-id');
            contactLender(lenderId);
        }
    });
}

// Load active loans
function loadActiveLoans() {
    // In a real app, this would fetch from API
    const demoLoans = [
        {
            id: 'active_1',
            loanId: 'loan_001',
            amount: 1500,
            fundedAmount: 1500,
            fundedAt: '2024-01-10',
            lenderName: 'Accra Investments Ltd',
            interestRate: 15,
            duration: 7,
            status: 'active',
            totalRepayment: 1725,
            repaidAmount: 575,
            remainingAmount: 1150,
            nextPaymentDate: '2024-01-17',
            nextPaymentAmount: 246,
            category: 'fare',
            purpose: 'Transport fare for work commute',
            repaymentSchedule: [
                { date: '2024-01-11', amount: 246, status: 'paid' },
                { date: '2024-01-12', amount: 246, status: 'paid' },
                { date: '2024-01-13', amount: 246, status: 'paid' },
                { date: '2024-01-14', amount: 246, status: 'pending' },
                { date: '2024-01-15', amount: 246, status: 'pending' },
                { date: '2024-01-16', amount: 246, status: 'pending' },
                { date: '2024-01-17', amount: 246, status: 'pending' }
            ]
        },
        {
            id: 'active_2',
            loanId: 'loan_002',
            amount: 2000,
            fundedAmount: 2000,
            fundedAt: '2024-01-05',
            lenderName: 'Kumasi Microfinance',
            interestRate: 15,
            duration: 14,
            status: 'repaying',
            totalRepayment: 2600,
            repaidAmount: 1300,
            remainingAmount: 1300,
            nextPaymentDate: '2024-01-19',
            nextPaymentAmount: 186,
            category: 'data',
            purpose: 'Internet data for online business',
            repaymentSchedule: [
                { date: '2024-01-06', amount: 186, status: 'paid' },
                { date: '2024-01-07', amount: 186, status: 'paid' },
                { date: '2024-01-08', amount: 186, status: 'paid' },
                { date: '2024-01-09', amount: 186, status: 'paid' },
                { date: '2024-01-10', amount: 186, status: 'paid' },
                { date: '2024-01-11', amount: 186, status: 'paid' },
                { date: '2024-01-12', amount: 186, status: 'paid' },
                { date: '2024-01-13', amount: 186, status: 'paid' },
                { date: '2024-01-14', amount: 186, status: 'paid' },
                { date: '2024-01-15', amount: 186, status: 'paid' },
                { date: '2024-01-16', amount: 186, status: 'pending' },
                { date: '2024-01-17', amount: 186, status: 'pending' },
                { date: '2024-01-18', amount: 186, status: 'pending' },
                { date: '2024-01-19', amount: 186, status: 'pending' }
            ]
        }
    ];
    
    BorrowingState.activeLoans = demoLoans;
    console.log('Borrowing: Loaded active loans:', BorrowingState.activeLoans.length);
}

// Load my loans list
function loadMyLoansList() {
    const container = document.getElementById('myLoansList');
    if (!container) return;
    
    if (BorrowingState.activeLoans.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💰</div>
                <h3>No Active Loans</h3>
                <p>You don't have any active loans at the moment.</p>
                <button class="btn btn-primary" onclick="showBorrowingTab('request')">
                    Request a Loan
                </button>
            </div>
        `;
        return;
    }
    
    let loansHTML = '<div class="loans-grid">';
    
    BorrowingState.activeLoans.forEach(loan => {
        const progress = loan.totalRepayment > 0 ? (loan.repaidAmount / loan.totalRepayment) * 100 : 0;
        const daysRemaining = calculateDaysRemaining(loan.nextPaymentDate);
        
        loansHTML += `
            <div class="loan-card ${loan.status}">
                <div class="loan-header">
                    <div class="loan-status-badge ${loan.status}">
                        ${loan.status.toUpperCase()}
                    </div>
                    <div class="loan-category">
                        ${getCategoryIcon(loan.category)} ${formatCategoryName(loan.category)}
                    </div>
                </div>
                <div class="loan-body">
                    <h3 class="loan-amount">₵${loan.amount.toLocaleString()}</h3>
                    <p class="loan-lender">Lender: ${loan.lenderName}</p>
                    <p class="loan-purpose">${loan.purpose}</p>
                    
                    <div class="loan-progress">
                        <div class="progress-header">
                            <span>Repayment Progress</span>
                            <span>${progress.toFixed(1)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-details">
                            <span>₵${loan.repaidAmount.toLocaleString()} repaid</span>
                            <span>₵${loan.remainingAmount.toLocaleString()} remaining</span>
                        </div>
                    </div>
                    
                    <div class="loan-details">
                        <div class="loan-detail">
                            <span class="detail-label">Next Payment:</span>
                            <span class="detail-value">
                                ₵${loan.nextPaymentAmount.toLocaleString()}
                            </span>
                        </div>
                        <div class="loan-detail">
                            <span class="detail-label">Due Date:</span>
                            <span class="detail-value ${daysRemaining <= 2 ? 'text-danger' : ''}">
                                ${formatDate(loan.nextPaymentDate)} (${daysRemaining} days)
                            </span>
                        </div>
                        <div class="loan-detail">
                            <span class="detail-label">Interest Rate:</span>
                            <span class="detail-value">${loan.interestRate}%</span>
                        </div>
                        <div class="loan-detail">
                            <span class="detail-label">Funded On:</span>
                            <span class="detail-value">${formatDate(loan.fundedAt)}</span>
                        </div>
                    </div>
                </div>
                <div class="loan-footer">
                    <button class="btn btn-outline-secondary view-loan-btn" data-loan-id="${loan.id}">
                        View Details
                    </button>
                    <button class="btn btn-primary make-payment-btn" data-loan-id="${loan.id}">
                        Make Payment
                    </button>
                </div>
            </div>
        `;
    });
    
    loansHTML += '</div>';
    container.innerHTML = loansHTML;
}

// Load loan request form
function loadLoanRequestForm() {
    const form = document.getElementById('loanRequestForm');
    if (!form) return;
    
    // Set default values
    const amountInput = document.getElementById('loanAmount');
    const categorySelect = document.getElementById('loanCategory');
    const durationSelect = document.getElementById('loanDuration');
    
    if (amountInput) {
        amountInput.max = BorrowingState.borrowingLimits.availableBalance;
        amountInput.addEventListener('input', updateLoanPreview);
    }
    
    if (categorySelect) {
        categorySelect.addEventListener('change', updateLoanPreview);
    }
    
    if (durationSelect) {
        durationSelect.addEventListener('change', updateLoanPreview);
    }
    
    // Update preview
    updateLoanPreview();
}

// Update loan preview
function updateLoanPreview() {
    const amountInput = document.getElementById('loanAmount');
    const categorySelect = document.getElementById('loanCategory');
    const durationSelect = document.getElementById('loanDuration');
    
    if (!amountInput || !categorySelect || !durationSelect) return;
    
    const amount = parseInt(amountInput.value) || 0;
    const category = categorySelect.value;
    const duration = parseInt(durationSelect.value) || 7;
    
    // Calculate loan details
    const interestRate = 15; // Standard rate
    const totalInterest = (amount * interestRate * duration) / (100 * 7);
    const totalRepayment = amount + totalInterest;
    const dailyPayment = totalRepayment / duration;
    
    // Update preview
    const previewAmount = document.getElementById('previewAmount');
    const previewCategory = document.getElementById('previewCategory');
    const previewDuration = document.getElementById('previewDuration');
    const previewInterest = document.getElementById('previewInterest');
    const previewTotal = document.getElementById('previewTotal');
    const previewDaily = document.getElementById('previewDaily');
    
    if (previewAmount) previewAmount.textContent = `₵${amount.toLocaleString()}`;
    if (previewCategory) previewCategory.textContent = formatCategoryName(category);
    if (previewDuration) previewDuration.textContent = `${duration} days`;
    if (previewInterest) previewInterest.textContent = `₵${totalInterest.toFixed(2)}`;
    if (previewTotal) previewTotal.textContent = `₵${totalRepayment.toFixed(2)}`;
    if (previewDaily) previewDaily.textContent = `₵${dailyPayment.toFixed(2)}`;
    
    // Update available balance
    const availableBalance = BorrowingState.borrowingLimits.availableBalance;
    const balanceInfo = document.getElementById('balanceInfo');
    if (balanceInfo) {
        balanceInfo.textContent = `Available balance: ₵${availableBalance.toLocaleString()}`;
        
        if (amount > availableBalance) {
            balanceInfo.classList.add('text-danger');
            balanceInfo.innerHTML += ' <span class="badge badge-danger">Exceeds limit</span>';
        } else {
            balanceInfo.classList.remove('text-danger');
        }
    }
}

// Load repayment schedule
function loadRepaymentSchedule() {
    const container = document.getElementById('repaymentSchedule');
    if (!container) return;
    
    if (BorrowingState.activeLoans.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <h3>No Repayment Schedule</h3>
                <p>You don't have any active loans with a repayment schedule.</p>
                <button class="btn btn-primary" onclick="showBorrowingTab('request')">
                    Request a Loan
                </button>
            </div>
        `;
        return;
    }
    
    // Combine all repayment schedules
    let allRepayments = [];
    
    BorrowingState.activeLoans.forEach(loan => {
        loan.repaymentSchedule.forEach(payment => {
            allRepayments.push({
                loanId: loan.id,
                loanAmount: loan.amount,
                lenderName: loan.lenderName,
                category: loan.category,
                ...payment
            });
        });
    });
    
    // Sort by date
    allRepayments.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Group by date
    const groupedByDate = {};
    allRepayments.forEach(payment => {
        const dateKey = payment.date;
        if (!groupedByDate[dateKey]) {
            groupedByDate[dateKey] = [];
        }
        groupedByDate[dateKey].push(payment);
    });
    
    let scheduleHTML = '<div class="schedule-container">';
    
    Object.keys(groupedByDate).sort().forEach(date => {
        const payments = groupedByDate[date];
        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const isOverdue = new Date(date) < new Date() && payments.some(p => p.status === 'pending');
        
        scheduleHTML += `
            <div class="schedule-day ${isOverdue ? 'overdue' : ''}">
                <div class="day-header">
                    <h4>${formatDate(date)}</h4>
                    <span class="day-total">₵${totalAmount.toLocaleString()}</span>
                    ${isOverdue ? '<span class="badge badge-danger">Overdue</span>' : ''}
                </div>
                <div class="day-payments">
        `;
        
        payments.forEach(payment => {
            scheduleHTML += `
                <div class="payment-item ${payment.status}">
                    <div class="payment-info">
                        <div class="payment-category">
                            ${getCategoryIcon(payment.category)} ${formatCategoryName(payment.category)}
                        </div>
                        <div class="payment-details">
                            <span class="payment-amount">₵${payment.amount.toLocaleString()}</span>
                            <span class="payment-lender">${payment.lenderName}</span>
                        </div>
                    </div>
                    <div class="payment-status">
                        <span class="status-badge ${payment.status}">${payment.status}</span>
                        ${payment.status === 'pending' ? `
                            <button class="btn btn-sm btn-primary" 
                                    onclick="openRepaymentModal('${payment.loanId}', ${payment.amount})">
                                Pay Now
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        scheduleHTML += `
                </div>
            </div>
        `;
    });
    
    scheduleHTML += '</div>';
    container.innerHTML = scheduleHTML;
}

// Load borrowing history
function loadBorrowingHistory() {
    const container = document.getElementById('borrowingHistory');
    if (!container) return;
    
    // In a real app, this would fetch from API
    const demoHistory = [
        {
            id: 'history_1',
            loanId: 'loan_101',
            amount: 1000,
            lenderName: 'Accra Investments Ltd',
            fundedAt: '2023-12-01',
            completedAt: '2023-12-08',
            status: 'completed',
            totalRepaid: 1150,
            category: 'fare'
        },
        {
            id: 'history_2',
            loanId: 'loan_102',
            amount: 2000,
            lenderName: 'Kumasi Microfinance',
            fundedAt: '2023-11-15',
            completedAt: '2023-11-29',
            status: 'completed',
            totalRepaid: 2600,
            category: 'data'
        },
        {
            id: 'history_3',
            loanId: 'loan_103',
            amount: 1500,
            lenderName: 'Takoradi Lenders',
            fundedAt: '2023-10-20',
            completedAt: '2023-10-27',
            status: 'completed',
            totalRepaid: 1725,
            category: 'food'
        }
    ];
    
    if (demoHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No Borrowing History</h3>
                <p>You haven't borrowed any loans yet.</p>
                <button class="btn btn-primary" onclick="showBorrowingTab('request')">
                    Request Your First Loan
                </button>
            </div>
        `;
        return;
    }
    
    let historyHTML = '<div class="history-table-container"><table class="history-table"><thead><tr>';
    historyHTML += '<th>Date</th><th>Amount</th><th>Lender</th><th>Category</th><th>Status</th><th>Total Repaid</th><th>Actions</th></tr></thead><tbody>';
    
    demoHistory.forEach(record => {
        historyHTML += `
            <tr>
                <td>${formatDate(record.fundedAt)}</td>
                <td>₵${record.amount.toLocaleString()}</td>
                <td>${record.lenderName}</td>
                <td>
                    <span class="category-badge ${record.category}">
                        ${getCategoryIcon(record.category)} ${formatCategoryName(record.category)}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${record.status}">
                        ${record.status}
                    </span>
                </td>
                <td>₵${record.totalRepaid.toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary" onclick="viewLoanHistory('${record.id}')">
                        View Details
                    </button>
                </td>
            </tr>
        `;
    });
    
    historyHTML += '</tbody></table></div>';
    container.innerHTML = historyHTML;
}

// Load available lenders
function loadAvailableLenders() {
    // In a real app, this would fetch from API
    const demoLenders = [
        {
            id: 'lender_1',
            name: 'Accra Investments Ltd',
            tier: 'premium',
            rating: 4.8,
            totalLoans: 245,
            successRate: 98,
            avgFundingTime: '2 hours',
            categories: ['fare', 'data', 'food', 'gas'],
            minAmount: 500,
            maxAmount: 5000,
            description: 'Specialized in short-term loans for professionals'
        },
        {
            id: 'lender_2',
            name: 'Kumasi Microfinance',
            tier: 'basic',
            rating: 4.5,
            totalLoans: 128,
            successRate: 95,
            avgFundingTime: '6 hours',
            categories: ['fare', 'data', 'repairs', 'water'],
            minAmount: 100,
            maxAmount: 1500,
            description: 'Community-focused microfinance for everyday needs'
        },
        {
            id: 'lender_3',
            name: 'Takoradi Lenders Group',
            tier: 'super',
            rating: 4.9,
            totalLoans: 512,
            successRate: 99,
            avgFundingTime: '1 hour',
            categories: ['fare', 'data', 'gas', 'food', 'repairs', 'water', 'fuel', 'medicine'],
            minAmount: 1000,
            maxAmount: 20000,
            description: 'Premium lending group with fast approvals'
        },
        {
            id: 'lender_4',
            name: 'Cape Coast Credit Union',
            tier: 'premium',
            rating: 4.6,
            totalLoans: 189,
            successRate: 96,
            avgFundingTime: '4 hours',
            categories: ['school', 'medicine', 'electricity', 'tv'],
            minAmount: 200,
            maxAmount: 5000,
            description: 'Education and healthcare focused lending'
        }
    ];
    
    BorrowingState.availableLenders = demoLenders;
    console.log('Borrowing: Loaded available lenders:', BorrowingState.availableLenders.length);
}

// Load available lenders list
function loadAvailableLendersList() {
    const container = document.getElementById('availableLendersList');
    if (!container) return;
    
    if (BorrowingState.availableLenders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <h3>No Lenders Available</h3>
                <p>There are no lenders available at the moment. Please check back later.</p>
            </div>
        `;
        return;
    }
    
    let lendersHTML = '<div class="lenders-grid">';
    
    BorrowingState.availableLenders.forEach(lender => {
        lendersHTML += `
            <div class="lender-card ${lender.tier}">
                <div class="lender-header">
                    <div class="lender-tier-badge ${lender.tier}">
                        ${lender.tier.toUpperCase()} TIER
                    </div>
                    <div class="lender-rating">
                        ⭐ ${lender.rating}
                    </div>
                </div>
                <div class="lender-body">
                    <h3 class="lender-name">${lender.name}</h3>
                    <p class="lender-description">${lender.description}</p>
                    
                    <div class="lender-stats">
                        <div class="stat">
                            <span class="stat-value">${lender.totalLoans}</span>
                            <span class="stat-label">Loans</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${lender.successRate}%</span>
                            <span class="stat-label">Success Rate</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${lender.avgFundingTime}</span>
                            <span class="stat-label">Avg. Funding</span>
                        </div>
                    </div>
                    
                    <div class="lender-categories">
                        <strong>Categories:</strong>
                        <div class="categories-list">
                            ${lender.categories.map(cat => `
                                <span class="category-tag">${formatCategoryName(cat)}</span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="lender-limits">
                        <div class="limit">
                            <span class="limit-label">Min:</span>
                            <span class="limit-value">₵${lender.minAmount.toLocaleString()}</span>
                        </div>
                        <div class="limit">
                            <span class="limit-label">Max:</span>
                            <span class="limit-value">₵${lender.maxAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div class="lender-footer">
                    <button class="btn btn-outline-secondary" onclick="viewLenderDetails('${lender.id}')">
                        View Details
                    </button>
                    <button class="btn btn-primary contact-lender-btn" data-lender-id="${lender.id}">
                        Contact
                    </button>
                </div>
            </div>
        `;
    });
    
    lendersHTML += '</div>';
    container.innerHTML = lendersHTML;
}

// Update borrower profile
function updateBorrowerProfile() {
    // Calculate profile stats
    const profile = BorrowingState.borrowerProfile;
    const limits = BorrowingState.borrowingLimits;
    
    // Update profile UI
    updateProfileCard('creditScore', profile.creditScore);
    updateProfileCard('repaymentRate', profile.repaymentRate + '%');
    updateProfileCard('defaultCount', profile.defaultCount);
    
    // Update limits UI
    updateLimitCard('weeklyLimit', limits.weeklyLimit, '₵');
    updateLimitCard('availableBalance', limits.availableBalance, '₵');
    updateLimitCard('usedThisWeek', limits.usedThisWeek, '₵');
    
    // Update progress bar
    updateLimitProgress();
}

// Update profile card
function updateProfileCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
        
        // Add styling based on value
        if (elementId === 'creditScore') {
            element.className = 'profile-value';
            if (value >= 750) element.classList.add('excellent');
            else if (value >= 700) element.classList.add('good');
            else if (value >= 650) element.classList.add('fair');
            else if (value >= 600) element.classList.add('poor');
            else element.classList.add('very-poor');
        } else if (elementId === 'repaymentRate') {
            element.className = 'profile-value';
            if (value >= '90%') element.classList.add('excellent');
            else if (value >= '80%') element.classList.add('good');
            else if (value >= '70%') element.classList.add('fair');
            else element.classList.add('poor');
        }
    }
}

// Update limit card
function updateLimitCard(elementId, value, prefix = '') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = `${prefix}${value.toLocaleString()}`;
    }
}

// Update limit progress
function updateLimitProgress() {
    const limits = BorrowingState.borrowingLimits;
    const progressBar = document.getElementById('limitProgressBar');
    const progressText = document.getElementById('limitProgressText');
    
    if (progressBar && progressText) {
        const percentage = (limits.usedThisWeek / limits.weeklyLimit) * 100;
        progressBar.style.width = `${percentage}%`;
        
        // Update color based on usage
        if (percentage >= 90) {
            progressBar.className = 'progress-fill danger';
        } else if (percentage >= 75) {
            progressBar.className = 'progress-fill warning';
        } else {
            progressBar.className = 'progress-fill success';
        }
        
        progressText.textContent = `${limits.usedThisWeek.toLocaleString()}/${limits.weeklyLimit.toLocaleString()} (${percentage.toFixed(1)}%)`;
    }
}

// Filter my loans
function filterMyLoans() {
    const statusFilter = document.getElementById('filterStatus');
    const categoryFilter = document.getElementById('filterCategory');
    
    // In a real app, this would re-fetch from API
    // For now, just reload the list
    loadMyLoansList();
}

// Open repayment modal
function openRepaymentModal(loanId, amount = null) {
    const loan = BorrowingState.activeLoans.find(l => l.id === loanId);
    if (!loan) {
        showToast('Loan not found', 'error');
        return;
    }
    
    const paymentAmount = amount || loan.nextPaymentAmount;
    
    // Update modal content
    const modalContent = `
        <h3>Make Payment</h3>
        <div class="payment-summary">
            <div class="summary-row">
                <span>Loan ID:</span>
                <strong>${loan.loanId}</strong>
            </div>
            <div class="summary-row">
                <span>Lender:</span>
                <strong>${loan.lenderName}</strong>
            </div>
            <div class="summary-row">
                <span>Amount Due:</span>
                <strong>₵${paymentAmount.toLocaleString()}</strong>
            </div>
            <div class="summary-row">
                <span>Due Date:</span>
                <span class="${calculateDaysRemaining(loan.nextPaymentDate) <= 2 ? 'text-danger' : ''}">
                    ${formatDate(loan.nextPaymentDate)}
                </span>
            </div>
            <div class="summary-row">
                <span>Remaining Balance:</span>
                <span>₵${loan.remainingAmount.toLocaleString()}</span>
            </div>
        </div>
        
        <form id="repaymentForm">
            <input type="hidden" name="loanId" value="${loan.id}">
            <input type="hidden" name="paymentAmount" value="${paymentAmount}">
            
            <div class="form-group">
                <label for="repaymentAmount">Amount to Pay (₵)</label>
                <input type="number" class="form-control" id="repaymentAmount" 
                       name="repaymentAmount" min="1" max="${loan.remainingAmount}" 
                       value="${paymentAmount}" required>
                <small class="form-text text-muted">
                    You can pay any amount up to the remaining balance of ₵${loan.remainingAmount.toLocaleString()}
                </small>
            </div>
            
            <div class="form-group">
                <label for="paymentMethod">Payment Method</label>
                <select class="form-control" id="paymentMethod" name="paymentMethod" required>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="pesewa_wallet">Pesewa Wallet</option>
                    <option value="cash">Cash (Agent)</option>
                </select>
            </div>
            
            <div class="form-group" id="mobileMoneyFields" style="display: none;">
                <label for="mobileNumber">Mobile Number</label>
                <input type="tel" class="form-control" id="mobileNumber" 
                       name="mobileNumber" placeholder="e.g., 0551234567">
            </div>
            
            <div class="form-group" id="bankFields" style="display: none;">
                <label for="accountNumber">Account Number</label>
                <input type="text" class="form-control" id="accountNumber" 
                       name="accountNumber" placeholder="Bank account number">
            </div>
            
            <div class="form-group">
                <label for="paymentNote">Payment Note (Optional)</label>
                <textarea class="form-control" id="paymentNote" name="paymentNote" 
                          rows="2" placeholder="Add any notes about this payment"></textarea>
            </div>
            
            <button type="submit" class="btn btn-primary btn-block">
                Confirm Payment
            </button>
        </form>
        
        <script>
            // Show/hide fields based on payment method
            document.getElementById('paymentMethod').addEventListener('change', function() {
                const method = this.value;
                document.getElementById('mobileMoneyFields').style.display = 
                    method === 'mobile_money' ? 'block' : 'none';
                document.getElementById('bankFields').style.display = 
                    method === 'bank' ? 'block' : 'none';
            });
        </script>
    `;
    
    // Show modal
    const modal = document.getElementById('repaymentModal');
    const modalBody = document.querySelector('#repaymentModal .modal-body');
    
    if (modalBody) {
        modalBody.innerHTML = modalContent;
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Handle repayment
function handleRepayment() {
    const form = document.getElementById('repaymentForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const loanId = formData.get('loanId');
    const repaymentAmount = parseInt(formData.get('repaymentAmount'));
    const paymentMethod = formData.get('paymentMethod');
    const paymentNote = formData.get('paymentNote');
    
    const loan = BorrowingState.activeLoans.find(l => l.id === loanId);
    if (!loan) {
        showToast('Loan not found', 'error');
        return;
    }
    
    if (repaymentAmount > loan.remainingAmount) {
        showToast('Payment amount exceeds remaining balance', 'error');
        return;
    }
    
    if (repaymentAmount < 1) {
        showToast('Payment amount must be at least ₵1', 'error');
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/borrowing/repay', { 
        loanId, 
        repaymentAmount, 
        paymentMethod,
        paymentNote 
    })
    .then(response => {
        if (response.success) {
            // Update loan state
            loan.repaidAmount += repaymentAmount;
            loan.remainingAmount -= repaymentAmount;
            
            // Update repayment schedule
            updateRepaymentSchedule(loan, repaymentAmount);
            
            // Update borrower profile
            updateRepaymentInProfile(repaymentAmount);
            
            // Add to repayment history
            addToRepaymentHistory({
                loanId: loan.id,
                amount: repaymentAmount,
                method: paymentMethod,
                date: new Date().toISOString().split('T')[0],
                note: paymentNote
            });
            
            // Save state
            saveBorrowingState();
            
            // Close modal
            const modal = document.getElementById('repaymentModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Update UI
            loadMyLoansList();
            loadRepaymentSchedule();
            updateBorrowerProfile();
            
            showToast(`Payment of ₵${repaymentAmount.toLocaleString()} successful!`, 'success');
        } else {
            showToast('Payment failed', 'error');
        }
    })
    .catch(error => {
        console.error('Borrowing: Error processing payment:', error);
        showToast('Error processing payment', 'error');
    });
}

// Update repayment schedule
function updateRepaymentSchedule(loan, amountPaid) {
    let remainingAmount = amountPaid;
    
    // Apply payment to pending repayments
    for (let payment of loan.repaymentSchedule) {
        if (payment.status === 'pending' && remainingAmount > 0) {
            if (remainingAmount >= payment.amount) {
                payment.status = 'paid';
                remainingAmount -= payment.amount;
            } else {
                payment.status = 'partial';
                payment.paidAmount = (payment.paidAmount || 0) + remainingAmount;
                remainingAmount = 0;
            }
        }
    }
    
    // Update next payment
    updateNextPayment(loan);
}

// Update next payment
function updateNextPayment(loan) {
    const nextPending = loan.repaymentSchedule.find(p => p.status === 'pending' || p.status === 'partial');
    
    if (nextPending) {
        loan.nextPaymentDate = nextPending.date;
        if (nextPending.status === 'partial') {
            loan.nextPaymentAmount = nextPending.amount - (nextPending.paidAmount || 0);
        } else {
            loan.nextPaymentAmount = nextPending.amount;
        }
    } else {
        // All payments made
        loan.status = 'completed';
        loan.nextPaymentDate = 'N/A';
        loan.nextPaymentAmount = 0;
    }
}

// Update repayment in profile
function updateRepaymentInProfile(amount) {
    // In a real app, this would update credit score and repayment rate
    BorrowingState.borrowerProfile.repaymentRate = Math.min(100, BorrowingState.borrowerProfile.repaymentRate + 0.5);
    
    // Update used amount
    BorrowingState.borrowingLimits.usedThisWeek += amount;
    BorrowingState.borrowingLimits.availableBalance = 
        Math.max(0, BorrowingState.borrowingLimits.weeklyLimit - BorrowingState.borrowingLimits.usedThisWeek);
}

// Add to repayment history
function addToRepaymentHistory(repayment) {
    BorrowingState.repaymentHistory.unshift(repayment);
    
    // Keep only last 100 records
    if (BorrowingState.repaymentHistory.length > 100) {
        BorrowingState.repaymentHistory = BorrowingState.repaymentHistory.slice(0, 100);
    }
}

// Handle loan request
function handleLoanRequest() {
    const form = document.getElementById('loanRequestForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const amount = parseInt(formData.get('loanAmount'));
    const category = formData.get('loanCategory');
    const duration = parseInt(formData.get('loanDuration'));
    const purpose = formData.get('loanPurpose');
    const guarantor1 = formData.get('guarantor1');
    const guarantor2 = formData.get('guarantor2');
    
    // Validate amount
    if (amount > BorrowingState.borrowingLimits.availableBalance) {
        showToast('Loan amount exceeds your available balance', 'error');
        return;
    }
    
    if (amount < 100) {
        showToast('Minimum loan amount is ₵100', 'error');
        return;
    }
    
    // Validate purpose
    if (!purpose || purpose.length < 10) {
        showToast('Please provide a detailed purpose for the loan', 'error');
        return;
    }
    
    // Calculate loan details
    const interestRate = 15;
    const totalInterest = (amount * interestRate * duration) / (100 * 7);
    const totalRepayment = amount + totalInterest;
    
    // Create loan request
    const loanRequest = {
        id: 'request_' + Date.now(),
        amount: amount,
        category: category,
        duration: duration,
        purpose: purpose,
        interestRate: interestRate,
        totalRepayment: totalRepayment,
        guarantors: [guarantor1, guarantor2].filter(g => g),
        status: LoanRequestStatus.PENDING,
        requestedAt: new Date().toISOString().split('T')[0],
        estimatedFunding: '24-48 hours'
    };
    
    // Simulate API call
    simulateAPI('/api/borrowing/request', loanRequest)
        .then(response => {
            if (response.success) {
                // Add to pending requests
                BorrowingState.pendingRequests.push(loanRequest);
                
                // Update borrowing limits
                BorrowingState.borrowingLimits.usedThisWeek += amount;
                BorrowingState.borrowingLimits.availableBalance = 
                    Math.max(0, BorrowingState.borrowingLimits.weeklyLimit - BorrowingState.borrowingLimits.usedThisWeek);
                
                // Save state
                saveBorrowingState();
                
                // Close modal
                const modal = document.getElementById('loanRequestModal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Update UI
                updateBorrowerProfile();
                
                showToast('Loan request submitted successfully!', 'success');
            } else {
                showToast('Loan request failed', 'error');
            }
        })
        .catch(error => {
            console.error('Borrowing: Error submitting loan request:', error);
            showToast('Error submitting loan request', 'error');
        });
}

// Cancel loan request
function cancelLoanRequest(requestId) {
    const request = BorrowingState.pendingRequests.find(r => r.id === requestId);
    if (!request) {
        showToast('Request not found', 'error');
        return;
    }
    
    if (request.status !== LoanRequestStatus.PENDING) {
        showToast('Only pending requests can be cancelled', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to cancel this loan request?')) {
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/borrowing/cancel-request', { requestId })
        .then(response => {
            if (response.success) {
                // Remove from pending requests
                BorrowingState.pendingRequests = BorrowingState.pendingRequests.filter(r => r.id !== requestId);
                
                // Restore borrowing limits
                BorrowingState.borrowingLimits.usedThisWeek -= request.amount;
                BorrowingState.borrowingLimits.availableBalance = 
                    Math.max(0, BorrowingState.borrowingLimits.weeklyLimit - BorrowingState.borrowingLimits.usedThisWeek);
                
                // Save state
                saveBorrowingState();
                
                // Update UI
                updateBorrowerProfile();
                
                showToast('Loan request cancelled', 'success');
            } else {
                showToast('Failed to cancel request', 'error');
            }
        })
        .catch(error => {
            console.error('Borrowing: Error cancelling request:', error);
            showToast('Error cancelling request', 'error');
        });
}

// View loan details
function viewLoanDetails(loanId) {
    const loan = BorrowingState.activeLoans.find(l => l.id === loanId);
    if (!loan) {
        showToast('Loan not found', 'error');
        return;
    }
    
    const progress = loan.totalRepayment > 0 ? (loan.repaidAmount / loan.totalRepayment) * 100 : 0;
    
    const modalContent = `
        <div class="loan-details-modal">
            <div class="loan-header">
                <h3>Loan Details</h3>
                <span class="loan-status ${loan.status}">${loan.status.toUpperCase()}</span>
            </div>
            
            <div class="loan-info">
                <div class="info-section">
                    <h4>Loan Information</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Loan ID:</span>
                            <span class="info-value">${loan.loanId}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Amount:</span>
                            <span class="info-value">₵${loan.amount.toLocaleString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Lender:</span>
                            <span class="info-value">${loan.lenderName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Category:</span>
                            <span class="info-value">${formatCategoryName(loan.category)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Purpose:</span>
                            <span class="info-value">${loan.purpose}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Funded On:</span>
                            <span class="info-value">${formatDate(loan.fundedAt)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Repayment Details</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Total Repayment:</span>
                            <span class="info-value">₵${loan.totalRepayment.toLocaleString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Amount Repaid:</span>
                            <span class="info-value">₵${loan.repaidAmount.toLocaleString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Remaining Balance:</span>
                            <span class="info-value">₵${loan.remainingAmount.toLocaleString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Interest Rate:</span>
                            <span class="info-value">${loan.interestRate}%</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Duration:</span>
                            <span class="info-value">${loan.duration} days</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Next Payment:</span>
                            <span class="info-value">₵${loan.nextPaymentAmount.toLocaleString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Due Date:</span>
                            <span class="info-value ${calculateDaysRemaining(loan.nextPaymentDate) <= 2 ? 'text-danger' : ''}">
                                ${formatDate(loan.nextPaymentDate)}
                            </span>
                        </div>
                    </div>
                    
                    <div class="progress-section">
                        <div class="progress-header">
                            <span>Repayment Progress</span>
                            <span>${progress.toFixed(1)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Repayment Schedule</h4>
                    <div class="schedule-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${loan.repaymentSchedule.map(payment => `
                                    <tr class="${payment.status}">
                                        <td>${formatDate(payment.date)}</td>
                                        <td>₵${payment.amount.toLocaleString()}</td>
                                        <td>
                                            <span class="status-badge ${payment.status}">
                                                ${payment.status}
                                            </span>
                                            ${payment.paidAmount ? `<br><small>Paid: ₵${payment.paidAmount.toLocaleString()}</small>` : ''}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="openRepaymentModal('${loan.id}')">
                    Make Payment
                </button>
                <button class="btn btn-outline-secondary" onclick="closeModal()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    showModal('Loan Details', modalContent);
}

// View loan history
function viewLoanHistory(historyId) {
    // Implementation would show detailed history
    console.log('Viewing loan history:', historyId);
    showToast('Loan history details coming soon', 'info');
}

// View lender details
function viewLenderDetails(lenderId) {
    const lender = BorrowingState.availableLenders.find(l => l.id === lenderId);
    if (!lender) {
        showToast('Lender not found', 'error');
        return;
    }
    
    const modalContent = `
        <div class="lender-details-modal">
            <div class="lender-header">
                <h3>${lender.name}</h3>
                <span class="lender-tier ${lender.tier}">${lender.tier.toUpperCase()} TIER</span>
            </div>
            
            <div class="lender-info">
                <div class="info-section">
                    <h4>Lender Information</h4>
                    <p class="lender-description">${lender.description}</p>
                    
                    <div class="lender-stats-detailed">
                        <div class="stat-detailed">
                            <div class="stat-value">${lender.rating}</div>
                            <div class="stat-label">Rating</div>
                        </div>
                        <div class="stat-detailed">
                            <div class="stat-value">${lender.totalLoans}</div>
                            <div class="stat-label">Total Loans</div>
                        </div>
                        <div class="stat-detailed">
                            <div class="stat-value">${lender.successRate}%</div>
                            <div class="stat-label">Success Rate</div>
                        </div>
                        <div class="stat-detailed">
                            <div class="stat-value">${lender.avgFundingTime}</div>
                            <div class="stat-label">Avg. Funding Time</div>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Lending Categories</h4>
                    <div class="categories-grid">
                        ${lender.categories.map(category => `
                            <div class="category-item">
                                ${getCategoryIcon(category)}
                                <span>${formatCategoryName(category)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Lending Limits</h4>
                    <div class="limits-grid">
                        <div class="limit-item">
                            <span class="limit-label">Minimum Amount:</span>
                            <span class="limit-value">₵${lender.minAmount.toLocaleString()}</span>
                        </div>
                        <div class="limit-item">
                            <span class="limit-label">Maximum Amount:</span>
                            <span class="limit-value">₵${lender.maxAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Contact Information</h4>
                    <div class="contact-info">
                        <p><strong>Availability:</strong> 24/7 for loan applications</p>
                        <p><strong>Response Time:</strong> Usually within 2 hours</p>
                        <p><strong>Support:</strong> Email, Phone, In-app Chat</p>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="contactLender('${lender.id}')">
                    Contact Lender
                </button>
                <button class="btn btn-outline-secondary" onclick="closeModal()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    showModal('Lender Details', modalContent);
}

// Contact lender
function contactLender(lenderId) {
    const lender = BorrowingState.availableLenders.find(l => l.id === lenderId);
    if (!lender) {
        showToast('Lender not found', 'error');
        return;
    }
    
    const modalContent = `
        <div class="contact-modal">
            <h3>Contact ${lender.name}</h3>
            <p>Choose a method to contact the lender:</p>
            
            <div class="contact-methods">
                <button class="btn btn-outline-primary btn-block mb-2" onclick="startLenderChat('${lender.id}')">
                    💬 In-app Chat
                </button>
                <button class="btn btn-outline-secondary btn-block mb-2" onclick="callLender('${lender.name}')">
                    📞 Call Lender
                </button>
                <button class="btn btn-outline-info btn-block mb-2" onclick="emailLender('${lender.name}')">
                    📧 Send Email
                </button>
            </div>
            
            <div class="contact-note">
                <p><strong>Note:</strong> Lenders typically respond within 2 hours during business days.</p>
            </div>
        </div>
    `;
    
    showModal('Contact Lender', modalContent);
}

// Start lender chat
function startLenderChat(lenderId) {
    console.log('Starting chat with lender:', lenderId);
    showToast('Chat functionality coming soon', 'info');
    closeModal();
}

// Call lender
function callLender(lenderName) {
    console.log('Calling lender:', lenderName);
    showToast('Call functionality coming soon', 'info');
    closeModal();
}

// Email lender
function emailLender(lenderName) {
    console.log('Emailing lender:', lenderName);
    showToast('Email functionality coming soon', 'info');
    closeModal();
}

// Open quick repayment
function openQuickRepayment() {
    // Find the next payment
    let nextPayment = null;
    let nextLoan = null;
    
    for (let loan of BorrowingState.activeLoans) {
        if (loan.status === 'active' || loan.status === 'repaying') {
            if (!nextPayment || new Date(loan.nextPaymentDate) < new Date(nextPayment.nextPaymentDate)) {
                nextPayment = loan;
                nextLoan = loan;
            }
        }
    }
    
    if (nextLoan) {
        openRepaymentModal(nextLoan.id);
    } else {
        showToast('No pending payments found', 'info');
    }
}

// Check borrower eligibility
function checkBorrowerEligibility() {
    const profile = BorrowingState.borrowerProfile;
    const limits = BorrowingState.borrowingLimits;
    
    let eligibility = {
        canBorrow: true,
        maxAmount: limits.availableBalance,
        reasons: []
    };
    
    // Check credit score
    if (profile.creditScore < 600) {
        eligibility.canBorrow = false;
        eligibility.reasons.push('Credit score below minimum (600)');
    }
    
    // Check repayment rate
    if (profile.repaymentRate < 70) {
        eligibility.canBorrow = false;
        eligibility.reasons.push('Repayment rate below 70%');
    }
    
    // Check default count
    if (profile.defaultCount > 2) {
        eligibility.canBorrow = false;
        eligibility.reasons.push('Too many defaults');
    }
    
    // Check weekly limit
    if (limits.usedThisWeek >= limits.weeklyLimit) {
        eligibility.canBorrow = false;
        eligibility.reasons.push('Weekly borrowing limit reached');
    }
    
    // Show result
    const modalContent = `
        <div class="eligibility-modal">
            <h3>Borrower Eligibility Check</h3>
            
            <div class="eligibility-result ${eligibility.canBorrow ? 'eligible' : 'not-eligible'}">
                <div class="result-icon">${eligibility.canBorrow ? '✅' : '❌'}</div>
                <div class="result-text">
                    <h4>${eligibility.canBorrow ? 'Eligible to Borrow' : 'Not Eligible to Borrow'}</h4>
                </div>
            </div>
            
            <div class="eligibility-details">
                <h4>Details</h4>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Credit Score:</span>
                        <span class="detail-value ${profile.creditScore >= 600 ? 'text-success' : 'text-danger'}">
                            ${profile.creditScore}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Repayment Rate:</span>
                        <span class="detail-value ${profile.repaymentRate >= 70 ? 'text-success' : 'text-danger'}">
                            ${profile.repaymentRate}%
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Defaults:</span>
                        <span class="detail-value ${profile.defaultCount <= 2 ? 'text-success' : 'text-danger'}">
                            ${profile.defaultCount}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Weekly Limit:</span>
                        <span class="detail-value">
                            ₵${limits.usedThisWeek.toLocaleString()}/${limits.weeklyLimit.toLocaleString()}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Available Balance:</span>
                        <span class="detail-value">
                            ₵${limits.availableBalance.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
            
            ${eligibility.reasons.length > 0 ? `
                <div class="eligibility-reasons">
                    <h4>Reasons:</h4>
                    <ul>
                        ${eligibility.reasons.map(reason => `<li>${reason}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="eligibility-actions">
                ${eligibility.canBorrow ? `
                    <button class="btn btn-primary" onclick="showBorrowingTab('request')">
                        Request a Loan
                    </button>
                ` : `
                    <button class="btn btn-secondary" onclick="showImprovementTips()">
                        View Improvement Tips
                    </button>
                `}
                <button class="btn btn-outline-secondary" onclick="closeModal()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    showModal('Eligibility Check', modalContent);
}

// Show improvement tips
function showImprovementTips() {
    const modalContent = `
        <div class="improvement-modal">
            <h3>Improve Your Eligibility</h3>
            
            <div class="improvement-tips">
                <div class="tip">
                    <h4>📈 Improve Credit Score</h4>
                    <ul>
                        <li>Make all payments on time</li>
                        <li>Keep credit utilization low</li>
                        <li>Maintain a mix of credit types</li>
                    </ul>
                </div>
                
                <div class="tip">
                    <h4>💰 Increase Repayment Rate</h4>
                    <ul>
                        <li>Set up automatic payments</li>
                        <li>Pay more than minimum when possible</li>
                        <li>Communicate with lenders if struggling</li>
                    </ul>
                </div>
                
                <div class="tip">
                    <h4>📊 Reduce Defaults</h4>
                    <ul>
                        <li>Only borrow what you can repay</li>
                        <li>Use guarantors for larger loans</li>
                        <li>Consider loan insurance</li>
                    </ul>
                </div>
                
                <div class="tip">
                    <h4>🎯 General Tips</h4>
                    <ul>
                        <li>Join borrowing groups for better rates</li>
                        <li>Maintain consistent income</li>
                        <li>Build relationships with lenders</li>
                    </ul>
                </div>
            </div>
            
            <div class="improvement-actions">
                <button class="btn btn-primary" onclick="closeModal()">
                    Got It
                </button>
            </div>
        </div>
    `;
    
    showModal('Improvement Tips', modalContent);
}

// Helper functions
function getCategoryIcon(category) {
    const icons = {
        'fare': '🚌',
        'data': '📱',
        'gas': '🔥',
        'food': '🍲',
        'repairs': '🔧',
        'water': '💧',
        'fuel': '⛽',
        'vehicle-repair': '🛠️',
        'medicine': '💊',
        'electricity': '💡',
        'school': '🎓',
        'tv': '📺'
    };
    return icons[category] || '💰';
}

function formatCategoryName(category) {
    return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ').replace('Tv', 'TV');
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

// Initialize borrowing module when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initBorrowing();
});

// Export for use in other modules
window.PesewaBorrowing = {
    initBorrowing,
    loadMyLoansList,
    loadRepaymentSchedule,
    loadAvailableLendersList,
    openRepaymentModal,
    handleLoanRequest,
    checkBorrowerEligibility,
    viewLoanDetails,
    viewLenderDetails
};