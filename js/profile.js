import { db } from './config.js';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from './utils.js';

function defaultAvatar(name) {
    name = name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00D4FF&color=fff&size=128`;
}

function getXPForLevel(level) {
    var req = {1:100,2:250,3:450,4:700,5:1000,6:1400,7:1900,8:2500,9:3200,10:4000};
    return req[level] || level * 500;
}

// ✅ BRAND NEW openUserProfile
async function openUserProfile(viewUid) {
    console.log('🔍 Opening profile for UID:', viewUid);
    
    if (!viewUid) {
        showToast('Invalid user', 'error');
        return;
    }
    
    try {
        // LOAD FROM FIRESTORE using viewUid
        var userDocRef = doc(db, 'users', viewUid);
        var userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            showToast('User not found', 'error');
            return;
        }
        
        // THIS IS THE SELECTED USER'S DATA
        var profileData = userDoc.data();
        var container = document.getElementById('profileContainer');
        
        if (container) {
            // RENDER WITH CORRECT UID
            buildProfileUI(container, profileData, viewUid);
            window.navigate('profile');
        }
    } catch(err) {
        console.error('Error:', err);
        showToast('Error loading profile', 'error');
    }
}

// ✅ BRAND NEW render function
function buildProfileUI(container, profileData, profileUid) {
    // Get current user for comparison
    var me = window.auth?.currentUser;
    var myUid = me ? me.uid : null;
    
    // IS THIS MY OWN PROFILE?
    var isMine = (myUid === profileUid);
    
    // Badges
    var badgesHTML = '';
    var badges = profileData.badges || [];
    if (badges.length > 0) {
        badges.forEach(function(b) {
            badgesHTML += '<span class="badge-pill">🏅 ' + b.replace(/_/g, ' ') + '</span>';
        });
    } else {
        badgesHTML = '<span style="color:#666;font-size:0.7rem;">No badges yet</span>';
    }
    
    // Level & XP
    var lvl = profileData.level || 1;
    var xp = profileData.xp || 0;
    var xpNeed = getXPForLevel(lvl);
    var xpProg = xp % xpNeed;
    var xpPct = Math.min(100, (xpProg / xpNeed) * 100);
    
    // Mutual friends
    var mutual = 0;
    if (!isMine && window.currentUserData) {
        var theirFollowing = profileData.following || [];
        var myFollowing = window.currentUserData.following || [];
        theirFollowing.forEach(function(f) {
            if (myFollowing.indexOf(f) !== -1) mutual++;
        });
    }
    
    // Join date
    var joinDate = 'Unknown';
    if (profileData.createdAt && profileData.createdAt.toDate) {
        joinDate = profileData.createdAt.toDate().toLocaleDateString();
    }
    
    // Online status
    var statusDot = profileData.status === 'online' ? '🟢 Online' : '⚫ Offline';
    var statusColor = profileData.status === 'online' ? '#2ED573' : '#666';
    
    // Followers/Following
    var followersCount = (profileData.followers || []).length;
    var followingCount = (profileData.following || []).length;
    
    // Avatar
    var avatarUrl = profileData.avatar || defaultAvatar(profileData.name);
    
    // BUILD HTML
    var html = '';
    html += '<div class="glass-panel" style="padding:1.5rem;text-align:center;position:relative;">';
    
    // Report button for others
    if (!isMine) {
        html += '<button style="position:absolute;top:10px;right:10px;background:none;border:none;color:#ff4757;font-size:1rem;z-index:5;" onclick="window.reportUser(\'' + profileUid + '\')">⚠️</button>';
    }
    
    // Avatar
    html += '<div style="position:relative;display:inline-block;">';
    html += '<img src="' + avatarUrl + '" class="profile-avatar" onerror="this.src=\'' + defaultAvatar('User') + '\'" style="cursor:pointer;" onclick="';
    if (isMine) {
        html += 'window.triggerAvatarUpload()';
    } else {
        html += 'window.openUserProfile(\'' + profileUid + '\')';
    }
    html += '">';
    
    // Camera icon for own profile
    if (isMine) {
        html += '<span style="position:absolute;bottom:5px;right:5px;background:var(--neon-blue);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.8rem;" onclick="window.triggerAvatarUpload()">📷</span>';
    }
    html += '</div>';
    
    // Name & Username
    html += '<h2 class="neon-text" style="margin-top:1rem;">' + (profileData.name || 'User') + '</h2>';
    html += '<p style="color:var(--gold);">@' + (profileData.username || 'unknown') + '</p>';
    html += '<p style="margin:0.5rem 0;color:#ccc;">' + (profileData.bio || 'No bio yet ✨') + '</p>';
    
    // Stats
    html += '<div style="display:flex;justify-content:center;gap:1.2rem;margin:1rem 0;flex-wrap:wrap;">';
    html += '<div><div style="font-weight:bold;color:var(--neon-blue);">⭐ ' + lvl + '</div><div style="font-size:0.65rem;color:#888;">Level</div></div>';
    html += '<div><div style="font-weight:bold;color:var(--neon-blue);">✨ ' + xp + '</div><div style="font-size:0.65rem;color:#888;">XP</div></div>';
    html += '<div><div style="font-weight:bold;color:var(--gold);">🪙 ' + (profileData.coins||0) + '</div><div style="font-size:0.65rem;color:#888;">Coins</div></div>';
    html += '<div><div style="font-weight:bold;color:#ff4757;">🔥 ' + (profileData.streak||0) + '</div><div style="font-size:0.65rem;color:#888;">Streak</div></div>';
    html += '</div>';
    
    // XP Bar
    html += '<div class="xp-bar" style="margin:0.5rem 0;"><div class="xp-fill" style="width:' + xpPct + '%;"></div></div>';
    html += '<p style="font-size:0.7rem;color:#888;">' + xpProg + ' / ' + xpNeed + ' XP to Level ' + (lvl+1) + '</p>';
    
    // Followers/Following
    html += '<div style="margin:1rem 0;cursor:pointer;" onclick="window.showFollowList(\'followers\',\'' + profileUid + '\')">';
    html += '👥 ' + followersCount + ' Followers • 🫂 ' + followingCount + ' Following';
    html += '</div>';
    
    // Mutual friends
    if (mutual > 0) {
        html += '<p style="color:var(--neon-blue);">🤝 ' + mutual + ' mutual friends</p>';
    }
    
    // Badges
    html += '<div style="margin:0.8rem 0;display:flex;flex-wrap:wrap;justify-content:center;gap:0.3rem;">' + badgesHTML + '</div>';
    
    // Join date & Status
    html += '<p style="font-size:0.7rem;color:#888;">📅 Joined ' + joinDate + '</p>';
    html += '<p style="font-size:0.75rem;color:' + statusColor + ';">' + statusDot + '</p>';
    
    // Buttons
    html += '<div style="display:flex;gap:0.5rem;justify-content:center;margin-top:1.5rem;flex-wrap:wrap;">';
    
    if (isMine) {
        html += '<button class="btn-glow" onclick="window.openEditProfile()"><i class="fas fa-edit"></i> Edit</button>';
        html += '<button class="btn-gold" onclick="window.openShop()"><i class="fas fa-store"></i> Shop</button>';
        html += '<button class="btn-glow" onclick="window.openSettings()"><i class="fas fa-cog"></i> Settings</button>';
        html += '<button class="btn-gold" onclick="window.logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>';
    } else {
        var isFollowing = (window.currentUserData?.following || []).indexOf(profileUid) !== -1;
        html += '<button class="btn-glow" id="profileFollowBtn">' + (isFollowing ? '<i class="fas fa-user-minus"></i> Unfollow' : '<i class="fas fa-user-plus"></i> Follow') + '</button>';
        html += '<button class="btn-gold" onclick="window.openChat(\'' + profileUid + '\')"><i class="fas fa-comment"></i> Message</button>';
        html += '<button class="btn-icon" onclick="window.blockUser(\'' + profileUid + '\')" title="Block"><i class="fas fa-ban"></i></button>';
    }
    
    html += '</div>';
    html += '</div>';
    
    container.innerHTML = html;
    
    // Add follow button listener for other profiles
    if (!isMine) {
        setTimeout(function() {
            var btn = document.getElementById('profileFollowBtn');
            if (btn) {
                btn.addEventListener('click', function() {
                    toggleFollow(profileUid);
                });
            }
        }, 200);
    }
}

// Render own profile
async function renderOwnProfile() {
    var me = window.auth?.currentUser;
    if (!me) return;
    var docSnap = await getDoc(doc(db, 'users', me.uid));
    if (docSnap.exists()) {
        buildProfileUI(document.getElementById('profileContainer'), docSnap.data(), me.uid);
    }
}

// Toggle follow
async function toggleFollow(targetUid) {
    var me = window.auth?.currentUser;
    if (!me || me.uid === targetUid) return;
    
    try {
        var myRef = doc(db, 'users', me.uid);
        var targetRef = doc(db, 'users', targetUid);
        var batch = writeBatch(db);
        var myDoc = await getDoc(myRef);
        var myData = myDoc.data();
        
        if ((myData.following || []).indexOf(targetUid) !== -1) {
            batch.update(myRef, { following: arrayRemove(targetUid) });
            batch.update(targetRef, { followers: arrayRemove(me.uid) });
        } else {
            batch.update(myRef, { following: arrayUnion(targetUid) });
            batch.update(targetRef, { followers: arrayUnion(me.uid) });
        }
        
        await batch.commit();
        window.currentUserData = myData;
        showToast('Updated!', 'success');
        setTimeout(function() { openUserProfile(targetUid); }, 300);
    } catch(e) { showToast('Error', 'error'); }
}

// Edit Profile
function openEditProfile() {
    var modal = document.createElement('div');
    modal.className = 'glass-panel';
    modal.id = 'editProfileModal';
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;padding:2rem;min-width:300px;';
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
    var name = document.getElementById('editName')?.value.trim();
    var username = document.getElementById('editUsername')?.value.trim().toLowerCase();
    var bio = document.getElementById('editBio')?.value.trim();
    if (!name || !username) { showToast('Name and username required', 'error'); return; }
    await updateDoc(doc(db, 'users', window.auth.currentUser.uid), { name: name, username: username, bio: bio });
    window.currentUserData = { ...window.currentUserData, name: name, username: username, bio: bio };
    showToast('Saved! ✅', 'success');
    document.getElementById('editProfileModal')?.remove();
    renderOwnProfile();
}

// Avatar Upload
function triggerAvatarUpload() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = async function(ev) {
            var img = new Image();
            img.onload = async function() {
                var canvas = document.createElement('canvas');
                var maxSize = 200;
                var w = img.width, h = img.height;
                if (w > h) { if (w > maxSize) { h *= maxSize/w; w = maxSize; } }
                else { if (h > maxSize) { w *= maxSize/h; h = maxSize; } }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                var dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                await updateDoc(doc(db, 'users', window.auth.currentUser.uid), { avatar: dataUrl });
                window.currentUserData = { ...window.currentUserData, avatar: dataUrl };
                showToast('Avatar updated! 📷', 'success');
                renderOwnProfile();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

// Shop
function openShop() {
    var items = [
        { name: 'Gold Border', icon: '🟡', price: 500 },
        { name: 'Neon Frame', icon: '💠', price: 750 },
        { name: 'Crown Badge', icon: '👑', price: 1000 },
        { name: 'Diamond Theme', icon: '💎', price: 1500 },
        { name: 'Fire Effect', icon: '🔥', price: 600 },
        { name: 'Star Bubble', icon: '⭐', price: 300 }
    ];
    
    var modal = document.createElement('div');
    modal.className = 'glass-panel';
    modal.id = 'shopModal';
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;padding:1.5rem;min-width:300px;max-height:80vh;overflow-y:auto;';
    
    var itemsHTML = '';
    items.forEach(function(item) {
        itemsHTML += `
            <div class="glass-panel" style="padding:0.8rem;text-align:center;">
                <div style="font-size:2rem;">${item.icon}</div>
                <p style="font-size:0.8rem;">${item.name}</p>
                <p style="color:var(--gold);font-size:0.7rem;">🪙 ${item.price}</p>
                <button class="btn-glow" style="padding:0.3rem 0.8rem;font-size:0.7rem;margin-top:0.3rem;" 
                    onclick="window.buyItem('${item.name}',${item.price})">Buy</button>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <h3 class="neon-text">🛍️ Premium Shop</h3>
        <p style="color:var(--gold);margin-bottom:1rem;">🪙 Balance: ${window.currentUserData?.coins||0}</p>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.8rem;">${itemsHTML}</div>
        <button class="btn-gold" style="width:100%;margin-top:1rem;" onclick="document.getElementById('shopModal').remove()">Close</button>
    `;
    document.body.appendChild(modal);
}

async function buyItem(itemName, price) {
    var me = window.auth?.currentUser;
    if (!me) return;
    var snap = await getDoc(doc(db, 'users', me.uid));
    if (!snap.exists()) return;
    var data = snap.data();
    if ((data.coins||0) < price) { showToast('Not enough coins!', 'error'); return; }
    
    var owned = data.ownedItems || [];
    if (owned.indexOf(itemName) !== -1) { showToast('Already owned!', 'info'); return; }
    
    owned.push(itemName);
    await updateDoc(doc(db, 'users', me.uid), {
        coins: (data.coins||0) - price,
        ownedItems: owned
    });
    window.currentUserData = { ...window.currentUserData, coins: (data.coins||0)-price, ownedItems: owned };
    showToast('Purchased ' + itemName + '! 🎉', 'success');
    document.getElementById('shopModal')?.remove();
}

// Settings
function openSettings() {
    var modal = document.createElement('div');
    modal.className = 'glass-panel';
    modal.id = 'settingsModal';
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;padding:1.5rem;min-width:300px;';
    modal.innerHTML = `
        <h3 class="neon-text">⚙️ Settings</h3>
        <label style="display:flex;justify-content:space-between;align-items:center;padding:0.8rem 0;">
            <span>🔒 Private Account</span>
            <input type="checkbox" id="privateAccount" ${window.currentUserData?.isPrivate?'checked':''} onchange="window.togglePrivacy()">
        </label>
        <label style="display:flex;justify-content:space-between;align-items:center;padding:0.8rem 0;">
            <span>👻 Hide Online Status</span>
            <input type="checkbox" id="hideStatus" ${window.currentUserData?.hideStatus?'checked':''} onchange="window.toggleStatus()">
        </label>
        <button class="btn-gold" style="width:100%;margin-top:1rem;" onclick="document.getElementById('settingsModal').remove()">Close</button>
    `;
    document.body.appendChild(modal);
}

async function togglePrivacy() {
    var val = document.getElementById('privateAccount')?.checked;
    await updateDoc(doc(db, 'users', window.auth.currentUser.uid), { isPrivate: val });
    window.currentUserData = { ...window.currentUserData, isPrivate: val };
}

async function toggleStatus() {
    var val = document.getElementById('hideStatus')?.checked;
    await updateDoc(doc(db, 'users', window.auth.currentUser.uid), { hideStatus: val });
    window.currentUserData = { ...window.currentUserData, hideStatus: val };
}

// Block & Report
async function blockUser(uid) {
    if (!confirm('Block this user?')) return;
    await updateDoc(doc(db, 'users', window.auth.currentUser.uid), { blockedUsers: arrayUnion(uid) });
    showToast('User blocked', 'info');
}

async function reportUser(uid) {
    var reason = prompt('Reason for reporting:');
    if (!reason) return;
    var { addDoc, collection } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    await addDoc(collection(db, 'reports'), { reportedUser:uid, reportedBy:window.auth.currentUser.uid, reason:reason, timestamp:new Date() });
    showToast('Report submitted', 'success');
}

// Follow List
async function showFollowList(type, uid) {
    var userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return;
    var list = type === 'followers' ? (userDoc.data().followers||[]) : (userDoc.data().following||[]);
    if (!list.length) { showToast('No ' + type, 'info'); return; }
    
    var modal = document.createElement('div');
    modal.className = 'glass-panel';
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1000;padding:1rem;min-width:250px;max-height:60vh;overflow-y:auto;';
    modal.innerHTML = '<h4 class="neon-text">' + (type==='followers'?'Followers':'Following') + ' (' + list.length + ')</h4><div id="flContent"></div><button class="btn-glow" style="width:100%;margin-top:0.5rem;" onclick="this.parentElement.remove()">Close</button>';
    document.body.appendChild(modal);
    
    var container = modal.querySelector('#flContent');
    for (var i = 0; i < Math.min(list.length, 20); i++) {
        var userId = list[i];
        var uDoc = await getDoc(doc(db, 'users', userId));
        if (uDoc.exists()) {
            var u = uDoc.data();
            var div = document.createElement('div');
            div.style.cssText = 'display:flex;align-items:center;gap:0.8rem;padding:0.6rem;cursor:pointer;border-radius:1rem;';
            div.onclick = function(uid) {
                return function() {
                    modal.remove();
                    openUserProfile(uid);
                };
            }(userId);
            div.innerHTML = '<img src="' + (u.avatar||defaultAvatar(u.name)) + '" width="35" height="35" style="border-radius:50%;"><div><strong>' + u.name + '</strong><p style="font-size:0.7rem;color:#aaa;">@' + u.username + '</p></div>';
            container.appendChild(div);
        }
    }
}

// EXPORT TO WINDOW
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
