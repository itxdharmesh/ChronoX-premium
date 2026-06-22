// ==================== ACHIEVEMENTS & XP ====================

var ALL_ACHIEVEMENTS = [
    { id: 'first_msg', name: 'First Words', desc: 'Send your first message', icon: '💬', xp: 10 },
    { id: 'chatty_10', name: 'Chatty', desc: 'Send 10 messages', icon: '💭', xp: 25 },
    { id: 'social_50', name: 'Social', desc: 'Send 50 messages', icon: '🦋', xp: 50 },
    { id: 'first_follow', name: 'Making Friends', desc: 'Follow someone', icon: '🤝', xp: 15 },
    { id: 'popular_10', name: 'Rising Star', desc: 'Get 10 followers', icon: '⭐', xp: 50 },
    { id: 'streak_3', name: 'Consistent', desc: '3-day streak', icon: '🔥', xp: 30 },
    { id: 'streak_7', name: 'Dedicated', desc: '7-day streak', icon: '💪', xp: 75 },
    { id: 'gamer_1', name: 'Game On', desc: 'Play 1 game', icon: '🎮', xp: 20 },
    { id: 'gamer_10', name: 'Pro Gamer', desc: 'Play 10 games', icon: '🏆', xp: 100 },
    { id: 'profile_pic', name: 'Looking Good', desc: 'Upload avatar', icon: '📸', xp: 20 },
    { id: 'bio_writer', name: 'Storyteller', desc: 'Write a bio', icon: '✍️', xp: 15 },
    { id: 'quiz_master', name: 'Quiz Master', desc: 'Score 7+ in quiz', icon: '❓', xp: 40 }
];

function addXP(amount) {
    if (!currentUser) return;
    var ref = db.collection('users').doc(currentUser.uid);
    ref.get().then(function(doc) {
        var d = doc.data();
        var newXP = (d.xp || 0) + amount;
        var newProgress = (d.level?.progress || 0) + amount;
        var newLevel = Math.floor(newProgress / 100) + 1;
        var titles = ['Explorer','Adventurer','Traveler','Voyager','Pioneer','Elite','Master','Legend','Mythic','Eternal'];
        var titleIndex = Math.min(newLevel - 1, titles.length - 1);
        
        ref.update({
            xp: newXP,
            'level.progress': newProgress,
            'level.current': newLevel,
            'level.title': titles[titleIndex]
        });
        
        currentUserData.xp = newXP;
        currentUserData.level = { current: newLevel, title: titles[titleIndex], progress: newProgress };
        
        showToast('+' + amount + ' XP ⚡');
        checkAchievements();
    });
}

function checkAchievements() {
    if (!currentUser) return;
    var ref = db.collection('users').doc(currentUser.uid);
    ref.get().then(function(doc) {
        var d = doc.data();
        var earned = d.achievements || [];
        var newAch = [];
        
        ALL_ACHIEVEMENTS.forEach(function(ach) {
            if (earned.indexOf(ach.id) !== -1) return;
            var earnedFlag = false;
            
            if (ach.id === 'first_msg' && (d.stats?.totalMessages || 0) >= 1) earnedFlag = true;
            if (ach.id === 'chatty_10' && (d.stats?.totalMessages || 0) >= 10) earnedFlag = true;
            if (ach.id === 'social_50' && (d.stats?.totalMessages || 0) >= 50) earnedFlag = true;
            if (ach.id === 'first_follow' && (d.following || []).length >= 1) earnedFlag = true;
            if (ach.id === 'popular_10' && (d.followers || []).length >= 10) earnedFlag = true;
            if (ach.id === 'streak_3' && (d.streak || 0) >= 3) earnedFlag = true;
            if (ach.id === 'streak_7' && (d.streak || 0) >= 7) earnedFlag = true;
            if (ach.id === 'gamer_1' && (d.stats?.gamesPlayed || 0) >= 1) earnedFlag = true;
            if (ach.id === 'gamer_10' && (d.stats?.gamesPlayed || 0) >= 10) earnedFlag = true;
            if (ach.id === 'profile_pic' && d.avatar && d.avatar.length > 10) earnedFlag = true;
            if (ach.id === 'bio_writer' && d.bio && d.bio.length > 0) earnedFlag = true;
            if (ach.id === 'quiz_master' && (d.quizScores || []).some(function(s) { return s >= 7; })) earnedFlag = true;
            
            if (earnedFlag) {
                newAch.push(ach);
                earned.push(ach.id);
            }
        });
        
        if (newAch.length > 0) {
            ref.update({ achievements: earned, 'stats.achievements': earned.length });
            currentUserData.achievements = earned;
            currentUserData.stats.achievements = earned.length;
            newAch.forEach(function(a) {
                showToast('🏆 ' + a.name + '! (+' + a.xp + ' XP)');
                addXP(a.xp);
            });
        }
    });
}

function showAchievements() {
    openModal('genericModal');
    var earned = currentUserData.achievements || [];
    var h = '<h2 style="color:var(--gold);margin-bottom:15px">🏆 Achievements</h2>';
    h += '<p style="color:var(--text2);margin-bottom:10px">Unlocked: ' + earned.length + '/' + ALL_ACHIEVEMENTS.length + '</p>';
    
    ALL_ACHIEVEMENTS.forEach(function(a) {
        var unlocked = earned.indexOf(a.id) !== -1;
        h += '<div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(255,255,255,0.03);border-radius:10px;margin-bottom:6px;opacity:' + (unlocked ? '1' : '0.4') + ';filter:grayscale(' + (unlocked ? '0' : '1') + ')">' +
            '<span style="font-size:28px">' + a.icon + '</span>' +
            '<div style="flex:1"><b>' + a.name + '</b><br><small style="color:rgba(255,255,255,0.5)">' + a.desc + '</small></div>' +
            '<b style="color:var(--gold)">' + (unlocked ? '✅' : '🔒') + ' +' + a.xp + 'XP</b>' +
            '</div>';
    });
    
    h += '<button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button>';
    document.getElementById('genericContent').innerHTML = h;
}

console.log('✅ Achievements loaded');
