// ==================== PROFILE ====================

function renderProfile(c) {
    var u = currentUserData || {};
    var name = u.name || 'User';
    var username = u.username || '@user';
    var bio = u.bio || 'No bio yet';
    var avatar = u.avatar || av(name);
    var followers = (u.followers || []).length;
    var following = (u.following || []).length;
    var levelTitle = (u.level && u.level.title) ? u.level.title : 'Explorer';
    var levelNum = (u.level && u.level.current) ? u.level.current : 1;
    var achievements = (u.stats && u.stats.achievements) ? u.stats.achievements : 0;
    var progress = (u.level && u.level.progress) ? (u.level.progress % 100) : 0;
    
    c.innerHTML = 
        '<div class="profile-header">' +
            '<div style="position:relative">' +
                '<img class="avatar" src="' + avatar + '" id="pAv" onerror="this.src=\'' + av(name) + '\'" style="width:85px;height:85px">' +
                '<label for="dpUpload" style="position:absolute;bottom:0;right:0;width:28px;height:28px;background:#D4AF37;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;border:2px solid #0A0E27">📷</label>' +
                '<input type="file" id="dpUpload" accept="image/*" hidden onchange="uploadDP()">' +
            '</div>' +
            '<div class="stats">' +
                '<div class="stat" onclick="showFollowList(\'followers\')"><span class="stat-num">' + followers + '</span><span class="stat-label">Followers</span></div>' +
                '<div class="stat" onclick="showFollowList(\'following\')"><span class="stat-num">' + following + '</span><span class="stat-label">Following</span></div>' +
            '</div>' +
        '</div>' +
        '<h3>' + name + '</h3>' +
        '<p style="color:var(--gold-light);font-size:14px">' + username + '</p>' +
        '<p style="color:rgba(255,255,255,0.6);font-size:13px;margin:8px 0">' + bio + '</p>' +
        '<div class="actions">' +
            '<div class="act-btn" onclick="editProfile()">✏️ Edit</div>' +
            '<div class="act-btn" onclick="openPrivacy()">🔒 Privacy</div>' +
            '<div class="act-btn" onclick="shareProfile()">📤 Share</div>' +
            '<div class="act-btn" onclick="logout()">🚪 Logout</div>' +
        '</div>' +
        '<div class="card">' +
            '<div style="display:flex;justify-content:space-between;align-items:center">' +
                '<div><div style="color:var(--gold);font-weight:600">' + levelTitle + '</div><div style="font-size:11px;color:rgba(255,255,255,0.5)">Level ' + levelNum + '</div></div>' +
                '<div style="color:var(--gold);font-weight:600">🏆 ' + achievements + '</div>' +
            '</div>' +
            '<div style="width:100%;height:6px;background:rgba(255,255,255,0.1);border-radius:10px;overflow:hidden;margin-top:10px">' +
                '<div style="width:' + progress + '%;height:100%;background:linear-gradient(90deg,#D4AF37,#F5E6A3);border-radius:10px"></div>' +
            '</div>' +
        '</div>';
}

function uploadDP() {
    var file = document.getElementById('dpUpload').files[0];
    if (!file) return;
    toast('Uploading...');
    var reader = new FileReader();
    reader.onload = function(e) {
        var base64 = e.target.result;
        db.collection('users').doc(currentUser.uid).update({ avatar: base64 }).then(function() {
            currentUserData.avatar = base64;
            document.getElementById('pAv').src = base64;
            toast('Done! 📸');
        });
    };
    reader.readAsDataURL(file);
}

function editProfile() {
    openModal('genericModal');
    document.getElementById('genericContent').innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px">✏️ Edit Profile</h2>' +
        '<input class="inp" id="editName" value="' + (currentUserData.name || '') + '" placeholder="Name">' +
        '<input class="inp" id="editBio" value="' + (currentUserData.bio || '') + '" placeholder="Bio">' +
        '<button class="btn" onclick="saveProfile()">Save</button>' +
        '<button class="btn-out" onclick="closeModal(\'genericModal\')">Cancel</button>';
}

function saveProfile() {
    var n = document.getElementById('editName').value.trim();
    var b = document.getElementById('editBio').value.trim();
    if (!n) return toast('Name required', 'error');
    db.collection('users').doc(currentUser.uid).update({ name: n, bio: b }).then(function() {
        currentUserData.name = n;
        currentUserData.bio = b;
        closeModal('genericModal');
        navigate('profile');
        toast('Saved! ✅');
    });
}

function shareProfile() {
    navigator.clipboard.writeText(currentUserData.username || '@user').then(function() {
        toast('Copied! 📋');
    });
}

function openPrivacy() {
    openModal('genericModal');
    document.getElementById('genericContent').innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px">🔒 Privacy</h2>' +
        '<button class="btn-out" onclick="showChangePassword()">🔑 Change Password</button>' +
        '<button class="btn-out" onclick="showBlockedUsers()">🚫 Blocked Users</button>' +
        '<button class="btn-out" onclick="deleteAccount()" style="color:#FF4757;border-color:#FF4757">🗑️ Delete Account</button>' +
        '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
}

function showChangePassword() {
    document.getElementById('genericContent').innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px">🔑 Change Password</h2>' +
        '<input class="inp" id="oldPass" placeholder="Current Password" type="password">' +
        '<input class="inp" id="newPass" placeholder="New Password (6+)" type="password">' +
        '<button class="btn" onclick="changePassword()">Update</button>' +
        '<button class="btn-out" onclick="openPrivacy()">Back</button>';
}

function changePassword() {
    var old = document.getElementById('oldPass').value;
    var newP = document.getElementById('newPass').value;
    if (!old || !newP) return toast('Fill all fields', 'error');
    if (newP.length < 6) return toast('Min 6 chars', 'error');
    var cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, old);
    currentUser.reauthenticateWithCredential(cred).then(function() {
        return currentUser.updatePassword(newP);
    }).then(function() {
        closeModal('genericModal');
        toast('Updated! 🔒');
    }).catch(function() {
        toast('Wrong password', 'error');
    });
}

function showBlockedUsers() {
    var blocked = currentUserData.blockedUsers || [];
    var h = '<h2 style="color:var(--gold);margin-bottom:15px">🚫 Blocked Users</h2>';
    if (blocked.length === 0) {
        h += '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:20px">None</p>';
    } else {
        blocked.forEach(function(id) {
            db.collection('users').doc(id).get().then(function(doc) {
                var u = doc.data();
                if (u) h += '<div class="chat-item"><div class="av" style="width:40px;height:40px">' + (u.name||'?')[0] + '</div><div style="flex:1"><b>' + u.name + '</b></div><button class="btn" style="width:auto;padding:6px 14px" onclick="unblockUser(\'' + id + '\')">Unblock</button></div>';
                document.getElementById('genericContent').innerHTML = h + '<button class="btn-out" onclick="openPrivacy()">Back</button>';
            });
        });
        h += '<button class="btn-out" onclick="openPrivacy()">Back</button>';
    }
    document.getElementById('genericContent').innerHTML = h;
}

function unblockUser(id) {
    db.collection('users').doc(currentUser.uid).update({ blockedUsers: firebase.firestore.FieldValue.arrayRemove(id) }).then(function() {
        currentUserData.blockedUsers = (currentUserData.blockedUsers || []).filter(function(uid) { return uid !== id; });
        showBlockedUsers();
        toast('Unblocked! ✅');
    });
}

function deleteAccount() {
    document.getElementById('genericContent').innerHTML = 
        '<h2 style="color:#FF4757;margin-bottom:15px">🗑️ Delete Account</h2>' +
        '<p style="color:rgba(255,255,255,0.6);font-size:13px;margin-bottom:15px">This cannot be undone! All your data will be permanently deleted.</p>' +
        '<input class="inp" id="delPass" placeholder="Enter password to confirm" type="password">' +
        '<input class="inp" id="delReason" placeholder="Reason for leaving (optional)">' +
        '<button class="btn" style="background:#FF4757" onclick="confirmDelete()">Delete My Account</button>' +
        '<button class="btn-out" onclick="openPrivacy()">Cancel</button>';
}

function confirmDelete() {
    var pass = document.getElementById('delPass').value;
    var reason = document.getElementById('delReason').value;
    if (!pass) return toast('Enter password', 'error');
    var cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, pass);
    currentUser.reauthenticateWithCredential(cred).then(function() {
        return db.collection('users').doc(currentUser.uid).delete();
    }).then(function() {
        return currentUser.delete();
    }).then(function() {
        toast('Account deleted! Goodbye 👋');
        setTimeout(function() { location.reload(); }, 2000);
    }).catch(function() {
        toast('Wrong password', 'error');
    });
}

function showFollowList(type) {
    openModal('genericModal');
    var title = type === 'followers' ? 'Followers' : 'Following';
    var ids = currentUserData[type] || [];
    var h = '<h2 style="color:var(--gold);margin-bottom:15px">' + title + '</h2>';
    if (ids.length === 0) {
        h += '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:20px">No one yet</p>';
        h += '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
        document.getElementById('genericContent').innerHTML = h;
    } else {
        h += '<div id="followListItems">Loading...</div>';
        h += '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
        document.getElementById('genericContent').innerHTML = h;
        var items = '';
        var done = 0;
        ids.forEach(function(id) {
            db.collection('users').doc(id).get().then(function(doc) {
                done++;
                var u = doc.data();
                if (u) items += '<div class="chat-item"><div class="av" style="width:40px;height:40px">' + (u.name||'?')[0] + '</div><div style="flex:1"><b>' + u.name + '</b><br><small style="color:var(--gold-light)">' + u.username + '</small></div><button class="btn-out" style="width:auto;padding:6px 14px" onclick="startChatUser(\'' + id + '\')">Chat</button></div>';
                if (done === ids.length) document.getElementById('followListItems').innerHTML = items;
            });
        });
    }
}

console.log('Profile loaded');
