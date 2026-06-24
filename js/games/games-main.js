// js/games/games-main.js - FULL INTEGRATED SYSTEM

// 1. INITIALIZATION
if (!localStorage.getItem('recentlyPlayedGames')) {
    localStorage.setItem('recentlyPlayedGames', JSON.stringify(['spaceshooter', 'neondrift']));
}

function openChronoxGamesHub() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div id="gamesHubWrapper" style="padding: 20px; background: radial-gradient(circle at top, #0f0a2a 0%, #03020a 100%); min-height: calc(100vh - 70px); font-family: 'Poppins', sans-serif; color: #ffffff;">
            <h1 style="text-align: center; color: #D4AF37; margin-bottom: 25px;">🎮 CHRONOX GAMES HUB</h1>
            
            <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin-bottom: 25px;">
                <button onclick="renderMultiplayerSelector()" style="padding: 20px; background: #8B5CF6; border: none; border-radius: 16px; color: white; font-weight: 800; cursor: pointer; box-shadow: 0 0 20px rgba(139,92,246,0.3);">🌐 MULTIPLAYER ARENA</button>
            </div>

            <div id="mainHubContent">
                <div style="position: relative; margin-bottom: 25px;">
                    <input id="gameSearchInput" oninput="filterHubGames()" type="text" placeholder="Search games..." style="width: 100%; padding: 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; color: #fff;">
                </div>
                <div id="recentlyPlayedSection" style="margin-bottom: 25px;">
                    <h2 style="font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase;">⏳ RECENT ACCESS LOGS</h2>
                    <div id="recentGamesContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;"></div>
                </div>
                <div id="categorizedGamesSection"></div>
            </div>
        </div>
    `;
    renderRecentGamesQueue();
    renderAllGames();
}

// 2. MULTIPLAYER SELECTOR (The "Click to reveal" logic)
function renderMultiplayerSelector() {
    document.getElementById('mainHubContent').innerHTML = `
        <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:16px; border:1px solid rgba(255,255,255,0.1);">
            <h2 style="color:#8B5CF6; text-align:center;">MULTIPLAYER COMMAND</h2>
            <div style="margin:20px 0; display:flex; gap:10px;">
                <input id="directRoomCodeInput" placeholder="ENTER 4-DIGIT CODE" style="flex:1; padding:10px; background:#000; color:#fff; border:1px solid #444; border-radius:8px;">
                <button onclick="joinMultiplayerRoom(document.getElementById('directRoomCodeInput').value)" style="padding:10px 20px; background:#8B5CF6; border:none; color:white; border-radius:8px;">JOIN</button>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                <button onclick="createMultiplayerRoom('chess', 2)" style="padding:15px; background:#111; border:1px solid #333; color:white; border-radius:10px;">👑 Chess</button>
                <button onclick="createMultiplayerRoom('ludo', 4)" style="padding:15px; background:#111; border:1px solid #333; color:#00f5d4; border-radius:10px;">🎲 Ludo</button>
                <button onclick="createMultiplayerRoom('uno', 4)" style="padding:15px; background:#111; border:1px solid #333; color:#ff006e; border-radius:10px;">🃏 Uno</button>
            </div>
            <button onclick="openChronoxGamesHub()" style="width:100%; margin-top:20px; background:transparent; color:#666; border:none;">BACK TO HUB</button>
        </div>
    `;
}

// 3. GAME DATABASE & HELPERS
const GAME_DATABASE_RECORDS = {
    cyberninja: { icon: "🥷", title: "Cyber Ninja", desc: "Endless Runner", xp: "+40 XP", color: "#8B5CF6" },
    spaceshooter: { icon: "🚀", title: "Space Shooter", desc: "Space Destroyer", xp: "+50 XP", color: "#00D4FF" },
    aimtrainer: { icon: "🎯", title: "Aim Trainer", desc: "Target Acquisition", xp: "+30 XP", color: "#FF4757" },
    neondrift: { icon: "🏎️", title: "Neon Drift", desc: "Hyper Racer", xp: "+50 XP", color: "#FF9F43" },
    brickbreaker: { icon: "🧱", title: "Brick Breaker", desc: "Vector Shield", xp: "+30 XP", color: "#FF6B81" },
    pong: { icon: "🏓", title: "Pong", desc: "Laser Matrix", xp: "+35 XP", color: "#00D4FF" },
    flappy: { icon: "🐦", title: "Flappy Bird", desc: "Grav Infiltrator", xp: "+20 XP", color: "#FF6B81" },
    tictactoe: { icon: "❌", title: "Tic Tac Toe", desc: "Minimax AI", xp: "+25 XP", color: "#D4AF37" },
    memorymatch: { icon: "🧠", title: "Memory Match", desc: "Synapse Grid", xp: "+20 XP", color: "#2ED573" },
    reactionmaster: { icon: "⚡", title: "Reaction Master", desc: "Latency Trigger", xp: "+20 XP", color: "#FFD700" }
};

function renderAllGames() {
    const container = document.getElementById('categorizedGamesSection');
    container.innerHTML = Object.keys(GAME_DATABASE_RECORDS).map(id => {
        let g = GAME_DATABASE_RECORDS[id];
        return injectCardEngine(g.icon, g.title, g.desc, g.xp, g.color, id);
    }).join('');
}

function injectCardEngine(icon, title, desc, xp, color, id) {
    return `<div class="premium-game-card" onclick="safeStart('${id}')" style="cursor:pointer; background:rgba(255,255,255,0.02); padding:15px; border-radius:12px; border:1px solid #333;">
        <div style="font-size:30px">${icon}</div>
        <h3 style="color:${color}; font-size:14px; margin:5px 0;">${title}</h3>
    </div>`;
}

// 4. MULTIPLAYER ENGINE (Unchanged functional core)
function createMultiplayerRoom(gameId, maxPlayers) {
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    firebase.database().ref(`rooms/${roomId}`).set({ gameId, status:'waiting', players: { [firebase.auth().currentUser.uid]: { name: "Host" } } });
    renderMultiplayerLobbyUI(roomId, gameId, true);
}

function joinMultiplayerRoom(roomId) {
    firebase.database().ref(`rooms/${roomId.toUpperCase()}`).once('value').then(snap => {
        if(snap.exists()) renderMultiplayerLobbyUI(roomId, snap.val().gameId, false);
    });
}

function renderMultiplayerLobbyUI(roomId, gameId, isHost) {
    document.getElementById('contentArea').innerHTML = `<div style="padding:50px; text-align:center; color:white;"><h2>Room: ${roomId}</h2><p>Game: ${gameId}</p>${isHost ? `<button onclick="firebase.database().ref('rooms/${roomId}').update({status:'active'})">START</button>` : ''}</div>`;
}

// 5. START LOGIC
function safeStart(name) {
    // Add all your existing start functions here
    if(name === 'spaceshooter') startSpaceShooter();
    // etc...
}
