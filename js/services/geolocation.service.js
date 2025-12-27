// Geolocation Service
class GeolocationService {
    constructor() {
        this.currentPosition = null;
        this.watchId = null;
        this.permission = 'prompt'; // prompt, granted, denied
        this.init();
    }
    
    init() {
        this.checkPermission();
        this.setupEventListeners();
    }
    
    async checkPermission() {
        if (!navigator.permissions || !navigator.permissions.query) {
            return;
        }
        
        try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            this.permission = result.state;
            
            result.onchange = () => {
                this.permission = result.state;
                this.emitPermissionChange();
            };
        } catch (error) {
            console.warn('Geolocation permission API not fully supported');
        }
    }
    
    setupEventListeners() {
        // Listen for location requests
        document.addEventListener('request-location', async () => {
            await this.getCurrentPosition();
        });
        
        // Listen for start tracking requests
        document.addEventListener('start-tracking', () => {
            this.startWatching();
        });
        
        // Listen for stop tracking requests
        document.addEventListener('stop-tracking', () => {
            this.stopWatching();
        });
    }
    
    async getCurrentPosition(options = {}) {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            const defaultOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            };
            
            const finalOptions = { ...defaultOptions, ...options };
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.handlePositionSuccess(position);
                    resolve(position);
                },
                (error) => {
                    this.handlePositionError(error);
                    reject(error);
                },
                finalOptions
            );
        });
    }
    
    startWatching(options = {}) {
        if (this.watchId || !navigator.geolocation) return;
        
        const defaultOptions = {
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 27000
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.handlePositionSuccess(position);
            },
            (error) => {
                this.handlePositionError(error);
                this.stopWatching();
            },
            finalOptions
        );
        
        console.log('Started geolocation watching');
    }
    
    stopWatching() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            console.log('Stopped geolocation watching');
        }
    }
    
    handlePositionSuccess(position) {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
            source: 'geolocation'
        };
        
        this.currentPosition = location;
        
        // Emit update event
        this.emitPositionUpdate(location);
        
        // Update user location state
        if (window.userLocationState) {
            window.userLocationState.currentLocation = location;
            window.userLocationState.emitLocationChange();
        }
    }
    
    handlePositionError(error) {
        console.error('Geolocation error:', error);
        
        let errorMessage = 'Unable to get your location';
        
        switch(error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'Location permission denied';
                this.permission = 'denied';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable';
                break;
            case error.TIMEOUT:
                errorMessage = 'Location request timed out';
                break;
        }
        
        // Emit error event
        this.emitPositionError(errorMessage);
    }
    
    emitPositionUpdate(position) {
        const event = new CustomEvent('geolocation-update', {
            detail: position
        });
        document.dispatchEvent(event);
    }
    
    emitPositionError(error) {
        const event = new CustomEvent('geolocation-error', {
            detail: { error }
        });
        document.dispatchEvent(event);
    }
    
    emitPermissionChange() {
        const event = new CustomEvent('geolocation-permission-change', {
            detail: { permission: this.permission }
        });
        document.dispatchEvent(event);
    }
    
    getCurrentPositionCached() {
        return this.currentPosition;
    }
    
    getPermissionStatus() {
        return this.permission;
    }
    
    async requestPermission() {
        if (this.permission === 'granted') {
            return true;
        }
        
        if (this.permission === 'denied') {
            throw new Error('Permission previously denied');
        }
        
        try {
            // Try to get position - this will trigger permission prompt
            const position = await this.getCurrentPosition();
            return position !== null;
        } catch (error) {
            throw error;
        }
    }
    
    // Reverse geocoding using OpenStreetMap Nominatim
    async reverseGeocode(latitude, longitude) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            
            if (!response.ok) {
                throw new Error('Reverse geocoding failed');
            }
            
            const data = await response.json();
            
            return {
                address: data.display_name,
                houseNumber: data.address.house_number,
                road: data.address.road,
                suburb: data.address.suburb,
                city: data.address.city || data.address.town || data.address.village,
                state: data.address.state,
                country: data.address.country,
                countryCode: data.address.country_code,
                postcode: data.address.postcode,
                latitude: data.lat,
                longitude: data.lon
            };
        } catch (error) {
            console.error('Reverse geocode error:', error);
            return null;
        }
    }
    
    // Search location by query
    async searchLocation(query) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
            );
            
            if (!response.ok) {
                throw new Error('Location search failed');
            }
            
            const data = await response.json();
            
            return data.map(result => ({
                displayName: result.display_name,
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                importance: result.importance,
                type: result.type,
                address: result.address
            }));
        } catch (error) {
            console.error('Location search error:', error);
            return [];
        }
    }
    
    // Calculate distance between two coordinates (Haversine formula)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    deg2rad(deg) {
        return deg * (Math.PI/180);
    }
    
    // Get bearing between two coordinates
    getBearing(lat1, lon1, lat2, lon2) {
        const dLon = this.deg2rad(lon2 - lon1);
        const y = Math.sin(dLon) * Math.cos(this.deg2rad(lat2));
        const x = Math.cos(this.deg2rad(lat1)) * Math.sin(this.deg2rad(lat2)) -
                Math.sin(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.cos(dLon);
        return (this.rad2deg(Math.atan2(y, x)) + 360) % 360;
    }
    
    rad2deg(rad) {
        return rad * (180/Math.PI);
    }
    
    // Check if location is within radius
    isWithinRadius(lat1, lon1, lat2, lon2, radiusKm) {
        const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
        return distance <= radiusKm;
    }
    
    // Get approximate address from coordinates (simplified)
    getApproximateAddress(latitude, longitude) {
        // This is a simplified version - use reverseGeocode for accurate results
        return `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    }
    
    // Watch for significant location changes (for mobile optimization)
    startSignificantChangeWatching() {
        if (!navigator.geolocation) return;
        
        // Use lower accuracy for battery optimization
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.handlePositionSuccess(position);
            },
            (error) => {
                this.handlePositionError(error);
            },
            {
                enableHighAccuracy: false,
                maximumAge: 300000, // 5 minutes
                timeout: 30000
            }
        );
    }
}

// Initialize and export
window.geolocationService = new GeolocationService();
export default window.geolocationService;