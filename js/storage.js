/**
 * ChronoX - Local Storage Manager
 * Handles all localStorage operations with error handling and serialization
 * @version 1.0.0
 */

class StorageManager {
    constructor() {
        this.prefix = 'chronox_';
        this.isAvailable = this.checkAvailability();
    }

    /**
     * Check if localStorage is available
     * @returns {boolean}
     */
    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage is not available:', e);
            return false;
        }
    }

    /**
     * Get item from storage
     * @param {string} key
     * @param {*} defaultValue
     * @returns {*}
     */
    get(key, defaultValue = null) {
        if (!this.isAvailable) return defaultValue;
        
        try {
            const item = localStorage.getItem(this.prefix + key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (e) {
            console.error(`Error getting ${key} from storage:`, e);
            return defaultValue;
        }
    }

    /**
     * Set item in storage
     * @param {string} key
     * @param {*} value
     * @returns {boolean}
     */
    set(key, value) {
        if (!this.isAvailable) return false;
        
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serialized);
            return true;
        } catch (e) {
            console.error(`Error setting ${key} in storage:`, e);
            return false;
        }
    }

    /**
     * Remove item from storage
     * @param {string} key
     * @returns {boolean}
     */
    remove(key) {
        if (!this.isAvailable) return false;
        
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (e) {
            console.error(`Error removing ${key} from storage:`, e);
            return false;
        }
    }

    /**
     * Check if key exists
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        if (!this.isAvailable) return false;
        return localStorage.getItem(this.prefix + key) !== null;
    }

    /**
     * Get all keys with prefix
     * @returns {string[]}
     */
    keys() {
        if (!this.isAvailable) return [];
        
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        }
        return keys;
    }

    /**
     * Clear all items with prefix
     * @returns {boolean}
     */
    clear() {
        if (!this.isAvailable) return false;
        
        try {
            const keys = this.keys();
            keys.forEach(key => this.remove(key));
            return true;
        } catch (e) {
            console.error('Error clearing storage:', e);
            return false;
        }
    }

    /**
     * Get storage size in bytes
     * @returns {number}
     */
    getSize() {
        if (!this.isAvailable) return 0;
        
        let size = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                size += key.length + localStorage.getItem(key).length;
            }
        }
        return size * 2; // UTF-16 characters = 2 bytes each
    }

    /**
     * Get remaining storage space
     * @returns {number}
     */
    getRemainingSpace() {
        const maxSize = 5 * 1024 * 1024; // 5MB typical limit
        return maxSize - this.getSize();
    }

    /**
     * Set multiple items at once
     * @param {Object} items
     * @returns {boolean}
     */
    setMultiple(items) {
        if (!this.isAvailable) return false;
        
        try {
            for (const [key, value] of Object.entries(items)) {
                this.set(key, value);
            }
            return true;
        } catch (e) {
            console.error('Error setting multiple items:', e);
            return false;
        }
    }

    /**
     * Get multiple items at once
     * @param {string[]} keys
     * @returns {Object}
     */
    getMultiple(keys) {
        const result = {};
        keys.forEach(key => {
            result[key] = this.get(key);
        });
        return result;
    }
}

// Create global storage instance
const storage = new StorageManager();
