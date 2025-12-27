// Storage Utilities for Marmaid.com PWA
class StorageUtil {
    constructor() {
        this.prefix = 'marmaid_';
        this.init();
    }
    
    init() {
        // Check storage availability
        this.isLocalStorageAvailable = this.testLocalStorage();
        this.isSessionStorageAvailable = this.testSessionStorage();
        this.isIndexedDBAvailable = this.testIndexedDB();
        
        // Initialize IndexedDB if available
        if (this.isIndexedDBAvailable) {
            this.initIndexedDB();
        }
    }
    
    // ========== Local Storage ==========
    
    testLocalStorage() {
        try {
            const testKey = this.prefix + 'test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('LocalStorage not available:', error);
            return false;
        }
    }
    
    setLocal(key, value, options = {}) {
        if (!this.isLocalStorageAvailable) {
            this.fallbackSet(key, value, options);
            return;
        }
        
        try {
            const storageKey = this.prefix + key;
            const data = {
                value,
                timestamp: Date.now(),
                expires: options.expires ? Date.now() + options.expires : null,
                version: options.version || '1.0'
            };
            
            localStorage.setItem(storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error setting LocalStorage:', error);
            this.fallbackSet(key, value, options);
        }
    }
    
    getLocal(key, defaultValue = null) {
        if (!this.isLocalStorageAvailable) {
            return this.fallbackGet(key, defaultValue);
        }
        
        try {
            const storageKey = this.prefix + key;
            const item = localStorage.getItem(storageKey);
            
            if (!item) return defaultValue;
            
            const data = JSON.parse(item);
            
            // Check if expired
            if (data.expires && Date.now() > data.expires) {
                this.removeLocal(key);
                return defaultValue;
            }
            
            return data.value;
        } catch (error) {
            console.error('Error getting LocalStorage:', error);
            return this.fallbackGet(key, defaultValue);
        }
    }
    
    removeLocal(key) {
        if (!this.isLocalStorageAvailable) {
            this.fallbackRemove(key);
            return;
        }
        
        try {
            const storageKey = this.prefix + key;
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.error('Error removing LocalStorage:', error);
            this.fallbackRemove(key);
        }
    }
    
    clearLocal(prefix = '') {
        if (!this.isLocalStorageAvailable) return;
        
        try {
            const keysToRemove = [];
            const fullPrefix = this.prefix + prefix;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(fullPrefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('Error clearing LocalStorage:', error);
        }
    }
    
    // ========== Session Storage ==========
    
    testSessionStorage() {
        try {
            const testKey = this.prefix + 'test';
            sessionStorage.setItem(testKey, 'test');
            sessionStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('SessionStorage not available:', error);
            return false;
        }
    }
    
    setSession(key, value, options = {}) {
        if (!this.isSessionStorageAvailable) {
            this.fallbackSet(key, value, options);
            return;
        }
        
        try {
            const storageKey = this.prefix + key;
            const data = {
                value,
                timestamp: Date.now(),
                expires: options.expires ? Date.now() + options.expires : null,
                version: options.version || '1.0'
            };
            
            sessionStorage.setItem(storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error setting SessionStorage:', error);
            this.fallbackSet(key, value, options);
        }
    }
    
    getSession(key, defaultValue = null) {
        if (!this.isSessionStorageAvailable) {
            return this.fallbackGet(key, defaultValue);
        }
        
        try {
            const storageKey = this.prefix + key;
            const item = sessionStorage.getItem(storageKey);
            
            if (!item) return defaultValue;
            
            const data = JSON.parse(item);
            
            // Check if expired
            if (data.expires && Date.now() > data.expires) {
                this.removeSession(key);
                return defaultValue;
            }
            
            return data.value;
        } catch (error) {
            console.error('Error getting SessionStorage:', error);
            return this.fallbackGet(key, defaultValue);
        }
    }
    
    removeSession(key) {
        if (!this.isSessionStorageAvailable) {
            this.fallbackRemove(key);
            return;
        }
        
        try {
            const storageKey = this.prefix + key;
            sessionStorage.removeItem(storageKey);
        } catch (error) {
            console.error('Error removing SessionStorage:', error);
            this.fallbackRemove(key);
        }
    }
    
    clearSession(prefix = '') {
        if (!this.isSessionStorageAvailable) return;
        
        try {
            const keysToRemove = [];
            const fullPrefix = this.prefix + prefix;
            
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key.startsWith(fullPrefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => sessionStorage.removeItem(key));
        } catch (error) {
            console.error('Error clearing SessionStorage:', error);
        }
    }
    
    // ========== IndexedDB ==========
    
    testIndexedDB() {
        return 'indexedDB' in window || 'mozIndexedDB' in window || 'webkitIndexedDB' in window || 'msIndexedDB' in window;
    }
    
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MarmaidDB', 1);
            
            request.onerror = (event) => {
                console.error('IndexedDB initialization failed:', event.target.error);
                reject(event.target.error);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('locations')) {
                    db.createObjectStore('locations', { keyPath: 'id', autoIncrement: true });
                }
                
                if (!db.objectStoreNames.contains('escorts')) {
                    db.createObjectStore('escorts', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('subscriptions')) {
                    db.createObjectStore('subscriptions', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('messages')) {
                    db.createObjectStore('messages', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('cache')) {
                    db.createObjectStore('cache', { keyPath: 'key' });
                }
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };
        });
    }
    
    async getDB() {
        if (!this.db) {
            await this.initIndexedDB();
        }
        return this.db;
    }
    
    async setIndexedDB(storeName, key, value) {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                
                const item = {
                    ...value,
                    key,
                    timestamp: Date.now()
                };
                
                const request = store.put(item);
                
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject(event.target.error);
            });
        } catch (error) {
            console.error('Error setting IndexedDB:', error);
            throw error;
        }
    }
    
    async getIndexedDB(storeName, key) {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                
                const request = store.get(key);
                
                request.onsuccess = (event) => {
                    const result = event.target.result;
                    resolve(result ? result.value : null);
                };
                
                request.onerror = (event) => reject(event.target.error);
            });
        } catch (error) {
            console.error('Error getting IndexedDB:', error);
            throw error;
        }
    }
    
    async removeIndexedDB(storeName, key) {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                
                const request = store.delete(key);
                
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject(event.target.error);
            });
        } catch (error) {
            console.error('Error removing IndexedDB:', error);
            throw error;
        }
    }
    
    async clearIndexedDB(storeName) {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                
                const request = store.clear();
                
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject(event.target.error);
            });
        } catch (error) {
            console.error('Error clearing IndexedDB:', error);
            throw error;
        }
    }
    
    // ========== Cache Storage ==========
    
    async setCache(key, value, options = {}) {
        const cacheKey = this.prefix + key;
        const data = {
            value,
            timestamp: Date.now(),
            expires: options.expires ? Date.now() + options.expires : null,
            version: options.version || '1.0'
        };
        
        // Try IndexedDB first
        if (this.isIndexedDBAvailable) {
            try {
                await this.setIndexedDB('cache', cacheKey, data);
                return;
            } catch (error) {
                console.warn('Failed to cache in IndexedDB, falling back:', error);
            }
        }
        
        // Fallback to localStorage
        this.setLocal(key, value, options);
    }
    
    async getCache(key, defaultValue = null) {
        const cacheKey = this.prefix + key;
        
        // Try IndexedDB first
        if (this.isIndexedDBAvailable) {
            try {
                const data = await this.getIndexedDB('cache', cacheKey);
                if (data) {
                    // Check if expired
                    if (data.expires && Date.now() > data.expires) {
                        await this.removeCache(key);
                        return defaultValue;
                    }
                    return data.value;
                }
            } catch (error) {
                console.warn('Failed to get from IndexedDB cache:', error);
            }
        }
        
        // Fallback to localStorage
        return this.getLocal(key, defaultValue);
    }
    
    async removeCache(key) {
        const cacheKey = this.prefix + key;
        
        // Try IndexedDB first
        if (this.isIndexedDBAvailable) {
            try {
                await this.removeIndexedDB('cache', cacheKey);
            } catch (error) {
                console.warn('Failed to remove from IndexedDB cache:', error);
            }
        }
        
        // Also remove from localStorage
        this.removeLocal(key);
    }
    
    async clearCache(prefix = '') {
        const fullPrefix = this.prefix + prefix;
        
        // Clear from IndexedDB
        if (this.isIndexedDBAvailable) {
            try {
                const db = await this.getDB();
                const transaction = db.transaction('cache', 'readwrite');
                const store = transaction.objectStore('cache');
                const request = store.openCursor();
                
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        if (cursor.key.startsWith(fullPrefix)) {
                            cursor.delete();
                        }
                        cursor.continue();
                    }
                };
            } catch (error) {
                console.warn('Failed to clear IndexedDB cache:', error);
            }
        }
        
        // Clear from localStorage
        this.clearLocal(prefix);
    }
    
    // ========== Application Data ==========
    
    // User preferences
    setUserPreferences(preferences) {
        this.setLocal('user_preferences', preferences, { expires: 30 * 24 * 60 * 60 * 1000 }); // 30 days
    }
    
    getUserPreferences() {
        return this.getLocal('user_preferences', {});
    }
    
    // Location data
    setLocationData(location) {
        this.setLocal('user_location', location, { expires: 7 * 24 * 60 * 60 * 1000 }); // 7 days
    }
    
    getLocationData() {
        return this.getLocal('user_location');
    }
    
    // Escort filters
    setEscortFilters(filters) {
        this.setLocal('escort_filters', filters, { expires: 24 * 60 * 60 * 1000 }); // 24 hours
    }
    
    getEscortFilters() {
        return this.getLocal('escort_filters', {});
    }
    
    // Subscription data
    setSubscriptionData(data) {
        this.setLocal('subscription_data', data, { expires: 7 * 24 * 60 * 60 * 1000 }); // 7 days
    }
    
    getSubscriptionData() {
        return this.getLocal('subscription_data');
    }
    
    // Offline data
    async saveOfflineData(type, data) {
        const timestamp = Date.now();
        const offlineData = {
            type,
            data,
            timestamp,
            synced: false
        };
        
        if (this.isIndexedDBAvailable) {
            await this.setIndexedDB('offline_data', `${type}_${timestamp}`, offlineData);
        } else {
            const offlineItems = this.getLocal('offline_data', []);
            offlineItems.push(offlineData);
            this.setLocal('offline_data', offlineItems);
        }
    }
    
    async getOfflineData() {
        if (this.isIndexedDBAvailable) {
            // Would need to implement cursor to get all offline data
            return [];
        } else {
            return this.getLocal('offline_data', []);
        }
    }
    
    // ========== Fallback Methods ==========
    
    fallbackSet(key, value, options = {}) {
        // In-memory fallback
        if (!this.memoryStore) {
            this.memoryStore = new Map();
        }
        
        const data = {
            value,
            timestamp: Date.now(),
            expires: options.expires ? Date.now() + options.expires : null
        };
        
        this.memoryStore.set(key, data);
        
        // Clean up expired items
        this.cleanupMemoryStore();
    }
    
    fallbackGet(key, defaultValue = null) {
        if (!this.memoryStore) return defaultValue;
        
        const data = this.memoryStore.get(key);
        if (!data) return defaultValue;
        
        // Check if expired
        if (data.expires && Date.now() > data.expires) {
            this.memoryStore.delete(key);
            return defaultValue;
        }
        
        return data.value;
    }
    
    fallbackRemove(key) {
        if (this.memoryStore) {
            this.memoryStore.delete(key);
        }
    }
    
    cleanupMemoryStore() {
        if (!this.memoryStore) return;
        
        const now = Date.now();
        for (const [key, data] of this.memoryStore.entries()) {
            if (data.expires && now > data.expires) {
                this.memoryStore.delete(key);
            }
        }
    }
    
    // ========== Utility Methods ==========
    
    getStorageInfo() {
        let localStorageSize = 0;
        let sessionStorageSize = 0;
        
        if (this.isLocalStorageAvailable) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    localStorageSize += (localStorage.getItem(key) || '').length;
                }
            }
        }
        
        if (this.isSessionStorageAvailable) {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    sessionStorageSize += (sessionStorage.getItem(key) || '').length;
                }
            }
        }
        
        return {
            localStorage: {
                available: this.isLocalStorageAvailable,
                size: localStorageSize,
                formattedSize: this.formatBytes(localStorageSize)
            },
            sessionStorage: {
                available: this.isSessionStorageAvailable,
                size: sessionStorageSize,
                formattedSize: this.formatBytes(sessionStorageSize)
            },
            indexedDB: {
                available: this.isIndexedDBAvailable
            }
        };
    }
    
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Clear all Marmaid data
    clearAll() {
        // Clear localStorage
        this.clearLocal();
        
        // Clear sessionStorage
        this.clearSession();
        
        // Clear IndexedDB
        if (this.isIndexedDBAvailable) {
            this.clearIndexedDB('locations');
            this.clearIndexedDB('escorts');
            this.clearIndexedDB('subscriptions');
            this.clearIndexedDB('messages');
            this.clearIndexedDB('cache');
        }
        
        // Clear memory store
        if (this.memoryStore) {
            this.memoryStore.clear();
        }
        
        console.log('All Marmaid storage cleared');
    }
    
    // Export data for backup
    exportData() {
        const data = {};
        
        // Export localStorage
        if (this.isLocalStorageAvailable) {
            data.localStorage = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    try {
                        data.localStorage[key] = JSON.parse(localStorage.getItem(key));
                    } catch (error) {
                        data.localStorage[key] = localStorage.getItem(key);
                    }
                }
            }
        }
        
        // Export sessionStorage
        if (this.isSessionStorageAvailable) {
            data.sessionStorage = {};
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    try {
                        data.sessionStorage[key] = JSON.parse(sessionStorage.getItem(key));
                    } catch (error) {
                        data.sessionStorage[key] = sessionStorage.getItem(key);
                    }
                }
            }
        }
        
        return {
            timestamp: Date.now(),
            version: '1.0',
            data
        };
    }
    
    // Import data from backup
    importData(backupData) {
        if (!backupData || !backupData.data) {
            throw new Error('Invalid backup data');
        }
        
        // Import localStorage
        if (backupData.data.localStorage && this.isLocalStorageAvailable) {
            Object.entries(backupData.data.localStorage).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    localStorage.setItem(key, value);
                } else {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            });
        }
        
        // Import sessionStorage
        if (backupData.data.sessionStorage && this.isSessionStorageAvailable) {
            Object.entries(backupData.data.sessionStorage).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    sessionStorage.setItem(key, value);
                } else {
                    sessionStorage.setItem(key, JSON.stringify(value));
                }
            });
        }
        
        console.log('Data imported successfully');
    }
}

// Create and export singleton instance
window.storageUtil = new StorageUtil();
export default window.storageUtil;