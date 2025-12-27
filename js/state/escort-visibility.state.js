// Escort Visibility State Management
class EscortVisibilityState {
    constructor() {
        this.visibleEscorts = [];
        this.filteredEscorts = [];
        this.activeFilters = {
            tier: null,
            category: null,
            priceRange: null,
            services: [],
            availability: 'all',
            distance: 10 // km
        };
        
        this.sortBy = 'tier-priority';
        this.mapBounds = null;
        this.init();
    }
    
    init() {
        // Load saved filters
        this.loadSavedFilters();
        
        // Listen for filter changes
        this.setupEventListeners();
        
        // Initialize with mock data (replace with API call)
        this.initializeMockData();
    }
    
    initializeMockData() {
        // Mock escorts data - will be replaced with API
        this.visibleEscorts = this.generateMockEscorts();
        this.applyFilters();
    }
    
    generateMockEscorts() {
        const tiers = ['basic', 'gold', 'premium', 'full'];
        const categories = ['straight', 'shemale', 'gay', 'lesbian'];
        const services = [
            'Short Time', 'Long Time', 'Dinner Companion', 'Overnight',
            'Massage', 'Role Play', 'Travel Companion', 'GFE',
            'Party Escort', 'VIP Experience'
        ];
        
        const mockEscorts = [];
        const locations = [
            { lat: -1.2921, lng: 36.8219 }, // Nairobi CBD
            { lat: -1.3032, lng: 36.8342 }, // Westlands
            { lat: -1.2869, lng: 36.8240 }, // Kilimani
            { lat: -1.2747, lng: 36.8322 }, // Lavington
            { lat: -1.3178, lng: 36.8366 }, // Parklands
        ];
        
        for (let i = 1; i <= 20; i++) {
            const tier = tiers[Math.floor(Math.random() * tiers.length)];
            const category = categories[Math.floor(Math.random() * categories.length)];
            const location = locations[Math.floor(Math.random() * locations.length)];
            
            // Determine price based on tier
            let basePrice = 250;
            switch(tier) {
                case 'gold': basePrice = 500; break;
                case 'premium': basePrice = 1000; break;
                case 'full': basePrice = 2000; break;
            }
            
            // Random services (3-6 services)
            const serviceCount = 3 + Math.floor(Math.random() * 4);
            const escortServices = [];
            for (let j = 0; j < serviceCount; j++) {
                const service = services[Math.floor(Math.random() * services.length)];
                if (!escortServices.includes(service)) {
                    escortServices.push(service);
                }
            }
            
            // Subscription expiry (all expire on 28th)
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth();
            let expiryDate;
            
            if (today.getDate() > 28) {
                // Next month's 28th
                expiryDate = new Date(currentYear, currentMonth + 1, 28);
            } else {
                // This month's 28th
                expiryDate = new Date(currentYear, currentMonth, 28);
            }
            
            // Check if subscription is active
            const subscriptionActive = today <= expiryDate;
            
            mockEscorts.push({
                id: `escort-${i}`,
                name: `Escort ${i}`,
                nickname: `E${i}`,
                phone: `+2547${Math.floor(10000000 + Math.random() * 90000000)}`,
                tier: tier,
                category: category,
                latitude: location.lat + (Math.random() * 0.02 - 0.01),
                longitude: location.lng + (Math.random() * 0.02 - 0.01),
                services: escortServices,
                basePrice: basePrice,
                bonusServices: Math.random() > 0.5 ? ['Video Call', 'Custom Request'] : [],
                discounts: Math.random() > 0.7 ? ['First Time Discount', 'Multiple Hours'] : [],
                rating: 4 + Math.random(),
                reviewCount: Math.floor(Math.random() * 50),
                isOnline: Math.random() > 0.3,
                subscriptionActive: subscriptionActive,
                subscriptionExpiry: expiryDate.toISOString(),
                lastActive: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Within last day
                profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=escort${i}`,
                description: `Professional escort with ${i} years of experience.`,
                verificationStatus: Math.random() > 0.2 ? 'verified' : 'pending'
            });
        }
        
        return mockEscorts;
    }
    
    loadSavedFilters() {
        try {
            const saved = localStorage.getItem('marmaid-filters');
            if (saved) {
                this.activeFilters = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    }
    
    saveFilters() {
        try {
            localStorage.setItem('marmaid-filters', JSON.stringify(this.activeFilters));
        } catch (error) {
            console.error('Error saving filters:', error);
        }
    }
    
    setupEventListeners() {
        // Listen for filter changes
        document.addEventListener('filter-change', (event) => {
            this.activeFilters = { ...this.activeFilters, ...event.detail };
            this.saveFilters();
            this.applyFilters();
        });
        
        // Listen for sort changes
        document.addEventListener('sort-change', (event) => {
            this.sortBy = event.detail;
            this.applySorting();
        });
        
        // Listen for map bounds changes
        document.addEventListener('map-bounds-change', (event) => {
            this.mapBounds = event.detail;
            this.applyFilters();
        });
        
        // Listen for escort updates
        document.addEventListener('escort-status-update', (event) => {
            this.updateEscortStatus(event.detail);
        });
    }
    
    applyFilters() {
        let filtered = [...this.visibleEscorts];
        
        // Filter by subscription active
        filtered = filtered.filter(escort => escort.subscriptionActive);
        
        // Filter by online status if needed
        if (this.activeFilters.availability === 'online') {
            filtered = filtered.filter(escort => escort.isOnline);
        }
        
        // Filter by tier
        if (this.activeFilters.tier) {
            filtered = filtered.filter(escort => escort.tier === this.activeFilters.tier);
        }
        
        // Filter by category
        if (this.activeFilters.category) {
            filtered = filtered.filter(escort => escort.category === this.activeFilters.category);
        }
        
        // Filter by services
        if (this.activeFilters.services.length > 0) {
            filtered = filtered.filter(escort => 
                this.activeFilters.services.every(service => 
                    escort.services.includes(service)
                )
            );
        }
        
        // Filter by price range
        if (this.activeFilters.priceRange) {
            const [min, max] = this.activeFilters.priceRange;
            filtered = filtered.filter(escort => 
                escort.basePrice >= min && escort.basePrice <= max
            );
        }
        
        // Filter by distance if user location is available
        if (window.userLocationState && this.activeFilters.distance) {
            const userLocation = window.userLocationState.getSelectedLocation();
            if (userLocation && userLocation.latitude && userLocation.longitude) {
                filtered = filtered.filter(escort => {
                    const distance = window.userLocationState.calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        escort.latitude,
                        escort.longitude
                    );
                    escort.distance = distance;
                    return distance <= this.activeFilters.distance;
                });
            }
        }
        
        // Filter by map bounds if available
        if (this.mapBounds) {
            filtered = filtered.filter(escort => {
                return escort.latitude >= this.mapBounds.southWest.lat &&
                       escort.latitude <= this.mapBounds.northEast.lat &&
                       escort.longitude >= this.mapBounds.southWest.lng &&
                       escort.longitude <= this.mapBounds.northEast.lng;
            });
        }
        
        this.filteredEscorts = filtered;
        this.applySorting();
        this.emitVisibilityChange();
    }
    
    applySorting() {
        switch (this.sortBy) {
            case 'tier-priority':
                // Order: full > premium > gold > basic
                const tierOrder = { 'full': 0, 'premium': 1, 'gold': 2, 'basic': 3 };
                this.filteredEscorts.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
                break;
                
            case 'distance':
                this.filteredEscorts.sort((a, b) => (a.distance || 999) - (b.distance || 999));
                break;
                
            case 'price-low-high':
                this.filteredEscorts.sort((a, b) => a.basePrice - b.basePrice);
                break;
                
            case 'price-high-low':
                this.filteredEscorts.sort((a, b) => b.basePrice - a.basePrice);
                break;
                
            case 'rating':
                this.filteredEscorts.sort((a, b) => b.rating - a.rating);
                break;
        }
        
        this.emitVisibilityChange();
    }
    
    updateEscortStatus(update) {
        const index = this.visibleEscorts.findIndex(e => e.id === update.escortId);
        if (index !== -1) {
            this.visibleEscorts[index] = { ...this.visibleEscorts[index], ...update.changes };
            this.applyFilters();
        }
    }
    
    getVisibleEscorts() {
        return this.filteredEscorts;
    }
    
    getAllEscorts() {
        return this.visibleEscorts;
    }
    
    getEscortById(id) {
        return this.visibleEscorts.find(e => e.id === id);
    }
    
    getEscortsByTier(tier) {
        return this.visibleEscorts.filter(e => e.tier === tier && e.subscriptionActive);
    }
    
    getEscortsByCategory(category) {
        return this.visibleEscorts.filter(e => e.category === category && e.subscriptionActive);
    }
    
    getOnlineEscorts() {
        return this.visibleEscorts.filter(e => e.isOnline && e.subscriptionActive);
    }
    
    getActiveFilters() {
        return { ...this.activeFilters };
    }
    
    setFilter(filterName, value) {
        this.activeFilters[filterName] = value;
        this.saveFilters();
        this.applyFilters();
    }
    
    clearFilters() {
        this.activeFilters = {
            tier: null,
            category: null,
            priceRange: null,
            services: [],
            availability: 'all',
            distance: 10
        };
        this.saveFilters();
        this.applyFilters();
    }
    
    emitVisibilityChange() {
        const event = new CustomEvent('escort-visibility-change', {
            detail: {
                escorts: this.filteredEscorts,
                filters: this.activeFilters,
                sortBy: this.sortBy,
                total: this.filteredEscorts.length
            }
        });
        document.dispatchEvent(event);
    }
    
    // Check subscription expiry
    checkSubscriptionExpiry() {
        const now = new Date();
        const expiredEscorts = this.visibleEscorts.filter(escort => {
            return new Date(escort.subscriptionExpiry) < now;
        });
        
        if (expiredEscorts.length > 0) {
            expiredEscorts.forEach(escort => {
                escort.subscriptionActive = false;
            });
            this.applyFilters();
            
            // Notify about expired subscriptions
            const event = new CustomEvent('subscriptions-expired', {
                detail: { count: expiredEscorts.length }
            });
            document.dispatchEvent(event);
        }
    }
    
    // Run expiry check periodically
    startExpiryChecker() {
        // Check every hour
        setInterval(() => {
            this.checkSubscriptionExpiry();
        }, 60 * 60 * 1000);
        
        // Initial check
        this.checkSubscriptionExpiry();
    }
}

// Initialize and export
window.escortVisibilityState = new EscortVisibilityState();
export default window.escortVisibilityState;