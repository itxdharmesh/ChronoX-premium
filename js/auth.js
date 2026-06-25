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
        const authPage = document.getElementById('auth
