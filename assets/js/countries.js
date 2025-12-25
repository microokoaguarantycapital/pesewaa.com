'use strict';

// Pesewa.com - Countries and Regions Module

// Countries data
const CountriesData = {
    countries: [],
    regions: {},
    currencies: {},
    phoneCodes: {},
    currentCountry: null,
    userLocation: null
};

// Country data structure
const Country = {
    code: '',
    name: '',
    currency: {
        code: '',
        symbol: '',
        name: ''
    },
    phoneCode: '',
    timezone: '',
    locale: '',
    flag: '',
    coordinates: {
        lat: 0,
        lng: 0
    },
    supported: true,
    tier: 'standard'
};

// Initialize countries module
function initCountries() {
    console.log('Countries: Initializing countries and regions module...');
    
    // Load countries data
    loadCountriesData();
    
    // Initialize countries UI
    initCountriesUI();
    
    // Initialize countries event listeners
    initCountriesEvents();
    
    // Detect user's country
    detectUserCountry();
    
    // Load regional data
    loadRegionalData();
}

// Load countries data
function loadCountriesData() {
    // In a real app, this would fetch from API
    const demoCountries = [
        {
            code: 'GH',
            name: 'Ghana',
            currency: {
                code: 'GHS',
                symbol: '₵',
                name: 'Ghanaian Cedi'
            },
            phoneCode: '+233',
            timezone: 'GMT',
            locale: 'en-GH',
            flag: '🇬🇭',
            coordinates: {
                lat: 7.9465,
                lng: -1.0232
            },
            supported: true,
            tier: 'primary',
            regions: ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Brong-Ahafo']
        },
        {
            code: 'NG',
            name: 'Nigeria',
            currency: {
                code: 'NGN',
                symbol: '₦',
                name: 'Nigerian Naira'
            },
            phoneCode: '+234',
            timezone: 'WAT',
            locale: 'en-NG',
            flag: '🇳🇬',
            coordinates: {
                lat: 9.0820,
                lng: 8.6753
            },
            supported: true,
            tier: 'secondary',
            regions: ['Lagos', 'Abuja', 'Kano', 'Rivers', 'Delta', 'Oyo', 'Kaduna', 'Katsina']
        },
        {
            code: 'KE',
            name: 'Kenya',
            currency: {
                code: 'KES',
                symbol: 'KSh',
                name: 'Kenyan Shilling'
            },
            phoneCode: '+254',
            timezone: 'EAT',
            locale: 'en-KE',
            flag: '🇰🇪',
            coordinates: {
                lat: -1.2864,
                lng: 36.8172
            },
            supported: true,
            tier: 'secondary',
            regions: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret']
        },
        {
            code: 'ZA',
            name: 'South Africa',
            currency: {
                code: 'ZAR',
                symbol: 'R',
                name: 'South African Rand'
            },
            phoneCode: '+27',
            timezone: 'SAST',
            locale: 'en-ZA',
            flag: '🇿🇦',
            coordinates: {
                lat: -30.5595,
                lng: 22.9375
            },
            supported: true,
            tier: 'secondary',
            regions: ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State']
        },
        {
            code: 'CI',
            name: 'Côte d\'Ivoire',
            currency: {
                code: 'XOF',
                symbol: 'CFA',
                name: 'West African CFA Franc'
            },
            phoneCode: '+225',
            timezone: 'GMT',
            locale: 'fr-CI',
            flag: '🇨🇮',
            coordinates: {
                lat: 7.5400,
                lng: -5.5471
            },
            supported: true,
            tier: 'secondary',
            regions: ['Abidjan', 'Bouaké', 'Daloa', 'Korhogo', 'San-Pédro']
        },
        {
            code: 'SN',
            name: 'Senegal',
            currency: {
                code: 'XOF',
                symbol: 'CFA',
                name: 'West African CFA Franc'
            },
            phoneCode: '+221',
            timezone: 'GMT',
            locale: 'fr-SN',
            flag: '🇸🇳',
            coordinates: {
                lat: 14.4974,
                lng: -14.4524
            },
            supported: true,
            tier: 'secondary',
            regions: ['Dakar', 'Thiès', 'Kaolack', 'Ziguinchor', 'Saint-Louis']
        },
        {
            code: 'UG',
            name: 'Uganda',
            currency: {
                code: 'UGX',
                symbol: 'USh',
                name: 'Ugandan Shilling'
            },
            phoneCode: '+256',
            timezone: 'EAT',
            locale: 'en-UG',
            flag: '🇺🇬',
            coordinates: {
                lat: 1.3733,
                lng: 32.2903
            },
            supported: true,
            tier: 'secondary',
            regions: ['Kampala', 'Gulu', 'Lira', 'Mbarara', 'Jinja']
        },
        {
            code: 'TZ',
            name: 'Tanzania',
            currency: {
                code: 'TZS',
                symbol: 'TSh',
                name: 'Tanzanian Shilling'
            },
            phoneCode: '+255',
            timezone: 'EAT',
            locale: 'sw-TZ',
            flag: '🇹🇿',
            coordinates: {
                lat: -6.3690,
                lng: 34.8888
            },
            supported: true,
            tier: 'secondary',
            regions: ['Dar es Salaam', 'Dodoma', 'Mwanza', 'Arusha', 'Mbeya']
        },
        {
            code: 'ET',
            name: 'Ethiopia',
            currency: {
                code: 'ETB',
                symbol: 'Br',
                name: 'Ethiopian Birr'
            },
            phoneCode: '+251',
            timezone: 'EAT',
            locale: 'am-ET',
            flag: '🇪🇹',
            coordinates: {
                lat: 9.1450,
                lng: 40.4897
            },
            supported: true,
            tier: 'secondary',
            regions: ['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Bahir Dar']
        },
        {
            code: 'RW',
            name: 'Rwanda',
            currency: {
                code: 'RWF',
                symbol: 'FRw',
                name: 'Rwandan Franc'
            },
            phoneCode: '+250',
            timezone: 'CAT',
            locale: 'rw-RW',
            flag: '🇷🇼',
            coordinates: {
                lat: -1.9403,
                lng: 29.8739
            },
            supported: true,
            tier: 'secondary',
            regions: ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri', 'Gisenyi']
        }
    ];
    
    CountriesData.countries = demoCountries;
    console.log('Countries: Loaded countries data:', CountriesData.countries.length);
}

// Initialize countries UI
function initCountriesUI() {
    // Initialize country selector
    initCountrySelector();
    
    // Initialize region selector
    initRegionSelector();
    
    // Initialize currency converter
    initCurrencyConverter();
    
    // Initialize phone number formatter
    initPhoneNumberFormatter();
    
    // Initialize map visualization
    initMapVisualization();
}

// Initialize country selector
function initCountrySelector() {
    const countrySelect = document.getElementById('countrySelect');
    if (!countrySelect) return;
    
    // Clear existing options
    countrySelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Country';
    countrySelect.appendChild(defaultOption);
    
    // Add countries
    CountriesData.countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = `${country.flag} ${country.name}`;
        option.setAttribute('data-phone-code', country.phoneCode);
        option.setAttribute('data-currency', country.currency.code);
        countrySelect.appendChild(option);
    });
    
    // Add event listener
    countrySelect.addEventListener('change', function() {
        const countryCode = this.value;
        if (countryCode) {
            const country = getCountryByCode(countryCode);
            if (country) {
                updateCountrySelection(country);
                updatePhoneCode(country.phoneCode);
                updateCurrencyDisplay(country.currency);
                loadCountryRegions(countryCode);
            }
        }
    });
    
    // Set initial value if user country detected
    if (CountriesData.currentCountry) {
        countrySelect.value = CountriesData.currentCountry.code;
        countrySelect.dispatchEvent(new Event('change'));
    }
}

// Initialize region selector
function initRegionSelector() {
    const regionSelect = document.getElementById('regionSelect');
    if (!regionSelect) return;
    
    regionSelect.addEventListener('change', function() {
        const region = this.value;
        if (region) {
            updateRegionSelection(region);
        }
    });
}

// Initialize currency converter
function initCurrencyConverter() {
    const convertBtn = document.getElementById('convertCurrency');
    const amountInput = document.getElementById('currencyAmount');
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    
    if (!convertBtn || !amountInput || !fromCurrency || !toCurrency) return;
    
    // Populate currency dropdowns
    populateCurrencyDropdowns();
    
    // Set default values
    if (CountriesData.currentCountry) {
        fromCurrency.value = CountriesData.currentCountry.currency.code;
    }
    
    // Add event listener
    convertBtn.addEventListener('click', function() {
        convertCurrency();
    });
    
    // Allow Enter key to trigger conversion
    amountInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertCurrency();
        }
    });
}

// Initialize phone number formatter
function initPhoneNumberFormatter() {
    const phoneInput = document.getElementById('phoneInput');
    const formatBtn = document.getElementById('formatPhone');
    
    if (!phoneInput || !formatBtn) return;
    
    formatBtn.addEventListener('click', function() {
        formatPhoneNumber();
    });
    
    // Auto-format on input
    phoneInput.addEventListener('input', function() {
        autoFormatPhoneNumber(this);
    });
}

// Initialize map visualization
function initMapVisualization() {
    const mapContainer = document.getElementById('countryMap');
    if (!mapContainer) return;
    
    // Check if we need to load a map library
    // For now, we'll create a simple SVG representation
    loadSimpleMap();
}

// Initialize countries event listeners
function initCountriesEvents() {
    // Country details buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.view-country-btn')) {
            const button = e.target.closest('.view-country-btn');
            const countryCode = button.getAttribute('data-country-code');
            viewCountryDetails(countryCode);
        }
        
        // Set as default country buttons
        if (e.target.closest('.set-default-country-btn')) {
            const button = e.target.closest('.set-default-country-btn');
            const countryCode = button.getAttribute('data-country-code');
            setDefaultCountry(countryCode);
        }
        
        // Region filter buttons
        if (e.target.closest('.region-filter-btn')) {
            const button = e.target.closest('.region-filter-btn');
            const region = button.getAttribute('data-region');
            filterByRegion(region);
        }
    });
}

// Detect user's country
function detectUserCountry() {
    // Try to get country from localStorage first
    const savedCountry = localStorage.getItem('pesewa_user_country');
    if (savedCountry) {
        try {
            CountriesData.currentCountry = JSON.parse(savedCountry);
            console.log('Countries: Loaded saved country:', CountriesData.currentCountry.name);
            return;
        } catch (error) {
            console.error('Countries: Error parsing saved country:', error);
        }
    }
    
    // Try to detect via IP (simulated for demo)
    simulateIPDetection()
        .then(countryCode => {
            const country = getCountryByCode(countryCode);
            if (country) {
                CountriesData.currentCountry = country;
                saveUserCountry(country);
                console.log('Countries: Detected country:', country.name);
            } else {
                // Default to Ghana
                CountriesData.currentCountry = getCountryByCode('GH');
                console.log('Countries: Defaulting to Ghana');
            }
            
            // Update UI if country selector exists
            const countrySelect = document.getElementById('countrySelect');
            if (countrySelect && CountriesData.currentCountry) {
                countrySelect.value = CountriesData.currentCountry.code;
                countrySelect.dispatchEvent(new Event('change'));
            }
        })
        .catch(error => {
            console.error('Countries: Error detecting country:', error);
            // Default to Ghana
            CountriesData.currentCountry = getCountryByCode('GH');
        });
}

// Simulate IP detection
function simulateIPDetection() {
    return new Promise((resolve) => {
        // In a real app, this would call an IP geolocation API
        // For demo, randomly pick a country or use Ghana
        setTimeout(() => {
            // 70% chance of Ghana, 30% chance of other supported countries
            if (Math.random() < 0.7) {
                resolve('GH');
            } else {
                const otherCountries = CountriesData.countries.filter(c => c.code !== 'GH');
                const randomCountry = otherCountries[Math.floor(Math.random() * otherCountries.length)];
                resolve(randomCountry.code);
            }
        }, 500);
    });
}

// Load regional data
function loadRegionalData() {
    // In a real app, this would fetch from API
    const demoRegions = {
        'GH': [
            {
                id: 'accra',
                name: 'Greater Accra',
                capital: 'Accra',
                population: '5.4M',
                area: '3,245 km²',
                districts: 29,
                coordinates: { lat: 5.6037, lng: -0.1870 }
            },
            {
                id: 'ashanti',
                name: 'Ashanti Region',
                capital: 'Kumasi',
                population: '5.0M',
                area: '24,389 km²',
                districts: 43,
                coordinates: { lat: 6.7470, lng: -1.5209 }
            },
            {
                id: 'western',
                name: 'Western Region',
                capital: 'Sekondi-Takoradi',
                population: '2.4M',
                area: '23,921 km²',
                districts: 22,
                coordinates: { lat: 5.1313, lng: -1.2795 }
            },
            {
                id: 'eastern',
                name: 'Eastern Region',
                capital: 'Koforidua',
                population: '2.9M',
                area: '19,323 km²',
                districts: 33,
                coordinates: { lat: 6.2374, lng: -0.4502 }
            },
            {
                id: 'central',
                name: 'Central Region',
                capital: 'Cape Coast',
                population: '2.2M',
                area: '9,826 km²',
                districts: 22,
                coordinates: { lat: 5.1313, lng: -1.2795 }
            }
        ]
    };
    
    CountriesData.regions = demoRegions;
    console.log('Countries: Loaded regional data');
}

// Populate currency dropdowns
function populateCurrencyDropdowns() {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    
    if (!fromCurrency || !toCurrency) return;
    
    // Clear existing options
    fromCurrency.innerHTML = '';
    toCurrency.innerHTML = '';
    
    // Get unique currencies
    const currencies = {};
    CountriesData.countries.forEach(country => {
        currencies[country.currency.code] = country.currency;
    });
    
    // Add currencies to dropdowns
    Object.values(currencies).forEach(currency => {
        const fromOption = document.createElement('option');
        fromOption.value = currency.code;
        fromOption.textContent = `${currency.code} - ${currency.name}`;
        fromCurrency.appendChild(fromOption);
        
        const toOption = document.createElement('option');
        toOption.value = currency.code;
        toOption.textContent = `${currency.code} - ${currency.name}`;
        toCurrency.appendChild(toOption);
    });
    
    // Set default to GHS for "to" currency
    toCurrency.value = 'GHS';
}

// Load country regions
function loadCountryRegions(countryCode) {
    const regionSelect = document.getElementById('regionSelect');
    if (!regionSelect) return;
    
    // Clear existing options
    regionSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Region';
    regionSelect.appendChild(defaultOption);
    
    // Get regions for country
    const country = getCountryByCode(countryCode);
    if (!country || !country.regions) return;
    
    // Add regions
    country.regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
    });
    
    // Enable the select
    regionSelect.disabled = false;
}

// Update country selection
function updateCountrySelection(country) {
    // Update country info display
    updateCountryInfo(country);
    
    // Update map
    updateMapForCountry(country);
    
    // Update statistics
    updateCountryStats(country);
}

// Update country info
function updateCountryInfo(country) {
    const countryInfo = document.getElementById('countryInfo');
    if (!countryInfo) return;
    
    countryInfo.innerHTML = `
        <div class="country-info-card">
            <div class="country-header">
                <div class="country-flag">${country.flag}</div>
                <div class="country-name">
                    <h3>${country.name}</h3>
                    <div class="country-code">${country.code}</div>
                </div>
            </div>
            
            <div class="country-details">
                <div class="detail-item">
                    <span class="detail-label">Currency:</span>
                    <span class="detail-value">
                        ${country.currency.symbol} ${country.currency.name} (${country.currency.code})
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone Code:</span>
                    <span class="detail-value">${country.phoneCode}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Timezone:</span>
                    <span class="detail-value">${country.timezone}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Locale:</span>
                    <span class="detail-value">${country.locale}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Supported:</span>
                    <span class="detail-value">
                        <span class="badge ${country.supported ? 'success' : 'warning'}">
                            ${country.supported ? 'Yes' : 'Coming Soon'}
                        </span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Tier:</span>
                    <span class="detail-value">
                        <span class="badge ${country.tier}">${country.tier.toUpperCase()}</span>
                    </span>
                </div>
            </div>
            
            <div class="country-actions">
                <button class="btn btn-primary set-default-country-btn" 
                        data-country-code="${country.code}">
                    Set as Default
                </button>
                <button class="btn btn-outline-secondary view-country-btn" 
                        data-country-code="${country.code}">
                    View Details
                </button>
            </div>
        </div>
    `;
}

// Update map for country
function updateMapForCountry(country) {
    const mapContainer = document.getElementById('countryMap');
    if (!mapContainer) return;
    
    // In a real app, this would update a map view
    // For demo, show a simple representation
    mapContainer.innerHTML = `
        <div class="simple-map">
            <div class="map-title">${country.name} Location</div>
            <div class="map-coordinates">
                Latitude: ${country.coordinates.lat.toFixed(4)}, 
                Longitude: ${country.coordinates.lng.toFixed(4)}
            </div>
            <div class="map-visual">
                <div class="map-point" style="
                    left: ${((country.coordinates.lng + 180) / 360 * 100)}%;
                    top: ${((90 - country.coordinates.lat) / 180 * 100)}%;
                ">
                    <div class="point-pulse"></div>
                    <div class="point-center">📍</div>
                </div>
            </div>
            <div class="map-legend">
                <span class="legend-item">📍 ${country.name}</span>
            </div>
        </div>
    `;
}

// Update country stats
function updateCountryStats(country) {
    const statsContainer = document.getElementById('countryStats');
    if (!statsContainer) return;
    
    // In a real app, this would fetch actual statistics
    // For demo, show placeholder stats
    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-value">--</div>
                <div class="stat-label">Pesewa Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-value">--</div>
                <div class="stat-label">Total Loans</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🏦</div>
                <div class="stat-value">--</div>
                <div class="stat-label">Active Lenders</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📈</div>
                <div class="stat-value">--</div>
                <div class="stat-label">Growth Rate</div>
            </div>
        </div>
        <div class="stats-note">
            <p>Statistics for ${country.name} will be displayed here as data becomes available.</p>
        </div>
    `;
}

// Update phone code
function updatePhoneCode(phoneCode) {
    const phoneCodeDisplay = document.getElementById('phoneCodeDisplay');
    if (phoneCodeDisplay) {
        phoneCodeDisplay.textContent = phoneCode;
    }
    
    // Update phone input placeholder
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
        phoneInput.placeholder = `e.g., ${phoneCode.replace('+', '')}501234567`;
    }
}

// Update currency display
function updateCurrencyDisplay(currency) {
    const currencyDisplay = document.getElementById('currencyDisplay');
    if (currencyDisplay) {
        currencyDisplay.innerHTML = `
            <span class="currency-symbol">${currency.symbol}</span>
            <span class="currency-code">${currency.code}</span>
            <span class="currency-name">${currency.name}</span>
        `;
    }
}

// Update region selection
function updateRegionSelection(region) {
    const regionInfo = document.getElementById('regionInfo');
    if (!regionInfo) return;
    
    // Find region details
    const country = CountriesData.currentCountry;
    if (!country) return;
    
    const regionData = CountriesData.regions[country.code]?.find(r => r.name === region);
    
    if (regionData) {
        regionInfo.innerHTML = `
            <div class="region-info-card">
                <h4>${regionData.name}</h4>
                <div class="region-details">
                    <div class="detail-item">
                        <span class="detail-label">Capital:</span>
                        <span class="detail-value">${regionData.capital}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Population:</span>
                        <span class="detail-value">${regionData.population}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Area:</span>
                        <span class="detail-value">${regionData.area}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Districts:</span>
                        <span class="detail-value">${regionData.districts}</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        regionInfo.innerHTML = `
            <div class="region-info-card">
                <p>Select a region to see details.</p>
            </div>
        `;
    }
}

// Convert currency
function convertCurrency() {
    const amountInput = document.getElementById('currencyAmount');
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    const resultDisplay = document.getElementById('conversionResult');
    
    if (!amountInput || !fromCurrency || !toCurrency || !resultDisplay) return;
    
    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;
    
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    if (from === to) {
        showToast('Please select different currencies', 'warning');
        return;
    }
    
    // Simulate API call for conversion rates
    simulateCurrencyConversion(amount, from, to)
        .then(result => {
            resultDisplay.innerHTML = `
                <div class="conversion-result">
                    <div class="conversion-from">
                        ${amount.toLocaleString()} ${from}
                    </div>
                    <div class="conversion-arrow">→</div>
                    <div class="conversion-to">
                        <strong>${result.convertedAmount.toLocaleString()} ${to}</strong>
                    </div>
                    <div class="conversion-rate">
                        Rate: 1 ${from} = ${result.rate.toFixed(4)} ${to}
                    </div>
                    <div class="conversion-date">
                        Last updated: ${formatDate(result.lastUpdated)}
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error('Countries: Error converting currency:', error);
            showToast('Error converting currency', 'error');
        });
}

// Simulate currency conversion
function simulateCurrencyConversion(amount, from, to) {
    return new Promise((resolve) => {
        // In a real app, this would call a currency conversion API
        // For demo, use fixed rates relative to GHS
        const rates = {
            'GHS': { 'USD': 0.083, 'EUR': 0.076, 'NGN': 125.5, 'KES': 13.2, 'XOF': 54.8 },
            'USD': { 'GHS': 12.05, 'EUR': 0.92, 'NGN': 1510, 'KES': 159 },
            'EUR': { 'GHS': 13.16, 'USD': 1.09, 'NGN': 1650, 'KES': 173 },
            'NGN': { 'GHS': 0.0080, 'USD': 0.00066, 'EUR': 0.00061 },
            'KES': { 'GHS': 0.076, 'USD': 0.0063, 'EUR': 0.0058 },
            'XOF': { 'GHS': 0.018, 'USD': 0.0015, 'EUR': 0.0014 }
        };
        
        setTimeout(() => {
            let rate = 1;
            
            if (from === to) {
                rate = 1;
            } else if (rates[from] && rates[from][to]) {
                rate = rates[from][to];
            } else if (rates[to] && rates[to][from]) {
                rate = 1 / rates[to][from];
            } else {
                // Default fallback rate
                rate = 0.5 + Math.random();
            }
            
            const convertedAmount = amount * rate;
            
            resolve({
                from: from,
                to: to,
                amount: amount,
                convertedAmount: convertedAmount,
                rate: rate,
                lastUpdated: new Date().toISOString()
            });
        }, 800);
    });
}

// Format phone number
function formatPhoneNumber() {
    const phoneInput = document.getElementById('phoneInput');
    const countrySelect = document.getElementById('countrySelect');
    const formattedDisplay = document.getElementById('formattedPhone');
    
    if (!phoneInput || !countrySelect || !formattedDisplay) return;
    
    const phoneNumber = phoneInput.value.trim();
    const countryCode = countrySelect.value;
    
    if (!phoneNumber) {
        showToast('Please enter a phone number', 'error');
        return;
    }
    
    if (!countryCode) {
        showToast('Please select a country', 'error');
        return;
    }
    
    const country = getCountryByCode(countryCode);
    if (!country) return;
    
    // Format phone number
    const formatted = formatPhoneNumberForCountry(phoneNumber, country);
    
    // Display formatted number
    formattedDisplay.innerHTML = `
        <div class="formatted-phone-result">
            <div class="original-number">
                <span class="label">Original:</span>
                <span class="value">${phoneNumber}</span>
            </div>
            <div class="formatted-number">
                <span class="label">Formatted:</span>
                <span class="value">${formatted.formatted}</span>
            </div>
            <div class="phone-validation ${formatted.valid ? 'valid' : 'invalid'}">
                <span class="label">Validation:</span>
                <span class="value">
                    ${formatted.valid ? '✓ Valid' : '✗ Invalid'}
                    ${formatted.validationMessage ? ` - ${formatted.validationMessage}` : ''}
                </span>
            </div>
            <div class="phone-format">
                <span class="label">Format:</span>
                <span class="value">${formatted.format || 'Unknown'}</span>
            </div>
        </div>
    `;
}

// Auto-format phone number
function autoFormatPhoneNumber(input) {
    const countrySelect = document.getElementById('countrySelect');
    if (!countrySelect || !countrySelect.value) return;
    
    const country = getCountryByCode(countrySelect.value);
    if (!country) return;
    
    // Remove all non-digits
    let value = input.value.replace(/\D/g, '');
    
    // Remove country code if it starts with it
    const countryCode = country.phoneCode.replace('+', '');
    if (value.startsWith(countryCode)) {
        value = value.substring(countryCode.length);
    }
    
    // Format based on country
    let formatted = value;
    
    switch(country.code) {
        case 'GH': // Ghana: 024 123 4567 or 054 123 4567
            if (value.length <= 3) {
                formatted = value;
            } else if (value.length <= 6) {
                formatted = `${value.substring(0, 3)} ${value.substring(3)}`;
            } else {
                formatted = `${value.substring(0, 3)} ${value.substring(3, 6)} ${value.substring(6, 10)}`;
            }
            break;
        case 'NG': // Nigeria: 0801 234 5678
            if (value.length <= 4) {
                formatted = value;
            } else if (value.length <= 7) {
                formatted = `${value.substring(0, 4)} ${value.substring(4)}`;
            } else {
                formatted = `${value.substring(0, 4)} ${value.substring(4, 7)} ${value.substring(7, 11)}`;
            }
            break;
        default:
            // Default formatting
            if (value.length <= 4) {
                formatted = value;
            } else if (value.length <= 7) {
                formatted = `${value.substring(0, 4)} ${value.substring(4)}`;
            } else {
                formatted = `${value.substring(0, 4)} ${value.substring(4, 7)} ${value.substring(7, 11)}`;
            }
    }
    
    input.value = formatted;
}

// Format phone number for country
function formatPhoneNumberForCountry(phoneNumber, country) {
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Remove country code if present
    const countryCode = country.phoneCode.replace('+', '');
    let localNumber = digits;
    if (digits.startsWith(countryCode)) {
        localNumber = digits.substring(countryCode.length);
    }
    
    // Validate based on country
    let valid = false;
    let validationMessage = '';
    let format = '';
    
    switch(country.code) {
        case 'GH': // Ghana: 10 digits after country code
            if (localNumber.length === 9 && /^[0-9]{9}$/.test(localNumber)) {
                valid = true;
                format = `+${countryCode} ${localNumber.substring(0, 3)} ${localNumber.substring(3, 6)} ${localNumber.substring(6)}`;
            } else {
                validationMessage = 'Ghana numbers should be 9 digits (e.g., 501234567)';
            }
            break;
        case 'NG': // Nigeria: 10 digits after country code
            if (localNumber.length === 10 && /^[0-9]{10}$/.test(localNumber)) {
                valid = true;
                format = `+${countryCode} ${localNumber.substring(0, 4)} ${localNumber.substring(4, 7)} ${localNumber.substring(7)}`;
            } else {
                validationMessage = 'Nigeria numbers should be 10 digits (e.g., 8012345678)';
            }
            break;
        default:
            // Basic validation for other countries
            if (localNumber.length >= 7 && localNumber.length <= 15) {
                valid = true;
                format = `+${countryCode} ${localNumber}`;
            } else {
                validationMessage = `Number should be 7-15 digits after country code`;
            }
    }
    
    return {
        original: phoneNumber,
        formatted: format || `+${countryCode} ${localNumber}`,
        valid: valid,
        validationMessage: validationMessage,
        format: format
    };
}

// Load simple map
function loadSimpleMap() {
    const mapContainer = document.getElementById('countryMap');
    if (!mapContainer) return;
    
    mapContainer.innerHTML = `
        <div class="simple-map">
            <div class="map-title">Africa - Pesewa Coverage</div>
            <div class="map-visual">
                <!-- Simplified Africa map with country markers -->
                <div class="africa-outline">
                    ${CountriesData.countries.map(country => `
                        <div class="country-marker ${country.tier}" 
                             style="left: ${((country.coordinates.lng + 180) / 360 * 100)}%;
                                    top: ${((90 - country.coordinates.lat) / 180 * 100)}%;"
                             title="${country.name}">
                            <div class="marker-dot"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="map-legend">
                <div class="legend-item">
                    <span class="legend-color primary"></span>
                    <span class="legend-label">Primary Country (Ghana)</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color secondary"></span>
                    <span class="legend-label">Supported Countries</span>
                </div>
            </div>
        </div>
    `;
}

// View country details
function viewCountryDetails(countryCode) {
    const country = getCountryByCode(countryCode);
    if (!country) {
        showToast('Country not found', 'error');
        return;
    }
    
    // Get country statistics (simulated)
    const stats = getCountryStatistics(countryCode);
    
    const modalContent = `
        <div class="country-details-modal">
            <div class="country-header">
                <div class="country-flag-large">${country.flag}</div>
                <div class="country-title">
                    <h2>${country.name}</h2>
                    <div class="country-subtitle">
                        <span class="country-code">${country.code}</span>
                        <span class="country-tier ${country.tier}">${country.tier.toUpperCase()}</span>
                    </div>
                </div>
            </div>
            
            <div class="country-content">
                <div class="info-section">
                    <h4>Basic Information</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Capital:</span>
                            <span class="info-value">${getCountryCapital(countryCode)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Population:</span>
                            <span class="info-value">${stats.population}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Area:</span>
                            <span class="info-value">${stats.area}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Language:</span>
                            <span class="info-value">${getCountryLanguage(countryCode)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Timezone:</span>
                            <span class="info-value">${country.timezone}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Currency:</span>
                            <span class="info-value">
                                ${country.currency.symbol} ${country.currency.name} (${country.currency.code})
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Phone Code:</span>
                            <span class="info-value">${country.phoneCode}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Locale:</span>
                            <span class="info-value">${country.locale}</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Pesewa Statistics in ${country.name}</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${stats.userCount.toLocaleString()}</div>
                            <div class="stat-label">Total Users</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${stats.loanCount.toLocaleString()}</div>
                            <div class="stat-label">Loans Processed</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">₵${stats.totalVolume.toLocaleString()}</div>
                            <div class="stat-label">Total Volume</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${stats.growthRate}%</div>
                            <div class="stat-label">Monthly Growth</div>
                        </div>
                    </div>
                </div>
                
                ${country.regions && country.regions.length > 0 ? `
                    <div class="info-section">
                        <h4>Regions of ${country.name}</h4>
                        <div class="regions-list">
                            ${country.regions.map(region => `
                                <span class="region-tag">${region}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="info-section">
                    <h4>Pesewa Services</h4>
                    <div class="services-list">
                        <div class="service-item ${country.supported ? 'available' : 'coming-soon'}">
                            <div class="service-icon">💰</div>
                            <div class="service-info">
                                <div class="service-name">Peer-to-Peer Lending</div>
                                <div class="service-status">
                                    ${country.supported ? 'Available' : 'Coming Soon'}
                                </div>
                            </div>
                        </div>
                        <div class="service-item ${country.tier === 'primary' ? 'available' : 'coming-soon'}">
                            <div class="service-icon">👥</div>
                            <div class="service-info">
                                <div class="service-name">Group Lending</div>
                                <div class="service-status">
                                    ${country.tier === 'primary' ? 'Available' : 'Coming Soon'}
                                </div>
                            </div>
                        </div>
                        <div class="service-item ${country.tier === 'primary' ? 'available' : 'coming-soon'}">
                            <div class="service-icon">🏦</div>
                            <div class="service-info">
                                <div class="service-name">Bank Integration</div>
                                <div class="service-status">
                                    ${country.tier === 'primary' ? 'Available' : 'Coming Soon'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="setDefaultCountry('${country.code}')">
                    Set as Default Country
                </button>
                <button class="btn btn-outline-secondary" onclick="closeModal()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    showModal(`${country.name} Details`, modalContent);
}

// Set default country
function setDefaultCountry(countryCode) {
    const country = getCountryByCode(countryCode);
    if (!country) {
        showToast('Country not found', 'error');
        return;
    }
    
    CountriesData.currentCountry = country;
    saveUserCountry(country);
    
    // Update UI
    const countrySelect = document.getElementById('countrySelect');
    if (countrySelect) {
        countrySelect.value = countryCode;
        countrySelect.dispatchEvent(new Event('change'));
    }
    
    showToast(`${country.name} set as default country`, 'success');
}

// Filter by region
function filterByRegion(region) {
    // This would filter country data by region
    // For now, just show a message
    showToast(`Filtering by region: ${region}`, 'info');
}

// Get country by code
function getCountryByCode(code) {
    return CountriesData.countries.find(country => country.code === code);
}

// Get country statistics (simulated)
function getCountryStatistics(countryCode) {
    // In a real app, this would fetch from API
    const stats = {
        population: '--',
        area: '--',
        userCount: Math.floor(Math.random() * 100000) + 50000,
        loanCount: Math.floor(Math.random() * 50000) + 10000,
        totalVolume: Math.floor(Math.random() * 10000000) + 5000000,
        growthRate: (Math.random() * 10 + 5).toFixed(1)
    };
    
    // Add some country-specific data
    switch(countryCode) {
        case 'GH':
            stats.population = '32.8M';
            stats.area = '238,535 km²';
            stats.userCount = 125000;
            stats.loanCount = 45000;
            stats.totalVolume = 12500000;
            stats.growthRate = '15.2';
            break;
        case 'NG':
            stats.population = '213.4M';
            stats.area = '923,768 km²';
            break;
        case 'KE':
            stats.population = '53.0M';
            stats.area = '580,367 km²';
            break;
    }
    
    return stats;
}

// Get country capital (simulated)
function getCountryCapital(countryCode) {
    const capitals = {
        'GH': 'Accra',
        'NG': 'Abuja',
        'KE': 'Nairobi',
        'ZA': 'Pretoria',
        'CI': 'Yamoussoukro',
        'SN': 'Dakar',
        'UG': 'Kampala',
        'TZ': 'Dodoma',
        'ET': 'Addis Ababa',
        'RW': 'Kigali'
    };
    
    return capitals[countryCode] || '--';
}

// Get country language (simulated)
function getCountryLanguage(countryCode) {
    const languages = {
        'GH': 'English',
        'NG': 'English',
        'KE': 'English, Swahili',
        'ZA': 'English, Afrikaans',
        'CI': 'French',
        'SN': 'French',
        'UG': 'English, Swahili',
        'TZ': 'Swahili, English',
        'ET': 'Amharic',
        'RW': 'Kinyarwanda, French, English'
    };
    
    return languages[countryCode] || '--';
}

// Save user country
function saveUserCountry(country) {
    try {
        localStorage.setItem('pesewa_user_country', JSON.stringify(country));
        console.log('Countries: Saved user country:', country.name);
    } catch (error) {
        console.error('Countries: Error saving user country:', error);
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show modal
function showModal(title, content) {
    let modal = document.getElementById('dynamicModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dynamicModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-modal" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('dynamicModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    if (window.PesewaAuth && window.PesewaAuth.showToast) {
        window.PesewaAuth.showToast(message, type);
    } else if (window.PesewaApp && window.PesewaApp.showToast) {
        window.PesewaApp.showToast(message, type);
    } else {
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// Initialize countries module when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initCountries();
});

// Export for use in other modules
window.PesewaCountries = {
    initCountries,
    getCountryByCode,
    setDefaultCountry,
    formatPhoneNumberForCountry,
    convertCurrency,
    viewCountryDetails,
    detectUserCountry
};