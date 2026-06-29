/**
 * ChronoX - Sidebar Component Logic
 * Handles sidebar navigation, active states, and mobile toggle
 * @version 1.0.0
 */

class SidebarComponent {
    constructor() {
        this.sidebar = null;
        this.overlay = null;
        this.activeLink = null;
        this.initialized = false;
    }

    /**
     * Initialize sidebar after DOM is ready
     */
    init() {
        const checkInterval = setInterval(() => {
            this.sidebar = document.getElementById('sidebar');
            if (this.sidebar) {
                clearInterval(checkInterval);
                this.createOverlay();
                this.setupEventListeners();
                this.updateActiveLink();
                this.handleResize();
                this.initialized = true;
            }
        }, 100);
    }

    /**
     * Create overlay for mobile
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'sidebar-overlay';
        this.overlay.addEventListener('click', () => this.closeMobileMenu());
        document.body.appendChild(this.overlay);
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Handle link clicks
        const links = this.sidebar.querySelectorAll('.sidebar-link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                // Remove active from all links
                links.forEach(l => l.classList.remove('active'));
                // Add active to clicked link
                link.classList.add('active');
                
                // Close mobile menu after navigation
                if (window.innerWidth <= 1023) {
                    setTimeout(() => this.closeMobileMenu(), 200);
                }
            });
        });

        // Handle resize
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, 250));

        // Handle route changes
        window.addEventListener('hashchange', () => {
            this.updateActiveLink();
        });
    }

    /**
     * Update active link based on current route
     */
    updateActiveLink() {
        const currentHash = window.location.hash.slice(1) || '/';
        const links = this.sidebar.querySelectorAll('.sidebar-link');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            
            const linkPath = href.replace('#', '');
            
            // Remove active class
            link.classList.remove('active');
            
            // Add active if matches current route
            if (currentHash === linkPath || 
                (linkPath !== '/' && currentHash.startsWith(linkPath))) {
                link.classList.add('active');
                
                // Scroll into view if needed
                link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        if (!this.sidebar) return;
        
        const isOpen = this.sidebar.classList.contains('mobile-open');
        
        if (isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Open mobile menu
     */
    openMobileMenu() {
        this.sidebar.classList.add('mobile-open');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.sidebar.classList.remove('mobile-open');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const width = window.innerWidth;
        
        if (width > 1023) {
            // Desktop - ensure sidebar is visible
            this.sidebar.classList.remove('mobile-open');
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
        } else if (width <= 1023 && width > 767) {
            // Tablet - collapsed but visible
            this.sidebar.classList.add('collapsed');
        } else if (width <= 767) {
            // Mobile - hidden by default
            this.sidebar.classList.remove('collapsed');
            if (!this.sidebar.classList.contains('mobile-open')) {
                this.sidebar.style.transform = 'translateX(-100%)';
            }
        }
    }

    /**
     * Highlight a specific section
     * @param {string} section - Section identifier
     */
    highlightSection(section) {
        const links = this.sidebar.querySelectorAll('.sidebar-link');
        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#/${section}`) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Add notification dot to a menu item
     * @param {string} section
     * @param {number} count
     */
    addNotificationDot(section, count = 0) {
        const link = this.sidebar.querySelector(`a[href="#/${section}"]`);
        if (!link) return;

        // Remove existing dot
        const existingDot = link.querySelector('.sidebar-notification-dot');
        if (existingDot) existingDot.remove();

        if (count > 0) {
            const dot = document.createElement('span');
            dot.className = 'sidebar-notification-dot';
            dot.textContent = count > 99 ? '99+' : count;
            link.appendChild(dot);
        }
    }
}

// Create global sidebar instance
const sidebar = new SidebarComponent();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    sidebar.init();
});
