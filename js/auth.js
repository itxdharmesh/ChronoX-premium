import { auth, db } from './config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { defaultAvatar, showToast } from './utils.js';

let currentUser = null;
let currentUserData = null;
let isLoginMode = true;

function initAuth() {
    onAuthStateChanged(auth, async (user) => {
        const splashScreen = document.getElementById('splashScreen');
        const authScreen = document.getElementById('authScreen');
        const appContainer = document.getElementById('app-container');
        
        if (user) {
            // USER LOGGED IN
            currentUser = user;
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    currentUserData = userDoc.data();
                    await setDoc(userDocRef, { status: 'online', lastSeen: serverTimestamp() }, { merge: true });
                }
            } catch (error) { console.error('Error:', error); }
            
            // Hide splash and auth, show app
            if (splashScreen) { splashScreen.style.opacity = '0'; setTimeout(() => splashScreen.style.display = 'none', 500); }
            if (authScreen) authScreen.style.display = 'none';
            if (appContainer) { appContainer.style.display = 'flex'; }
            
            // Load dashboard
            if (typeof window.loadDashboard === 'function') window.loadDashboard();
            if (typeof window.navigate === 'function') window.navigate('home');
            
        } else {
            // USER LOGGED OUT
            currentUser = null;
            currentUserData = null;
            
            // Show splash first, then auth
            if (splashScreen) {
                splashScreen.style.display = 'flex';
                splashScreen.style.opacity = '1';
            }
            if (authScreen) authScreen.style.display = 'none';
            if (appContainer) appContainer.style.display = 'none';
            
            // After splash animation, show auth
            setTimeout(() => {
                if (splashScreen) { splashScreen.style.opacity = '0'; setTimeout(() => splashScreen.style.display = 'none', 500); }
                if (authScreen) { authScreen.style.display = 'flex'; authScreen.style.animation = 'fadeIn 0.5s ease'; }
            }, 2500);
        }
    });
}

async function login(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Welcome back! ✨', 'success');
    } catch (error) {
        const messages = { 'auth/user-not-found': 'No account found', 'auth/wrong-password': 'Incorrect password', 'auth/invalid-email': 'Invalid email' };
        showToast(messages[error.code] || error.message, 'error');
    }
}

async function signup(email, password, username, name) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: name || username, username: username.toLowerCase(), bio: '', avatar: defaultAvatar(name || username),
            level: 1, xp: 0, coins: 100, streak: 0, followers: [], following: [],
            badges: ['new_user'], blockedUsers: [], createdAt: serverTimestamp(), status: 'online'
        });
        showToast('Account created! 🎉', 'success');
    } catch (error) {
        const messages = { 'auth/email-already-in-use': 'Email already registered', 'auth/weak-password': 'Password too weak' };
        showToast(messages[error.code] || error.message, 'error');
    }
}

async function logout() {
    try {
        if (currentUser) await setDoc(doc(db, 'users', currentUser.uid), { status: 'offline', lastSeen: serverTimestamp() }, { merge: true });
        await signOut(auth);
        showToast('Logged out', 'info');
    } catch (error) { showToast('Logout failed', 'error'); }
}

// Auth screen toggle
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('authTitle').textContent = isLoginMode ? 'Welcome Back' : 'Create Account';
    document.getElementById('authSubtitle').textContent = isLoginMode ? 'Sign in to continue' : 'Join the premium network';
    document.getElementById('authActionBtn').textContent = isLoginMode ? 'Login' : 'Sign Up';
    document.getElementById('signupField').style.display = isLoginMode ? 'none' : 'block';
    document.getElementById('signupNameField').style.display = isLoginMode ? 'none' : 'block';
    document.getElementById('toggleAuthText').textContent = isLoginMode ? "Don't have an account?" : 'Already have an account?';
    document.getElementById('toggleAuthBtn').textContent = isLoginMode ? 'Sign Up' : 'Login';
}

document.addEventListener('DOMContentLoaded', () => {
    // Auth action button
    document.getElementById('authActionBtn')?.addEventListener('click', async () => {
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPass').value;
        if (!email || !password) { showToast('Fill all fields', 'error'); return; }
        if (isLoginMode) await login(email, password);
        else {
            const username = document.getElementById('authUsername').value.trim();
            const name = document.getElementById('authName').value.trim();
            if (!username) { showToast('Username required', 'error'); return; }
            await signup(email, password, username, name);
        }
    });
    
    // Toggle button
    document.getElementById('toggleAuthBtn')?.addEventListener('click', toggleAuthMode);
    
    // Initialize auth
    initAuth();
});

export { currentUser, currentUserData, initAuth, login, signup, logout };
window.currentUser = currentUser;
window.currentUserData = currentUserData;
window.logout = logout;
