/**
 * ChronoX - Main Application
 * Initializes all modules and bootstraps the application
 * @version 1.0.0
 */

class App {
    constructor() {
        this.version = '1.0.0';
        this.initialized = false;
        this.modules = {};
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log(`🚀 ChronoX v${this.version} initializing...`);

        try {
            // Show loading screen
            this.showGlobalLoader();

            // Initialize database
            await this.initDatabase();

            // Load components
            await this.loadComponents();

            // Initialize router
            this.initRouter();

            // Register service worker
            this.registerServiceWorker();

            // Setup event listeners
            this.setupEventListeners();

            // Check authentication
            this.checkAuth();

            // Hide loading screen
            this.hideGlobalLoader();

            this.initialized = true;
            console.log('✅ ChronoX initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize ChronoX:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh.');
        }
    }

    /**
     * Initialize database connection
     */
    async initDatabase() {
        try {
            await db.init();
            
            // Check if demo user exists, if not create one
            const users = await db.getAll('users');
            if (users.length === 0) {
                await this.createDemoData();
            }
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }

    /**
     * Create demo data for first-time users
     */
    async createDemoData() {
        // Create demo user
        const demoUser = {
            id: 'demo_user_001',
            username: 'chronox_user',
            email: 'demo@chronox.app',
            password: auth.hashPassword('Demo@123'),
            displayName: 'ChronoX User',
            bio: 'Welcome to ChronoX! 🚀',
            avatar: 'assets/avatars/default.png',
            banner: 'assets/backgrounds/default-banner.png',
            badges: ['beta_tester'],
            xp: 500,
            level: 2,
            coins: 250,
            achievements: ['welcome_achievement'],
            friends: [],
            followers: [],
            following: [],
            createdAt: new Date().toISOString(),
            isVerified: true,
            theme: 'dark',
            language: 'en'
        };

        await db.add('users', demoUser);

        // Create welcome notification
        const welcomeNotif = {
            id: 'welcome_notif_001',
            userId: 'demo_user_001',
            type: 'system',
            title: 'Welcome to ChronoX!',
            message: 'Thanks for joining! Complete your profile and explore the platform.',
            read: false,
            createdAt: new Date().toISOString()
        };

        await db.add('notifications', welcomeNotif);

        // Create welcome achievement
        const welcomeAchievement = {
            id: 'welcome_achievement',
            userId: 'demo_user_001',
            name: 'Welcome!',
            description: 'Join ChronoX for the first time',
            icon: '🎉',
            xpReward: 100,
            coinReward: 50,
            unlockedAt: new Date().toISOString()
        };

        await db.add('achievements', welcomeAchievement);

        // Create sample post
        const samplePost = {
            id: 'post_001',
            userId: 'demo_user_001',
            content: 'Hello ChronoX! This is my first post on this amazing platform. Can\'t wait to connect with everyone! 🚀✨',
            image: '',
            likes: [],
            comments: [],
            shares: 0,
            saves: 0,
            hashtags: ['hello', 'firstpost', 'chronox'],
            createdAt: new Date().toISOString()
        };

        await db.add('posts', samplePost);
    }

    /**
     * Load reusable components
     */
    async loadComponents() {
        const components = ['navbar', 'sidebar', 'footer'];
        
        for (const component of components) {
            try {
                const container = document.getElementById(`${component}-container`);
                if (!container) continue;

                const response = await fetch(`components/${component}/${component}.html`);
                if (response.ok) {
                    const html = await response.text();
                    container.innerHTML = html;
                }
            } catch (error) {
                console.warn(`Failed to load ${component}:`, error);
            }
        }
    }

    /**
     * Initialize router
     */
    initRouter() {
        router.init();
    }

    /**
     * Register service worker
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration.scope);
                })
                .catch(error => {
                    console.warn('Service Worker registration failed:', error);
                });
        }
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Handle online/offline status
        window.addEventListener('online', () => {
            toast.show('Back online!', 'success');
        });

        window.addEventListener('offline', () => {
            toast.show('You are offline. Some features may be limited.', 'warning');
        });

        // Handle keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            // Ctrl+K or / for search
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !e.ctrlKey && !e.metaKey)) {
                e.preventDefault();
                router.navigate('/search');
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                modal.close();
            }
        });

        // Handle window resize for responsive adjustments
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, 250));

        // Handle before unload
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
    }

    /**
     * Check authentication state
     */
    checkAuth() {
        const currentHash = window.location.hash.slice(1) || '/';
        const publicRoutes = ['/login', '/signup', '/forgot-password'];

        if (!auth.isLoggedIn() && !publicRoutes.includes(currentHash)) {
            router.navigate('/login');
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const width = window.innerWidth;
        const sidebar = document.getElementById('sidebar-container');
        
        if (sidebar) {
            if (width < 1024) {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
            }
        }
    }

    /**
     * Save application state
     */
    saveState() {
        // Save any unsaved data
        if (auth.isLoggedIn()) {
            auth.saveSession();
        }
    }

    /**
     * Show global loading screen
     */
    showGlobalLoader() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    }

    /**
     * Hide global loading screen
     */
    hideGlobalLoader() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    /**
     * Show error message
     * @param {string} message
     */
    showErrorMessage(message) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-page text-center p-8">
                    <div class="text-6xl mb-4">😔</div>
                    <h2>Something went wrong</h2>
                    <p class="text-secondary">${message}</p>
                    <button class="btn btn-primary mt-4" onclick="location.reload()">
                        Refresh Page
                    </button>
                </div>
            `;
        }
    }

    /**
     * Get app version
     * @returns {string}
     */
    getVersion() {
        return this.version;
    }

    /**
     * Check for updates (placeholder for future PWA update flow)
     */
    async checkForUpdates() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            await registration.update();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chronoxApp = new App();
    window.chronoxApp.init();
});

// Handle unhandled errors
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
    toast.show('An unexpected error occurred', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    toast.show('Something went wrong', 'error');
});
