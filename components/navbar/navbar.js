/**
 * ChronoX - Navbar Component Logic
 * Handles navigation interactions, search, and user menu
 * @version 1.0.0
 */

class NavbarComponent {
    constructor() {
        this.navbar = null;
        this.userDropdown = null;
        this.initialized = false;
    }

    /**
     * Initialize navbar after DOM is ready
     */
    init() {
        // Wait for component to be loaded
        const checkInterval = setInterval(() => {
            this.navbar = document.getElementById('navbar');
            if (this.navbar) {
                clearInterval(checkInterval);
                this.setupEventListeners();
                this.updateUserInfo();
                this.initialized = true;
            }
        }, 100);
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Search functionality
        const searchInput = document.getElementById('navbarSearch');
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                router.navigate('/search');
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        router.navigate('/search', { q: query });
                    }
                }
            });
        }

        // Notification button
        const notifBtn = document.getElementById('notificationBtn');
        if (notifBtn) {
            notifBtn.addEventListener('click', () => {
                router.navigate('/notifications');
            });
        }

        // Messages button
        const msgBtn = document.getElementById('messagesBtn');
        if (msgBtn) {
            msgBtn.addEventListener('click', () => {
                router.navigate('/messages');
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // User menu toggle
        const userMenuBtn = document.getElementById('userMenuBtn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserMenu();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('userMenu');
            if (userMenu && !userMenu.contains(e.target)) {
                this.closeUserMenu();
            }
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Coins display click
        const coinsDisplay = document.getElementById('coinsDisplay');
        if (coinsDisplay) {
            coinsDisplay.addEventListener('click', () => {
                router.navigate('/coins');
            });
        }
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar-container');
        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
        }
    }

    /**
     * Toggle user dropdown menu
     */
    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        const trigger = document.getElementById('userMenuBtn');
        
        if (dropdown) {
            dropdown.classList.toggle('active');
            trigger.classList.toggle('active');
        }
    }

    /**
     * Close user dropdown menu
     */
    closeUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        const trigger = document.getElementById('userMenuBtn');
        
        if (dropdown) {
            dropdown.classList.remove('active');
            trigger.classList.remove('active');
        }
    }

    /**
     * Toggle between dark and light theme
     */
    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        storage.set('theme', newTheme);
        
        // Update user preference if logged in
        if (auth.isLoggedIn()) {
            auth.updateProfile({ theme: newTheme });
        }
        
        toast.show(`${capitalize(newTheme)} mode activated`, 'success');
    }

    /**
     * Handle logout
     */
    handleLogout() {
        modal.confirm({
            title: 'Logout',
            message: 'Are you sure you want to logout?',
            confirmText: 'Logout',
            onConfirm: () => {
                auth.logout();
                this.closeUserMenu();
            }
        });
    }

    /**
     * Update navbar with current user info
     */
    updateUserInfo() {
        if (!auth.isLoggedIn()) return;

        const user = auth.getCurrentUser();
        
        // Update avatar
        const avatarElements = ['navbarAvatar', 'dropdownAvatar'];
        avatarElements.forEach(id => {
            const avatar = document.getElementById(id);
            if (avatar) {
                avatar.src = user.avatar || 'assets/avatars/default.png';
                avatar.alt = user.displayName || user.username;
            }
        });

        // Update username and email
        const username = document.getElementById('dropdownUsername');
        if (username) {
            username.textContent = user.displayName || user.username;
        }

        const email = document.getElementById('dropdownEmail');
        if (email) {
            email.textContent = user.email;
        }

        // Update coins
        const coinsCount = document.getElementById('coinsCount');
        if (coinsCount) {
            coinsCount.textContent = formatNumber(user.coins || 0);
        }

        // Update XP bar
        this.updateXPBar(user.xp || 0, user.level || 1);
    }

    /**
     * Update XP progress bar
     * @param {number} xp - Current XP
     * @param {number} level - Current level
     */
    updateXPBar(xp, level) {
        const xpBar = document.getElementById('xpBar');
        const xpText = document.getElementById('xpText');
        
        if (!xpBar || !xpText) return;

        // Calculate XP progress for current level
        const xpForCurrentLevel = (level - 1) * 1000;
        const xpForNextLevel = level * 1000;
        const xpInCurrentLevel = xp - xpForCurrentLevel;
        const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
        const progress = (xpInCurrentLevel / xpNeededForLevel) * 100;

        xpBar.style.width = `${Math.min(progress, 100)}%`;
        xpText.textContent = `Lv.${level}`;
        xpText.title = `${xpInCurrentLevel} / ${xpNeededForLevel} XP`;
    }

    /**
     * Update notification badge
     * @param {number} count
     */
    updateNotificationBadge(count) {
        const badge = document.getElementById('notificationBadge');
        if (!badge) return;

        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    /**
     * Update message badge
     * @param {number} count
     */
    updateMessageBadge(count) {
        const badge = document.getElementById('messageBadge');
        if (!badge) return;

        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    /**
     * Show search bar on mobile
     */
    showMobileSearch() {
        const searchBar = document.querySelector('.navbar-center');
        if (searchBar) {
            searchBar.style.display = 'flex';
            const input = document.getElementById('navbarSearch');
            if (input) {
                input.focus();
            }
        }
    }

    /**
     * Hide search bar on mobile
     */
    hideMobileSearch() {
        const searchBar = document.querySelector('.navbar-center');
        if (searchBar && window.innerWidth < 768) {
            searchBar.style.display = 'none';
        }
    }
}

// Create global navbar instance
const navbar = new NavbarComponent();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    navbar.init();
});
