// User Location State Management
class UserLocationState {
    constructor() {
        this.currentLocation = null;
        this.selectedLocation = null;
        this.locationHistory = [];
        this.watchId = null;
        this.init();
    }
    
    init() {
        // Load saved location from localStorage
        this.loadSavedLocation();
        
        // Listen for location updates
        this.setupEventListeners();
    }
    
    loadSavedLocation() {
        try {
            const saved = localStorage.getItem('marmaid-user-location');
            if (saved) {
                this.selectedLocation = JSON.parse(saved);
                this.emitLocationChange();
            }
        } catch (error) {
            console.error('Error loading saved location:', error);
        }
    }
    
    saveLocation(location) {
        try {
            localStorage.setItem('marmaid-user-location', JSON.stringify(location));
        } catch (error) {
            console.error('Error saving location:', error);
        }
    }
    
    setupEventListeners() {
        // Listen for geolocation updates from service
        document.addEventListener('geolocation-update', (event) => {
            this.currentLocation = event.detail;
            this.emitLocationChange();
        });
        
        // Listen for manual location selection
        document.addEventListener('location-selected', (event) => {
            this.selectedLocation = event.detail;
            this.saveLocation(event.detail);
            this.emitLocationChange();
        });
        
        // Clear location on logout
        document.addEventListener('user-logout', () => {
            this.clearLocation();
        });
    }
    
    async getCurrentLocation() {
        if (this.currentLocation) {
            return this.currentLocation;
        }
        
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp,
                        source: 'geolocation'
                    };
                    
                    this.currentLocation = location;
                    this.emitLocationChange();
                    resolve(location);
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }
    
    setSelectedLocation(location) {
        this.selectedLocation = location;
        this.saveLocation(location);
        
        // Add to history (keep last 5)
        this.locationHistory.unshift(location);
        if (this.locationHistory.length > 5) {
            this.locationHistory = this.locationHistory.slice(0, 5);
        }
        
        // Save history
        this.saveHistory();
        
        this.emitLocationChange();
    }
    
    getSelectedLocation() {
        return this.selectedLocation || this.currentLocation;
    }
    
    startWatching() {
        if (this.watchId || !navigator.geolocation) return;
        
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp,
                    source: 'geolocation-watch'
                };
                
                this.currentLocation = location;
                this.emitLocationChange();
            },
            (error) => {
                console.error('Geolocation watch error:', error);
                this.stopWatching();
            },
            {
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000
            }
        );
    }
    
    stopWatching() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }
    
    clearLocation() {
        this.selectedLocation = null;
        localStorage.removeItem('marmaid-user-location');
        this.emitLocationChange();
    }
    
    getLocationHistory() {
        return this.locationHistory;
    }
    
    saveHistory() {
        try {
            localStorage.setItem('marmaid-location-history', JSON.stringify(this.locationHistory));
        } catch (error) {
            console.error('Error saving location history:', error);
        }
    }
    
    loadHistory() {
        try {
            const saved = localStorage.getItem('marmaid-location-history');
            if (saved) {
                this.locationHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading location history:', error);
        }
    }
    
    emitLocationChange() {
        const event = new CustomEvent('user-location-change', {
            detail: {
                current: this.currentLocation,
                selected: this.selectedLocation,
                active: this.getSelectedLocation()
            }
        });
        document.dispatchEvent(event);
    }
    
    // Calculate distance between two points in km
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Get approximate ETA in minutes based on distance
    getETA(distanceKm, trafficFactor = 1.2) {
        const averageSpeed = 30; // km/h in urban area
        const timeHours = distanceKm / averageSpeed;
        const timeMinutes = timeHours * 60 * trafficFactor;
        return Math.ceil(timeMinutes);
    }
}

// Initialize and export
window.userLocationState = new UserLocationState();
export default window.userLocationState;