import { auth, db } from './config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { defaultAvatar, showToast } from './utils.js';

// Global user state
let currentUser = null;
let currentUserData = null;
let isLoginMode = true;

// Initialize authentication state observer
function initAuth() {
    onAuthStateChanged(auth, async (user) => {
        const splashScreen = document.getElementById('splashScreen');
        const authScreen = document.getElementById('authScreen');
        const appContainer = document.getElementById('app-container');
        
        if (user) {
            // USER IS LOGGED IN
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
            
            // Hide splash screen
            if (splashScreen) {
                splashScreen.style.opacity = '0';
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                }, 500);
            }
            
            // Hide auth screen
            if (authScreen) {
                authScreen.style.display = 'none';
            }
            
            // Show main app
            if (appContainer) {
                appContainer.style.display = 'flex';
                appContainer.style.animation = 'fadeIn 0.5s ease';
            }
            
            // Load dashboard
            if (typeof window.loadDashboard === 'function') {
                setTimeout(() => window.loadDashboard(), 300);
            }
            
            // Navigate to home
            if (typeof window.navigate === 'function') {
                window.navigate('home');
            }
            
        } else {
            // USER IS LOGGED OUT
            currentUser = null;
            currentUserData = null;
            
            // Hide app
            if (appContainer) {
                appContainer.style.display = 'none';
            }
            
            // Show splash first
            if (splashScreen) {
                splashScreen.style.display = 'flex';
                splashScreen.style.opacity = '1';
            }
            
            // Hide auth initially
            if (authScreen) {
                authScreen.style.display = 'none';
            }
            
            // After splash animation, show auth
            setTimeout(() => {
                if (splashScreen) {
                    splashScreen.style.opacity = '0';
                    setTimeout(() => {
                        splashScreen.style.display = 'none';
                    }, 500);
                }
                
                if (authScreen) {
                    authScreen.style.display = 'flex';
                    authScreen.style.animation = 'fadeIn 0.5s ease';
                }
                
                // Reset to login mode
                isLoginMode = true;
                resetAuthForm();
            }, 2500);
        }
    });
}

// Reset auth form to login mode
function resetAuthForm() {
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authActionBtn = document.getElementById('authActionBtn');
    const signupField = document.getElementById('signupField');
    const signupNameField = document.getElementById('signupNameField');
    const toggleAuthText = document.getElementById('toggleAuthText');
    const toggleAuthBtn = document.getElementById('toggleAuthBtn');
    
    if (authTitle) authTitle.textContent = 'Welcome Back';
    if (authSubtitle) authSubtitle.textContent = 'Sign in to continue your journey';
    if (authActionBtn) authActionBtn.textContent = 'Login';
    if (signupField) signupField.style.display = 'none';
    if (signupNameField) signupNameField.style.display = 'none';
    if (toggleAuthText) toggleAuthText.textContent = "Don't have an account?";
    if (toggleAuthBtn) toggleAuthBtn.textContent = 'Sign Up';
    
    // Clear input fields
    const authEmail = document.getElementById('authEmail');
    const authPass = document.getElementById('authPass');
    const authUsername = document.getElementById('authUsername');
    const authName = document.getElementById('authName');
    
    if (authEmail) authEmail.value = '';
    if (authPass) authPass.value = '';
    if (authUsername) authUsername.value = '';
    if (authName) authName.value = '';
}

// Toggle between login and signup mode
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authActionBtn = document.getElementById('authActionBtn');
    const signupField = document.getElementById('signupField');
    const signupNameField = document.getElementById('signupNameField');
    const toggleAuthText = document.getElementById('toggleAuthText');
    const toggleAuthBtn = document.getElementById('toggleAuthBtn');
    
    if (isLoginMode) {
        // Switch to Login mode
        if (authTitle) authTitle.textContent = 'Welcome Back';
        if (authSubtitle) authSubtitle.textContent = 'Sign in to continue your journey';
        if (authActionBtn) authActionBtn.textContent = 'Login';
        if (signupField) signupField.style.display = 'none';
        if (signupNameField) signupNameField.style.display = 'none';
        if (toggleAuthText) toggleAuthText.textContent = "Don't have an account?";
        if (toggleAuthBtn) toggleAuthBtn.textContent = 'Sign Up';
    } else {
        // Switch to Signup mode
        if (authTitle) authTitle.textContent = 'Create Account';
        if (authSubtitle) authSubtitle.textContent = 'Join the premium social network';
        if (authActionBtn) authActionBtn.textContent = 'Sign Up';
        if (signupField) signupField.style.display = 'block';
        if (signupNameField) signupNameField.style.display = 'block';
        if (toggleAuthText) toggleAuthText.textContent = 'Already have an account?';
        if (toggleAuthBtn) toggleAuthBtn.textContent = 'Login';
    }
    
    // Clear input fields
    const authEmail = document.getElementById('authEmail');
    const authPass = document.getElementById('authPass');
    const authUsername = document.getElementById('authUsername');
    const authName = document.getElementById('authName');
    
    if (authEmail) authEmail.value = '';
    if (authPass) authPass.value = '';
    if (authUsername) authUsername.value = '';
    if (authName) authName.value = '';
}

// Login function
async function login(email, password) {
    if (!email || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Welcome back! ✨', 'success');
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
            case 'auth/invalid-credential':
                message = 'Invalid email or password';
                break;
            case 'auth/too-many-requests':
                message = 'Too many attempts. Try again later';
                break;
            default:
                message = error.message;
        }
        showToast(message, 'error');
    }
}

// Signup function
async function signup(email, password, username, name) {
    if (!email || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (!username) {
        showToast('Username is required', 'error');
        return;
    }
    
    if (username.length < 3) {
        showToast('Username must be at least 3 characters', 'error');
        return;
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user profile
        await setDoc(doc(db, 'users', user.uid), {
            name: name || username,
            username: username.toLowerCase(),
            bio: '',
            avatar: defaultAvatar(name || username),
            level: 1,
            xp: 0,
            coins: 100,
            streak: 0,
            dailyGamesPlayed: 0,
            followers: [],
            following: [],
            badges: ['new_user'],
            blockedUsers: [],
            createdAt: serverTimestamp(),
            status: 'online',
            lastSeen: serverTimestamp()
        });
        
        showToast('Account created successfully! 🎉', 'success');
    } catch (error) {
        let message = 'Signup failed';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Email already registered';
                break;
            case 'auth/weak-password':
                message = 'Password must be at least 6 characters';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            default:
                message = error.message;
        }
        showToast(message, 'error');
    }
}

// Logout function
async function logout() {
    try {
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

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('authActionBtn')?.click();
    }
}

// Initialize all event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Auth action button (Login/Signup)
    const authActionBtn = document.getElementById('authActionBtn');
    if (authActionBtn) {
        authActionBtn.addEventListener('click', async () => {
            const email = document.getElementById('authEmail')?.value.trim();
            const password = document.getElementById('authPass')?.value;
            
            if (isLoginMode) {
                await login(email, password);
            } else {
                const username = document.getElementById('authUsername')?.value.trim();
                const name = document.getElementById('authName')?.value.trim();
                await signup(email, password, username, name);
            }
        });
    }
    
    // Toggle auth mode button
    const toggleAuthBtn = document.getElementById('toggleAuthBtn');
    if (toggleAuthBtn) {
        toggleAuthBtn.addEventListener('click', toggleAuthMode);
    }
    
    // Enter key listeners
    const authEmail = document.getElementById('authEmail');
    const authPass = document.getElementById('authPass');
    const authUsername = document.getElementById('authUsername');
    const authName = document.getElementById('authName');
    
    if (authEmail) authEmail.addEventListener('keypress', handleKeyPress);
    if (authPass) authPass.addEventListener('keypress', handleKeyPress);
    if (authUsername) authUsername.addEventListener('keypress', handleKeyPress);
    if (authName) authName.addEventListener('keypress', handleKeyPress);
    
    // Social login buttons (placeholder)
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('Social login coming soon! 🚧', 'info');
        });
    });
    
    // Start auth initialization
    initAuth();
});

// Exports for other modules
export { 
    currentUser, 
    currentUserData, 
    initAuth, 
    login, 
    signup, 
    logout, 
    toggleAuthMode 
};

// Make available globally
window.currentUser = currentUser;
window.currentUserData = currentUserData;
window.logout = logout;
window.toggleAuthMode = toggleAuthMode;
