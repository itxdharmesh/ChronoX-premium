import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBROVVwRZfnPJcBy1y1jwkG3D124m7S7zw",
  authDomain: "chronox-4562a.firebaseapp.com",
  projectId: "chronox-4562a",
  storageBucket: "chronox-4562a.firebasestorage.app",
  messagingSenderId: "88388929062",
  appId: "1:88388929062:web:ec830cab64b8b207dac8e7",
  measurementId: "G-LMWYZ8RSKN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('✅ Firebase Connected Successfully!');

export { auth, db };
window.db = db;
window.auth = auth;
