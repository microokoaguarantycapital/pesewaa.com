'use strict';

/**
 * Pesewa.com - Lending Module
 * Handles lender operations: loan approval, ledger management, borrower ratings
 */

const PesewaLending = {
    // Lending data
    pendingLoans: [],
    activeLoans: [],
    completedLoans: [],
    
    // Lender statistics
    stats: {
        totalLent: 0,
        activeLoans: 0,
        totalBorrowers: 0,
        totalInterest: 0,
        repaymentRate: 100
    },

    // Initialize lending module
    init() {
        console.log('Pesewa Lending Initializing...');
        
        // Check if user is a lender
        if (!this.isLender()) {
            console.log('User is not a lender, skipping lending initialization');
            return;
        }
        
        // Load lending data
        this.loadLendingData();
        
        // Setup loan approval
        this.setupLoanApproval();
        
        // Setup ledger management
        this.setupLedgerManagement();
        
        // Setup borrower ratings
        this.setupBorrowerRatings();
        
        // Setup lending dashboard
        this.setupLendingDashboard();
        
        console.log('Pesewa Lending Initialized');
    },

    // Check if user is a lender
    isLender() {
        const user = this.getCurrentUser();
        return user && (user.type === 'lender' || user.type === 'both');
    },

    // Load lending data
    async loadLendingData() {
        try {
            const userId = this.getCurrentUser()?.id;
            if (!userId) return;
            
            // Load from localStorage
            const storedData = localStorage.getItem(`pesewa_lender_${userId}`);
            if (storedData) {
                const data = JSON.parse(storedData);
                this.pendingLoans = data.pendingLoans || [];
                this.activeLoans = data.activeLoans || [];
                this.completedLoans = data.completedLoans || [];
                this.stats = data.stats || this.stats;
            }
            
            // Load pending loan requests
            await this.loadPendingLoanRequests();
            
        } catch (error) {
            console.error('Error loading lending data:', error);
        }
    },

    // Load pending loan requests
    async loadPendingLoanRequests() {
        try {
            // In production, this would fetch from API
            // For demo, create sample pending loans
            this.pendingLoans = this.createSamplePendingLoans();
            
            // Display pending loans
            this.displayPendingLoans();
            
        } catch (error) {
            console.error('Error loading pending loans:', error);
        }
    },

    // Setup loan approval
    setupLoanApproval() {
        // Approve loan buttons
        const approveButtons = document.querySelectorAll('[data-action="approve-loan"]');
        approveButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const loanId = button.getAttribute('data-loan-id');
                await this.approveLoan(loanId);
            });
        });
        
        // Reject loan buttons
        const rejectButtons = document.querySelectorAll('[data-action="reject-loan"]');
        rejectButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const loanId = button.getAttribute('data-loan-id');
                await this.rejectLoan(loanId);
            });
        });
        
        // Loan approval form
        const approvalForm = document.getElementById('loanApprovalForm');
        if (approvalForm) {
            approvalForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLoanApproval(approvalForm);
            });
        }
    },

    // Setup ledger management
    setupLedgerManagement() {
        // Update repayment buttons
        const updateButtons = document.querySelectorAll('[data-action="update-repayment"]');
        updateButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const loanId = button.getAttribute('data-loan-id');
                await this.showRepaymentUpdateModal(loanId);
            });
        });
        
        // Mark as repaid buttons
        const repayButtons = document.querySelectorAll('[data-action="mark-repaid"]');
        repayButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const loanId = button.getAttribute('data-loan-id');
                await this.markLoanAsRepaid(loanId);
            });
        });
        
        // Ledger search and filter
        this.setupLedgerFilters();
    },

    // Setup borrower ratings
    setupBorrowerRatings() {
        const ratingForms = document.querySelectorAll('[data-action="rate-borrower"]');
        
        ratingForms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleBorrowerRating(form);
            });
        });
        
        // Star rating widgets
        const starRatings = document.querySelectorAll('.star-rating');
        starRatings.forEach(rating => {
            rating.addEventListener('click', (e) => {
                const star = e.target.closest('.star');
                if (star) {
                    const ratingValue = star.getAttribute('data-value');
                    this.setStarRating(rating, ratingValue);
                }
            });
        });
    },

    // Setup lending dashboard
    setupLendingDashboard() {
        // Update dashboard stats
        this.updateDashboardStats();
        
        // Load active loans
        this.displayActiveLoans();
        
        // Load completed loans
        this.displayCompletedLoans();
        
        // Setup quick actions
        this.setupQuickActions();
    },

    // Approve a loan
    async approveLoan(loanId) {
        try {
            const loan = this.pendingLoans.find(l => l.id === loanId);
            if (!loan) {
                throw new Error('Loan request not found');
            }
            
            // Check if lender can approve this loan
            if (!this.canApproveLoan(loan)) {
                throw new Error('You cannot approve this loan');
            }
            
            // Check subscription status
            if (!this.checkSubscriptionStatus()) {
                throw new Error('Your subscription needs to be active to approve loans');
            }
            
            // Check lending limits
            if (!this.checkLendingLimits(loan.amount)) {
                throw new Error('Loan amount exceeds your lending limit');
            }
            
            // Show approval modal
            const approved = await this.showApprovalModal(loan);
            if (!approved) return;
            
            // Process loan approval
            const activeLoan = await this.processLoanApproval(loan);
            
            // Remove from pending loans
            this.pendingLoans = this.pendingLoans.filter(l => l.id !== loanId);
            
            // Add to active loans
            this.activeLoans.push(activeLoan);
            
            // Update stats
            this.updateLendingStats();
            
            // Create ledger entry
            await this.createLedgerEntry(activeLoan);
            
            // Send notification to borrower
            await this.sendLoanApprovalNotification(loan.borrowerId, activeLoan);
            
            // Show success
            this.showLendingSuccess(`Loan of ${this.formatCurrency(loan.amount)} approved successfully!`);
            
            // Update displays
            this.displayPendingLoans();
            this.displayActiveLoans();
            
            // Save data
            this.saveLendingData();
            
        } catch (error) {
            this.showLendingError(error.message || 'Failed to approve loan');
        }
    },

    // Reject a loan
    async rejectLoan(loanId) {
        try {
            const loan = this.pendingLoans.find(l => l.id === loanId);
            if (!loan) {
                throw new Error('Loan request not found');
            }
            
            // Get rejection reason
            const reason = await this.showRejectionModal();
            if (!reason) return;
            
            // Update loan status
            loan.status = 'rejected';
            loan.rejectionReason = reason;
            loan.rejectedAt = new Date().toISOString();
            
            // Move to completed loans
            this.completedLoans.push(loan);
            this.pendingLoans = this.pendingLoans.filter(l => l.id !== loanId);
            
            // Send notification to borrower
            await this.sendLoanRejectionNotification(loan.borrowerId, loan, reason);
            
            // Show success
            this.showLendingSuccess('Loan request rejected');
            
            // Update displays
            this.displayPendingLoans();
            
            // Save data
            this.saveLendingData();
            
        } catch (error) {
            this.showLendingError(error.message || 'Failed to reject loan');
        }
    },

    // Handle loan approval with custom terms
    async handleLoanApproval(form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const loanId = form.getAttribute('data-loan-id');
            
            const loan = this.pendingLoans.find(l => l.id === loanId);
            if (!loan) {
                throw new Error('Loan request not found');
            }
            
            // Validate approval data
            const validation = this.validateApprovalData(data);
            if (!validation.valid) {
                throw new Error(validation.errors.join(', '));
            }
            
            // Update loan with approval terms
            loan.approvedAmount = parseFloat(data.amount);
            loan.interestRate = parseFloat(data.interestRate) || 15;
            loan.repaymentDays = parseInt(data.repaymentDays) || 7;
            loan.disbursementMethod = data.disbursementMethod;
            loan.specialTerms = data.specialTerms || '';
            
            // Process approval
            await this.approveLoan(loanId);
            
            // Reset form
            form.reset();
            
        } catch (error) {
            this.showLendingError(error.message);
        }
    },

    // Show repayment update modal
    async showRepaymentUpdateModal(loanId) {
        const loan = this.activeLoans.find(l => l.id === loanId);
        if (!loan) return;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Update Repayment</h3>
                <form id="repaymentUpdateForm" data-loan-id="${loanId}">
                    <div class="form-group">
                        <label for="amountPaid">Amount Paid</label>
                        <input type="number" id="amountPaid" name="amountPaid" min="0" max="${loan.remainingBalance}" step="0.01" required>
                        <small>Remaining balance: ${this.formatCurrency(loan.remainingBalance)}</small>
                    </div>
                    <div class="form-group">
                        <label for="paymentDate">Payment Date</label>
                        <input type="date" id="paymentDate" name="paymentDate" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label for="paymentMethod">Payment Method</label>
                        <select id="paymentMethod" name="paymentMethod" required>
                            <option value="">Select method</option>
                            <option value="mpesa">M-Pesa</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="cash">Cash</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="transactionId">Transaction ID (Optional)</label>
                        <input type="text" id="transactionId" name="transactionId">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        const form = modal.querySelector('#repaymentUpdateForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRepaymentUpdate(form);
            modal.remove();
        });
    },

    // Handle repayment update
    async handleRepaymentUpdate(form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const loanId = form.getAttribute('data-loan-id');
            
            const loan = this.activeLoans.find(l => l.id === loanId);
            if (!loan) {
                throw new Error('Loan not found');
            }
            
            // Create payment record
            const payment = {
                id: 'payment_' + Date.now(),
                loanId: loanId,
                amount: parseFloat(data.amountPaid),
                date: data.paymentDate,
                method: data.paymentMethod,
                transactionId: data.transactionId || '',
                recordedAt: new Date().toISOString()
            };
            
            // Update loan
            loan.payments = loan.payments || [];
            loan.payments.push(payment);
            
            // Calculate new balance
            const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
            loan.remainingBalance = loan.totalRepayment - totalPaid;
            
            // Check if fully repaid
            if (loan.remainingBalance <= 0) {
                await this.completeLoan(loanId);
            } else {
                // Update next payment due date
                loan.nextPaymentDue = this.calculateNextDueDate(loan);
            }
            
            // Update ledger
            await this.updateLedgerEntry(loan);
            
            // Show success
            this.showLendingSuccess(`Payment of ${this.formatCurrency(payment.amount)} recorded`);
            
            // Update displays
            this.displayActiveLoans();
            
            // Save data
            this.saveLendingData();
            
        } catch (error) {
            this.showLendingError(error.message || 'Failed to update repayment');
        }
    },

    // Mark loan as repaid
    async markLoanAsRepaid(loanId) {
        try {
            const confirmed = confirm('Mark this loan as fully repaid?');
            if (!confirmed) return;
            
            await this.completeLoan(loanId);
            
        } catch (error) {
            this.showLendingError(error.message || 'Failed to mark loan as repaid');
        }
    },

    // Complete a loan (fully repaid)
    async completeLoan(loanId) {
        const loan = this.activeLoans.find(l => l.id === loanId);
        if (!loan) return;
        
        // Update loan status
        loan.status = 'completed';
        loan.completedAt = new Date().toISOString();
        loan.remainingBalance = 0;
        
        // Move to completed loans
        this.activeLoans = this.activeLoans.filter(l => l.id !== loanId);
        this.completedLoans.push(loan);
        
        // Update stats
        this.updateLendingStats();
        
        // Update ledger
        await this.updateLedgerEntry(loan);
        
        // Show success
        this.showLendingSuccess(`Loan marked as completed`);
        
        // Update displays
        this.displayActiveLoans();
        this.displayCompletedLoans();
        
        // Save data
        this.saveLendingData();
    },

    // Handle borrower rating
    async handleBorrowerRating(form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const borrowerId = form.getAttribute('data-borrower-id');
            const loanId = form.getAttribute('data-loan-id');
            
            if (!data.rating || data.rating < 1 || data.rating > 5) {
                throw new Error('Please provide a valid rating (1-5 stars)');
            }
            
            // Create rating
            const rating = {
                id: 'rating_' + Date.now(),
                lenderId: this.getCurrentUser().id,
                borrowerId: borrowerId,
                loanId: loanId,
                rating: parseInt(data.rating),
                comments: data.comments || '',
                createdAt: new Date().toISOString()
            };
            
            // Save rating
            await this.saveBorrowerRating(rating);
            
            // Update borrower's average rating
            await this.updateBorrowerRating(borrowerId, rating.rating);
            
            // Show success
            this.showLendingSuccess('Rating submitted successfully');
            
            // Reset form
            form.reset();
            
        } catch (error) {
            this.showLendingError(error.message || 'Failed to submit rating');
        }
    },

    // Setup ledger filters
    setupLedgerFilters() {
        const searchInput = document.getElementById('ledgerSearch');
        const statusFilter = document.getElementById('ledgerStatusFilter');
        const dateFilter = document.getElementById('ledgerDateFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterLedgers(e.target.value, statusFilter?.value, dateFilter?.value);
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterLedgers(searchInput?.value, e.target.value, dateFilter?.value);
            });
        }
        
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filterLedgers(searchInput?.value, statusFilter?.value, e.target.value);
            });
        }
    },

    // Filter ledgers
    filterLedgers(searchTerm = '', status = '', dateRange = '') {
        const allLoans = [...this.activeLoans, ...this.completedLoans];
        let filtered = allLoans;
        
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(loan => 
                loan.borrowerName.toLowerCase().includes(searchLower) ||
                loan.category.toLowerCase().includes(searchLower)
            );
        }
        
        // Status filter
        if (status) {
            filtered = filtered.filter(loan => loan.status === status);
        }
        
        // Date filter
        if (dateRange) {
            const now = new Date();
            let startDate;
            
            switch (dateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                case 'year':
                    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
            }
            
            if (startDate) {
                filtered = filtered.filter(loan => 
                    new Date(loan.createdAt) >= startDate
                );
            }
        }
        
        // Display filtered ledgers
        this.displayLedgers(filtered);
    },

    // Display pending loans
    displayPendingLoans() {
        const container = document.getElementById('pendingLoansContainer');
        if (!container) return;
        
        if (this.pendingLoans.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>No pending loan requests</h3>
                    <p>When borrowers request loans, they'll appear here</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.pendingLoans.map(loan => this.createPendingLoanCard(loan)).join('');
    },

    // Display active loans
    displayActiveLoans() {
        const container = document.getElementById('activeLoansContainer');
        if (!container) return;
        
        if (this.activeLoans.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💰</div>
                    <h3>No active loans</h3>
                    <p>Approve loan requests to see them here</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.activeLoans.map(loan => this.createActiveLoanCard(loan)).join('');
    },

    // Display completed loans
    displayCompletedLoans() {
        const container = document.getElementById('completedLoansContainer');
        if (!container) return;
        
        if (this.completedLoans.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✅</div>
                    <h3>No completed loans yet</h3>
                    <p>Completed loans will appear here</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.completedLoans.map(loan => this.createCompletedLoanCard(loan)).join('');
    },

    // Display ledgers
    displayLedgers(loans) {
        const container = document.getElementById('ledgersContainer');
        if (!container) return;
        
        if (loans.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>No ledgers found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = loans.map(loan => this.createLedgerRow(loan)).join('');
    },

    // Update dashboard stats
    updateDashboardStats() {
        // Calculate stats
        this.stats.totalLent = this.activeLoans.reduce((sum, loan) => sum + loan.amount, 0) +
                               this.completedLoans.reduce((sum, loan) => sum + loan.amount, 0);
        
        this.stats.activeLoans = this.activeLoans.length;
        
        const allBorrowers = [...this.activeLoans, ...this.completedLoans]
            .map(loan => loan.borrowerId)
            .filter((id, index, array) => array.indexOf(id) === index);
        this.stats.totalBorrowers = allBorrowers.length;
        
        this.stats.totalInterest = this.activeLoans.reduce((sum, loan) => sum + (loan.interest || 0), 0) +
                                   this.completedLoans.reduce((sum, loan) => sum + (loan.interest || 0), 0);
        
        // Update UI
        this.updateStatsUI();
    },

    // Update stats UI
    updateStatsUI() {
        const statElements = {
            'total-lent': this.formatCurrency(this.stats.totalLent),
            'active-loans': this.stats.activeLoans,
            'total-borrowers': this.stats.totalBorrowers,
            'total-interest': this.formatCurrency(this.stats.totalInterest),
            'repayment-rate': `${this.stats.repaymentRate}%`
        };
        
        Object.entries(statElements).forEach(([key, value]) => {
            const element = document.querySelector(`[data-stat="${key}"]`);
            if (element) {
                element.textContent = value;
            }
        });
    },

    // Setup quick actions
    setupQuickActions() {
        const quickApprove = document.getElementById('quickApprove');
        const quickUpdate = document.getElementById('quickUpdate');
        const quickRate = document.getElementById('quickRate');
        
        if (quickApprove) {
            quickApprove.addEventListener('click', () => {
                if (this.pendingLoans.length > 0) {
                    this.approveLoan(this.pendingLoans[0].id);
                } else {
                    this.showLendingInfo('No pending loans to approve');
                }
            });
        }
        
        if (quickUpdate) {
            quickUpdate.addEventListener('click', () => {
                if (this.activeLoans.length > 0) {
                    this.showRepaymentUpdateModal(this.activeLoans[0].id);
                } else {
                    this.showLendingInfo('No active loans to update');
                }
            });
        }
        
        if (quickRate) {
            quickRate.addEventListener('click', () => {
                if (this.completedLoans.length > 0) {
                    const loan = this.completedLoans[0];
                    this.showRatingModal(loan.borrowerId, loan.id);
                } else {
                    this.showLendingInfo('No completed loans to rate');
                }
            });
        }
    },

    // Check if lender can approve a loan
    canApproveLoan(loan) {
        const user = this.getCurrentUser();
        
        // Check if lender offers this category
        if (!user.categories?.includes(loan.category)) {
            return false;
        }
        
        // Check if lender is in the same group as borrower
        // This would require group checking logic
        
        return true;
    },

    // Check subscription status
    checkSubscriptionStatus() {
        const user = this.getCurrentUser();
        if (!user.subscription) return false;
        
        if (user.subscription.status === 'pending') {
            return false;
        }
        
        if (user.subscription.status === 'expired') {
            return false;
        }
        
        const expiresAt = new Date(user.subscription.expiresAt);
        return expiresAt > new Date();
    },

    // Check lending limits
    checkLendingLimits(amount) {
        const user = this.getCurrentUser();
        const tier = user.tier || 'basic';
        
        const tierLimits = {
            basic: 1500,
            premium: 5000,
            super: 20000
        };
        
        const limit = tierLimits[tier] || 1500;
        
        // Calculate current active lending
        const activeLending = this.activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
        
        return (activeLending + amount) <= limit;
    },

    // Process loan approval
    async processLoanApproval(loan) {
        const activeLoan = {
            ...loan,
            status: 'active',
            approvedAt: new Date().toISOString(),
            lenderId: this.getCurrentUser().id,
            lenderName: this.getCurrentUser().name,
            interest: loan.amount * 0.15, // 15% interest
            totalRepayment: loan.amount * 1.15,
            remainingBalance: loan.amount * 1.15,
            nextPaymentDue: this.calculateDueDate(7), // 7 days from now
            payments: []
        };
        
        return activeLoan;
    },

    // Create ledger entry
    async createLedgerEntry(loan) {
        const ledgerEntry = {
            id: 'ledger_' + loan.id,
            loanId: loan.id,
            borrowerId: loan.borrowerId,
            borrowerName: loan.borrowerName,
            amount: loan.amount,
            interest: loan.interest,
            total: loan.totalRepayment,
            category: loan.category,
            date: loan.approvedAt,
            dueDate: loan.nextPaymentDue,
            status: 'active',
            payments: [],
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        const ledger = JSON.parse(localStorage.getItem('pesewa_ledger') || '[]');
        ledger.push(ledgerEntry);
        localStorage.setItem('pesewa_ledger', JSON.stringify(ledger));
        
        return ledgerEntry;
    },

    // Update ledger entry
    async updateLedgerEntry(loan) {
        const ledger = JSON.parse(localStorage.getItem('pesewa_ledger') || '[]');
        const entryIndex = ledger.findIndex(e => e.loanId === loan.id);
        
        if (entryIndex !== -1) {
            ledger[entryIndex].status = loan.status;
            ledger[entryIndex].remainingBalance = loan.remainingBalance;
            ledger[entryIndex].payments = loan.payments || [];
            ledger[entryIndex].updatedAt = new Date().toISOString();
            
            localStorage.setItem('pesewa_ledger', JSON.stringify(ledger));
        }
    },

    // Save borrower rating
    async saveBorrowerRating(rating) {
        const ratings = JSON.parse(localStorage.getItem('pesewa_ratings') || '[]');
        ratings.push(rating);
        localStorage.setItem('pesewa_ratings', JSON.stringify(ratings));
    },

    // Update borrower's average rating
    async updateBorrowerRating(borrowerId, newRating) {
        // This would update the borrower's profile in the database
        // For now, we'll just log it
        console.log(`Updated rating for borrower ${borrowerId}: ${newRating} stars`);
    },

    // Send loan approval notification
    async sendLoanApprovalNotification(borrowerId, loan) {
        // In production, this would send push notification or SMS
        console.log(`Loan approved notification sent to borrower ${borrowerId}`);
    },

    // Send loan rejection notification
    async sendLoanRejectionNotification(borrowerId, loan, reason) {
        // In production, this would send push notification or SMS
        console.log(`Loan rejected notification sent to borrower ${borrowerId}: ${reason}`);
    },

    // Calculate due date
    calculateDueDate(daysFromNow) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString();
    },

    // Calculate next due date
    calculateNextDueDate(loan) {
        if (!loan.payments || loan.payments.length === 0) {
            return loan.nextPaymentDue;
        }
        
        const lastPayment = loan.payments[loan.payments.length - 1];
        const paymentDate = new Date(lastPayment.date);
        paymentDate.setDate(paymentDate.getDate() + 7); // Next payment due in 7 days
        
        return paymentDate.toISOString();
    },

    // Show approval modal
    async showApprovalModal(loan) {
        return new Promise((resolve) => {
            const confirmed = confirm(`Approve loan of ${this.formatCurrency(loan.amount)} to ${loan.borrowerName} for ${loan.category}?`);
            resolve(confirmed);
        });
    },

    // Show rejection modal
    async showRejectionModal() {
        return new Promise((resolve) => {
            const reason = prompt('Please enter reason for rejection:');
            resolve(reason);
        });
    },

    // Show rating modal
    async showRatingModal(borrowerId, loanId) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Rate Borrower</h3>
                <form id="ratingForm" data-borrower-id="${borrowerId}" data-loan-id="${loanId}">
                    <div class="form-group">
                        <label>Rating</label>
                        <div class="star-rating">
                            ${[1,2,3,4,5].map(i => `<span class="star" data-value="${i}">★</span>`).join('')}
                        </div>
                        <input type="hidden" name="rating" id="ratingValue" required>
                    </div>
                    <div class="form-group">
                        <label for="comments">Comments (Optional)</label>
                        <textarea id="comments" name="comments" rows="3"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Submit Rating</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup star rating
        const starRating = modal.querySelector('.star-rating');
        starRating.addEventListener('click', (e) => {
            const star = e.target.closest('.star');
            if (star) {
                const ratingValue = star.getAttribute('data-value');
                this.setStarRating(starRating, ratingValue);
            }
        });
        
        // Handle form submission
        const form = modal.querySelector('#ratingForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleBorrowerRating(form);
            modal.remove();
        });
    },

    // Set star rating
    setStarRating(ratingElement, value) {
        const stars = ratingElement.querySelectorAll('.star');
        const ratingInput = document.getElementById('ratingValue');
        
        stars.forEach((star, index) => {
            if (index < value) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
        
        if (ratingInput) {
            ratingInput.value = value;
        }
    },

    // Validate approval data
    validateApprovalData(data) {
        const errors = [];
        
        if (!data.amount || parseFloat(data.amount) <= 0) {
            errors.push('Please enter a valid amount');
        }
        
        if (data.interestRate && (parseFloat(data.interestRate) < 1 || parseFloat(data.interestRate) > 50)) {
            errors.push('Interest rate must be between 1% and 50%');
        }
        
        if (data.repaymentDays && (parseInt(data.repaymentDays) < 1 || parseInt(data.repaymentDays) > 30)) {
            errors.push('Repayment days must be between 1 and 30');
        }
        
        if (!data.disbursementMethod) {
            errors.push('Please select a disbursement method');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Create pending loan card HTML
    createPendingLoanCard(loan) {
        return `
            <div class="loan-card pending" data-loan-id="${loan.id}">
                <div class="loan-header">
                    <div class="loan-category">
                        <div class="category-icon">${this.getCategoryIcon(loan.category)}</div>
                        <div>
                            <h4>${loan.category}</h4>
                            <div class="loan-borrower">${loan.borrowerName}</div>
                        </div>
                    </div>
                    <div class="loan-amount">${this.formatCurrency(loan.amount)}</div>
                </div>
                
                <div class="loan-details">
                    <div class="detail-item">
                        <span class="detail-label">Requested:</span>
                        <span class="detail-value">${this.formatDate(loan.requestedAt)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Repayment:</span>
                        <span class="detail-value">${loan.repaymentDays} days</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Group:</span>
                        <span class="detail-value">${loan.groupName}</span>
                    </div>
                </div>
                
                <div class="loan-description">
                    ${loan.description || 'No description provided'}
                </div>
                
                <div class="loan-actions">
                    <button class="btn btn-success" data-action="approve-loan" data-loan-id="${loan.id}">Approve</button>
                    <button class="btn btn-outline" data-action="reject-loan" data-loan-id="${loan.id}">Reject</button>
                    <button class="btn btn-primary" onclick="PesewaLending.showApprovalForm('${loan.id}')">Custom Terms</button>
                </div>
            </div>
        `;
    },

    // Create active loan card HTML
    createActiveLoanCard(loan) {
        const daysRemaining = this.calculateDaysRemaining(loan.nextPaymentDue);
        const progress = ((loan.totalRepayment - loan.remainingBalance) / loan.totalRepayment) * 100;
        
        return `
            <div class="loan-card active" data-loan-id="${loan.id}">
                <div class="loan-header">
                    <div class="loan-category">
                        <div class="category-icon">${this.getCategoryIcon(loan.category)}</div>
                        <div>
                            <h4>${loan.category}</h4>
                            <div class="loan-borrower">${loan.borrowerName}</div>
                        </div>
                    </div>
                    <div class="loan-amount">${this.formatCurrency(loan.amount)}</div>
                </div>
                
                <div class="loan-progress">
                    <div class="progress-header">
                        <span class="progress-label">Repayment Progress</span>
                        <span class="progress-value">${progress.toFixed(1)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="loan-details">
                    <div class="detail-item">
                        <span class="detail-label">Due in:</span>
                        <span class="detail-value ${daysRemaining <= 3 ? 'text-danger' : ''}">${daysRemaining} days</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Balance:</span>
                        <span class="detail-value">${this.formatCurrency(loan.remainingBalance)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Interest:</span>
                        <span class="detail-value">${this.formatCurrency(loan.interest)}</span>
                    </div>
                </div>
                
                <div class="loan-actions">
                    <button class="btn btn-primary" data-action="update-repayment" data-loan-id="${loan.id}">Update Payment</button>
                    <button class="btn btn-success" data-action="mark-repaid" data-loan-id="${loan.id}">Mark Repaid</button>
                </div>
            </div>
        `;
    },

    // Create completed loan card HTML
    createCompletedLoanCard(loan) {
        const profit = loan.interest || 0;
        
        return `
            <div class="loan-card completed" data-loan-id="${loan.id}">
                <div class="loan-header">
                    <div class="loan-category">
                        <div class="category-icon">${this.getCategoryIcon(loan.category)}</div>
                        <div>
                            <h4>${loan.category}</h4>
                            <div class="loan-borrower">${loan.borrowerName}</div>
                        </div>
                    </div>
                    <div class="loan-amount">${this.formatCurrency(loan.amount)}</div>
                </div>
                
                <div class="loan-details">
                    <div class="detail-item">
                        <span class="detail-label">Completed:</span>
                        <span class="detail-value">${this.formatDate(loan.completedAt)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Duration:</span>
                        <span class="detail-value">${this.calculateLoanDuration(loan)} days</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Profit:</span>
                        <span class="detail-value text-success">${this.formatCurrency(profit)}</span>
                    </div>
                </div>
                
                <div class="loan-rating">
                    <div class="rating-label">Your Rating:</div>
                    <div class="star-rating">
                        ${this.renderStars(loan.lenderRating || 0)}
                    </div>
                </div>
                
                <div class="loan-actions">
                    <button class="btn btn-outline" onclick="PesewaLending.showRatingModal('${loan.borrowerId}', '${loan.id}')">Rate Borrower</button>
                    <button class="btn btn-primary" onclick="PesewaLending.viewLedger('${loan.id}')">View Ledger</button>
                </div>
            </div>
        `;
    },

    // Create ledger row HTML
    createLedgerRow(loan) {
        return `
            <tr class="ledger-row" data-loan-id="${loan.id}">
                <td>
                    <div class="borrower-info">
                        <div class="borrower-avatar">${loan.borrowerName.charAt(0)}</div>
                        <div>
                            <div class="borrower-name">${loan.borrowerName}</div>
                            <div class="borrower-category">${loan.category}</div>
                        </div>
                    </div>
                </td>
                <td>${this.formatCurrency(loan.amount)}</td>
                <td>${this.formatCurrency(loan.interest || 0)}</td>
                <td>${this.formatCurrency(loan.totalRepayment)}</td>
                <td>${this.formatCurrency(loan.remainingBalance || 0)}</td>
                <td>
                    <span class="status-badge status-${loan.status}">${loan.status}</span>
                </td>
                <td>${this.formatDate(loan.approvedAt || loan.createdAt)}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-action view" onclick="PesewaLending.viewLedger('${loan.id}')">👁️</button>
                        <button class="table-action edit" onclick="PesewaLending.showRepaymentUpdateModal('${loan.id}')">✏️</button>
                    </div>
                </td>
            </tr>
        `;
    },

    // Calculate days remaining
    calculateDaysRemaining(dueDate) {
        const due = new Date(dueDate);
        const now = new Date();
        const diff = due.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    },

    // Calculate loan duration
    calculateLoanDuration(loan) {
        const start = new Date(loan.approvedAt || loan.createdAt);
        const end = new Date(loan.completedAt || new Date());
        const diff = end.getTime() - start.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    },

    // Render stars for rating
    renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<span class="star filled">★</span>';
            } else {
                stars += '<span class="star">★</span>';
            }
        }
        return stars;
    },

    // Get category icon
    getCategoryIcon(category) {
        const icons = {
            'pesewa-fare': '🚌',
            'pesewa-data': '📱',
            'pesewa-cooking-gas': '🔥',
            'pesewa-food': '🍲',
            'pesewacredo': '🛠️',
            'pesewa-water-bill': '💧',
            'pesewa-fuel': '⛽',
            'pesewa-repair': '🔧',
            'pesewa-medicine': '💊',
            'pesewa-electricity': '💡',
            'pesewa-school-fees': '🎓',
            'pesewa-tv': '📺'
        };
        
        return icons[category] || '💰';
    },

    // Format currency
    formatCurrency(amount) {
        return `₵${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    },

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
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

    // Save lending data
    saveLendingData() {
        const userId = this.getCurrentUser()?.id;
        if (!userId) return;
        
        const data = {
            pendingLoans: this.pendingLoans,
            activeLoans: this.activeLoans,
            completedLoans: this.completedLoans,
            stats: this.stats
        };
        
        localStorage.setItem(`pesewa_lender_${userId}`, JSON.stringify(data));
    },

    // Show lending success message
    showLendingSuccess(message) {
        const notification = document.createElement('div');
        notification.className = 'lending-notification success';
        notification.innerHTML = `
            <strong>Success:</strong> ${message}
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

    // Show lending error message
    showLendingError(message) {
        const notification = document.createElement('div');
        notification.className = 'lending-notification error';
        notification.innerHTML = `
            <strong>Error:</strong> ${message}
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

    // Show lending info message
    showLendingInfo(message) {
        const notification = document.createElement('div');
        notification.className = 'lending-notification info';
        notification.innerHTML = `
            <strong>Info:</strong> ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; cursor: pointer;">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: var(--soft-blue);
            color: var(--primary-blue);
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid var(--primary-blue);
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

    // Create sample pending loans for demo
    createSamplePendingLoans() {
        return [
            {
                id: 'pending_1',
                borrowerId: 'borrower_1',
                borrowerName: 'John Kamau',
                amount: 1500,
                category: 'pesewa-food',
                description: 'Need food for family until payday next week',
                repaymentDays: 7,
                groupName: 'Nairobi Professionals',
                requestedAt: '2024-01-20T10:00:00Z',
                status: 'pending'
            },
            {
                id: 'pending_2',
                borrowerId: 'borrower_2',
                borrowerName: 'Mary Wanjiku',
                amount: 800,
                category: 'pesewa-data',
                description: 'Need data bundle for online work',
                repaymentDays: 5,
                groupName: 'Kampala Church Group',
                requestedAt: '2024-01-21T14:30:00Z',
                status: 'pending'
            }
        ];
    },
    
    // View ledger details
    viewLedger(loanId) {
        window.location.href = `ledger-details.html?id=${loanId}`;
    },
    
    // Show approval form
    showApprovalForm(loanId) {
        window.location.href = `approve-loan.html?id=${loanId}`;
    }
};

// Initialize lending when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PesewaLending.init());
} else {
    PesewaLending.init();
}

// Export for use in other modules
window.PesewaLending = PesewaLending;