// --- ULTRA GOD LEVEL GAMES HUB ---
function openGames() {
    const c = document.getElementById('contentArea');
    c.innerHTML = `
    <style>
        .glow-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 25px;
            text-align: center;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        .glow-card:hover {
            transform: translateY(-10px) scale(1.02);
            border-color: #D4AF37;
            box-shadow: 0 0 30px rgba(212, 175, 55, 0.2);
        }
    </style>
    <div style="padding:20px; font-family:'Poppins', sans-serif; color:white;">
        <h1 style="color:#D4AF37; font-size:32px; margin-bottom:25px; text-shadow:0 0 20px #D4AF37;">🎮 ChronoX Arena</h1>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
            ${createGame("🚀", "Shooter", "#00d4ff", "startSpaceshooter")}
            ${createGame("🏎️", "Drift", "#ff9f43", "startNeondrift")}
            ${createGame("🥷", "Ninja", "#8b5cf6", "startCyberninja")}
            ${createGame("♟️", "Chess", "#D4AF37", "startChess")}
            ${createGame("🎲", "Ludo", "#2ED573", "startLudo")}
            ${createGame("🎯", "Aim", "#FF4757", "startAimtrainer")}
        </div>
    </div>`;
}

function createGame(icon, title, color, func) {
    return `
    <div class="glow-card" onclick="${func}()">
        <div style="font-size:40px; filter:drop-shadow(0 0 10px ${color});">${icon}</div>
        <div style="margin-top:12px; font-weight:800; letter-spacing:1px;">${title}</div>
    </div>`;
}

// Global XP Engine
function rewardChronoxXP(result, gameId) {
    if (!currentUser) return;
    // XP Calculation
    const xp = (result === 'win') ? 50 : 20; 
    
    // Firebase Update
    db.collection('users').doc(currentUser.uid).update({
        xp: firebase.firestore.FieldValue.increment(xp)
    }).then(() => {
        currentUserData.xp += xp;
        // Premium Toast Notification
        showToast(`⚡ LEGENDARY! +${xp} XP Added`, 'success');
    });
}
