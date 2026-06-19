// ==================== AUTHENTICATION ====================

// Show login screen
function showLogin() {
    document.getElementById('mainApp').classList.remove('show');
    const authContainer = document.getElementById('authContainer');
    authContainer.style.display = 'flex';
    authContainer.innerHTML = `
        <div class="auth-box">
            <div style="font-size:50px;text-align:center;margin-bottom:10px">🕷️</div>
            <h2 style="color:var(--gold);text-align:center">ChronoX</h2>
            <p style="color:var(--text2);text-align:center;margin-bottom:20px;font-size:13px">Premium Social Network</p>
            <input class="input-field" id="loginEmail" placeholder="Email" type="email">
            <input class="input-field" id="loginPassword" placeholder="Password" type="password">
            <button class="btn-gold" onclick="login()">Sign In</button>
            <div style="text-align:center;margin-top:15px">
                <span class="link" onclick="showForgotPassword()">Forgot Password?</span><br>
                <span class="link" onclick="showSignup()">Create New Account</span>
            </div>
        </div>
    `;
}

// Show signup screen
function showSignup() {
    const authContainer = document.getElementById('authContainer');
    authContainer.innerHTML = `
        <div class="auth-box">
            <div style="font-size:50px;text-align:center;margin-bottom:10px">🕷️</div>
            <h2 style="color:var(--gold);text-align:center">Join ChronoX</h2>
            <input class="input-field" id="signName" placeholder="Full Name">
            <input class="input-field" id="signUsername" placeholder="Username (a-z, 0-9, . , _)">
            <input class="input-field" id="signAge" placeholder="Age (12+)" type="number">
            <input class="input-field" id="signEmail" placeholder="Email" type="email">
            <input class="input-field" id="signPassword" placeholder="Password (6+ chars)" type="password">
            <input class="input-field" id="signConfirm" placeholder="Confirm Password" type="password">
            <div class="captcha-box">
                <div class="captcha-check" id="signCaptcha" onclick="this.classList.toggle('checked')"></div>
                <span style="color:var(--text2);font-size:13px">I'm not a robot</span>
            </div>
            <button class="btn-gold" onclick="signup()">Create Account</button>
            <div style="text-align:center;margin-top:15px">
                <span class="link" onclick="showLogin()">Already have account? Sign In</span>
            </div>
        </div>
    `;
}

// Show forgot password
function showForgotPassword() {
    openModal('genericModal');
    document.getElementById('genericModalContent').innerHTML = `
        <div class="modal-header">
            <h2>Reset Password</h2>
            <button onclick="closeModal('genericModal')">✕</button>
        </div>
        <input class="input-field" id="resetEmail" placeholder="Email" type="email">
        <div class="captcha-box">
            <div class="captcha-check" id="forgotCaptcha" onclick="this.classList.toggle('checked')"></div>
            <span style="color:var(--text2);font-size:13px">I'm not a robot</span>
        </div>
        <button class="btn-gold" onclick="resetPassword()">Send Reset Link</button>
    `;
}

// Login function
async function login() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) return showToast('Please fill all fields', 'error');
    
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        currentUser = result.user;
        console.log('✅ Logged in:', currentUser.uid);
    } catch (error) {
        console.error('Login error:', error);
        showToast(getErrorMessage(error.code), 'error');
    }
}

// Signup function
async function signup() {
    const name = document.getElementById('signName')?.value?.trim();
    const username = document.getElementById('signUsername')?.value?.trim();
    const age = parseInt(document.getElementById('signAge')?.value);
    const email = document.getElementById('signEmail')?.value?.trim();
    const password = document.getElementById('signPassword')?.value;
    const confirm = document.getElementById('signConfirm')?.value;
    const captcha = document.getElementById('signCaptcha');
    
    // Validations
    if (!name || !username || !age || !email || !password) {
        return showToast('Please fill all fields', 'error');
    }
    if (age < 12) return showToast('You must be 12+ to join', 'error');
    if (password.length < 6) return showToast('Password must be 6+ characters', 'error');
    if (password !== confirm) return showToast('Passwords do not match', 'error');
    if (!isValidUsername(username)) return showToast('Username: 3-20 chars, only a-z, 0-9, . , _', 'error');
    if (!captcha?.classList.contains('checked')) return showToast('Please verify captcha', 'error');
    
    // Check duplicate username
    try {
        const snapshot = await db.collection('users').where('username', '==', '@' + username).get();
        if (!snapshot.empty) return showToast('Username already taken!', 'error');
        
        const result = await auth.createUserWithEmailAndPassword(email, password);
        
        // Create user profile
        await db.collection('users').doc(result.user.uid).set({
            uid: result.user.uid,
            name,
            username: '@' + username,
            age,
            email,
            bio: '',
            avatar: '',
            posts: 0,
            followers: [],
            following: [],
            blockedUsers: [],
            verified: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            stats: { chats: 0, achievements: 0, totalMessages: 0, gamesPlayed: 0 },
            level: { current: 1, title: 'Explorer', progress: 0 },
            achievements: [],
            streak: 0,
            bestStreak: 0,
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            lastUsernameChange: null,
            usernameChangeCount: 0,
            onlineStatus: 'online',
            lastSeen: null,
            recentSearches: [],
            quizScores: [],
            gameStats: { wins: 0, losses: 0, draws: 0 }
        });
        
        currentUser = result.user;
        showToast('Account created! Welcome to ChronoX 🎉');
        
    } catch (error) {
        console.error('Signup error:', error);
        showToast(getErrorMessage(error.code), 'error');
    }
}

// Reset password
async function resetPassword() {
    const email = document.getElementById('resetEmail')?.value;
    const captcha = document.getElementById('forgotCaptcha');
    
    if (!email) return showToast('Enter email', 'error');
    if (!captcha?.classList.contains('checked')) return showToast('Verify captcha', 'error');
    
    try {
        await auth.sendPasswordResetEmail(email);
        showToast('Reset link sent to your email! 📧');
        closeModal('genericModal');
    } catch (error) {
        showToast(getErrorMessage(error.code), 'error');
    }
}

// Logout
async function logout() {
    if (currentUser) {
        await db.collection('users').doc(currentUser.uid).update({
            onlineStatus: 'offline',
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    await auth.signOut();
    currentUser = null;
    currentUserData = null;
    showLogin();
}

// Get readable error message
function getErrorMessage(code) {
    const errors = {
        'auth/email-already-in-use': 'Email already registered!',
        'auth/invalid-email': 'Invalid email address!',
        'auth/weak-password': 'Password too weak!',
        'auth/user-not-found': 'No account found with this email!',
        'auth/wrong-password': 'Incorrect password!',
        'auth/invalid-credential': 'Invalid email or password!',
        'auth/too-many-requests': 'Too many attempts! Try again later.'
    };
    return errors[code] || 'Something went wrong! Please try again.';
}

console.log('✅ Auth module loaded');
