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

// Universal Navigation Controller
function navigate(p) {
    // 1. Navigation UI Updates
    var btns = document.querySelectorAll('.nav-btn');
    btns.forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-page="${p}"]`)?.classList.add('active');
    
    var c = document.getElementById('contentArea');
    if (!c) return;

    // 2. Modular Routing
    switch(p) {
        case 'home':
            if(typeof renderDashboard === 'function') renderDashboard(c);
            break;
        case 'chats':
            if(typeof renderChats === 'function') renderChats(c);
            break;
        case 'search':
            if(typeof renderSearch === 'function') renderSearch(c);
            break;
        case 'games':
            if(typeof openGames === 'function') openGames();
            break;
        case 'profile':
            if(typeof renderProfile === 'function') renderProfile(c);
            break;
        default:
            c.innerHTML = `<h1>${p.toUpperCase()}</h1>`;
    }
}

// Global Event Listeners for Nav Buttons
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        navigate(this.dataset.page);
    });
});

// Logout Helper
function logout() {
    auth.signOut().then(() => location.reload());
}
