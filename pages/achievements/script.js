let achCategory = 'all';

const allAchievements = [
    { id: 'welcome', name: 'Welcome!', desc: 'Join ChronoX', icon: '🎉', category: 'special', xp: 100, coins: 50, target: 1 },
    { id: 'first_post', name: 'First Post', desc: 'Create your first post', icon: '📝', category: 'social', xp: 50, coins: 25, target: 1 },
    { id: 'post_10', name: 'Content Creator', desc: 'Create 10 posts', icon: '✍️', category: 'social', xp: 200, coins: 100, target: 10 },
    { id: 'likes_50', name: 'Popular', desc: 'Get 50 likes total', icon: '❤️', category: 'social', xp: 300, coins: 150, target: 50 },
    { id: 'friends_10', name: 'Social Butterfly', desc: 'Make 10 friends', icon: '🦋', category: 'social', xp: 200, coins: 100, target: 10 },
    { id: 'comments_20', name: 'Chatterbox', desc: 'Post 20 comments', icon: '💬', category: 'social', xp: 150, coins: 75, target: 20 },
    { id: 'play_5', name: 'Gamer', desc: 'Play 5 games', icon: '🎮', category: 'gaming', xp: 150, coins: 100, target: 5 },
    { id: 'win_10', name: 'Winner', desc: 'Win 10 games', icon: '🏆', category: 'gaming', xp: 300, coins: 200, target: 10 },
    { id: 'score_1000', name: 'High Scorer', desc: 'Score 1000 in any game', icon: '🎯', category: 'gaming', xp: 400, coins: 250, target: 1000 },
    { id: 'coins_1000', name: 'Collector', desc: 'Earn 1000 coins', icon: '💰', category: 'special', xp: 250, coins: 200, target: 1000 },
    { id: 'streak_7', name: '7 Day Streak', desc: 'Login 7 days in a row', icon: '🔥', category: 'special', xp: 350, coins: 300, target: 7 },
    { id: 'level_5', name: 'Rising Star', desc: 'Reach level 5', icon: '⭐', category: 'special', xp: 500, coins: 400, target: 5 }
];

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    loadAchievements();
    document.querySelectorAll('.ach-category').forEach(btn => btn.addEventListener('click', (e) => {
        achCategory = e.target.dataset.cat;
        document.querySelectorAll('.ach-category').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        loadAchievements();
    }));
});

async function loadAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    
    try {
        const userAchievements = await db.query('achievements', 'userId', auth.getCurrentUser().id);
        const unlockedIds = userAchievements.map(a => a.id);
        
        const filtered = achCategory === 'all' ? allAchievements : allAchievements.filter(a => a.category === achCategory);
        
        document.getElementById('unlockedCount').textContent = unlockedIds.length;
        document.getElementById('totalCount').textContent = allAchievements.length;
        
        grid.innerHTML = filtered.map(ach => {
            const unlocked = unlockedIds.includes(ach.id);
            const progress = getAchievementProgress(ach);
            
            return `
                <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                    <div class="ach-icon">${ach.icon}</div>
                    <div class="ach-name">${ach.name}</div>
                    <div class="ach-desc">${ach.desc}</div>
                    <div class="ach-reward">
                        <span class="reward-xp">+${ach.xp} XP</span>
                        <span class="reward-coins">+${ach.coins} 🪙</span>
                    </div>
                    ${!unlocked ? `
                        <div class="ach-progress">
                            <div class="ach-progress-fill" style="width:${Math.min(progress, 100)}%"></div>
                        </div>
                        <div class="text-xs text-muted mt-1">${progress}%</div>
                    ` : '<div class="text-xs text-success mt-2">✅ Unlocked</div>'}
                </div>`;
        }).join('');
    } catch(e) {
        grid.innerHTML = '<p class="text-muted">Failed to load achievements</p>';
    }
}

function getAchievementProgress(ach) {
    const user = auth.getCurrentUser();
    switch(ach.id) {
        case 'first_post': return user.postCount ? 100 : 0;
        case 'post_10': return Math.min((user.postCount || 0) / 10 * 100, 100);
        case 'friends_10': return Math.min((user.friends?.length || 0) / 10 * 100, 100);
        case 'level_5': return Math.min((user.level || 1) / 5 * 100, 100);
        case 'coins_1000': return Math.min((user.coins || 0) / 1000 * 100, 100);
        default: return unlockedIds.includes(ach.id) ? 100 : Math.floor(Math.random() * 80);
    }
     }
