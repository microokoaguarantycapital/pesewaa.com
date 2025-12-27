// Subscription Rules State Management
class SubscriptionRulesState {
    constructor() {
        this.tiers = {
            'basic': {
                name: 'Basic',
                price: 150,
                color: '#9CA3AF',
                features: [
                    'Visible on live map',
                    'Listed in Basic category',
                    'Full escort profile',
                    'Lowest map priority',
                    'No client request board',
                    'Buried under higher tiers'
                ],
                access: ['basic-category'],
                restrictions: ['client-board']
            },
            'gold': {
                name: 'Gold',
                price: 250,
                color: '#D4AF37',
                features: [
                    'Everything in Basic',
                    'Gold category',
                    'Higher map ranking',
                    'Appears earlier in filters',
                    'Access to client request board',
                    'See high-demand client zones'
                ],
                access: ['basic-category', 'gold-category', 'client-board'],
                restrictions: []
            },
            'premium': {
                name: 'Premium',
                price: 450,
                color: '#7B2CBF',
                features: [
                    'Everything in Gold',
                    'Premium category',
                    'Top-tier map placement',
                    'Homepage exposure',
                    'Clients can subscribe to you',
                    'View client service requests'
                ],
                access: ['basic-category', 'gold-category', 'premium-category', 'client-board', 'homepage'],
                restrictions: []
            },
            'full': {
                name: 'Full Visibility',
                price: 750,
                color: '#B11226',
                features: [
                    'Everything in Premium',
                    'Appears in Basic + Gold + Premium',
                    'Maximum map exposure',
                    'Reaches all client types',
                    'Best ROI for full-time escorts'
                ],
                access: ['basic-category', 'gold-category', 'premium-category', 'all-categories', 'client-board', 'homepage', 'max-exposure'],
                restrictions: []
            }
        };
        
        this.addOns = {
            'priority-ad-5': {
                name: 'Priority Advertisement (5 days)',
                price: 200,
                duration: 5,
                description: 'Featured above all non-advertised escorts'
            },
            'priority-ad-10': {
                name: 'Priority Advertisement (10 days)',
                price: 400,
                duration: 10,
                description: 'Featured above all non-advertised escorts'
            },
            'frontpage-feature': {
                name: 'Front Page Feature',
                price: 200,
                duration: 1,
                description: 'Your photo on homepage (one-time)'
            }
        };
        
        this.expiryDay = 28; // All subscriptions expire on 28th
        this.minimumPrice = 250; // KES minimum price
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startExpiryChecker();
    }
    
    setupEventListeners() {
        // Listen for subscription purchases
        document.addEventListener('subscription-purchase', (event) => {
            this.processSubscriptionPurchase(event.detail);
        });
        
        // Listen for add-on purchases
        document.addEventListener('addon-purchase', (event) => {
            this.processAddOnPurchase(event.detail);
        });
        
        // Listen for tier upgrade requests
        document.addEventListener('tier-upgrade-request', (event) => {
            this.handleUpgradeRequest(event.detail);
        });
    }
    
    getTier(tierName) {
        return this.tiers[tierName] || null;
    }
    
    getAllTiers() {
        return Object.entries(this.tiers).map(([key, value]) => ({
            id: key,
            ...value
        }));
    }
    
    getAddOn(addOnId) {
        return this.addOns[addOnId] || null;
    }
    
    getAllAddOns() {
        return Object.entries(this.addOns).map(([key, value]) => ({
            id: key,
            ...value
        }));
    }
    
    calculateExpiryDate(startDate = new Date()) {
        const currentYear = startDate.getFullYear();
        const currentMonth = startDate.getMonth();
        
        // If today is after 28th, next month's 28th
        if (startDate.getDate() > this.expiryDay) {
            return new Date(currentYear, currentMonth + 1, this.expiryDay);
        }
        
        // This month's 28th
        return new Date(currentYear, currentMonth, this.expiryDay);
    }
    
    calculateDaysUntilExpiry(expiryDate) {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    isSubscriptionActive(expiryDate) {
        const now = new Date();
        const expiry = new Date(expiryDate);
        return now <= expiry;
    }
    
    getTierUpgradePrice(currentTier, targetTier) {
        const current = this.tiers[currentTier];
        const target = this.tiers[targetTier];
        
        if (!current || !target) return null;
        
        // Calculate prorated upgrade price
        const daysUsed = this.getDaysUsedInCurrentCycle();
        const daysInCycle = 30; // Approximate month
        const remainingValue = (current.price * (daysInCycle - daysUsed)) / daysInCycle;
        const upgradePrice = target.price - remainingValue;
        
        return Math.max(upgradePrice, 0);
    }
    
    getDaysUsedInCurrentCycle() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Calculate start of current cycle (last 28th)
        let cycleStart;
        if (now.getDate() >= this.expiryDay) {
            // Current month's 28th
            cycleStart = new Date(currentYear, currentMonth, this.expiryDay);
        } else {
            // Last month's 28th
            cycleStart = new Date(currentYear, currentMonth - 1, this.expiryDay);
        }
        
        const diffTime = now - cycleStart;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    
    canAccessFeature(tier, feature) {
        const tierData = this.tiers[tier];
        if (!tierData) return false;
        
        return tierData.access.includes(feature);
    }
    
    getTierComparison() {
        const tiers = this.getAllTiers();
        const features = [
            'Map Visibility',
            'Basic Category',
            'Gold Category',
            'Premium Category',
            'Map Priority',
            'Client Board Access',
            'Homepage Exposure',
            'Booking Potential'
        ];
        
        const comparison = {};
        
        tiers.forEach(tier => {
            comparison[tier.id] = {
                name: tier.name,
                price: tier.price,
                color: tier.color,
                features: {
                    'Map Visibility': true,
                    'Basic Category': tier.access.includes('basic-category'),
                    'Gold Category': tier.access.includes('gold-category'),
                    'Premium Category': tier.access.includes('premium-category'),
                    'Map Priority': this.getMapPriority(tier.id),
                    'Client Board Access': tier.access.includes('client-board'),
                    'Homepage Exposure': tier.access.includes('homepage'),
                    'Booking Potential': this.getBookingPotential(tier.id)
                }
            };
        });
        
        return comparison;
    }
    
    getMapPriority(tier) {
        const priorities = {
            'basic': 'Low',
            'gold': 'Medium',
            'premium': 'High',
            'full': 'Max'
        };
        return priorities[tier] || 'Low';
    }
    
    getBookingPotential(tier) {
        const potentials = {
            'basic': 'Low',
            'gold': 'Medium',
            'premium': 'High',
            'full': 'Very High'
        };
        return potentials[tier] || 'Low';
    }
    
    processSubscriptionPurchase(purchase) {
        const { escortId, tier, paymentMethod } = purchase;
        
        // Validate tier
        if (!this.tiers[tier]) {
            this.emitPurchaseError('Invalid tier selected');
            return;
        }
        
        // Calculate expiry
        const expiryDate = this.calculateExpiryDate();
        const daysUntilExpiry = this.calculateDaysUntilExpiry(expiryDate);
        
        // Create subscription object
        const subscription = {
            id: `sub-${Date.now()}`,
            escortId,
            tier,
            purchaseDate: new Date().toISOString(),
            expiryDate: expiryDate.toISOString(),
            daysRemaining: daysUntilExpiry,
            price: this.tiers[tier].price,
            paymentMethod,
            status: 'active'
        };
        
        // Save subscription (in real app, send to backend)
        this.saveSubscription(subscription);
        
        // Update escort visibility
        this.updateEscortSubscription(escortId, tier, expiryDate);
        
        // Emit success event
        this.emitPurchaseSuccess(subscription);
    }
    
    processAddOnPurchase(purchase) {
        const { escortId, addOnId, paymentMethod } = purchase;
        
        // Validate add-on
        const addOn = this.addOns[addOnId];
        if (!addOn) {
            this.emitPurchaseError('Invalid add-on selected');
            return;
        }
        
        // Create add-on purchase
        const addOnPurchase = {
            id: `addon-${Date.now()}`,
            escortId,
            addOnId,
            purchaseDate: new Date().toISOString(),
            expiryDate: this.calculateAddOnExpiry(addOn.duration),
            duration: addOn.duration,
            price: addOn.price,
            paymentMethod,
            status: 'active'
        };
        
        // Save add-on (in real app, send to backend)
        this.saveAddOn(addOnPurchase);
        
        // Apply add-on benefits
        this.applyAddOnBenefits(escortId, addOnId);
        
        // Emit success event
        this.emitAddOnSuccess(addOnPurchase);
    }
    
    calculateAddOnExpiry(duration) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + duration);
        return expiry.toISOString();
    }
    
    updateEscortSubscription(escortId, tier, expiryDate) {
        // Update escort visibility state
        if (window.escortVisibilityState) {
            const escort = window.escortVisibilityState.getEscortById(escortId);
            if (escort) {
                escort.tier = tier;
                escort.subscriptionActive = true;
                escort.subscriptionExpiry = expiryDate;
                
                // Emit update event
                document.dispatchEvent(new CustomEvent('escort-status-update', {
                    detail: {
                        escortId,
                        changes: {
                            tier,
                            subscriptionActive: true,
                            subscriptionExpiry: expiryDate
                        }
                    }
                }));
            }
        }
    }
    
    applyAddOnBenefits(escortId, addOnId) {
        // Apply benefits based on add-on type
        switch (addOnId) {
            case 'priority-ad-5':
            case 'priority-ad-10':
                // Add priority advertisement
                document.dispatchEvent(new CustomEvent('priority-ad-added', {
                    detail: { escortId, addOnId }
                }));
                break;
                
            case 'frontpage-feature':
                // Add frontpage feature
                document.dispatchEvent(new CustomEvent('frontpage-feature-added', {
                    detail: { escortId }
                }));
                break;
        }
    }
    
    saveSubscription(subscription) {
        // In real app, this would be an API call
        console.log('Subscription saved:', subscription);
        
        // For demo, store in localStorage
        const subscriptions = JSON.parse(localStorage.getItem('marmaid-subscriptions') || '[]');
        subscriptions.push(subscription);
        localStorage.setItem('marmaid-subscriptions', JSON.stringify(subscriptions));
    }
    
    saveAddOn(addOn) {
        // In real app, this would be an API call
        console.log('Add-on saved:', addOn);
        
        // For demo, store in localStorage
        const addOns = JSON.parse(localStorage.getItem('marmaid-addons') || '[]');
        addOns.push(addOn);
        localStorage.setItem('marmaid-addons', JSON.stringify(addOns));
    }
    
    handleUpgradeRequest(details) {
        const { escortId, currentTier, targetTier } = details;
        const upgradePrice = this.getTierUpgradePrice(currentTier, targetTier);
        
        // Emit upgrade quote
        document.dispatchEvent(new CustomEvent('upgrade-quote', {
            detail: {
                escortId,
                currentTier,
                targetTier,
                upgradePrice,
                features: this.tiers[targetTier].features
            }
        }));
    }
    
    emitPurchaseSuccess(subscription) {
        document.dispatchEvent(new CustomEvent('subscription-purchase-success', {
            detail: subscription
        }));
    }
    
    emitPurchaseError(message) {
        document.dispatchEvent(new CustomEvent('subscription-purchase-error', {
            detail: { message }
        }));
    }
    
    emitAddOnSuccess(addOn) {
        document.dispatchEvent(new CustomEvent('addon-purchase-success', {
            detail: addOn
        }));
    }
    
    startExpiryChecker() {
        // Check for expiries every 6 hours
        setInterval(() => {
            this.checkAllExpiries();
        }, 6 * 60 * 60 * 1000);
        
        // Initial check
        this.checkAllExpiries();
    }
    
    checkAllExpiries() {
        // Check subscription expiries
        const subscriptions = JSON.parse(localStorage.getItem('marmaid-subscriptions') || '[]');
        const now = new Date();
        
        subscriptions.forEach(sub => {
            if (new Date(sub.expiryDate) < now && sub.status === 'active') {
                sub.status = 'expired';
                
                // Update escort status
                this.updateEscortSubscription(sub.escortId, sub.tier, sub.expiryDate);
                
                // Notify about expiry
                document.dispatchEvent(new CustomEvent('subscription-expired', {
                    detail: { subscriptionId: sub.id, escortId: sub.escortId }
                }));
            }
        });
        
        // Save updated subscriptions
        localStorage.setItem('marmaid-subscriptions', JSON.stringify(subscriptions));
    }
}

// Initialize and export
window.subscriptionRulesState = new SubscriptionRulesState();
export default window.subscriptionRulesState;