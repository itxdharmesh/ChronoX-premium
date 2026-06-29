let communityTab = 'feed';
let isJoined = false;

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    const route = router.getCurrentRoute();
    const communityId = route?.route?.params?.id || 'c1';
    loadCommunityInfo(communityId);
    loadCommunityPosts();
    
    document.querySelectorAll('.community-tab').forEach(t => t.addEventListener('click', (e) => {
        communityTab = e.target.dataset.tab;
        document.querySelectorAll('.community-tab').forEach(x => x.classList.remove('active'));
        e.target.classList.add('active');
    }));
    
    document.getElementById('joinCommunityBtn')?.addEventListener('click', toggleJoin);
});

function loadCommunityInfo(id) {
    const communities = { c1: { name: 'Gaming Hub', members: '12.5k', icon: '🎮' }, c2: { name: 'Art Corner', members: '8.2k', icon: '🎨' } };
    const c = communities[id] || { name: 'Community', members: '0', icon: '👥' };
    document.getElementById('communityName').textContent = c.name;
    document.getElementById('communityMembers').textContent = c.members + ' members';
}

async function loadCommunityPosts() {
    const container = document.getElementById('communityPosts');
    if (!container) return;
    try {
        const posts = await db.getAll('posts');
        container.innerHTML = posts.slice(0, 5).map(p => `
            <div class="post-card"><div class="post-content">${escapeHtml(p.content || '')}</div>
            <div class="post-actions"><span>❤️ ${p.likes?.length || 0}</span><span>💬 ${p.comments?.length || 0}</span></div></div>`).join('');
    } catch(e) { container.innerHTML = '<p class="text-muted">No posts yet</p>'; }
}

function toggleJoin() {
    isJoined = !isJoined;
    const btn = document.getElementById('joinCommunityBtn');
    btn.textContent = isJoined ? 'Leave Community' : 'Join Community';
    btn.className = isJoined ? 'btn btn-secondary' : 'btn btn-primary';
    toast.success(isJoined ? 'Welcome to the community!' : 'Left community');
}
