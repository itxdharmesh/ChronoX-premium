document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    updateXPDisplay();
    loadRewardsTimeline();
});

function updateXPDisplay() {
    const user = auth.getCurrentUser();
    if (!user) return;
    
    const level = user.level || 1;
    const xp = user.xp || 0;
    const xpForNext = level * 1000;
    const xpForCurrent = (level - 1) * 1000;
    const xpInLevel = xp - xpForCurrent;
    const progress = (xpInLevel / (xpForNext - xpForCurrent)) * 100;
    const remaining = xpForNext - xp;
    
    document.getElementById('levelBadge').textContent = level;
    document.getElementById('currentLevel').textContent = level;
    document.getElementById('xpBarFill').style.width = Math.min(progress, 100) + '%';
    document.getElementById('currentXP').textContent = formatNumber(xp);
    document.getElementById('nextLevelXP').textContent = formatNumber(xpForNext);
    document.getElementById('xpRemaining').textContent = `${formatNumber(remaining)} XP to next level`;
}

function loadRewardsTimeline() {
    const container = document.getElementById('rewardsTimeline');
    if (!container) return;
    const user = auth.getCurrentUser();
    
    const milestones = [
        { level: 1, prize: '🎉 Welcome Bonus', coins: 100 },
        { level: 2, prize: '🎨 Theme Unlock', coins: 50 },
        { level: 3, prize: '👑 Crown Item', coins: 75 },
        { level: 5, prize: '💎 Diamond Badge', coins: 200 },
        { level: 10, prize: '🌟 Special Avatar', coins: 500 },
        { level: 15, prize: '🔥 Flame Badge', coins: 300 },
        { level: 20, prize: '🏆 Trophy', coins: 1000 }
    ];
    
    container.innerHTML = milestones.map(m => `
        <div class="reward-milestone ${user.level >= m.level ? 'unlocked' : 'locked'}">
            <div class="reward-icon">${m.prize.split(' ')[0]}</div>
            <div class="reward-level">Level ${m.level}</div>
            <div class="reward-prize">${m.prize}</div>
            <div class="text-xs text-muted">💰 ${m.coins} coins</div>
        </div>`).join('');
}
