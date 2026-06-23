var currentUser = null;
var currentUserData = null;

setTimeout(function() {
    try { document.getElementById('splashScreen').classList.add('hidden'); } catch(e) {}
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            db.collection('users').doc(user.uid).get().then(function(doc) {
                currentUserData = (doc.exists && doc.data().name) ? doc.data() : { uid: user.uid, name: 'User', username: '@user', bio: '', avatar: '', followers: [], following: [], blockedUsers: [], achievements: [], streak: 0, xp: 0, coins: 500, level: { current: 1, title: 'Explorer', progress: 0 }, stats: { achievements: 0 }, inventory: [] };
                showApp();
            }).catch(function() {
                currentUserData = { name: 'User', username: '@user', followers: [], following: [], coins: 500, xp: 0, level: { current: 1, title: 'Explorer', progress: 0 }, stats: { achievements: 0 }, inventory: [] };
                showApp();
            });
        } else { showLogin(); }
    });
}, 2500);

function showApp() {
    document.getElementById('authScreen').classList.remove('show');
    document.getElementById('mainApp').classList.add('show');
    document.querySelectorAll('#bottomNav .nav-btn').forEach(function(b) {
        b.onclick = function() { navigate(this.dataset.page); };
    });
    navigate('home');
}

function navigate(p) {
    document.querySelectorAll('#bottomNav .nav-btn').forEach(function(b) { b.classList.remove('active'); });
    var btn = document.querySelector('#bottomNav .nav-btn[data-page="' + p + '"]');
    if (btn) btn.classList.add('active');
    var c = document.getElementById('contentArea');
    var u = currentUserData || {};
    var n = (u.name && u.name !== 'undefined') ? u.name : 'User';
    
    if (p === 'home') {
        c.innerHTML = '<div class="card" style="text-align:center"><div style="font-size:60px">🕷️</div><h1 style="color:#D4AF37;font-size:26px;font-weight:900">ChronoX</h1><p style="color:rgba(255,255,255,0.6)">Welcome, ' + n + '</p></div><div class="card"><div style="display:flex;justify-content:space-around;text-align:center"><div><h2 style="color:#D4AF37">' + (u.coins||0) + '</h2><small>💰</small></div><div><h2 style="color:#00D4FF">' + (u.xp||0) + '</h2><small>⚡</small></div></div></div>';
    } else if (p === 'chats') {
        c.innerHTML = '<h2 style="color:#D4AF37;margin-bottom:15px">💬 Messages</h2><div id="clist"></div>'; 
        if (typeof loadChatList === 'function') loadChatList();
    } else if (p === 'search') {
        c.innerHTML = '<h2 style="color:#D4AF37;margin-bottom:15px">🔍 Search</h2><input class="inp" id="sinput" placeholder="Search..." onkeyup="if(typeof searchUsers===\'function\')searchUsers()"><div id="sresults"></div>';
    } else if (p === 'games') {
        c.innerHTML = '<h2 style="color:#D4AF37;text-align:center;padding:30px">🎮 Games Hub</h2><p style="text-align:center;color:rgba(255,255,255,0.6)">Coming Soon!</p>';
    } else if (p === 'profile') {
        c.innerHTML = '<div class="card" style="text-align:center"><div class="av" style="width:80px;height:80px;font-size:35px;margin:0 auto">' + n[0] + '</div><h2 style="color:#D4AF37">' + n + '</h2><p style="color:#D4AF37">' + (u.username||'@user') + '</p></div><button class="btn-out" onclick="logout()" style="color:#FF4757;border-color:#FF4757">🚪 Logout</button>';
    }
}

function showLogin() {
    document.getElementById('mainApp').classList.remove('show');
    var c = document.getElementById('authScreen'); c.classList.add('show');
    c.innerHTML = '<div class="auth-box"><div style="font-size:55px">🕷️</div><h1 class="auth-title">ChronoX</h1><p class="auth-subtitle">PREMIUM SOCIAL NETWORK</p><input class="inp" id="lemail" placeholder="Email"><input class="inp" id="lpass" placeholder="Password" type="password"><button class="btn" onclick="login()">Sign In</button><span class="link" onclick="showSignup()">Create Account</span></div>';
}
function showSignup() {
    var c = document.getElementById('authScreen');
    c.innerHTML = '<div class="auth-box"><div style="font-size:55px">🕷️</div><h1 class="auth-title">Join ChronoX</h1><input class="inp" id="sname" placeholder="Name"><input class="inp" id="suser" placeholder="Username"><input class="inp" id="sage" placeholder="Age (12+)" type="number"><input class="inp" id="semail" placeholder="Email"><input class="inp" id="spass" placeholder="Password (6+)"><button class="btn" onclick="signup()">Create</button><span class="link" onclick="showLogin()">Login</span></div>';
}
function login(){var e=document.getElementById('lemail').value,p=document.getElementById('lpass').value;if(!e||!p)return showToast('Fill fields','error');auth.signInWithEmailAndPassword(e,p).catch(function(x){showToast(x.message,'error');});}
function signup(){var n=document.getElementById('sname').value,u=document.getElementById('suser').value,a=parseInt(document.getElementById('sage').value),e=document.getElementById('semail').value,p=document.getElementById('spass').value;if(!n||!u||!a||!e||!p)return showToast('Fill fields','error');if(a<12)return showToast('12+ only','error');if(p.length<6)return showToast('6+ chars','error');db.collection('users').where('username','==','@'+u).get().then(function(snap){if(!snap.empty)return showToast('Taken!','error');auth.createUserWithEmailAndPassword(e,p).then(function(cred){return db.collection('users').doc(cred.user.uid).set({uid:cred.user.uid,name:n,username:'@'+u,age:a,email:e,bio:'',avatar:'',followers:[],following:[],blockedUsers:[],achievements:[],streak:0,xp:0,coins:500,level:{current:1,title:'Explorer',progress:0},stats:{achievements:0},inventory:[]});}).then(function(){showToast('Created!🎉');}).catch(function(x){showToast(x.message,'error');});});}
function logout(){auth.signOut();currentUser=null;currentUserData=null;document.getElementById('mainApp').classList.remove('show');showLogin();}
console.log('✅ App loaded');
