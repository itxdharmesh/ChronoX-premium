var currentUser = null;
var currentUserData = null;

// SPLASH
setTimeout(function() {
    var splash = document.getElementById('splashScreen');
    if (splash) splash.classList.add('hidden');
    
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            db.collection('users').doc(user.uid).get().then(function(doc) {
                currentUserData = doc.exists ? doc.data() : {};
                if (!currentUserData.name) {
                    currentUserData.name = 'User';
                    currentUserData.username = '@user';
                    currentUserData.coins = 500;
                    currentUserData.xp = 0;
                    currentUserData.followers = [];
                    currentUserData.following = [];
                }
                showApp();
            }).catch(function() {
                currentUserData = {name:'User',username:'@user',coins:500,xp:0,followers:[],following:[]};
                showApp();
            });
        } else {
            showLogin();
        }
    });
}, 2500);

// SHOW APP
function showApp() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    
    // Navigation buttons
    var buttons = document.querySelectorAll('#bottomNav .nav-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function() {
            var page = this.getAttribute('data-page');
            navigate(page);
        };
    }
    
    navigate('home');
}

// NAVIGATE
function navigate(page) {
    // Update active button
    var buttons = document.querySelectorAll('#bottomNav .nav-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
        if (buttons[i].getAttribute('data-page') === page) {
            buttons[i].classList.add('active');
        }
    }
    
    var content = document.getElementById('contentArea');
    var u = currentUserData || {};
    var name = u.name || 'User';
    
    switch(page) {
        case 'home':
            content.innerHTML = 
                '<div class="card" style="text-align:center">' +
                    '<div style="font-size:60px">🕷️</div>' +
                    '<h1 style="color:#D4AF37;font-size:26px;font-weight:900">ChronoX</h1>' +
                    '<p style="color:rgba(255,255,255,0.6)">Welcome, ' + name + '</p>' +
                '</div>' +
                '<div class="card">' +
                    '<div style="display:flex;justify-content:space-around;text-align:center">' +
                        '<div><h2 style="color:#D4AF37">' + (u.coins||0) + '</h2><small>💰 Coins</small></div>' +
                        '<div><h2 style="color:#00D4FF">' + (u.xp||0) + '</h2><small>⚡ XP</small></div>' +
                    '</div>' +
                '</div>' +
                '<div class="card">' +
                    '<h3 style="color:#D4AF37;margin-bottom:10px">Quick Links</h3>' +
                    '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">' +
                        '<button class="btn-out" onclick="navigate(\'games\')">🎮 Games</button>' +
                        '<button class="btn-out" onclick="navigate(\'chats\')">💬 Chats</button>' +
                        '<button class="btn-out" onclick="navigate(\'search\')">🔍 Search</button>' +
                        '<button class="btn-out" onclick="openShop()">🛍️ Shop</button>' +
                    '</div>' +
                '</div>';
            break;
            
        case 'chats':
            if (typeof renderChats === 'function') {
                renderChats(content);
            } else {
                content.innerHTML = '<h2 style="color:#D4AF37;text-align:center;padding:30px">💬 Chats</h2><p style="text-align:center;color:rgba(255,255,255,0.6)">Loading...</p>';
            }
            break;
            
        case 'search':
            if (typeof renderSearch === 'function') {
                renderSearch(content);
            } else {
                content.innerHTML = '<h2 style="color:#D4AF37;text-align:center;padding:30px">🔍 Search</h2><p style="text-align:center;color:rgba(255,255,255,0.6)">Loading...</p>';
            }
            break;
            
        case 'games':
            content.innerHTML = '<h2 style="color:#D4AF37;text-align:center;padding:30px">🎮 Games Hub</h2><p style="text-align:center;color:rgba(255,255,255,0.6)">Coming Soon!</p>';
            break;
            
        case 'profile':
            if (typeof renderProfile === 'function') {
                renderProfile(content);
            } else {
                content.innerHTML = 
                    '<div class="card" style="text-align:center">' +
                        '<div style="font-size:60px">👤</div>' +
                        '<h2 style="color:#D4AF37">' + name + '</h2>' +
                        '<p style="color:#D4AF37">' + (u.username||'@user') + '</p>' +
                    '</div>' +
                    '<button class="btn-out" onclick="logout()" style="color:#FF4757;border-color:#FF4757">🚪 Logout</button>';
            }
            break;
    }
}

// LOGIN
function showLogin() {
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('authScreen').innerHTML = 
        '<div class="auth-box">' +
            '<div style="font-size:55px">🕷️</div>' +
            '<h1 style="color:#D4AF37;font-size:30px;font-weight:800;letter-spacing:4px">ChronoX</h1>' +
            '<p style="color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:2px;margin-bottom:25px">PREMIUM SOCIAL NETWORK</p>' +
            '<input class="inp" id="lemail" placeholder="Email" type="email">' +
            '<input class="inp" id="lpass" placeholder="Password" type="password">' +
            '<button class="btn" onclick="login()">Sign In</button>' +
            '<span class="link" onclick="showSignup()">Create New Account</span>' +
        '</div>';
}

function showSignup() {
    document.getElementById('authScreen').innerHTML = 
        '<div class="auth-box">' +
            '<div style="font-size:55px">🕷️</div>' +
            '<h1 style="color:#D4AF37;font-size:30px;font-weight:800;letter-spacing:4px">Join ChronoX</h1>' +
            '<input class="inp" id="sname" placeholder="Full Name">' +
            '<input class="inp" id="suser" placeholder="Username (a-z, 0-9, . , _)">' +
            '<input class="inp" id="sage" placeholder="Age (12+)" type="number">' +
            '<input class="inp" id="semail" placeholder="Email" type="email">' +
            '<input class="inp" id="spass" placeholder="Password (6+ chars)" type="password">' +
            '<button class="btn" onclick="signup()">Create Account</button>' +
            '<span class="link" onclick="showLogin()">Already have account?</span>' +
        '</div>';
}

function login() {
    var e = document.getElementById('lemail').value;
    var p = document.getElementById('lpass').value;
    if (!e || !p) return alert('Fill all fields');
    auth.signInWithEmailAndPassword(e, p).catch(function(x) { alert(x.message); });
}

function signup() {
    var n = document.getElementById('sname').value;
    var u = document.getElementById('suser').value;
    var a = parseInt(document.getElementById('sage').value);
    var e = document.getElementById('semail').value;
    var p = document.getElementById('spass').value;
    if (!n || !u || !a || !e || !p) return alert('Fill all fields');
    if (a < 12) return alert('Must be 12+');
    if (p.length < 6) return alert('Password: 6+ chars');
    if (!/^[a-zA-Z0-9._]{3,20}$/.test(u)) return alert('Username: 3-20 chars, a-z, 0-9, . , _');
    
    db.collection('users').where('username', '==', '@' + u).get().then(function(snap) {
        if (!snap.empty) return alert('Username taken!');
        auth.createUserWithEmailAndPassword(e, p).then(function(cred) {
            return db.collection('users').doc(cred.user.uid).set({
                uid: cred.user.uid, name: n, username: '@' + u, age: a, email: e,
                bio: '', avatar: '', followers: [], following: [], blockedUsers: [],
                achievements: [], streak: 0, xp: 0, coins: 500,
                level: { current: 1, title: 'Explorer', progress: 0 },
                stats: { achievements: 0, totalMessages: 0 }, inventory: []
            });
        }).then(function() {
            alert('Account created! 🎉');
        }).catch(function(x) { alert(x.message); });
    });
}

function logout() {
    auth.signOut();
    currentUser = null;
    currentUserData = null;
    showLogin();
}

function showToast(msg) {
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;top:15px;left:50%;transform:translateX(-50%);background:#D4AF37;color:#0A0E27;padding:10px 20px;border-radius:25px;z-index:9999;font-weight:600;font-size:13px';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 3000);
}

console.log('✅ App loaded successfully');
