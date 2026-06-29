document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    loadCommunities();
    document.getElementById('communitySearch')?.addEventListener('input', debounce(loadCommunities, 300));
    document.getElementById('createCommunityBtn')?.addEventListener('click', () => toast.info('Coming soon!'));
});

function loadCommunities() {
    const container = document.getElementById('communitiesGrid');
    if (!container) return;
    const query = document.getElementById('communitySearch')?.value.trim().toLowerCase() || '';
    const communities = [
        { id: 'c1', name: 'Gaming Hub', desc: 'For all gamers!', icon: '🎮', members: '12.5k', type: 'public' },
        { id: 'c2', name: 'Art Corner', desc: 'Share your art', icon: '🎨', members: '8.2k', type: 'public' },
        { id: 'c3', name: 'Tech Talk', desc: 'Discuss technology', icon: '💻', members: '15.1k', type: 'public' },
        { id: 'c4', name: 'Music Lovers', desc: 'Share and discover music', icon: '🎵', members: '6.8k', type: 'private' },
        { id: 'c5', name: 'Book Club', desc: 'Read and discuss books', icon: '📚', members: '4.3k', type: 'public' },
        { id: 'c6', name: 'Fitness Freaks', desc: 'Get fit together', icon: '💪', members: '9.1k', type: 'public' }
    ];
    const filtered = query ? communities.filter(c => c.name.toLowerCase().includes(query)) : communities;
    container.innerHTML = filtered.map(c => `
        <div class="community-card" onclick="router.navigate('/community/${c.id}')">
            <div class="community-icon">${c.icon}</div>
            <div class="community-name">${c.name}</div>
            <div class="community-desc">${c.desc}</div>
            <span class="community-badge badge-${c.type}">${c.type}</span>
            <div class="community-stats mt-2"><span>👥 ${c.members}</span></div>
        </div>`).join('');
}
