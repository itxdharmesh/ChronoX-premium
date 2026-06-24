function renderSearch(c) {

    c.innerHTML =
        '<h2 style="color:#D4AF37;margin-bottom:15px">🔍 Search</h2>' +

        '<input class="inp" id="sinput" placeholder="Search users..." onkeyup="searchUsers()">' +

        '<div id="sresults" style="margin-top:15px"></div>';
}


function searchUsers() {

    var q = document.getElementById('sinput').value.trim().toLowerCase();

    var container = document.getElementById('sresults');

    if (!container) return;

    if (!q) {

        container.innerHTML =
            '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:25px">' +
            'Start typing to search users' +
            '</p>';

        return;
    }

    container.innerHTML =
        '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:25px">' +
        'Searching...' +
        '</p>';

    db.collection('users')
        .limit(50)
        .get()
        .then(function(snapshot) {

            var html = '';

            snapshot.forEach(function(doc) {

                if (doc.id === currentUser.uid) return;

                var u = doc.data();

                var username =
                    (u.username || '').toLowerCase();

                var name =
                    (u.name || '').toLowerCase();

                if (
                    username.indexOf(q) === -1 &&
                    name.indexOf(q) === -1
                ) return;

                var avatar =
                    u.avatar ||
                    defaultAvatar(u.name);

                html +=

                '<div class="chat-item" ' +

                'onclick="openUserProfile(\'' +
                doc.id +
                '\')" ' +

                'style="cursor:pointer">' +

                    '<img src="' +
                    avatar +
                    '" ' +

                    'style="width:45px;height:45px;border-radius:50%;object-fit:cover;border:2px solid #D4AF37;background:#1a1f4e" ' +

                    'onerror="this.src=\'' +
                    defaultAvatar(u.name) +
                    '\'">' +

                    '<div style="flex:1">' +

                        '<b>' +
                        (u.name || 'User') +
                        '</b><br>' +

                        '<small style="color:#D4AF37">' +
                        (u.username || '@user') +
                        '</small>' +

                    '</div>' +

                    '<div style="color:#D4AF37;font-size:12px">' +
                    'View' +
                    '</div>' +

                '</div>';
            });

            container.innerHTML =
                html ||
                '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No users found</p>';
        })

        .catch(function(error) {

            console.error(error);

            container.innerHTML =
                '<p style="text-align:center;color:#FF4757;padding:30px">Search failed</p>';
        });
}


function openUserProfile(uid) {

    if (!uid) return;

    db.collection('users')
        .doc(uid)
        .get()
        .then(function(doc) {

            if (!doc.exists) {

                showToast('User not found', 'error');

                return;
            }

            var u = doc.data();

            openModal('genericModal');

            document.getElementById('genericContent').innerHTML =

                '<div style="text-align:center">' +

                    '<img src="' +
                    (u.avatar || defaultAvatar(u.name)) +
                    '" style="width:90px;height:90px;border-radius:50%;border:3px solid #D4AF37;object-fit:cover">' +

                    '<h2 style="margin-top:12px;color:#fff">' +
                    (u.name || 'User') +
                    '</h2>' +

                    '<div style="color:#D4AF37">' +
                    (u.username || '@user') +
                    '</div>' +

                    '<p style="margin-top:10px;color:rgba(255,255,255,0.7)">' +
                    (u.bio || 'No bio yet') +
                    '</p>' +

                    '<div style="display:flex;justify-content:space-around;margin-top:20px">' +

                        '<div>' +
                        '<b>' +
                        ((u.followers || []).length) +
                        '</b><br><small>Followers</small>' +
                        '</div>' +

                        '<div>' +
                        '<b>' +
                        ((u.following || []).length) +
                        '</b><br><small>Following</small>' +
                        '</div>' +

                    '</div>' +

                    '<button class="btn" style="margin-top:15px" onclick="startChatUser(\'' +
                    uid +
                    '\')">' +

                    '💬 Message' +

                    '</button>' +

                '</div>';
        });
}

console.log('✅ Search Fixed');
