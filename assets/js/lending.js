'use strict';

// Pesewa.com - Lending Module

// Lending state
const LendingState = {
    availableLoans: [],
    fundedLoans: [],
    pendingRequests: [],
    lendingPortfolio: {
        totalInvested: 0,
        totalReturns: 0,
        activeLoans: 0,
        pendingReturns: 0,
        defaultedLoans: 0
    },
    lenderSettings: {
        autoFund: false,
        maxLoanAmount: 5000,
        minCreditScore: 600,
        preferredCategories: [],
        riskTolerance: 'medium'
    },
    withdrawalRequests: []
};

// Loan statuses
const LoanStatus = {
    PENDING: 'pending',
    FUNDED: 'funded',
    ACTIVE: 'active',
    REPAYING: 'repaying',
    COMPLETED: 'completed',
    DEFAULTED: 'defaulted',
    CANCELLED: 'cancelled'
};

// Risk levels
const RiskLevel = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

// Initialize lending module
function initLending() {
    console.log('Lending: Initializing lending module...');
    
    // Load lending state
    loadLendingState();
    
    // Initialize lending UI
    initLendingUI();
    
    // Initialize lending event listeners
    initLendingEvents();
    
    // Load available loans
    loadAvailableLoans();
    
    // Load funded loans
    loadFundedLoans();
    
    // Update portfolio stats
    updatePortfolioStats();
}

// Load lending state from localStorage
function loadLendingState() {
    try {
        const savedState = localStorage.getItem('pesewa_lending');
        if (savedState) {
            const state = JSON.parse(savedState);
            Object.assign(LendingState, state);
            console.log('Lending: Loaded lending state from localStorage');
        }
    } catch (error) {
        console.error('Lending: Error loading lending state:', error);
        // Initialize with default state
        initializeDefaultLendingState();
    }
}

// Initialize default lending state
function initializeDefaultLendingState() {
    LendingState.availableLoans = [];
    LendingState.fundedLoans = [];
    LendingState.pendingRequests = [];
    LendingState.lendingPortfolio = {
        totalInvested: 0,
        totalReturns: 0,
        activeLoans: 0,
        pendingReturns: 0,
        defaultedLoans: 0
    };
    LendingState.lenderSettings = {
        autoFund: false,
        maxLoanAmount: 5000,
        minCreditScore: 600,
        preferredCategories: [],
        riskTolerance: 'medium'
    };
    LendingState.withdrawalRequests = [];
}

// Save lending state to localStorage
function saveLendingState() {
    try {
        localStorage.setItem('pesewa_lending', JSON.stringify(LendingState));
        console.log('Lending: Saved lending state');
    } catch (error) {
        console.error('Lending: Error saving lending state:', error);
    }
}

// Initialize lending UI
function initLendingUI() {
    // Initialize lending tabs
    initLendingTabs();
    
    // Initialize loan filters
    initLoanFilters();
    
    // Initialize fund loan modal
    initFundLoanModal();
    
    // Initialize withdrawal modal
    initWithdrawalModal();
    
    // Initialize settings form
    initSettingsForm();
    
    // Initialize auto-fund toggle
    initAutoFundToggle();
}

// Initialize lending tabs
function initLendingTabs() {
    const lendingTabs = document.querySelectorAll('.lending-tab');
    
    lendingTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab
            lendingTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            showLendingTab(targetTab);
        });
    });
    
    // Set initial active tab
    const initialTab = document.querySelector('.lending-tab.active');
    if (initialTab) {
        const initialTabId = initialTab.getAttribute('data-tab');
        showLendingTab(initialTabId);
    }
}

// Show lending tab content
function showLendingTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.lending-tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected tab content
    const targetContent = document.getElementById(`${tabId}Tab`);
    if (targetContent) {
        targetContent.style.display = 'block';
        
        // Load content based on tab
        switch(tabId) {
            case 'available':
                loadAvailableLoansList();
                break;
            case 'funded':
                loadFundedLoansList();
                break;
            case 'portfolio':
                loadPortfolioDetails();
                break;
            case 'withdraw':
                loadWithdrawalSection();
                break;
            case 'settings':
                loadSettingsSection();
                break;
        }
    }
}

// Initialize loan filters
function initLoanFilters() {
    const loanFilters = document.querySelectorAll('.loan-filter');
    
    loanFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            filterAvailableLoans();
        });
    });
}

// Initialize fund loan modal
function initFundLoanModal() {
    const fundLoanModal = document.getElementById('fundLoanModal');
    const closeFundLoan = document.getElementById('closeFundLoan');
    
    if (closeFundLoan) {
        closeFundLoan.addEventListener('click', function() {
            fundLoanModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close modal on outside click
    if (fundLoanModal) {
        fundLoanModal.addEventListener('click', function(e) {
            if (e.target === fundLoanModal) {
                fundLoanModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Fund loan form submission
    const fundLoanForm = document.getElementById('fundLoanForm');
    if (fundLoanForm) {
        fundLoanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFundLoan();
        });
    }
}

// Initialize withdrawal modal
function initWithdrawalModal() {
    const withdrawalModal = document.getElementById('withdrawalModal');
    const closeWithdrawal = document.getElementById('closeWithdrawal');
    
    if (closeWithdrawal) {
        closeWithdrawal.addEventListener('click', function() {
            withdrawalModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close modal on outside click
    if (withdrawalModal) {
        withdrawalModal.addEventListener('click', function(e) {
            if (e.target === withdrawalModal) {
                withdrawalModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Withdrawal form submission
    const withdrawalForm = document.getElementById('withdrawalForm');
    if (withdrawalForm) {
        withdrawalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleWithdrawal();
        });
    }
}

// Initialize settings form
function initSettingsForm() {
    const settingsForm = document.getElementById('lenderSettingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveLenderSettings();
        });
        
        // Load current settings
        loadCurrentSettings();
    }
}

// Initialize auto-fund toggle
function initAutoFundToggle() {
    const autoFundToggle = document.getElementById('autoFundToggle');
    if (autoFundToggle) {
        autoFundToggle.addEventListener('change', function() {
            LendingState.lenderSettings.autoFund = this.checked;
            saveLendingState();
            showToast(`Auto-fund ${this.checked ? 'enabled' : 'disabled'}`, 'info');
        });
    }
}

// Initialize lending event listeners
function initLendingEvents() {
    // Fund loan buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.fund-loan-btn')) {
            const button = e.target.closest('.fund-loan-btn');
            const loanId = button.getAttribute('data-loan-id');
            openFundLoanModal(loanId);
        }
        
        // View loan details buttons
        if (e.target.closest('.view-loan-btn')) {
            const button = e.target.closest('.view-loan-btn');
            const loanId = button.getAttribute('data-loan-id');
            viewLoanDetails(loanId);
        }
        
        // Withdraw button
        if (e.target.closest('#requestWithdrawalBtn')) {
            openWithdrawalModal();
        }
        
        // Cancel withdrawal button
        if (e.target.closest('.cancel-withdrawal-btn')) {
            const button = e.target.closest('.cancel-withdrawal-btn');
            const requestId = button.getAttribute('data-request-id');
            cancelWithdrawal(requestId);
        }
    });
}

// Load available loans
function loadAvailableLoans() {
    // In a real app, this would fetch from API
    const demoLoans = [
        {
            id: 'loan_1',
            borrowerId: 'borrower_1',
            borrowerName: 'Kwame Mensah',
            borrowerScore: 720,
            amount: 1500,
            purpose: 'PesewaFare - Transport fare for work',
            category: 'fare',
            interestRate: 15,
            duration: 7,
            status: LoanStatus.PENDING,
            requestedAt: '2024-01-10',
            riskLevel: RiskLevel.LOW,
            guarantors: 2,
            repaymentHistory: '95% on time',
            location: 'Accra, Ghana'
        },
        {
            id: 'loan_2',
            borrowerId: 'borrower_2',
            borrowerName: 'Ama Serwaa',
            borrowerScore: 680,
            amount: 2500,
            purpose: 'PesewaData - Internet for online business',
            category: 'data',
            interestRate: 15,
            duration: 14,
            status: LoanStatus.PENDING,
            requestedAt: '2024-01-11',
            riskLevel: RiskLevel.MEDIUM,
            guarantors: 1,
            repaymentHistory: '85% on time',
            location: 'Kumasi, Ghana'
        },
        {
            id: 'loan_3',
            borrowerId: 'borrower_3',
            borrowerName: 'Kofi Asante',
            borrowerScore: 620,
            amount: 3500,
            purpose: 'PesewaCookingGas - Gas for cooking business',
            category: 'gas',
            interestRate: 15,
            duration: 21,
            status: LoanStatus.PENDING,
            requestedAt: '2024-01-12',
            riskLevel: RiskLevel.HIGH,
            guarantors: 0,
            repaymentHistory: '70% on time',
            location: 'Takoradi, Ghana'
        },
        {
            id: 'loan_4',
            borrowerId: 'borrower_4',
            borrowerName: 'Esi Boateng',
            borrowerScore: 750,
            amount: 1200,
            purpose: 'PesewaFood - Food for family',
            category: 'food',
            interestRate: 15,
            duration: 7,
            status: LoanStatus.PENDING,
            requestedAt: '2024-01-13',
            riskLevel: RiskLevel.LOW,
            guarantors: 2,
            repaymentHistory: '100% on time',
            location: 'Cape Coast, Ghana'
        },
        {
            id: 'loan_5',
            borrowerId: 'borrower_5',
            borrowerName: 'Yaw Ofori',
            borrowerScore: 590,
            amount: 5000,
            purpose: 'PesewaBikeCarTuktukRepair - Vehicle repairs',
            category: 'vehicle-repair',
            interestRate: 15,
            duration: 30,
            status: LoanStatus.PENDING,
            requestedAt: '2024-01-14',
            riskLevel: RiskLevel.HIGH,
            guarantors: 1,
            repaymentHistory: '60% on time',
            location: 'Tamale, Ghana'
        }
    ];
    
    // Filter loans based on lender settings
    LendingState.availableLoans = demoLoans.filter(loan => {
        // Check if loan meets lender criteria
        if (loan.amount > LendingState.lenderSettings.maxLoanAmount) return false;
        if (loan.borrowerScore < LendingState.lenderSettings.minCreditScore) return false;
        
        // Check preferred categories
        if (LendingState.lenderSettings.preferredCategories.length > 0) {
            if (!LendingState.lenderSettings.preferredCategories.includes(loan.category)) return false;
        }
        
        // Check risk tolerance
        const riskMapping = { low: 0, medium: 1, high: 2 };
        const loanRisk = riskMapping[loan.riskLevel];
        const toleranceRisk = riskMapping[LendingState.lenderSettings.riskTolerance];
        if (loanRisk > toleranceRisk) return false;
        
        return true;
    });
    
    console.log('Lending: Loaded available loans:', LendingState.availableLoans.length);
}

// Load available loans list
function loadAvailableLoansList() {
    const container = document.getElementById('availableLoansList');
    if (!container) return;
    
    if (LendingState.availableLoans.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💰</div>
                <h3>No Loans Available</h3>
                <p>There are no loan requests matching your criteria at the moment.</p>
                <p class="text-muted">Adjust your settings to see more loans.</p>
                <button class="btn btn-primary" onclick="showLendingTab('settings')">
                    Adjust Settings
                </button>
            </div>
        `;
        return;
    }
    
    let loansHTML = '<div class="loans-grid">';
    
    LendingState.availableLoans.forEach(loan => {
        const totalRepayment = loan.amount + (loan.amount * loan.interestRate * loan.duration) / (100 * 7);
        const dailyPayment = totalRepayment / loan.duration;
        
        loansHTML += `
            <div class="loan-card ${loan.riskLevel}-risk">
                <div class="loan-header">
                    <div class="loan-risk-badge ${loan.riskLevel}">
                        ${loan.riskLevel.toUpperCase()} RISK
                    </div>
                    <div class="loan-category">
                        ${getCategoryIcon(loan.category)} ${formatCategoryName(loan.category)}
                    </div>
                </div>
                <div class="loan-body">
                    <h3 class="loan-amount">₵${loan.amount.toLocaleString()}</h3>
                    <p class="loan-purpose">${loan.purpose}</p>
                    
                    <div class="loan-details">
                        <div class="loan-detail">
                            <span class="detail-label">Borrower:</span>
                            <span class="detail-value">${loan.borrowerName}</span>
                        </div>
                        <div class="loan-detail">
                            <span class="detail-label">Credit Score:</span>
                            <span class="detail-value">
                                <span class="score-badge ${getScoreClass(loan.borrowerScore)}">
                                    ${loan.borrowerScore}
                                </span>
                            </span>
                        </div>
                        <div class="loan-detail">
                            <span class="detail-label">Duration:</span>
                            <span class="detail-value">${loan.duration} days</span>
                        </div>
                        <div class="loan-detail">
                            <span class="detail-label">Interest:</span>
                            <span class="detail-value">${loan.interestRate}%</span>
                        </div>
                        <div class="loan-detail">
                            <span class="detail-label">Total Return:</span>
                            <span class="detail-value">₵${totalRepayment.toFixed(2)}</span>
                        </div>
                        <div class="loan-detail">
                            <span class="detail-label">Daily Payment:</span>
                            <span class="detail-value">₵${dailyPayment.toFixed(2)}</span>
                        </div>
                        <div class="loan-detail">
                            <span class="detail-label">Location:</span>
                            <span class="detail-value">${loan.location}</span>
                        </div>
                        <div class="loan-detail">
                            <span class="detail-label">Guarantors:</span>
                            <span class="detail-value">${loan.guarantors}</span>
                        </div>
                        <div class="loan-detail">
                            <span class="detail-label">Repayment History:</span>
                            <span class="detail-value">${loan.repaymentHistory}</span>
                        </div>
                    </div>
                </div>
                <div class="loan-footer">
                    <button class="btn btn-outline-secondary view-loan-btn" data-loan-id="${loan.id}">
                        View Details
                    </button>
                    <button class="btn btn-primary fund-loan-btn" data-loan-id="${loan.id}">
                        Fund Loan
                    </button>
                </div>
            </div>
        `;
    });
    
    loansHTML += '</div>';
    container.innerHTML = loansHTML;
}

// Load funded loans
function loadFundedLoans() {
    // In a real app, this would fetch from API
    const demoFundedLoans = [
        {
            id: 'funded_1',
            loanId: 'loan_0',
            borrowerName: 'Michael Addo',
            amount: 2000,
            fundedAmount: 2000,
            fundedAt: '2024-01-05',
            interestRate: 15,
            duration: 14,
            status: LoanStatus.REPAYING,
            totalRepayment: 2600,
            repaidAmount: 1300,
            remainingAmount: 1300,
            nextPaymentDate: '2024-01-19',
            nextPaymentAmount: 186,
            category: 'fare',
            expectedCompletion: '2024-01-19'
        },
        {
            id: 'funded_2',
            loanId: 'loan_00',
            borrowerName: 'Sarah Osei',
            amount: 1500,
            fundedAmount: 1500,
            fundedAt: '2024-01-01',
            interestRate: 15,
            duration: 7,
            status: LoanStatus.COMPLETED,
            totalRepayment: 1725,
            repaidAmount: 1725,
            remainingAmount: 0,
            nextPaymentDate: 'N/A',
            nextPaymentAmount: 0,
            category: 'data',
            expectedCompletion: '2024-01-08'
        }
    ];
    
    LendingState.fundedLoans = demoFundedLoans;
    console.log('Lending: Loaded funded loans:', LendingState.fundedLoans.length);
}

// Load funded loans list
function loadFundedLoansList() {
    const container = document.getElementById('fundedLoansList');
    if (!container) return;
    
    if (LendingState.fundedLoans.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No Funded Loans</h3>
                <p>You haven't funded any loans yet. Explore available loans to start earning.</p>
                <button class="btn btn-primary" onclick="showLendingTab('available')">
                    Explore Loans
                </button>
            </div>
        `;
        return;
    }
    
    let loansHTML = '<div class="loans-grid">';
    
    LendingState.fundedLoans.forEach(loan => {
        const progress = loan.totalRepayment > 0 ? (loan.repaidAmount / loan.totalRepayment) * 100 : 0;
        
        loansHTML += `
            <div class="loan-card funded ${loan.status}">
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
                    <p class="loan-borrower">Borrower: ${loan.borrowerName}</p>
                    
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
                            <span class="detail-label">Total Return:</span>
                            <span class="detail-value">₵${loan.totalRepayment.toLocaleString()}</span>
                        </div>
                        <div class="loan-detail">
                            <span class="detail-label">Interest Earned:</span>
                            <span class="detail-value">₵${(loan.totalRepayment - loan.amount).toLocaleString()}</span>
                        </div>
                        <div class="loan-detail">
                            <span class="detail-label">Funded On:</span>
                            <span class="detail-value">${formatDate(loan.fundedAt)}</span>
                        </div>
                        ${loan.status === LoanStatus.REPAYING ? `
                            <div class="loan-detail">
                                <span class="detail-label">Next Payment:</span>
                                <span class="detail-value">
                                    ₵${loan.nextPaymentAmount.toLocaleString()} on ${formatDate(loan.nextPaymentDate)}
                                </span>
                            </div>
                        ` : ''}
                        ${loan.status === LoanStatus.COMPLETED ? `
                            <div class="loan-detail">
                                <span class="detail-label">Completed:</span>
                                <span class="detail-value">${formatDate(loan.expectedCompletion)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="loan-footer">
                    <button class="btn btn-outline-secondary view-loan-btn" data-loan-id="${loan.loanId}">
                        View Details
                    </button>
                    ${loan.status === LoanStatus.REPAYING ? `
                        <button class="btn btn-success" disabled>
                            Active
                        </button>
                    ` : `
                        <button class="btn btn-secondary" disabled>
                            Completed
                        </button>
                    `}
                </div>
            </div>
        `;
    });
    
    loansHTML += '</div>';
    container.innerHTML = loansHTML;
}

// Update portfolio stats
function updatePortfolioStats() {
    // Calculate portfolio stats from funded loans
    const portfolio = {
        totalInvested: 0,
        totalReturns: 0,
        activeLoans: 0,
        pendingReturns: 0,
        defaultedLoans: 0
    };
    
    LendingState.fundedLoans.forEach(loan => {
        portfolio.totalInvested += loan.amount;
        portfolio.totalReturns += (loan.repaidAmount - loan.amount);
        
        if (loan.status === LoanStatus.ACTIVE || loan.status === LoanStatus.REPAYING) {
            portfolio.activeLoans++;
            portfolio.pendingReturns += loan.remainingAmount;
        }
        
        if (loan.status === LoanStatus.DEFAULTED) {
            portfolio.defaultedLoans++;
        }
    });
    
    LendingState.lendingPortfolio = portfolio;
    
    // Update UI if on portfolio tab
    updatePortfolioUI();
}

// Update portfolio UI
function updatePortfolioUI() {
    const portfolio = LendingState.lendingPortfolio;
    
    // Update stats cards
    updateStatCard('totalInvested', portfolio.totalInvested, '₵');
    updateStatCard('totalReturns', portfolio.totalReturns, '₵');
    updateStatCard('activeLoans', portfolio.activeLoans);
    updateStatCard('pendingReturns', portfolio.pendingReturns, '₵');
    updateStatCard('defaultedLoans', portfolio.defaultedLoans);
    
    // Calculate ROI
    const roi = portfolio.totalInvested > 0 ? 
        (portfolio.totalReturns / portfolio.totalInvested) * 100 : 0;
    updateStatCard('roi', roi.toFixed(1), '%');
}

// Update stat card
function updateStatCard(elementId, value, prefix = '') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = `${prefix}${typeof value === 'number' ? value.toLocaleString() : value}`;
    }
}

// Load portfolio details
function loadPortfolioDetails() {
    updatePortfolioStats();
    
    // Load chart if available
    loadPortfolioChart();
    
    // Load recent activity
    loadPortfolioActivity();
}

// Load portfolio chart
function loadPortfolioChart() {
    const chartContainer = document.getElementById('portfolioChart');
    if (!chartContainer) return;
    
    // In a real app, this would use a charting library
    // For now, create a simple SVG chart
    const portfolio = LendingState.lendingPortfolio;
    const total = portfolio.totalInvested + portfolio.totalReturns;
    
    if (total === 0) {
        chartContainer.innerHTML = `
            <div class="empty-chart">
                <p>No data available yet</p>
                <p class="text-muted">Start funding loans to see your portfolio growth</p>
            </div>
        `;
        return;
    }
    
    const investedPercent = (portfolio.totalInvested / total) * 100;
    const returnsPercent = (portfolio.totalReturns / total) * 100;
    
    chartContainer.innerHTML = `
        <div class="portfolio-chart">
            <div class="chart-title">Portfolio Distribution</div>
            <div class="chart-visual">
                <div class="chart-segment invested" style="width: ${investedPercent}%">
                    <div class="segment-label">Invested: ₵${portfolio.totalInvested.toLocaleString()}</div>
                </div>
                <div class="chart-segment returns" style="width: ${returnsPercent}%">
                    <div class="segment-label">Returns: ₵${portfolio.totalReturns.toLocaleString()}</div>
                </div>
            </div>
            <div class="chart-legend">
                <div class="legend-item">
                    <span class="legend-color invested"></span>
                    <span class="legend-label">Total Invested</span>
                    <span class="legend-value">₵${portfolio.totalInvested.toLocaleString()}</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color returns"></span>
                    <span class="legend-label">Total Returns</span>
                    <span class="legend-value">₵${portfolio.totalReturns.toLocaleString()}</span>
                </div>
            </div>
        </div>
    `;
}

// Load portfolio activity
function loadPortfolioActivity() {
    const activityContainer = document.getElementById('portfolioActivity');
    if (!activityContainer) return;
    
    // Combine funded loans into activity
    const activities = LendingState.fundedLoans.map(loan => ({
        type: loan.status === LoanStatus.COMPLETED ? 'loan_completed' : 'loan_funded',
        date: loan.fundedAt,
        amount: loan.amount,
        borrower: loan.borrowerName,
        status: loan.status
    }));
    
    // Sort by date descending
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (activities.length === 0) {
        activityContainer.innerHTML = `
            <div class="empty-activity">
                <p>No recent activity</p>
            </div>
        `;
        return;
    }
    
    let activityHTML = '<div class="activity-list">';
    
    activities.slice(0, 5).forEach(activity => {
        let icon, color, action;
        
        switch(activity.type) {
            case 'loan_funded':
                icon = '💰';
                color = 'info';
                action = 'Funded loan';
                break;
            case 'loan_completed':
                icon = '✅';
                color = 'success';
                action = 'Loan completed';
                break;
            default:
                icon = '📊';
                color = 'secondary';
                action = 'Portfolio activity';
        }
        
        activityHTML += `
            <div class="activity-item ${color}">
                <span class="activity-icon">${icon}</span>
                <div class="activity-content">
                    <div class="activity-text">
                        <strong>${action}</strong> for ${activity.borrower}
                    </div>
                    <div class="activity-meta">
                        <span class="activity-amount">₵${activity.amount.toLocaleString()}</span>
                        <span class="activity-date">${formatDate(activity.date)}</span>
                    </div>
                </div>
                <span class="activity-status badge badge-${color}">${activity.status}</span>
            </div>
        `;
    });
    
    activityHTML += '</div>';
    activityContainer.innerHTML = activityHTML;
}

// Load withdrawal section
function loadWithdrawalSection() {
    const container = document.getElementById('withdrawalSection');
    if (!container) return;
    
    // In a real app, calculate available balance
    const availableBalance = LendingState.lendingPortfolio.totalReturns;
    
    // Update available balance
    const balanceElement = document.getElementById('availableBalance');
    if (balanceElement) {
        balanceElement.textContent = `₵${availableBalance.toLocaleString()}`;
    }
    
    // Load withdrawal history
    loadWithdrawalHistory();
}

// Load withdrawal history
function loadWithdrawalHistory() {
    const container = document.getElementById('withdrawalHistory');
    if (!container) return;
    
    if (LendingState.withdrawalRequests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💳</div>
                <h3>No Withdrawals</h3>
                <p>You haven't made any withdrawal requests yet.</p>
            </div>
        `;
        return;
    }
    
    let historyHTML = '<div class="withdrawal-list">';
    
    LendingState.withdrawalRequests.forEach(request => {
        historyHTML += `
            <div class="withdrawal-card ${request.status}">
                <div class="withdrawal-header">
                    <h4>Withdrawal Request #${request.id}</h4>
                    <span class="withdrawal-status badge badge-${request.status}">
                        ${request.status}
                    </span>
                </div>
                <div class="withdrawal-body">
                    <div class="withdrawal-amount">₵${request.amount.toLocaleString()}</div>
                    <div class="withdrawal-details">
                        <div class="detail">
                            <span class="detail-label">Requested:</span>
                            <span class="detail-value">${formatDate(request.requestedAt)}</span>
                        </div>
                        <div class="detail">
                            <span class="detail-label">Method:</span>
                            <span class="detail-value">${request.method}</span>
                        </div>
                        ${request.processedAt ? `
                            <div class="detail">
                                <span class="detail-label">Processed:</span>
                                <span class="detail-value">${formatDate(request.processedAt)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                ${request.status === 'pending' ? `
                    <div class="withdrawal-footer">
                        <button class="btn btn-danger btn-sm cancel-withdrawal-btn" 
                                data-request-id="${request.id}">
                            Cancel Request
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    historyHTML += '</div>';
    container.innerHTML = historyHTML;
}

// Load settings section
function loadSettingsSection() {
    loadCurrentSettings();
}

// Load current settings
function loadCurrentSettings() {
    const settings = LendingState.lenderSettings;
    
    // Update form fields
    const maxLoanAmount = document.getElementById('maxLoanAmount');
    const minCreditScore = document.getElementById('minCreditScore');
    const riskTolerance = document.getElementById('riskTolerance');
    const autoFundToggle = document.getElementById('autoFundToggle');
    
    if (maxLoanAmount) maxLoanAmount.value = settings.maxLoanAmount;
    if (minCreditScore) minCreditScore.value = settings.minCreditScore;
    if (riskTolerance) riskTolerance.value = settings.riskTolerance;
    if (autoFundToggle) autoFundToggle.checked = settings.autoFund;
    
    // Update category checkboxes
    updateCategoryCheckboxes();
}

// Update category checkboxes
function updateCategoryCheckboxes() {
    const categoryCheckboxes = document.querySelectorAll('input[name="preferredCategories"]');
    const preferredCategories = LendingState.lenderSettings.preferredCategories;
    
    categoryCheckboxes.forEach(checkbox => {
        checkbox.checked = preferredCategories.includes(checkbox.value);
    });
}

// Filter available loans
function filterAvailableLoans() {
    const amountFilter = document.getElementById('filterAmount');
    const scoreFilter = document.getElementById('filterScore');
    const categoryFilter = document.getElementById('filterCategory');
    const durationFilter = document.getElementById('filterDuration');
    
    // In a real app, this would re-fetch from API with filters
    // For now, just reload the list
    loadAvailableLoansList();
}

// Open fund loan modal
function openFundLoanModal(loanId) {
    const loan = LendingState.availableLoans.find(l => l.id === loanId);
    if (!loan) {
        showToast('Loan not found', 'error');
        return;
    }
    
    // Calculate loan details
    const totalRepayment = loan.amount + (loan.amount * loan.interestRate * loan.duration) / (100 * 7);
    const dailyPayment = totalRepayment / loan.duration;
    
    // Update modal content
    const modalContent = `
        <h3>Fund Loan</h3>
        <div class="loan-summary">
            <div class="summary-row">
                <span>Borrower:</span>
                <strong>${loan.borrowerName}</strong>
            </div>
            <div class="summary-row">
                <span>Loan Amount:</span>
                <strong>₵${loan.amount.toLocaleString()}</strong>
            </div>
            <div class="summary-row">
                <span>Purpose:</span>
                <span>${loan.purpose}</span>
            </div>
            <div class="summary-row">
                <span>Duration:</span>
                <span>${loan.duration} days</span>
            </div>
            <div class="summary-row">
                <span>Interest Rate:</span>
                <span>${loan.interestRate}%</span>
            </div>
            <div class="summary-row">
                <span>Total Return:</span>
                <strong>₵${totalRepayment.toFixed(2)}</strong>
            </div>
            <div class="summary-row">
                <span>Daily Payment:</span>
                <span>₵${dailyPayment.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Risk Level:</span>
                <span class="risk-badge ${loan.riskLevel}">${loan.riskLevel.toUpperCase()}</span>
            </div>
        </div>
        
        <form id="fundLoanForm">
            <input type="hidden" name="loanId" value="${loan.id}">
            <div class="form-group">
                <label for="fundAmount">Amount to Fund (₵)</label>
                <input type="number" class="form-control" id="fundAmount" 
                       name="fundAmount" min="100" max="${loan.amount}" 
                       value="${loan.amount}" required>
                <small class="form-text text-muted">
                    Maximum: ₵${loan.amount.toLocaleString()}
                </small>
            </div>
            <div class="form-group">
                <label for="fundSource">Funding Source</label>
                <select class="form-control" id="fundSource" name="fundSource" required>
                    <option value="wallet">Pesewa Wallet</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                </select>
            </div>
            <div class="form-group">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="agreeTerms" required>
                    <label class="form-check-label" for="agreeTerms">
                        I agree to the lending terms and conditions
                    </label>
                </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
                Confirm Funding
            </button>
        </form>
    `;
    
    // Show modal
    const modal = document.getElementById('fundLoanModal');
    const modalBody = document.querySelector('#fundLoanModal .modal-body');
    
    if (modalBody) {
        modalBody.innerHTML = modalContent;
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Re-initialize form submission
        const form = document.getElementById('fundLoanForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                handleFundLoan();
            });
        }
    }
}

// Handle fund loan
function handleFundLoan() {
    const form = document.getElementById('fundLoanForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const loanId = formData.get('loanId');
    const fundAmount = parseInt(formData.get('fundAmount'));
    const fundSource = formData.get('fundSource');
    
    const loan = LendingState.availableLoans.find(l => l.id === loanId);
    if (!loan) {
        showToast('Loan not found', 'error');
        return;
    }
    
    if (fundAmount > loan.amount) {
        showToast('Funding amount exceeds loan amount', 'error');
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/lending/fund', { loanId, fundAmount, fundSource })
        .then(response => {
            if (response.success) {
                // Move loan from available to funded
                LendingState.availableLoans = LendingState.availableLoans.filter(l => l.id !== loanId);
                
                // Add to funded loans
                const fundedLoan = {
                    id: 'funded_' + Date.now(),
                    loanId: loanId,
                    borrowerName: loan.borrowerName,
                    amount: fundAmount,
                    fundedAmount: fundAmount,
                    fundedAt: new Date().toISOString().split('T')[0],
                    interestRate: loan.interestRate,
                    duration: loan.duration,
                    status: LoanStatus.FUNDED,
                    totalRepayment: fundAmount + (fundAmount * loan.interestRate * loan.duration) / (100 * 7),
                    repaidAmount: 0,
                    remainingAmount: fundAmount + (fundAmount * loan.interestRate * loan.duration) / (100 * 7),
                    nextPaymentDate: calculateNextPaymentDate(loan.duration),
                    nextPaymentAmount: (fundAmount + (fundAmount * loan.interestRate * loan.duration) / (100 * 7)) / loan.duration,
                    category: loan.category,
                    expectedCompletion: calculateCompletionDate(loan.duration)
                };
                
                LendingState.fundedLoans.push(fundedLoan);
                
                // Update portfolio
                updatePortfolioStats();
                
                // Save state
                saveLendingState();
                
                // Close modal
                const modal = document.getElementById('fundLoanModal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Update UI
                loadAvailableLoansList();
                loadFundedLoansList();
                
                showToast(`Successfully funded loan of ₵${fundAmount.toLocaleString()}`, 'success');
            } else {
                showToast('Failed to fund loan', 'error');
            }
        })
        .catch(error => {
            console.error('Lending: Error funding loan:', error);
            showToast('Error funding loan', 'error');
        });
}

// Open withdrawal modal
function openWithdrawalModal() {
    const availableBalance = LendingState.lendingPortfolio.totalReturns;
    
    // Update modal content
    const modalContent = `
        <h3>Request Withdrawal</h3>
        <div class="balance-summary">
            <div class="balance-amount">
                Available Balance: <strong>₵${availableBalance.toLocaleString()}</strong>
            </div>
        </div>
        
        <form id="withdrawalForm">
            <div class="form-group">
                <label for="withdrawalAmount">Amount (₵)</label>
                <input type="number" class="form-control" id="withdrawalAmount" 
                       name="withdrawalAmount" min="100" max="${availableBalance}" 
                       value="${availableBalance}" required>
                <small class="form-text text-muted">
                    Minimum: ₵100, Maximum: ₵${availableBalance.toLocaleString()}
                </small>
            </div>
            <div class="form-group">
                <label for="withdrawalMethod">Withdrawal Method</label>
                <select class="form-control" id="withdrawalMethod" name="withdrawalMethod" required>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="pesewa_wallet">Pesewa Wallet</option>
                </select>
            </div>
            <div class="form-group">
                <label for="accountDetails">Account Details</label>
                <input type="text" class="form-control" id="accountDetails" 
                       name="accountDetails" placeholder="e.g., 0551234567 (MTN)" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
                Request Withdrawal
            </button>
        </form>
    `;
    
    // Show modal
    const modal = document.getElementById('withdrawalModal');
    const modalBody = document.querySelector('#withdrawalModal .modal-body');
    
    if (modalBody) {
        modalBody.innerHTML = modalContent;
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Handle withdrawal
function handleWithdrawal() {
    const form = document.getElementById('withdrawalForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const amount = parseInt(formData.get('withdrawalAmount'));
    const method = formData.get('withdrawalMethod');
    const accountDetails = formData.get('accountDetails');
    
    const availableBalance = LendingState.lendingPortfolio.totalReturns;
    
    if (amount > availableBalance) {
        showToast('Withdrawal amount exceeds available balance', 'error');
        return;
    }
    
    if (amount < 100) {
        showToast('Minimum withdrawal amount is ₵100', 'error');
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/lending/withdraw', { amount, method, accountDetails })
        .then(response => {
            if (response.success) {
                // Add to withdrawal requests
                const withdrawalRequest = {
                    id: 'withdrawal_' + Date.now(),
                    amount: amount,
                    method: method,
                    accountDetails: accountDetails,
                    status: 'pending',
                    requestedAt: new Date().toISOString().split('T')[0],
                    processedAt: null
                };
                
                LendingState.withdrawalRequests.push(withdrawalRequest);
                
                // Update portfolio (reduce total returns)
                LendingState.lendingPortfolio.totalReturns -= amount;
                
                // Save state
                saveLendingState();
                
                // Close modal
                const modal = document.getElementById('withdrawalModal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Update UI
                loadWithdrawalSection();
                updatePortfolioUI();
                
                showToast(`Withdrawal request of ₵${amount.toLocaleString()} submitted`, 'success');
            } else {
                showToast('Failed to process withdrawal', 'error');
            }
        })
        .catch(error => {
            console.error('Lending: Error processing withdrawal:', error);
            showToast('Error processing withdrawal', 'error');
        });
}

// Cancel withdrawal
function cancelWithdrawal(requestId) {
    const request = LendingState.withdrawalRequests.find(r => r.id === requestId);
    if (!request) {
        showToast('Withdrawal request not found', 'error');
        return;
    }
    
    if (request.status !== 'pending') {
        showToast('Only pending withdrawals can be cancelled', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to cancel this withdrawal request?')) {
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/lending/cancel-withdrawal', { requestId })
        .then(response => {
            if (response.success) {
                // Update request status
                request.status = 'cancelled';
                
                // Return amount to portfolio
                LendingState.lendingPortfolio.totalReturns += request.amount;
                
                // Save state
                saveLendingState();
                
                // Update UI
                loadWithdrawalSection();
                updatePortfolioUI();
                
                showToast('Withdrawal request cancelled', 'success');
            } else {
                showToast('Failed to cancel withdrawal', 'error');
            }
        })
        .catch(error => {
            console.error('Lending: Error cancelling withdrawal:', error);
            showToast('Error cancelling withdrawal', 'error');
        });
}

// Save lender settings
function saveLenderSettings() {
    const form = document.getElementById('lenderSettingsForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const preferredCategories = Array.from(form.querySelectorAll('input[name="preferredCategories"]:checked'))
        .map(cb => cb.value);
    
    const settings = {
        autoFund: document.getElementById('autoFundToggle')?.checked || false,
        maxLoanAmount: parseInt(formData.get('maxLoanAmount')) || 5000,
        minCreditScore: parseInt(formData.get('minCreditScore')) || 600,
        preferredCategories: preferredCategories,
        riskTolerance: formData.get('riskTolerance') || 'medium'
    };
    
    // Validate settings
    if (settings.maxLoanAmount < 100) {
        showToast('Maximum loan amount must be at least ₵100', 'error');
        return;
    }
    
    if (settings.minCreditScore < 300 || settings.minCreditScore > 850) {
        showToast('Credit score must be between 300 and 850', 'error');
        return;
    }
    
    // Update state
    LendingState.lenderSettings = settings;
    
    // Save state
    saveLendingState();
    
    // Reload available loans with new settings
    loadAvailableLoans();
    loadAvailableLoansList();
    
    showToast('Lender settings saved successfully', 'success');
}

// View loan details
function viewLoanDetails(loanId) {
    // Find loan in available or funded
    let loan = LendingState.availableLoans.find(l => l.id === loanId);
    let isFunded = false;
    
    if (!loan) {
        loan = LendingState.fundedLoans.find(l => l.loanId === loanId);
        isFunded = true;
    }
    
    if (!loan) {
        showToast('Loan not found', 'error');
        return;
    }
    
    // Create modal content
    const modalContent = createLoanDetailsContent(loan, isFunded);
    
    // Show modal
    showModal('Loan Details', modalContent);
}

// Create loan details content
function createLoanDetailsContent(loan, isFunded) {
    let content = '';
    
    if (isFunded) {
        const progress = loan.totalRepayment > 0 ? (loan.repaidAmount / loan.totalRepayment) * 100 : 0;
        
        content = `
            <div class="loan-details-modal">
                <div class="loan-header">
                    <h3>Funded Loan Details</h3>
                    <span class="loan-status ${loan.status}">${loan.status.toUpperCase()}</span>
                </div>
                
                <div class="loan-info">
                    <div class="info-section">
                        <h4>Basic Information</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Borrower:</span>
                                <span class="info-value">${loan.borrowerName}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Original Amount:</span>
                                <span class="info-value">₵${loan.amount.toLocaleString()}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Funded Amount:</span>
                                <span class="info-value">₵${loan.fundedAmount.toLocaleString()}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Funded On:</span>
                                <span class="info-value">${formatDate(loan.fundedAt)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Category:</span>
                                <span class="info-value">${formatCategoryName(loan.category)}</span>
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
                    
                    ${loan.status === LoanStatus.REPAYING ? `
                        <div class="info-section">
                            <h4>Next Payment</h4>
                            <div class="next-payment">
                                <div class="payment-amount">₵${loan.nextPaymentAmount.toLocaleString()}</div>
                                <div class="payment-date">Due: ${formatDate(loan.nextPaymentDate)}</div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="info-section">
                        <h4>Timeline</h4>
                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="timeline-date">${formatDate(loan.fundedAt)}</div>
                                <div class="timeline-content">Loan Funded</div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-date">${formatDate(loan.expectedCompletion)}</div>
                                <div class="timeline-content">Expected Completion</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        const totalRepayment = loan.amount + (loan.amount * loan.interestRate * loan.duration) / (100 * 7);
        
        content = `
            <div class="loan-details-modal">
                <div class="loan-header">
                    <h3>Loan Request Details</h3>
                    <span class="loan-risk ${loan.riskLevel}">${loan.riskLevel.toUpperCase()} RISK</span>
                </div>
                
                <div class="loan-info">
                    <div class="info-section">
                        <h4>Borrower Information</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Name:</span>
                                <span class="info-value">${loan.borrowerName}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Credit Score:</span>
                                <span class="info-value score-badge ${getScoreClass(loan.borrowerScore)}">
                                    ${loan.borrowerScore}
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Location:</span>
                                <span class="info-value">${loan.location}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Repayment History:</span>
                                <span class="info-value">${loan.repaymentHistory}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Guarantors:</span>
                                <span class="info-value">${loan.guarantors}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h4>Loan Details</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Amount Requested:</span>
                                <span class="info-value">₵${loan.amount.toLocaleString()}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Purpose:</span>
                                <span class="info-value">${loan.purpose}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Category:</span>
                                <span class="info-value">${formatCategoryName(loan.category)}</span>
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
                                <span class="info-label">Total Repayment:</span>
                                <span class="info-value">₵${totalRepayment.toFixed(2)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Daily Payment:</span>
                                <span class="info-value">₵${(totalRepayment / loan.duration).toFixed(2)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Requested On:</span>
                                <span class="info-value">${formatDate(loan.requestedAt)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h4>Risk Assessment</h4>
                        <div class="risk-assessment">
                            <div class="risk-level ${loan.riskLevel}">
                                Risk Level: ${loan.riskLevel.toUpperCase()}
                            </div>
                            <p class="risk-note">
                                ${getRiskNote(loan.riskLevel)}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="openFundLoanModal('${loan.id}')">
                        Fund This Loan
                    </button>
                    <button class="btn btn-outline-secondary" onclick="closeModal()">
                        Close
                    </button>
                </div>
            </div>
        `;
    }
    
    return content;
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

function getScoreClass(score) {
    if (score >= 750) return 'excellent';
    if (score >= 700) return 'good';
    if (score >= 650) return 'fair';
    if (score >= 600) return 'poor';
    return 'very-poor';
}

function getRiskNote(riskLevel) {
    const notes = {
        low: 'This borrower has excellent credit history and multiple guarantors. Low default risk.',
        medium: 'Moderate risk level. Borrower has decent credit history but limited guarantors.',
        high: 'High risk level. Consider carefully. Borrower has lower credit score and no guarantors.'
    };
    return notes[riskLevel] || 'Risk assessment not available.';
}

function calculateNextPaymentDate(duration) {
    const date = new Date();
    date.setDate(date.getDate() + 1); // Next day
    return date.toISOString().split('T')[0];
}

function calculateCompletionDate(duration) {
    const date = new Date();
    date.setDate(date.getDate() + duration);
    return date.toISOString().split('T')[0];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showModal(title, content) {
    // Create modal if it doesn't exist
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

// Initialize lending module when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initLending();
});

// Export for use in other modules
window.PesewaLending = {
    initLending,
    loadAvailableLoansList,
    loadFundedLoansList,
    updatePortfolioStats,
    openFundLoanModal,
    openWithdrawalModal,
    saveLenderSettings,
    viewLoanDetails
};