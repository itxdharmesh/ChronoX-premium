document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    updateStreak();
    loadWeekGrid();
    document.getElementById('claimRewardBtn')?.addEventListener('click', claimDailyReward);
});

function updateStreak() {
    const streak = storage.get('dailyStreak', 0);
    const lastClaim = storage.get('lastDailyClaim');
    const today = new Date().toDateString();
    
    document.getElementById('streakCount').textContent = streak;
    document.getElementById('streakBonus').textContent = `+${10 + streak * 5} bonus coins today`;
    
    const btn = document.getElementById('claimRewardBtn');
    if (lastClaim === today) {
        btn.disabled = true;
        btn.innerHTML = '<span>✅ Claimed Today</span>';
        document.getElementById('nextClaimTime').textContent = 'Come back tomorrow!';
    }
}

function loadWeekGrid() {
    const grid = document.getElementById('weekGrid');
    if (!grid) return;
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const rewards = ['🎁', '💰', '💎', '🌟', '🎯', '🔥', '👑'];
    const coins = [10, 20, 30, 50, 75, 100, 200];
    const today = new Date().getDay();
    const lastClaim = storage.get('lastDailyClaim');
    const claimedDays = storage.get('claimedDays', []);
    
    grid.innerHTML = days.map((day, i) => {
        const isToday = (i + 1) % 7 === today % 7 || (today === 0 && i === 6);
        const isClaimed = claimedDays.includes(i);
        const isLocked = !isToday && !isClaimed && i > claimedDays.length;
        
        return `
            <div class="day-card ${isClaimed ? 'claimed' : ''} ${isToday ? 'today' : ''} ${isLocked ? 'locked' : ''}">
                <div class="day-name">${day}</div>
                <div class="day-icon">${rewards[i]}</div>
                <div class="day-reward">+${coins[i]}</div>
            </div>`;
    }).join('');
}

async function claimDailyReward() {
    const lastClaim = storage.get('lastDailyClaim');
    const today = new Date().toDateString();
    
    if (lastClaim === today) {
        toast.info('Already claimed today!');
        return;
    }
    
    const streak = storage.get('dailyStreak', 0);
    const newStreak = isConsecutiveDay() ? streak + 1 : 1;
    const reward = 50 + newStreak * 10;
    
    storage.set('lastDailyClaim', today);
    storage.set('dailyStreak', newStreak);
    
    const claimedDays = storage.get('claimedDays', []);
    claimedDays.push(new Date().getDay());
    storage.set('claimedDays', claimedDays);
    
    await auth.addCoins(reward);
    await auth.addXP(25);
    
    updateStreak();
    loadWeekGrid();
    toast.success(`Claimed ${reward} coins! Streak: ${newStreak} days 🔥`);
}

function isConsecutiveDay() {
    const lastClaim = storage.get('lastDailyClaim');
    if (!lastClaim) return false;
    const last = new Date(lastClaim);
    const yesterday = new Date(Date.now() - 86400000);
    return last.toDateString() === yesterday.toDateString();
}
