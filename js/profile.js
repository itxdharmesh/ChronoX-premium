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
    var progress = (u.level && u.level.progress) ? (u.level.progress % 200) : 0;
    
    c.innerHTML = 
        '<div class="profile-container">' +
            '<div class="profile-header">' +
                '<div class="profile-avatar-wrap">' +
                    '<img src="' + avatar + '" class="profile-avatar" onerror="this.src=\'' + defaultAvatar(name) + '\'">' +
                    '<label for="dpUpload" class="profile-avatar-edit">📷</label>' +
                    '<input type="file" id="dpUpload" accept="image/*" hidden onchange="uploadDP()">' +
                '</div>' +
                '<div class="profile-stats">' +
                    '<div class="profile-stat" onclick="showFollowList(\'followers\')">' +
                        '<span class="profile-stat-num">' + followers + '</span>' +
                        '<span class="profile-stat-label">Followers</span>' +
                    '</div>' +
                    '<div class="profile-stat" onclick="showFollowList(\'following\')">' +
                        '<span class="profile-stat-num">' + following + '</span>' +
                        '<span class="profile-stat-label">Following</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="profile-info">' +
                '<h2 class="profile-name">' + name + '</h2>' +
                '<p class="profile-username">' + username + '</p>' +
                '<p class="profile-bio">' + bio + '</p>' +
            '</div>' +
            '<div class="profile-stats-card">' +
                '<div class="profile-stats-row">' +
                    '<div class="profile-stat-item"><span class="ps-value gold">💰 ' + coins + '</span><span class="ps-label">Coins</span></div>' +
                    '<div class="profile-stat-item"><span class="ps-value blue">⚡ ' + xp + '</span><span class="ps-label">XP</span></div>' +
                    '<div class="profile-stat-item"><span class="ps-value green">Lv.' + level + '</span><span class="ps-label">' + title + '</span></div>' +
                    '<div class="profile-stat-item"><span class="ps-value gold">' + achievements + '</span><span class="ps-label">🏆</span></div>' +
                '</div>' +
                '<div class="profile-progress"><div class="profile-progress-fill" style="width:' + progress + '%"></div></div>' +
            '</div>' +
            '<div class="profile-actions">' +
                '<button class="profile-btn" onclick="editProfile()">✏️ Edit</button>' +
                '<button class="profile-btn" onclick="openShop()">🛍️ Shop</button>' +
                '<button class="profile-btn" onclick="openPrivacy()">🔒 Privacy</button>' +
                '<button class="profile-btn" onclick="shareProfile()">📤 Share</button>' +
            '</div>' +
            '<button class="profile-logout" onclick="logout()">🚪 Logout</button>' +
        '</div>';
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
