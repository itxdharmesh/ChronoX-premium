var currentUser = null;
var currentUserData = null;

setTimeout(function() {
    try { document.getElementById('splashScreen').classList.add('hidden'); } catch(e) {}
    
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            db.collection('users').doc(user.uid).get().then(function(doc) {
                if (doc.exists && doc.data().name) {
                    currentUserData = doc.data();
                } else {
                    currentUserData = {
                        name: 'User', username: '@user', coins: 500, xp: 0,
                        followers: [], following: [], blockedUsers: [],
                        streak: 0, level: { current: 1, title: 'Explorer', progress: 0 },
                        stats: { achievements: 0 }, inventory: [],
                        lastDailyReward: null
                    };
                }
                showApp();
            }).catch(function() {
                currentUserData = { name: 'User', username: '@user', coins: 500, xp: 0, followers: [], following: [], streak: 0, level: { current: 1, title: 'Explorer', progress: 0 }, stats: { achievements: 0 }, inventory: [], lastDailyReward: null };
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
    
    try {
        if (p === 'home') {
            if (typeof renderDashboard === 'function') renderDashboard(c);
            else {
                var u = currentUserData || {};
                var n = (u.name && u.name !== 'undefined') ? u.name : 'User';
                c.innerHTML = '<div class="card" style="text-align:center"><div style="font-size:60px">🕷️</div><h1 style="color:#D4AF37;font-size:26px">ChronoX</h1><p style="color:rgba(255,255,255,0.6)">Welcome, ' + n + '</p></div>';
            }
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
    } catch(e) {
        c.innerHTML = '<div class="card" style="text-align:center"><h1 style="color:#D4AF37">ChronoX</h1><p>Welcome!</p></div>';
    }
}

function showLogin() {
    document.getElementById('mainApp').classList.remove('show');
    var c = document.getElementById('authScreen'); c.classList.add('show');
    c.innerHTML = '<div class="auth-box"><div style="font-size:55px">🕷️</div><h1 class="auth-title">ChronoX</h1><p class="auth-subtitle">PREMIUM SOCIAL NETWORK</p><input class="inp" id="lemail" placeholder="Email"><input class="inp" id="lpass" placeholder="Password" type="password"><button class="btn" onclick="login()">Sign In</button><span class="link" onclick="showSignup()">Create Account</span></div>';
}

function showSignup() {
    var c = document.getElementById('authScreen');
    c.innerHTML = '<div class="auth-box"><div style="font-size:55px">🕷️</div><h1 class="auth-title">Join ChronoX</h1><input class="inp" id="sname" placeholder="Full Name"><input class="inp" id="suser" placeholder="Username"><input class="inp" id="sage" placeholder="Age (12+)" type="number"><input class="inp" id="semail" placeholder="Email"><input class="inp" id="spass" placeholder="Password (6+)"><button class="btn" onclick="signup()">Create Account</button><span class="link" onclick="showLogin()">Already have account?</span></div>';
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
                streak: 0, xp: 0, coins: 500,
                level: { current: 1, title: 'Explorer', progress: 0 },
                stats: { achievements: 0 }, inventory: [],
                lastDailyReward: null, onlineStatus: 'online'
            });
        }).then(function() { showToast('Account created! 🎉'); }).catch(function(x) { showToast(x.message, 'error'); });
    });
}

function logout() {
    if (currentUser) db.collection('users').doc(currentUser.uid).update({ onlineStatus: 'offline' });
    auth.signOut();
    currentUser = null; currentUserData = null;
    document.getElementById('mainApp').classList.remove('show');
    showLogin();
                }
