import { db } from './config.js';
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from './utils.js';

function getXPForLevel(level) {
    const req = {1:100,2:250,3:450,4:700,5:1000,6:1400,7:1900,8:2500,9:3200,10:4000};
    return req[level] || level * 500;
}

// 4 Daily Tasks
const DAILY_TASKS = [
    { id: 'play_games', name: 'Play 2 Games', target: 2, icon: '🎮', rewardXP: 20, rewardCoins: 20 },
    { id: 'send_messages', name: 'Send 10 Messages', target: 10, icon: '💬', rewardXP: 25, rewardCoins: 25 },
    { id: 'search_users', name: 'Search 5 Users', target: 5, icon: '🔍', rewardXP: 20, rewardCoins: 20 },
    { id: 'follow_user', name: 'Follow 1 User', target: 1, icon: '👥', rewardXP: 30, rewardCoins: 30 }
];

async function loadDashboard() {
    const user = window.auth?.currentUser;
    if (!user) return;
    
    try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists()) return;
        const d = snap.data();
        
        const h = new Date().getHours();
        const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
        const greetEl = document.getElementById('greetingText');
        if (greetEl) greetEl.textContent = `${g}, ${d.name || 'User'} ✨`;
        
        const currentLevel = d.level || 1;
        const currentXP = d.xp || 0;
        const xpNeeded = getXPForLevel(currentLevel);
        const xpProgress = currentXP % xpNeeded;
        
        document.getElementById('statLevel').textContent = currentLevel;
        document.getElementById('statXP').textContent = currentXP;
        document.getElementById('statCoins').textContent = d.coins || 0;
        document.getElementById('statStreak').textContent = d.streak || 0;
        
        document.getElementById('xpProgressText').textContent = `${xpProgress} / ${xpNeeded} XP`;
        document.getElementById('xpFill').style.width = `${Math.min(100,(xpProgress/xpNeeded)*100)}%`;
        
        const badges = d.badges || [];
        const badgeDiv = document.getElementById('recentBadges');
        if (badgeDiv) {
            badgeDiv.innerHTML = badges.length > 0 
                ? badges.slice(-4).map(b => `<span class="badge-pill">🏅 ${b.replace(/_/g,' ')}</span>`).join('')
                : '<span style="color:#666;font-size:0.8rem;">No badges yet</span>';
        }
        
        document.getElementById('navAvatar').src = d.avatar || 'https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=35';
        
        // Daily Reward
        checkDailyReward(d);
        
        // Render Daily Tasks
        renderDailyTasks(d);
        
    } catch(e) { console.error(e); }
}

function renderDailyTasks(userData) {
    const tasksContainer = document.getElementById('dailyTasksContainer');
    if (!tasksContainer) return;
    
    const dailyTasks = userData.dailyTasks || {};
    const lastReset = userData.lastTaskReset?.toDate?.() || new Date(0);
    const now = new Date();
    
    // Reset tasks if 24 hours passed
    if ((now - lastReset) > 86400000) {
        resetDailyTasks();
    }
    
    tasksContainer.innerHTML = DAILY_TASKS.map(task => {
        const progress = dailyTasks[task.id] || 0;
        const completed = progress >= task.target;
        const claimed = dailyTasks[`${task.id}_claimed`] || false;
        const percent = Math.min(100, (progress / task.target) * 100);
        
        return `
            <div class="glass-panel" style="padding:0.8rem;margin:0.5rem 0;">
                <div style="display:flex;align-items:center;gap:0.8rem;">
                    <span style="font-size:1.5rem;">${task.icon}</span>
                    <div style="flex:1;">
                        <div style="display:flex;justify-content:space-between;">
                            <span style="font-size:0.8rem;">${task.name}</span>
                            <span style="font-size:0.7rem;color:#888;">${progress}/${task.target}</span>
                        </div>
                        <div class="xp-bar" style="margin:0.3rem 0;height:4px;">
                            <div class="xp-fill" style="width:${percent}%;background:${completed?'linear-gradient(90deg,#2ED573,#7bed9f)':'linear-gradient(90deg,var(--neon-blue),#7C3AED)'};"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <span style="font-size:0.6rem;color:#888;">+${task.rewardXP} XP • +${task.rewardCoins} 🪙</span>
                            ${completed && !claimed ? 
                                `<button class="btn-glow" style="padding:0.2rem 0.6rem;font-size:0.6rem;" onclick="window.claimTaskReward('${task.id}',${task.rewardXP},${task.rewardCoins})">Claim</button>` :
                                claimed ? '<span style="color:#2ED573;font-size:0.7rem;">✅</span>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function resetDailyTasks() {
    const user = window.auth?.currentUser;
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
        dailyTasks: {},
        lastTaskReset: serverTimestamp()
    });
}

async function claimTaskReward(taskId, xpReward, coinReward) {
    const user = window.auth?.currentUser;
    if (!user) return;
    
    try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) return;
        const data = snap.data();
        const dailyTasks = data.dailyTasks || {};
        
        if (dailyTasks[`${taskId}_claimed`]) {
            showToast('Already claimed!', 'info');
            return;
        }
        
        await updateDoc(userRef, {
            xp: (data.xp||0) + xpReward,
            coins: (data.coins||0) + coinReward,
            [`dailyTasks.${taskId}_claimed`]: true
        });
        
        showToast(`Reward claimed! +${xpReward} XP +${coinReward} Coins`, 'success');
        loadDashboard();
    } catch(e) { console.error(e); }
}

async function checkDailyReward(userData) {
    const dailyBtn = document.getElementById('dailyRewardBtn');
    if (!dailyBtn) return;
    
    const lastClaim = userData.lastDailyClaim?.toDate?.() || null;
    const now = new Date();
    
    if (lastClaim) {
        const hoursSince = (now - lastClaim) / (1000 * 60 * 60);
        if (hoursSince < 24) {
            const remaining = 24 - hoursSince;
            const hrs = Math.floor(remaining);
            const mins = Math.floor((remaining - hrs) * 60);
            dailyBtn.textContent = `⏳ ${hrs}h ${mins}m`;
            dailyBtn.disabled = true;
            dailyBtn.style.opacity = '0.5';
            return;
        }
    }
    
    dailyBtn.textContent = '🎁 Claim Daily Reward';
    dailyBtn.disabled = false;
    dailyBtn.style.opacity = '1';
    dailyBtn.onclick = claimDailyReward;
}

async function claimDailyReward() {
    const user = window.auth?.currentUser;
    if (!user) return;
    
    const coinsReward = Math.floor(Math.random() * 31) + 20;
    const xpReward = Math.floor(Math.random() * 21) + 10;
    
    try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) return;
        const data = snap.data();
        
        await updateDoc(userRef, {
            coins: (data.coins||0) + coinsReward,
            xp: (data.xp||0) + xpReward,
            lastDailyClaim: serverTimestamp()
        });
        
        const popup = document.createElement('div');
        popup.className = 'glass-panel daily-reward-popup';
        popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;min-width:280px;text-align:center;padding:1.5rem;';
        popup.innerHTML = `
            <div style="font-size:3rem;">🎉</div>
            <h3 style="color:var(--neon-blue);">Daily Reward!</h3>
            <div style="display:flex;justify-content:center;gap:2rem;margin:1rem 0;">
                <span style="color:var(--gold);font-size:1.3rem;">🪙 +${coinsReward}</span>
                <span style="color:var(--neon-blue);font-size:1.3rem;">⭐ +${xpReward} XP</span>
            </div>
            <button class="btn-glow" onclick="this.parentElement.remove();window.loadDashboard();">Awesome!</button>
        `;
        document.body.appendChild(popup);
        
    } catch(e) { console.error(e); }
}

// Track search for daily task
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchCount = 0;
        searchInput.addEventListener('input', () => {
            searchCount++;
            if (searchCount >= 5) {
                updateSearchTask();
            }
        });
    }
});

async function updateSearchTask() {
    const user = window.auth?.currentUser;
    if (!user) return;
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) return;
    const data = snap.data();
    const dailyTasks = data.dailyTasks || {};
    dailyTasks.search_users = Math.min(5, (dailyTasks.search_users || 0) + 1);
    await updateDoc(doc(db, 'users', user.uid), { dailyTasks });
}

window.loadDashboard = loadDashboard;
window.claimDailyReward = claimDailyReward;
window.claimTaskReward = claimTaskReward;

export { loadDashboard, getXPForLevel };
