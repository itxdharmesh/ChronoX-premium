// ==================== PROFILE ====================

function renderProfile(c) {
    var u = currentUserData || {};
    var name = u.name || 'User';
    var username = u.username || '@user';
    var bio = u.bio || 'No bio yet';
    var avatar = u.avatar || '';
    var followers = (u.followers || []).length;
    var following = (u.following || []).length;
    var levelTitle = (u.level && u.level.title) ? u.level.title : 'Explorer';
    var levelNum = (u.level && u.level.current) ? u.level.current : 1;
    var achievements = (u.stats && u.stats.achievements) ? u.stats.achievements : 0;
    var progress = (u.level && u.level.progress) ? (u.level.progress % 100) : 0;
    
    c.innerHTML = 
        '<div class="profile-header">' +
            '<div style="position:relative">' +
                '<img class="avatar" src="' + (avatar || av(name)) + '" id="pAv" onerror="this.src=av(\'' + name + '\')" style="width:85px;height:85px">' +
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
            '<div class="act-btn" onclick="editProfile()">✏️ Edit Profile</div>' +
            '<div class="act-btn" onclick="openPrivacy()">🔒 Privacy</div>' +
            '<div class="act-btn" onclick="shareProfile()">📤 Share</div>' +
            '<div class="act-btn" onclick="logout()">🚪 Logout</div>' +
        '</div>' +
        '<div class="card">' +
            '<div style="display:flex;justify-content:space-between;align-items:center">' +
                '<div>' +
                    '<div style="color:var(--gold);font-weight:600">' + levelTitle + '</div>' +
                    '<div style="font-size:11px;color:rgba(255,255,255,0.5)">Level ' + levelNum + '</div>' +
                '</div>' +
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
            toast('Profile picture updated! 📸');
        }).catch(function() {
            toast('Upload failed! Try again.', 'error');
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
        '<button class="btn" onclick="saveProfile()">Save Changes</button>' +
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
        toast('Profile updated! ✅');
    });
}

function shareProfile() {
    var username = currentUserData.username || '@user';
    navigator.clipboard.writeText(username).then(function() {
        toast('Username copied! 📋');
    }).catch(function() {
        toast('Failed to copy', 'error');
    });
}

function openPrivacy() {
    openModal('genericModal');
    document.getElementById('genericContent').innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px">🔒 Privacy Settings</h2>' +
        '<button class="btn-out" onclick="closeModal(\'genericModal\');showChangePassword()">🔑 Change Password</button>' +
        '<button class="btn-out" onclick="closeModal(\'genericModal\');showBlockedUsers()">🚫 Blocked Users</button>' +
        '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
}

function showChangePassword() {
    openModal('genericModal');
    document.getElementById('genericContent').innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px">🔑 Change Password</h2>' +
        '<input class="inp" id="oldPass" placeholder="Current Password" type="password">' +
        '<input class="inp" id="newPass" placeholder="New Password (6+ chars)" type="password">' +
        '<button class="btn" onclick="changePassword()">Update Password</button>' +
        '<button class="btn-out" onclick="closeModal(\'genericModal\')">Cancel</button>';
}

function changePassword() {
    var old = document.getElementById('oldPass').value;
    var newP = document.getElementById('newPass').value;
    
    if (!old || !newP) return toast('Fill all fields', 'error');
    if (newP.length < 6) return toast('Password: 6+ chars', 'error');
    
    var cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, old);
    currentUser.reauthenticateWithCredential(cred).then(function() {
        return currentUser.updatePassword(newP);
    }).then(function() {
        closeModal('genericModal');
        toast('Password updated! 🔒');
    }).catch(function() {
        toast('Wrong current password', 'error');
    });
}

function showBlockedUsers() {
    openModal('genericModal');
    var blocked = currentUserData.blockedUsers || [];
    
    var h = '<h2 style="color:var(--gold);margin-bottom:15px">🚫 Blocked Users</h2>';
    
    if (blocked.length === 0) {
        h += '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:20px">No blocked users</p>';
        h += '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
        document.getElementById('genericContent').innerHTML = h;
    } else {
        h += '<div id="blockedList"></div>';
        h += '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
        document.getElementById('genericContent').innerHTML = h;
        
        var itemsHtml = '';
        var loaded = 0;
        blocked.forEach(function(id) {
            db.collection('users').doc(id).get().then(function(doc) {
                var u = doc.data();
                loaded++;
                if (u) {
                    itemsHtml += '<div class="chat-item"><div class="av" style="width:40px;height:40px;font-size:18px">' + (u.name || '?')[0] + '</div><div style="flex:1"><b>' + u.name + '</b><br><small style="color:var(--gold-light)">' + u.username + '</small></div><button class="btn" style="width:auto;padding:6px 14px;font-size:11px" onclick="unblockUser(\'' + id + '\')">Unblock</button></div>';
                }
                if (loaded === blocked.length) {
                    document.getElementById('blockedList').innerHTML = itemsHtml;
                }
            });
        });
    }
}

function unblockUser(id) {
    db.collection('users').doc(currentUser.uid).update({
        blockedUsers: firebase.firestore.FieldValue.arrayRemove(id)
    }).then(function() {
        currentUserData.blockedUsers = (currentUserData.blockedUsers || []).filter(function(uid) { return uid !== id; });
        showBlockedUsers();
        toast('User unblocked! ✅');
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
        h += '<div id="followListItems"></div>';
        h += '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
        document.getElementById('genericContent').innerHTML = h;
        
        var itemsHtml = '';
        var loaded = 0;
        ids.forEach(function(id) {
            db.collection('users').doc(id).get().then(function(doc) {
                var u = doc.data();
                loaded++;
                if (u) {
                    itemsHtml += '<div class="chat-item"><div class="av" style="width:40px;height:40px;font-size:18px">' + (u.name || '?')[0] + '</div><div style="flex:1"><b>' + u.name + '</b><br><small style="color:var(--gold-light)">' + u.username + '</small></div><button class="btn-out" style="width:auto;padding:6px 14px;font-size:11px" onclick="startChatUser(\'' + id + '\')">Chat</button></div>';
                }
                if (loaded === ids.length) {
                    document.getElementById('followListItems').innerHTML = itemsHtml;
                }
            });
        });
    }
}

console.log('Profile loaded');
