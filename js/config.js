const firebaseConfig = {
    apiKey: "AIzaSyAIcmtV131UOy8n-t2_NFWFtnXzqHM09EU",
    authDomain: "chronox-94ad7.firebaseapp.com",
    databaseURL: "https://chronox-94ad7-default-rtdb.firebaseio.com",
    projectId: "chronox-94ad7",
    storageBucket: "chronox-94ad7.firebasestorage.app",
    messagingSenderId: "571679909717",
    appId: "1:571679909717:web:45841500518af27258f1dc",
    measurementId: "G-J99TEGGSST"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

const GEMINI_KEY = "AQ.Ab8RN6JeA-wi9QbkIrCgUYAmOaIRQE3w9t7SJ2Kuy8PrWr3O5g";

console.log('🚀 ChronoX Config Loaded');
