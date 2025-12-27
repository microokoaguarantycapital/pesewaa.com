// OpenStreetMap Map Service
class OSMMapService {
    constructor() {
        this.map = null;
        this.markers = [];
        this.userMarker = null;
        this.layerGroups = {};
        this.tileLayer = null;
        this.mapBounds = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createTileLayer();
    }
    
    setupEventListeners() {
        // Listen for map initialization requests
        document.addEventListener('init-map', (event) => {
            this.initializeMap(event.detail);
        });
        
        // Listen for escort updates
        document.addEventListener('escort-visibility-change', (event) => {
            this.updateEscortMarkers(event.detail.escorts);
        });
        
        // Listen for user location updates
        document.addEventListener('user-location-change', (event) => {
            this.updateUserLocation(event.detail.active);
        });
        
        // Listen for map bounds changes
        document.addEventListener('map-bounds-change', (event) => {
            this.mapBounds = event.detail;
        });
    }
    
    createTileLayer() {
        // Create OpenStreetMap tile layer
        this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            minZoom: 10,
            detectRetina: true
        });
        
        // Alternative tile layers for fallback
        this.alternativeLayers = {
            'OpenStreetMap Hot': L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team',
                maxZoom: 19
            }),
            'OpenTopoMap': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenTopoMap contributors',
                maxZoom: 17
            }),
            'CartoDB Dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
                maxZoom: 19
            })
        };
    }
    
    initializeMap(config) {
        const { containerId, center, zoom, options = {} } = config;
        
        const defaultOptions = {
            center: center || [-1.2921, 36.8219], // Nairobi coordinates
            zoom: zoom || 13,
            zoomControl: true,
            attributionControl: true,
            minZoom: 10,
            maxZoom: 19,
            worldCopyJump: true,
            maxBounds: [
                [-1.5, 36.6], // Southwest bounds
                [-1.1, 37.0]  // Northeast bounds
            ],
            maxBoundsViscosity: 1.0
        };
        
        const mapOptions = { ...defaultOptions, ...options };
        
        // Initialize map
        this.map = L.map(containerId, mapOptions);
        
        // Add tile layer
        this.tileLayer.addTo(this.map);
        
        // Add layer control
        this.addLayerControl();
        
        // Add scale control
        L.control.scale({ imperial: false }).addTo(this.map);
        
        // Add fullscreen control if supported
        if (this.isFullscreenSupported()) {
            this.map.addControl(new L.Control.Fullscreen());
        }
        
        // Listen for map events
        this.setupMapEvents();
        
        // Emit map ready event
        this.emitMapReady();
        
        return this.map;
    }
    
    setupMapEvents() {
        if (!this.map) return;
        
        // Track map bounds changes
        this.map.on('moveend', () => {
            const bounds = this.map.getBounds();
            this.mapBounds = {
                northEast: bounds.getNorthEast(),
                southWest: bounds.getSouthWest()
            };
            
            // Emit bounds change
            document.dispatchEvent(new CustomEvent('map-bounds-change', {
                detail: this.mapBounds
            }));
        });
        
        // Track zoom changes
        this.map.on('zoomend', () => {
            const zoom = this.map.getZoom();
            document.dispatchEvent(new CustomEvent('map-zoom-change', {
                detail: { zoom }
            }));
        });
        
        // Track click events
        this.map.on('click', (event) => {
            document.dispatchEvent(new CustomEvent('map-click', {
                detail: {
                    latlng: event.latlng,
                    layerPoint: event.layerPoint,
                    containerPoint: event.containerPoint
                }
            }));
        });
    }
    
    addLayerControl() {
        if (!this.map) return;
        
        const baseLayers = {
            'OpenStreetMap': this.tileLayer,
            ...this.alternativeLayers
        };
        
        // Create overlay layers for different escort tiers
        this.layerGroups = {
            'basic': L.layerGroup(),
            'gold': L.layerGroup(),
            'premium': L.layerGroup(),
            'full': L.layerGroup()
        };
        
        const overlayLayers = {
            'Basic Escorts': this.layerGroups.basic,
            'Gold Escorts': this.layerGroups.gold,
            'Premium Escorts': this.layerGroups.premium,
            'Full Visibility': this.layerGroups.full
        };
        
        L.control.layers(baseLayers, overlayLayers, {
            collapsed: true,
            position: 'topright'
        }).addTo(this.map);
    }
    
    updateEscortMarkers(escorts) {
        // Clear existing markers
        this.clearEscortMarkers();
        
        // Add new markers
        escorts.forEach(escort => {
            if (escort.latitude && escort.longitude) {
                this.addEscortMarker(escort);
            }
        });
        
        // Fit bounds if markers exist
        if (this.markers.length > 0) {
            this.fitMapToMarkers();
        }
    }
    
    addEscortMarker(escort) {
        if (!this.map || !this.layerGroups[escort.tier]) return null;
        
        // Create custom icon based on tier
        const icon = this.createEscortIcon(escort);
        
        // Create marker
        const marker = L.marker([escort.latitude, escort.longitude], { icon })
            .addTo(this.layerGroups[escort.tier])
            .bindPopup(this.createEscortPopup(escort));
        
        // Store marker reference
        marker.escortId = escort.id;
        this.markers.push(marker);
        
        // Add click event
        marker.on('click', () => {
            document.dispatchEvent(new CustomEvent('escort-marker-click', {
                detail: { escortId: escort.id, escort }
            }));
        });
        
        return marker;
    }
    
    createEscortIcon(escort) {
        // Determine icon size based on tier
        const size = this.getIconSize(escort.tier);
        
        // Create custom HTML for marker
        const html = `
            <div class="map-pin ${escort.tier}" style="width: ${size}px; height: ${size}px;">
                <img src="${escort.profilePhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}" 
                     alt="${escort.name}"
                     class="map-pin-image">
                ${escort.isOnline ? '<div class="online-dot"></div>' : ''}
            </div>
        `;
        
        return L.divIcon({
            html,
            className: `escort-marker ${escort.tier}-marker`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2]
        });
    }
    
    getIconSize(tier) {
        const sizes = {
            'basic': 40,
            'gold': 45,
            'premium': 50,
            'full': 55
        };
        return sizes[tier] || 40;
    }
    
    createEscortPopup(escort) {
        return `
            <div class="escort-popup">
                <div class="popup-header">
                    <img src="${escort.profilePhoto}" alt="${escort.name}" class="popup-photo">
                    <div class="popup-info">
                        <h4>${escort.name}</h4>
                        <span class="tier-badge ${escort.tier}">${escort.tier.toUpperCase()}</span>
                        ${escort.isOnline ? '<span class="online-status">● Online</span>' : ''}
                    </div>
                </div>
                <div class="popup-body">
                    <p><strong>Services:</strong> ${escort.services.slice(0, 3).join(', ')}</p>
                    <p><strong>Price:</strong> KES ${escort.basePrice}</p>
                    <p><strong>Distance:</strong> ${escort.distance ? escort.distance.toFixed(1) + ' km' : 'N/A'}</p>
                </div>
                <div class="popup-actions">
                    <button class="btn btn-danger btn-small call-btn" data-escort-id="${escort.id}">📞 Call</button>
                    <button class="btn btn-primary btn-small message-btn" data-escort-id="${escort.id}">💬 Message</button>
                </div>
            </div>
        `;
    }
    
    updateUserLocation(location) {
        if (!this.map || !location) return;
        
        // Remove existing user marker
        if (this.userMarker) {
            this.userMarker.remove();
        }
        
        // Create user marker
        const userIcon = L.divIcon({
            html: '<div class="user-location-marker"></div>',
            className: 'user-location-icon',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        this.userMarker = L.marker([location.latitude, location.longitude], {
            icon: userIcon,
            zIndexOffset: 1000
        }).addTo(this.map);
        
        // Add accuracy circle
        if (location.accuracy) {
            L.circle([location.latitude, location.longitude], {
                radius: location.accuracy,
                fillColor: '#3B82F6',
                fillOpacity: 0.1,
                color: '#3B82F6',
                weight: 1
            }).addTo(this.map);
        }
        
        // Center map on user location
        this.map.setView([location.latitude, location.longitude], 15);
    }
    
    clearEscortMarkers() {
        // Clear all layer groups
        Object.values(this.layerGroups).forEach(layer => {
            layer.clearLayers();
        });
        
        // Clear markers array
        this.markers = [];
    }
    
    fitMapToMarkers() {
        if (!this.map || this.markers.length === 0) return;
        
        const group = new L.featureGroup(this.markers);
        this.map.fitBounds(group.getBounds().pad(0.1));
    }
    
    addToMap(layer) {
        if (this.map && layer) {
            layer.addTo(this.map);
        }
    }
    
    removeFromMap(layer) {
        if (this.map && layer) {
            this.map.removeLayer(layer);
        }
    }
    
    setView(latlng, zoom) {
        if (this.map) {
            this.map.setView(latlng, zoom);
        }
    }
    
    panTo(latlng) {
        if (this.map) {
            this.map.panTo(latlng);
        }
    }
    
    getMap() {
        return this.map;
    }
    
    getBounds() {
        return this.map ? this.map.getBounds() : null;
    }
    
    getCenter() {
        return this.map ? this.map.getCenter() : null;
    }
    
    getZoom() {
        return this.map ? this.map.getZoom() : null;
    }
    
    emitMapReady() {
        document.dispatchEvent(new CustomEvent('map-ready', {
            detail: { map: this.map }
        }));
    }
    
    isFullscreenSupported() {
        return document.fullscreenEnabled || 
               document.webkitFullscreenEnabled || 
               document.mozFullScreenEnabled ||
               document.msFullscreenEnabled;
    }
    
    // Add custom overlay (like heatmap or clustering)
    addHeatmap(data, options = {}) {
        if (!this.map) return null;
        
        const heatmapLayer = L.heatLayer(data.map(point => {
            return [point.lat, point.lng, point.intensity || 1];
        }), {
            radius: options.radius || 25,
            blur: options.blur || 15,
            maxZoom: options.maxZoom || 17,
            gradient: options.gradient || {
                0.4: 'blue',
                0.6: 'cyan',
                0.7: 'lime',
                0.8: 'yellow',
                1.0: 'red'
            }
        }).addTo(this.map);
        
        return heatmapLayer;
    }
    
    // Add custom control
    addCustomControl(control, position = 'topright') {
        if (this.map && control) {
            control.addTo(this.map);
            return control;
        }
        return null;
    }
    
    // Draw route between points
    drawRoute(points, options = {}) {
        if (!this.map || points.length < 2) return null;
        
        const route = L.polyline(points, {
            color: options.color || '#7B2CBF',
            weight: options.weight || 4,
            opacity: options.opacity || 0.7,
            dashArray: options.dashArray || null
        }).addTo(this.map);
        
        return route;
    }
    
    // Add search control
    addSearchControl() {
        if (!this.map) return null;
        
        const searchControl = new L.Control.Search({
            url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
            jsonpParam: 'json_callback',
            propertyName: 'display_name',
            propertyLoc: ['lat', 'lon'],
            marker: L.marker([0, 0], { opacity: 0 }),
            autoCollapse: true,
            autoType: false,
            minLength: 2,
            zoom: 15
        });
        
        this.map.addControl(searchControl);
        return searchControl;
    }
}

// Add CSS for map elements
if (!document.querySelector('#map-styles')) {
    const mapStyles = document.createElement('style');
    mapStyles.id = 'map-styles';
    mapStyles.textContent = `
        .map-pin {
            border-radius: 50%;
            border: 3px solid;
            overflow: hidden;
            position: relative;
            background: var(--color-bg-primary);
        }
        
        .map-pin.basic { border-color: #9CA3AF; }
        .map-pin.gold { border-color: #D4AF37; }
        .map-pin.premium { border-color: #7B2CBF; filter: drop-shadow(0 0 8px rgba(123, 44, 191, 0.7)); }
        .map-pin.full { border-color: #B11226; filter: drop-shadow(0 0 10px rgba(177, 18, 38, 0.8)); }
        
        .map-pin-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .online-dot {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 10px;
            height: 10px;
            background: #1DB954;
            border: 2px solid var(--color-bg-primary);
            border-radius: 50%;
        }
        
        .user-location-marker {
            width: 30px;
            height: 30px;
            background: #3B82F6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .escort-popup {
            min-width: 200px;
            font-family: 'Inter', sans-serif;
        }
        
        .popup-header {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .popup-photo {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
        }
        
        .popup-info h4 {
            margin: 0;
            font-size: 14px;
            color: var(--color-text-primary);
        }
        
        .online-status {
            color: #1DB954;
            font-size: 12px;
            display: block;
            margin-top: 4px;
        }
        
        .popup-body {
            font-size: 12px;
            color: var(--color-text-secondary);
            margin-bottom: 10px;
        }
        
        .popup-actions {
            display: flex;
            gap: 5px;
        }
        
        .leaflet-popup-content-wrapper {
            background: var(--color-bg-card);
            color: var(--color-text-primary);
            border-radius: var(--radius-md);
            border: 1px solid var(--color-border-light);
        }
        
        .leaflet-popup-tip {
            background: var(--color-bg-card);
            border: 1px solid var(--color-border-light);
        }
    `;
    document.head.appendChild(mapStyles);
}

// Initialize and export
window.osmMapService = new OSMMapService();
export default window.osmMapService;