import { currentUser } from './auth.js';
import { db } from './config.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from './utils.js';

const GAMES = [
    { name: 'Chess', icon: '♟️', xp: 50, coins: 20, file: 'chess' },
    { name: 'Ludo', icon: '🎲', xp: 30, coins: 10, file: 'ludo' },
    { name: 'UNO', icon: '🃏', xp: 25, coins: 15, file: 'uno' },
    { name: 'Tic Tac Toe', icon: '⭕', xp: 15, coins: 5, file: 'tictactoe' },
    { name: 'Pong', icon: '🏓', xp: 35, coins: 15, file: 'pong' },
    { name: 'Flappy Bird', icon: '🐦', xp: 40, coins: 25, file: 'flappy' },
    { name: 'Neon Drift', icon: '🏎️', xp: 60, coins: 30, file: 'neondrift' },
    { name: 'Cyber Ninja', icon: '🥷', xp: 70, coins: 35, file: 'cyberninja' },
    { name: 'Aim Trainer', icon: '🎯', xp: 35, coins: 20, file: 'aimtrainer' },
    { name: 'Brick Breaker', icon: '🧱', xp: 45, coins: 25, file: 'brickbreaker' },
    { name: 'Space Shooter', icon: '🚀', xp: 70, coins: 40, file: 'spaceshooter' },
    { name: 'Memory Match', icon: '🧠', xp: 30, coins: 15, file: 'memorymatch' },
    { name: 'Reaction Master', icon: '⚡', xp: 45, coins: 25, file: 'reactionmaster' }
];

function renderGamesHub() {
    const gamesGrid = document.getElementById('gamesGrid');
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) gameContainer.style.display = 'none';
    if (gamesGrid) gamesGrid.style.display = 'grid';
    gamesGrid.innerHTML = GAMES.map(game => `
        <div class="glass-panel game-card" onclick="window.launchGame('${game.file}', '${game.name}', ${game.xp}, ${game.coins})">
            <div style="font-size:3rem;">${game.icon}</div>
            <h3 style="margin:0.5rem 0;">${game.name}</h3>
            <div style="display:flex;justify-content:center;gap:1rem;font-size:0.8rem;"><span>+${game.xp} XP</span><span>+${game.coins} 🪙</span></div>
        </div>`).join('');
}

async function launchGame(gameFile, gameName, xpReward, coinReward) {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) { showToast('Please login first', 'error'); return; }
    const gamesGrid = document.getElementById('gamesGrid');
    const gameContainer = document.getElementById('gameContainer');
    const gameCanvas = document.getElementById('gameCanvas');
    gamesGrid.style.display = 'none';
    gameContainer.style.display = 'block';
    gameCanvas.innerHTML = '';
    const gameElement = document.createElement('div');
    gameElement.id = `game-${gameFile}`;
    gameElement.style.width = '100%';
    gameElement.style.minHeight = '400px';
    try {
        const initFunctionName = `init_${gameFile}`;
        if (typeof window[initFunctionName] === 'function') {
            window[initFunctionName](gameElement);
            gameCanvas.appendChild(gameElement);
        } else {
            gameCanvas.innerHTML = `<div style="text-align:center;padding:2rem;"><h3>🎮 ${gameName}</h3><p>Game loading...</p><button class="btn-glow" onclick="window.completeGame('${gameName}',${xpReward},${coinReward})" style="margin-top:1rem;">Complete (+${xpReward} XP)</button></div>`;
        }
    } catch (error) {
        gameCanvas.innerHTML = `<div style="text-align:center;padding:2rem;"><h3>🎮 ${gameName}</h3><p>Game initializing...</p><button class="btn-glow" onclick="window.completeGame('${gameName}',${xpReward},${coinReward})" style="margin-top:1rem;">Complete (+${xpReward} XP)</button></div>`;
    }
}

async function completeGame(gameName, xpReward, coinReward) {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
        const userData = userDoc.data();
        await updateDoc(userRef, { xp: (userData.xp||0)+xpReward, coins: (userData.coins||0)+coinReward, level: Math.floor(((userData.xp||0)+xpReward)/100)+1 });
        showToast(`🏆 ${gameName}! +${xpReward} XP +${coinReward} Coins`, 'success');
    }
    closeGame();
}

function closeGame() {
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('gamesGrid').style.display = 'grid';
}

window.renderGamesHub = renderGamesHub;
window.launchGame = launchGame;
window.completeGame = completeGame;
window.closeGame = closeGame;
export { renderGamesHub, launchGame };
