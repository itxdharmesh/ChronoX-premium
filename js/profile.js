// ==================== PROFILE ====================

function renderProfile(c) {
    var u = currentUserData;
    c.innerHTML = `
        <div class="profile-header">
            <img class="avatar" src="${u.avatar || av(u.name)}" id="pAv" onerror="this.src=av('${u.name}')">
            <div class="stats">
                <div class="stat" onclick="showFollowList('followers')"><span class="stat-num">${(u.followers||[]).length}</span><span class="stat-label">Followers</span></div>
                <div class="stat" onclick="showFollowList('following')"><span class="stat-num">${(u.following||[]).length}</span><span class="stat-label">Following</span></div>
            </div>
        </div>
        <h3>${u.name}</h3>
        <p style="color:var(--gold-light);font-size:14px">${u.username}</p>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:8px 0">${u.bio || 'No bio yet'}</p>
        <div class="actions">
            <div class="act-btn" onclick="editProfile()">✏️ Edit Profile</div>
            <div class="act-btn" onclick="shareProfile()">📤 Share</div>
            <div class="act-btn" onclick="logout()">🚪 Logout</div>
        </div>
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                    <div style="color:var(--gold);font-weight:600">${u.level?.title || 'Explorer'}</div>
                    <div style="font-size:11px;color:rgba(255,255,255,0.5)">Level ${u.level?.current || 1}</div>
                </div>
                <div style="color:var(--gold);font-weight:600">🏆 ${u.stats?.achievements || 0}</div>
            </div>
            <div style="width:100%;height:6px;background:rgba(255,255,255,0.1);border-radius:10px;overflow:hidden;margin-top:10px">
                <div style="width:${(u.level?.progress || 0) % 100}%;height:100%;background:linear-gradient(90deg,#D4AF37,#F5E6A3);border-radius:10px"></div>
            </div>
        </div>`;
}

function editProfile() {
    openModal('genericModal');
    document.getElementById('genericContent').innerHTML = `
        <h2 style="color:var(--gold);margin-bottom:15px">✏️ Edit Profile</h2>
        <input class="inp" id="editName" value="${currentUserData.name || ''}" placeholder="Name">
        <input class="inp" id="editBio" value="${currentUserData.bio || ''}" placeholder="Bio">
        <button class="btn" onclick="saveProfile()">Save Changes</button>
        <button class="btn-out" onclick="closeModal('genericModal')">Cancel</button>`;
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
    navigator.clipboard.writeText(currentUserData.username).then(function() {
        toast('Username copied! 📋');
    });
}

function showFollowList(type) {
    openModal('genericModal');
    var title = type === 'followers' ? 'Followers' : 'Following';
    var ids = currentUserData[type] || [];
    
    var h = '<h2 style="color:var(--gold);margin-bottom:15px">' + title + '</h2>';
    
    if (ids.length === 0) {
        h += '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:20px">No one yet</p>';
    } else {
        ids.forEach(function(id) {
            db.collection('users').doc(id).get().then(function(doc) {
                var u = doc.data();
                if (u) {
                    h += '<div class="chat-item"><img class="chat-avatar" src="' + (u.avatar || av(u.name)) + '" style="width:40px;height:40px" onerror="this.src=av(\'' + u.name + '\')"><div style="flex:1"><b>' + u.name + '</b><br><small style="color:var(--gold-light)">' + u.username + '</small></div><button class="btn-out" style="width:auto;padding:6px 14px;font-size:11px" onclick="startChatUser(\'' + id + '\')">Chat</button></div>';
                    document.getElementById('genericContent').innerHTML = h + '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
                }
            });
        });
    }
    
    document.getElementById('genericContent').innerHTML = h + '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
}

console.log('Profile loaded');
