function renderDashboard(c) {
    var u = currentUserData || {};
    var name = (u.name && u.name !== 'undefined') ? u.name : 'User';
    var username = u.username || '@user';
    var avatar = u.avatar || defaultAvatar(name);
    var coins = u.coins || 0;
    var xp = u.xp || 0;
    var streak = u.streak || 0;
    var level = (u.level && u.level.current) ? u.level.current : 1;
    var title = (u.level && u.level.title) ? u.level.title : 'Explorer';
    var achievements = (u.stats && u.stats.achievements) ? u.stats.achievements : 0;
    var followers = (u.followers || []).length;
    var following = (u.following || []).length;

    var html = '';
    
    // 1. USER CARD
    html += '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(212,175,55,0.15),rgba(0,212,255,0.08));border:1px solid rgba(212,175,55,0.2)">';
    html += '<img src="' + avatar + '" style="width:70px;height:70px;border-radius:50%;border:3px solid #D4AF37;object-fit:cover;background:#1a1f4e;margin-bottom:10px" onerror="this.src=\'' + defaultAvatar(name) + '\'">';
    html += '<h2 style="color:#fff;font-size:20px;margin:5px 0">' + name + '</h2>';
    html += '<p style="color:#D4AF37;font-size:13px">' + username + '</p>';
    html += '</div>';
    
    // 2. STATS GRID
    html += '<div class="card"><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;text-align:center">';
    html += '<div style="background:rgba(212,175,55,0.08);padding:14px;border-radius:12px;border:1px solid rgba(212,175,55,0.15)"><div style="font-size:24px">💰</div><div style="font-size:18px;font-weight:700;color:#D4AF37">' + coins + '</div><div style="font-size:10px;color:rgba(255,255,255,0.5)">Coins</div></div>';
    html += '<div style="background:rgba(0,212,255,0.08);padding:14px;border-radius:12px;border:1px solid rgba(0,212,255,0.15)"><div style="font-size:24px">⚡</div><div style="font-size:18px;font-weight:700;color:#00D4FF">' + xp + '</div><div style="font-size:10px;color:rgba(255,255,255,0.5)">XP</div></div>';
    html += '<div style="background:rgba(46,213,115,0.08);padding:14px;border-radius:12px;border:1px solid rgba(46,213,115,0.15)"><div style="font-size:24px">🆙</div><div style="font-size:18px;font-weight:700;color:#2ED573">Lv.' + level + '</div><div style="font-size:10px;color:rgba(255,255,255,0.5)">' + title + '</div></div>';
    html += '<div style="background:rgba(255,165,2,0.08);padding:14px;border-radius:12px;border:1px solid rgba(255,165,2,0.15)"><div style="font-size:24px">🏆</div><div style="font-size:18px;font-weight:700;color:#FFA502">' + achievements + '</div><div style="font-size:10px;color:rgba(255,255,255,0.5)">Badges</div></div>';
    html += '</div></div>';
    
    // 3. STREAK + FOLLOW
    html += '<div class="card" style="display:flex;justify-content:space-around;text-align:center">';
    html += '<div><div style="font-size:28px">🔥</div><div style="font-size:16px;font-weight:700;color:#D4AF37">' + streak + ' Days</div><div style="font-size:10px;color:rgba(255,255,255,0.5)">Streak</div></div>';
    html += '<div onclick="showFollowList(\'followers\')" style="cursor:pointer"><div style="font-size:16px;font-weight:700;color:#fff">' + followers + '</div><div style="font-size:10px;color:rgba(255,255,255,0.5)">Followers</div></div>';
    html += '<div onclick="showFollowList(\'following\')" style="cursor:pointer"><div style="font-size:16px;font-weight:700;color:#fff">' + following + '</div><div style="font-size:10px;color:rgba(255,255,255,0.5)">Following</div></div>';
    html += '</div>';
    
    // 4. DAILY REWARD
    var today = new Date().toDateString();
    var lastReward = u.lastDailyReward ? new Date(u.lastDailyReward).toDateString() : '';
    var canClaim = today !== lastReward;
    html += '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(212,175,55,0.1),rgba(0,212,255,0.05));border:1px solid rgba(212,175,55,0.2)">';
    html += '<h3 style="color:#D4AF37;font-size:14px;margin-bottom:8px">🎁 Daily Reward</h3>';
    html += '<div style="font-size:30px;margin:8px 0">💰 <b style="color:#D4AF37">20</b></div>';
    if (canClaim) {
        html += '<button class="btn" onclick="claimDailyReward()" style="width:auto;padding:10px 30px;margin:5px auto">Claim Reward 🎁</button>';
    } else {
        html += '<p style="color:#2ED573;font-size:12px">✅ Claimed! Come back tomorrow</p>';
    }
    html += '</div>';
    
    // 5. QUICK ACTIONS
    html += '<div class="card">';
    html += '<h3 style="color:#D4AF37;font-size:13px;margin-bottom:10px">Quick Actions</h3>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
    html += '<button onclick="navigate(\'chats\')" style="padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;cursor:pointer;font-size:11px"><div style="font-size:22px">💬</div>Chats</button>';
    html += '<button onclick="navigate(\'games\')" style="padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;cursor:pointer;font-size:11px"><div style="font-size:22px">🎮</div>Games</button>';
    html += '<button onclick="navigate(\'search\')" style="padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;cursor:pointer;font-size:11px"><div style="font-size:22px">🔍</div>Discover</button>';
    html += '<button onclick="openShop()" style="padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;cursor:pointer;font-size:11px"><div style="font-size:22px">🛍️</div>Shop</button>';
    html += '<button onclick="navigate(\'profile\')" style="padding:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;cursor:pointer;font-size:11px"><div style="font-size:22px">👤</div>Profile</button>';
    html += '<button onclick="logout()" style="padding:12px;background:rgba(255,71,87,0.1);border:1px solid rgba(255,71,87,0.2);border-radius:10px;color:#FF4757;cursor:pointer;font-size:11px"><div style="font-size:22px">🚪</div>Logout</button>';
    html += '</div></div>';
    
    c.innerHTML = html;
}

function claimDailyReward() {
    if (!currentUserData) return;
    var today = new Date().toDateString();
    var last = currentUserData.lastDailyReward ? new Date(currentUserData.lastDailyReward).toDateString() : '';
    if (today === last) { showToast('Already claimed!', 'error'); return; }
    
    var reward = 20;
    db.collection('users').doc(currentUser.uid).update({
        coins: firebase.firestore.FieldValue.increment(reward),
        lastDailyReward: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function() {
        currentUserData.coins = (currentUserData.coins || 0) + reward;
        currentUserData.lastDailyReward = new Date().toISOString();
        showToast('🎁 +' + reward + ' coins!');
        navigate('home');
    });
      }
