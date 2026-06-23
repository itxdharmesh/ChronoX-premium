function renderSearch(c) {
    c.innerHTML = '<h2 style="color:#D4AF37;margin-bottom:15px">🔍 Search</h2><input class="inp" id="sinput" placeholder="Search users..." onkeyup="searchUsers()"><div id="sresults"></div>';
}

function searchUsers() {
    var q = document.getElementById('sinput').value;
    var c = document.getElementById('sresults');
    if (!c || !q) return;
    db.collection('users').where('username', '>=', '@' + q).where('username', '<=', '@' + q + '\uf8ff').limit(10).get().then(function(snap) {
        var h = '';
        snap.forEach(function(doc) {
            if (doc.id !== currentUser.uid) {
                var u = doc.data();
                h += '<div class="chat-item"><div style="width:40px;height:40px;border-radius:50%;background:#1a1f4e;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid #D4AF37">' + (u.name||'?')[0] + '</div><div style="flex:1"><b>' + u.name + '</b><br><small style="color:#D4AF37">' + u.username + '</small></div></div>';
            }
        });
        c.innerHTML = h || '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No users found</p>';
    });
}

console.log('✅ Search loaded');
