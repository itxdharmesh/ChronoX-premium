function renderProfile(c) {
    var u = currentUserData || {};
    var name = (u.name && u.name !== 'undefined') ? u.name : 'User';
    var avatar = u.avatar || defaultAvatar(name);
    var followers = (u.followers || []).length;
    var following = (u.following || []).length;
    
    c.innerHTML = 
        '<div style="text-align:center;margin-bottom:15px">' +
            '<img src="' + avatar + '" style="width:80px;height:80px;border-radius:50%;border:3px solid #D4AF37;object-fit:cover;background:#1a1f4e" onerror="this.src=\'' + defaultAvatar(name) + '\'">' +
        '</div>' +
        '<h2 style="text-align:center">' + name + '</h2>' +
        '<p style="color:#D4AF37;text-align:center">' + (u.username || '@user') + '</p>' +
        '<p style="color:rgba(255,255,255,0.6);text-align:center;margin:8px 0">' + (u.bio || 'No bio yet') + '</p>' +
        '<div class="card" style="display:flex;justify-content:space-around;text-align:center">' +
            '<div><b style="color:#D4AF37;font-size:18px">' + followers + '</b><br><small>Followers</small></div>' +
            '<div><b style="color:#D4AF37;font-size:18px">' + following + '</b><br><small>Following</small></div>' +
        '</div>' +
        '<div class="card" style="display:flex;justify-content:space-around;text-align:center">' +
            '<div><b style="color:#D4AF37">💰 ' + (u.coins||0) + '</b><br><small>Coins</small></div>' +
            '<div><b style="color:#00D4FF">⚡ ' + (u.xp||0) + '</b><br><small>XP</small></div>' +
            '<div><b style="color:#2ED573">Lv.' + (u.level?.current||1) + '</b><br><small>' + (u.level?.title||'Explorer') + '</small></div>' +
        '</div>' +
        '<button class="btn-out" onclick="editProfile()">✏️ Edit Profile</button>' +
        '<button class="btn-out" onclick="logout()" style="color:#FF4757;border-color:#FF4757">🚪 Logout</button>';
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

console.log('✅ Profile loaded');
