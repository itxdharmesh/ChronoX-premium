// ==================== PROFILE ====================
function renderProfile(c) {
    var u = currentUserData || {};
    var name = (u.name && u.name !== 'undefined') ? u.name : 'User';
    var username = (u.username && u.username !== 'undefined') ? u.username : '@user';
    var bio = (u.bio && u.bio !== 'undefined') ? u.bio : 'No bio yet';
    var avatar = (u.avatar && u.avatar.length > 10) ? u.avatar : '';
    var followers = (u.followers || []).length;
    var following = (u.following || []).length;
    var levelTitle = (u.level && u.level.title) ? u.level.title : 'Explorer';
    var levelNum = (u.level && u.level.current) ? u.level.current : 1;
    var achievements = (u.stats && u.stats.achievements) ? u.stats.achievements : 0;
    var progress = (u.level && u.level.progress) ? (u.level.progress % 100) : 0;
    var xp = u.xp || 0;
    
    var displayAvatar = avatar || defaultAvatar(name);
    
    c.innerHTML = 
        '<div class="profile-header">' +
            '<div style="position:relative">' +
                '<img class="avatar" src="' + displayAvatar + '" id="pAv" onerror="this.src=\'' + defaultAvatar(name) + '\'" style="width:85px;height:85px">' +
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
        '<div class="card" style="padding:12px">' +
            '<div style="display:flex;justify-content:space-around;text-align:center">' +
                '<div><b style="color:var(--gold)">' + xp + '</b><br><small>XP</small></div>' +
                '<div><b style="color:var(--gold)">' + levelNum + '</b><br><small>Level</small></div>' +
                '<div><b style="color:var(--gold)">' + achievements + '</b><br><small>🏆</small></div>' +
            '</div>' +
            '<div style="width:100%;height:6px;background:rgba(255,255,255,0.1);border-radius:10px;overflow:hidden;margin-top:8px">' +
                '<div style="width:' + progress + '%;height:100%;background:linear-gradient(90deg,#D4AF37,#F5E6A3);border-radius:10px"></div>' +
            '</div>' +
        '</div>' +
        '<div class="actions">' +
            '<div class="act-btn" onclick="editProfile()">✏️ Edit</div>' +
            '<div class="act-btn" onclick="showAchievements()">🏆 Achievements</div>' +
            '<div class="act-btn" onclick="openPrivacy()">🔒 Privacy</div>' +
            '<div class="act-btn" onclick="shareProfile()">📤 Share</div>' +
        '</div>' +
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
            document.getElementById('pAv').src = base64;
            showToast('Done! 📸');
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
        '<h2 style="color:var(--gold);margin-bottom:15px">🔒 Privacy</h2>' +
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
        '<h2 style="color:var(--gold);margin-bottom:15px">🔑 Change Password</h2>' +
        '<input class="inp" id="oldPass" placeholder="Current Password" type="password">' +
        '<input class="inp" id="newPass" placeholder="New Password (6+)" type="password">' +
        '<button class="btn" onclick="changePassword()">Update</button>' +
        '<button class="btn-out" onclick="openPrivacy()">Back</button>';
}

function changePassword() {
    var o=document.getElementById('oldPass').value, n=document.getElementById('newPass').value;
    if(!o||!n) return showToast('Fill all fields','error');
    if(n.length<6) return showToast('Min 6 chars','error');
    var cred=firebase.auth.EmailAuthProvider.credential(currentUser.email,o);
    currentUser.reauthenticateWithCredential(cred).then(function(){return currentUser.updatePassword(n);}).then(function(){closeModal('genericModal');showToast('Updated! 🔒');}).catch(function(){showToast('Wrong password','error');});
}

function showBlockedUsers() {
    var blocked=currentUserData.blockedUsers||[];
    var h='<h2 style="color:var(--gold);margin-bottom:15px">🚫 Blocked</h2>';
    if(blocked.length===0){h+='<p style="text-align:center;color:var(--text2);padding:20px">None</p><button class="btn-out" onclick="openPrivacy()">Back</button>';document.getElementById('genericContent').innerHTML=h;}
    else{h+='<div id="blockedList">Loading...</div><button class="btn-out" onclick="openPrivacy()">Back</button>';document.getElementById('genericContent').innerHTML=h;
        var items='',done=0;
        blocked.forEach(function(id){db.collection('users').doc(id).get().then(function(doc){done++;var u=doc.data();if(u)items+='<div class="chat-item"><div class="av" style="width:40px;height:40px">'+(u.name||'?')[0]+'</div><div style="flex:1"><b>'+u.name+'</b></div><button class="btn" style="width:auto;padding:6px 14px" onclick="unblockUser(\''+id+'\')">Unblock</button></div>';if(done===blocked.length)document.getElementById('blockedList').innerHTML=items;});});}
}

function unblockUser(id){db.collection('users').doc(currentUser.uid).update({blockedUsers:firebase.firestore.FieldValue.arrayRemove(id)}).then(function(){currentUserData.blockedUsers=(currentUserData.blockedUsers||[]).filter(function(uid){return uid!==id;});showBlockedUsers();showToast('Unblocked! ✅');});}

function deleteAccount(){document.getElementById('genericContent').innerHTML='<h2 style="color:#FF4757;margin-bottom:15px">🗑️ Delete</h2><p style="color:var(--text2);font-size:13px;margin-bottom:15px">Cannot be undone!</p><input class="inp" id="delPass" placeholder="Password" type="password"><button class="btn" style="background:#FF4757" onclick="confirmDelete()">Delete</button><button class="btn-out" onclick="openPrivacy()">Cancel</button>';}

function confirmDelete(){var p=document.getElementById('delPass').value;if(!p)return showToast('Enter password','error');var cred=firebase.auth.EmailAuthProvider.credential(currentUser.email,p);currentUser.reauthenticateWithCredential(cred).then(function(){return db.collection('users').doc(currentUser.uid).delete();}).then(function(){return currentUser.delete();}).then(function(){showToast('Deleted! 👋');setTimeout(function(){location.reload();},2000);}).catch(function(){showToast('Wrong password','error');});}

function showFollowList(type) {
    openModal('genericModal');
    var title = type === 'followers' ? 'Followers' : 'Following';
    var ids = currentUserData[type] || [];
    var h = '<h2 style="color:var(--gold);margin-bottom:15px">' + title + '</h2>';
    if (ids.length === 0) {
        h += '<p style="text-align:center;color:var(--text2);padding:20px">No one yet</p><button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
        document.getElementById('genericContent').innerHTML = h;
    } else {
        h += '<div id="followListItems">Loading...</div><button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
        document.getElementById('genericContent').innerHTML = h;
        var items = '', done = 0;
        ids.forEach(function(id) {
            db.collection('users').doc(id).get().then(function(doc) {
                done++;
                var u = doc.data();
                if (u) items += '<div class="chat-item"><div class="av" style="width:40px;height:40px">' + (u.name||'?')[0] + '</div><div style="flex:1;cursor:pointer" onclick="viewUserProfile(\'' + id + '\')"><b>' + u.name + '</b><br><small style="color:var(--gold-light)">' + u.username + '</small></div><button class="btn-out" style="width:auto;padding:6px 14px" onclick="event.stopPropagation();startChatUser(\'' + id + '\')">Chat</button></div>';
                if (done === ids.length) document.getElementById('followListItems').innerHTML = items;
            });
        });
    }
}

console.log('✅ Profile loaded');
