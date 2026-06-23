function renderProfile(c) {
    var u = currentUserData || {};
    var name = (u.name && u.name !== 'undefined') ? u.name : 'User';
    var username = u.username || '@user';
    var bio = u.bio || 'No bio yet';
    var avatar = u.avatar || defaultAvatar(name);
    var followers = (u.followers || []).length;
    var following = (u.following || []).length;
    var coins = u.coins || 0;
    var xp = u.xp || 0;
    var level = (u.level && u.level.current) ? u.level.current : 1;
    var title = (u.level && u.level.title) ? u.level.title : 'Explorer';
    var achievements = (u.stats && u.stats.achievements) ? u.stats.achievements : 0;
    
    c.innerHTML = 
        // DP + NAME + USERNAME
        '<div style="text-align:center;margin-bottom:20px">' +
            '<div style="position:relative;display:inline-block">' +
                '<img src="' + avatar + '" style="width:90px;height:90px;border-radius:50%;border:3px solid #D4AF37;object-fit:cover;background:#1a1f4e" onerror="this.src=\'' + defaultAvatar(name) + '\'">' +
                '<label for="dpUpload" style="position:absolute;bottom:0;right:0;width:30px;height:30px;background:#D4AF37;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;border:2px solid #0A0E27">📷</label>' +
                '<input type="file" id="dpUpload" accept="image/*" hidden onchange="uploadDP()">' +
            '</div>' +
            '<h2 style="color:#fff;margin-top:10px;font-size:20px">' + name + '</h2>' +
            '<p style="color:#D4AF37;font-size:14px">' + username + '</p>' +
            '<p style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:5px">' + bio + '</p>' +
        '</div>' +
        
        // FOLLOW STATS
        '<div class="card" style="display:flex;justify-content:space-around;text-align:center;padding:15px">' +
            '<div onclick="showFollowList(\'followers\')" style="cursor:pointer">' +
                '<div style="font-size:22px;font-weight:700;color:#D4AF37">' + followers + '</div>' +
                '<div style="font-size:11px;color:rgba(255,255,255,0.6)">Followers</div>' +
            '</div>' +
            '<div onclick="showFollowList(\'following\')" style="cursor:pointer">' +
                '<div style="font-size:22px;font-weight:700;color:#D4AF37">' + following + '</div>' +
                '<div style="font-size:11px;color:rgba(255,255,255,0.6)">Following</div>' +
            '</div>' +
        '</div>' +
        
        // COINS + XP + LEVEL + ACHIEVEMENTS
        '<div class="card" style="padding:15px">' +
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);text-align:center;gap:10px">' +
                '<div><div style="font-size:18px;font-weight:700;color:#D4AF37">💰</div><div style="font-size:14px;font-weight:700;color:#D4AF37">' + coins + '</div><div style="font-size:10px;color:rgba(255,255,255,0.5)">Coins</div></div>' +
                '<div><div style="font-size:18px;font-weight:700;color:#00D4FF">⚡</div><div style="font-size:14px;font-weight:700;color:#00D4FF">' + xp + '</div><div style="font-size:10px;color:rgba(255,255,255,0.5)">XP</div></div>' +
                '<div><div style="font-size:18px;font-weight:700;color:#2ED573">🆙</div><div style="font-size:14px;font-weight:700;color:#2ED573">Lv.' + level + '</div><div style="font-size:10px;color:rgba(255,255,255,0.5)">' + title + '</div></div>' +
                '<div><div style="font-size:18px;font-weight:700;color:#FFA502">🏆</div><div style="font-size:14px;font-weight:700;color:#FFA502">' + achievements + '</div><div style="font-size:10px;color:rgba(255,255,255,0.5)">Badges</div></div>' +
            '</div>' +
        '</div>' +
        
        // ACTION BUTTONS
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:10px">' +
            '<button class="btn-out" onclick="editProfile()">✏️ Edit Profile</button>' +
            '<button class="btn-out" onclick="openShop()">🛍️ Shop</button>' +
            '<button class="btn-out" onclick="openPrivacy()">🔒 Privacy</button>' +
            '<button class="btn-out" onclick="shareProfile()">📤 Share</button>' +
        '</div>' +
        
        // LOGOUT
        '<button class="btn-out" onclick="logout()" style="color:#FF4757;border-color:#FF4757">🚪 Logout</button>';
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
        '<h2 style="color:#D4AF37;margin-bottom:15px">✏️ Edit</h2>' +
        '<input class="inp" id="editName" value="' + (currentUserData.name || '') + '" placeholder="Name">' +
        '<input class="inp" id="editBio" value="' + (currentUserData.bio || '') + '" placeholder="Bio">' +
        '<button class="btn" onclick="saveProfile()">Save</button>' +
        '<button class="btn-out" onclick="closeModal(\'genericModal\')">Cancel</button>';
}

function saveProfile() {
    var n = document.getElementById('editName').value.trim();
    var b = document.getElementById('editBio').value.trim();
    if (!n) return showToast('Name required', 'error');
    db.collection('users').doc(currentUser.uid).update({ name: n, bio: b }).then(function() {
        currentUserData.name = n; currentUserData.bio = b;
        closeModal('genericModal'); navigate('profile');
        showToast('Saved! ✅');
    });
}

function shareProfile() {
    navigator.clipboard.writeText(currentUserData.username || '@user').then(function() { showToast('Copied! 📋'); });
}

function openPrivacy() {
    openModal('genericModal');
    document.getElementById('genericContent').innerHTML = 
        '<h2 style="color:#D4AF37;margin-bottom:15px">🔒 Privacy</h2>' +
        '<button class="btn-out" onclick="showChangePassword()">🔑 Change Password</button>' +
        '<button class="btn-out" onclick="showBlockedUsers()">🚫 Blocked Users</button>' +
        '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
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
                done++;
                var u = doc.data();
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
                done++;
                var u = doc.data();
                if (u) items += '<div class="chat-item"><div style="width:40px;height:40px;border-radius:50%;background:#1a1f4e;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid #D4AF37">' + (u.name||'?')[0] + '</div><div style="flex:1"><b>' + u.name + '</b><br><small style="color:#D4AF37">' + u.username + '</small></div><button class="btn-out" style="width:auto;padding:6px 14px;font-size:11px" onclick="startChatUser(\'' + id + '\')">Chat</button></div>';
                if (done === ids.length) document.getElementById('flist').innerHTML = items;
            });
        });
    }
}
