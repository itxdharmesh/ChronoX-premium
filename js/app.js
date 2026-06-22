var currentUser = null;
var currentUserData = null;

// Splash
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
                        bio: '',
                        avatar: '',
                        followers: [],
                        following: [],
                        blockedUsers: [],
                        achievements: [],
                        streak: 0,
                        bestStreak: 0,
                        xp: 0,
                        coins: 0,
                        level: { current: 1, title: 'Explorer', progress: 0 },
                        stats: { achievements: 0, totalMessages: 0 },
                        inventory: [],
                        lastDailyReward: null,
                        rewardStreak: 0
                    };
                }
                showApp();
                updateStreak();
            }).catch(function(err) {
                console.error('User data load error:', err);
                currentUserData = {
                    name: 'User', username: '@user', bio: '', avatar: '',
                    followers: [], following: [], level: { current: 1, title: 'Explorer', progress: 0 },
                    stats: { achievements: 0 }, coins: 0, inventory: []
                };
                showApp();
            });
        } else {
            showLogin();
        }
    });
}, 2500);

function showApp() {
    console.log('showApp called');
    document.getElementById('authScreen').classList.remove('show');
    document.getElementById('mainApp').classList.add('show');
    
    document.querySelectorAll('.nav-btn').forEach(function(b) {
        b.addEventListener('click', function() {
            navigate(this.dataset.page);
        });
    });
    
    navigate('home');
    
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).update({ onlineStatus: 'online' });
    }
}

function navigate(p) {
    console.log('Navigate to:', p);
    document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
    var btn = document.querySelector('[data-page="' + p + '"]');
    if (btn) btn.classList.add('active');
    
    var c = document.getElementById('contentArea');
    try {
        if (p === 'home') renderHome(c);
        if (p === 'chats') renderChats(c);
        if (p === 'search') renderSearch(c);
        if (p === 'games') openGames();
        if (p === 'profile') renderProfile(c);
    } catch(e) {
        console.error('Navigation error:', e);
        c.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">Something went wrong. Please refresh.</p>';
    }
}

function updateStreak() {
    if (!currentUser) return;
    var ref = db.collection('users').doc(currentUser.uid);
    ref.get().then(function(doc) {
        var d = doc.data();
        var today = new Date(); today.setHours(0,0,0,0);
        var last = d.lastActive ? d.lastActive.toDate() : null;
        var s = d.streak || 0;
        if (last) {
            last.setHours(0,0,0,0);
            var diff = (today - last) / 86400000;
            if (diff === 1) s++;
            else if (diff > 1) s = 1;
        } else { s = 1; }
        ref.update({
            streak: s,
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            bestStreak: Math.max(s, d.bestStreak || 0)
        });
        currentUserData.streak = s;
        currentUserData.bestStreak = Math.max(s, d.bestStreak || 0);
    });
}

function renderHome(c) {
    var u = currentUserData;
    var name = (u.name && u.name !== 'undefined') ? u.name : 'User';
    
    c.innerHTML = 
        '<div class="card" style="text-align:center">' +
            '<div style="font-size:60px">🕷️</div>' +
            '<h1 style="color:var(--gold);font-size:26px;font-weight:900;letter-spacing:3px">ChronoX</h1>' +
            '<p style="color:rgba(255,255,255,0.6)">Welcome, ' + name + '</p>' +
        '</div>' +
        '<div class="card" style="display:flex;align-items:center;gap:15px">' +
            '<span style="font-size:45px">🔥</span>' +
            '<div><h1 style="color:var(--gold)">' + (u.streak || 0) + ' Days</h1><small style="color:rgba(255,255,255,0.6)">Streak</small></div>' +
        '</div>' +
        '<div class="card">' +
            '<div style="display:flex;justify-content:space-around;text-align:center">' +
                '<div><h2 style="color:var(--gold)">' + (u.coins || 0) + '</h2><small>💰 Coins</small></div>' +
                '<div><h2 style="color:#00D4FF">' + (u.xp || 0) + '</h2><small>⚡ XP</small></div>' +
                '<div><h2 style="color:#2ED573">' + (u.stats?.achievements || 0) + '</h2><small>🏆</small></div>' +
            '</div>' +
        '</div>' +
        '<div class="card">' +
            '<h3 style="color:var(--gold);margin-bottom:12px">🎁 Daily Reward</h3>' +
            '<p style="color:rgba(255,255,255,0.6);text-align:center">Coming soon!</p>' +
        '</div>';
}

console.log('✅ App loaded - simple version');
