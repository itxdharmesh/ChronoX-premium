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
    // Buttons update
    var btns = document.querySelectorAll('#bottomNav .nav-btn');
    btns.forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-page="${p}"]`)?.classList.add('active');
    
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Routing Logic
    switch(p) {
        case 'home':
            c.innerHTML = `<div style="padding:20px; color:white;"><h1>🏠 Dashboard</h1><p>Welcome to your personal hub.</p></div>`;
            break;
            
        case 'chats':
            c.innerHTML = `<div style="padding:20px; color:white;"><h1>💬 Chats</h1><p>Connect with global players.</p></div>`;
            break;
            
        case 'search':
            c.innerHTML = `<div style="padding:20px; color:white;"><h1>🔍 Search</h1><input type="text" placeholder="Find games..." style="width:100%; padding:10px; border-radius:10px;"></div>`;
            break;
            
        case 'games':
            // Yahan Games Hub load hoga
            if(typeof openGames === 'function') {
                openGames();
            } else {
                c.innerHTML = `<h1 style="color:red; padding:20px;">Games module missing!</h1>`;
            }
            break;
            
        case 'profile':
            const u = currentUserData || { name: 'User', xp: 0, coins: 500 };
            c.innerHTML = `
                <div style="padding:30px; color:white; text-align:center;">
                    <h1 style="color:#D4AF37;">👤 Profile</h1>
                    <div style="background:#1a1a1a; padding:20px; border-radius:20px; border:1px solid #333;">
                        <h2>${u.name}</h2>
                        <p>XP: ${u.xp} | Coins: ${u.coins}</p>
                        <button onclick="auth.signOut(); location.reload();" style="background:#ff4757; border:none; padding:10px 20px; color:white; border-radius:10px;">Logout</button>
                    </div>
                </div>`;
            break;
            
        default:
            c.innerHTML = `<div style="padding:20px; color:white;"><h1>${p.toUpperCase()}</h1></div>`;
    }
}
