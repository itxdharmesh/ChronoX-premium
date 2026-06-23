var currentUser = null;
var currentUserData = null;

setTimeout(function() {
    try { document.getElementById('splashScreen').classList.add('hidden'); } catch(e) {}
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            db.collection('users').doc(user.uid).get().then(function(doc) {
                currentUserData = (doc.exists && doc.data().name) ? doc.data() : { name: 'User', username: '@user', coins: 500, xp: 0, followers: [], following: [], level: { current: 1, title: 'Explorer', progress: 0 }, stats: { achievements: 0 }, inventory: [] };
                showApp();
            }).catch(function() {
                currentUserData = { name: 'User', username: '@user', coins: 500, xp: 0, followers: [], following: [], level: { current: 1, title: 'Explorer', progress: 0 }, stats: { achievements: 0 }, inventory: [] };
                showApp();
            });
        } else { showLogin(); }
    });
}, 2500);

function showApp() {
    document.getElementById('authScreen').classList.remove('show');
    document.getElementById('mainApp').classList.add('show');
    var btns = document.querySelectorAll('#bottomNav .nav-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].onclick = function() { navigate(this.dataset.page); };
    }
    navigate('home');
}

function navigate(p) {
    var btns = document.querySelectorAll('#bottomNav .nav-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
        if (btns[i].dataset.page === p) btns[i].classList.add('active');
    }
    var c = document.getElementById('contentArea');
    var u = currentUserData || {};
    var n = (u.name && u.name !== 'undefined') ? u.name : 'User';
    
    if (p === 'home') {
        c.innerHTML = '<div class="card" style="text-align:center"><div style="font-size:60px">🕷️</div><h1 style="color:#D4AF37;font-size:26px">ChronoX</h1><p style="color:rgba(255,255,255,0.6)">Welcome, ' + n + '</p></div><div class="card"><div style="display:flex;justify-content:space-around;text-align:center"><div><h2 style="color:#D4AF37">' + (u.coins||0) + '</h2><small>💰 Coins</small></div><div><h2 style="color:#00D4FF">' + (u.xp||0) + '</h2><small>⚡ XP</small></div></div></div>';
    } else if (p === 'chats') {
        if (typeof renderChats === 'function') renderChats(c);
        else c.innerHTML = '<h2 style="color:#D4AF37;text-align:center;padding:30px">💬 Chats</h2>';
    } else if (p === 'search') {
        if (typeof renderSearch === 'function') renderSearch(c);
        else c.innerHTML = '<h2 style="color:#D4AF37;text-align:center;padding:30px">🔍 Search</h2>';
    } else if (p === 'games') {
        if (typeof openGames === 'function') openGames();
        else c.innerHTML = '<h2 style="color:#D4AF37;text-align:center;padding:30px">🎮 Games</h2>';
    } else if (p === 'profile') {
        if (typeof renderProfile === 'function') renderProfile(c);
        else c.innerHTML = '<h2 style="color:#D4AF37;text-align:center;padding:30px">👤 Profile</h2>';
    }
}

console.log('✅ App loaded');
