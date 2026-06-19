// ==================== SEARCH ====================

function renderSearch(c) {
    c.innerHTML = '<h2 style="color:var(--gold);margin-bottom:15px">🔍 Discover</h2><input class="inp" id="sinput" placeholder="Search people..." onkeyup="searchUsers(this.value)" style="margin-bottom:12px"><div id="sresults"><p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">Type to search...</p></div>';
}

function searchUsers(q) {
    var c = document.getElementById('sresults');
    if (!c || !q) {
        c.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">Type to search...</p>';
        return;
    }
    
    db.collection('users').where('username', '>=', '@' + q).where('username', '<=', '@' + q + '\uf8ff').limit(20).get().then(function(snap) {
        var users = [];
        snap.forEach(function(doc) {
            if (doc.id !== currentUser.uid) {
                users.push({ id: doc.id, data: doc.data() });
            }
        });
        
        if (users.length === 0) {
            c.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No users found</p>';
            return;
        }
        
        // Save search
        if (q.length >= 2) {
            var recent = currentUserData.recentSearches || [];
            recent = [q].concat(recent.filter(function(s) { return s !== q; })).slice(0, 5);
            db.collection('users').doc(currentUser.uid).update({ recentSearches: recent });
            currentUserData.recentSearches = recent;
        }
        
        var h = '';
        users.forEach(function(u) {
            var isFollowing = (u.data.followers || []).includes(currentUser.uid);
            h += '<div class="chat-item"><img class="chat-avatar" src="' + (u.data.avatar || av(u.data.name)) + '" style="width:48px;height:48px" onerror="this.src=av(\'' + u.data.name + '\')"><div style="flex:1"><b>' + u.data.name + '</b><br><small style="color:var(--gold-light)">' + u.data.username + '</small></div>' + (isFollowing ? '<button class="btn-out" style="width:auto;padding:8px 16px" onclick="startChatUser(\'' + u.id + '\')">Chat</button>' : '<button class="btn" style="width:auto;padding:8px 16px" onclick="followUser(\'' + u.id + '\',this)">Follow</button>') + '</div>';
        });
        c.innerHTML = h;
    });
}

function followUser(uid, btn) {
    db.collection('users').doc(currentUser.uid).update({
        following: firebase.firestore.FieldValue.arrayUnion(uid)
    });
    db.collection('users').doc(uid).update({
        followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
    });
    
    btn.textContent = 'Chat';
    btn.className = 'btn-out';
    btn.style.width = 'auto';
    btn.style.padding = '8px 16px';
    btn.onclick = function() { startChatUser(uid); };
    
    db.collection('users').doc(currentUser.uid).get().then(function(doc) {
        currentUserData = doc.data();
    });
    
    toast('Followed!');
}

function startChatUser(uid) {
    db.collection('chats').where('participants', 'array-contains', currentUser.uid).get().then(function(snap) {
        var ec = null;
        snap.forEach(function(doc) {
            if (doc.data().participants.includes(uid)) ec = doc.id;
        });
        
        db.collection('users').doc(uid).get().then(function(ud) {
            var u = ud.data();
            if (ec) {
                openChat(ec, uid, u.name, u.avatar);
            } else {
                db.collection('chats').add({
                    participants: [currentUser.uid, uid],
                    lastMessage: '',
                    lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
                }).then(function(ref) {
                    openChat(ref.id, uid, u.name, u.avatar);
                });
            }
        });
    });
}

console.log('Search loaded');
