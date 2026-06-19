// ==================== PROFILE SYSTEM ====================

// Render profile page
async function renderProfile(container) {
    if (!currentUserData) {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        currentUserData = doc.data();
    }
    
    const u = currentUserData;
    
    container.innerHTML = `
        <!-- Profile Header -->
        <div class="profile-header">
            <div class="avatar-container">
                <img src="${u.avatar || getAvatar(u.name)}" class="profile-avatar" id="profileAvatar" onerror="this.src='${getAvatar(u.name)}'">
                <label for="avatarUpload" class="avatar-upload-btn">📷</label>
                <input type="file" id="avatarUpload" accept="image/*" hidden onchange="uploadAvatar()">
            </div>
            <div class="profile-stats">
                <div class="stat-item"><span class="stat-num">${u.posts || 0}</span><span class="stat-label">Posts</span></div>
                <div class="stat-item" onclick="showFollowers()"><span class="stat-num">${(u.followers || []).length}</span><span class="stat-label">Followers</span></div>
                <div class="stat-item" onclick="showFollowing()"><span class="stat-num">${(u.following || []).length}</span><span class="stat-label">Following</span></div>
            </div>
        </div>
        
        <!-- Profile Info -->
        <div class="profile-info">
            <h3>${u.name}</h3>
            <p class="username-text">${u.username}</p>
            <p class="bio-text">${u.bio || 'No bio yet'}</p>
        </div>
        
        <!-- Action Buttons -->
        <div class="profile-actions">
            <button class="action-btn" onclick="editProfile()">✏️ Edit Profile</button>
            <button class="action-btn" onclick="showAchievements()">🏆 Achievements</button>
            <button class="action-btn" onclick="openPrivacy()">🔒 Privacy</button>
            <button class="action-btn" onclick="shareProfile()">📤 Share</button>
        </div>
        
        <!-- Level Card -->
        <div class="card level-card">
            <div class="level-header">
                <div>
                    <span class="level-title">${u.level?.title || 'Explorer'}</span>
                    <span class="level-subtitle">Level ${u.level?.current || 1}</span>
                </div>
                <span class="level-achievements">${u.stats?.achievements || 0} 🏆</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width:${(u.level?.progress || 0) % 100}%"></div>
            </div>
        </div>
        
        <!-- Game Stats -->
        <div class="card">
            <h4 style="color:var(--gold);margin-bottom:10px">🎮 Game Stats</h4>
            <div style="display:flex;justify-content:space-around;text-align:center">
                <div><span style="color:#2ED573;font-size:20px;font-weight:700">${u.gameStats?.wins || 0}</span><br><small>Wins</small></div>
                <div><span style="color:#FF4757;font-size:20px;font-weight:700">${u.gameStats?.losses || 0}</span><br><small>Losses</small></div>
                <div><span style="color:#FFA502;font-size:20px;font-weight:700">${u.gameStats?.draws || 0}</span><br><small>Draws</small></div>
            </div>
        </div>
        
        <!-- Logout -->
        <button class="btn-outline" onclick="logout()" style="color:#FF4757;border-color:#FF4757;margin-top:10px">🚪 Logout</button>
    `;
}

// Edit profile
function editProfile() {
    openModal('genericModal');
    document.getElementById('genericModalContent').innerHTML = `
        <div class="modal-header">
            <h2>Edit Profile</h2>
            <button onclick="closeModal('genericModal')">✕</button>
        </div>
        <input class="input-field" id="editName" value="${currentUserData.name || ''}" placeholder="Name">
        <input class="input-field" id="editUsername" value="${(currentUserData.username || '').replace('@', '')}" placeholder="Username">
        <textarea class="input-field" id="editBio" placeholder="Bio" rows="3" style="resize:none">${currentUserData.bio || ''}</textarea>
        <button class="btn-gold" onclick="saveProfile()">Save Changes</button>
        <button class="btn-outline" onclick="closeModal('genericModal')">Cancel</button>
    `;
}

// Save profile
async function saveProfile() {
    const name = document.getElementById('editName')?.value?.trim();
    const username = document.getElementById('editUsername')?.value?.trim();
    const bio = document.getElementById('editBio')?.value?.trim();
    
    if (!name || !username) return showToast('Name and username required', 'error');
    if (!isValidUsername(username)) return showToast('Invalid username format', 'error');
    
    const newUsername = '@' + username;
    
    if (newUsername !== currentUserData.username) {
        const snap = await db.collection('users').where('username', '==', newUsername).get();
        if (!snap.empty) return showToast('Username taken!', 'error');
        
        const lastChange = currentUserData.lastUsernameChange?.toDate?.() || currentUserData.lastUsernameChange;
        const changeCount = currentUserData.usernameChangeCount || 0;
        
        if (lastChange) {
            const daysSince = (Date.now() - new Date(lastChange).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince < 29 && changeCount >= 2) {
                const daysLeft = Math.ceil(29 - daysSince);
                return showToast(`Wait ${daysLeft} days (2 changes/29 days)`, 'error');
            }
        }
        
        const newCount = (!lastChange || (Date.now() - new Date(lastChange).getTime()) / (1000 * 60 * 60 * 24) >= 29) ? 1 : changeCount + 1;
        
        await db.collection('users').doc(currentUser.uid).update({
            username: newUsername,
            lastUsernameChange: firebase.firestore.FieldValue.serverTimestamp(),
            usernameChangeCount: newCount
        });
    }
    
    await db.collection('users').doc(currentUser.uid).update({ name, bio });
    
    const doc = await db.collection('users').doc(currentUser.uid).get();
    currentUserData = doc.data();
    
    closeModal('genericModal');
    navigateTo('profile');
    checkAchievements();
    showToast('Profile updated! ✅');
}

// Upload avatar
async function uploadAvatar() {
    const file = document.getElementById('avatarUpload').files[0];
    if (!file) return;
    
    try {
        showToast('Uploading...');
        const ref = storage.ref(`avatars/${currentUser.uid}`);
        await ref.put(file);
        const url = await ref.getDownloadURL();
        await db.collection('users').doc(currentUser.uid).update({ avatar: url });
        
        const doc = await db.collection('users').doc(currentUser.uid).get();
        currentUserData = doc.data();
        
        navigateTo('profile');
        checkAchievements();
        showToast('Avatar updated! 📸');
    } catch (e) {
        showToast('Upload failed', 'error');
    }
}

// Share profile
function shareProfile() {
    navigator.clipboard.writeText(currentUserData.username).then(() => {
        showToast('Username copied! 📋');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

// Show followers
async function showFollowers() {
    await showUserList('followers', 'Followers');
}

// Show following
async function showFollowing() {
    await showUserList('following', 'Following');
}

// Show user list
async function showUserList(type, title) {
    openModal('genericModal');
    document.getElementById('genericModalContent').innerHTML = `
        <div class="modal-header">
            <h2>${title}</h2>
            <button onclick="closeModal('genericModal')">✕</button>
        </div>
        <div id="userListContent">Loading...</div>
    `;
    
    const ids = currentUserData[type] || [];
    const container = document.getElementById('userListContent');
    
    if (ids.length === 0) {
        container.innerHTML = '<div class="empty-state">Nothing here yet</div>';
        return;
    }
    
    let html = '';
    for (const id of ids) {
        const doc = await db.collection('users').doc(id).get();
        const u = doc.data();
        if (!u) continue;
        
        const isFollowing = (currentUserData.following || []).includes(id);
        
        html += `
            <div class="user-card">
                <img src="${u.avatar || getAvatar(u.name)}" class="user-avatar-sm" onerror="this.src='${getAvatar(u.name)}'">
                <div class="user-card-info">
                    <div class="user-card-name">${u.name}</div>
                    <div class="user-card-username">${u.username}</div>
                </div>
                <button class="btn-sm btn-outline-sm" onclick="startChatWithUser('${id}');closeModal('genericModal')">Chat</button>
                ${type === 'following' ? `<button class="btn-sm btn-danger-sm" onclick="unfollowUser('${id}')">Unfollow</button>` : ''}
            </div>
        `;
    }
    container.innerHTML = html;
}

// Unfollow user
async function unfollowUser(userId) {
    await db.collection('users').doc(currentUser.uid).update({
        following: firebase.firestore.FieldValue.arrayRemove(userId)
    });
    await db.collection('users').doc(userId).update({
        followers: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
    });
    
    const doc = await db.collection('users').doc(currentUser.uid).get();
    currentUserData = doc.data();
    
    closeModal('genericModal');
    navigateTo('profile');
    showToast('Unfollowed');
}

// Privacy
function openPrivacy() {
    openModal('genericModal');
    document.getElementById('genericModalContent').innerHTML = `
        <div class="modal-header">
            <h2>🔒 Privacy Settings</h2>
            <button onclick="closeModal('genericModal')">✕</button>
        </div>
        <button class="btn-outline" onclick="closeModal('genericModal');showChangePassword()">🔑 Change Password</button>
        <button class="btn-outline" onclick="closeModal('genericModal');showBlockedUsers()">🚫 Blocked Users</button>
        <button class="btn-outline" onclick="closeModal('genericModal');resetAllAchievements()">🔄 Reset Achievements</button>
    `;
}

// Change password
function showChangePassword() {
    openModal('genericModal');
    document.getElementById('genericModalContent').innerHTML = `
        <div class="modal-header">
            <h2>Change Password</h2>
            <button onclick="closeModal('genericModal')">✕</button>
        </div>
        <input class="input-field" id="oldPassword" placeholder="Current Password" type="password">
        <input class="input-field" id="newPassword" placeholder="New Password" type="password">
        <input class="input-field" id="confirmPassword" placeholder="Confirm Password" type="password">
        <button class="btn-gold" onclick="changePassword()">Update Password</button>
    `;
}

// Change password action
async function changePassword() {
    const oldPass = document.getElementById('oldPassword')?.value;
    const newPass = document.getElementById('newPassword')?.value;
    const confirmPass = document.getElementById('confirmPassword')?.value;
    
    if (!oldPass || !newPass) return showToast('Fill all fields', 'error');
    if (newPass.length < 6) return showToast('Min 6 characters', 'error');
    if (newPass !== confirmPass) return showToast('Passwords do not match', 'error');
    
    try {
        const cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, oldPass);
        await currentUser.reauthenticateWithCredential(cred);
        await currentUser.updatePassword(newPass);
        closeModal('genericModal');
        showToast('Password updated! 🔒');
    } catch (e) {
        showToast('Current password is incorrect', 'error');
    }
}

// Blocked users
async function showBlockedUsers() {
    openModal('genericModal');
    document.getElementById('genericModalContent').innerHTML = `
        <div class="modal-header">
            <h2>🚫 Blocked Users</h2>
            <button onclick="closeModal('genericModal')">✕</button>
        </div>
        <div id="blockedListContent">Loading...</div>
    `;
    
    const ids = currentUserData.blockedUsers || [];
    const container = document.getElementById('blockedListContent');
    
    if (ids.length === 0) {
        container.innerHTML = '<div class="empty-state">No blocked users</div>';
        return;
    }
    
    let html = '';
    for (const id of ids) {
        const doc = await db.collection('users').doc(id).get();
        const u = doc.data();
        if (!u) continue;
        
        html += `
            <div class="user-card">
                <img src="${u.avatar || getAvatar(u.name)}" class="user-avatar-sm" onerror="this.src='${getAvatar(u.name)}'">
                <div class="user-card-info">
                    <div class="user-card-name">${u.name}</div>
                    <div class="user-card-username">${u.username}</div>
                </div>
                <button class="btn-sm btn-gold-sm" onclick="unblockThisUser('${id}')">Unblock</button>
            </div>
        `;
    }
    container.innerHTML = html;
}

// Unblock user
async function unblockThisUser(userId) {
    await db.collection('users').doc(currentUser.uid).update({
        blockedUsers: firebase.firestore.FieldValue.arrayRemove(userId)
    });
    
    const doc = await db.collection('users').doc(currentUser.uid).get();
    currentUserData = doc.data();
    
    showBlockedUsers();
    showToast('User unblocked! ✅');
}

console.log('✅ Profile module loaded');
