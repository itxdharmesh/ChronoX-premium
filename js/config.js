import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBROVVwRZfnPJcBy1y1jwkG3D124m7S7zw",
  authDomain: "chronox-4562a.firebaseapp.com",
  projectId: "chronox-4562a",
  storageBucket: "chronox-4562a.firebasestorage.app",
  messagingSenderId: "88388929062",
  appId: "1:88388929062:web:ec830cab64b8b207dac8e7",
  measurementId: "G-LMWYZ8RSKN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export for use in other modules
export { auth, db, storage };

// Also make available globally for non-module scripts
window.db = db;
window.auth = auth;
window.storage = storage;
