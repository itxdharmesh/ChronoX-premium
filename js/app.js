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
                        uid: user.uid, name: 'User', username: '@user', bio: '', avatar: '',
                        followers: [], following: [], blockedUsers: [], achievements: [],
                        streak: 0, bestStreak: 0, xp: 0, coins: 500,
                        level: { current: 1, title: 'Explorer', progress: 0 },
                        stats: { achievements: 0, totalMessages: 0 }, inventory: []
                    };
                }
                showApp();
            }).catch(function() {
                currentUserData = { name: 'User', username: '@user', followers: [], following: [], coins: 500, xp: 0, level: { current: 1, title: 'Explorer', progress: 0 }, stats: { achievements: 0 }, inventory: [] };
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
        b.addEventListener('click', function() {
            var page = this.dataset.page;
            navigate(page);
        });
    });
    
    navigate('home');
}

function navigate(p) {
    document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
    var btn = document.querySelector('[data-page="' + p + '"]');
    if (btn) btn.classList.add('active');
    
    var c = document.getElementById('contentArea');
    var u = currentUserData || {};
    var name = (u.name && u.name !== 'undefined') ? u.name : 'User';
    
    try {
        if (p === 'home') {
            c.innerHTML = '<div class="card" style="text-align:center"><div style="font-size:60px">🕷️</div><h1 style="color:#D4AF37;font-size:26px;font-weight:900">ChronoX</h1><p style="color:rgba(255,255,255,0.6)">Welcome, ' + name + '</p></div><div class="card"><div style="display:flex;justify-content:space-around;text-align:center"><div><h2 style="color:#D4AF37">' + (u.coins||0) + '</h2><small>💰 Coins</small></div><div><h2 style="color:#00D4FF">' + (u.xp||0) + '</h2><small>⚡ XP</small></div></div></div>';
        } else if (p === 'chats' && typeof renderChats === 'function') {
            renderChats(c);
        } else if (p === 'search' && typeof renderSearch === 'function') {
            renderSearch(c);
        } else if (p === 'games' && typeof openGames === 'function') {
            openGames();
        } else if (p === 'profile' && typeof renderProfile === 'function') {
            renderProfile(c);
        } else {
            c.innerHTML = '<h2 style="color:#D4AF37;text-align:center;padding:30px">Coming Soon!</h2>';
        }
    } catch(e) {
        c.innerHTML = '<div class="card" style="text-align:center"><div style="font-size:60px">🕷️</div><h1 style="color:#D4AF37">ChronoX</h1><p>Welcome!</p></div>';
    }
}

function showLogin() {
    document.getElementById('mainApp').classList.remove('show');
    var c = document.getElementById('authScreen');
    c.classList.add('show');
    c.innerHTML = '<div class="auth-box"><div style="font-size:55px">🕷️</div><h1 class="auth-title">ChronoX</h1><p class="auth-subtitle">PREMIUM SOCIAL NETWORK</p><input class="inp" id="lemail" placeholder="Email" type="email"><input class="inp" id="lpass" placeholder="Password" type="password"><button class="btn" onclick="login()">Sign In</button><span class="link" onclick="showSignup()">Create New Account</span></div>';
}

function showSignup() {
    var c = document.getElementById('authScreen');
    c.innerHTML = '<div class="auth-box"><div style="font-size:55px">🕷️</div><h1 class="auth-title">Join ChronoX</h1><input class="inp" id="sname" placeholder="Full Name"><input class="inp" id="suser" placeholder="Username"><input class="inp" id="sage" placeholder="Age (12+)" type="number"><input class="inp" id="semail" placeholder="Email" type="email"><input class="inp" id="spass" placeholder="Password (6+)" type="password"><button class="btn" onclick="signup()">Create Account</button><span class="link" onclick="showLogin()">Already have account?</span></div>';
}

function login() {
    var e = document.getElementById('lemail').value;
    var p = document.getElementById('lpass').value;
    if (!e || !p) return showToast('Fill all fields', 'error');
    auth.signInWithEmailAndPassword(e, p).catch(function(x) { showToast(x.message, 'error'); });
}

function signup() {
    var n = document.getElementById('sname').value;
    var u = document.getElementById('suser').value;
    var a = parseInt(document.getElementById('sage').value);
    var e = document.getElementById('semail').value;
    var p = document.getElementById('spass').value;
    if (!n || !u || !a || !e || !p) return showToast('Fill all fields', 'error');
    if (a < 12) return showToast('Must be 12+', 'error');
    if (p.length < 6) return showToast('Password: 6+ chars', 'error');
    
    db.collection('users').where('username', '==', '@' + u).get().then(function(snap) {
        if (!snap.empty) return showToast('Username taken!', 'error');
        auth.createUserWithEmailAndPassword(e, p).then(function(cred) {
            return db.collection('users').doc(cred.user.uid).set({
                uid: cred.user.uid, name: n, username: '@' + u, age: a, email: e,
                bio: '', avatar: '', followers: [], following: [], blockedUsers: [],
                achievements: [], streak: 0, xp: 0, coins: 500,
                level: { current: 1, title: 'Explorer', progress: 0 },
                stats: { achievements: 0, totalMessages: 0 }, inventory: []
            });
        }).then(function() {
            showToast('Account created! 🎉');
        }).catch(function(x) { showToast(x.message, 'error'); });
    });
}

function logout() {
    auth.signOut();
    currentUser = null; currentUserData = null;
    document.getElementById('mainApp').classList.remove('show');
    showLogin();
}

console.log('✅ App loaded');
