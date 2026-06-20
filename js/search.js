// ==================== SEARCH ====================

function renderSearch(c) {
    c.innerHTML = '<h2 style="color:var(--gold);margin-bottom:15px">🔍 Discover</h2><input class="inp" id="sinput" placeholder="Search people..." onkeyup="searchUsers(this.value)" style="margin-bottom:12px"><div id="sresults"><p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">Type to search...</p></div>';
}

function searchUsers(q) {
    var c = document.getElementById('sresults');
    if (!c || !q) { c.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">Type to search...</p>'; return; }
    
    db.collection('users').where('username', '>=', '@' + q).where('username', '<=', '@' + q + '\uf8ff').limit(20).get().then(function(snap) {
        var users = [];
        snap.forEach(function(doc) { if (doc.id !== currentUser.uid) users.push({ id: doc.id, data: doc.data() }); });
        if (users.length === 0) { c.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No users found</p>'; return; }
        var h = '';
        users.forEach(function(u) {
            var isFollowing = (u.data.followers || []).indexOf(currentUser.uid) !== -1;
            h += '<div class="chat-item" onclick="viewUserProfile(\'' + u.id + '\')"><div class="av" style="width:48px;height:48px">' + (u.data.name || '?')[0] + '</div><div style="flex:1"><b>' + u.data.name + '</b><br><small style="color:var(--gold-light)">' + u.data.username + '</small></div>' + (isFollowing ? '<button class="btn-out" style="width:auto;padding:8px 16px" onclick="event.stopPropagation();startChatUser(\'' + u.id + '\')">Chat</button>' : '<button class="btn" style="width:auto;padding:8px 16px" onclick="event.stopPropagation();followUser(\'' + u.id + '\',this)">Follow</button>') + '</div>';
        });
        c.innerHTML = h;
    });
}

function followUser(uid, btn) {
    db.collection('users').doc(currentUser.uid).update({ following: firebase.firestore.FieldValue.arrayUnion(uid) });
    db.collection('users').doc(uid).update({ followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
    btn.textContent = 'Chat';
    btn.className = 'btn-out';
    btn.style.width = 'auto';
    btn.style.padding = '8px 16px';
    btn.onclick = function(e) { e.stopPropagation(); startChatUser(uid); };
    db.collection('users').doc(currentUser.uid).get().then(function(doc) { currentUserData = doc.data(); });
    toast('Followed!');
}

function startChatUser(uid) {
    db.collection('chats').where('participants', 'array-contains', currentUser.uid).get().then(function(snap) {
        var ec = null;
        snap.forEach(function(doc) { if (doc.data().participants.indexOf(uid) !== -1) ec = doc.id; });
        db.collection('users').doc(uid).get().then(function(ud) {
            var u = ud.data();
            if (ec) { openChat(ec, uid, u.name, u.avatar); }
            else {
                db.collection('chats').add({ participants: [currentUser.uid, uid], lastMessage: '', lastMessageTime: firebase.firestore.FieldValue.serverTimestamp() }).then(function(ref) {
                    openChat(ref.id, uid, u.name, u.avatar);
                });
            }
        });
    });
}

function viewUserProfile(userId) {
    db.collection('users').doc(userId).get().then(function(doc) {
        var u = doc.data();
        if (!u) return toast('User not found', 'error');
        openModal('genericModal');
        var isFollowing = (u.followers || []).indexOf(currentUser.uid) !== -1;
        var h = '<h2 style="color:var(--gold);text-align:center">' + u.name + '</h2>';
        h += '<p style="text-align:center;color:var(--gold-light)">' + u.username + '</p>';
        h += '<p style="text-align:center;color:rgba(255,255,255,0.6)">' + (u.bio || 'No bio') + '</p>';
        h += '<div style="display:flex;justify-content:center;gap:20px;margin:10px 0"><div style="text-align:center"><b style="color:var(--gold)">' + (u.followers || []).length + '</b><br><small>Followers</small></div><div style="text-align:center"><b style="color:var(--gold)">' + (u.following || []).length + '</b><br><small>Following</small></div></div>';
        h += '<div style="text-align:center;color:var(--gold);margin:10px 0">🏆 ' + (u.stats?.achievements || 0) + ' Achievements</div>';
        h += '<div style="display:flex;gap:10px;justify-content:center">';
        if (isFollowing) {
            h += '<button class="btn-out" style="flex:1" onclick="startChatUser(\'' + userId + '\');closeModal(\'genericModal\')">Chat</button>';
            h += '<button class="btn-out" style="flex:1;color:#FF4757;border-color:#FF4757" onclick="unfollowUser(\'' + userId + '\')">Unfollow</button>';
        } else {
            h += '<button class="btn" style="flex:1" onclick="followUserProfile(\'' + userId + '\')">Follow</button>';
        }
        h += '</div>';
        h += '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
        document.getElementById('genericContent').innerHTML = h;
    });
}

function followUserProfile(userId) {
    db.collection('users').doc(currentUser.uid).update({ following: firebase.firestore.FieldValue.arrayUnion(userId) });
    db.collection('users').doc(userId).update({ followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
    toast('Followed!');
    closeModal('genericModal');
}

function unfollowUser(userId) {
    db.collection('users').doc(currentUser.uid).update({ following: firebase.firestore.FieldValue.arrayRemove(userId) });
    db.collection('users').doc(userId).update({ followers: firebase.firestore.FieldValue.arrayRemove(currentUser.uid) });
    toast('Unfollowed');
    closeModal('genericModal');
}

console.log('Search loaded');
