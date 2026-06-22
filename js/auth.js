// ==================== AUTH ====================
function showLogin() {
    document.getElementById('mainApp').classList.remove('show');
    var c = document.getElementById('authScreen');
    c.classList.add('show');
    c.innerHTML = '<div class="auth-box"><div class="auth-logo">🕷️</div><div class="auth-title">ChronoX</div><div class="auth-subtitle">Premium Social Network</div><input class="inp" id="lemail" placeholder="Email" type="email"><input class="inp" id="lpass" placeholder="Password" type="password"><button class="btn" onclick="login()">Sign In</button><span class="link" onclick="showForgotPassword()">Forgot Password?</span><span class="link" onclick="showSignup()">Create New Account</span></div>';
}

function showSignup() {
    var c = document.getElementById('authScreen');
    c.innerHTML = '<div class="auth-box"><div class="auth-logo">🕷️</div><div class="auth-title">Join ChronoX</div><input class="inp" id="sname" placeholder="Full Name"><input class="inp" id="suser" placeholder="Username (a-z, 0-9, . , _)"><input class="inp" id="sage" placeholder="Age (12+)" type="number"><input class="inp" id="semail" placeholder="Email" type="email"><input class="inp" id="spass" placeholder="Password (6+ chars)" type="password"><button class="btn" onclick="signup()">Create Account</button><span class="link" onclick="showLogin()">Already have account?</span></div>';
}

function showForgotPassword() {
    openModal('genericModal');
    document.getElementById('genericContent').innerHTML = '<h2 style="color:var(--gold);margin-bottom:15px">🔑 Reset Password</h2><input class="inp" id="resetEmail" placeholder="Email" type="email"><button class="btn" onclick="resetPassword()">Send Reset Link</button><button class="btn-out" onclick="closeModal(\'genericModal\')">Cancel</button>';
}

function login() {
    var e = document.getElementById('lemail').value.trim();
    var p = document.getElementById('lpass').value;
    if (!e || !p) return showToast('Fill all fields', 'error');
    auth.signInWithEmailAndPassword(e, p).catch(function(x) { showToast(x.message.replace('Firebase: ', ''), 'error'); });
}

function signup() {
    var n = document.getElementById('sname').value.trim();
    var u = document.getElementById('suser').value.trim();
    var a = parseInt(document.getElementById('sage').value);
    var e = document.getElementById('semail').value.trim();
    var p = document.getElementById('spass').value;
    if (!n || !u || !a || !e || !p) return showToast('Fill all fields', 'error');
    if (a < 12) return showToast('Must be 12+', 'error');
    if (p.length < 6) return showToast('Password: 6+ chars', 'error');
    if (!/^[a-zA-Z0-9._]{3,20}$/.test(u)) return showToast('Username: 3-20 chars, a-z, 0-9, . , _', 'error');
    
    db.collection('users').where('username', '==', '@' + u).get().then(function(snap) {
        if (!snap.empty) return showToast('Username taken!', 'error');
        auth.createUserWithEmailAndPassword(e, p).then(function(cred) {
            return db.collection('users').doc(cred.user.uid).set({
                uid: cred.user.uid, name: n, username: '@' + u, age: a, email: e,
                bio: '', avatar: '', followers: [], following: [], blockedUsers: [],
                restrictedUsers: [], mutedUsers: [], closeFriends: [], followRequests: [],
                achievements: [], streak: 0, bestStreak: 0, xp: 0,
                level: { current: 1, title: 'Explorer', progress: 0 },
                stats: { achievements: 0, totalMessages: 0, gamesPlayed: 0, gamesWon: 0 },
                gameStats: { wins: 0, losses: 0, draws: 0 },
                onlineStatus: 'online', lastSeen: null, recentSearches: [], quizScores: [],
                usernameChangeCount: 0, lastUsernameChange: null, isPrivate: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }).then(function() { showToast('Account created! 🎉'); }).catch(function(x) { showToast(x.message, 'error'); });
    });
}

function resetPassword() {
    var e = document.getElementById('resetEmail').value.trim();
    if (!e) return showToast('Enter email', 'error');
    auth.sendPasswordResetEmail(e).then(function() { closeModal('genericModal'); showToast('Reset link sent! 📧'); }).catch(function(x) { showToast(x.message, 'error'); });
}

function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).update({ onlineStatus: 'offline', lastSeen: firebase.firestore.FieldValue.serverTimestamp() });
    }
    auth.signOut();
    currentUser = null;
    currentUserData = null;
    document.getElementById('mainApp').classList.remove('show');
    showLogin();
}

console.log('✅ Auth loaded');
