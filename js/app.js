function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(page + 'Page');
    if (targetPage) targetPage.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    switch(page) {
        case 'home':
            if (typeof window.loadDashboard === 'function') window.loadDashboard();
            break;
        case 'chats':
            if (typeof window.loadChatList === 'function') window.loadChatList();
            break;
        // ✅ FIXED: Profile page - DON'T auto-call renderOwnProfile
        // Only call renderOwnProfile if explicitly triggered from bottom nav
        // Search results already set the profile content before navigation
        case 'profile':
            // DO NOT auto-load own profile - let the caller handle it
            break;
        case 'games':
            if (typeof window.renderGamesHub === 'function') window.renderGamesHub();
            break;
        case 'search':
            setTimeout(() => document.getElementById('searchInput')?.focus(), 300);
            break;
    }
    
    history.pushState({ page: page }, '', `#${page}`);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            
            // ✅ If clicking Profile nav, load own profile
            if (page === 'profile') {
                if (typeof window.renderOwnProfile === 'function') {
                    window.renderOwnProfile();
                }
            }
            
            navigate(page);
        });
    });
    
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash + 'Page')) navigate(hash);
});

window.navigate = navigate;
