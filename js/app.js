var currentUser = null;
var currentUserData = null;

// Firebase Auth Listener
auth.onAuthStateChanged(function(user) {
    if (user) {
        currentUser = user;
        db.collection('users').doc(user.uid).get().then(function(doc) {
            currentUserData = doc.exists ? doc.data() : { name: 'User', xp: 0, coins: 500 };
            showApp();
        });
    } else {
        showLogin();
    }
});

function showApp() {
    document.getElementById('splashScreen')?.classList.add('hidden');
    document.getElementById('authScreen')?.classList.remove('show');
    document.getElementById('mainApp')?.classList.add('show');
    navigate('home');
}

function navigate(p) {
    var btns = document.querySelectorAll('#bottomNav .nav-btn');
    btns.forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-page="${p}"]`)?.classList.add('active');
    
    var c = document.getElementById('contentArea');
    if (!c) return;

    if (p === 'home') typeof renderDashboard === 'function' ? renderDashboard(c) : (c.innerHTML = '<h1>Home</h1>');
    else if (p === 'games') typeof openGames === 'function' ? openGames() : (c.innerHTML = '<h1 style="color:white">Games Error</h1>');
    else if (p === 'profile') typeof renderProfile === 'function' ? renderProfile(c) : (c.innerHTML = '<h1 style="color:white">Profile Error</h1>');
    else c.innerHTML = '<h1 style="color:white">' + p.toUpperCase() + '</h1>';
}
