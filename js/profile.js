function renderProfile(c) {
    var u = currentUserData || {};
    var name = (u.name && u.name !== 'undefined') ? u.name : 'User';
    var username = u.username || '@user';
    var bio = u.bio || 'No bio yet';
    var avatar = u.avatar || defaultAvatar(name);
    var followers = (u.followers || []).length;
    var following = (u.following || []).length;
    var posts = u.posts || 0;
    var coins = u.coins || 0;
    var xp = u.xp || 0;
    var level = (u.level && u.level.current) ? u.level.current : 1;
    var achievements = (u.stats && u.stats.achievements) ? u.stats.achievements : 0;
    
    c.innerHTML = 
        '<div style="text-align:center;padding:10px 0">' +
            '<div style="position:relative;display:inline-block">' +
                '<img src="' + avatar + '" style="width:85px;height:85px;border-radius:50%;border:3px solid #D4AF37;object-fit:cover;background:#1a1f4e" onerror="this.src=\'' + defaultAvatar(name) + '\'">' +
                '<label for="dpUpload" style="position:absolute;bottom:0;right:0;width:26px;height:26px;background:#D4AF37;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;border:2px solid #0A0E27">📷</label>' +
                '<input type="file" id="dpUpload" accept="image/*" hidden onchange="uploadDP()">' +
            '</div>' +
        '</div>' +
        
        '<div style="display:flex;justify-content:space-around;text-align:center;margin:15px 0">' +
            '<div><b style="font-size:18px;color:#fff">' + posts + '</b><br><small style="color:rgba(255,255,255,0.6)">Posts</small></div>' +
            '<div onclick="showFollowList(\'followers\')" style="cursor:pointer"><b style="font-size:18px;color:#fff">' + followers + '</b><br><small style="color:rgba(255,255,255,0.6)">Followers</small></div>' +
            '<div onclick="showFollowList(\'following\')" style="cursor:pointer"><b style="font-size:18px;color:#fff">' + following + '</b><br><small style="color:rgba(255,255,255,0.6)">Following</small></div>' +
        '</div>' +
        
        '<div style="padding:0 5px">' +
            '<h3 style="font-size:15px;font-weight:600">' + name + '</h3>' +
            '<p style="color:#D4AF37;font-size:13px">' + username + '</p>' +
            '<p style="color:rgba(255,255,255,0.7);font-size:13px;margin:5px 0">' + bio + '</p>' +
            '<p style="color:rgba(255,255,255,0.4);font-size:11px">💰' + coins + ' • ⚡' + xp + ' • Lv.' + level + ' • 🏆' + achievements + '</p>' +
        '</div>' +
        
        '<div style="display:flex;gap:8px;margin:15px 0">' +
            '<button onclick="editProfile()" style="flex:1;padding:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:12px;cursor:pointer">Edit Profile</button>' +
            '<button onclick="shareProfile()" style="flex:1;padding:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:8px;color:#fff;font-size:12px;cursor:pointer">Share</button>' +
        '</div>' +
        
        '<button onclick="openPrivacy()" class="btn-out">🔒 Privacy</button>' +
        '<button onclick="openShop()" class="btn-out">🛍️ Shop</button>' +
        '<button onclick="logout()" class="btn-out" style="color:#FF4757;border-color:#FF4757">🚪 Logout</button>';
}

function uploadDP() {
    var file = document.getElementById('dpUpload').files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        db.collection('users').doc(currentUser.uid).update({ avatar: e.target.result }).then(function() {
            currentUserData.avatar = e.target.result;
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
        '<input class="inp" id="editName" value="' + (currentUserData.name||'') + '" placeholder="Name">' +
        '<input class="inp" id="editBio" value="' + (currentUserData.bio||'') + '" placeholder="Bio">' +
        '<button class="btn" onclick="saveProfile()">Save</button>' +
        '<button class="btn-out" onclick="closeModal(\'genericModal\')">Cancel</button>';
}

function saveProfile() {
    var n = document.getElementById('editName').value.trim();
    var b = document.getElementById('editBio').value.trim();
    if (!n) return showToast('Name required', 'error');
    db.collection('users').doc(currentUser.uid).update({ name: n, bio: b }).then(function() {
        currentUserData.name = n; currentUserData.bio = b;
        closeModal('genericModal'); navigate('profile'); showToast('Saved! ✅');
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
    }
}

function showFollowList(type) {
    openModal('genericModal');
    var title = type === 'followers' ? 'Followers' : 'Following';
    var ids = currentUserData[type] || [];
    var h = '<h2 style="color:#D4AF37;margin-bottom:15px">' + title + '</h2>';
    if (ids.length === 0) {
        h += '<p style="text-align:center;padding:20px">No one</p>';
    }
    h += '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
    document.getElementById('genericContent').innerHTML = h;
}
