'use strict';

// Pesewa.com - Ledger Module

// Ledger state
const LedgerState = {
    transactions: [],
    summary: {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        pendingTransactions: 0,
        clearedTransactions: 0
    },
    filters: {
        dateRange: 'all',
        transactionType: 'all',
        category: 'all',
        minAmount: 0,
        maxAmount: 100000
    },
    categories: {
        income: [
            'loan_interest',
            'subscription_fee',
            'commission',
            'refund',
            'other_income'
        ],
        expenses: [
            'loan_disbursement',
            'withdrawal_fee',
            'service_charge',
            'penalty_fee',
            'other_expenses'
        ]
    }
};

// Transaction types
const TransactionType = {
    INCOME: 'income',
    EXPENSE: 'expense'
};

// Transaction status
const TransactionStatus = {
    PENDING: 'pending',
    CLEARED: 'cleared',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
};

// Initialize ledger module
function initLedger() {
    console.log('Ledger: Initializing ledger module...');
    
    // Load ledger state
    loadLedgerState();
    
    // Initialize ledger UI
    initLedgerUI();
    
    // Initialize ledger event listeners
    initLedgerEvents();
    
    // Load transactions
    loadTransactions();
    
    // Update summary
    updateSummary();
    
    // Load charts
    loadLedgerCharts();
}

// Load ledger state from localStorage
function loadLedgerState() {
    try {
        const savedState = localStorage.getItem('pesewa_ledger');
        if (savedState) {
            const state = JSON.parse(savedState);
            Object.assign(LedgerState, state);
            console.log('Ledger: Loaded ledger state from localStorage');
        } else {
            // Initialize with default state
            initializeDefaultLedgerState();
        }
    } catch (error) {
        console.error('Ledger: Error loading ledger state:', error);
        initializeDefaultLedgerState();
    }
}

// Initialize default ledger state
function initializeDefaultLedgerState() {
    LedgerState.transactions = [];
    LedgerState.summary = {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        pendingTransactions: 0,
        clearedTransactions: 0
    };
    LedgerState.filters = {
        dateRange: 'all',
        transactionType: 'all',
        category: 'all',
        minAmount: 0,
        maxAmount: 100000
    };
}

// Save ledger state to localStorage
function saveLedgerState() {
    try {
        localStorage.setItem('pesewa_ledger', JSON.stringify(LedgerState));
        console.log('Ledger: Saved ledger state');
    } catch (error) {
        console.error('Ledger: Error saving ledger state:', error);
    }
}

// Initialize ledger UI
function initLedgerUI() {
    // Initialize ledger tabs
    initLedgerTabs();
    
    // Initialize date range picker
    initDateRangePicker();
    
    // Initialize transaction filters
    initTransactionFilters();
    
    // Initialize export functionality
    initExportFunctionality();
    
    // Initialize transaction details modal
    initTransactionDetailsModal();
    
    // Initialize reconciliation modal
    initReconciliationModal();
}

// Initialize ledger tabs
function initLedgerTabs() {
    const ledgerTabs = document.querySelectorAll('.ledger-tab');
    
    ledgerTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab
            ledgerTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            showLedgerTab(targetTab);
        });
    });
    
    // Set initial active tab
    const initialTab = document.querySelector('.ledger-tab.active');
    if (initialTab) {
        const initialTabId = initialTab.getAttribute('data-tab');
        showLedgerTab(initialTabId);
    }
}

// Show ledger tab content
function showLedgerTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.ledger-tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected tab content
    const targetContent = document.getElementById(`${tabId}Tab`);
    if (targetContent) {
        targetContent.style.display = 'block';
        
        // Load content based on tab
        switch(tabId) {
            case 'transactions':
                loadTransactionsList();
                break;
            case 'summary':
                loadSummaryDetails();
                break;
            case 'reports':
                loadReportsSection();
                break;
            case 'reconciliation':
                loadReconciliationSection();
                break;
        }
    }
}

// Initialize date range picker
function initDateRangePicker() {
    const dateRangeSelect = document.getElementById('dateRange');
    const customDateRange = document.getElementById('customDateRange');
    
    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                if (customDateRange) {
                    customDateRange.style.display = 'block';
                }
            } else {
                if (customDateRange) {
                    customDateRange.style.display = 'none';
                }
                applyFilters();
            }
        });
    }
    
    // Initialize custom date inputs
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    
    if (dateFrom && dateTo) {
        // Set default dates (last 30 days)
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        dateFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
        dateTo.value = today.toISOString().split('T')[0];
        
        dateFrom.addEventListener('change', applyFilters);
        dateTo.addEventListener('change', applyFilters);
    }
}

// Initialize transaction filters
function initTransactionFilters() {
    const filters = document.querySelectorAll('.transaction-filter');
    
    filters.forEach(filter => {
        filter.addEventListener('change', function() {
            applyFilters();
        });
    });
    
    // Amount range slider
    const amountRange = document.getElementById('amountRange');
    const amountValue = document.getElementById('amountValue');
    
    if (amountRange && amountValue) {
        amountRange.addEventListener('input', function() {
            amountValue.textContent = `₵${this.value}`;
            applyFilters();
        });
    }
}

// Initialize export functionality
function initExportFunctionality() {
    const exportBtn = document.getElementById('exportLedger');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportLedgerData);
    }
}

// Initialize transaction details modal
function initTransactionDetailsModal() {
    const transactionModal = document.getElementById('transactionDetailsModal');
    const closeTransaction = document.getElementById('closeTransactionDetails');
    
    if (closeTransaction) {
        closeTransaction.addEventListener('click', function() {
            transactionModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close modal on outside click
    if (transactionModal) {
        transactionModal.addEventListener('click', function(e) {
            if (e.target === transactionModal) {
                transactionModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// Initialize reconciliation modal
function initReconciliationModal() {
    const reconModal = document.getElementById('reconciliationModal');
    const closeRecon = document.getElementById('closeReconciliation');
    
    if (closeRecon) {
        closeRecon.addEventListener('click', function() {
            reconModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Close modal on outside click
    if (reconModal) {
        reconModal.addEventListener('click', function(e) {
            if (e.target === reconModal) {
                reconModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Reconciliation form submission
    const reconForm = document.getElementById('reconciliationForm');
    if (reconForm) {
        reconForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleReconciliation();
        });
    }
}

// Initialize ledger event listeners
function initLedgerEvents() {
    // View transaction details
    document.addEventListener('click', function(e) {
        if (e.target.closest('.view-transaction-btn')) {
            const button = e.target.closest('.view-transaction-btn');
            const transactionId = button.getAttribute('data-transaction-id');
            viewTransactionDetails(transactionId);
        }
        
        // Export button
        if (e.target.closest('#exportLedger')) {
            exportLedgerData();
        }
        
        // Reconcile button
        if (e.target.closest('#reconcileBtn')) {
            openReconciliationModal();
        }
        
        // Clear filter button
        if (e.target.closest('#clearFiltersBtn')) {
            clearFilters();
        }
    });
}

// Load transactions
function loadTransactions() {
    // In a real app, this would fetch from API
    const demoTransactions = [
        {
            id: 'trans_1',
            date: '2024-01-15',
            type: TransactionType.INCOME,
            category: 'loan_interest',
            description: 'Interest from loan to Kwame Mensah',
            amount: 225,
            status: TransactionStatus.CLEARED,
            reference: 'LOAN-001-INT',
            relatedTo: {
                type: 'loan',
                id: 'loan_001'
            },
            balanceAfter: 5225,
            metadata: {
                loanId: 'loan_001',
                borrowerName: 'Kwame Mensah',
                interestRate: '15%'
            }
        },
        {
            id: 'trans_2',
            date: '2024-01-14',
            type: TransactionType.EXPENSE,
            category: 'loan_disbursement',
            description: 'Loan disbursement to Ama Serwaa',
            amount: 2500,
            status: TransactionStatus.CLEARED,
            reference: 'LOAN-002-DISB',
            relatedTo: {
                type: 'loan',
                id: 'loan_002'
            },
            balanceAfter: 5000,
            metadata: {
                loanId: 'loan_002',
                borrowerName: 'Ama Serwaa',
                purpose: 'Business capital'
            }
        },
        {
            id: 'trans_3',
            date: '2024-01-13',
            type: TransactionType.INCOME,
            category: 'subscription_fee',
            description: 'Monthly subscription fee',
            amount: 250,
            status: TransactionStatus.CLEARED,
            reference: 'SUB-001-MON',
            relatedTo: {
                type: 'subscription',
                id: 'sub_001'
            },
            balanceAfter: 7500,
            metadata: {
                tier: 'premium',
                period: 'January 2024'
            }
        },
        {
            id: 'trans_4',
            date: '2024-01-12',
            type: TransactionType.INCOME,
            category: 'commission',
            description: 'Commission from referral',
            amount: 100,
            status: TransactionStatus.PENDING,
            reference: 'REF-001-COM',
            relatedTo: {
                type: 'referral',
                id: 'ref_001'
            },
            balanceAfter: 7250,
            metadata: {
                referredUser: 'Kofi Asante',
                referralCode: 'PESEWA123'
            }
        },
        {
            id: 'trans_5',
            date: '2024-01-11',
            type: TransactionType.EXPENSE,
            category: 'withdrawal_fee',
            description: 'Withdrawal processing fee',
            amount: 10,
            status: TransactionStatus.CLEARED,
            reference: 'WITH-001-FEE',
            relatedTo: {
                type: 'withdrawal',
                id: 'with_001'
            },
            balanceAfter: 7150,
            metadata: {
                withdrawalAmount: 1000,
                method: 'mobile_money'
            }
        },
        {
            id: 'trans_6',
            date: '2024-01-10',
            type: TransactionType.INCOME,
            category: 'loan_interest',
            description: 'Interest from loan to Yaw Ofori',
            amount: 150,
            status: TransactionStatus.CLEARED,
            reference: 'LOAN-003-INT',
            relatedTo: {
                type: 'loan',
                id: 'loan_003'
            },
            balanceAfter: 7160,
            metadata: {
                loanId: 'loan_003',
                borrowerName: 'Yaw Ofori',
                interestRate: '15%'
            }
        },
        {
            id: 'trans_7',
            date: '2024-01-09',
            type: TransactionType.EXPENSE,
            category: 'service_charge',
            description: 'Monthly service charge',
            amount: 50,
            status: TransactionStatus.CLEARED,
            reference: 'SVC-001-MON',
            relatedTo: {
                type: 'service',
                id: 'svc_001'
            },
            balanceAfter: 7010,
            metadata: {
                service: 'Platform maintenance',
                period: 'January 2024'
            }
        },
        {
            id: 'trans_8',
            date: '2024-01-08',
            type: TransactionType.INCOME,
            category: 'refund',
            description: 'Refund for cancelled loan request',
            amount: 500,
            status: TransactionStatus.CLEARED,
            reference: 'REFUND-001',
            relatedTo: {
                type: 'refund',
                id: 'refund_001'
            },
            balanceAfter: 7060,
            metadata: {
                originalTransaction: 'trans_9',
                reason: 'Loan request cancelled'
            }
        }
    ];
    
    LedgerState.transactions = demoTransactions;
    console.log('Ledger: Loaded transactions:', LedgerState.transactions.length);
}

// Load transactions list
function loadTransactionsList() {
    const container = document.getElementById('transactionsList');
    if (!container) return;
    
    // Apply filters
    const filteredTransactions = filterTransactions();
    
    if (filteredTransactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No Transactions Found</h3>
                <p>No transactions match your filter criteria.</p>
                <button class="btn btn-primary" onclick="clearFilters()">
                    Clear Filters
                </button>
            </div>
        `;
        return;
    }
    
    let transactionsHTML = `
        <div class="transactions-header">
            <div class="transactions-count">
                Showing ${filteredTransactions.length} of ${LedgerState.transactions.length} transactions
            </div>
            <div class="transactions-actions">
                <button class="btn btn-sm btn-outline-secondary" onclick="exportFilteredTransactions()">
                    Export Filtered
                </button>
            </div>
        </div>
        <div class="transactions-table-container">
            <table class="transactions-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Balance</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    filteredTransactions.forEach(transaction => {
        const amountClass = transaction.type === TransactionType.INCOME ? 'text-success' : 'text-danger';
        const amountSign = transaction.type === TransactionType.INCOME ? '+' : '-';
        
        transactionsHTML += `
            <tr class="transaction-row ${transaction.status}">
                <td>${formatDate(transaction.date)}</td>
                <td>
                    <div class="transaction-description">
                        <div class="description-main">${transaction.description}</div>
                        <div class="description-reference">Ref: ${transaction.reference}</div>
                    </div>
                </td>
                <td>
                    <span class="category-badge ${transaction.category}">
                        ${formatCategoryName(transaction.category)}
                    </span>
                </td>
                <td>
                    <span class="type-badge ${transaction.type}">
                        ${transaction.type.toUpperCase()}
                    </span>
                </td>
                <td class="${amountClass}">
                    <strong>${amountSign}₵${transaction.amount.toLocaleString()}</strong>
                </td>
                <td>
                    <span class="status-badge ${transaction.status}">
                        ${transaction.status.toUpperCase()}
                    </span>
                </td>
                <td>₵${transaction.balanceAfter.toLocaleString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary view-transaction-btn" 
                            data-transaction-id="${transaction.id}">
                        View
                    </button>
                </td>
            </tr>
        `;
    });
    
    transactionsHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = transactionsHTML;
}

// Filter transactions
function filterTransactions() {
    const filters = LedgerState.filters;
    let filtered = [...LedgerState.transactions];
    
    // Filter by date range
    if (filters.dateRange !== 'all') {
        const today = new Date();
        let startDate = new Date();
        
        switch(filters.dateRange) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(today.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(today.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(today.getFullYear() - 1);
                break;
        }
        
        filtered = filtered.filter(trans => {
            const transDate = new Date(trans.date);
            return transDate >= startDate;
        });
    }
    
    // Filter by transaction type
    if (filters.transactionType !== 'all') {
        filtered = filtered.filter(trans => trans.type === filters.transactionType);
    }
    
    // Filter by category
    if (filters.category !== 'all') {
        filtered = filtered.filter(trans => trans.category === filters.category);
    }
    
    // Filter by amount range
    filtered = filtered.filter(trans => {
        return trans.amount >= filters.minAmount && trans.amount <= filters.maxAmount;
    });
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return filtered;
}

// Apply filters
function applyFilters() {
    // Get filter values
    const dateRange = document.getElementById('dateRange');
    const transactionType = document.getElementById('transactionType');
    const category = document.getElementById('transactionCategory');
    const amountRange = document.getElementById('amountRange');
    
    if (dateRange) LedgerState.filters.dateRange = dateRange.value;
    if (transactionType) LedgerState.filters.transactionType = transactionType.value;
    if (category) LedgerState.filters.category = category.value;
    if (amountRange) LedgerState.filters.maxAmount = parseInt(amountRange.value);
    
    // Apply custom date range if selected
    if (dateRange && dateRange.value === 'custom') {
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        
        if (dateFrom && dateTo) {
            // This would be handled in filterTransactions
        }
    }
    
    // Reload transactions list
    loadTransactionsList();
    
    // Update summary with filtered data
    updateSummary();
}

// Clear filters
function clearFilters() {
    // Reset filter inputs
    const dateRange = document.getElementById('dateRange');
    const transactionType = document.getElementById('transactionType');
    const category = document.getElementById('transactionCategory');
    const amountRange = document.getElementById('amountRange');
    const amountValue = document.getElementById('amountValue');
    const customDateRange = document.getElementById('customDateRange');
    
    if (dateRange) dateRange.value = 'all';
    if (transactionType) transactionType.value = 'all';
    if (category) category.value = 'all';
    if (amountRange) {
        amountRange.value = 100000;
        if (amountValue) amountValue.textContent = '₵100,000';
    }
    if (customDateRange) customDateRange.style.display = 'none';
    
    // Reset filter state
    LedgerState.filters = {
        dateRange: 'all',
        transactionType: 'all',
        category: 'all',
        minAmount: 0,
        maxAmount: 100000
    };
    
    // Reload transactions
    loadTransactionsList();
    updateSummary();
}

// Update summary
function updateSummary() {
    const filteredTransactions = filterTransactions();
    
    // Calculate summary
    const summary = {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        pendingTransactions: 0,
        clearedTransactions: 0
    };
    
    filteredTransactions.forEach(trans => {
        if (trans.type === TransactionType.INCOME) {
            summary.totalIncome += trans.amount;
        } else {
            summary.totalExpenses += trans.amount;
        }
        
        if (trans.status === TransactionStatus.PENDING) {
            summary.pendingTransactions++;
        } else if (trans.status === TransactionStatus.CLEARED) {
            summary.clearedTransactions++;
        }
    });
    
    summary.netBalance = summary.totalIncome - summary.totalExpenses;
    
    // Update state
    LedgerState.summary = summary;
    
    // Update UI
    updateSummaryCards();
    
    // Save state
    saveLedgerState();
}

// Update summary cards
function updateSummaryCards() {
    const summary = LedgerState.summary;
    
    // Update cards
    updateSummaryCard('totalIncome', summary.totalIncome, '₵');
    updateSummaryCard('totalExpenses', summary.totalExpenses, '₵');
    updateSummaryCard('netBalance', summary.netBalance, '₵');
    updateSummaryCard('pendingTransactions', summary.pendingTransactions);
    updateSummaryCard('clearedTransactions', summary.clearedTransactions);
    
    // Update net balance color
    const netBalanceEl = document.getElementById('netBalance');
    if (netBalanceEl) {
        netBalanceEl.classList.remove('text-success', 'text-danger');
        if (summary.netBalance >= 0) {
            netBalanceEl.classList.add('text-success');
        } else {
            netBalanceEl.classList.add('text-danger');
        }
    }
}

// Update summary card
function updateSummaryCard(elementId, value, prefix = '') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = `${prefix}${typeof value === 'number' ? value.toLocaleString() : value}`;
    }
}

// Load summary details
function loadSummaryDetails() {
    updateSummary();
    loadSummaryCharts();
}

// Load summary charts
function loadSummaryCharts() {
    loadIncomeExpenseChart();
    loadCategoryBreakdownChart();
    loadMonthlyTrendChart();
}

// Load income vs expense chart
function loadIncomeExpenseChart() {
    const container = document.getElementById('incomeExpenseChart');
    if (!container) return;
    
    const summary = LedgerState.summary;
    
    // Create simple bar chart
    const maxValue = Math.max(summary.totalIncome, summary.totalExpenses, 1000);
    const incomePercent = (summary.totalIncome / maxValue) * 100;
    const expensePercent = (summary.totalExpenses / maxValue) * 100;
    
    container.innerHTML = `
        <div class="chart-container">
            <h4>Income vs Expenses</h4>
            <div class="chart-bars">
                <div class="chart-bar income">
                    <div class="bar-label">Income</div>
                    <div class="bar-container">
                        <div class="bar-fill" style="height: ${incomePercent}%"></div>
                    </div>
                    <div class="bar-value">₵${summary.totalIncome.toLocaleString()}</div>
                </div>
                <div class="chart-bar expense">
                    <div class="bar-label">Expenses</div>
                    <div class="bar-container">
                        <div class="bar-fill" style="height: ${expensePercent}%"></div>
                    </div>
                    <div class="bar-value">₵${summary.totalExpenses.toLocaleString()}</div>
                </div>
            </div>
            <div class="chart-legend">
                <div class="legend-item">
                    <span class="legend-color income"></span>
                    <span class="legend-label">Total Income</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color expense"></span>
                    <span class="legend-label">Total Expenses</span>
                </div>
            </div>
        </div>
    `;
}

// Load category breakdown chart
function loadCategoryBreakdownChart() {
    const container = document.getElementById('categoryBreakdownChart');
    if (!container) return;
    
    // Calculate category totals
    const categoryTotals = {};
    const filteredTransactions = filterTransactions();
    
    filteredTransactions.forEach(trans => {
        if (!categoryTotals[trans.category]) {
            categoryTotals[trans.category] = 0;
        }
        categoryTotals[trans.category] += trans.amount;
    });
    
    if (Object.keys(categoryTotals).length === 0) {
        container.innerHTML = `
            <div class="empty-chart">
                <p>No data available</p>
            </div>
        `;
        return;
    }
    
    // Create pie chart visualization
    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    let chartHTML = '<div class="chart-container"><h4>Category Breakdown</h4><div class="pie-chart">';
    
    let startAngle = 0;
    Object.entries(categoryTotals).forEach(([category, amount]) => {
        const percentage = (amount / total) * 100;
        const angle = (percentage / 100) * 360;
        const color = getCategoryColor(category);
        
        chartHTML += `
            <div class="pie-slice" style="
                --start: ${startAngle}deg;
                --end: ${startAngle + angle}deg;
                --color: ${color};
            "></div>
        `;
        
        startAngle += angle;
    });
    
    chartHTML += '</div><div class="pie-legend">';
    
    Object.entries(categoryTotals).forEach(([category, amount]) => {
        const percentage = (amount / total) * 100;
        chartHTML += `
            <div class="legend-item">
                <span class="legend-color" style="background-color: ${getCategoryColor(category)}"></span>
                <span class="legend-label">${formatCategoryName(category)}</span>
                <span class="legend-value">${percentage.toFixed(1)}% (₵${amount.toLocaleString()})</span>
            </div>
        `;
    });
    
    chartHTML += '</div></div>';
    container.innerHTML = chartHTML;
}

// Load monthly trend chart
function loadMonthlyTrendChart() {
    const container = document.getElementById('monthlyTrendChart');
    if (!container) return;
    
    // Calculate monthly totals
    const monthlyData = {};
    const filteredTransactions = filterTransactions();
    
    filteredTransactions.forEach(trans => {
        const date = new Date(trans.date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { income: 0, expenses: 0 };
        }
        
        if (trans.type === TransactionType.INCOME) {
            monthlyData[monthYear].income += trans.amount;
        } else {
            monthlyData[monthYear].expenses += trans.amount;
        }
    });
    
    // Sort months
    const sortedMonths = Object.keys(monthlyData).sort();
    
    if (sortedMonths.length === 0) {
        container.innerHTML = `
            <div class="empty-chart">
                <p>No data available</p>
            </div>
        `;
        return;
    }
    
    // Find max value for scaling
    const allValues = sortedMonths.flatMap(month => [
        monthlyData[month].income,
        monthlyData[month].expenses
    ]);
    const maxValue = Math.max(...allValues, 1000);
    
    let chartHTML = `
        <div class="chart-container">
            <h4>Monthly Trend</h4>
            <div class="trend-chart">
                <div class="chart-grid">
    `;
    
    // Add grid lines
    for (let i = 0; i <= 4; i++) {
        const value = (maxValue * i) / 4;
        chartHTML += `
            <div class="grid-line" style="bottom: ${(i / 4) * 100}%">
                <span class="grid-label">₵${value.toLocaleString()}</span>
            </div>
        `;
    }
    
    // Add bars for each month
    sortedMonths.forEach((month, index) => {
        const data = monthlyData[month];
        const incomePercent = (data.income / maxValue) * 100;
        const expensePercent = (data.expenses / maxValue) * 100;
        
        chartHTML += `
            <div class="chart-column">
                <div class="column-group">
                    <div class="column-bar income" style="height: ${incomePercent}%">
                        <div class="bar-tooltip">Income: ₵${data.income.toLocaleString()}</div>
                    </div>
                    <div class="column-bar expense" style="height: ${expensePercent}%">
                        <div class="bar-tooltip">Expenses: ₵${data.expenses.toLocaleString()}</div>
                    </div>
                </div>
                <div class="column-label">${formatMonth(month)}</div>
            </div>
        `;
    });
    
    chartHTML += `
                </div>
            </div>
            <div class="chart-legend">
                <div class="legend-item">
                    <span class="legend-color income"></span>
                    <span class="legend-label">Income</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color expense"></span>
                    <span class="legend-label">Expenses</span>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = chartHTML;
}

// Load reports section
function loadReportsSection() {
    const container = document.getElementById('reportsSection');
    if (!container) return;
    
    container.innerHTML = `
        <div class="reports-grid">
            <div class="report-card">
                <div class="report-icon">📊</div>
                <h4>Income Statement</h4>
                <p>Detailed report of all income and expenses</p>
                <button class="btn btn-outline-primary" onclick="generateIncomeStatement()">
                    Generate Report
                </button>
            </div>
            
            <div class="report-card">
                <div class="report-icon">📈</div>
                <h4>Cash Flow Report</h4>
                <p>Analysis of cash inflows and outflows</p>
                <button class="btn btn-outline-primary" onclick="generateCashFlowReport()">
                    Generate Report
                </button>
            </div>
            
            <div class="report-card">
                <div class="report-icon">🧾</div>
                <h4>Tax Summary</h4>
                <p>Tax-related transactions and summaries</p>
                <button class="btn btn-outline-primary" onclick="generateTaxSummary()">
                    Generate Report
                </button>
            </div>
            
            <div class="report-card">
                <div class="report-icon">👥</div>
                <h4>Partner Reports</h4>
                <p>Reports for lenders, borrowers, and partners</p>
                <button class="btn btn-outline-primary" onclick="generatePartnerReports()">
                    Generate Report
                </button>
            </div>
        </div>
        
        <div class="report-history">
            <h4>Recent Reports</h4>
            <div class="recent-reports">
                <div class="report-item">
                    <div class="report-info">
                        <div class="report-name">Monthly Summary - Jan 2024</div>
                        <div class="report-date">Generated on 2024-01-15</div>
                    </div>
                    <div class="report-actions">
                        <button class="btn btn-sm btn-outline-secondary" onclick="downloadReport('monthly_jan_2024')">
                            Download
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="viewReport('monthly_jan_2024')">
                            View
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load reconciliation section
function loadReconciliationSection() {
    const container = document.getElementById('reconciliationSection');
    if (!container) return;
    
    // Calculate reconciliation status
    const pendingTransactions = LedgerState.transactions.filter(
        t => t.status === TransactionStatus.PENDING
    );
    
    const lastReconciliation = {
        date: '2024-01-10',
        reconciledAmount: 15000,
        difference: 0,
        status: 'success'
    };
    
    container.innerHTML = `
        <div class="reconciliation-status">
            <div class="status-card">
                <h4>Reconciliation Status</h4>
                <div class="status-indicator success">
                    <div class="status-icon">✅</div>
                    <div class="status-text">
                        <div class="status-title">Up to Date</div>
                        <div class="status-detail">
                            Last reconciled: ${formatDate(lastReconciliation.date)}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="pending-transactions">
                <h4>Pending Transactions (${pendingTransactions.length})</h4>
                ${pendingTransactions.length > 0 ? `
                    <div class="pending-list">
                        ${pendingTransactions.slice(0, 3).map(trans => `
                            <div class="pending-item">
                                <div class="pending-info">
                                    <div class="pending-description">${trans.description}</div>
                                    <div class="pending-meta">
                                        <span class="pending-date">${formatDate(trans.date)}</span>
                                        <span class="pending-amount">₵${trans.amount.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div class="pending-actions">
                                    <button class="btn btn-sm btn-success" onclick="reconcileTransaction('${trans.id}')">
                                        Clear
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                        ${pendingTransactions.length > 3 ? `
                            <div class="pending-more">
                                And ${pendingTransactions.length - 3} more transactions...
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="empty-pending">
                        <p>No pending transactions to reconcile</p>
                    </div>
                `}
            </div>
        </div>
        
        <div class="reconciliation-actions">
            <button class="btn btn-primary" id="reconcileBtn">
                Start Reconciliation
            </button>
            <button class="btn btn-outline-secondary" onclick="viewReconciliationHistory()">
                View History
            </button>
        </div>
    `;
}

// Load ledger charts
function loadLedgerCharts() {
    // This is a wrapper for all chart loading
    if (document.getElementById('incomeExpenseChart')) {
        loadIncomeExpenseChart();
    }
    if (document.getElementById('categoryBreakdownChart')) {
        loadCategoryBreakdownChart();
    }
    if (document.getElementById('monthlyTrendChart')) {
        loadMonthlyTrendChart();
    }
}

// View transaction details
function viewTransactionDetails(transactionId) {
    const transaction = LedgerState.transactions.find(t => t.id === transactionId);
    if (!transaction) {
        showToast('Transaction not found', 'error');
        return;
    }
    
    const amountClass = transaction.type === TransactionType.INCOME ? 'success' : 'danger';
    const amountSign = transaction.type === TransactionType.INCOME ? '+' : '-';
    
    const modalContent = `
        <div class="transaction-details-modal">
            <div class="transaction-header">
                <h3>Transaction Details</h3>
                <span class="transaction-reference">${transaction.reference}</span>
            </div>
            
            <div class="transaction-summary">
                <div class="summary-amount ${amountClass}">
                    ${amountSign}₵${transaction.amount.toLocaleString()}
                </div>
                <div class="summary-description">${transaction.description}</div>
                <div class="summary-date">${formatDate(transaction.date)}</div>
            </div>
            
            <div class="transaction-details">
                <div class="detail-section">
                    <h4>Basic Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">
                                <span class="status-badge ${transaction.status}">
                                    ${transaction.status.toUpperCase()}
                                </span>
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Type:</span>
                            <span class="detail-value">
                                <span class="type-badge ${transaction.type}">
                                    ${transaction.type.toUpperCase()}
                                </span>
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Category:</span>
                            <span class="detail-value">
                                <span class="category-badge ${transaction.category}">
                                    ${formatCategoryName(transaction.category)}
                                </span>
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Balance After:</span>
                            <span class="detail-value">₵${transaction.balanceAfter.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                ${transaction.relatedTo ? `
                    <div class="detail-section">
                        <h4>Related Information</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">Related To:</span>
                                <span class="detail-value">${transaction.relatedTo.type.toUpperCase()}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Reference ID:</span>
                                <span class="detail-value">${transaction.relatedTo.id}</span>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                ${transaction.metadata ? `
                    <div class="detail-section">
                        <h4>Additional Details</h4>
                        <div class="metadata-grid">
                            ${Object.entries(transaction.metadata).map(([key, value]) => `
                                <div class="metadata-item">
                                    <span class="metadata-label">${formatMetadataKey(key)}:</span>
                                    <span class="metadata-value">${value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="transaction-actions">
                ${transaction.status === TransactionStatus.PENDING ? `
                    <button class="btn btn-success" onclick="reconcileTransaction('${transaction.id}')">
                        Mark as Cleared
                    </button>
                ` : ''}
                <button class="btn btn-outline-secondary" onclick="closeModal()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    showModal('Transaction Details', modalContent);
}

// Reconcile transaction
function reconcileTransaction(transactionId) {
    const transaction = LedgerState.transactions.find(t => t.id === transactionId);
    if (!transaction) {
        showToast('Transaction not found', 'error');
        return;
    }
    
    if (transaction.status !== TransactionStatus.PENDING) {
        showToast('Transaction is not pending', 'info');
        return;
    }
    
    if (!confirm('Mark this transaction as cleared?')) {
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/ledger/reconcile', { transactionId })
        .then(response => {
            if (response.success) {
                // Update transaction status
                transaction.status = TransactionStatus.CLEARED;
                
                // Save state
                saveLedgerState();
                
                // Update UI
                loadTransactionsList();
                updateSummary();
                loadReconciliationSection();
                
                showToast('Transaction marked as cleared', 'success');
                
                // Close modal if open
                closeModal();
            } else {
                showToast('Failed to reconcile transaction', 'error');
            }
        })
        .catch(error => {
            console.error('Ledger: Error reconciling transaction:', error);
            showToast('Error reconciling transaction', 'error');
        });
}

// Open reconciliation modal
function openReconciliationModal() {
    // Get pending transactions
    const pendingTransactions = LedgerState.transactions.filter(
        t => t.status === TransactionStatus.PENDING
    );
    
    if (pendingTransactions.length === 0) {
        showToast('No pending transactions to reconcile', 'info');
        return;
    }
    
    const totalPending = pendingTransactions.reduce((sum, trans) => sum + trans.amount, 0);
    
    const modalContent = `
        <div class="reconciliation-modal">
            <h3>Reconcile Transactions</h3>
            
            <div class="reconciliation-summary">
                <div class="summary-item">
                    <span class="summary-label">Pending Transactions:</span>
                    <span class="summary-value">${pendingTransactions.length}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Total Amount:</span>
                    <span class="summary-value">₵${totalPending.toLocaleString()}</span>
                </div>
            </div>
            
            <form id="reconciliationForm">
                <div class="form-group">
                    <label for="reconciliationDate">Reconciliation Date</label>
                    <input type="date" class="form-control" id="reconciliationDate" 
                           name="reconciliationDate" 
                           value="${new Date().toISOString().split('T')[0]}" 
                           required>
                </div>
                
                <div class="form-group">
                    <label for="reconciliationNotes">Notes</label>
                    <textarea class="form-control" id="reconciliationNotes" 
                              name="reconciliationNotes" rows="3"
                              placeholder="Add any notes about this reconciliation"></textarea>
                </div>
                
                <div class="form-group">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="confirmReconciliation" required>
                        <label class="form-check-label" for="confirmReconciliation">
                            I confirm that all transactions have been verified
                        </label>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">
                    Complete Reconciliation
                </button>
            </form>
            
            <div class="pending-transactions-preview">
                <h5>Pending Transactions to be Cleared</h5>
                <div class="preview-list">
                    ${pendingTransactions.slice(0, 5).map(trans => `
                        <div class="preview-item">
                            <span class="preview-description">${trans.description}</span>
                            <span class="preview-amount">₵${trans.amount.toLocaleString()}</span>
                        </div>
                    `).join('')}
                    ${pendingTransactions.length > 5 ? `
                        <div class="preview-more">
                            And ${pendingTransactions.length - 5} more transactions...
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Show modal
    const modal = document.getElementById('reconciliationModal');
    const modalBody = document.querySelector('#reconciliationModal .modal-body');
    
    if (modalBody) {
        modalBody.innerHTML = modalContent;
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Handle reconciliation
function handleReconciliation() {
    const form = document.getElementById('reconciliationForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const reconciliationDate = formData.get('reconciliationDate');
    const notes = formData.get('reconciliationNotes');
    
    // Get pending transactions
    const pendingTransactions = LedgerState.transactions.filter(
        t => t.status === TransactionStatus.PENDING
    );
    
    if (pendingTransactions.length === 0) {
        showToast('No pending transactions to reconcile', 'info');
        return;
    }
    
    // Simulate API call
    simulateAPI('/api/ledger/bulk-reconcile', {
        date: reconciliationDate,
        notes: notes,
        transactionIds: pendingTransactions.map(t => t.id)
    })
    .then(response => {
        if (response.success) {
            // Update all pending transactions
            pendingTransactions.forEach(trans => {
                trans.status = TransactionStatus.CLEARED;
            });
            
            // Save state
            saveLedgerState();
            
            // Close modal
            const modal = document.getElementById('reconciliationModal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            // Update UI
            loadTransactionsList();
            updateSummary();
            loadReconciliationSection();
            
            showToast('Reconciliation completed successfully!', 'success');
        } else {
            showToast('Reconciliation failed', 'error');
        }
    })
    .catch(error => {
        console.error('Ledger: Error during reconciliation:', error);
        showToast('Error during reconciliation', 'error');
    });
}

// Export ledger data
function exportLedgerData() {
    const filteredTransactions = filterTransactions();
    
    if (filteredTransactions.length === 0) {
        showToast('No transactions to export', 'info');
        return;
    }
    
    // Create CSV content
    let csvContent = 'Date,Description,Category,Type,Amount,Status,Reference,Balance\n';
    
    filteredTransactions.forEach(trans => {
        const row = [
            trans.date,
            `"${trans.description}"`,
            trans.category,
            trans.type,
            trans.amount,
            trans.status,
            trans.reference,
            trans.balanceAfter
        ];
        csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('Ledger data exported successfully', 'success');
}

// Export filtered transactions
function exportFilteredTransactions() {
    exportLedgerData();
}

// View reconciliation history
function viewReconciliationHistory() {
    showToast('Reconciliation history coming soon', 'info');
}

// Generate income statement
function generateIncomeStatement() {
    showToast('Income statement generation coming soon', 'info');
}

// Generate cash flow report
function generateCashFlowReport() {
    showToast('Cash flow report generation coming soon', 'info');
}

// Generate tax summary
function generateTaxSummary() {
    showToast('Tax summary generation coming soon', 'info');
}

// Generate partner reports
function generatePartnerReports() {
    showToast('Partner reports generation coming soon', 'info');
}

// Download report
function downloadReport(reportId) {
    showToast(`Downloading report: ${reportId}`, 'info');
}

// View report
function viewReport(reportId) {
    showToast(`Viewing report: ${reportId}`, 'info');
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCategoryName(category) {
    return category.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatMetadataKey(key) {
    return key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatMonth(monthYear) {
    const [year, month] = monthYear.split('-');
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getCategoryColor(category) {
    const colors = {
        'loan_interest': '#4CAF50',
        'subscription_fee': '#2196F3',
        'commission': '#9C27B0',
        'refund': '#FF9800',
        'other_income': '#607D8B',
        'loan_disbursement': '#F44336',
        'withdrawal_fee': '#E91E63',
        'service_charge': '#795548',
        'penalty_fee': '#FF5722',
        'other_expenses': '#9E9E9E'
    };
    return colors[category] || '#000000';
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

// Initialize ledger module when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initLedger();
});

// Export for use in other modules
window.PesewaLedger = {
    initLedger,
    loadTransactionsList,
    applyFilters,
    clearFilters,
    updateSummary,
    exportLedgerData,
    viewTransactionDetails,
    openReconciliationModal
};