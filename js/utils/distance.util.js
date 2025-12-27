// Distance Calculation Utilities
class DistanceUtil {
    constructor() {
        this.EARTH_RADIUS_KM = 6371;
        this.EARTH_RADIUS_MILES = 3959;
        this.KM_TO_MILES = 0.621371;
        this.MILES_TO_KM = 1.60934;
    }
    
    /**
     * Calculate distance between two coordinates using Haversine formula
     * @param {number} lat1 - Latitude of first point in degrees
     * @param {number} lon1 - Longitude of first point in degrees
     * @param {number} lat2 - Latitude of second point in degrees
     * @param {number} lon2 - Longitude of second point in degrees
     * @param {string} unit - 'km' or 'miles' (default: 'km')
     * @returns {number} Distance in specified unit
     */
    calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
        const R = unit === 'miles' ? this.EARTH_RADIUS_MILES : this.EARTH_RADIUS_KM;
        
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    
    /**
     * Calculate distance between multiple points
     * @param {Array} points - Array of [lat, lon] pairs
     * @param {string} unit - 'km' or 'miles'
     * @returns {number} Total distance
     */
    calculatePathDistance(points, unit = 'km') {
        if (!points || points.length < 2) return 0;
        
        let totalDistance = 0;
        
        for (let i = 0; i < points.length - 1; i++) {
            const [lat1, lon1] = points[i];
            const [lat2, lon2] = points[i + 1];
            
            totalDistance += this.calculateDistance(lat1, lon1, lat2, lon2, unit);
        }
        
        return totalDistance;
    }
    
    /**
     * Check if a point is within a radius of another point
     * @param {number} lat1 - Center latitude
     * @param {number} lon1 - Center longitude
     * @param {number} lat2 - Point latitude
     * @param {number} lon2 - Point longitude
     * @param {number} radius - Radius in km
     * @returns {boolean} True if point is within radius
     */
    isWithinRadius(lat1, lon1, lat2, lon2, radius) {
        const distance = this.calculateDistance(lat1, lon1, lat2, lon2, 'km');
        return distance <= radius;
    }
    
    /**
     * Find nearest point from a reference point
     * @param {Array} points - Array of objects with lat/lon properties
     * @param {number} refLat - Reference latitude
     * @param {number} refLon - Reference longitude
     * @param {string} unit - 'km' or 'miles'
     * @returns {Object} Nearest point and distance
     */
    findNearestPoint(points, refLat, refLon, unit = 'km') {
        if (!points || points.length === 0) return null;
        
        let nearestPoint = null;
        let minDistance = Infinity;
        
        points.forEach(point => {
            const distance = this.calculateDistance(
                refLat, refLon,
                point.latitude || point.lat,
                point.longitude || point.lon,
                unit
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = { point, distance };
            }
        });
        
        return nearestPoint;
    }
    
    /**
     * Sort points by distance from reference point
     * @param {Array} points - Array of objects with lat/lon properties
     * @param {number} refLat - Reference latitude
     * @param {number} refLon - Reference longitude
     * @param {string} unit - 'km' or 'miles'
     * @returns {Array} Sorted points
     */
    sortByDistance(points, refLat, refLon, unit = 'km') {
        if (!points || points.length === 0) return [];
        
        return points
            .map(point => ({
                ...point,
                distance: this.calculateDistance(
                    refLat, refLon,
                    point.latitude || point.lat,
                    point.longitude || point.lon,
                    unit
                )
            }))
            .sort((a, b) => a.distance - b.distance);
    }
    
    /**
     * Calculate bearing between two points
     * @param {number} lat1 - Start latitude
     * @param {number} lon1 - Start longitude
     * @param {number} lat2 - End latitude
     * @param {number} lon2 - End longitude
     * @returns {number} Bearing in degrees (0-360)
     */
    calculateBearing(lat1, lon1, lat2, lon2) {
        const φ1 = this.deg2rad(lat1);
        const φ2 = this.deg2rad(lat2);
        const λ1 = this.deg2rad(lon1);
        const λ2 = this.deg2rad(lon2);
        
        const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
                Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
        
        const θ = Math.atan2(y, x);
        return (this.rad2deg(θ) + 360) % 360;
    }
    
    /**
     * Calculate destination point given distance and bearing
     * @param {number} lat - Start latitude
     * @param {number} lon - Start longitude
     * @param {number} distance - Distance in km
     * @param {number} bearing - Bearing in degrees
     * @returns {Object} Destination coordinates {lat, lon}
     */
    calculateDestination(lat, lon, distance, bearing) {
        const R = this.EARTH_RADIUS_KM;
        const δ = distance / R; // Angular distance in radians
        const φ1 = this.deg2rad(lat);
        const λ1 = this.deg2rad(lon);
        const θ = this.deg2rad(bearing);
        
        const φ2 = Math.asin(
            Math.sin(φ1) * Math.cos(δ) +
            Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
        );
        
        const λ2 = λ1 + Math.atan2(
            Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
            Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
        );
        
        return {
            lat: this.rad2deg(φ2),
            lon: (this.rad2deg(λ2) + 540) % 360 - 180 // Normalize to -180..180
        };
    }
    
    /**
     * Calculate ETA based on distance and average speed
     * @param {number} distance - Distance in km
     * @param {number} averageSpeed - Average speed in km/h
     * @param {number} trafficFactor - Traffic multiplier (default: 1.2)
     * @returns {Object} ETA in minutes and hours
     */
    calculateETA(distance, averageSpeed = 30, trafficFactor = 1.2) {
        if (!distance || distance <= 0) return { minutes: 0, hours: 0 };
        
        const timeHours = distance / averageSpeed;
        const adjustedHours = timeHours * trafficFactor;
        
        const minutes = Math.ceil(adjustedHours * 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        return {
            minutes,
            hours,
            remainingMinutes,
            formatted: minutes < 60 
                ? `${minutes} min` 
                : `${hours}h ${remainingMinutes}min`
        };
    }
    
    /**
     * Format distance for display
     * @param {number} distance - Distance in km
     * @param {string} unit - 'km' or 'miles'
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted distance
     */
    formatDistance(distance, unit = 'km', decimals = 1) {
        if (!distance && distance !== 0) return 'N/A';
        
        let value = distance;
        let displayUnit = unit;
        
        // Convert if needed
        if (unit === 'miles') {
            value = distance * this.KM_TO_MILES;
            displayUnit = 'mi';
        } else {
            displayUnit = 'km';
        }
        
        // Format number
        if (value < 0.1) {
            // Show in meters
            const meters = value * 1000;
            return `${Math.round(meters)} m`;
        } else if (value < 1) {
            // Show with 2 decimals for small distances
            return `${value.toFixed(2)} ${displayUnit}`;
        } else if (value < 10) {
            // Show with 1 decimal
            return `${value.toFixed(1)} ${displayUnit}`;
        } else {
            // Show as integer
            return `${Math.round(value)} ${displayUnit}`;
        }
    }
    
    /**
     * Calculate bounding box around a point
     * @param {number} lat - Center latitude
     * @param {number} lon - Center longitude
     * @param {number} radius - Radius in km
     * @returns {Object} Bounding box {minLat, maxLat, minLon, maxLon}
     */
    calculateBoundingBox(lat, lon, radius) {
        const R = this.EARTH_RADIUS_KM;
        const latDelta = (radius / R) * (180 / Math.PI);
        const lonDelta = (radius / (R * Math.cos(this.deg2rad(lat)))) * (180 / Math.PI);
        
        return {
            minLat: lat - latDelta,
            maxLat: lat + latDelta,
            minLon: lon - lonDelta,
            maxLon: lon + lonDelta
        };
    }
    
    /**
     * Check if coordinates are valid
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @returns {boolean} True if valid coordinates
     */
    isValidCoordinates(lat, lon) {
        return (
            lat >= -90 && lat <= 90 &&
            lon >= -180 && lon <= 180 &&
            !isNaN(lat) && !isNaN(lon)
        );
    }
    
    /**
     * Convert degrees to radians
     * @param {number} degrees 
     * @returns {number} Radians
     */
    deg2rad(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    /**
     * Convert radians to degrees
     * @param {number} radians 
     * @returns {number} Degrees
     */
    rad2deg(radians) {
        return radians * (180 / Math.PI);
    }
    
    /**
     * Convert km to miles
     * @param {number} km 
     * @returns {number} Miles
     */
    kmToMiles(km) {
        return km * this.KM_TO_MILES;
    }
    
    /**
     * Convert miles to km
     * @param {number} miles 
     * @returns {number} Kilometers
     */
    milesToKm(miles) {
        return miles * this.MILES_TO_KM;
    }
    
    /**
     * Calculate approximate walking time
     * @param {number} distance - Distance in km
     * @param {number} walkingSpeed - Walking speed in km/h (default: 5)
     * @returns {Object} Walking time in minutes
     */
    calculateWalkingTime(distance, walkingSpeed = 5) {
        return this.calculateETA(distance, walkingSpeed, 1);
    }
    
    /**
     * Calculate approximate driving time
     * @param {number} distance - Distance in km
     * @param {number} drivingSpeed - Driving speed in km/h (default: 40)
     * @param {number} trafficFactor - Traffic multiplier (default: 1.3)
     * @returns {Object} Driving time in minutes
     */
    calculateDrivingTime(distance, drivingSpeed = 40, trafficFactor = 1.3) {
        return this.calculateETA(distance, drivingSpeed, trafficFactor);
    }
}

// Create and export singleton instance
window.distanceUtil = new DistanceUtil();
export default window.distanceUtil;