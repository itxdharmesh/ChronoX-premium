// --- CENTRALIZED APP ENGINE ---
var currentUser = null;
var currentUserData = null;

// Firebase Listener
auth.onAuthStateChanged(function(user) {
    if (user) {
        currentUser = user;
        db.collection('users').doc(user.uid).get().then(function(doc) {
            currentUserData = doc.exists ? doc.data() : { name: 'User', xp: 0, coins: 500 };
            document.getElementById('splashScreen')?.classList.add('hidden');
            document.getElementById('mainApp')?.classList.add('show');
            navigate('home');
        });
    } else {
        document.getElementById('mainApp')?.classList.remove('show');
        document.getElementById('authScreen')?.classList.add('show');
    }
});

// Navigation Engine
function navigate(p) {
    var btns = document.querySelectorAll('#bottomNav .nav-btn');
    btns.forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-page="${p}"]`)?.classList.add('active');
    
    var c = document.getElementById('contentArea');
    if (!c) return;

    if (p === 'games') {
        c.innerHTML = `
            <div style="padding:20px; color:white; font-family:sans-serif;">
                <h1 style="color:#D4AF37;">🎮 Games Hub</h1>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div onclick="alert('Shooter Game Starting...')" style="background:#1a1a1a; padding:20px; border-radius:10px; border:1px solid #00D4FF;">🚀 Shooter</div>
                    <div onclick="alert('Drift Game Starting...')" style="background:#1a1a1a; padding:20px; border-radius:10px; border:1px solid #FF9F43;">🏎️ Drift</div>
                </div>
            </div>`;
    } else if (p === 'profile') {
        const u = currentUserData || { name: 'User', xp: 0 };
        c.innerHTML = `
            <div style="padding:20px; color:white; text-align:center; font-family:sans-serif;">
                <h1 style="color:#D4AF37;">👤 Profile</h1>
                <div style="background:#1a1a1a; padding:20px; border-radius:10px;">
                    <h2>${u.name}</h2>
                    <p>Total XP: ${u.xp}</p>
                    <button onclick="auth.signOut(); location.reload();" style="background:red; border:none; padding:10px 20px; color:white; border-radius:5px;">Logout</button>
                </div>
            </div>`;
    } else {
        c.innerHTML = `<div style="padding:20px; color:white;"><h1>${p.toUpperCase()}</h1><p>Coming Soon...</p></div>`;
    }
}
