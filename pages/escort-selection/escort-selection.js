// Escort Selection Page JavaScript
class EscortSelectionPage {
    constructor() {
        this.currentFilters = {};
        this.currentSort = 'tier-priority';
        this.map = null;
        this.selectedEscortId = null;
        this.init();
    }
    
    init() {
        console.log('Escort selection page initialized');
        this.cacheElements();
        this.bindEvents();
        this.initializeMap();
        this.loadInitialData();
        this.setupEventListeners();
    }
    
    cacheElements() {
        // Map elements
        this.backToHomeBtn = document.getElementById('back-to-home');
        this.filterBtn = document.getElementById('filter-btn');
        this.filterCount = document.getElementById('filter-count');
        this.escortMap = document.getElementById('escort-map');
        
        // Summary elements
        this.currentLocationEl = document.getElementById('current-location');
        this.serviceLocationEl = document.getElementById('service-location');
        
        // Escorts elements
        this.escortsCount = document.getElementById('escorts-count');
        this.sortBtn = document.getElementById('sort-btn');
        this.currentSortEl = document.getElementById('current-sort');
        this.filterTags = document.getElementById('filter-tags');
        this.clearFiltersBtn = document.getElementById('clear-filters-btn');
        this.escortsContainer = document.getElementById('escorts-container');
        this.noResults = document.getElementById('no-results');
        this.resetFiltersBtn = document.getElementById('reset-filters-btn');
        
        // Tier buttons
        this.tierButtons = document.querySelectorAll('.tier-btn');
        
        // Filter panel elements
        this.filtersPanel = document.getElementById('filters-panel');
        this.closeFiltersBtn = document.getElementById('close-filters-btn');
        this.cancelFiltersBtn = document.getElementById('cancel-filters-btn');
        this.applyFiltersBtn = document.getElementById('apply-filters-btn');
        
        // Sort panel elements
        this.sortPanel = document.getElementById('sort-panel');
        this.applySortBtn = document.getElementById('apply-sort-btn');
        
        // Filter inputs
        this.categoryFilters = document.querySelectorAll('input[name="category"]');
        this.serviceFilters = document.querySelectorAll('input[name="services"]');
        this.availabilityFilters = document.querySelectorAll('input[name="availability"]');
        this.minPriceInput = document.getElementById('min-price');
        this.maxPriceInput = document.getElementById('max-price');
        this.priceSliderMin = document.getElementById('price-slider-min');
        this.priceSliderMax = document.getElementById('price-slider-max');
        this.distanceSlider = document.getElementById('distance-slider');
        this.distanceValue = document.getElementById('distance-value');
    }
    
    bindEvents() {
        // Navigation
        if (this.backToHomeBtn) {
            this.backToHomeBtn.addEventListener('click', () => {
                window.history.back();
            });
        }
        
        // Filter controls
        if (this.filterBtn) {
            this.filterBtn.addEventListener('click', () => {
                this.showFiltersPanel();
            });
        }
        
        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
        
        if (this.resetFiltersBtn) {
            this.resetFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
        
        // Sort controls
        if (this.sortBtn) {
            this.sortBtn.addEventListener('click', () => {
                this.showSortPanel();
            });
        }
        
        if (this.applySortBtn) {
            this.applySortBtn.addEventListener('click', () => {
                this.applySort();
            });
        }
        
        // Tier buttons
        this.tierButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleTierFilter(e.currentTarget.dataset.tier);
            });
        });
        
        // Filter panel controls
        if (this.closeFiltersBtn) {
            this.closeFiltersBtn.addEventListener('click', () => {
                this.hideFiltersPanel();
            });
        }
        
        if (this.cancelFiltersBtn) {
            this.cancelFiltersBtn.addEventListener('click', () => {
                this.hideFiltersPanel();
                this.resetFilterForm();
            });
        }
        
        if (this.applyFiltersBtn) {
            this.applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }
        
        // Filter input events
        if (this.minPriceInput && this.priceSliderMin) {
            this.minPriceInput.addEventListener('input', (e) => {
                this.priceSliderMin.value = e.target.value;
                this.updatePriceDisplay();
            });
            
            this.priceSliderMin.addEventListener('input', (e) => {
                this.minPriceInput.value = e.target.value;
                this.updatePriceDisplay();
            });
        }
        
        if (this.maxPriceInput && this.priceSliderMax) {
            this.maxPriceInput.addEventListener('input', (e) => {
                this.priceSliderMax.value = e.target.value;
                this.updatePriceDisplay();
            });
            
            this.priceSliderMax.addEventListener('input', (e) => {
                this.maxPriceInput.value = e.target.value;
                this.updatePriceDisplay();
            });
        }
        
        if (this.distanceSlider) {
            this.distanceSlider.addEventListener('input', (e) => {
                this.distanceValue.textContent = `${e.target.value} km`;
            });
        }
        
        // Close panels on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.filtersPanel.classList.contains('show')) {
                    this.hideFiltersPanel();
                }
                if (this.sortPanel.classList.contains('show')) {
                    this.hideSortPanel();
                }
            }
        });
        
        // Close panels on backdrop click
        document.addEventListener('click', (e) => {
            if (this.filtersPanel.classList.contains('show') && 
                !this.filtersPanel.contains(e.target) && 
                !this.filterBtn.contains(e.target)) {
                this.hideFiltersPanel();
            }
            
            if (this.sortPanel.classList.contains('show') && 
                !this.sortPanel.contains(e.target) && 
                !this.sortBtn.contains(e.target)) {
                this.hideSortPanel();
            }
        });
    }
    
    setupEventListeners() {
        // Listen for escort visibility changes
        document.addEventListener('escort-visibility-change', (event) => {
            this.updateEscortDisplay(event.detail);
        });
        
        // Listen for user location changes
        document.addEventListener('user-location-change', (event) => {
            this.updateLocationDisplay(event.detail);
        });
        
        // Listen for escort marker clicks
        document.addEventListener('escort-marker-click', (event) => {
            this.highlightEscort(event.detail.escortId);
        });
        
        // Listen for map ready
        document.addEventListener('map-ready', () => {
            this.onMapReady();
        });
    }
    
    initializeMap() {
        if (!this.escortMap) return;
        
        // Get user location
        let center = [-1.2921, 36.8219]; // Default to Nairobi
        
        if (window.userLocationState) {
            const location = window.userLocationState.getSelectedLocation();
            if (location) {
                center = [location.latitude, location.longitude];
            }
        }
        
        // Initialize map
        window.osmMapService.initializeMap({
            containerId: 'escort-map',
            center: center,
            zoom: 14
        });
    }
    
    onMapReady() {
        // Center map on user location
        if (window.userLocationState) {
            const location = window.userLocationState.getSelectedLocation();
            if (location && window.osmMapService.map) {
                window.osmMapService.map.setView([location.latitude, location.longitude], 15);
            }
        }
        
        // Load initial escorts
        if (window.escortVisibilityState) {
            const escorts = window.escortVisibilityState.getVisibleEscorts();
            this.updateEscortDisplay({ escorts });
        }
    }
    
    loadInitialData() {
        // Update location display
        if (window.userLocationState) {
            const location = window.userLocationState.getSelectedLocation();
            this.updateLocationDisplay({ active: location });
        }
        
        // Load current filters
        if (window.escortVisibilityState) {
            this.currentFilters = window.escortVisibilityState.getActiveFilters();
            this.currentSort = window.escortVisibilityState.sortBy;
            this.updateFilterDisplay();
            this.updateSortDisplay();
        }
    }
    
    updateLocationDisplay(locationDetail) {
        if (!locationDetail || !locationDetail.active) return;
        
        const location = locationDetail.active;
        
        // Update summary bar
        if (this.currentLocationEl) {
            this.currentLocationEl.textContent = location.address || 'Your location';
        }
        
        if (this.serviceLocationEl) {
            this.serviceLocationEl.textContent = location.address || 'Your location';
        }
        
        // Update map if needed
        if (window.osmMapService && window.osmMapService.map) {
            window.osmMapService.updateUserLocation(location);
        }
    }
    
    updateEscortDisplay(detail) {
        const { escorts, total } = detail;
        
        // Update count
        if (this.escortsCount) {
            this.escortsCount.textContent = `(${total || escorts.length})`;
        }
        
        // Show/hide no results message
        if (escorts.length === 0) {
            this.escortsContainer.classList.add('hidden');
            this.noResults.classList.remove('hidden');
        } else {
            this.escortsContainer.classList.remove('hidden');
            this.noResults.classList.add('hidden');
            
            // Clear existing cards
            this.escortsContainer.innerHTML = '';
            
            // Render escort cards
            escorts.forEach(escort => {
                this.renderEscortCard(escort);
            });
            
            // Update map markers
            if (window.osmMapService) {
                window.osmMapService.updateEscortMarkers(escorts);
            }
        }
    }
    
    renderEscortCard(escort) {
        const card = document.createElement('div');
        card.className = 'escort-card';
        card.dataset.escortId = escort.id;
        
        // Create card using the escort card component
        if (window.escortCardComponent) {
            window.escortCardComponent.render({
                escort,
                container: card,
                template: 'default'
            });
        } else {
            // Fallback basic card
            card.innerHTML = `
                <div class="escort-card-header">
                    <img src="${escort.profilePhoto}" alt="${escort.name}" class="escort-photo">
                    <div class="escort-info">
                        <h4>${escort.name}</h4>
                        <span class="escort-tier ${escort.tier}">${escort.tier}</span>
                        <p class="escort-distance">${escort.distance ? escort.distance.toFixed(1) + ' km' : 'N/A'}</p>
                    </div>
                </div>
                <div class="escort-services">
                    ${escort.services.slice(0, 3).map(service => `
                        <span class="service-tag">${service}</span>
                    `).join('')}
                </div>
                <div class="escort-footer">
                    <span class="escort-price">KES ${escort.basePrice}</span>
                    <button class="btn btn-danger btn-small" data-action="call">Call</button>
                </div>
            `;
            
            // Add event listeners
            card.addEventListener('click', (e) => {
                if (!e.target.closest('[data-action="call"]')) {
                    this.showEscortDetails(escort);
                }
            });
            
            const callBtn = card.querySelector('[data-action="call"]');
            if (callBtn) {
                callBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.callEscort(escort);
                });
            }
        }
        
        this.escortsContainer.appendChild(card);
    }
    
    updateFilterDisplay() {
        // Update filter count
        const activeFilters = this.countActiveFilters();
        if (this.filterCount) {
            this.filterCount.textContent = activeFilters;
            this.filterCount.style.display = activeFilters > 0 ? 'flex' : 'none';
        }
        
        // Update filter tags
        this.updateFilterTags();
        
        // Update tier buttons
        this.updateTierButtons();
    }
    
    countActiveFilters() {
        let count = 0;
        
        if (!this.currentFilters) return count;
        
        // Count tier filter
        if (this.currentFilters.tier) count++;
        
        // Count category filter
        if (this.currentFilters.category) count++;
        
        // Count price range
        if (this.currentFilters.priceRange) count++;
        
        // Count services
        if (this.currentFilters.services && this.currentFilters.services.length > 0) {
            count += this.currentFilters.services.length;
        }
        
        // Count availability
        if (this.currentFilters.availability && this.currentFilters.availability !== 'all') {
            count++;
        }
        
        // Count distance
        if (this.currentFilters.distance && this.currentFilters.distance !== 10) {
            count++;
        }
        
        return count;
    }
    
    updateFilterTags() {
        if (!this.filterTags) return;
        
        this.filterTags.innerHTML = '';
        
        // Add tier filter tag
        if (this.currentFilters.tier) {
            this.addFilterTag('tier', this.currentFilters.tier);
        }
        
        // Add category filter tag
        if (this.currentFilters.category) {
            this.addFilterTag('category', this.currentFilters.category);
        }
        
        // Add price range filter tag
        if (this.currentFilters.priceRange) {
            const [min, max] = this.currentFilters.priceRange;
            this.addFilterTag('price', `KES ${min} - ${max}`);
        }
        
        // Add services filter tags
        if (this.currentFilters.services && this.currentFilters.services.length > 0) {
            this.currentFilters.services.forEach(service => {
                this.addFilterTag('service', service);
            });
        }
        
        // Add availability filter tag
        if (this.currentFilters.availability && this.currentFilters.availability !== 'all') {
            this.addFilterTag('availability', 'Online Now');
        }
        
        // Add distance filter tag
        if (this.currentFilters.distance && this.currentFilters.distance !== 10) {
            this.addFilterTag('distance', `${this.currentFilters.distance} km`);
        }
    }
    
    addFilterTag(type, value) {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.dataset.filterType = type;
        tag.dataset.filterValue = value;
        
        let displayValue = value;
        if (type === 'tier') {
            displayValue = value.charAt(0).toUpperCase() + value.slice(1);
        } else if (type === 'category') {
            displayValue = value.charAt(0).toUpperCase() + value.slice(1);
        }
        
        tag.innerHTML = `
            <span class="tag-text">${displayValue}</span>
            <span class="filter-tag-remove" data-action="remove-filter">&times;</span>
        `;
        
        const removeBtn = tag.querySelector('[data-action="remove-filter"]');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFilter(type, value);
        });
        
        this.filterTags.appendChild(tag);
    }
    
    updateTierButtons() {
        this.tierButtons.forEach(btn => {
            const tier = btn.dataset.tier;
            if (this.currentFilters.tier === tier) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    updateSortDisplay() {
        if (!this.currentSortEl) return;
        
        const sortLabels = {
            'tier-priority': 'Tier Priority',
            'distance': 'Distance',
            'price-low-high': 'Price: Low to High',
            'price-high-low': 'Price: High to Low',
            'rating': 'Rating'
        };
        
        this.currentSortEl.textContent = sortLabels[this.currentSort] || this.currentSort;
    }
    
    toggleTierFilter(tier) {
        if (!window.escortVisibilityState) return;
        
        if (this.currentFilters.tier === tier) {
            // Remove tier filter
            window.escortVisibilityState.setFilter('tier', null);
            this.currentFilters.tier = null;
        } else {
            // Set tier filter
            window.escortVisibilityState.setFilter('tier', tier);
            this.currentFilters.tier = tier;
        }
        
        this.updateFilterDisplay();
    }
    
    removeFilter(type, value) {
        if (!window.escortVisibilityState) return;
        
        switch (type) {
            case 'tier':
                window.escortVisibilityState.setFilter('tier', null);
                this.currentFilters.tier = null;
                break;
                
            case 'category':
                window.escortVisibilityState.setFilter('category', null);
                this.currentFilters.category = null;
                break;
                
            case 'price':
                window.escortVisibilityState.setFilter('priceRange', null);
                this.currentFilters.priceRange = null;
                break;
                
            case 'service':
                const services = this.currentFilters.services.filter(s => s !== value);
                window.escortVisibilityState.setFilter('services', services);
                this.currentFilters.services = services;
                break;
                
            case 'availability':
                window.escortVisibilityState.setFilter('availability', 'all');
                this.currentFilters.availability = 'all';
                break;
                
            case 'distance':
                window.escortVisibilityState.setFilter('distance', 10);
                this.currentFilters.distance = 10;
                break;
        }
        
        this.updateFilterDisplay();
    }
    
    clearAllFilters() {
        if (!window.escortVisibilityState) return;
        
        window.escortVisibilityState.clearFilters();
        this.currentFilters = window.escortVisibilityState.getActiveFilters();
        
        // Reset filter form
        this.resetFilterForm();
        
        // Update display
        this.updateFilterDisplay();
        
        // Hide no results message
        this.noResults.classList.add('hidden');
        this.escortsContainer.classList.remove('hidden');
    }
    
    showFiltersPanel() {
        // Load current filters into form
        this.loadFiltersIntoForm();
        
        // Show panel
        this.filtersPanel.classList.add('show');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    hideFiltersPanel() {
        this.filtersPanel.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    loadFiltersIntoForm() {
        // Category filters
        this.categoryFilters.forEach(checkbox => {
            checkbox.checked = this.currentFilters.category === checkbox.value;
        });
        
        // Service filters
        this.serviceFilters.forEach(checkbox => {
            checkbox.checked = this.currentFilters.services?.includes(checkbox.value) || false;
        });
        
        // Availability filters
        this.availabilityFilters.forEach(radio => {
            radio.checked = this.currentFilters.availability === radio.value;
        });
        
        // Price range
        if (this.currentFilters.priceRange) {
            const [min, max] = this.currentFilters.priceRange;
            this.minPriceInput.value = min;
            this.maxPriceInput.value = max;
            this.priceSliderMin.value = min;
            this.priceSliderMax.value = max;
        } else {
            this.minPriceInput.value = 250;
            this.maxPriceInput.value = 10000;
            this.priceSliderMin.value = 250;
            this.priceSliderMax.value = 10000;
        }
        
        // Distance
        if (this.currentFilters.distance) {
            this.distanceSlider.value = this.currentFilters.distance;
            this.distanceValue.textContent = `${this.currentFilters.distance} km`;
        } else {
            this.distanceSlider.value = 10;
            this.distanceValue.textContent = '10 km';
        }
        
        this.updatePriceDisplay();
    }
    
    resetFilterForm() {
        // Reset to defaults
        this.categoryFilters.forEach(checkbox => checkbox.checked = false);
        this.serviceFilters.forEach(checkbox => checkbox.checked = false);
        this.availabilityFilters[0].checked = true; // "all"
        
        this.minPriceInput.value = 250;
        this.maxPriceInput.value = 10000;
        this.priceSliderMin.value = 250;
        this.priceSliderMax.value = 10000;
        
        this.distanceSlider.value = 10;
        this.distanceValue.textContent = '10 km';
        
        this.updatePriceDisplay();
    }
    
    updatePriceDisplay() {
        // Sync inputs and sliders
        if (this.minPriceInput && this.priceSliderMin) {
            const minValue = Math.min(
                parseInt(this.minPriceInput.value) || 250,
                parseInt(this.maxPriceInput.value) || 10000
            );
            this.minPriceInput.value = minValue;
            this.priceSliderMin.value = minValue;
        }
        
        if (this.maxPriceInput && this.priceSliderMax) {
            const maxValue = Math.max(
                parseInt(this.maxPriceInput.value) || 10000,
                parseInt(this.minPriceInput.value) || 250
            );
            this.maxPriceInput.value = maxValue;
            this.priceSliderMax.value = maxValue;
        }
    }
    
    applyFilters() {
        if (!window.escortVisibilityState) return;
        
        const newFilters = {};
        
        // Get category filter
        const categoryCheckbox = Array.from(this.categoryFilters).find(cb => cb.checked);
        if (categoryCheckbox) {
            newFilters.category = categoryCheckbox.value;
        }
        
        // Get services filter
        const selectedServices = Array.from(this.serviceFilters)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        if (selectedServices.length > 0) {
            newFilters.services = selectedServices;
        }
        
        // Get availability filter
        const availabilityRadio = Array.from(this.availabilityFilters).find(rb => rb.checked);
        if (availabilityRadio && availabilityRadio.value !== 'all') {
            newFilters.availability = availabilityRadio.value;
        }
        
        // Get price range filter
        const minPrice = parseInt(this.minPriceInput.value) || 250;
        const maxPrice = parseInt(this.maxPriceInput.value) || 10000;
        if (minPrice > 250 || maxPrice < 10000) {
            newFilters.priceRange = [minPrice, maxPrice];
        }
        
        // Get distance filter
        const distance = parseInt(this.distanceSlider.value) || 10;
        if (distance !== 10) {
            newFilters.distance = distance;
        }
        
        // Apply filters
        Object.keys(newFilters).forEach(key => {
            window.escortVisibilityState.setFilter(key, newFilters[key]);
        });
        
        // Update current filters
        this.currentFilters = { ...this.currentFilters, ...newFilters };
        
        // Update display
        this.updateFilterDisplay();
        
        // Hide panel
        this.hideFiltersPanel();
        
        // Show success message
        if (window.appUtils) {
            window.appUtils.showToast('Filters applied successfully', 'success');
        }
    }
    
    showSortPanel() {
        // Set current sort in form
        const currentSortRadio = document.querySelector(`input[name="sort"][value="${this.currentSort}"]`);
        if (currentSortRadio) {
            currentSortRadio.checked = true;
        }
        
        // Show panel
        this.sortPanel.classList.add('show');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    hideSortPanel() {
        this.sortPanel.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    applySort() {
        const selectedSort = document.querySelector('input[name="sort"]:checked');
        if (!selectedSort || !window.escortVisibilityState) return;
        
        const sortValue = selectedSort.value;
        
        // Emit sort change event
        document.dispatchEvent(new CustomEvent('sort-change', {
            detail: sortValue
        }));
        
        // Update current sort
        this.currentSort = sortValue;
        this.updateSortDisplay();
        
        // Hide panel
        this.hideSortPanel();
        
        // Show success message
        if (window.appUtils) {
            window.appUtils.showToast('Sorting applied', 'success');
        }
    }
    
    highlightEscort(escortId) {
        // Scroll to escort card
        const escortCard = document.querySelector(`.escort-card[data-escort-id="${escortId}"]`);
        if (escortCard) {
            escortCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add highlight effect
            escortCard.style.boxShadow = '0 0 0 3px var(--color-accent-purple)';
            setTimeout(() => {
                escortCard.style.boxShadow = '';
            }, 3000);
        }
        
        // Show escort details
        if (window.escortVisibilityState) {
            const escort = window.escortVisibilityState.getEscortById(escortId);
            if (escort) {
                this.showEscortDetails(escort);
            }
        }
    }
    
    showEscortDetails(escort) {
        console.log('Showing details for escort:', escort.name);
        
        // You would typically show a modal or navigate to escort details page
        // For now, just log and maybe show a toast
        if (window.appUtils) {
            window.appUtils.showToast(`Viewing ${escort.name} details`, 'info');
        }
        
        // Update app state
        if (window.appState) {
            window.appState.selectedEscort = escort;
        }
    }
    
    callEscort(escort) {
        console.log('Calling escort:', escort.name, escort.phone);
        
        // Emit call event
        document.dispatchEvent(new CustomEvent('escort-call', {
            detail: { escort, phone: escort.phone }
        }));
        
        // Show call confirmation
        if (window.escortCardComponent) {
            window.escortCardComponent.showCallConfirmation(escort);
        }
    }
    
    // Cleanup method
    destroy() {
        // Stop map watching if needed
        if (window.geolocationService) {
            window.geolocationService.stopWatching();
        }
        
        // Clean up event listeners
        document.removeEventListener('escort-visibility-change', this.updateEscortDisplay);
        document.removeEventListener('user-location-change', this.updateLocationDisplay);
        document.removeEventListener('escort-marker-click', this.highlightEscort);
        document.removeEventListener('map-ready', this.onMapReady);
    }
}

// Initialize escort selection page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the escort selection page
    if (window.location.hash === '#/escorts' || window.location.hash.includes('escort')) {
        window.escortSelectionPage = new EscortSelectionPage();
    }
});

// Initialize when page loads via router
document.addEventListener('page-escort-selection-init', () => {
    window.escortSelectionPage = new EscortSelectionPage();
});

// Cleanup when leaving page
document.addEventListener('route-change', (event) => {
    if (event.detail.page !== 'escort-selection' && window.escortSelectionPage) {
        window.escortSelectionPage.destroy();
        window.escortSelectionPage = null;
    }
});

// Export for module use
export default EscortSelectionPage;