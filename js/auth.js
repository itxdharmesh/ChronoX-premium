// ==================== AUTH ====================

function showLogin() {
    document.getElementById('mainApp').classList.remove('show');
    var c = document.getElementById('authScreen');
    c.classList.add('show');
    c.innerHTML = `
        <div class="auth-box">
            <div class="auth-logo">🕷️</div>
            <div class="auth-title">ChronoX</div>
            <div class="auth-subtitle">Premium Social Network</div>
            <input class="inp" id="lemail" placeholder="Email" type="email">
            <input class="inp" id="lpass" placeholder="Password" type="password">
            <button class="btn" onclick="login()">Sign In</button>
            <span class="link" onclick="showSignup()">Create New Account</span>
        </div>`;
}

function showSignup() {
    var c = document.getElementById('authScreen');
    c.innerHTML = `
        <div class="auth-box">
            <div class="auth-logo">🕷️</div>
            <div class="auth-title">Join ChronoX</div>
            <input class="inp" id="sname" placeholder="Full Name">
            <input class="inp" id="suser" placeholder="Username">
            <input class="inp" id="sage" placeholder="Age (12+)" type="number">
            <input class="inp" id="semail" placeholder="Email" type="email">
            <input class="inp" id="spass" placeholder="Password (6+ chars)" type="password">
            <button class="btn" onclick="signup()">Create Account</button>
            <span class="link" onclick="showLogin()">Already have account?</span>
        </div>`;
}

function login() {
    var e = document.getElementById('lemail').value;
    var p = document.getElementById('lpass').value;
    if (!e || !p) return toast('Fill all fields', 'error');
    auth.signInWithEmailAndPassword(e, p).catch(function(x) {
        toast(x.message, 'error');
    });
}

function signup() {
    var n = document.getElementById('sname').value;
    var u = document.getElementById('suser').value;
    var a = parseInt(document.getElementById('sage').value);
    var e = document.getElementById('semail').value;
    var p = document.getElementById('spass').value;
    
    if (!n || !u || !a || !e || !p) return toast('Fill all fields', 'error');
    if (a < 12) return toast('Must be 12+', 'error');
    if (p.length < 6) return toast('Password: 6+ chars', 'error');
    
    auth.createUserWithEmailAndPassword(e, p).then(function(cred) {
        db.collection('users').doc(cred.user.uid).set({
            name: n, username: '@' + u, age: a, email: e,
            bio: '', avatar: '', posts: 0, followers: [], following: [],
            blockedUsers: [], achievements: [], streak: 0, bestStreak: 0,
            level: { current: 1, title: 'Explorer', progress: 0 },
            stats: { achievements: 0, totalMessages: 0, gamesPlayed: 0 },
            gameStats: { wins: 0, losses: 0, draws: 0 },
            onlineStatus: 'online', recentSearches: [], quizScores: []
        });
        toast('Account created! Welcome to ChronoX 🎉');
    }).catch(function(x) {
        toast(x.message, 'error');
    });
}

function logout() {
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).update({ onlineStatus: 'offline' });
    }
    auth.signOut();
    currentUser = null;
    currentUserData = null;
    document.getElementById('mainApp').classList.remove('show');
    showLogin();
}

console.log('Auth loaded');
