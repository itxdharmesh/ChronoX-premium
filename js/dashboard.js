import { db } from './config.js';
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from './utils.js';

// XP Requirements per level
const XP_PER_LEVEL = {
    1: 100, 2: 250, 3: 450, 4: 700, 5: 1000,
    6: 1400, 7: 1900, 8: 2500, 9: 3200, 10: 4000
};

function getXPForLevel(level) {
    return XP_PER_LEVEL[level] || (level * 500);
}

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
        
        const currentLevel = d.level || 1;
        const currentXP = d.xp || 0;
        const xpNeeded = getXPForLevel(currentLevel);
        const xpProgress = currentXP % xpNeeded;
        
        if (levelEl) levelEl.textContent = currentLevel;
        if (xpEl) xpEl.textContent = currentXP;
        if (coinsEl) coinsEl.textContent = d.coins || 0;
        if (streakEl) streakEl.textContent = d.streak || 0;
        
        // XP Progress Bar
        const xpText = document.getElementById('xpProgressText');
        const xpFill = document.getElementById('xpFill');
        const xpPercent = Math.min(100, (xpProgress / xpNeeded) * 100);
        
        if (xpText) xpText.textContent = `${xpProgress} / ${xpNeeded} XP`;
        if (xpFill) xpFill.style.width = `${xpPercent}%`;
        
        // Badges
        const badges = d.badges || [];
        const badgeDiv = document.getElementById('recentBadges');
        if (badgeDiv) {
            badgeDiv.innerHTML = badges.length > 0 
                ? badges.slice(-4).map(b => `<span class="badge-pill">🏅 ${b.replace(/_/g, ' ')}</span>`).join('')
                : '<span style="color:#666;font-size:0.8rem;">No badges yet - Play games to earn!</span>';
        }
        
        // Nav Avatar
        const navImg = document.getElementById('navAvatar');
        if (navImg) navImg.src = d.avatar || 'https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=35';
        
        // Daily Challenge
        const dailyFill = document.getElementById('dailyFill');
        if (dailyFill) dailyFill.style.width = `${Math.min(100, ((d.dailyGamesPlayed || 0) / 3) * 100)}%`;
        
        // Daily Reward Check
        checkDailyReward(d);
        
    } catch(e) { console.error('Dashboard error:', e); }
}

// Daily Reward System
async function checkDailyReward(userData) {
    const dailyBtn = document.getElementById('dailyRewardBtn');
    if (!dailyBtn) return;
    
    const lastClaim = userData.lastDailyClaim?.toDate?.() || null;
    const now = new Date();
    
    if (lastClaim) {
        const hoursSince = (now - lastClaim) / (1000 * 60 * 60);
        if (hoursSince < 24) {
            const remaining = 24 - hoursSince;
            const hours = Math.floor(remaining);
            const mins = Math.floor((remaining - hours) * 60);
            dailyBtn.textContent = `⏳ ${hours}h ${mins}m`;
            dailyBtn.disabled = true;
            dailyBtn.style.opacity = '0.5';
            return;
        }
    }
    
    dailyBtn.textContent = '🎁 Claim Daily Reward';
    dailyBtn.disabled = false;
    dailyBtn.style.opacity = '1';
    dailyBtn.onclick = () => claimDailyReward();
}

async function claimDailyReward() {
    const user = window.auth?.currentUser;
    if (!user) return;
    
    // Random rewards
    const coinsReward = Math.floor(Math.random() * 31) + 20; // 20-50
    const xpReward = Math.floor(Math.random() * 21) + 10; // 10-30
    
    try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) return;
        
        const data = snap.data();
        const newCoins = (data.coins || 0) + coinsReward;
        const newXP = (data.xp || 0) + xpReward;
        
        await updateDoc(userRef, {
            coins: newCoins,
            xp: newXP,
            lastDailyClaim: serverTimestamp()
        });
        
        // Show reward popup
        showDailyRewardPopup(coinsReward, xpReward);
        
        // Reload dashboard
        setTimeout(() => loadDashboard(), 500);
        
    } catch(e) { console.error('Daily reward error:', e); }
}

function showDailyRewardPopup(coins, xp) {
    const popup = document.createElement('div');
    popup.className = 'daily-reward-popup glass-panel';
    popup.innerHTML = `
        <div style="text-align:center;padding:1.5rem;">
            <div style="font-size:3rem;margin-bottom:0.5rem;">🎉</div>
            <h3 style="color:var(--neon-blue);margin-bottom:1rem;">Daily Reward Claimed!</h3>
            <div style="display:flex;justify-content:center;gap:2rem;margin:1rem 0;">
                <div><span style="font-size:1.5rem;color:var(--gold);">🪙 +${coins}</span></div>
                <div><span style="font-size:1.5rem;color:var(--neon-blue);">⭐ +${xp} XP</span></div>
            </div>
            <button class="btn-glow" onclick="this.parentElement.parentElement.remove()" style="margin-top:1rem;">Awesome!</button>
        </div>
    `;
    popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;min-width:280px;';
    document.body.appendChild(popup);
}

window.loadDashboard = loadDashboard;
window.claimDailyReward = claimDailyReward;
export { loadDashboard, getXPForLevel };
