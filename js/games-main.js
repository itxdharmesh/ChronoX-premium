import { db } from './config.js';
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from './utils.js';

const GAMES = [
    { name: 'Chess', icon: '♟️', xp: 50, coins: 20, func: 'startChess', category: 'Board', trending: true },
    { name: 'Ludo', icon: '🎲', xp: 30, coins: 10, func: 'startLudo', category: 'Board', trending: false },
    { name: 'UNO', icon: '🃏', xp: 25, coins: 15, func: 'startUno', category: 'Cards', trending: true },
    { name: 'Tic Tac Toe', icon: '⭕', xp: 15, coins: 5, func: 'startTicTacToe', category: 'Strategy', trending: false },
    { name: 'Pong', icon: '🏓', xp: 35, coins: 15, func: 'startPong', category: 'Arcade', trending: true },
    { name: 'Flappy Bird', icon: '🐦', xp: 40, coins: 25, func: 'startFlappy', category: 'Arcade', trending: true },
    { name: 'Neon Drift', icon: '🏎️', xp: 60, coins: 30, func: 'startNeonDrift', category: 'Racing', trending: true },
    { name: 'Cyber Ninja', icon: '🥷', xp: 70, coins: 35, func: 'startCyberNinja', category: 'Action', trending: false },
    { name: 'Aim Trainer', icon: '🎯', xp: 35, coins: 20, func: 'startAimTrainer', category: 'Action', trending: true },
    { name: 'Brick Breaker', icon: '🧱', xp: 45, coins: 25, func: 'startBrickBreaker', category: 'Arcade', trending: false },
    { name: 'Space Shooter', icon: '🚀', xp: 70, coins: 40, func: 'startSpaceShooter', category: 'Action', trending: true },
    { name: 'Memory Match', icon: '🧠', xp: 30, coins: 15, func: 'startMemoryMatch', category: 'Puzzle', trending: false },
    { name: 'Reaction Master', icon: '⚡', xp: 45, coins: 25, func: 'startReactionMaster', category: 'Sports', trending: true }
];

let recentGames = [];
let favoriteGames = new Set();

function renderGamesHub() {
    const gamesGrid = document.getElementById('gamesGrid');
    const gameContainer = document.getElementById('gameContainer');
    
    if (gameContainer) gameContainer.style.display = 'none';
    if (!gamesGrid) return;
    
    gamesGrid.style.display = 'block';
    
    // Load recent games from localStorage
    recentGames = JSON.parse(localStorage.getItem('chronox_recent_games') || '[]');
    favoriteGames = new Set(JSON.parse(localStorage.getItem('chronox_fav_games') || '[]'));
    
    gamesGrid.innerHTML = `
        <!-- Search Bar -->
        <div class="input-group" style="grid-column:1/-1;margin-bottom:0.5rem;">
            <i class="fas fa-search input-icon"></i>
            <input type="text" id="gameSearchInput" placeholder="Search games..." class="auth-input" oninput="window.filterGames()">
        </div>
        
        <!-- Category Tabs -->
        <div class="category-tabs" style="grid-column:1/-1;display:flex;gap:0.5rem;overflow-x:auto;padding:0.5rem 0;margin-bottom:0.5rem;">
            ${['All','Action','Arcade','Puzzle','Sports','Strategy','Board','Cards','Racing'].map(cat => 
                `<button class="cat-tab ${cat==='All'?'cat-active':''}" onclick="window.filterByCategory('${cat}')">${cat}</button>`
            ).join('')}
        </div>
        
        <!-- Trending Section -->
        ${recentGames.length > 0 ? `
            <div style="grid-column:1/-1;margin:0.5rem 0;">
                <h4 style="color:var(--neon-blue);margin-bottom:0.5rem;">🕹️ Continue Playing</h4>
                <div style="display:flex;gap:0.8rem;overflow-x:auto;padding:0.3rem 0;" id="recentGamesRow">
                    ${recentGames.slice(0, 5).map(g => {
                        const game = GAMES.find(ga => ga.name === g);
                        return game ? `
                            <div class="glass-panel" style="min-width:120px;padding:0.8rem;text-align:center;cursor:pointer;" onclick="window.launchGame('${game.func}','${game.name}',${game.xp},${game.coins})">
                                <div style="font-size:2rem;">${game.icon}</div>
                                <p style="font-size:0.7rem;">${game.name}</p>
                            </div>
                        ` : '';
                    }).join('')}
                </div>
            </div>
        ` : ''}
        
        <!-- Game Grid -->
        <div style="grid-column:1/-1;display:grid;grid-template-columns:repeat(2,1fr);gap:0.8rem;" id="gamesCardGrid">
            ${GAMES.map(game => `
                <div class="glass-panel game-card" data-category="${game.category}" data-name="${game.name.toLowerCase()}" style="position:relative;">
                    ${game.trending ? '<span style="position:absolute;top:8px;right:8px;background:#ff4757;color:white;font-size:0.6rem;padding:2px 6px;border-radius:8px;">HOT</span>' : ''}
                    ${favoriteGames.has(game.name) ? '<span style="position:absolute;top:8px;left:8px;color:var(--gold);">⭐</span>' : ''}
                    <div style="font-size:3rem;">${game.icon}</div>
                    <h3 style="margin:0.5rem 0;font-size:0.9rem;">${game.name}</h3>
                    <div style="display:flex;justify-content:center;gap:0.8rem;font-size:0.7rem;margin-bottom:0.5rem;">
                        <span style="color:var(--neon-blue);">+${game.xp} XP</span>
                        <span style="color:var(--gold);">+${game.coins} 🪙</span>
                    </div>
                    <button class="btn-glow" style="width:100%;padding:0.5rem;font-size:0.75rem;" onclick="event.stopPropagation();window.launchGame('${game.func}','${game.name}',${game.xp},${game.coins})">
                        ▶ Play
                    </button>
                    <button style="position:absolute;bottom:8px;right:8px;background:none;border:none;color:${favoriteGames.has(game.name)?'var(--gold)':'#666'};cursor:pointer;font-size:0.8rem;" 
                        onclick="event.stopPropagation();window.toggleFavorite('${game.name}')">
                        ${favoriteGames.has(game.name) ? '⭐' : '☆'}
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function filterGames() {
    const searchTerm = document.getElementById('gameSearchInput')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('#gamesCardGrid .game-card');
    
    cards.forEach(card => {
        const name = card.dataset.name;
        if (name && name.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterByCategory(category) {
    // Update active tab
    document.querySelectorAll('.cat-tab').forEach(tab => {
        tab.classList.remove('cat-active');
    });
    event.target.classList.add('cat-active');
    
    const cards = document.querySelectorAll('#gamesCardGrid .game-card');
    
    cards.forEach(card => {
        if (category === 'All' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function toggleFavorite(gameName) {
    if (favoriteGames.has(gameName)) {
        favoriteGames.delete(gameName);
    } else {
        favoriteGames.add(gameName);
    }
    localStorage.setItem('chronox_fav_games', JSON.stringify([...favoriteGames]));
    renderGamesHub();
}

function launchGame(gameFunc, gameName, xpReward, coinReward) {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) { showToast('Please login first', 'error'); return; }
    
    // Save to recent games
    recentGames = [gameName, ...recentGames.filter(g => g !== gameName)].slice(0, 10);
    localStorage.setItem('chronox_recent_games', JSON.stringify(recentGames));
    
    const gamesGrid = document.getElementById('gamesGrid');
    const gameContainer = document.getElementById('gameContainer');
    const gameCanvas = document.getElementById('gameCanvas');
    
    if (gamesGrid) gamesGrid.style.display = 'none';
    if (gameContainer) gameContainer.style.display = 'block';
    if (gameCanvas) gameCanvas.innerHTML = '<div id="contentArea" style="width:100%;min-height:500px;height:calc(100vh - 150px);"></div>';
    
    window.currentGame = { name: gameName, xp: xpReward, coins: coinReward };
    
    if (typeof window[gameFunc] === 'function') {
        try { window[gameFunc](); } 
        catch (error) { console.error(`Error:`, error); showToast('Error loading game', 'error'); }
    } else {
        const contentArea = document.getElementById('contentArea');
        if (contentArea) {
            contentArea.innerHTML = `
                <div style="text-align:center;padding:3rem;">
                    <h3 style="color:var(--neon-blue);">🎮 ${gameName}</h3>
                    <p>Loading...</p>
                    <button class="btn-glow" onclick="window.completeGame('${gameName}',${xpReward},${coinReward})">
                        Complete (+${xpReward} XP)
                    </button>
                </div>`;
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
            const newGamesPlayed = (userData.dailyGamesPlayed || 0) + 1;
            
            // Level calculation with increasing XP requirements
            let newLevel = userData.level || 1;
            let xpCheck = newXP;
            const xpRequirements = {1:100,2:250,3:450,4:700,5:1000,6:1400,7:1900,8:2500,9:3200,10:4000};
            
            for (let lvl = 1; lvl <= 10; lvl++) {
                if (xpCheck >= (xpRequirements[lvl] || lvl*500)) {
                    newLevel = lvl + 1;
                    xpCheck -= (xpRequirements[lvl] || lvl*500);
                } else {
                    break;
                }
            }
            
            await updateDoc(userRef, {
                xp: newXP,
                coins: newCoins,
                level: newLevel,
                dailyGamesPlayed: newGamesPlayed
            });
            
            showToast(`🏆 ${gameName} Complete! +${xpReward} XP +${coinReward} Coins`, 'success');
        }
    } catch(e) { console.error(e); }
    
    closeGame();
}

function closeGame() {
    if (typeof window.atCancelRef === 'function') window.atCancelRef();
    const gameContainer = document.getElementById('gameContainer');
    const gamesGrid = document.getElementById('gamesGrid');
    const gameCanvas = document.getElementById('gameCanvas');
    
    if (gameCanvas) gameCanvas.innerHTML = '';
    if (gameContainer) gameContainer.style.display = 'none';
    if (gamesGrid) { gamesGrid.style.display = 'block'; renderGamesHub(); }
}

window.renderGamesHub = renderGamesHub;
window.launchGame = launchGame;
window.completeGame = completeGame;
window.closeGame = closeGame;
window.filterGames = filterGames;
window.filterByCategory = filterByCategory;
window.toggleFavorite = toggleFavorite;
window.openGames = closeGame;

export { renderGamesHub, launchGame };
