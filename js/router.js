/**
 * ChronoX - Router
 * Handles client-side routing with hash-based navigation
 * @version 1.0.0
 */

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.previousRoute = null;
        this.guards = [];
        this.params = {};
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    /**
     * Register a route
     * @param {string} path - Route path (e.g., '/home', '/profile/:id')
     * @param {Object} config - Route configuration
     * @param {string} config.page - Page folder name
     * @param {string} config.title - Page title
     * @param {boolean} config.requiresAuth - Whether route needs authentication
     * @param {Function} config.beforeEnter - Guard function
     */
    addRoute(path, config) {
        this.routes[path] = {
            page: config.page,
            title: config.title || 'ChronoX',
            requiresAuth: config.requiresAuth || false,
            beforeEnter: config.beforeEnter || null,
            params: {}
        };
    }

    /**
     * Navigate to a route
     * @param {string} path
     * @param {Object} params
     */
    navigate(path, params = {}) {
        let url = '#' + path;
        
        // Add query params
        if (Object.keys(params).length > 0) {
            const query = Object.entries(params)
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&');
            url += '?' + query;
        }
        
        window.location.hash = path;
    }

    /**
     * Handle current route
     */
    async handleRoute() {
        let hash = window.location.hash.slice(1) || '/';
        
        // Parse query params
        const [path, queryString] = hash.split('?');
        this.params = {};
        
        if (queryString) {
            const params = new URLSearchParams(queryString);
            for (const [key, value] of params) {
                this.params[key] = value;
            }
        }

        // Find matching route
        let route = this.findRoute(path);
        
        if (!route) {
            // 404 - Redirect to home
            console.warn(`Route not found: ${path}`);
            return this.navigate('/');
        }

        // Check auth guard
        if (route.requiresAuth && !auth.isLoggedIn()) {
            storage.set('redirectAfterLogin', path);
            return this.navigate('/login');
        }

        // Check if already on login and authenticated
        if ((path === '/login' || path === '/signup') && auth.isLoggedIn()) {
            return this.navigate('/');
        }

        // Run beforeEnter guard
        if (route.beforeEnter) {
            const canEnter = await route.beforeEnter();
            if (!canEnter) return;
        }

        // Update route tracking
        this.previousRoute = this.currentRoute;
        this.currentRoute = { path, route };

        // Update page title
        document.title = route.title + ' - ChronoX';

        // Load page content
        await this.loadPage(route.page);
    }

    /**
     * Find matching route for path
     * @param {string} path
     * @returns {Object|null}
     */
    findRoute(path) {
        // Direct match
        if (this.routes[path]) {
            return this.routes[path];
        }

        // Dynamic routes (e.g., /profile/:id)
        for (const [routePath, route] of Object.entries(this.routes)) {
            if (routePath.includes(':')) {
                const pattern = routePath.replace(/:[^/]+/g, '([^/]+)');
                const regex = new RegExp(`^${pattern}$`);
                const match = path.match(regex);
                
                if (match) {
                    // Extract params
                    const paramNames = routePath.match(/:[^/]+/g) || [];
                    const params = {};
                    paramNames.forEach((name, index) => {
                        params[name.slice(1)] = match[index + 1];
                    });
                    
                    return { ...route, params };
                }
            }
        }

        return null;
    }

    /**
     * Load page content dynamically
     * @param {string} page - Page folder name
     */
    async loadPage(page) {
        const mainContent = document.getElementById('main-content');
        
        if (!mainContent) {
            console.error('Main content container not found');
            return;
        }

        // Show loader
        mainContent.innerHTML = `
            <div class="page-loader">
                <div class="loader-spinner"></div>
            </div>
        `;

        try {
            // Fetch page HTML
            const response = await fetch(`pages/${page}/index.html`);
            if (!response.ok) {
                throw new Error(`Failed to load page: ${page}`);
            }
            
            const html = await response.text();
            
            // Update content
            mainContent.innerHTML = html;
            
            // Load page CSS dynamically
            this.loadCSS(`pages/${page}/style.css`);
            
            // Load page JS dynamically
            await this.loadJS(`pages/${page}/script.js`);
            
            // Scroll to top
            window.scrollTo(0, 0);
            
        } catch (error) {
            console.error('Error loading page:', error);
            mainContent.innerHTML = `
                <div class="error-page text-center p-8">
                    <h2>Oops! Something went wrong</h2>
                    <p>Failed to load page. Please try again.</p>
                    <button class="btn btn-primary mt-4" onclick="window.location.reload()">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    /**
     * Load CSS dynamically
     * @param {string} href
     */
    loadCSS(href) {
        // Remove previously loaded page CSS
        const oldLink = document.querySelector('link[data-page-css]');
        if (oldLink) {
            oldLink.remove();
        }

        // Add new CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute('data-page-css', 'true');
        document.head.appendChild(link);
    }

    /**
     * Load JavaScript dynamically
     * @param {string} src
     * @returns {Promise}
     */
    loadJS(src) {
        return new Promise((resolve, reject) => {
            // Remove previously loaded page JS
            const oldScript = document.querySelector('script[data-page-js]');
            if (oldScript) {
                oldScript.remove();
            }

            const script = document.createElement('script');
            script.src = src;
            script.setAttribute('data-page-js', 'true');
            script.onload = () => resolve();
            script.onerror = () => {
                console.warn(`Failed to load script: ${src}`);
                resolve(); // Resolve anyway, script might not exist
            };
            document.body.appendChild(script);
        });
    }

    /**
     * Get current route info
     * @returns {Object}
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Go back to previous route
     */
    goBack() {
        if (this.previousRoute) {
            this.navigate(this.previousRoute.path);
        } else {
            window.history.back();
        }
    }

    /**
     * Initialize all routes
     */
    init() {
        // Auth routes
        this.addRoute('/login', {
            page: 'login',
            title: 'Login'
        });
        
        this.addRoute('/signup', {
            page: 'signup',
            title: 'Sign Up'
        });
        
        this.addRoute('/forgot-password', {
            page: 'forgot-password',
            title: 'Forgot Password'
        });

        // Main routes
        this.addRoute('/', {
            page: 'home',
            title: 'Home',
            requiresAuth: true
        });
        
        this.addRoute('/home', {
            page: 'home',
            title: 'Home',
            requiresAuth: true
        });
        
        this.addRoute('/explore', {
            page: 'explore',
            title: 'Explore',
            requiresAuth: true
        });
        
        this.addRoute('/search', {
            page: 'search',
            title: 'Search',
            requiresAuth: true
        });

        // Profile routes
        this.addRoute('/profile/:id', {
            page: 'profile',
            title: 'Profile',
            requiresAuth: true
        });
        
        this.addRoute('/edit-profile', {
            page: 'edit-profile',
            title: 'Edit Profile',
            requiresAuth: true
        });

        // Social routes
        this.addRoute('/posts', {
            page: 'posts',
            title: 'Posts',
            requiresAuth: true
        });
        
        this.addRoute('/friends', {
            page: 'friends',
            title: 'Friends',
            requiresAuth: true
        });
        
        this.addRoute('/messages', {
            page: 'messages',
            title: 'Messages',
            requiresAuth: true
        });
        
        this.addRoute('/notifications', {
            page: 'notifications',
            title: 'Notifications',
            requiresAuth: true
        });

        // Community routes
        this.addRoute('/communities', {
            page: 'communities',
            title: 'Communities',
            requiresAuth: true
        });
        
        this.addRoute('/community/:id', {
            page: 'community',
            title: 'Community',
            requiresAuth: true
        });

        // Gaming routes
        this.addRoute('/games', {
            page: 'games',
            title: 'Games',
            requiresAuth: true
        });
        
        this.addRoute('/leaderboard', {
            page: 'leaderboard',
            title: 'Leaderboard',
            requiresAuth: true
        });
        
        this.addRoute('/achievements', {
            page: 'achievements',
            title: 'Achievements',
            requiresAuth: true
        });
        
        this.addRoute('/daily-rewards', {
            page: 'daily-rewards',
            title: 'Daily Rewards',
            requiresAuth: true
        });

        // Shop routes
        this.addRoute('/shop', {
            page: 'shop',
            title: 'Shop',
            requiresAuth: true
        });
        
        this.addRoute('/avatar', {
            page: 'avatar',
            title: 'Avatar',
            requiresAuth: true
        });
        
        this.addRoute('/coins', {
            page: 'coins',
            title: 'Coins',
            requiresAuth: true
        });
        
        this.addRoute('/xp', {
            page: 'xp',
            title: 'XP & Levels',
            requiresAuth: true
        });

        // Settings routes
        this.addRoute('/settings', {
            page: 'settings',
            title: 'Settings',
            requiresAuth: true
        });
        
        this.addRoute('/privacy', {
            page: 'privacy',
            title: 'Privacy',
            requiresAuth: true
        });
        
        this.addRoute('/events', {
            page: 'events',
            title: 'Events',
            requiresAuth: true
        });

        // Handle initial route
        this.handleRoute();
    }
}

// Create global router instance
const router = new Router();
