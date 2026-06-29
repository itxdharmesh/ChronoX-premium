document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    loadLeaderboard();
    document.getElementById('leaderboardFilter')?.addEventListener('change', loadLeaderboard);
});

async function loadLeaderboard() {
    try {
        const users = await db.getAll('users');
        const sorted = users.sort((a, b) => (b.xp || 0) - (a.xp || 0));
        
        // Top 3
        const topThree = document.getElementById('topThree');
        if (topThree) {
            const top3 = sorted.slice(0, 3);
            const positions = ['rank-2', 'rank-1', 'rank-3'];
            const medals = ['🥈', '🥇', '🥉'];
            topThree.innerHTML = top3.map((u, i) => `
                <div class="top-player ${positions[i]}" onclick="router.navigate('/profile/${u.id}')">
                    <div class="rank-badge">${medals[i]}</div>
                    <img src="${u.avatar || 'assets/avatars/default.png'}" class="top-avatar">
                    <div class="top-name">${u.displayName || u.username}</div>
                    <div class="top-xp">${formatNumber(u.xp || 0)} XP</div>
                    <div class="text-xs text-muted">Lv.${u.level || 1}</div>
                </div>`).join('');
        }
        
        // Full rankings
        const container = document.getElementById('rankingsContainer');
        if (container) {
            container.innerHTML = sorted.map((u, i) => `
                <div class="ranking-item" onclick="router.navigate('/profile/${u.id}')">
                    <span class="rank-num">#${i + 1}</span>
                    <div class="player-info">
                        <img src="${u.avatar || 'assets/avatars/default.png'}" class="avatar avatar-sm">
                        <span class="font-semibold text-sm">${u.displayName || u.username}</span>
                    </div>
                    <span class="text-sm font-semibold">${formatNumber(u.xp || 0)}</span>
                    <span class="badge badge-xp">Lv.${u.level || 1}</span>
                </div>`).join('');
        }
    } catch(e) { console.error('Leaderboard failed:', e); }
                                                                               }
