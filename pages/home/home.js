// Home Page JavaScript
class HomePage {
    constructor() {
        this.selectedService = null;
        this.selectedLocation = null;
        this.searchTimeout = null;
        this.init();
    }
    
    init() {
        console.log('Home page initialized');
        this.cacheElements();
        this.bindEvents();
        this.loadRecentLocations();
        this.checkLocationPermission();
        
        // Listen for location changes
        document.addEventListener('user-location-change', (event) => {
            this.handleLocationChange(event.detail);
        });
        
        // Listen for service selection
        document.addEventListener('service-selected', (event) => {
            this.handleServiceSelection(event.detail);
        });
        
        // Initial state check
        this.updateContinueButton();
    }
    
    cacheElements() {
        // Location elements
        this.useCurrentLocationBtn = document.getElementById('use-current-location');
        this.enterLocationBtn = document.getElementById('enter-location');
        this.locationSearch = document.getElementById('location-search');
        this.backFromSearchBtn = document.getElementById('back-from-search');
        this.locationSearchInput = document.getElementById('location-search-input');
        this.searchResults = document.getElementById('search-results');
        this.recentLocations = document.getElementById('recent-locations');
        this.selectedLocationDisplay = document.getElementById('selected-location-display');
        this.selectedLocationName = document.getElementById('selected-location-name');
        this.selectedLocationAddress = document.getElementById('selected-location-address');
        this.changeLocationBtn = document.getElementById('change-location-btn');
        
        // Service elements
        this.bookNowOption = document.getElementById('book-now-option');
        this.scheduleLaterOption = document.getElementById('schedule-later-option');
        this.premiumOption = document.getElementById('premium-option');
        this.subscriptionOption = document.getElementById('subscription-option');
        
        // Continue button
        this.continueBtn = document.getElementById('continue-btn');
        
        // Featured section
        this.featuredSection = document.getElementById('featured-section');
        this.featuredContainer = document.getElementById('featured-container');
    }
    
    bindEvents() {
        // Location selection
        if (this.useCurrentLocationBtn) {
            this.useCurrentLocationBtn.addEventListener('click', () => {
                this.useCurrentLocation();
            });
        }
        
        if (this.enterLocationBtn) {
            this.enterLocationBtn.addEventListener('click', () => {
                this.showLocationSearch();
            });
        }
        
        if (this.backFromSearchBtn) {
            this.backFromSearchBtn.addEventListener('click', () => {
                this.hideLocationSearch();
            });
        }
        
        if (this.locationSearchInput) {
            this.locationSearchInput.addEventListener('input', (e) => {
                this.handleLocationSearch(e.target.value);
            });
        }
        
        if (this.changeLocationBtn) {
            this.changeLocationBtn.addEventListener('click', () => {
                this.showLocationSearch();
            });
        }
        
        // Service selection
        const serviceOptions = [
            this.bookNowOption,
            this.scheduleLaterOption,
            this.premiumOption,
            this.subscriptionOption
        ];
        
        serviceOptions.forEach(option => {
            if (option) {
                option.addEventListener('click', (e) => {
                    this.selectService(e.currentTarget.dataset.service);
                });
            }
        });
        
        // Continue button
        if (this.continueBtn) {
            this.continueBtn.addEventListener('click', () => {
                this.continueToEscortSelection();
            });
        }
        
        // Close search on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.locationSearch.classList.contains('hidden')) {
                this.hideLocationSearch();
            }
        });
    }
    
    async useCurrentLocation() {
        try {
            // Show loading state
            this.showLoading(this.useCurrentLocationBtn);
            
            // Request location permission
            const location = await window.geolocationService.getCurrentPosition();
            
            if (location) {
                // Get address from coordinates
                const address = await window.geolocationService.reverseGeocode(
                    location.latitude,
                    location.longitude
                );
                
                this.setSelectedLocation({
                    latitude: location.latitude,
                    longitude: location.longitude,
                    name: 'Current Location',
                    address: address ? address.display_name : 'Your current location',
                    source: 'geolocation'
                });
                
                // Hide loading
                this.hideLoading(this.useCurrentLocationBtn);
                
                // Show success message
                this.showToast('Location detected successfully', 'success');
            }
        } catch (error) {
            console.error('Location error:', error);
            this.hideLoading(this.useCurrentLocationBtn);
            
            if (error.code === 1) {
                // Permission denied
                this.showPermissionDeniedMessage();
            } else {
                this.showToast('Unable to get your location. Please try again.', 'error');
            }
        }
    }
    
    showLocationSearch() {
        this.locationSearch.classList.remove('hidden');
        this.locationSearchInput.focus();
        
        // Hide location options
        this.enterLocationBtn.closest('.location-options').classList.add('hidden');
        
        // Show recent locations
        this.showRecentLocations();
    }
    
    hideLocationSearch() {
        this.locationSearch.classList.add('hidden');
        this.locationSearchInput.value = '';
        this.searchResults.innerHTML = '';
        
        // Show location options
        this.enterLocationBtn.closest('.location-options').classList.remove('hidden');
    }
    
    async handleLocationSearch(query) {
        if (!query || query.length < 3) {
            this.searchResults.innerHTML = '';
            return;
        }
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Debounce search
        this.searchTimeout = setTimeout(async () => {
            try {
                this.showSearchLoading();
                
                const results = await window.geolocationService.searchLocation(query);
                this.displaySearchResults(results);
                
                this.hideSearchLoading();
            } catch (error) {
                console.error('Search error:', error);
                this.hideSearchLoading();
                this.showSearchError();
            }
        }, 300);
    }
    
    showSearchLoading() {
        this.searchResults.innerHTML = `
            <div class="search-loading">
                <div class="loading-spinner"></div>
                <p>Searching...</p>
            </div>
        `;
    }
    
    hideSearchLoading() {
        const loadingElement = this.searchResults.querySelector('.search-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    displaySearchResults(results) {
        if (!results || results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="no-results">
                    <p>No locations found. Try a different search term.</p>
                </div>
            `;
            return;
        }
        
        this.searchResults.innerHTML = results.map(result => `
            <div class="result-item" data-lat="${result.latitude}" data-lng="${result.longitude}" data-name="${result.displayName}">
                <h5>${result.address?.road || result.address?.suburb || 'Location'}</h5>
                <p>${result.displayName}</p>
            </div>
        `).join('');
        
        // Add click events to result items
        const resultItems = this.searchResults.querySelectorAll('.result-item');
        resultItems.forEach(item => {
            item.addEventListener('click', () => {
                this.selectSearchResult(item);
            });
        });
    }
    
    showSearchError() {
        this.searchResults.innerHTML = `
            <div class="search-error">
                <p>Unable to search locations. Please check your connection.</p>
            </div>
        `;
    }
    
    selectSearchResult(item) {
        const lat = parseFloat(item.dataset.lat);
        const lng = parseFloat(item.dataset.lng);
        const name = item.dataset.name;
        
        this.setSelectedLocation({
            latitude: lat,
            longitude: lng,
            name: 'Selected Location',
            address: name,
            source: 'search'
        });
        
        this.hideLocationSearch();
    }
    
    setSelectedLocation(location) {
        this.selectedLocation = location;
        
        // Update display
        this.selectedLocationName.textContent = location.name;
        this.selectedLocationAddress.textContent = location.address;
        this.selectedLocationDisplay.classList.remove('hidden');
        
        // Save to state
        if (window.userLocationState) {
            window.userLocationState.setSelectedLocation(location);
        }
        
        // Show featured escorts if location is set
        this.loadFeaturedEscorts();
        
        // Update continue button
        this.updateContinueButton();
    }
    
    handleLocationChange(detail) {
        if (detail.selected) {
            this.setSelectedLocation(detail.selected);
        } else if (detail.current) {
            // Auto-select current location if no location is selected
            if (!this.selectedLocation) {
                this.setSelectedLocation({
                    latitude: detail.current.latitude,
                    longitude: detail.current.longitude,
                    name: 'Current Location',
                    address: 'Your current location',
                    source: 'auto-detect'
                });
            }
        }
    }
    
    selectService(service) {
        // Remove active class from all options
        const serviceOptions = document.querySelectorAll('.service-option');
        serviceOptions.forEach(option => {
            option.classList.remove('active');
        });
        
        // Add active class to selected option
        const selectedOption = document.querySelector(`.service-option[data-service="${service}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        }
        
        this.selectedService = service;
        
        // Emit service selected event
        document.dispatchEvent(new CustomEvent('service-selected', {
            detail: { service }
        }));
        
        // Update continue button
        this.updateContinueButton();
    }
    
    handleServiceSelection(detail) {
        this.selectedService = detail.service;
        this.updateContinueButton();
    }
    
    updateContinueButton() {
        if (!this.continueBtn) return;
        
        const hasLocation = this.selectedLocation !== null;
        const hasService = this.selectedService !== null;
        
        if (hasLocation && hasService) {
            this.continueBtn.disabled = false;
            this.continueBtn.textContent = 'Continue to Escorts';
            this.continueBtn.classList.remove('btn-secondary');
            this.continueBtn.classList.add('btn-primary');
        } else if (hasLocation) {
            this.continueBtn.disabled = false;
            this.continueBtn.textContent = 'Select Service Type to Continue';
            this.continueBtn.classList.remove('btn-primary');
            this.continueBtn.classList.add('btn-secondary');
        } else {
            this.continueBtn.disabled = true;
            this.continueBtn.textContent = 'Select Location to Continue';
            this.continueBtn.classList.remove('btn-primary');
            this.continueBtn.classList.add('btn-secondary');
        }
    }
    
    continueToEscortSelection() {
        if (!this.selectedLocation || !this.selectedService) {
            this.showToast('Please select both location and service type', 'warning');
            return;
        }
        
        // Save selection to app state
        if (window.appState) {
            window.appState.userLocation = this.selectedLocation;
            window.appState.selectedService = this.selectedService;
        }
        
        // Navigate to escort selection page
        window.location.hash = '/escorts';
    }
    
    loadRecentLocations() {
        if (!window.userLocationState) return;
        
        const history = window.userLocationState.getLocationHistory();
        
        if (history.length === 0) {
            this.recentLocations.innerHTML = `
                <p class="no-recent">No recent locations</p>
            `;
            return;
        }
        
        this.recentLocations.innerHTML = `
            <h5>Recent Locations</h5>
            ${history.map(location => `
                <div class="recent-location-item" data-lat="${location.latitude}" data-lng="${location.longitude}">
                    <svg viewBox="0 0 24 24" class="recent-icon">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <div class="recent-details">
                        <h6>${location.name || 'Previous Location'}</h6>
                        <p>${location.address || 'Unknown address'}</p>
                    </div>
                </div>
            `).join('')}
        `;
        
        // Add click events to recent locations
        const recentItems = this.recentLocations.querySelectorAll('.recent-location-item');
        recentItems.forEach(item => {
            item.addEventListener('click', () => {
                const lat = parseFloat(item.dataset.lat);
                const lng = parseFloat(item.dataset.lng);
                
                // Find the location in history
                const location = history.find(loc => 
                    loc.latitude === lat && loc.longitude === lng
                );
                
                if (location) {
                    this.setSelectedLocation(location);
                    this.hideLocationSearch();
                }
            });
        });
    }
    
    showRecentLocations() {
        this.loadRecentLocations();
    }
    
    async loadFeaturedEscorts() {
        if (!this.selectedLocation || !window.escortVisibilityState) return;
        
        try {
            // Show featured section
            this.featuredSection.classList.remove('hidden');
            
            // Get escorts near location
            const allEscorts = window.escortVisibilityState.getAllEscorts();
            
            // Filter for premium/full escorts and calculate distance
            const featuredEscorts = allEscorts
                .filter(escort => 
                    (escort.tier === 'premium' || escort.tier === 'full') && 
                    escort.subscriptionActive
                )
                .map(escort => {
                    const distance = window.userLocationState.calculateDistance(
                        this.selectedLocation.latitude,
                        this.selectedLocation.longitude,
                        escort.latitude,
                        escort.longitude
                    );
                    return { ...escort, distance };
                })
                .filter(escort => escort.distance <= 5) // Within 5km
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 4); // Top 4
            
            if (featuredEscorts.length === 0) {
                this.featuredContainer.innerHTML = `
                    <div class="no-featured">
                        <p>No featured escorts in your area. Try adjusting your location.</p>
                    </div>
                `;
                return;
            }
            
            // Render featured escorts
            this.featuredContainer.innerHTML = featuredEscorts.map(escort => `
                <div class="featured-card" data-escort-id="${escort.id}">
                    <img src="${escort.profilePhoto}" alt="${escort.name}" class="featured-image">
                    <div class="featured-content">
                        <h4 class="featured-name">${escort.name}</h4>
                        <p class="featured-tier">${escort.tier.toUpperCase()} • ${escort.distance.toFixed(1)}km</p>
                        <p class="featured-price">KES ${escort.basePrice}</p>
                    </div>
                </div>
            `).join('');
            
            // Add click events to featured cards
            const featuredCards = this.featuredContainer.querySelectorAll('.featured-card');
            featuredCards.forEach(card => {
                card.addEventListener('click', () => {
                    const escortId = card.dataset.escortId;
                    const escort = featuredEscorts.find(e => e.id === escortId);
                    
                    if (escort) {
                        // Navigate to escort selection with this escort highlighted
                        window.location.hash = `/escorts?highlight=${escortId}`;
                    }
                });
            });
            
        } catch (error) {
            console.error('Error loading featured escorts:', error);
            this.featuredSection.classList.add('hidden');
        }
    }
    
    checkLocationPermission() {
        const permission = window.geolocationService.getPermissionStatus();
        
        if (permission === 'denied') {
            this.showPermissionDeniedMessage();
        }
    }
    
    showPermissionDeniedMessage() {
        const message = document.createElement('div');
        message.className = 'permission-denied';
        message.innerHTML = `
            <p>Location access denied. Please enable location services in your browser settings.</p>
        `;
        
        // Insert after location options
        const locationSection = document.querySelector('.location-section');
        if (locationSection) {
            locationSection.appendChild(message);
        }
    }
    
    showLoading(element) {
        if (!element) return;
        
        element.classList.add('loading');
        const originalHTML = element.innerHTML;
        element.setAttribute('data-original-html', originalHTML);
        element.innerHTML = `
            <div class="loading-spinner"></div>
            <span>Loading...</span>
        `;
    }
    
    hideLoading(element) {
        if (!element) return;
        
        element.classList.remove('loading');
        const originalHTML = element.getAttribute('data-original-html');
        if (originalHTML) {
            element.innerHTML = originalHTML;
        }
    }
    
    showToast(message, type = 'info') {
        if (window.appUtils) {
            window.appUtils.showToast(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
    
    // Cleanup method
    destroy() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Remove event listeners
        document.removeEventListener('user-location-change', this.handleLocationChange);
        document.removeEventListener('service-selected', this.handleServiceSelection);
    }
}

// Initialize home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the home page
    if (window.location.hash === '#/home' || window.location.hash === '') {
        window.homePage = new HomePage();
    }
});

// Initialize when page loads via router
document.addEventListener('page-home-init', () => {
    window.homePage = new HomePage();
});

// Cleanup when leaving page
document.addEventListener('route-change', (event) => {
    if (event.detail.page !== 'home' && window.homePage) {
        window.homePage.destroy();
        window.homePage = null;
    }
});

// Export for module use
export default HomePage;