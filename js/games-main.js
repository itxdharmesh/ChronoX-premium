import { db } from './config.js';
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from './utils.js';

const GAMES = [
    { name: 'Chess', icon: '♟️', xp: 50, coins: 20, func: 'startChess', category: 'Board', trending: true, players: '2 Player' },
    { name: 'Ludo', icon: '🎲', xp: 30, coins: 10, func: 'startLudo', category: 'Board', trending: false, players: '4 Player' },
    { name: 'UNO', icon: '🃏', xp: 25, coins: 15, func: 'startUno', category: 'Cards', trending: true, players: '4 Player' },
    { name: 'Tic Tac Toe', icon: '⭕', xp: 15, coins: 5, func: 'startTicTacToe', category: 'Strategy', trending: false, players: '2 Player' },
    { name: 'Pong', icon: '🏓', xp: 35, coins: 15, func: 'startPong', category: 'Arcade', trending: true, players: '2 Player' },
    { name: 'Flappy Bird', icon: '🐦', xp: 40, coins: 25, func: 'startFlappy', category: 'Arcade', trending: true, players: '1 Player' },
    { name: 'Neon Drift', icon: '🏎️', xp: 60, coins: 30, func: 'startNeonDrift', category: 'Racing', trending: true, players: '1 Player' },
    { name: 'Cyber Ninja', icon: '🥷', xp: 70, coins: 35, func: 'startCyberNinja', category: 'Action', trending: false, players: '1 Player' },
    { name: 'Aim Trainer', icon: '🎯', xp: 35, coins: 20, func: 'startAimTrainer', category: 'Action', trending: true, players: '1 Player' },
    { name: 'Brick Breaker', icon: '🧱', xp: 45, coins: 25, func: 'startBrickBreaker', category: 'Arcade', trending: false, players: '1 Player' },
    { name: 'Space Shooter', icon: '🚀', xp: 70, coins: 40, func: 'startSpaceShooter', category: 'Action', trending: true, players: '1 Player' },
    { name: 'Memory Match', icon: '🧠', xp: 30, coins: 15, func: 'startMemoryMatch', category: 'Puzzle', trending: false, players: '1 Player' },
    { name: 'Reaction Master', icon: '⚡', xp: 45, coins: 25, func: 'startReactionMaster', category: 'Sports', trending: true, players: '1 Player' }
];

const CATEGORIES = ['All', 'Action', 'Arcade', 'Puzzle', 'Sports', 'Strategy', 'Board', 'Cards', 'Racing', 'Multiplayer'];

let recentGames = [];
let favoriteGames = new Set();
let currentCategory = 'All';

function renderGamesHub() {
    const gamesGrid = document.getElementById('gamesGrid');
    const gameContainer = document.getElementById('gameContainer');
    
    if (gameContainer) gameContainer.style.display = 'none';
    if (!gamesGrid) return;
    
    gamesGrid.style.display = 'block';
    
    recentGames = JSON.parse(localStorage.getItem('chronox_recent_games') || '[]');
    favoriteGames = new Set(JSON.parse(localStorage.getItem('chronox_fav_games') || '[]'));
    
    const trendingGames = GAMES.filter(g => g.trending);
    const recentGameObjects = recentGames.map(name => GAMES.find(g => g.name === name)).filter(Boolean);
    
    gamesGrid.innerHTML = `
        <!-- Search Bar -->
        <div class="input-group" style="margin-bottom:0.8rem;">
            <i class="fas fa-search input-icon"></i>
            <input type="text" id="gameSearchInput" placeholder="Search games..." class="auth-input" oninput="window.filterGames()">
        </div>
        
        <!-- Category Tabs -->
        <div class="category-tabs">
            ${CATEGORIES.map(cat => `
                <button class="cat-tab ${cat === currentCategory ? 'cat-active' : ''}" 
                    onclick="window.filterByCategory('${cat}')">${cat}</button>
            `).join('')}
        </div>
        
        <!-- Continue Playing -->
        ${recentGameObjects.length > 0 ? `
            <div style="margin:1rem 0;">
                <h4 style="color:var(--neon-blue);margin-bottom:0.5rem;font-size:0.9rem;">🕹️ Continue Playing</h4>
                <div id="recentGamesRow">
                    ${recentGameObjects.slice(0, 6).map(game => `
                        <div class="glass-panel" style="min-width:130px;padding:0.8rem;text-align:center;cursor:pointer;flex-shrink:0;" 
                            onclick="window.launchGame('${game.func}','${game.name}',${game.xp},${game.coins})">
                            <div style="font-size:2.2rem;">${game.icon}</div>
                            <p style="font-size:0.75rem;margin:0.3rem 0;">${game.name}</p>
                            <span style="font-size:0.6rem;color:var(--neon-blue);">+${game.xp} XP</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        <!-- Trending -->
        <div style="margin:1rem 0;">
            <h4 style="color:#ff4757;margin-bottom:0.5rem;font-size:0.9rem;">🔥 Trending Now</h4>
            <div style="display:flex;gap:0.8rem;overflow-x:auto;padding:0.3rem 0;" id="trendingRow">
                ${trendingGames.map(game => `
                    <div class="glass-panel" style="min-width:140px;padding:0.8rem;text-align:center;cursor:pointer;flex-shrink:0;border:1px solid rgba(255,71,87,0.3);" 
                        onclick="window.launchGame('${game.func}','${game.name}',${game.xp},${game.coins})">
                        <span style="position:absolute;top:5px;right:5px;background:#ff4757;color:white;font-size:0.55rem;padding:1px 5px;border-radius:6px;">HOT</span>
                        <div style="font-size:2.2rem;">${game.icon}</div>
                        <p style="font-size:0.75rem;margin:0.3rem 0;">${game.name}</p>
                        <div style="display:flex;justify-content:center;gap:0.5rem;font-size:0.6rem;">
                            <span style="color:var(--neon-blue);">+${game.xp} XP</span>
                            <span style="color:var(--gold);">+${game.coins} 🪙</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- All Games Grid -->
        <h4 style="color:var(--gold);margin:1rem 0 0.5rem;font-size:0.9rem;">🎮 All Games</h4>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.8rem;" id="gamesCardGrid">
            ${GAMES.map(game => `
                <div class="glass-panel game-card" data-category="${game.category}" data-name="${game.name.toLowerCase()}" style="position:relative;">
                    ${game.trending ? '<span style="position:absolute;top:8px;right:8px;background:#ff4757;color:white;font-size:0.55rem;padding:2px 6px;border-radius:8px;">HOT</span>' : ''}
                    ${favoriteGames.has(game.name) ? '<span style="position:absolute;top:8px;left:8px;color:var(--gold);font-size:0.9rem;">⭐</span>' : ''}
                    <div style="font-size:2.8rem;">${game.icon}</div>
                    <h3 style="margin:0.3rem 0;font-size:0.85rem;">${game.name}</h3>
                    <p style="font-size:0.6rem;color:#888;margin-bottom:0.3rem;">${game.players} • ${game.category}</p>
                    <div style="display:flex;justify-content:center;gap:0.8rem;font-size:0.65rem;margin-bottom:0.5rem;">
                        <span style="color:var(--neon-blue);">+${game.xp} XP</span>
                        <span style="color:var(--gold);">+${game.coins} 🪙</span>
                    </div>
                    <button class="btn-glow" style="width:100%;padding:0.5rem;font-size:0.75rem;" 
                        onclick="event.stopPropagation();window.launchGame('${game.func}','${game.name}',${game.xp},${game.coins})">
                        ▶ Play Now
                    </button>
                    <button style="position:absolute;bottom:8px;right:8px;background:none;border:none;color:${favoriteGames.has(game.name)?'var(--gold)':'#555'};cursor:pointer;font-size:0.9rem;z-index:2;" 
                        onclick="event.stopPropagation();window.toggleFavorite('${game.name}')">
                        ${favoriteGames.has(game.name) ? '⭐' : '☆'}
                    </button>
                </div>
            `).join('')}
        </div>
    `;
    
    // Scroll styles
    addScrollStyles();
}

function addScrollStyles() {
    if (document.getElementById('gameScrollStyles')) return;
    const style = document.createElement('style');
    style.id = 'gameScrollStyles';
    style.textContent = `
        #recentGamesRow::-webkit-scrollbar,
        #trendingRow::-webkit-scrollbar,
        .category-tabs::-webkit-scrollbar { height: 3px; }
        #recentGamesRow::-webkit-scrollbar-thumb,
        #trendingRow::-webkit-scrollbar-thumb,
        .category-tabs::-webkit-scrollbar-thumb { background: var(--neon-blue); border-radius: 10px; }
        #recentGamesRow, #trendingRow { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
    `;
    document.head.appendChild(style);
}

function filterGames() {
    const searchTerm = document.getElementById('gameSearchInput')?.value.toLowerCase() || '';
    const cards = document.querySelectorAll('#gamesCardGrid .game-card');
    
    cards.forEach(card => {
        const name = card.dataset.name || '';
        if (name.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterByCategory(category) {
    currentCategory = category;
    
    document.querySelectorAll('.cat-tab').forEach(tab => {
        tab.classList.remove('cat-active');
        if (tab.textContent === category) tab.classList.add('cat-active');
    });
    
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
        catch (error) { 
            console.error('Game error:', error); 
            showToast('Error loading game', 'error');
            showFallbackGame(gameName, xpReward, coinReward);
        }
    } else {
        showFallbackGame(gameName, xpReward, coinReward);
    }
}

function showFallbackGame(gameName, xpReward, coinReward) {
    const contentArea = document.getElementById('contentArea');
    if (contentArea) {
        contentArea.innerHTML = `
            <div style="text-align:center;padding:3rem;">
                <div style="font-size:4rem;margin-bottom:1rem;">🎮</div>
                <h3 style="color:var(--neon-blue);">${gameName}</h3>
                <p style="color:#888;margin:0.5rem 0;">Game module loading...</p>
                <div style="margin:1rem 0;">
                    <span style="color:var(--neon-blue);">+${xpReward} XP</span>
                    <span style="margin:0 0.5rem;">•</span>
                    <span style="color:var(--gold);">+${coinReward} Coins</span>
                </div>
                <button class="btn-glow" onclick="window.completeGame('${gameName}',${xpReward},${coinReward})" style="margin:0.5rem;">
                    Complete Game
                </button>
                <button class="btn-gold" onclick="window.closeGame()" style="margin:0.5rem;">
                    Back to Games
                </button>
            </div>`;
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
            
            const xpRequirements = {1:100,2:250,3:450,4:700,5:1000,6:1400,7:1900,8:2500,9:3200,10:4000};
            let newLevel = userData.level || 1;
            let remainingXP = newXP;
            
            for (let lvl = 1; lvl <= 10; lvl++) {
                const needed = xpRequirements[lvl] || lvl * 500;
                if (remainingXP >= needed) {
                    remainingXP -= needed;
                    newLevel = lvl + 1;
                } else {
                    break;
                }
            }
            
            await updateDoc(userRef, {
                xp: newXP,
                coins: newCoins,
                level: newLevel,
                dailyGamesPlayed: newGamesPlayed,
                lastGamePlayed: serverTimestamp()
            });
            
            showToast(`🏆 ${gameName} Complete! +${xpReward} XP +${coinReward} Coins`, 'success');
        }
    } catch(e) { 
        console.error('Error saving game progress:', e);
        showToast('Progress saved!', 'success');
    }
    
    closeGame();
}

function closeGame() {
    if (typeof window.atCancelRef === 'function') window.atCancelRef();
    if (typeof window.cancelGame === 'function') window.cancelGame();
    
    const gameContainer = document.getElementById('gameContainer');
    const gamesGrid = document.getElementById('gamesGrid');
    const gameCanvas = document.getElementById('gameCanvas');
    
    if (gameCanvas) gameCanvas.innerHTML = '';
    if (gameContainer) gameContainer.style.display = 'none';
    if (gamesGrid) { 
        gamesGrid.style.display = 'block'; 
        renderGamesHub(); 
    }
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
