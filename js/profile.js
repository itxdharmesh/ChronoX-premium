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

// ✅ FIXED: ab selected user ka UID use hota hai
async function openUserProfile(uid) {
    if (!uid) {
        showToast('Invalid user', 'error');
        return;
    }
    
    try {
        // Firestore se SELECTED USER ka data load karo
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            showToast('User not found', 'error');
            return;
        }
        
        // ✅ SELECTED USER KA DATA (currentUserData nahi)
        const selectedUserData = userDoc.data();
        const container = document.getElementById('profileContainer');
        
        if (container) {
            // ✅ uid = selected user ka Firestore document ID
            renderProfile(container, selectedUserData, uid);
            window.navigate('profile');
        }
    } catch(e) {
        console.error('Error:', e);
        showToast('Error loading profile', 'error');
    }
}

function renderProfile(container, userData, uid) {
    const currentUser = window.auth?.currentUser;
    const currentUserUid = currentUser?.uid;
    
    // ✅ Compare karo - currentUser.uid vs selected uid
    const isOwnProfile = (currentUserUid === uid);
    
    const badges = (userData.badges || []).map(b => 
        `<span class="badge-pill">🏅 ${b.replace(/_/g,' ')}</span>`
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
            <p style="font-size:0.7rem;color:#888;">${xpProgress} / ${xpNeeded} XP</p>
            
            <div style="margin:1rem 0;">👥 ${(userData.followers||[]).length} Followers • 🫂 ${(userData.following||[]).length} Following</div>
            ${mutualCount > 0 ? `<p style="color:var(--neon-blue);">🤝 ${mutualCount} mutual friends</p>` : ''}
            
            <div style="margin:0.8rem 0;display:flex;flex-wrap:wrap;justify-content:center;gap:0.3rem;">${badges || '<span style="color:#666;font-size:0.7rem;">No badges</span>'}</div>
            <p style="font-size:0.7rem;color:#888;">📅 Joined ${joinDate.toLocaleDateString()}</p>
            
            ${isOwnProfile ? `
                <button class="btn-glow" onclick="window.openEditProfile()">✏️ Edit</button>
                <button class="btn-gold" onclick="window.logout()">🚪 Logout</button>
            ` : `
                <button class="btn-glow" id="followBtn">${(window.currentUserData?.following||[]).includes(uid)?'Unfollow':'Follow'}</button>
                <button class="btn-gold" onclick="window.openChat('${uid}')">💬 Message</button>
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
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
        renderProfile(document.getElementById('profileContainer'), userDoc.data(), currentUser.uid);
    }
}

async function toggleFollow(targetUid) {
    const currentUser = window.auth?.currentUser;
    if (!currentUser || currentUser.uid === targetUid) return;
    try {
        const myRef = doc(db, 'users', currentUser.uid);
        const targetRef = doc(db, 'users', targetUid);
        const batch = writeBatch(db);
        const myDoc = await getDoc(myRef);
        const myData = myDoc.data();
        
        if ((myData.following||[]).includes(targetUid)) {
            batch.update(myRef, { following: arrayRemove(targetUid) });
            batch.update(targetRef, { followers: arrayRemove(currentUser.uid) });
        } else {
            batch.update(myRef, { following: arrayUnion(targetUid) });
            batch.update(targetRef, { followers: arrayUnion(currentUser.uid) });
        }
        await batch.commit();
        window.currentUserData = myData;
        showToast('Updated!', 'success');
        setTimeout(() => openUserProfile(targetUid), 300);
    } catch(e) { showToast('Error', 'error'); }
}

function openEditProfile() {
    const modal = document.createElement('div');
    modal.className = 'glass-panel';
    modal.id = 'editProfileModal';
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;padding:2rem;min-width:300px;';
    modal.innerHTML = `
        <h3 class="neon-text">✏️ Edit Profile</h3>
        <input id="editName" class="auth-input" placeholder="Name" value="${window.currentUserData?.name||''}" style="padding-left:1rem;">
        <input id="editUsername" class="auth-input" placeholder="Username" value="${window.currentUserData?.username||''}" style="padding-left:1rem;">
        <textarea id="editBio" class="auth-input" placeholder="Bio" style="padding-left:1rem;height:80px;">${window.currentUserData?.bio||''}</textarea>
        <button class="btn-glow" onclick="window.saveProfile()" style="margin-top:1rem;">💾 Save</button>
        <button class="btn-gold" onclick="document.getElementById('editProfileModal').remove()" style="margin-top:0.5rem;">Cancel</button>
    `;
    document.body.appendChild(modal);
}

async function saveProfile() {
    const name = document.getElementById('editName')?.value.trim();
    const username = document.getElementById('editUsername')?.value.trim().toLowerCase();
    const bio = document.getElementById('editBio')?.value.trim();
    if (!name || !username) { showToast('Name and username required', 'error'); return; }
    await updateDoc(doc(db, 'users', window.auth.currentUser.uid), { name, username, bio });
    window.currentUserData = { ...window.currentUserData, name, username, bio };
    showToast('Saved!', 'success');
    document.getElementById('editProfileModal')?.remove();
    renderOwnProfile();
}

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
                showToast('Avatar updated!', 'success');
                renderOwnProfile();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

window.openUserProfile = openUserProfile;
window.renderOwnProfile = renderOwnProfile;
window.openEditProfile = openEditProfile;
window.saveProfile = saveProfile;
window.triggerAvatarUpload = triggerAvatarUpload;

export { openUserProfile, renderOwnProfile };
