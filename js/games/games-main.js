// js/games/games-main.js - FULL MASTER BUILD

// 1. INITIALIZATION
if (!localStorage.getItem('recentlyPlayedGames')) {
    localStorage.setItem('recentlyPlayedGames', JSON.stringify(['spaceshooter', 'neondrift']));
}

// 2. MAIN HUB RENDER
function openChronoxGamesHub() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div id="gamesHubWrapper" style="padding: 20px; background: radial-gradient(circle at top, #0f0a2a 0%, #03020a 100%); min-height: 100vh; font-family: 'Poppins', sans-serif; color: #ffffff;">
            <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(124, 58, 237, 0.05) 100%); border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 24px; padding: 22px; margin-bottom: 25px;">
                <h1 style="margin: 0; font-size: 28px; text-align:center; color: #D4AF37;">🎮 GAMES HUB</h1>
            </div>
            
            <button onclick="renderMultiplayerSelector()" style="width: 100%; padding: 15px; background: #8B5CF6; border: none; border-radius: 12px; color: white; font-weight: 800; cursor: pointer; margin-bottom: 20px;">🌐 MULTIPLAYER ARENA</button>

            <input id="gameSearchInput" oninput="filterHubGames()" type="text" placeholder="Search games..." style="width: 100%; padding: 15px; background: #111; border: 1px solid #333; border-radius: 12px; color: white; margin-bottom: 20px;">

            <div id="mainHubContent">
                <div id="categorizedGamesSection"></div>
            </div>
        </div>
    `;
    renderAllGames();
}

// 3. GAME DATABASE & CARD ENGINE
const GAME_DATABASE_RECORDS = {
    cyberninja: { icon: "🥷", title: "Cyber Ninja", desc: "Endless Runner", xp: "+40 XP", color: "#8B5CF6" },
    spaceshooter: { icon: "🚀", title: "Space Shooter", desc: "Space Destroyer", xp: "+50 XP", color: "#00D4FF" },
    neondrift: { icon: "🏎️", title: "Neon Drift", desc: "Hyper Racer", xp: "+50 XP", color: "#FF9F43" },
    brickbreaker: { icon: "🧱", title: "Brick Breaker", desc: "Vector Shield", xp: "+30 XP", color: "#FF6B81" },
    pong: { icon: "🏓", title: "Pong", desc: "Laser Matrix", xp: "+35 XP", color: "#00D4FF" }
};

function injectCardEngine(icon, title, desc, xp, color, id) {
    return `
        <div class="premium-game-card" data-game-title="${title.toLowerCase()}" onclick="safeStart('${id}')" style="cursor:pointer; background: rgba(255,255,255,0.02); border: 1px solid #333; padding: 15px; border-radius: 14px; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:14px">
                <div style="font-size:32px;">${icon}</div>
                <div style="flex:1">
                    <h3 style="color:${color}; font-size:14px; margin:0;">${title}</h3>
                    <p style="color:rgba(255,255,255,0.4); font-size:10px;">${desc}</p>
                </div>
                <span style="color:#FFD700; font-size:9px;">${xp}</span>
            </div>
        </div>
    `;
}

function renderAllGames() {
    const container = document.getElementById('categorizedGamesSection');
    container.innerHTML = Object.keys(GAME_DATABASE_RECORDS).map(id => {
        let g = GAME_DATABASE_RECORDS[id];
        return injectCardEngine(g.icon, g.title, g.desc, g.xp, g.color, id);
    }).join('');
}

// 4. MULTIPLAYER LOGIC
function renderMultiplayerSelector() {
    document.getElementById('mainHubContent').innerHTML = `
        <div style="background:#111; padding:20px; border-radius:16px;">
            <h2 style="color:#8B5CF6;">MULTIPLAYER</h2>
            <div style="display:grid; gap:10px; margin-bottom:20px;">
                <input id="directRoomCodeInput" placeholder="ROOM CODE" style="padding:10px; background:#000; border:1px solid #444; color:#fff;">
                <button onclick="joinMultiplayerRoom(document.getElementById('directRoomCodeInput').value)" style="padding:10px; background:#8B5CF6; color:white; border:none;">JOIN</button>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                <button onclick="createMultiplayerRoom('chess', 2)" style="padding:10px;">👑 Chess</button>
                <button onclick="createMultiplayerRoom('ludo', 4)" style="padding:10px;">🎲 Ludo</button>
                <button onclick="createMultiplayerRoom('uno', 4)" style="padding:10px;">🃏 Uno</button>
            </div>
            <button onclick="openChronoxGamesHub()" style="margin-top:20px; background:none; border:none; color:#666;">← Back</button>
        </div>
    `;
}

function bootMultiplayerGameEngine(gameId, roomId) {
    document.getElementById('contentArea').innerHTML = '<div id="gameCanvas" style="width:100%; height:100vh;"></div>';
    if (gameId === 'chess') startMultiplayerChess(roomId);
    else if (gameId === 'ludo') startMultiplayerLudo(roomId);
    else if (gameId === 'uno') startMultiplayerUno(roomId);
}

// 5. XP & UTILS
function rewardChronoxXP(result, gameId) {
    let xp = (result === 'win') ? 25 : 10;
    if (typeof showToast === 'function') showToast(`⚡ +${xp} XP in ${gameId.toUpperCase()}!`);
    
    if (firebase.auth().currentUser) {
        firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid)
            .update({ xp: firebase.firestore.FieldValue.increment(xp) });
    }
}

function safeStart(name) {
    interceptAndHookGameOver(name);
    if(name === 'spaceshooter') startSpaceShooter();
    else if(name === 'cyberninja') startCyberNinja();
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

function filterHubGames() {
    let query = document.getElementById('gameSearchInput').value.toLowerCase();
    document.querySelectorAll('.premium-game-card').forEach(card => {
        card.style.display = card.getAttribute('data-game-title').includes(query) ? 'block' : 'none';
    });
}

function utilHexToRgb(hex) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}
