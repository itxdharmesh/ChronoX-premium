function renderSearch(c) {

    c.innerHTML =
    '<h2 style="color:#D4AF37;margin-bottom:15px">🔍 Search</h2>' +
    '<input class="inp" id="sinput" placeholder="Search users..." onkeyup="searchUsers()">' +
    '<div id="sresults"></div>';
}

function searchUsers() {

    var q = document.getElementById('sinput').value.trim();

    var c = document.getElementById('sresults');

    if (!c) return;

    if (!q) {
        c.innerHTML = '';
        return;
    }

    db.collection('users')
    .where('username', '>=', '@' + q)
    .where('username', '<=', '@' + q + '\uf8ff')
    .limit(20)
    .get()
    .then(function(snap) {

        var h = '';

        snap.forEach(function(doc) {

            if (doc.id === currentUser.uid) return;

            var u = doc.data();

            h +=

            '<div class="chat-item" onclick="openUserProfile(\'' + doc.id + '\')" style="cursor:pointer">' +

                '<img src="' +
                (u.avatar || defaultAvatar(u.name)) +
                '" style="width:45px;height:45px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover">' +

                '<div style="flex:1">' +

                    '<b>' +
                    (u.name || 'User') +
                    '</b><br>' +

                    '<small style="color:#D4AF37">' +
                    (u.username || '@user') +
                    '</small>' +

                '</div>' +

                '<div style="font-size:18px">›</div>' +

            '</div>';
        });

        c.innerHTML =
        h ||
        '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No users found</p>';
    });
}

console.log('✅ Search loaded');
