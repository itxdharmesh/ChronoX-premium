import { db } from './config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function loadDashboard() {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) return;
    
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (!userDoc.exists()) return;
        
        const data = userDoc.data();
        
        // Update greeting
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        document.getElementById('greetingText').textContent = `${greeting}, ${data.name || 'User'} ✨`;
        
        // Update stats
        document.getElementById('statLevel').textContent = data.level || 1;
        document.getElementById('statXP').textContent = data.xp || 0;
        document.getElementById('statCoins').textContent = data.coins || 0;
        document.getElementById('statStreak').textContent = data.streak || 0;
        
        // XP Progress
        const xpForCurrentLevel = ((data.level || 1) - 1) * 100;
        const xpProgress = (data.xp || 0) - xpForCurrentLevel;
        const xpNeeded = 100;
        const xpPercent = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100));
        
        document.getElementById('xpProgressText').textContent = `${xpProgress}/${xpNeeded} XP`;
        document.getElementById('xpFill').style.width = `${xpPercent}%`;
        
        // Daily challenge progress
        const dailyPercent = Math.min(100, ((data.dailyGamesPlayed || 0) / 3) * 100);
        document.getElementById('dailyFill').style.width = `${dailyPercent}%`;
        
        // Recent badges
        const badges = data.badges || [];
        const badgeContainer = document.getElementById('recentBadges');
        if (badges.length > 0) {
            badgeContainer.innerHTML = badges.slice(-4).map(b => 
                `<span class="badge-pill">🏅 ${b.replace(/_/g, ' ')}</span>`
            ).join('');
        } else {
            badgeContainer.innerHTML = '<span style="color:#666;font-size:0.8rem;">No badges yet - Play games to earn!</span>';
        }
        
        // Update nav avatar
        const navAvatar = document.getElementById('navAvatar');
        if (navAvatar) navAvatar.src = data.avatar || window.defaultAvatar?.() || '';
        
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

// Refresh dashboard when navigating to home
const originalNavigate = window.navigate;
window.navigate = function(page) {
    if (originalNavigate) originalNavigate(page);
    if (page === 'home') loadDashboard();
};

window.loadDashboard = loadDashboard;
export { loadDashboard };
