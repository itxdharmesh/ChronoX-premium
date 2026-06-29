/**
 * ChronoX - IndexedDB Database Manager
 * Handles all database operations for offline data persistence
 * @version 1.0.0
 */

class DatabaseManager {
    constructor() {
        this.dbName = 'ChronoXDB';
        this.dbVersion = 1;
        this.db = null;
        this.stores = {
            users: 'users',
            posts: 'posts',
            comments: 'comments',
            messages: 'messages',
            notifications: 'notifications',
            friends: 'friends',
            communities: 'communities',
            achievements: 'achievements',
            settings: 'settings',
            drafts: 'drafts'
        };
    }

    /**
     * Initialize database connection
     * @returns {Promise}
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this.createStores(db);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Database initialized successfully');
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('Database initialization failed:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Create object stores
     * @param {IDBDatabase} db
     */
    createStores(db) {
        // Users store
        if (!db.objectStoreNames.contains(this.stores.users)) {
            const userStore = db.createObjectStore(this.stores.users, { keyPath: 'id' });
            userStore.createIndex('username', 'username', { unique: true });
            userStore.createIndex('email', 'email', { unique: true });
        }

        // Posts store
        if (!db.objectStoreNames.contains(this.stores.posts)) {
            const postStore = db.createObjectStore(this.stores.posts, { keyPath: 'id' });
            postStore.createIndex('userId', 'userId', { unique: false });
            postStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Comments store
        if (!db.objectStoreNames.contains(this.stores.comments)) {
            const commentStore = db.createObjectStore(this.stores.comments, { keyPath: 'id' });
            commentStore.createIndex('postId', 'postId', { unique: false });
        }

        // Messages store
        if (!db.objectStoreNames.contains(this.stores.messages)) {
            const messageStore = db.createObjectStore(this.stores.messages, { keyPath: 'id' });
            messageStore.createIndex('conversationId', 'conversationId', { unique: false });
            messageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Notifications store
        if (!db.objectStoreNames.contains(this.stores.notifications)) {
            const notifStore = db.createObjectStore(this.stores.notifications, { keyPath: 'id' });
            notifStore.createIndex('userId', 'userId', { unique: false });
            notifStore.createIndex('read', 'read', { unique: false });
        }

        // Friends store
        if (!db.objectStoreNames.contains(this.stores.friends)) {
            const friendStore = db.createObjectStore(this.stores.friends, { keyPath: 'id' });
            friendStore.createIndex('userId', 'userId', { unique: false });
            friendStore.createIndex('status', 'status', { unique: false });
        }

        // Communities store
        if (!db.objectStoreNames.contains(this.stores.communities)) {
            const communityStore = db.createObjectStore(this.stores.communities, { keyPath: 'id' });
            communityStore.createIndex('name', 'name', { unique: true });
        }

        // Achievements store
        if (!db.objectStoreNames.contains(this.stores.achievements)) {
            const achieveStore = db.createObjectStore(this.stores.achievements, { keyPath: 'id' });
            achieveStore.createIndex('userId', 'userId', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains(this.stores.settings)) {
            db.createObjectStore(this.stores.settings, { keyPath: 'key' });
        }

        // Drafts store
        if (!db.objectStoreNames.contains(this.stores.drafts)) {
            const draftStore = db.createObjectStore(this.stores.drafts, { keyPath: 'id' });
            draftStore.createIndex('type', 'type', { unique: false });
        }
    }

    /**
     * Add item to store
     * @param {string} storeName
     * @param {Object} data
     * @returns {Promise}
     */
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            
            if (!data.id) {
                data.id = generateUniqueId();
            }
            if (!data.createdAt) {
                data.createdAt = new Date().toISOString();
            }
            
            const request = store.add(data);
            
            request.onsuccess = () => resolve(data);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get item by ID
     * @param {string} storeName
     * @param {string} id
     * @returns {Promise}
     */
    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all items from store
     * @param {string} storeName
     * @returns {Promise}
     */
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update item in store
     * @param {string} storeName
     * @param {Object} data
     * @returns {Promise}
     */
    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            data.updatedAt = new Date().toISOString();
            
            const request = store.put(data);
            
            request.onsuccess = () => resolve(data);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete item from store
     * @param {string} storeName
     * @param {string} id
     * @returns {Promise}
     */
    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Query items by index
     * @param {string} storeName
     * @param {string} indexName
     * @param {*} value
     * @returns {Promise}
     */
    async query(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all data from store
     * @param {string} storeName
     * @returns {Promise}
     */
    async clearStore(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get count of items in store
     * @param {string} storeName
     * @returns {Promise}
     */
    async count(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Create global database instance
const db = new DatabaseManager();

// Initialize database when app starts
db.init().catch(error => {
    console.error('Failed to initialize database:', error);
});
