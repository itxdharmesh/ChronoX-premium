/**
 * ChronoX - Explore Page Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    loadTrendingPosts();
    loadSuggestedUsers();
    loadCommunities();
    setupTagClicks();
});

async function loadTrendingPosts() {
    const grid = document.getElementById('exploreGrid');
    if (!grid) return;
    try {
        const posts = await db.getAll('posts');
        const sorted = posts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 9);
        grid.innerHTML = sorted.map(p => `
            <div class="explore-post-item" onclick="router.navigate('/posts?id=${p.id}')">
                ${p.image ? `<img src="${p.image}" alt="">` : `<div class="p-4">${truncate(p.content, 80)}</div>`}
                <div class="explore-post-stats"><span>❤️ ${p.likes?.length || 0}</span><span>💬 ${p.comments?.length || 0}</span></div>
            </div>`).join('');
    } catch(e) { grid.innerHTML = '<p class="text-muted">Failed to load posts</p>'; }
}

async function loadSuggestedUsers() {
    const container = document.getElementById('suggestedUsers');
    if (!container) return;
    try {
        const users = await db.getAll('users');
        const shuffled = users.sort(() => 0.5 - Math.random()).slice(0, 4);
        container.innerHTML = shuffled.map(u => `
            <div class="suggested-user-card" onclick="router.navigate('/profile/${u.id}')">
                <img src="${u.avatar || 'assets/avatars/default.png'}" class="suggested-user-avatar" alt="">
                <div class="suggested-user-name">${u.displayName || u.username}</div>
                <div class="suggested-user-bio">${truncate(u.bio || 'No bio', 30)}</div>
                <span class="badge badge-xp">Lv.${u.level || 1}</span>
            </div>`).join('');
    } catch(e) { console.error(e); }
}

function loadCommunities() {
    const container = document.getElementById('exploreCommunities');
    if (!container) return;
    const communities = [
        { name: 'Gaming Hub', icon: '🎮', members: '12.5k' },
        { name: 'Art Corner', icon: '🎨', members: '8.2k' },
        { name: 'Tech Talk', icon: '💻', members: '15.1k' }
    ];
    container.innerHTML = communities.map(c => `
        <div class="community-card" onclick="router.navigate('/communities')">
            <div class="community-card-icon">${c.icon}</div>
            <div class="community-card-name">${c.name}</div>
            <div class="community-card-members">${c.members} members</div>
        </div>`).join('');
}

function setupTagClicks() {
    document.querySelectorAll('.trending-tag').forEach(tag => {
        tag.addEventListener('click', () => router.navigate('/search', { q: tag.textContent }));
    });
      }
