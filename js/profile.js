function renderProfile(c) {
    var u = currentUserData || {};
    var name = (u.name && u.name !== 'undefined') ? u.name : 'User';
    var username = u.username || '@user';
    var bio = u.bio || '';
    var avatar = u.avatar || defaultAvatar(name);
    var followers = (u.followers || []).length;
    var following = (u.following || []).length;
    var posts = u.posts || 0;
    
    c.innerHTML = 
        // HEADER - DP + STATS IN ONE ROW
        '<div style="display:flex;align-items:center;padding:10px 0;gap:20px">' +
            // DP
            '<div style="position:relative;flex-shrink:0">' +
                '<img src="' + avatar + '" style="width:80px;height:80px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover;background:#1a1f4e" onerror="this.src=\'' + defaultAvatar(name) + '\'">' +
                '<label for="dpUpload" style="position:absolute;bottom:0;right:0;width:24px;height:24px;background:#D4AF37;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:12px;border:2px solid #0A0E27">📷</label>' +
                '<input type="file" id="dpUpload" accept="image/*" hidden onchange="uploadDP()">' +
            '</div>' +
            // STATS
            '<div style="display:flex;gap:25px;flex:1;justify-content:center">' +
                '<div style="text-align:center"><b style="font-size:18px;color:#fff">' + posts + '</b><br><span style="font-size:11px;color:rgba(255,255,255,0.6)">Posts</span></div>' +
                '<div style="text-align:center;cursor:pointer" onclick="showFollowList(\'followers\')"><b style="font-size:18px;color:#fff">' + followers + '</b><br><span style="font-size:11px;color:rgba(255,255,255,0.6)">Followers</span></div>' +
                '<div style="text-align:center;cursor:pointer" onclick="showFollowList(\'following\')"><b style="font-size:18px;color:#fff">' + following + '</b><br><span style="font-size:11px;color:rgba(255,255,255,0.6)">Following</span></div>' +
            '</div>' +
        '</div>' +
        
        // BIO SECTION
        '<div style="padding:5px 0">' +
            '<span style="font-size:14px;font-weight:600">' + name + '</span><br>' +
            '<span style="color:#D4AF37;font-size:13px">' + username + '</span><br>' +
            (bio ? '<span style="color:rgba(255,255,255,0.8);font-size:13px">' + bio + '</span>' : '') +
        '</div>' +
        
        // EDIT + SHARE BUTTONS
        '<div style="display:flex;gap:8px;margin:12px 0">' +
            '<button onclick="editProfile()" style="flex:1;padding:7px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:12px;font-weight:600;cursor:pointer">Edit Profile</button>' +
            '<button onclick="shareProfile()" style="flex:1;padding:7px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:12px;font-weight:600;cursor:pointer">Share Profile</button>' +
        '</div>' +
        
        // DISCOVER BUTTON
        '<button onclick="navigate(\'search\')" style="width:100%;padding:7px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;margin-bottom:8px">🔍 Discover People</button>' +
        
        // MENU OPTIONS
        '<button onclick="openPrivacy()" class="btn-out" style="font-size:12px">🔒 Privacy & Settings</button>' +
        '<button onclick="logout()" class="btn-out" style="color:#FF4757;border-color:#FF4757;font-size:12px">🚪 Logout</button>';
}

function uploadDP() {
    var file = document.getElementById('dpUpload').files[0];
    if (!file) return;
    showToast('Uploading...');
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
        '<h2 style="color:#D4AF37;margin-bottom:15px">✏️ Edit Profile</h2>' +
        '<input class="inp" id="editName" value="' + (currentUserData.name||'') + '" placeholder="Name">' +
        '<input class="inp" id="editUsername" value="' + (currentUserData.username||'').replace('@','') + '" placeholder="Username">' +
        '<input class="inp" id="editBio" value="' + (currentUserData.bio||'') + '" placeholder="Bio">' +
        '<button class="btn" onclick="saveProfile()">Save</button>' +
        '<button class="btn-out" onclick="closeModal(\'genericModal\')">Cancel</button>';
}

function saveProfile() {
    var n = document.getElementById('editName').value.trim();
    var u = document.getElementById('editUsername').value.trim();
    var b = document.getElementById('editBio').value.trim();
    if (!n) return showToast('Name required', 'error');
    
    var update = { name: n, bio: b };
    if (u && u !== (currentUserData.username||'').replace('@','')) {
        var nu = '@' + u;
        db.collection('users').where('username','==',nu).get().then(function(snap) {
            if (!snap.empty && snap.docs[0].id !== currentUser.uid) return showToast('Username taken!','error');
            update.username = nu;
            db.collection('users').doc(currentUser.uid).update(update).then(function() {
                currentUserData.name = n; currentUserData.bio = b; currentUserData.username = nu;
                closeModal('genericModal'); navigate('profile'); showToast('Saved! ✅');
            });
        });
    } else {
        db.collection('users').doc(currentUser.uid).update(update).then(function() {
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
        '<button class="btn-out" onclick="showChangePassword()">🔑 Change Password</button>' +
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

function showFollowList(type) {
    openModal('genericModal');
    var title = type === 'followers' ? 'Followers' : 'Following';
    var ids = currentUserData[type] || [];
    var h = '<h2 style="color:#D4AF37;margin-bottom:15px">' + title + '</h2>';
    if (ids.length === 0) {
        h += '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:20px">No one yet</p>';
    } else {
        h += '<div id="flist">Loading...</div>';
        document.getElementById('genericContent').innerHTML = h + '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
        var items = '', done = 0;
        ids.forEach(function(id) {
            db.collection('users').doc(id).get().then(function(doc) {
                done++; var u = doc.data();
                if (u) items += '<div class="chat-item"><div style="width:36px;height:36px;border-radius:50%;background:#1a1f4e;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #D4AF37;flex-shrink:0">' + (u.name||'?')[0] + '</div><div style="flex:1"><b>' + u.name + '</b><br><small style="color:#D4AF37">' + u.username + '</small></div><button class="btn-out" style="width:auto;padding:5px 12px;font-size:10px" onclick="startChatUser(\'' + id + '\');closeModal(\'genericModal\')">Chat</button></div>';
                if (done === ids.length) document.getElementById('flist').innerHTML = items;
            });
        });
        return;
    }
    h += '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
    document.getElementById('genericContent').innerHTML = h;
                                                      }
