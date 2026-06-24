// js/app.js - COMPLETE INTEGRATED VERSION

var currentUser = null;
var currentUserData = null;

// Initialization Logic
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
                        stats: { achievements: 0 }, inventory: [], lastDailyReward: null
                    };
                }
                showApp();
            }).catch(function() {
                currentUserData = { name: 'User', username: '@user', coins: 500, xp: 0 };
                showApp();
            });
        } else {
            showLogin();
        }
    });
}, 2500);

// App Loader
function showApp() {
    document.getElementById('authScreen').classList.remove('show');
    document.getElementById('mainApp').classList.add('show');
    
    var btns = document.querySelectorAll('#bottomNav .nav-btn');
    btns.forEach(function(btn) {
        btn.onclick = function() { navigate(this.dataset.page); };
    });
    
    navigate('home');
}

// Fixed Navigation & Router Engine
function navigate(p) {
    var btns = document.querySelectorAll('#bottomNav .nav-btn');
    btns.forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.dataset.page === p) btn.classList.add('active');
    });
    
    var c = document.getElementById('contentArea');
    
    try {
        switch(p) {
            case 'home':
                typeof renderDashboard === 'function' ? renderDashboard(c) : (c.innerHTML = '<div style="text-align:center;padding:20px;">Welcome to ChronoX</div>');
                break;
            case 'chats':
                typeof renderChats === 'function' ? renderChats(c) : (c.innerHTML = '<h2 style="color:#D4AF37;text-align:center;padding:30px">💬 Chats</h2>');
                break;
            case 'search':
                typeof renderSearch === 'function' ? renderSearch(c) : (c.innerHTML = '<h2 style="color:#D4AF37;text-align:center;padding:30px">🔍 Search</h2>');
                break;
            case 'games':
                typeof openGames === 'function' ? openGames() : (c.innerHTML = '<h2 style="color:#D4AF37;text-align:center;padding:30px">🎮 Games Module Error</h2>');
                break;
            case 'profile':
                typeof renderProfile === 'function' ? renderProfile(c) : (c.innerHTML = '<h2 style="color:#D4AF37;text-align:center;padding:30px">👤 Profile</h2>');
                break;
            default:
                c.innerHTML = '<div style="padding:20px;text-align:center;">404</div>';
        }
    } catch(e) {
        console.error("Navigation Error:", e);
    }
}

// Authentication Logic
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
    
    db.collection('users').where('username', '==', '@' + u).get().then(function(snap) {
        if (!snap.empty) return showToast('Username taken!', 'error');
        auth.createUserWithEmailAndPassword(e, p).then(function(cred) {
            return db.collection('users').doc(cred.user.uid).set({
                uid: cred.user.uid, name: n, username: '@' + u, age: a, email: e,
                xp: 0, coins: 500, onlineStatus: 'online'
            });
        }).then(function() { showToast('Account created!'); }).catch(function(x) { showToast(x.message, 'error'); });
    });
}

function logout() {
    if (currentUser) db.collection('users').doc(currentUser.uid).update({ onlineStatus: 'offline' });
    auth.signOut();
    currentUser = null; currentUserData = null;
    document.getElementById('mainApp').classList.remove('show');
    showLogin();
}
