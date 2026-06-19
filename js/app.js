// ==================== APP ====================

// Splash
setTimeout(function() {
    document.getElementById('splashScreen').classList.add('hidden');
    
    auth.onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            db.collection('users').doc(user.uid).get().then(function(doc) {
                currentUserData = doc.data() || {};
                updateStreak();
                showApp();
            });
        } else {
            showLogin();
        }
    });
}, 3000);

function showApp() {
    document.getElementById('authScreen').classList.remove('show');
    document.getElementById('mainApp').classList.add('show');
    setupNav();
    navigate('home');
    db.collection('users').doc(currentUser.uid).update({ onlineStatus: 'online' });
}

function setupNav() {
    document.querySelectorAll('.nav-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            navigate(this.dataset.page);
        });
    });
}

function navigate(page) {
    document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
    var active = document.querySelector('[data-page="' + page + '"]');
    if (active) active.classList.add('active');
    
    var c = document.getElementById('contentArea');
    if (page === 'home') renderHome(c);
    if (page === 'chats') renderChats(c);
    if (page === 'search') renderSearch(c);
    if (page === 'games') openGames();
    if (page === 'profile') renderProfile(c);
}

function updateStreak() {
    var ref = db.collection('users').doc(currentUser.uid);
    ref.get().then(function(doc) {
        var d = doc.data();
        var today = new Date(); today.setHours(0,0,0,0);
        var last = d.lastActive ? d.lastActive.toDate() : null;
        var s = d.streak || 0;
        if (last) {
            last.setHours(0,0,0,0);
            var diff = (today - last) / 86400000;
            if (diff === 1) s++;
            else if (diff > 1) s = 1;
        } else { s = 1; }
        ref.update({ streak: s, lastActive: new Date(), bestStreak: Math.max(s, d.bestStreak||0) });
        currentUserData.streak = s;
    });
}

// ==================== HOME ====================
function renderHome(c) {
    var u = currentUserData;
    var lb = '';
    
    db.collection('users').orderBy('stats.achievements', 'desc').limit(10).get().then(function(snap) {
        var i = 0;
        snap.forEach(function(doc) {
            if (doc.id !== currentUser.uid) {
                var d = doc.data(); i++;
                lb += '<div style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid rgba(255,255,255,0.04)"><span style="font-weight:800;width:30px;color:'+(i<=3?'var(--gold)':'#fff')+'">#'+i+'</span><img src="'+(d.avatar||av(d.name))+'" style="width:38px;height:38px;border-radius:50%;border:2px solid var(--gold)" onerror="this.src=av(\''+d.name+'\')"><div style="flex:1"><b>'+d.name+'</b><br><span style="font-size:11px;color:var(--gold-light)">'+d.username+'</span></div><span style="color:var(--gold);font-weight:700">🏆'+(d.stats?.achievements||0)+'</span></div>';
            }
        });
        
        c.innerHTML = '<div class="card" style="text-align:center"><div style="font-size:60px">🕷️</div><h1 style="color:var(--gold);font-size:26px;font-weight:900;letter-spacing:3px">ChronoX</h1><p style="color:rgba(255,255,255,0.6)">'+u.name+'</p></div><div class="card" style="display:flex;align-items:center;gap:15px"><span style="font-size:45px">🔥</span><div><h1 style="color:var(--gold)">'+(u.streak||0)+' Days</h1><small style="color:rgba(255,255,255,0.6)">Streak • Best: '+(u.bestStreak||0)+'</small></div></div><div class="card"><h3 style="color:var(--gold);margin-bottom:12px">🏆 Leaderboard</h3>'+(lb||'<p style="text-align:center;color:rgba(255,255,255,0.6)">No data</p>')+'</div>';
    });
}

console.log('App loaded');
