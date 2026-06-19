// ==================== MAIN APP ====================

// Initialize app
function initApp() {
    console.log('🕷️ ChronoX Initializing...');
    
    // Setup navigation
    document.querySelectorAll('#bottomNav .nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.dataset.page;
            navigateTo(page);
        });
    });
    
    // Start with home page
    navigateTo('home');
    
    // Set online status
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).update({
            onlineStatus: 'online',
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    // Update streak
    updateStreak();
    
    // Handle disconnect
    window.addEventListener('beforeunload', () => {
        if (currentUser) {
            db.collection('users').doc(currentUser.uid).update({
                onlineStatus: 'offline',
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    });
    
    console.log('✅ ChronoX Ready!');
}

// Navigate to page
async function navigateTo(page) {
    // Update nav buttons
    document.querySelectorAll('#bottomNav .nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) btn.classList.add('active');
    });
    
    // Load user data if needed
    if (!currentUserData && currentUser) {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        currentUserData = doc.data();
    }
    
    // Render page
    const content = document.getElementById('contentArea');
    switch(page) {
        case 'home': renderHome(content); break;
        case 'chats': renderChats(content); break;
        case 'discover': renderDiscover(content); break;
        case 'quiz': openQuiz(); break;
        case 'games': openGames(); break;
        case 'profile': renderProfile(content); break;
        default: renderHome(content);
    }
}

// Update streak
async function updateStreak() {
    if (!currentUser) return;
    
    const userRef = db.collection('users').doc(currentUser.uid);
    const doc = await userRef.get();
    const userData = doc.data();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActive = userData.lastActive?.toDate?.() || userData.lastActive;
    let streak = userData.streak || 0;
    
    if (lastActive) {
        const lastDay = new Date(lastActive);
        lastDay.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) streak++;
        else if (diffDays > 1) streak = 1;
    } else {
        streak = 1;
    }
    
    await userRef.update({
        streak,
        bestStreak: Math.max(streak, userData.bestStreak || 0),
        lastActive: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    if (currentUserData) {
        currentUserData.streak = streak;
        currentUserData.bestStreak = Math.max(streak, userData.bestStreak || 0);
    }
}

// Render home page
async function renderHome(container) {
    const u = currentUserData || {};
    
    // Get leaderboard
    let leaderboardHTML = '<div style="text-align:center;padding:20px;color:var(--text2)">Loading...</div>';
    
    try {
        const snapshot = await db.collection('users')
            .orderBy('stats.achievements', 'desc')
            .limit(10)
            .get();
        
        const leaders = [];
        snapshot.forEach(doc => {
            if (doc.id !== currentUser?.uid) {
                leaders.push({ id: doc.id, ...doc.data() });
            }
        });
        
        leaderboardHTML = leaders.map((l, i) => `
            <div class="leader-item" onclick="viewUserProfile('${l.id}')">
                <span class="leader-rank ${i < 3 ? 'top' : ''}">#${i + 1}</span>
                <img src="${l.avatar || getAvatar(l.name)}" class="leader-avatar" onerror="this.src='${getAvatar(l.name)}'">
                <div class="leader-info">
                    <div class="leader-name">${l.name}</div>
                    <div class="leader-username">${l.username}</div>
                </div>
                <div class="leader-score">🏆 ${l.stats?.achievements || 0}</div>
            </div>
        `).join('');
    } catch (e) {
        leaderboardHTML = '<div style="text-align:center;padding:20px;color:var(--text2)">No data yet</div>';
    }
    
    container.innerHTML = `
        <!-- Header -->
        <div class="card" style="text-align:center">
            <div style="font-size:60px">🕷️</div>
            <h1 style="color:var(--gold);font-size:28px;font-weight:900;letter-spacing:3px">ChronoX</h1>
            <p style="color:var(--text2)">${u.name || 'Welcome'}</p>
        </div>
        
        <!-- Streak -->
        <div class="card streak-card">
            <div style="display:flex;align-items:center;gap:15px">
                <div style="font-size:45px">🔥</div>
                <div>
                    <div style="font-size:32px;font-weight:900;color:var(--gold)">${u.streak || 0}</div>
                    <div style="color:var(--text2);font-size:12px">Day Streak • Best: ${u.bestStreak || 0}</div>
                </div>
            </div>
        </div>
        
        <!-- Quick Links -->
        <div class="card">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
                <button class="quick-link-btn" onclick="openQuiz()">
                    <span style="font-size:30px">❓</span>
                    <span style="font-size:11px;color:var(--text2)">Quiz</span>
                </button>
                <button class="quick-link-btn" onclick="navigateTo('discover')">
                    <span style="font-size:30px">🔍</span>
                    <span style="font-size:11px;color:var(--text2)">Discover</span>
                </button>
                <button class="quick-link-btn" onclick="openGames()">
                    <span style="font-size:30px">🎮</span>
                    <span style="font-size:11px;color:var(--text2)">Games</span>
                </button>
            </div>
        </div>
        
        <!-- Leaderboard -->
        <div class="card">
            <h3 style="color:var(--gold);margin-bottom:15px">🏆 Top Players</h3>
            ${leaderboardHTML}
        </div>
    `;
}

console.log('✅ App module loaded');
