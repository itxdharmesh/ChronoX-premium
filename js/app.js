// ==================== APP ====================
var currentUser = null;
var currentUserData = null;

setTimeout(function() {
    document.getElementById('splashScreen').classList.add('hidden');
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            db.collection('users').doc(user.uid).get().then(function(doc) {
                if (doc.exists && doc.data().name) {
                    currentUserData = doc.data();
                } else {
                    currentUserData = {
                        uid: user.uid,
                        name: 'User',
                        username: '@user',
                        bio: 'No bio',
                        avatar: '',
                        followers: [],
                        following: [],
                        blockedUsers: [],
                        achievements: [],
                        streak: 0,
                        bestStreak: 0,
                        level: { current: 1, title: 'Explorer', progress: 0 },
                        stats: { achievements: 0, totalMessages: 0 }
                    };
                }
                showApp();
            }).catch(function() {
                currentUserData = { name: 'User', username: '@user', bio: 'No bio', avatar: '', followers: [], following: [], level: { current: 1, title: 'Explorer', progress: 0 }, stats: { achievements: 0 } };
                showApp();
            });
        } else {
            showLogin();
        }
    });
}, 2500);

function showApp() {
    document.getElementById('authScreen').classList.remove('show');
    document.getElementById('mainApp').classList.add('show');
    document.querySelectorAll('.nav-btn').forEach(function(b) {
        b.addEventListener('click', function() { navigate(this.dataset.page); });
    });
    navigate('home');
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).update({ onlineStatus: 'online' });
    }
}

function navigate(p) {
    document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
    var btn = document.querySelector('[data-page="' + p + '"]');
    if (btn) btn.classList.add('active');
    var c = document.getElementById('contentArea');
    if (p === 'home') home(c);
    if (p === 'chats') renderChats(c);
    if (p === 'search') renderSearch(c);
    if (p === 'games') openGames();
    if (p === 'profile') renderProfile(c);
}

function home(c) {
    var u = currentUserData;
    c.innerHTML = 
        '<div class="card" style="text-align:center">' +
            '<div style="font-size:60px">🕷️</div>' +
            '<h1 style="color:var(--gold);font-size:26px;font-weight:900;letter-spacing:3px">ChronoX</h1>' +
            '<p style="color:rgba(255,255,255,0.6)">' + u.name + '</p>' +
        '</div>' +
        '<div class="card" style="display:flex;align-items:center;gap:15px">' +
            '<span style="font-size:45px">🔥</span>' +
            '<div><h1 style="color:var(--gold)">' + (u.streak || 0) + ' Days</h1><small style="color:rgba(255,255,255,0.6)">Streak</small></div>' +
        '</div>' +
        '<div class="card">' +
            '<h3 style="color:var(--gold);margin-bottom:12px">🏆 Leaderboard</h3>' +
            '<p style="text-align:center;color:rgba(255,255,255,0.6)">Coming soon...</p>' +
        '</div>';
}

console.log('App loaded');
