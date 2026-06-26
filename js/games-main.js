import { db } from './config.js';
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from './utils.js';

const GAMES = [
    { name: 'Space Shooter', icon: '🚀', xp: 70, coins: 40, func: 'startSpaceShooter', category: 'Action', trending: true, players: '1P', desc: 'Interstellar war zone' },
    { name: 'Neon Drift', icon: '🏎️', xp: 60, coins: 30, func: 'startNeonDrift', category: 'Racing', trending: true, players: '1P', desc: 'Synthwave racing' },
    { name: 'Cyber Ninja', icon: '🥷', xp: 70, coins: 35, func: 'startCyberNinja', category: 'Action', trending: true, players: '1P', desc: 'Neon reaction runner' },
    { name: 'Aim Trainer', icon: '🎯', xp: 35, coins: 20, func: 'startAimTrainer', category: 'Action', trending: true, players: '1P', desc: 'Tactical reflex' },
    { name: 'Flappy Bird', icon: '🐦', xp: 40, coins: 25, func: 'startFlappy', category: 'Arcade', trending: true, players: '1P', desc: 'Classic flyer' },
    { name: 'Pong', icon: '🏓', xp: 35, coins: 15, func: 'startPong', category: 'Sports', trending: false, players: '2P', desc: 'Neon ping pong' },
    { name: 'Brick Breaker', icon: '🧱', xp: 45, coins: 25, func: 'startBrickBreaker', category: 'Arcade', trending: false, players: '1P', desc: 'Break all bricks' },
    { name: 'Memory Match', icon: '🧠', xp: 30, coins: 15, func: 'startMemoryMatch', category: 'Puzzle', trending: false, players: '1P', desc: 'Test your memory' },
    { name: 'Reaction Master', icon: '⚡', xp: 45, coins: 25, func: 'startReactionMaster', category: 'Sports', trending: true, players: '1P', desc: 'Speed test' },
    { name: 'Tic Tac Toe', icon: '⭕', xp: 15, coins: 5, func: 'startTicTacToe', category: 'Strategy', trending: false, players: '2P', desc: 'Classic duel' },
    { name: 'Chess', icon: '♟️', xp: 50, coins: 20, func: 'startChess', category: 'Board', trending: false, players: '2P', desc: 'Royal battle' },
    { name: 'Ludo', icon: '🎲', xp: 30, coins: 10, func: 'startLudo', category: 'Board', trending: false, players: '4P', desc: 'Dice master' },
    { name: 'UNO', icon: '🃏', xp: 25, coins: 15, func: 'startUno', category: 'Cards', trending: false, players: '4P', desc: 'Card chaos' }
];

const CATEGORIES = ['All', 'Action', 'Arcade', 'Sports', 'Puzzle', 'Strategy', 'Board', 'Cards', 'Racing'];

let recentGames = [], favoriteGames = new Set(), currentCategory = 'All';

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
            <input type="text" id="gameSearchInput" placeholder="🔍 Search games..." class="auth-input" oninput="window.filterGames()">
        </div>
        
        <!-- Category Tabs - Horizontal Scroll -->
        <div class="category-tabs" style="display:flex;gap:0.5rem;overflow-x:auto;padding:0.5rem 0;margin-bottom:0.8rem;">
            ${CATEGORIES.map(cat => `
                <button class="cat-tab ${cat===currentCategory?'cat-active':''}" onclick="window.filterByCategory('${cat}')" 
                    style="flex-shrink:0;white-space:nowrap;">${cat}</button>
            `).join('')}
        </div>
        
        <!-- Continue Playing -->
        ${recentGameObjects.length > 0 ? `
            <div style="margin:0.8rem 0;">
                <h4 style="color:var(--neon-blue);margin-bottom:0.5rem;font-size:0.85rem;">🕹️ Continue Playing</h4>
                <div style="display:flex;gap:0.8rem;overflow-x:auto;padding:0.3rem 0;" class="scroll-row">
                    ${recentGameObjects.slice(0, 6).map(game => `
                        <div class="glass-panel game-mini-card" onclick="window.launchGame('${game.func}','${game.name}',${game.xp},${game.coins})" 
                            style="min-width:130px;padding:0.8rem;text-align:center;cursor:pointer;flex-shrink:0;border:1px solid rgba(0,212,255,0.3);">
                            <div style="font-size:2rem;">${game.icon}</div>
                            <p style="font-size:0.7rem;margin:0.3rem 0;color:#fff;">${game.name}</p>
                            <span style="font-size:0.6rem;color:var(--neon-blue);">+${game.xp} XP</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        <!-- Trending -->
        <div style="margin:0.8rem 0;">
            <h4 style="color:#ff4757;margin-bottom:0.5rem;font-size:0.85rem;">🔥 Trending Now</h4>
            <div style="display:flex;gap:0.8rem;overflow-x:auto;padding:0.3rem 0;" class="scroll-row">
                ${trendingGames.map(game => `
                    <div class="glass-panel game-trending-card" onclick="window.launchGame('${game.func}','${game.name}',${game.xp},${game.coins})"
                        style="min-width:150px;padding:1rem;text-align:center;cursor:pointer;flex-shrink:0;border:1px solid rgba(255,71,87,0.4);position:relative;">
                        <span style="position:absolute;top:6px;right:6px;background:#ff4757;color:#fff;font-size:0.5rem;padding:2px 6px;border-radius:6px;">HOT</span>
                        <div style="font-size:2.5rem;">${game.icon}</div>
                        <p style="font-size:0.8rem;margin:0.3rem 0;color:#fff;font-weight:700;">${game.name}</p>
                        <p style="font-size:0.6rem;color:#aaa;">${game.desc}</p>
                        <div style="display:flex;justify-content:center;gap:0.5rem;font-size:0.6rem;margin-top:0.3rem;">
                            <span style="color:var(--neon-blue);">+${game.xp} XP</span>
                            <span style="color:var(--gold);">🪙${game.coins}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- All Games Grid -->
        <h4 style="color:var(--gold);margin:0.8rem 0 0.5rem;font-size:0.85rem;">🎮 All Games</h4>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.7rem;" id="gamesCardGrid">
            ${GAMES.map(game => `
                <div class="glass-panel game-card-premium" data-category="${game.category}" data-name="${game.name.toLowerCase()}" 
                    style="position:relative;padding:1rem;text-align:center;cursor:pointer;overflow:hidden;">
                    <div class="game-card-glow"></div>
                    ${game.trending?'<span style="position:absolute;top:6px;right:6px;background:#ff4757;color:#fff;font-size:0.5rem;padding:2px 5px;border-radius:5px;">HOT</span>':''}
                    ${favoriteGames.has(game.name)?'<span style="position:absolute;top:6px;left:6px;color:var(--gold);font-size:0.8rem;">⭐</span>':''}
                    <div style="font-size:2.5rem;">${game.icon}</div>
                    <h3 style="margin:0.3rem 0;font-size:0.8rem;color:#fff;">${game.name}</h3>
                    <p style="font-size:0.55rem;color:#888;margin-bottom:0.3rem;">${game.players} • ${game.category}</p>
                    <div style="display:flex;justify-content:center;gap:0.5rem;font-size:0.6rem;margin-bottom:0.5rem;">
                        <span style="color:var(--neon-blue);">+${game.xp} XP</span>
                        <span style="color:var(--gold);">🪙${game.coins}</span>
                    </div>
                    <button class="btn-glow" style="width:100%;padding:0.4rem;font-size:0.7rem;border-radius:8px;" 
                        onclick="event.stopPropagation();window.launchGame('${game.func}','${game.name}',${game.xp},${game.coins})">
                        ▶ Play
                    </button>
                    <button style="position:absolute;bottom:6px;right:6px;background:none;border:none;color:${favoriteGames.has(game.name)?'var(--gold)':'#555'};cursor:pointer;font-size:0.7rem;z-index:2;" 
                        onclick="event.stopPropagation();window.toggleFavorite('${game.name}')">
                        ${favoriteGames.has(game.name)?'⭐':'☆'}
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function filterGames() {
    const term = document.getElementById('gameSearchInput')?.value.toLowerCase() || '';
    document.querySelectorAll('#gamesCardGrid .game-card-premium').forEach(card => {
        card.style.display = (card.dataset.name || '').includes(term) ? 'block' : 'none';
    });
}

function filterByCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('cat-active'));
    document.querySelectorAll('.cat-tab').forEach(t => { if(t.textContent===cat) t.classList.add('cat-active'); });
    document.querySelectorAll('#gamesCardGrid .game-card-premium').forEach(card => {
        card.style.display = (cat==='All' || card.dataset.category===cat) ? 'block' : 'none';
    });
}

function toggleFavorite(name) {
    favoriteGames.has(name) ? favoriteGames.delete(name) : favoriteGames.add(name);
    localStorage.setItem('chronox_fav_games', JSON.stringify([...favoriteGames]));
    renderGamesHub();
}

function launchGame(func, name, xp, coins) {
    const user = window.auth?.currentUser;
    if (!user) { showToast('Login required', 'error'); return; }
    
    recentGames = [name, ...recentGames.filter(g => g!==name)].slice(0, 10);
    localStorage.setItem('chronox_recent_games', JSON.stringify(recentGames));
    
    document.getElementById('gamesGrid').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('gameCanvas').innerHTML = '<div id="contentArea" style="width:100%;min-height:500px;height:calc(100vh - 150px);overflow:hidden;"></div>';
    
    window.currentGame = { name, xp, coins };
    
    if (typeof window[func] === 'function') {
        try { window[func](); } catch(e) { console.error(e); showToast('Error', 'error'); }
    }
}

async function completeGame(name, xp, coins) {
    const user = window.auth?.currentUser;
    if (!user) return;
    try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const d = snap.data();
        await updateDoc(ref, {
            xp: (d.xp||0)+xp, coins: (d.coins||0)+coins,
            dailyGamesPlayed: (d.dailyGamesPlayed||0)+1,
            level: Math.floor(((d.xp||0)+xp)/100)+1
        });
        showToast(`🏆 ${name} Complete! +${xp} XP +${coins} Coins`, 'success');
    } catch(e) { console.error(e); }
    closeGame();
}

function closeGame() {
    ['ssCancelRef','ndCancelRef','cnCancelRef','atCancelRef','fbCancelRef','pgCancelRef','bbCancelRef','rmCancelRef'].forEach(f => {
        if (typeof window[f]==='function') window[f]();
    });
    document.getElementById('gameCanvas').innerHTML = '';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('gamesGrid').style.display = 'block';
    renderGamesHub();
}

window.openGames = closeGame;
window.renderGamesHub = renderGamesHub;
window.launchGame = launchGame;
window.completeGame = completeGame;
window.closeGame = closeGame;
window.filterGames = filterGames;
window.filterByCategory = filterByCategory;
window.toggleFavorite = toggleFavorite;

export { renderGamesHub, launchGame };
