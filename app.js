// ==================== APP ====================
var currentUser = null;
var currentUserData = null;

// Splash Screen
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
                        level: { current: 1, title: 'Explorer', progress: 0 },
                        stats: { achievements: 0, totalMessages: 0 },
                        isPrivate: false
                    };
                }
                showApp();
                updateStreak();
            }).catch(function() {
                currentUserData = { name: 'User', username: '@user', bio: '', avatar: '', followers: [], following: [], level: { current: 1, title: 'Explorer', progress: 0 }, stats: { achievements: 0 } };
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
    
    // Offline on close
    window.addEventListener('beforeunload', function() {
        if (currentUser) {
            db.collection('users').doc(currentUser.uid).update({ 
                onlineStatus: 'offline',
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    });
}

function navigate(p) {
    document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
    var btn = document.querySelector('[data-page="' + p + '"]');
    if (btn) btn.classList.add('active');
    
    var c = document.getElementById('contentArea');
    if (p === 'home') renderHome(c);
    if (p === 'chats') renderChats(c);
    if (p === 'search') renderSearch(c);
    if (p === 'games') openGames();
    if (p === 'profile') renderProfile(c);
}

function updateStreak() {
    if (!currentUser) return;
    var ref = db.collection('users').doc(currentUser.uid);
    ref.get().then(function(doc) {
        var d = doc.data();
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var last = d.lastActive ? d.lastActive.toDate() : null;
        var s = d.streak || 0;
        
        if (last) {
            last.setHours(0, 0, 0, 0);
            var diff = (today - last) / 86400000;
            if (diff === 1) s++;
            else if (diff > 1) s = 1;
        } else {
            s = 1;
        }
        
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
            '<div>' +
                '<h1 style="color:var(--gold)">' + (u.streak || 0) + ' Days</h1>' +
                '<small style="color:rgba(255,255,255,0.6)">Current Streak • Best: ' + (u.bestStreak || 0) + '</small>' +
            '</div>' +
        '</div>' +
        '<div class="card">' +
            '<div style="display:flex;justify-content:space-around;text-align:center">' +
                '<div><h2 style="color:var(--gold)">' + (u.xp || 0) + '</h2><small>XP</small></div>' +
                '<div><h2 style="color:var(--gold)">' + (u.level?.current || 1) + '</h2><small>Level</small></div>' +
                '<div><h2 style="color:var(--gold)">' + (u.stats?.achievements || 0) + '</h2><small>🏆</small></div>' +
            '</div>' +
        '</div>' +
        '<div class="card">' +
            '<h3 style="color:var(--gold);margin-bottom:10px">🎮 Quick Play</h3>' +
            '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">' +
                '<button class="btn-out" onclick="navigate(\'games\')">🎮 Games Hub</button>' +
                '<button class="btn-out" onclick="navigate(\'chats\')">💬 Messages</button>' +
                '<button class="btn-out" onclick="navigate(\'search\')">🔍 Discover</button>' +
                '<button class="btn-out" onclick="navigate(\'profile\')">👤 Profile</button>' +
            '</div>' +
        '</div>';
}

console.log('✅ App loaded');
