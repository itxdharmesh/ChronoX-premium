// js/games/games-main.js - FULL MASTER BUILD

// 1. SYSTEM INITIALIZATION & UI RENDER
function openChronoxGamesHub() {
    if (!navigator.onLine) { renderOfflineUI(); return; }

    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div id="gamesHubWrapper" style="padding: 20px; background: #03020a; min-height: 100vh; font-family: 'Poppins', sans-serif; color: #ffffff;">
            <h1 style="text-align: center; color: #D4AF37; margin-bottom: 25px;">🎮 CHRONOX GAMES HUB</h1>
            <div id="mainHubContent" style="max-width: 800px; margin: auto;">
                <button onclick="renderMultiplayerSelector()" style="width: 100%; padding: 20px; background: #8B5CF6; border: none; border-radius: 12px; color: white; font-weight: 800; margin-bottom: 20px; cursor: pointer;">🌐 MULTIPLAYER ARENA</button>
                <div id="arcadeGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                    ${generateArcadeCards()}
                </div>
            </div>
        </div>
    `;
}

// 2. ARCADE GAME DATABASE
const ARCADE_GAMES = [
    { id: 'spaceshooter', name: 'Space Shooter', icon: '🚀' },
    { id: 'cyberninja', name: 'Cyber Ninja', icon: '🥷' },
    { id: 'neondrift', name: 'Neon Drift', icon: '🏎️' },
    { id: 'brickbreaker', name: 'Brick Breaker', icon: '🧱' },
    { id: 'pong', name: 'Pong', icon: '🏓' },
    { id: 'flappy', name: 'Flappy Bird', icon: '🐦' },
    { id: 'tictactoe', name: 'Tic Tac Toe', icon: '❌' },
    { id: 'memorymatch', name: 'Memory Match', icon: '🧠' },
    { id: 'reactionmaster', name: 'Reaction Master', icon: '⚡' },
    { id: 'aimtrainer', name: 'Aim Trainer', icon: '🎯' }
];

function generateArcadeCards() {
    return ARCADE_GAMES.map(g => `
        <button onclick="safeStart('${g.id}')" style="padding: 15px; background: #1a1a1a; border: 1px solid #333; color: white; border-radius: 10px; cursor: pointer; text-align: left;">
            <span style="font-size: 20px;">${g.icon}</span> ${g.name}
        </button>
    `).join('');
}

// 3. MULTIPLAYER SELECTOR
function renderMultiplayerSelector() {
    document.getElementById('mainHubContent').innerHTML = `
        <div style="background: #0f0a2a; padding: 25px; border-radius: 16px; border: 1px solid #333;">
            <h2 style="color: #D4AF37;">MULTIPLAYER ARENA</h2>
            <div style="display: grid; gap: 10px;">
                <button onclick="createMultiplayerRoom('chess')" style="padding: 15px; background: #222; border: none; color: white; border-radius: 8px;">👑 Chess</button>
                <button onclick="createMultiplayerRoom('ludo')" style="padding: 15px; background: #222; border: none; color: #00f5d4; border-radius: 8px;">🎲 Ludo</button>
                <button onclick="createMultiplayerRoom('uno')" style="padding: 15px; background: #222; border: none; color: #ff006e; border-radius: 8px;">🃏 Uno</button>
            </div>
            <button onclick="openChronoxGamesHub()" style="width: 100%; margin-top: 20px; background: transparent; color: #666; border: none;">← Back</button>
        </div>
    `;
}

// 4. REWARD & NOTIFICATION ENGINE
function rewardChronoxXP(result, gameId) {
    let xp = (result === 'win') ? 25 : 10;
    
    // Notification
    if (typeof showToast === 'function') {
        showToast(`⚡ XP GAINED: +${xp} XP [${gameId.toUpperCase()}]`);
    }

    // Firestore Sync
    if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid)
            .update({ xp: firebase.firestore.FieldValue.increment(xp) });
    }
}

// 5. SAFE START & HOOKS
function safeStart(name) {
    interceptAndHookGameOver(name);
    if(name === 'spaceshooter') startSpaceShooter();
    else if(name === 'cyberninja') startCyberNinja();
    // ... baaki games ke starts yahan add kar le
}

function interceptAndHookGameOver(gameId) {
    if (typeof window.endGame !== 'undefined' && !window.endGame.hooked) {
        let original = window.endGame;
        window.endGame = function(winner) {
            rewardChronoxXP((winner === 'human' || winner === true) ? 'win' : 'lose', gameId);
            original.apply(this, arguments);
        };
        window.endGame.hooked = true;
    }
}

// 6. OFFLINE UI
function renderOfflineUI() {
    document.getElementById('contentArea').innerHTML = `
        <div style="padding: 50px; text-align: center; color: white;">
            <h2>🚫 SYSTEM OFFLINE</h2>
            <button onclick="location.reload()" style="padding: 10px 20px; background: #D4AF37; border:none;">RETRY</button>
        </div>
    `;
}
