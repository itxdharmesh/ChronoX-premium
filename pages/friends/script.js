let friendsTab = 'all';
document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    document.querySelectorAll('.friend-tab').forEach(t => t.addEventListener('click', (e) => {
        friendsTab = e.target.dataset.tab;
        document.querySelectorAll('.friend-tab').forEach(x => x.classList.remove('active'));
        e.target.classList.add('active');
        loadFriends();
    }));
    document.getElementById('friendSearchInput')?.addEventListener('input', debounce(loadFriends, 300));
    loadFriends();
});

async function loadFriends() {
    const container = document.getElementById('friendsList');
    if (!container) return;
    const query = document.getElementById('friendSearchInput')?.value.trim().toLowerCase() || '';
    const user = auth.getCurrentUser();
    try {
        let friends = [];
        if (friendsTab === 'all') {
            const allUsers = await db.getAll('users');
            friends = allUsers.filter(u => user.friends?.includes(u.id) && u.id !== user.id);
        } else if (friendsTab === 'requests') {
            friends = [{ id: 'req1', username: 'new_user', displayName: 'New User', avatar: 'assets/avatars/default.png', level: 1 }];
        } else {
            const allUsers = await db.getAll('users');
            friends = allUsers.filter(u => !user.friends?.includes(u.id) && u.id !== user.id).slice(0, 5);
        }
        if (query) friends = friends.filter(f => f.username?.toLowerCase().includes(query) || f.displayName?.toLowerCase().includes(query));
        
        if (friends.length === 0) {
            container.innerHTML = '<div class="text-center py-8"><p class="text-muted">No friends found</p></div>';
            return;
        }
        container.innerHTML = friends.map(f => `
            <div class="friend-card">
                <div class="avatar-wrapper">
                    <img src="${f.avatar || 'assets/avatars/default.png'}" class="avatar" alt="">
                    <div class="online-dot"></div>
                </div>
                <div class="friend-info">
                    <div class="friend-name">${f.displayName || f.username}</div>
                    <div class="friend-username">@${f.username} · Lv.${f.level || 1}</div>
                </div>
                <div class="friend-actions">
                    <button class="btn btn-primary btn-sm" onclick="router.navigate('/profile/${f.id}')">Profile</button>
                    <button class="btn btn-secondary btn-sm" onclick="router.navigate('/messages?userId=${f.id}')">Message</button>
                </div>
            </div>`).join('');
    } catch(e) { container.innerHTML = '<p class="text-muted">Failed to load friends</p>'; }
}
