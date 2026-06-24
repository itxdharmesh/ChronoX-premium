function renderSearch(c) {
    c.innerHTML =
        '<div class="card">' +
            '<h2 style="color:#D4AF37;margin-bottom:15px">🔍 Discover People</h2>' +
            '<input class="inp" id="sinput" placeholder="Search by username..." onkeyup="searchUsers()">' +
        '</div>' +
        '<div id="sresults"></div>';
}

function searchUsers() {

    var input = document.getElementById('sinput');
    var container = document.getElementById('sresults');

    if (!input || !container) return;

    var q = input.value.trim().toLowerCase();

    if (!q) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML =
        '<div class="card" style="text-align:center;color:rgba(255,255,255,.6)">Searching...</div>';

    db.collection('users')
    .limit(50)
    .get()
    .then(function(snapshot) {

        var html = '';
        var found = 0;

        snapshot.forEach(function(doc) {

            if (doc.id === currentUser.uid) return;

            var u = doc.data() || {};

            var username = (u.username || '').toLowerCase();
            var name = (u.name || '').toLowerCase();

            if (
                username.indexOf(q) === -1 &&
                name.indexOf(q) === -1
            ) return;

            found++;

            var avatar =
                u.avatar ||
                defaultAvatar(u.name || 'User');

            html +=
                '<div class="chat-item" ' +
                'style="cursor:pointer" ' +
                'onclick="openUserProfile(\'' + doc.id + '\')">' +

                    '<img src="' + avatar + '"' +
                    ' style="width:50px;height:50px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover;background:#1a1f4e"' +
                    ' onerror="this.src=\'' +
                    defaultAvatar(u.name || 'User') +
                    '\'">' +

                    '<div style="flex:1">' +
                        '<div style="font-weight:600;color:#fff">' +
                        (u.name || 'User') +
                        '</div>' +

                        '<div style="font-size:12px;color:#D4AF37">' +
                        (u.username || '@user') +
                        '</div>' +
                    '</div>' +

                    '<div style="color:#D4AF37;font-size:20px">›</div>' +

                '</div>';
        });

        if (!found) {
            html =
                '<div class="card" style="text-align:center;color:rgba(255,255,255,.5)">' +
                'No users found' +
                '</div>';
        }

        container.innerHTML = html;
    })
    .catch(function(error) {
        console.error(error);

        container.innerHTML =
            '<div class="card" style="text-align:center;color:#FF4757">' +
            'Search failed' +
            '</div>';
    });
}

console.log('✅ Search loaded');
