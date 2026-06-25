import { auth, db } from './config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { defaultAvatar, showToast } from './utils.js';

// Global state
let currentUser = null;
let currentUserData = null;

// Initialize authentication state observer
function initAuth() {
    onAuthStateChanged(auth, async (user) => {
        const splashScreen = document.getElementById('splashScreen');
        const authPage = document.getElementById('authPage');
        
        if (user) {
            // User is signed in
            currentUser = user;
            
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                
                if (userDoc.exists()) {
                    currentUserData = userDoc.data();
                    
                    // Update online status
                    await setDoc(userDocRef, { 
                        status: 'online',
                        lastSeen: serverTimestamp()
                    }, { merge: true });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
            
            // Hide splash and auth, show app
            if (splashScreen) splashScreen.style.display = 'none';
            if (authPage) authPage.classList.remove('active');
            
            // Navigate to home
            if (typeof window.navigate === 'function') {
                window.navigate('home');
            }
        } else {
            // User is signed out
            currentUser = null;
            currentUserData = null;
            
            // Show auth page
            if (splashScreen) splashScreen.style.display = 'none';
            if (authPage) authPage.classList.add('active');
            
            // Hide all other pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
        }
    });
}

// Login function
async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showToast('Welcome back! ✨', 'success');
        return userCredential.user;
    } catch (error) {
        let message = 'Login failed';
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            default:
                message = error.message;
        }
        showToast(message, 'error');
        throw error;
    }
}

// Signup function
async function signup(email, password, username) {
    try {
        // Create auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user profile in Firestore
        const userData = {
            name: username,
            username: username.toLowerCase(),
            bio: '',
            avatar: defaultAvatar(username),
            level: 1,
            xp: 0,
            coins: 50,
            streak: 0,
            followers: [],
            following: [],
            badges: ['new_user'],
            blockedUsers: [],
            createdAt: serverTimestamp(),
            status: 'online',
            lastSeen: serverTimestamp()
        };
        
        await setDoc(doc(db, 'users', user.uid), userData);
        
        showToast('Account created successfully! 🎉', 'success');
        return user;
    } catch (error) {
        let message = 'Signup failed';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Email already registered';
                break;
            case 'auth/weak-password':
                message = 'Password should be at least 6 characters';
                break;
            default:
                message = error.message;
        }
        showToast(message, 'error');
        throw error;
    }
}

// Logout function
async function logout() {
    try {
        // Update status to offline
        if (currentUser) {
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, { 
                status: 'offline',
                lastSeen: serverTimestamp()
            }, { merge: true });
        }
        
        await signOut(auth);
        showToast('Logged out successfully', 'info');
    } catch (error) {
        showToast('Logout failed', 'error');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login button
    document.getElementById('loginBtn')?.addEventListener('click', async () => {
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPass').value;
        
        if (!email || !password) {
            showToast('Please fill all fields', 'error');
            return;
        }
        
        await login(email, password);
    });
    
    // Signup button
    document.getElementById('signupBtn')?.addEventListener('click', async () => {
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPass').value;
        const username = document.getElementById('authUsername').value.trim();
        
        if (!email || !password) {
            showToast('Please fill all fields', 'error');
            return;
        }
        
        if (document.getElementById('signupField').style.display !== 'none' && !username) {
            showToast('Username is required', 'error');
            return;
        }
        
        await signup(email, password, username || email.split('@')[0]);
    });
    
    // Toggle between login and signup
    document.getElementById('toggleAuth')?.addEventListener('click', function() {
        const signupField = document.getElementById('signupField');
        const authTitle = document.querySelector('.auth-title');
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        
        if (signupField.style.display === 'none') {
            // Switch to signup mode
            signupField.style.display = 'block';
            authTitle.textContent = 'Create Account';
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'block';
            signupBtn.style.flex = '1';
            this.textContent = 'already have account';
        } else {
            // Switch to login mode
            signupField.style.display = 'none';
            authTitle.textContent = 'Welcome Back';
            loginBtn.style.display = 'block';
            signupBtn.style.display = 'block';
            signupBtn.style.flex = '1';
            this.textContent = 'create new account';
        }
    });
    
    // Initialize auth
    initAuth();
});

// Export for other modules
export { currentUser, currentUserData, initAuth, login, signup, logout };

// Make available globally
window.currentUser = currentUser;
window.currentUserData = currentUserData;
window.logout = logout;
