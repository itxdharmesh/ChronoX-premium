/**
 * Main App Controller
 * Handles navigation and page routing
 */

// Navigation function
function navigate(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(page + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update bottom nav
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    
    const activeNav = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // Trigger page-specific functions
    switch(page) {
        case 'chats':
            if (typeof window.loadChatList === 'function') {
                window.loadChatList();
            }
            break;
        case 'profile':
            if (typeof window.renderOwnProfile === 'function') {
                window.renderOwnProfile();
            }
            break;
        case 'games':
            if (typeof window.renderGamesHub === 'function') {
                window.renderGamesHub();
            }
            break;
        case 'search':
            // Focus on search input
            setTimeout(() => {
                document.getElementById('searchInput')?.focus();
            }, 300);
            break;
    }
}

// Initialize bottom navigation
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigate(page);
        });
    });
}

// Handle back button
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        navigate(event.state.page);
    }
});

// Push state to history when navigating
const originalNavigate = navigate;
navigate = function(page) {
    history.pushState({ page: page }, '', `#${page}`);
    originalNavigate(page);
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    
    // Handle initial hash
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash + 'Page')) {
        navigate(hash);
    }
    
    // Hide splash screen after delay
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash && splash.style.display !== 'none') {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 500);
        }
    }, 2000);
});

// Export globally
window.navigate = navigate;
window.initNavigation = initNavigation;
