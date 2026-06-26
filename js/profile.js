import { db } from './config.js';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, writeBatch, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from './utils.js';

function defaultAvatar(name = 'User') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00D4FF&color=fff&size=128`;
}

function getXPForLevel(level) {
    const req = {1:100,2:250,3:450,4:700,5:1000,6:1400,7:1900,8:2500,9:3200,10:4000};
    return req[level] || level * 500;
}

// CRITICAL FIX: openUserProfile now correctly uses the passed uid
async function openUserProfile(uid) {
    if (!uid) {
        showToast('Invalid user', 'error');
        return;
    }
    
    try {
        // Load the SELECTED user's data from Firestore using the passed uid
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            showToast('User not found', 'error');
            return;
        }
        
        // Get the SELECTED user's data (NOT currentUserData)
        const selectedUserData = userDoc.data();
        const container = document.getElementById('profileContainer');
        
        if (container) {
            // Pass the SELECTED uid and SELECTED user data
            renderProfile(container, selectedUserData, uid);
            window.navigate('profile');
        }
    } catch(e) {
        console.error('Error opening profile:', e);
        showToast('Error loading profile', 'error');
    }
}

function renderProfile(container, userData, uid) {
    // Get current user for comparison only
    const currentUser = window.auth?.currentUser;
    const currentUserUid = currentUser?.uid;
    
    // Check if viewing own profile by comparing uids
    const isOwnProfile = (currentUserUid === uid);
    
    const badges = (userData.badges || []).map(b => 
        `<span class="badge-pill" title="${b.replace(/_/g,' ')}">🏅 ${b.replace(/_/g,' ')}</span>`
    ).join('');
    
    const currentLevel = userData.level || 1;
    const currentXP = userData.xp || 0;
    const xpNeeded = getXPForLevel(currentLevel);
    const xpProgress = currentXP % xpNeeded;
    const xpPercent = Math.min(100, (xpProgress / xpNeeded) * 100);
    
    let mutualCount = 0;
    if (!isOwnProfile && window.currentUserData) {
        const userFollowing = new Set(userData.following || []);
        const myFollowing = new Set(window.currentUserData.following || []);
        mutualCount = [...userFollowing].filter(f => myFollowing.has(f)).length;
    }
    
    const joinDate = userData.createdAt?.toDate?.() || new Date();
    
    container.innerHTML = `
        <div class="glass-panel" style="padding:1.5rem;text-align:center;position:relative;">
            <div style="position:relative;display:inline-block;">
                <img src="${userData.avatar || defaultAvatar(userData.name)}" class="profile-avatar" 
                    onclick="${isOwnProfile ? 'window.triggerAvatarUpload()' : `window.openUserProfile('${uid}')`}"
                    onerror="this.src='${defaultAvatar('User')}'">
                ${isOwnProfile ? `
                    <span style="position:absolute;bottom:5px;right:5px;background:var(--neon-blue);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.8rem;" 
                        onclick="window.triggerAvatarUpload()">📷</span>
                ` : ''}
            </div>
            
            <h2 class="neon-text" style="margin-top:1rem;">${userData.name || 'User'}</h2>
            <p style="color:var(--gold);">@${userData.username || 'unknown'}</p>
            <p style="margin:0.5rem 0;color:#ccc;">${userData.bio || 'No bio yet ✨'}</p>
            
            <div style="display:flex;justify-content:center;gap:1.2rem;margin:1rem 0;flex-wrap:wrap;">
                <div><div style="font-weight:bold;color:var(--neon-blue);">⭐ ${currentLevel}</div><div style="font-size:0.65rem;color:#888;">Level</div></div>
                <div><div style="font-weight:bold;color:var(--neon-blue);">✨ ${currentXP}</div><div style="font-size:0.65rem;color:#888;">XP</div></div>
                <div><div style="font-weight:bold;color:var(--gold);">🪙 ${userData.coins||0}</div><div style="font-size:0.65rem;color:#888;">Coins</div></div>
                <div><div style="font-weight:bold;color:#ff4757;">🔥 ${userData.streak||0}</div><div style="font-size:0.65rem;color:#888;">Streak</div></div>
            </div>
            
            <div class="xp-bar" style="margin:0.5rem 0;">
                <div class="xp-fill" style="width:${xpPercent}%;"></div>
            </div>
            <p style="font-size:0.7rem;color:#888;">${xpProgress} / ${xpNeeded} XP to Level ${currentLevel+1}</p>
            
            <div style="margin:1rem 0;cursor:pointer;" onclick="window.showFollowList('followers','${uid}')">
                👥 ${(userData.followers||[]).length} Followers • 🫂 ${(userData.following||[]).length} Following
            </div>
            
            ${mutualCount > 0 ? `<p style="color:var(--neon-blue);">🤝 ${mutualCount} mutual friends</p>` : ''}
            
            <div style="margin:0.8rem 0;display:flex;flex-wrap:wrap;justify-content:center;gap:0.3rem;">
                ${badges || '<span style="color:#666;font-size:0.7rem;">No badges yet</span>'}
            </div>
            
            <p style="font-size:0.7rem;color:#888;">📅 Joined ${joinDate.toLocaleDateString()}</p>
            <p style="font-size:0.75rem;color:${userData.status==='online'?'#2ED573':'#666'};">
                ${userData.status==='online'?'🟢 Online':'⚫ Offline'}
            </p>
            
            ${isOwnProfile ? `
                <div style="display:flex;gap:0.8rem;justify-content:center;margin-top:1.5rem;flex-wrap:wrap;">
                    <button class="btn-glow" onclick="window.openEditProfile()"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-gold" onclick="window.openShop()"><i class="fas fa-store"></i> Shop</button>
                    <button class="btn-glow" onclick="window.openSettings()"><i class="fas fa-cog"></i> Settings</button>
                    <button class="btn-gold" onclick="window.logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
                </div>
            ` : `
                <div style="display:flex;gap:0.8rem;justify-content:center;margin-top:1.5rem;flex-wrap:wrap;">
                    <button class="btn-glow" id="followBtn">${(window.currentUserData?.following||[]).includes(uid)?'Unfollow':'Follow'}</button>
                    <button class="btn-gold" onclick="window.openChat('${uid}')"><i class="fas fa-comment"></i> Message</button>
                    <button class="btn-icon" onclick="window.blockUser('${uid}')" title="Block"><i class="fas fa-ban"></i></button>
                    <button class="btn-icon" onclick="window.reportUser('${uid}')" title="Report">⚠️</button>
                </div>
            `}
        </div>
    `;
    
    if (!isOwnProfile) {
        setTimeout(() => {
            document.getElementById('followBtn')?.addEventListener('click', () => toggleFollow(uid));
        }, 100);
    }
}

async function renderOwnProfile() {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) return;
    
    // Load own profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
        const container = document.getElementById('profileContainer');
        if (container) {
            renderProfile(container, userDoc.data(), currentUser.uid);
        }
    }
}

async function toggleFollow(targetUid) {
    const currentUser = window.auth?.currentUser;
    if (!currentUser || currentUser.uid === targetUid) return;
    
    try {
        const myRef = doc(db, 'users', currentUser.uid);
        const targetRef = doc(db, 'users', targetUid);
        const batch = writeBatch(db);
        
        // Load current user data from Firestore
        const myDoc = await getDoc(myRef);
        const myData = myDoc.data();
        
        if ((myData.following || []).includes(targetUid)) {
            batch.update(myRef, { following: arrayRemove(targetUid) });
            batch.update(targetRef, { followers: arrayRemove(currentUser.uid) });
        } else {
            batch.update(myRef, { following: arrayUnion(targetUid) });
            batch.update(targetRef, { followers: arrayUnion(currentUser.uid) });
            // Track daily task progress
            updateDailyTaskProgress('follow_user', currentUser.uid);
        }
        
        await batch.commit();
        
        // Update local cache
        window.currentUserData = myData;
        
        showToast('Updated!', 'success');
        setTimeout(() => openUserProfile(targetUid), 300);
    } catch(e) { 
        console.error('Toggle follow error:', e);
        showToast('Error', 'error'); 
    }
}

// EDIT PROFILE
function openEditProfile() {
    const modal = document.createElement('div');
    modal.className = 'glass-panel';
    modal.id = 'editProfileModal';
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;padding:2rem;min-width:300px;max-height:80vh;overflow-y:auto;';
    modal.innerHTML = `
        <h3 class="neon-text">✏️ Edit Profile</h3>
        <input id="editName" class="auth-input" placeholder="Name" value="${window.currentUserData?.name||''}" style="padding-left:1rem;">
        <input id="editUsername" class="auth-input" placeholder="Username" value="${window.currentUserData?.username||''}" style="padding-left:1rem;">
        <textarea id="editBio" class="auth-input" placeholder="Bio" style="padding-left:1rem;height:80px;">${window.currentUserData?.bio||''}</textarea>
        <div style="display:flex;gap:0.5rem;margin-top:1rem;">
            <button class="btn-glow" onclick="window.saveProfile()">💾 Save</button>
            <button class="btn-gold" onclick="document.getElementById('editProfileModal').remove()">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
}

async function saveProfile() {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) return;
    
    const name = document.getElementById('editName')?.value.trim();
    const username = document.getElementById('editUsername')?.value.trim().toLowerCase();
    const bio = document.getElementById('editBio')?.value.trim();
    
    if (!name || !username) { showToast('Name and username required', 'error'); return; }
    
    try {
        await updateDoc(doc(db, 'users', currentUser.uid), { name, username, bio });
        window.currentUserData = { ...window.currentUserData, name, username, bio };
        showToast('Profile updated! ✅', 'success');
        document.getElementById('editProfileModal')?.remove();
        setTimeout(() => renderOwnProfile(), 300);
    } catch(e) { showToast('Error saving', 'error'); }
}

// AVATAR UPLOAD
function triggerAvatarUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const maxSize = 200;
                let w = img.width, h = img.height;
                if (w > h) { if (w > maxSize) { h *= maxSize/w; w = maxSize; } }
                else { if (h > maxSize) { w *= maxSize/h; h = maxSize; } }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                
                await updateDoc(doc(db, 'users', window.auth.currentUser.uid), { avatar: dataUrl });
                window.currentUserData = { ...window.currentUserData, avatar: dataUrl };
                showToast('Avatar updated! 📷', 'success');
                setTimeout(() => renderOwnProfile(), 300);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

// SHOP
function openShop() {
    const items = [
        { name: 'Gold Border', icon: '🟡', price: 500 },
        { name: 'Neon Frame', icon: '💠', price: 750 },
        { name: 'Crown Badge', icon: '👑', price: 1000 },
        { name: 'Diamond Theme', icon: '💎', price: 1500 },
        { name: 'Fire Effect', icon: '🔥', price: 600 },
        { name: 'Star Bubble', icon: '⭐', price: 300 }
    ];
    
    const modal = document.createElement('div');
    modal.className = 'glass-panel';
    modal.id = 'shopModal';
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;padding:1.5rem;min-width:300px;max-height:80vh;overflow-y:auto;';
    modal.innerHTML = `
        <h3 class="neon-text">🛍️ Premium Shop</h3>
        <p style="color:var(--gold);margin-bottom:1rem;">🪙 Balance: ${window.currentUserData?.coins||0}</p>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.8rem;">
            ${items.map(item => `
                <div class="glass-panel shop-item" style="padding:0.8rem;text-align:center;">
                    <div style="font-size:2rem;">${item.icon}</div>
                    <p style="font-size:0.8rem;">${item.name}</p>
                    <p style="color:var(--gold);font-size:0.7rem;">🪙 ${item.price}</p>
                    <button class="btn-glow" style="padding:0.3rem 0.8rem;font-size:0.7rem;margin-top:0.3rem;" 
                        onclick="window.buyItem('${item.name}',${item.price})">Buy</button>
                </div>
            `).join('')}
        </div>
        <button class="btn-gold" style="width:100%;margin-top:1rem;" onclick="document.getElementById('shopModal').remove()">Close</button>
    `;
    document.body.appendChild(modal);
}

async function buyItem(itemName, price) {
    const user = window.auth?.currentUser;
    if (!user) return;
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) return;
    const data = snap.data();
    if ((data.coins||0) < price) { showToast('Not enough coins!', 'error'); return; }
    
    const owned = data.ownedItems || [];
    if (owned.includes(itemName)) { showToast('Already owned!', 'info'); return; }
    
    await updateDoc(doc(db, 'users', user.uid), {
        coins: (data.coins||0) - price,
        ownedItems: arrayUnion(itemName)
    });
    window.currentUserData = { ...window.currentUserData, coins: (data.coins||0)-price, ownedItems: [...owned, itemName] };
    showToast(`Purchased ${itemName}! 🎉`, 'success');
    document.getElementById('shopModal')?.remove();
}

// SETTINGS
function openSettings() {
    const modal = document.createElement('div');
    modal.className = 'glass-panel';
    modal.id = 'settingsModal';
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;padding:1.5rem;min-width:300px;';
    modal.innerHTML = `
        <h3 class="neon-text">⚙️ Settings</h3>
        <label style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;">
            <span>🔒 Private Account</span>
            <input type="checkbox" id="privateAccount" ${window.currentUserData?.isPrivate?'checked':''} onchange="window.togglePrivacy()">
        </label>
        <label style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;">
            <span>👻 Hide Online Status</span>
            <input type="checkbox" id="hideStatus" ${window.currentUserData?.hideStatus?'checked':''} onchange="window.toggleStatus()">
        </label>
        <button class="btn-gold" style="width:100%;margin-top:1rem;" onclick="document.getElementById('settingsModal').remove()">Close</button>
    `;
    document.body.appendChild(modal);
}

async function togglePrivacy() {
    const isPrivate = document.getElementById('privateAccount')?.checked;
    await updateDoc(doc(db, 'users', window.auth.currentUser.uid), { isPrivate });
    window.currentUserData = { ...window.currentUserData, isPrivate };
}

async function toggleStatus() {
    const hideStatus = document.getElementById('hideStatus')?.checked;
    await updateDoc(doc(db, 'users', window.auth.currentUser.uid), { hideStatus });
    window.currentUserData = { ...window.currentUserData, hideStatus };
}

async function blockUser(uid) {
    if (!confirm('Block this user?')) return;
    await updateDoc(doc(db, 'users', window.auth.currentUser.uid), { blockedUsers: arrayUnion(uid) });
    showToast('User blocked', 'info');
}

async function reportUser(uid) {
    const reason = prompt('Reason for reporting:');
    if (!reason) return;
    const { addDoc, collection } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    await addDoc(collection(db, 'reports'), { reportedUser:uid, reportedBy:window.auth.currentUser.uid, reason, timestamp:new Date() });
    showToast('Report submitted', 'success');
}

async function showFollowList(type, uid) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) return;
        const list = type==='followers' ? (userDoc.data().followers||[]) : (userDoc.data().following||[]);
        if (!list.length) { showToast(`No ${type}`, 'info'); return; }
        
        const modal = document.createElement('div');
        modal.className = 'glass-panel';
        modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;padding:1rem;min-width:250px;max-height:60vh;overflow-y:auto;';
        modal.innerHTML = `<h4 class="neon-text">${type==='followers'?'Followers':'Following'} (${list.length})</h4><div id="flContent"></div><button class="btn-glow" style="width:100%;margin-top:0.5rem;" onclick="this.parentElement.remove()">Close</button>`;
        document.body.appendChild(modal);
        
        const container = modal.querySelector('#flContent');
        for (const userId of list.slice(0,20)) {
            const uDoc = await getDoc(doc(db, 'users', userId));
            if (uDoc.exists()) {
                const u = uDoc.data();
                const div = document.createElement('div');
                div.className = 'follow-list-item';
                div.style.cssText = 'display:flex;align-items:center;gap:0.8rem;padding:0.6rem;cursor:pointer;border-radius:1rem;';
                div.onclick = function() {
                    modal.remove();
                    window.openUserProfile(userId);
                };
                div.innerHTML = `
                    <img src="${u.avatar||defaultAvatar(u.name)}" width="35" height="35" style="border-radius:50%;">
                    <div><strong>${u.name}</strong><p style="font-size:0.7rem;color:#aaa;">@${u.username}</p></div>
                `;
                container.appendChild(div);
            }
        }
    } catch(e) { console.error(e); }
}

// Daily Task Progress Tracker
async function updateDailyTaskProgress(taskType, uid) {
    try {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) return;
        const data = snap.data();
        const dailyTasks = data.dailyTasks || {};
        
        if (taskType === 'follow_user') {
            dailyTasks.follow_user = (dailyTasks.follow_user || 0) + 1;
        }
        
        await updateDoc(userRef, { dailyTasks });
    } catch(e) { console.error(e); }
}

window.openUserProfile = openUserProfile;
window.renderOwnProfile = renderOwnProfile;
window.openEditProfile = openEditProfile;
window.saveProfile = saveProfile;
window.triggerAvatarUpload = triggerAvatarUpload;
window.openShop = openShop;
window.buyItem = buyItem;
window.openSettings = openSettings;
window.togglePrivacy = togglePrivacy;
window.toggleStatus = toggleStatus;
window.blockUser = blockUser;
window.reportUser = reportUser;
window.showFollowList = showFollowList;

export { openUserProfile, renderOwnProfile };
