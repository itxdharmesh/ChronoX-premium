function renderProfile(c) {
    var u = currentUserData || {};
    var name = (u.name && u.name !== 'undefined') ? u.name : 'User';
    var username = u.username || '@user';
    var bio = u.bio || '';
    var avatar = u.avatar || defaultAvatar(name);
    var followers = (u.followers || []).length;
    var following = (u.following || []).length;
    var posts = u.posts || 0;
    var coins = u.coins || 0;
    var xp = u.xp || 0;
    var level = (u.level && u.level.current) ? u.level.current : 1;
    var achievements = (u.stats && u.stats.achievements) ? u.stats.achievements : 0;
    var isPrivate = u.isPrivate || false;
    
    c.innerHTML = 
        // HEADER - Avatar + Stats
        '<div style="display:flex;align-items:center;padding:10px 0;gap:15px">' +
            '<div style="position:relative;flex-shrink:0">' +
                '<img src="' + avatar + '" style="width:80px;height:80px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover;background:#1a1f4e" onerror="this.src=\'' + defaultAvatar(name) + '\'">' +
                '<label for="dpUpload" style="position:absolute;bottom:0;right:0;width:24px;height:24px;background:#D4AF37;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;border:2px solid #0A0E27">📷</label>' +
                '<input type="file" id="dpUpload" accept="image/*" hidden onchange="uploadDP()">' +
            '</div>' +
            '<div style="display:flex;gap:20px;flex:1;justify-content:space-around">' +
                '<div style="text-align:center"><span style="font-size:18px;font-weight:700;color:#fff">' + posts + '</span><br><span style="font-size:11px;color:rgba(255,255,255,0.6)">Posts</span></div>' +
                '<div style="text-align:center" onclick="showFollowList(\'followers\')"><span style="font-size:18px;font-weight:700;color:#fff">' + followers + '</span><br><span style="font-size:11px;color:rgba(255,255,255,0.6)">Followers</span></div>' +
                '<div style="text-align:center" onclick="showFollowList(\'following\')"><span style="font-size:18px;font-weight:700;color:#fff">' + following + '</span><br><span style="font-size:11px;color:rgba(255,255,255,0.6)">Following</span></div>' +
            '</div>' +
        '</div>' +
        
        // NAME + USERNAME + BIO
        '<div style="padding:5px 0">' +
            '<div style="display:flex;align-items:center;gap:5px">' +
                '<span style="font-size:14px;font-weight:600">' + name + '</span>' +
                (u.verified ? '<span style="color:#1E90FF;font-size:14px">✓</span>' : '') +
            '</div>' +
            '<span style="color:#D4AF37;font-size:13px">' + username + '</span>' +
            (isPrivate ? ' 🔒' : '') +
            (bio ? '<br><span style="color:rgba(255,255,255,0.7);font-size:13px">' + bio + '</span>' : '') +
            '<div style="margin-top:6px;font-size:12px;color:rgba(255,255,255,0.5)">💰 ' + coins + ' coins • ⚡ ' + xp + ' XP • 🆙 Lv.' + level + ' • 🏆 ' + achievements + ' badges</div>' +
        '</div>' +
        
        // ACTION BUTTONS
        '<div style="display:flex;gap:8px;margin:12px 0">' +
            '<button onclick="editProfile()" style="flex:1;padding:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:12px;font-weight:600;cursor:pointer">Edit Profile</button>' +
            '<button onclick="shareProfile()" style="flex:1;padding:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:12px;font-weight:600;cursor:pointer">Share Profile</button>' +
            '<button onclick="openPrivacy()" style="width:40px;padding:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:12px;cursor:pointer">🔒</button>' +
        '</div>' +
        
        // LOGOUT
        '<button onclick="logout()" style="width:100%;padding:10px;background:transparent;border:1px solid #FF4757;color:#FF4757;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;margin-top:10px">🚪 Logout</button>';
}

function uploadDP() {
    var file = document.getElementById('dpUpload').files[0];
    if (!file) return;
    showToast('Uploading...');
    var reader = new FileReader();
    reader.onload = function(e) {
        var base64 = e.target.result;
        db.collection('users').doc(currentUser.uid).update({ avatar: base64 }).then(function() {
            currentUserData.avatar = base64;
            navigate('profile');
            showToast('Updated! 📸');
        });
    };
    reader.readAsDataURL(file);
}

function editProfile() {
    openModal('genericModal');
    document.getElementById('genericContent').innerHTML = 
        '<h2 style="color:#D4AF37;margin-bottom:15px">✏️ Edit Profile</h2>' +
        '<input class="inp" id="editName" value="' + (currentUserData.name || '') + '" placeholder="Name">' +
        '<input class="inp" id="editUsername" value="' + (currentUserData.username || '').replace('@','') + '" placeholder="Username">' +
        '<input class="inp" id="editBio" value="' + (currentUserData.bio || '') + '" placeholder="Bio">' +
        '<button class="btn" onclick="saveProfile()">Save</button>' +
        '<button class="btn-out" onclick="closeModal(\'genericModal\')">Cancel</button>';
}

function saveProfile() {
    var n = document.getElementById('editName').value.trim();
    var u = document.getElementById('editUsername').value.trim();
    var b = document.getElementById('editBio').value.trim();
    if (!n) return showToast('Name required', 'error');
    
    var updateData = { name: n, bio: b };
    
    if (u && u !== (currentUserData.username || '').replace('@','')) {
        var newUsername = '@' + u;
        db.collection('users').where('username', '==', newUsername).get().then(function(snap) {
            if (!snap.empty) return showToast('Username taken!', 'error');
            updateData.username = newUsername;
            updateData.usernameChangeCount = (currentUserData.usernameChangeCount || 0) + 1;
            updateData.lastUsernameChange = firebase.firestore.FieldValue.serverTimestamp();
            db.collection('users').doc(currentUser.uid).update(updateData).then(function() {
                currentUserData.name = n; currentUserData.bio = b; currentUserData.username = newUsername;
                closeModal('genericModal'); navigate('profile'); showToast('Saved! ✅');
            });
        });
    } else {
        db.collection('users').doc(currentUser.uid).update(updateData).then(function() {
            currentUserData.name = n; currentUserData.bio = b;
            closeModal('genericModal'); navigate('profile'); showToast('Saved! ✅');
        });
    }
}

function shareProfile() {
    navigator.clipboard.writeText(currentUserData.username || '@user').then(function() { showToast('Copied! 📋'); });
}

function openPrivacy() {
    openModal('genericModal');
    document.getElementById('genericContent').innerHTML = 
        '<h2 style="color:#D4AF37;margin-bottom:15px">🔒 Privacy</h2>' +
        '<button class="btn-out" onclick="togglePrivate()">' + (currentUserData.isPrivate ? '🌍 Make Public' : '🔒 Make Private') + '</button>' +
        '<button class="btn-out" onclick="showChangePassword()">🔑 Change Password</button>' +
        '<button class="btn-out" onclick="showBlockedUsers()">🚫 Blocked Users</button>' +
        '<button class="btn-out" onclick="deleteAccount()" style="color:#FF4757;border-color:#FF4757">🗑️ Delete Account</button>' +
        '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
}

function togglePrivate() {
    var ns = !currentUserData.isPrivate;
    db.collection('users').doc(currentUser.uid).update({ isPrivate: ns }).then(function() {
        currentUserData.isPrivate = ns;
        showToast(ns ? 'Private 🔒' : 'Public 🌍');
        openPrivacy();
    });
}

function showChangePassword() {
    document.getElementById('genericContent').innerHTML = 
        '<h2 style="color:#D4AF37;margin-bottom:15px">🔑 Change Password</h2>' +
        '<input class="inp" id="oldPass" placeholder="Current Password" type="password">' +
        '<input class="inp" id="newPass" placeholder="New Password (6+)" type="password">' +
        '<button class="btn" onclick="changePassword()">Update</button>' +
        '<button class="btn-out" onclick="openPrivacy()">Back</button>';
}

function changePassword() {
    var o = document.getElementById('oldPass').value;
    var n = document.getElementById('newPass').value;
    if (!o || !n) return showToast('Fill fields', 'error');
    if (n.length < 6) return showToast('Min 6 chars', 'error');
    var cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, o);
    currentUser.reauthenticateWithCredential(cred).then(function() {
        return currentUser.updatePassword(n);
    }).then(function() { closeModal('genericModal'); showToast('Updated! 🔒'); })
    .catch(function() { showToast('Wrong password', 'error'); });
}

function showBlockedUsers() {
    var blocked = currentUserData.blockedUsers || [];
    var h = '<h2 style="color:#D4AF37;margin-bottom:15px">🚫 Blocked</h2>';
    if (blocked.length === 0) {
        h += '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:20px">None</p><button class="btn-out" onclick="openPrivacy()">Back</button>';
        document.getElementById('genericContent').innerHTML = h;
    } else {
        h += '<div id="blist">Loading...</div><button class="btn-out" onclick="openPrivacy()">Back</button>';
        document.getElementById('genericContent').innerHTML = h;
        var items = '', done = 0;
        blocked.forEach(function(id) {
            db.collection('users').doc(id).get().then(function(doc) {
                done++; var u = doc.data();
                if (u) items += '<div class="chat-item"><div style="width:40px;height:40px;border-radius:50%;background:#1a1f4e;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid #D4AF37">' + (u.name||'?')[0] + '</div><div style="flex:1"><b>' + u.name + '</b></div><button class="btn" style="width:auto;padding:6px 14px;font-size:11px" onclick="unblockUser(\'' + id + '\')">Unblock</button></div>';
                if (done === blocked.length) document.getElementById('blist').innerHTML = items;
            });
        });
    }
}

function unblockUser(id) {
    db.collection('users').doc(currentUser.uid).update({ blockedUsers: firebase.firestore.FieldValue.arrayRemove(id) }).then(function() {
        currentUserData.blockedUsers = (currentUserData.blockedUsers || []).filter(function(uid) { return uid !== id; });
        showBlockedUsers(); showToast('Unblocked! ✅');
    });
}

function deleteAccount() {
    document.getElementById('genericContent').innerHTML = 
        '<h2 style="color:#FF4757;margin-bottom:15px">🗑️ Delete Account</h2>' +
        '<p style="color:rgba(255,255,255,0.6);font-size:13px;margin-bottom:15px">This cannot be undone!</p>' +
        '<input class="inp" id="delPass" placeholder="Enter password" type="password">' +
        '<button class="btn" style="background:#FF4757" onclick="confirmDelete()">Delete</button>' +
        '<button class="btn-out" onclick="openPrivacy()">Cancel</button>';
}

function confirmDelete() {
    var p = document.getElementById('delPass').value;
    if (!p) return showToast('Enter password', 'error');
    var cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, p);
    currentUser.reauthenticateWithCredential(cred).then(function() {
        return db.collection('users').doc(currentUser.uid).delete();
    }).then(function() { return currentUser.delete(); })
    .then(function() { showToast('Deleted! 👋'); setTimeout(function() { location.reload(); }, 2000); })
    .catch(function() { showToast('Wrong password', 'error'); });
}

function showFollowList(type) {
    openModal('genericModal');
    var title = type === 'followers' ? 'Followers' : 'Following';
    var ids = currentUserData[type] || [];
    var h = '<h2 style="color:#D4AF37;margin-bottom:15px">' + title + '</h2>';
    if (ids.length === 0) {
        h += '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:20px">No one</p><button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
        document.getElementById('genericContent').innerHTML = h;
    } else {
        h += '<div id="flist">Loading...</div><button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
        document.getElementById('genericContent').innerHTML = h;
        var items = '', done = 0;
        ids.forEach(function(id) {
            db.collection('users').doc(id).get().then(function(doc) {
                done++; var u = doc.data();
                if (u) items += '<div class="chat-item"><div style="width:40px;height:40px;border-radius:50%;background:#1a1f4e;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid #D4AF37">' + (u.name||'?')[0] + '</div><div style="flex:1"><b>' + u.name + '</b><br><small style="color:#D4AF37">' + u.username + '</small></div><button class="btn-out" style="width:auto;padding:6px 14px;font-size:11px" onclick="startChatUser(\'' + id + '\')">Chat</button></div>';
                if (done === ids.length) document.getElementById('flist').innerHTML = items;
            });
        });
    }
}
