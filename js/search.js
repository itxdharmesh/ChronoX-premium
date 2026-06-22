// ==================== SEARCH & DISCOVER ====================

function renderSearch(c) {
    c.innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px">🔍 Discover People</h2>' +
        '<input class="inp" id="sinput" placeholder="Search by name or username..." onkeyup="searchUsers(this.value)" style="margin-bottom:12px">' +
        '<div id="sresults"><p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">Type to search...</p></div>';
}

function searchUsers(q) {
    var c = document.getElementById('sresults');
    if (!c || !q || q.length < 1) { 
        if (c) c.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">Type to search...</p>'; 
        return; 
    }
    
    db.collection('users')
        .where('username', '>=', '@' + q)
        .where('username', '<=', '@' + q + '\uf8ff')
        .limit(20)
        .get()
        .then(function(snap) {
            var users = [];
            snap.forEach(function(doc) { 
                if (doc.id !== currentUser.uid) users.push({ id: doc.id, data: doc.data() }); 
            });
            
            // Also search by name
            db.collection('users')
                .where('name', '>=', q)
                .where('name', '<=', q + '\uf8ff')
                .limit(20)
                .get()
                .then(function(snap2) {
                    snap2.forEach(function(doc) {
                        if (doc.id !== currentUser.uid && !users.find(function(u) { return u.id === doc.id; })) {
                            users.push({ id: doc.id, data: doc.data() });
                        }
                    });
                    
                    if (users.length === 0) { 
                        c.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No users found</p>'; 
                        return; 
                    }
                    
                    // Save recent search
                    if (q.length >= 2) {
                        var recent = currentUserData.recentSearches || [];
                        recent = [q].concat(recent.filter(function(s) { return s !== q; })).slice(0, 5);
                        db.collection('users').doc(currentUser.uid).update({ recentSearches: recent });
                        if (currentUserData) currentUserData.recentSearches = recent;
                    }
                    
                    var h = '';
                    users.forEach(function(u) {
                        var userData = u.data;
                        var isFollowing = (userData.followers || []).indexOf(currentUser.uid) !== -1;
                        var isBlocked = (currentUserData.blockedUsers || []).indexOf(u.id) !== -1;
                        var blockedByThem = (userData.blockedUsers || []).indexOf(currentUser.uid) !== -1;
                        
                        if (isBlocked) {
                            h += '<div class="chat-item" onclick="viewUserProfile(\'' + u.id + '\')">' +
                                '<div class="av" style="width:48px;height:48px;font-size:20px">🚫</div>' +
                                '<div style="flex:1"><b>Blocked User</b><br><small style="color:var(--gold-light)">' + userData.username + '</small></div>' +
                                '<button class="btn-out" style="width:auto;padding:6px 12px;font-size:11px" onclick="event.stopPropagation();unblockThisUser(\'' + u.id + '\')">Unblock</button>' +
                                '</div>';
                        } else if (blockedByThem) {
                            h += '<div class="chat-item">' +
                                '<img src="' + (userData.avatar || defaultAvatar(userData.name)) + '" class="chat-avatar-img" style="width:48px;height:48px" onerror="this.src=\'' + defaultAvatar(userData.name) + '\'">' +
                                '<div style="flex:1"><b>' + userData.name + '</b><br><small style="color:var(--gold-light)">' + userData.username + '</small></div>' +
                                '<small style="color:rgba(255,255,255,0.4)">Cannot interact</small>' +
                                '</div>';
                        } else {
                            h += '<div class="chat-item" onclick="viewUserProfile(\'' + u.id + '\')">' +
                                '<img src="' + (userData.avatar || defaultAvatar(userData.name)) + '" class="chat-avatar-img" style="width:48px;height:48px" onerror="this.src=\'' + defaultAvatar(userData.name) + '\'">' +
                                '<div style="flex:1"><b>' + userData.name + '</b><br><small style="color:var(--gold-light)">' + userData.username + '</small></div>' +
                                (isFollowing ? 
                                    '<button class="btn-out" style="width:auto;padding:8px 14px;font-size:11px" onclick="event.stopPropagation();startChatUser(\'' + u.id + '\')">Chat</button>' :
                                    '<button class="btn" style="width:auto;padding:8px 14px;font-size:11px" onclick="event.stopPropagation();followUser(\'' + u.id + '\',this)">Follow</button>'
                                ) +
                                '</div>';
                        }
                    });
                    c.innerHTML = h;
                });
        });
}

// ==================== FOLLOW USER ====================
function followUser(uid, btn) {
    db.collection('users').doc(currentUser.uid).update({ 
        following: firebase.firestore.FieldValue.arrayUnion(uid) 
    });
    db.collection('users').doc(uid).update({ 
        followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) 
    });
    
    // Update button
    btn.textContent = 'Chat';
    btn.className = 'btn-out';
    btn.style.width = 'auto';
    btn.style.padding = '8px 14px';
    btn.style.fontSize = '11px';
    btn.onclick = function(e) { e.stopPropagation(); startChatUser(uid); };
    
    // Refresh user data
    db.collection('users').doc(currentUser.uid).get().then(function(doc) { 
        currentUserData = doc.data(); 
    });
    
    // Send notification
    db.collection('notifications').add({
        to: uid,
        from: currentUser.uid,
        fromName: currentUserData.name,
        type: 'follow',
        read: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    showToast('Followed! ✅');
}

// ==================== START CHAT WITH USER ====================
function startChatUser(uid) {
    // Check if blocked
    if ((currentUserData.blockedUsers || []).indexOf(uid) !== -1) {
        return showToast('You have blocked this user. Unblock to chat.', 'error');
    }
    
    // Check existing chat
    db.collection('chats')
        .where('participants', 'array-contains', currentUser.uid)
        .get()
        .then(function(snap) {
            var existingChatId = null;
            snap.forEach(function(doc) {
                if (doc.data().participants.indexOf(uid) !== -1) {
                    existingChatId = doc.id;
                }
            });
            
            db.collection('users').doc(uid).get().then(function(ud) {
                var u = ud.data();
                if (!u) return showToast('User not found', 'error');
                
                if (existingChatId) {
                    openChatWindow(existingChatId, uid, u.name, u.avatar, false);
                } else {
                    // Create new chat
                    var newChatRef = db.collection('chats').doc();
                    newChatRef.set({
                        participants: [currentUser.uid, uid],
                        lastMessage: '',
                        lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
                        approved: false,
                        messageCount: 0
                    }).then(function() {
                        openChatWindow(newChatRef.id, uid, u.name, u.avatar, false);
                    });
                }
            });
        });
}

// ==================== VIEW USER PROFILE ====================
function viewUserProfile(userId) {
    db.collection('users').doc(userId).get().then(function(doc) {
        var u = doc.data();
        if (!u) return showToast('User not found', 'error');
        
        openModal('genericModal');
        var isFollowing = (u.followers || []).indexOf(currentUser.uid) !== -1;
        var isBlocked = (currentUserData.blockedUsers || []).indexOf(userId) !== -1;
        var blockedByThem = (u.blockedUsers || []).indexOf(currentUser.uid) !== -1;
        var isMutual = isFollowing && (u.following || []).indexOf(currentUser.uid) !== -1;
        
        if (isBlocked) {
            document.getElementById('genericContent').innerHTML = 
                '<div style="text-align:center;padding:20px">' +
                    '<div class="av" style="width:80px;height:80px;font-size:35px;margin:0 auto">🚫</div>' +
                    '<h2 style="color:var(--gold);margin:10px 0">Blocked User</h2>' +
                    '<p style="color:rgba(255,255,255,0.6)">You have blocked this user</p>' +
                    '<button class="btn" onclick="unblockThisUser(\'' + userId + '\')">✅ Unblock</button>' +
                    '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>' +
                '</div>';
            return;
        }
        
        if (blockedByThem) {
            document.getElementById('genericContent').innerHTML = 
                '<div style="text-align:center;padding:20px">' +
                    '<img src="' + (u.avatar || defaultAvatar(u.name)) + '" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--gold);object-fit:cover" onerror="this.src=\'' + defaultAvatar(u.name) + '\'">' +
                    '<h2 style="color:var(--gold);margin:10px 0">' + u.name + '</h2>' +
                    '<p style="color:var(--gold-light)">' + u.username + '</p>' +
                    '<p style="color:rgba(255,255,255,0.6);margin:10px 0">This user has blocked you</p>' +
                    '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>' +
                '</div>';
            return;
        }
        
        var h = '<div style="text-align:center">' +
            '<img src="' + (u.avatar || defaultAvatar(u.name)) + '" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--gold);object-fit:cover;margin:0 auto" onerror="this.src=\'' + defaultAvatar(u.name) + '\'">' +
            '<h2 style="color:var(--gold);margin:10px 0">' + u.name + '</h2>' +
            '<p style="color:var(--gold-light)">' + u.username + '</p>' +
            '<p style="color:rgba(255,255,255,0.6);font-size:13px;margin:8px 0">' + (u.bio || 'No bio') + '</p>';
        
        h += '<div style="display:flex;justify-content:center;gap:25px;margin:15px 0">' +
            '<div style="text-align:center"><b style="color:var(--gold);font-size:18px">' + (u.followers || []).length + '</b><br><small style="color:rgba(255,255,255,0.6)">Followers</small></div>' +
            '<div style="text-align:center"><b style="color:var(--gold);font-size:18px">' + (u.following || []).length + '</b><br><small style="color:rgba(255,255,255,0.6)">Following</small></div>' +
            '</div>';
        
        h += '<div style="text-align:center;color:var(--gold);margin:10px 0">🏆 ' + (u.stats?.achievements || 0) + ' Achievements</div>';
        
        h += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">';
        
        if (isFollowing) {
            h += '<button class="btn-out" style="flex:1;min-width:80px" onclick="startChatUser(\'' + userId + '\');closeModal(\'genericModal\')">💬 Chat</button>';
            h += '<button class="btn-out" style="flex:1;min-width:80px;color:#FF4757;border-color:#FF4757" onclick="unfollowThisUser(\'' + userId + '\')">❌ Unfollow</button>';
        } else {
            h += '<button class="btn" style="flex:1;min-width:80px" onclick="followThisUser(\'' + userId + '\')">👤 Follow</button>';
        }
        h += '</div>';
        
        h += '<div style="display:flex;gap:8px;justify-content:center;margin-top:8px">' +
            '<button class="btn-out" style="flex:1;min-width:80px;font-size:11px" onclick="reportUserModal(\'' + userId + '\')">🚩 Report</button>' +
            '<button class="btn-out" style="flex:1;min-width:80px;font-size:11px;color:#FF4757;border-color:#FF4757" onclick="blockThisUser(\'' + userId + '\')">🚫 Block</button>' +
            '</div>';
        
        h += '<button class="btn-out" onclick="closeModal(\'genericModal\')" style="margin-top:10px">Close</button>';
        h += '</div>';
        
        document.getElementById('genericContent').innerHTML = h;
    });
}

// ==================== FOLLOW / UNFOLLOW FROM PROFILE ====================
function followThisUser(userId) {
    db.collection('users').doc(currentUser.uid).update({ 
        following: firebase.firestore.FieldValue.arrayUnion(userId) 
    });
    db.collection('users').doc(userId).update({ 
        followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) 
    });
    showToast('Followed!');
    closeModal('genericModal');
}

function unfollowThisUser(userId) {
    db.collection('users').doc(currentUser.uid).update({ 
        following: firebase.firestore.FieldValue.arrayRemove(userId) 
    });
    db.collection('users').doc(userId).update({ 
        followers: firebase.firestore.FieldValue.arrayRemove(currentUser.uid) 
    });
    showToast('Unfollowed');
    closeModal('genericModal');
}

// ==================== BLOCK / UNBLOCK ====================
function blockThisUser(userId) {
    if (!confirm('Block this user? They won\'t be able to message you.')) return;
    db.collection('users').doc(currentUser.uid).update({ 
        blockedUsers: firebase.firestore.FieldValue.arrayUnion(userId),
        following: firebase.firestore.FieldValue.arrayRemove(userId),
        followers: firebase.firestore.FieldValue.arrayRemove(userId)
    });
    db.collection('users').doc(userId).update({
        followers: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
        following: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
    });
    currentUserData.blockedUsers = currentUserData.blockedUsers || [];
    currentUserData.blockedUsers.push(userId);
    closeModal('genericModal');
    showToast('Blocked! 🚫');
}

function unblockThisUser(userId) {
    db.collection('users').doc(currentUser.uid).update({ 
        blockedUsers: firebase.firestore.FieldValue.arrayRemove(userId) 
    });
    currentUserData.blockedUsers = (currentUserData.blockedUsers || []).filter(function(id) { return id !== userId; });
    showToast('Unblocked! ✅');
}

// ==================== REPORT ====================
function reportUserModal(userId) {
    document.getElementById('genericContent').innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px">🚩 Report User</h2>' +
        '<button class="btn-out" onclick="submitReport(\'' + userId + '\',\'Spam\')">📢 Spam</button>' +
        '<button class="btn-out" onclick="submitReport(\'' + userId + '\',\'Harassment\')">😡 Harassment</button>' +
        '<button class="btn-out" onclick="submitReport(\'' + userId + '\',\'Inappropriate Content\')">⚠️ Inappropriate</button>' +
        '<button class="btn-out" onclick="submitReport(\'' + userId + '\',\'Fake Account\')">👤 Fake Account</button>' +
        '<button class="btn-out" onclick="submitReport(\'' + userId + '\',\'Other\')">📋 Other</button>' +
        '<button class="btn-out" onclick="closeModal(\'genericModal\')">Cancel</button>';
}

function submitReport(userId, reason) {
    db.collection('reports').add({ 
        reportedUser: userId, 
        reportedBy: currentUser.uid, 
        reason: reason, 
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'pending'
    });
    closeModal('genericModal');
    showToast('Report submitted! 🚩');
}

console.log('✅ Search module loaded');
