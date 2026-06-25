function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(page + 'Page');
    if (targetPage) targetPage.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    switch(page) {
        case 'home': if (typeof window.loadDashboard === 'function') window.loadDashboard(); break;
        case 'chats': if (typeof window.loadChatList === 'function') window.loadChatList(); break;
        case 'profile': if (typeof window.renderOwnProfile === 'function') window.renderOwnProfile(); break;
        case 'games': if (typeof window.renderGamesHub === 'function') window.renderGamesHub(); break;
        case 'search': setTimeout(() => document.getElementById('searchInput')?.focus(), 300); break;
    }
    history.pushState({ page: page }, '', `#${page}`);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => navigate(item.dataset.page));
    });
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash + 'Page')) navigate(hash);
});

window.navigate = navigate;
