// ==================== SEARCH & DISCOVER ====================

// Render discover page
function renderDiscover(container) {
    const recentSearches = currentUserData?.recentSearches || [];
    
    let recentHTML = '';
    if (recentSearches.length > 0) {
        recentHTML = `
            <div class="section-label">Recent Searches</div>
            <div class="recent-tags">
                ${recentSearches.map(s => `
                    <span class="recent-tag" onclick="document.getElementById('searchInput').value='${s}';searchUsers('${s}')">${s}</span>
                `).join('')}
            </div>
        `;
    }
    
    container.innerHTML = `
        <h2 style="color:var(--gold);margin-bottom:15px">🔍 Discover People</h2>
        <input class="input-field" id="searchInput" placeholder="Search by name or username..." onkeyup="searchUsers(this.value)">
        ${recentHTML}
        <div id="searchResults">
            <div class="empty-state">Start typing to find people...</div>
        </div>
    `;
}

// Search users
async function searchUsers(query) {
    const container = document.getElementById('searchResults');
    if (!container) return;
    
    if (!query || query.length < 1) {
        container.innerHTML = '<div class="empty-state">Start typing to find people...</div>';
        return;
    }
    
    try {
        const snapshot = await db.collection('users')
            .where('username', '>=', '@' + query)
            .where('username', '<=', '@' + query + '\uf8ff')
            .limit(20)
            .get();
        
        const users = [];
        snapshot.forEach(doc => {
            if (doc.id !== currentUser.uid) {
                users.push({ id: doc.id, ...doc.data() });
            }
        });
        
        // Save search
        if (query.length >= 2) {
            const recent = currentUserData?.recentSearches || [];
            const updated = [query, ...recent.filter(s => s !== query)].slice(0, 5);
            await db.collection('users').doc(currentUser.uid).update({ recentSearches: updated });
            if (currentUserData) currentUserData.recentSearches = updated;
        }
        
        if (users.length === 0) {
            container.innerHTML = '<div class="empty-state">No users found</div>';
            return;
        }
        
        container.innerHTML = users.map(u => {
            const isBlockedByMe = isBlocked(currentUserData, u.id);
            const isBlockedByThem = isBlockedBy(u, currentUser.uid);
            
            if (isBlockedByMe) {
                return `
                    <div class="user-card blocked-user-card" onclick="viewUserProfile('${u.id}')">
                        <div class="blocked-avatar">🚫</div>
                        <div class="user-card-info">
                            <div class="user-card-name">Blocked User</div>
                            <div class="user-card-username">${u.username}</div>
                        </div>
                        <button class="btn-sm btn-outline-sm" onclick="event.stopPropagation();unblockThisUser('${u.id}')">Unblock</button>
                    </div>
                `;
            }
            
            if (isBlockedByThem) {
                return `
                    <div class="user-card blocked-user-card">
                        <div class="blocked-avatar">🔒</div>
                        <div class="user-card-info">
                            <div class="user-card-name">${u.name}</div>
                            <div class="user-card-username">${u.username}</div>
                        </div>
                        <button class="btn-sm btn-outline-sm" onclick="tryFollowBlocked('${u.id}', this)">Follow</button>
                    </div>
                `;
            }
            
            const isFollowing = (u.followers || []).includes(currentUser.uid);
            
            return `
                <div class="user-card" onclick="viewUserProfile('${u.id}')">
                    <img src="${u.avatar || getAvatar(u.name)}" class="user-avatar-sm" onerror="this.src='${getAvatar(u.name)}'">
                    <div class="user-card-info">
                        <div class="user-card-name">${u.name}</div>
                        <div class="user-card-username">${u.username}</div>
                    </div>
                    ${isFollowing ? 
                        `<button class="btn-sm btn-outline-sm" onclick="event.stopPropagation();startChatWithUser('${u.id}')">Chat</button>` :
                        `<button class="btn-sm btn-gold-sm" onclick="event.stopPropagation();followThisUser('${u.id}', this)">Follow</button>`
                    }
                </div>
            `;
        }).join('');
        
    } catch (e) {
        container.innerHTML = '<div class="empty-state">Error searching</div>';
    }
}

// Follow user from search
async function followThisUser(userId, btn) {
    await db.collection('users').doc(currentUser.uid).update({
        following: firebase.firestore.FieldValue.arrayUnion(userId)
    });
    await db.collection('users').doc(userId).update({
        followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
    });
    
    const doc = await db.collection('users').doc(currentUser.uid).get();
    currentUserData = doc.data();
    
    btn.textContent = 'Chat';
    btn.className = 'btn-sm btn-outline-sm';
    btn.onclick = (e) => { e.stopPropagation(); startChatWithUser(userId); };
    
    checkAchievements();
    showToast('Followed! ✅');
}

// Try follow blocked user
async function tryFollowBlocked(userId, btn) {
    btn.textContent = 'Following';
    setTimeout(() => {
        btn.textContent = 'Follow';
    }, 1000);
    showToast('Cannot follow this user', 'error');
}

// View user profile
async function viewUserProfile(userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    if (!userData) return showToast('User not found', 'error');
    
    const isBlockedByMe = isBlocked(currentUserData, userId);
    const isBlockedByThem = isBlockedBy(userData, currentUser.uid);
    const isFollowing = (userData.followers || []).includes(currentUser.uid);
    
    let profileHTML = '';
    
    if (isBlockedByMe) {
        profileHTML = `
            <div class="card" style="text-align:center">
                <div class="blocked-avatar-large">🚫</div>
                <h3>Blocked User</h3>
                <p style="color:var(--text2)">@${userData.username?.replace('@', '')}</p>
                <div class="profile-stats">
                    <div class="stat-item"><span class="stat-num">0</span><span class="stat-label">Followers</span></div>
                    <div class="stat-item"><span class="stat-num">0</span><span class="stat-label">Following</span></div>
                </div>
                <div style="color:var(--text2);font-size:12px">Achievements: 0</div>
                <button class="btn-gold" onclick="unblockThisUser('${userId}');closeModal('userProfileModal');showToast('Unblocked!')">Unblock</button>
            </div>
        `;
    } else if (isBlockedByThem) {
        profileHTML = `
            <div class="card" style="text-align:center">
                <div class="blocked-avatar-large">🔒</div>
                <h3>${userData.name}</h3>
                <p style="color:var(--text2)">${userData.username}</p>
                <div class="profile-stats">
                    <div class="stat-item"><span class="stat-num">0</span><span class="stat-label">Followers</span></div>
                    <div class="stat-item"><span class="stat-num">0</span><span class="stat-label">Following</span></div>
                </div>
                <div style="color:var(--text2);font-size:12px">Achievements: 0</div>
                <p style="color:var(--text2);margin:10px 0">This user has blocked you</p>
            </div>
        `;
    } else {
        profileHTML = `
            <div class="card" style="text-align:center">
                <img src="${userData.avatar || getAvatar(userData.name)}" class="profile-avatar-lg" onerror="this.src='${getAvatar(userData.name)}'">
                <h3>${userData.name}</h3>
                <p style="color:var(--text2)">${userData.username}</p>
                <p style="color:var(--text2);font-size:13px;margin:8px 0">${userData.bio || 'No bio'}</p>
                <div class="profile-stats">
                    <div class="stat-item"><span class="stat-num">${(userData.followers || []).length}</span><span class="stat-label">Followers</span></div>
                    <div class="stat-item"><span class="stat-num">${(userData.following || []).length}</span><span class="stat-label">Following</span></div>
                </div>
                <div style="color:var(--gold);margin:10px 0">🏆 ${userData.stats?.achievements || 0} Achievements</div>
                <div style="display:flex;gap:10px;justify-content:center">
                    ${isFollowing ? 
                        `<button class="btn-outline" style="flex:1" onclick="unfollowThisUser('${userId}')">Unfollow</button>` :
                        `<button class="btn-gold" style="flex:1" onclick="followThisUserFromProfile('${userId}')">Follow</button>`
                    }
                    <button class="btn-outline" style="flex:1" onclick="startChatWithUser('${userId}');closeModal('userProfileModal')">Chat</button>
                </div>
            </div>
        `;
    }
    
    // Top right 3 dots
    profileHTML += `
        <div style="position:absolute;top:15px;right:15px">
            <button class="three-dots-btn" onclick="toggleUserOptions('${userId}')">⋮</button>
        </div>
    `;
    
    openModal('userProfileModal');
    document.getElementById('userProfileContent').innerHTML = profileHTML;
}

// Toggle user options dropdown
function toggleUserOptions(userId) {
    const dropdown = document.getElementById('userOptionsDropdown');
    dropdown.classList.toggle('show');
    dropdown.dataset.userId = userId;
}

// Report user
function reportUser() {
    const userId = document.getElementById('userOptionsDropdown').dataset.userId;
    closeModal('userProfileModal');
    document.getElementById('userOptionsDropdown').classList.remove('show');
    
    openModal('genericModal');
    document.getElementById('genericModalContent').innerHTML = `
        <div class="modal-header">
            <h2>🚩 Report User</h2>
            <button onclick="closeModal('genericModal')">✕</button>
        </div>
        <p style="color:var(--text2);margin-bottom:15px">Why are you reporting this user?</p>
        <button class="btn-outline" onclick="submitReport('${userId}', 'Spam')">Spam</button>
        <button class="btn-outline" onclick="submitReport('${userId}', 'Harassment')">Harassment</button>
        <button class="btn-outline" onclick="submitReport('${userId}', 'Inappropriate Content')">Inappropriate Content</button>
        <button class="btn-outline" onclick="submitReport('${userId}', 'Fake Account')">Fake Account</button>
        <button class="btn-outline" onclick="submitReport('${userId}', 'Other')">Other</button>
    `;
}

// Submit report
async function submitReport(userId, reason) {
    await db.collection('reports').add({
        reportedUser: userId,
        reportedBy: currentUser.uid,
        reason,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'pending'
    });
    
    closeModal('genericModal');
    showToast('Report submitted. Thank you!');
}

console.log('✅ Search module loaded');
