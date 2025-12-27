// Escort Card Component
class EscortCardComponent {
    constructor() {
        this.cache = new Map();
        this.init();
    }
    
    init() {
        // Listen for escort card render requests
        document.addEventListener('render-escort-card', (event) => {
            this.render(event.detail);
        });
        
        // Listen for card click events
        document.addEventListener('click', (event) => {
            if (event.target.closest('.escort-card')) {
                this.handleCardClick(event);
            }
        });
    }
    
    render(config) {
        const { escort, container, template = 'default' } = config;
        
        if (!escort || !container) {
            console.error('Missing required parameters for escort card');
            return;
        }
        
        // Check cache
        const cacheKey = `${escort.id}-${template}`;
        if (this.cache.has(cacheKey)) {
            container.innerHTML = this.cache.get(cacheKey);
            this.attachEventListeners(container, escort);
            return;
        }
        
        // Generate HTML based on template
        let html;
        switch (template) {
            case 'compact':
                html = this.generateCompactCard(escort);
                break;
            case 'featured':
                html = this.generateFeaturedCard(escort);
                break;
            case 'detailed':
                html = this.generateDetailedCard(escort);
                break;
            default:
                html = this.generateDefaultCard(escort);
        }
        
        // Cache the HTML
        this.cache.set(cacheKey, html);
        
        // Render to container
        container.innerHTML = html;
        
        // Attach event listeners
        this.attachEventListeners(container, escort);
    }
    
    generateDefaultCard(escort) {
        const tierColor = this.getTierColor(escort.tier);
        const isExpired = !this.isSubscriptionActive(escort.subscriptionExpiry);
        
        return `
            <div class="escort-card ${isExpired ? 'expired' : ''}" data-escort-id="${escort.id}">
                ${isExpired ? '<div class="expired-overlay">Subscription Expired</div>' : ''}
                
                <div class="escort-card-header">
                    <div class="escort-avatar">
                        <img src="${escort.profilePhoto}" alt="${escort.name}" class="escort-photo">
                        ${escort.isOnline ? '<span class="online-indicator"></span>' : ''}
                    </div>
                    
                    <div class="escort-info">
                        <div class="escort-name-row">
                            <h3 class="escort-name">${escort.name}</h3>
                            <span class="escort-tier-badge ${escort.tier}" style="border-color: ${tierColor}; color: ${tierColor}; background: ${tierColor}20;">
                                ${escort.tier.toUpperCase()}
                            </span>
                        </div>
                        
                        <p class="escort-category">${this.formatCategory(escort.category)}</p>
                        
                        <div class="escort-stats">
                            <span class="escort-stat">
                                <svg class="stat-icon" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                                ${escort.distance ? `${escort.distance.toFixed(1)} km` : 'N/A'}
                            </span>
                            
                            <span class="escort-stat">
                                <svg class="stat-icon" viewBox="0 0 24 24">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                                </svg>
                                ${this.calculateETA(escort.distance)} min
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="escort-services">
                    ${escort.services.slice(0, 5).map(service => `
                        <span class="service-tag">${service}</span>
                    `).join('')}
                    ${escort.services.length > 5 ? `<span class="service-tag">+${escort.services.length - 5} more</span>` : ''}
                </div>
                
                <div class="escort-features">
                    ${escort.bonusServices && escort.bonusServices.length > 0 ? `
                        <div class="bonus-services">
                            <svg class="feature-icon" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                            <span>${escort.bonusServices.join(', ')}</span>
                        </div>
                    ` : ''}
                    
                    ${escort.discounts && escort.discounts.length > 0 ? `
                        <div class="discounts">
                            <svg class="feature-icon" viewBox="0 0 24 24">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                            </svg>
                            <span>${escort.discounts.join(', ')}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="escort-footer">
                    <div class="escort-pricing">
                        <span class="price">KES ${escort.basePrice}</span>
                        <span class="price-note">minimum</span>
                    </div>
                    
                    <div class="escort-actions">
                        <button class="btn btn-danger btn-small call-btn" data-escort-id="${escort.id}">
                            <svg class="btn-icon" viewBox="0 0 24 24">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                            </svg>
                            Call
                        </button>
                        
                        <button class="btn btn-primary btn-small message-btn" data-escort-id="${escort.id}">
                            <svg class="btn-icon" viewBox="0 0 24 24">
                                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                            </svg>
                            Message
                        </button>
                    </div>
                </div>
                
                ${!escort.subscriptionActive ? `
                    <div class="subscription-warning">
                        <svg class="warning-icon" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <span>Subscription expired. Not visible to clients.</span>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    generateCompactCard(escort) {
        return `
            <div class="escort-card compact" data-escort-id="${escort.id}">
                <div class="compact-header">
                    <img src="${escort.profilePhoto}" alt="${escort.name}" class="compact-photo">
                    <div class="compact-info">
                        <h4>${escort.name}</h4>
                        <span class="compact-tier ${escort.tier}">${escort.tier}</span>
                    </div>
                </div>
                <div class="compact-footer">
                    <span class="compact-price">KES ${escort.basePrice}</span>
                    <button class="btn btn-danger btn-small call-btn" data-escort-id="${escort.id}">Call</button>
                </div>
            </div>
        `;
    }
    
    generateFeaturedCard(escort) {
        const tierColor = this.getTierColor(escort.tier);
        
        return `
            <div class="escort-card featured" data-escort-id="${escort.id}">
                <div class="featured-banner" style="background: ${tierColor}20; border-left: 4px solid ${tierColor};">
                    <span class="featured-badge">FEATURED</span>
                    <span class="escort-tier-badge ${escort.tier}">${escort.tier.toUpperCase()}</span>
                </div>
                
                <div class="featured-content">
                    <img src="${escort.profilePhoto}" alt="${escort.name}" class="featured-photo">
                    
                    <div class="featured-details">
                        <h3>${escort.name}</h3>
                        <p class="featured-category">${this.formatCategory(escort.category)}</p>
                        
                        <div class="featured-highlights">
                            <div class="highlight">
                                <svg class="highlight-icon" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                <span>Verified Profile</span>
                            </div>
                            
                            ${escort.rating ? `
                                <div class="highlight">
                                    <svg class="highlight-icon" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                    </svg>
                                    <span>${escort.rating.toFixed(1)} (${escort.reviewCount})</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="featured-services">
                            ${escort.services.slice(0, 3).map(service => `
                                <span class="featured-service">${service}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="featured-actions">
                    <div class="featured-price">
                        <span class="price-main">KES ${escort.basePrice}</span>
                        <span class="price-label">starting price</span>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="btn btn-danger call-btn" data-escort-id="${escort.id}">
                            📞 Call Now
                        </button>
                        <button class="btn btn-primary message-btn" data-escort-id="${escort.id}">
                            💬 Quick Message
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateDetailedCard(escort) {
        // Similar to default but with more details
        return this.generateDefaultCard(escort) + `
            <div class="detailed-section">
                <h4>About ${escort.name}</h4>
                <p class="escort-description">${escort.description || 'No description available.'}</p>
                
                <div class="detailed-stats">
                    <div class="stat">
                        <span class="stat-label">Response Time</span>
                        <span class="stat-value">${this.getResponseTime(escort.lastActive)}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Languages</span>
                        <span class="stat-value">English, Swahili</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Verification</span>
                        <span class="stat-value ${escort.verificationStatus}">${escort.verificationStatus}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    attachEventListeners(container, escort) {
        // Call button
        const callBtn = container.querySelector('.call-btn');
        if (callBtn) {
            callBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleCallClick(escort);
            });
        }
        
        // Message button
        const messageBtn = container.querySelector('.message-btn');
        if (messageBtn) {
            messageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleMessageClick(escort);
            });
        }
        
        // Card click
        const card = container.querySelector('.escort-card');
        if (card) {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.call-btn') && !e.target.closest('.message-btn')) {
                    this.handleCardSelect(escort);
                }
            });
        }
    }
    
    handleCallClick(escort) {
        console.log('Calling escort:', escort.name, escort.phone);
        
        // Emit call event
        document.dispatchEvent(new CustomEvent('escort-call', {
            detail: { escort, phone: escort.phone }
        }));
        
        // Show call confirmation
        this.showCallConfirmation(escort);
    }
    
    handleMessageClick(escort) {
        console.log('Messaging escort:', escort.name);
        
        // Emit message event
        document.dispatchEvent(new CustomEvent('escort-message', {
            detail: { escort }
        }));
        
        // Open messaging interface
        this.openMessaging(escort);
    }
    
    handleCardSelect(escort) {
        console.log('Selected escort:', escort.name);
        
        // Emit select event
        document.dispatchEvent(new CustomEvent('escort-select', {
            detail: { escort }
        }));
        
        // Show escort details
        this.showEscortDetails(escort);
    }
    
    handleCardClick(event) {
        const card = event.target.closest('.escort-card');
        if (card) {
            const escortId = card.getAttribute('data-escort-id');
            
            // Find escort in visibility state
            if (window.escortVisibilityState) {
                const escort = window.escortVisibilityState.getEscortById(escortId);
                if (escort) {
                    this.handleCardSelect(escort);
                }
            }
        }
    }
    
    showCallConfirmation(escort) {
        const modal = document.createElement('div');
        modal.className = 'call-confirmation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Call ${escort.name}</h3>
                <p>You are about to call: <strong>${escort.phone}</strong></p>
                <p>Charges may apply based on your service provider.</p>
                
                <div class="modal-actions">
                    <button class="btn btn-secondary cancel-call">Cancel</button>
                    <a href="tel:${escort.phone}" class="btn btn-danger confirm-call">
                        📞 Call Now
                    </a>
                </div>
            </div>
        `;
        
        // Add styles
        if (!document.querySelector('#call-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'call-modal-styles';
            styles.textContent = `
                .call-confirmation-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                
                .call-confirmation-modal .modal-content {
                    background: var(--color-bg-card);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-xl);
                    max-width: 400px;
                    width: 100%;
                    border: 1px solid var(--color-border-light);
                    box-shadow: var(--shadow-xl);
                }
                
                .call-confirmation-modal h3 {
                    margin-bottom: var(--spacing-md);
                    color: var(--color-text-primary);
                }
                
                .call-confirmation-modal p {
                    margin-bottom: var(--spacing-md);
                    color: var(--color-text-secondary);
                }
                
                .modal-actions {
                    display: flex;
                    gap: var(--spacing-md);
                    margin-top: var(--spacing-xl);
                }
                
                .modal-actions .btn {
                    flex: 1;
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Add event listeners
        const cancelBtn = modal.querySelector('.cancel-call');
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 30000);
        
        document.body.appendChild(modal);
    }
    
    openMessaging(escort) {
        // Open messaging interface (simplified)
        window.location.hash = `/message/${escort.id}`;
    }
    
    showEscortDetails(escort) {
        // Open escort details page
        window.location.hash = `/escort/${escort.id}`;
    }
    
    // Utility methods
    getTierColor(tier) {
        const colors = {
            'basic': '#9CA3AF',
            'gold': '#D4AF37',
            'premium': '#7B2CBF',
            'full': '#B11226'
        };
        return colors[tier] || '#9CA3AF';
    }
    
    formatCategory(category) {
        const categories = {
            'straight': 'Straight',
            'shemale': 'Shemale',
            'gay': 'Gay',
            'lesbian': 'Lesbian'
        };
        return categories[category] || category;
    }
    
    calculateETA(distanceKm) {
        if (!distanceKm) return 'N/A';
        const averageSpeed = 30; // km/h
        const timeMinutes = (distanceKm / averageSpeed) * 60;
        return Math.ceil(timeMinutes);
    }
    
    isSubscriptionActive(expiryDate) {
        if (!expiryDate) return false;
        const now = new Date();
        const expiry = new Date(expiryDate);
        return now <= expiry;
    }
    
    getResponseTime(lastActive) {
        if (!lastActive) return 'Unknown';
        
        const lastActiveDate = new Date(lastActive);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastActiveDate) / (1000 * 60));
        
        if (diffMinutes < 5) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes} min ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
        return `${Math.floor(diffMinutes / 1440)} days ago`;
    }
    
    // Clear cache
    clearCache() {
        this.cache.clear();
    }
    
    // Batch render multiple cards
    renderBatch(configs) {
        configs.forEach(config => {
            this.render(config);
        });
    }
}

// Initialize and export
window.escortCardComponent = new EscortCardComponent();
export default window.escortCardComponent;