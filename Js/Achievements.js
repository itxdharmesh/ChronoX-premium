// ==================== ACHIEVEMENT SYSTEM ====================

const ALL_ACHIEVEMENTS = [
    { id: 'first_msg', name: 'First Words', desc: 'Send your first message', icon: '💬', points: 10, type: 'messages', req: 1 },
    { id: 'chatty_10', name: 'Chatty', desc: 'Send 10 messages (5+ words)', icon: '💭', points: 25, type: 'messages', req: 10 },
    { id: 'social_50', name: 'Social Butterfly', desc: 'Send 50 messages (5+ words)', icon: '🦋', points: 50, type: 'messages', req: 50 },
    { id: 'first_follow', name: 'Making Friends', desc: 'Follow someone', icon: '🤝', points: 15, type: 'following', req: 1 },
    { id: 'popular_10', name: 'Rising Star', desc: 'Get 10 followers', icon: '⭐', points: 50, type: 'followers', req: 10 },
    { id: 'streak_3', name: 'Consistent', desc: '3-day streak', icon: '🔥', points: 30, type: 'streak', req: 3 },
    { id: 'streak_7', name: 'Dedicated', desc: '7-day streak', icon: '💪', points: 75, type: 'streak', req: 7 },
    { id: 'streak_30', name: 'Unstoppable', desc: '30-day streak', icon: '🚀', points: 300, type: 'streak', req: 30 },
    { id: 'profile_pic', name: 'Looking Good', desc: 'Upload a profile picture', icon: '📸', points: 20, type: 'avatar', req: 1 },
    { id: 'bio_writer', name: 'Storyteller', desc: 'Write a bio', icon: '✍️', points: 15, type: 'bio', req: 1 },
    { id: 'gamer_1', name: 'Game On', desc: 'Play your first game', icon: '🎮', points: 20, type: 'games', req: 1 },
    { id: 'quiz_master', name: 'Quiz Master', desc: 'Score 7+ in a quiz', icon: '❓', points: 40, type: 'quiz', req: 7 }
];

// Check achievements
async function checkAchievements() {
    if (!currentUser) return;
    
    const doc = await db.collection('users').doc(currentUser.uid).get();
    const userData = doc.data();
    const earned = userData.achievements || [];
    const newAchievements = [];
    
    for (const ach of ALL_ACHIEVEMENTS) {
        if (earned.includes(ach.id)) continue;
        
        let earnedFlag = false;
        
        const totalMsgs = userData.stats?.totalMessages || 0;
        const followingCount = (userData.following || []).length;
        const followersCount = (userData.followers || []).length;
        const streak = userData.streak || 0;
        const avatar = userData.avatar;
        const bio = userData.bio;
        const gamesPlayed = userData.stats?.gamesPlayed || 0;
        
        switch (ach.type) {
            case 'messages': if (totalMsgs >= ach.req) earnedFlag = true; break;
            case 'following': if (followingCount >= ach.req) earnedFlag = true; break;
            case 'followers': if (followersCount >= ach.req) earnedFlag = true; break;
            case 'streak': if (streak >= ach.req) earnedFlag = true; break;
            case 'avatar': if (avatar && avatar.length > 0) earnedFlag = true; break;
            case 'bio': if (bio && bio.length > 0) earnedFlag = true; break;
            case 'games': if (gamesPlayed >= ach.req) earnedFlag = true; break;
            case 'quiz': {
                const scores = userData.quizScores || [];
                if (scores.some(s => s >= ach.req)) earnedFlag = true;
                break;
            }
        }
        
        if (earnedFlag) {
            newAchievements.push(ach);
            earned.push(ach.id);
        }
    }
    
    if (newAchievements.length > 0) {
        const totalPoints = newAchievements.reduce((sum, a) => sum + a.points, 0);
        const currentProgress = userData.level?.progress || 0;
        const newProgress = currentProgress + totalPoints;
        const newLevel = Math.floor(newProgress / 100) + 1;
        
        const titles = ['Explorer', 'Adventurer', 'Traveler', 'Voyager', 'Pioneer', 'Elite', 'Master', 'Legend', 'Mythic', 'Eternal'];
        const titleIndex = Math.min(newLevel - 1, titles.length - 1);
        
        await db.collection('users').doc(currentUser.uid).update({
            achievements: earned,
            'stats.achievements': earned.length,
            'level.progress': newProgress,
            'level.current': newLevel,
            'level.title': titles[titleIndex]
        });
        
        currentUserData = { ...userData, achievements: earned, level: { current: newLevel, title: titles[titleIndex], progress: newProgress } };
        
        newAchievements.forEach(ach => {
            showToast(`🏆 Achievement Unlocked: ${ach.name}! (+${ach.points}pts)`);
        });
    }
}

// Show achievements modal
function showAchievements() {
    openModal('genericModal');
    const earned = currentUserData?.achievements || [];
    
    document.getElementById('genericModalContent').innerHTML = `
        <div class="modal-header">
            <h2>🏆 Achievements</h2>
            <button onclick="closeModal('genericModal')">✕</button>
        </div>
        <div style="margin-bottom:10px;color:var(--text2)">
            Unlocked: ${earned.length} / ${ALL_ACHIEVEMENTS.length}
        </div>
        ${ALL_ACHIEVEMENTS.map(a => {
            const unlocked = earned.includes(a.id);
            return `
                <div class="achievement-card ${unlocked ? '' : 'locked'}">
                    <span class="achievement-icon">${a.icon}</span>
                    <div class="achievement-info">
                        <div class="achievement-name">${a.name}</div>
                        <div class="achievement-desc">${a.desc}</div>
                    </div>
                    <span class="achievement-pts">${unlocked ? '✅ +' + a.points : '🔒 ' + a.points + 'pts'}</span>
                </div>
            `;
        }).join('')}
    `;
}

// Reset achievements
function resetAllAchievements() {
    if (!confirm('Are you sure? This will reset ALL your achievements and level.')) return;
    
    db.collection('users').doc(currentUser.uid).update({
        achievements: [],
        'stats.achievements': 0,
        'level.progress': 0,
        'level.current': 1,
        'level.title': 'Explorer'
    });
    
    currentUserData.achievements = [];
    currentUserData.stats.achievements = 0;
    currentUserData.level = { current: 1, title: 'Explorer', progress: 0 };
    
    showToast('Achievements reset!');
}

console.log('✅ Achievements module loaded');
