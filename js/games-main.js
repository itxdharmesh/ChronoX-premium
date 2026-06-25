import { currentUser } from './auth.js';
import { db } from './config.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from './utils.js';

const GAMES = [
    { name: 'Chess', icon: '♟️', xp: 50, coins: 20, func: 'startChess' },
    { name: 'Ludo', icon: '🎲', xp: 30, coins: 10, func: 'startLudo' },
    { name: 'UNO', icon: '🃏', xp: 25, coins: 15, func: 'startUno' },
    { name: 'Tic Tac Toe', icon: '⭕', xp: 15, coins: 5, func: 'startTicTacToe' },
    { name: 'Pong', icon: '🏓', xp: 35, coins: 15, func: 'startPong' },
    { name: 'Flappy Bird', icon: '🐦', xp: 40, coins: 25, func: 'startFlappy' },
    { name: 'Neon Drift', icon: '🏎️', xp: 60, coins: 30, func: 'startNeonDrift' },
    { name: 'Cyber Ninja', icon: '🥷', xp: 70, coins: 35, func: 'startCyberNinja' },
    { name: 'Aim Trainer', icon: '🎯', xp: 35, coins: 20, func: 'startAimTrainer' },
    { name: 'Brick Breaker', icon: '🧱', xp: 45, coins: 25, func: 'startBrickBreaker' },
    { name: 'Space Shooter', icon: '🚀', xp: 70, coins: 40, func: 'startSpaceShooter' },
    { name: 'Memory Match', icon: '🧠', xp: 30, coins: 15, func: 'startMemoryMatch' },
    { name: 'Reaction Master', icon: '⚡', xp: 45, coins: 25, func: 'startReactionMaster' }
];

function renderGamesHub() {
    const gamesGrid = document.getElementById('gamesGrid');
    const gameContainer = document.getElementById('gameContainer');
    const contentArea = document.getElementById('contentArea');
    
    // Hide game container, show grid
    if (gameContainer) gameContainer.style.display = 'none';
    if (gamesGrid) gamesGrid.style.display = 'grid';
    
    // Clear content area if exists
    if (contentArea) contentArea.innerHTML = '';
    
    gamesGrid.innerHTML = GAMES.map(game => `
        <div class="glass-panel game-card" onclick="window.launchGame('${game.func}', '${game.name}', ${game.xp}, ${game.coins})">
            <div style="font-size:3rem;">${game.icon}</div>
            <h3 style="margin:0.5rem 0;">${game.name}</h3>
            <div style="display:flex;justify-content:center;gap:1rem;font-size:0.8rem;">
                <span>+${game.xp} XP</span>
                <span>+${game.coins} 🪙</span>
            </div>
        </div>
    `).join('');
}

function launchGame(gameFunc, gameName, xpReward, coinReward) {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) {
        showToast('Please login first', 'error');
        return;
    }
    
    // Hide games grid
    const gamesGrid = document.getElementById('gamesGrid');
    if (gamesGrid) gamesGrid.style.display = 'none';
    
    // Show game container
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) gameContainer.style.display = 'block';
    
    // Create content area for game
    const gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas) {
        gameCanvas.innerHTML = '<div id="contentArea" style="width:100%;min-height:500px;height:calc(100vh - 150px);"></div>';
    }
    
    // Store current game info for rewards
    window.currentGame = {
        name: gameName,
        xp: xpReward,
        coins: coinReward
    };
    
    // Call game function if it exists
    if (typeof window[gameFunc] === 'function') {
        try {
            window[gameFunc]();
        } catch (error) {
            console.error(`Error launching ${gameName}:`, error);
            showToast('Error loading game', 'error');
        }
    } else {
        // Fallback if function not found
        const contentArea = document.getElementById('contentArea');
        if (contentArea) {
            contentArea.innerHTML = `
                <div style="text-align:center;padding:3rem;">
                    <h3 style="color:var(--neon-blue);">🎮 ${gameName}</h3>
                    <p style="margin:1rem 0;">Game module loading...</p>
                    <button class="btn-glow" onclick="window.completeGame('${gameName}',${xpReward},${coinReward})">
                        Complete Game (+${xpReward} XP)
                    </button>
                </div>
            `;
        }
    }
}

async function completeGame(gameName, xpReward, coinReward) {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) return;
    
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const newXP = (userData.xp || 0) + xpReward;
            const newCoins = (userData.coins || 0) + coinReward;
            const newLevel = Math.floor(newXP / 100) + 1;
            
            await updateDoc(userRef, {
                xp: newXP,
                coins: newCoins,
                level: newLevel
            });
            
            showToast(`🏆 Completed ${gameName}! +${xpReward} XP +${coinReward} Coins`, 'success');
        }
    } catch (error) {
        console.error('Error saving game progress:', error);
    }
    
    closeGame();
}

function closeGame() {
    // Cancel any running game
    if (typeof window.atCancelRef === 'function') window.atCancelRef();
    if (typeof window.cancelGame === 'function') window.cancelGame();
    
    const gameContainer = document.getElementById('gameContainer');
    const gamesGrid = document.getElementById('gamesGrid');
    const gameCanvas = document.getElementById('gameCanvas');
    
    if (gameCanvas) gameCanvas.innerHTML = '';
    if (gameContainer) gameContainer.style.display = 'none';
    if (gamesGrid) gamesGrid.style.display = 'grid';
}

// Override openGames if your games use it
window.openGames = function() {
    closeGame();
};

// Expose globally
window.renderGamesHub = renderGamesHub;
window.launchGame = launchGame;
window.completeGame = completeGame;
window.closeGame = closeGame;

export { renderGamesHub, launchGame };
