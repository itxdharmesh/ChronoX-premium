import { db } from './config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function loadDashboard() {
    const user = window.auth?.currentUser;
    if (!user) return;
    
    try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists()) return;
        const d = snap.data();
        
        // Greeting
        const h = new Date().getHours();
        const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
        const greetEl = document.getElementById('greetingText');
        if (greetEl) greetEl.textContent = `${g}, ${d.name || 'User'} ✨`;
        
        // Stats
        const levelEl = document.getElementById('statLevel');
        const xpEl = document.getElementById('statXP');
        const coinsEl = document.getElementById('statCoins');
        const streakEl = document.getElementById('statStreak');
        if (levelEl) levelEl.textContent = d.level || 1;
        if (xpEl) xpEl.textContent = d.xp || 0;
        if (coinsEl) coinsEl.textContent = d.coins || 0;
        if (streakEl) streakEl.textContent = d.streak || 0;
        
        // XP Bar
        const xpProgress = (d.xp || 0) % 100;
        const xpText = document.getElementById('xpProgressText');
        const xpFill = document.getElementById('xpFill');
        if (xpText) xpText.textContent = `${xpProgress}/100 XP`;
        if (xpFill) xpFill.style.width = `${xpProgress}%`;
        
        // Badges
        const badges = d.badges || [];
        const badgeDiv = document.getElementById('recentBadges');
        if (badgeDiv) {
            badgeDiv.innerHTML = badges.length > 0 
                ? badges.slice(-4).map(b => `<span class="badge-pill">🏅 ${b.replace(/_/g, ' ')}</span>`).join('')
                : '<span style="color:#666;font-size:0.8rem;">No badges yet</span>';
        }
        
        // Avatar in nav
        const navImg = document.getElementById('navAvatar');
        if (navImg) navImg.src = d.avatar || 'https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=35';
        
        // Daily challenge
        const dailyFill = document.getElementById('dailyFill');
        if (dailyFill) dailyFill.style.width = `${Math.min(100, ((d.dailyGamesPlayed || 0) / 3) * 100)}%`;
        
    } catch(e) { console.error(e); }
}

window.loadDashboard = loadDashboard;
export { loadDashboard };
