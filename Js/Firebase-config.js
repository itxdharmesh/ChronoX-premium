// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBROVVwRZfnPJcBy1y1jwkG3D124m7S7zw",
  authDomain: "chronox-4562a.firebaseapp.com",
  projectId: "chronox-4562a",
  storageBucket: "chronox-4562a.firebasestorage.app",
  messagingSenderId: "88388929062",
  appId: "1:88388929062:web:ec830cab64b8b207dac8e7",
  measurementId: "G-LMWYZ8RSKN"
};

// Google Gemini API (Optional - for real AI)
const GEMINI_API_KEY = "AQ.Ab8RN6JeA-wi9QbkIrCgUYAmOaIRQE3w9t7SJ2Kuy8PrWr3O5g";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Global Variables
let currentUser = null;
let currentUserData = null;
let activeChatId = null;
let activeChatUser = null;
let chatListener = null;

console.log('🕷️ ChronoX Firebase Initialized');
