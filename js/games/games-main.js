// js/games/games-main.js

// Active Storage Cache for Telemetry Realtime Queue
if (!localStorage.getItem('recentlyPlayedGames')) {
    localStorage.setItem('recentlyPlayedGames', JSON.stringify(['spaceshooter', 'neondrift']));
}

function openChronoxGamesHub() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Ultra Premium Glassmorphic Layout Base Injection
    c.innerHTML = `
        <div id="gamesHubWrapper" style="padding: 20px; background: radial-gradient(circle at top, #0f0a2a 0%, #03020a 100%); min-height: calc(100vh - 70px); font-family: 'Poppins', sans-serif; color: #ffffff; user-select:none; -webkit-user-select:none; overflow-y:auto; padding-bottom:90px;">
            
            <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(124, 58, 237, 0.05) 100%); border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 24px; padding: 22px; position: relative; overflow: hidden; box-shadow: 0 20px 45px rgba(0,0,0,0.6); margin-bottom: 25px; backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);">
                <div style="position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; background: rgba(212, 175, 55, 0.1); border-radius: 50%; filter: blur(35px); pointer-events: none;"></div>
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <span style="font-size: 9px; color: #D4AF37; letter-spacing: 4px; font-weight: 800; text-transform: uppercase; display:block; text-shadow: 0 0 10px rgba(212,175,55,0.4);">QUANTUM CORE SYSTEM</span>
                        <h1 style="margin: 4px 0 0; font-size: 28px; font-weight: 900; background: linear-gradient(90deg, #D4AF37, #f3e5ab); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(212,175,55,0.25);">🎮 GAMES HUB</h1>
                    </div>
                    <div style="background: rgba(4, 3, 15, 0.75); padding: 8px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); text-align: right; backdrop-filter:blur(5px);">
                        <span style="font-size: 8px; color: rgba(255,255,255,0.4); display:block; font-weight:700; letter-spacing: 1px; text-transform:uppercase;">NODE INTEGRITY</span>
                        <span style="color: #2ed573; font-size: 12px; font-weight: 900; text-shadow: 0 0 10px #2ed573;">● CHRONOX ONLINE</span>
                    </div>
                </div>
            </div>

            <div style="position: relative; margin-bottom: 25px;">
                <span style="position: absolute; left: 18px; top: 50%; transform: translateY(-50%); font-size: 16px; color: rgba(255,255,255,0.45);">🔍</span>
                <input id="gameSearchInput" oninput="filterHubGames()" type="text" placeholder="Search operational matrices..." style="width: 100%; padding: 15px 20px 15px 50px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; color: #ffffff; font-family: 'Poppins', sans-serif; font-size: 13px; outline: none; transition: 0.3s; box-shadow: inset 0 2px 8px rgba(0,0,0,0.5); font-weight: 500;">
            </div>

            <div class="category-block" style="margin-bottom: 25px;">
                <h2 style="font-size: 12px; font-weight: 800; letter-spacing: 2px; color: rgba(255,255,255,0.4); margin-bottom: 12px; text-transform: uppercase;">🔥 TARGET RECOM SYSTEMS</h2>
                <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                    <div onclick="safeStart('spaceshooter')" style="cursor: pointer; background: linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%); border-radius: 18px; padding: 20px; position: relative; overflow: hidden; box-shadow: 0 12px 25px rgba(0,212,255,0.25); transition: 0.3s;" class="premium-hover-node">
                        <div style="position: absolute; right: -10px; bottom: -15px; font-size: 80px; opacity: 0.15; transform: rotate(-10deg);">🚀</div>
                        <span style="background: rgba(255,255,255,0.22); padding: 3px 9px; border-radius: 20px; font-size: 8px; font-weight: 800; letter-spacing: 1px; text-transform:uppercase;">RECOMMENDED CORE</span>
                        <h3 style="margin: 8px 0 4px; font-size: 20px; font-weight: 900; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">Space Shooter Pro</h3>
                        <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.8);">Quantum destruction terminal simulation ready.</p>
                    </div>
                </div>
            </div>

            <div id="recentlyPlayedSection" style="margin-bottom: 25px;">
                <h2 style="font-size: 12px; font-weight: 800; letter-spacing: 2px; color: rgba(255,255,255,0.4); margin-bottom: 12px; text-transform: uppercase;">⏳ RECENT ACCESS LOGS</h2>
                <div id="recentGamesContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;"></div>
            </div>

            <div class="category-block" style="margin-bottom: 25px;">
                <h2 style="font-size: 12px; font-weight: 800; letter-spacing: 2px; color: #00D4FF; margin-bottom: 12px; text-transform: uppercase; border-left: 3px solid #00D4FF; padding-left: 8px;">🌐 REAL-TIME QUANTUM MULTIPLAYER</h2>
                
                <div style="display: flex; gap: 10px; margin-bottom: 15px; background:rgba(255,255,255,0.02); padding:12px; border-radius:14px; border:1px solid rgba(255,255,255,0.05);">
                    <input id="directRoomCodeInput" type="text" placeholder="ENTER 4-DIGIT CODE..." style="flex:1; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 15px; color:#fff; font-family:monospace; font-weight:800; letter-spacing:2px; outline:none;">
                    <button onclick="joinMultiplayerRoom(document.getElementById('directRoomCodeInput').value)" style="background:#00D4FF; color:#000; font-weight:800; border:none; padding:0 25px; border-radius:10px; cursor:pointer; font-size:12px; font-family:'Poppins', sans-serif;">JOIN DEPLOYMENT</button>
                </div>

                <div class="game-grid-cluster" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;">
                    <div onclick="createMultiplayerRoom('chess', 2)" style="cursor:pointer; background:rgba(255,255,255,0.015); border:1px solid rgba(255,255,255,0.05); padding:15px; border-radius:14px; transition:0.2s;" class="premium-game-card">
                        <div style="display:flex; align-items:center; gap:14px">
                            <div style="font-size:32px; filter: drop-shadow(0 0 8px #ffffff40);">👑</div>
                            <div style="text-align:left; flex:1">
                                <h3 style="color:#fff; font-size:14px; margin:0; font-weight:800;">Quantum Chess</h3>
                                <p style="color:rgba(255,255,255,0.4); font-size:10px; margin:2px 0 0;">Max 2 Players | Grandmaster Protocol</p>
                            </div>
                        </div>
                    </div>
                    <div onclick="createMultiplayerRoom('ludo', 4)" style="cursor:pointer; background:rgba(255,255,255,0.015); border:1px solid rgba(255,255,255,0.05); padding:15px; border-radius:14px; transition:0.2s;" class="premium-game-card">
                        <div style="display:flex; align-items:center; gap:14px">
                            <div style="font-size:32px; filter: drop-shadow(0 0 8px #00f5d440);">🎲</div>
                            <div style="text-align:left; flex:1">
                                <h3 style="color:#00f5d4; font-size:14px; margin:0; font-weight:800;">Chrono Ludo</h3>
                                <p style="color:rgba(255,255,255,0.4); font-size:10px; margin:2px 0 0;">Max 4 Players | Spatial Dice Overlord</p>
                            </div>
                        </div>
                    </div>
                    <div onclick="createMultiplayerRoom('uno', 4)" style="cursor:pointer; background:rgba(255,255,255,0.015); border:1px solid rgba(255,255,255,0.05); padding:15px; border-radius:14px; transition:0.2s;" class="premium-game-card">
                        <div style="display:flex; align-items:center; gap:14px">
                            <div style="font-size:32px; filter: drop-shadow(0 0 8px #ff006e40);">🃏</div>
                            <div style="text-align:left; flex:1">
                                <h3 style="color:#ff006e; font-size:14px; margin:0; font-weight:800;">Neon Uno Matrix</h3>
                                <p style="color:rgba(255,255,255,0.4); font-size:10px; margin:2px 0 0;">Max 4 Players | Card Intercept Deck</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="categorizedGamesSection">
                <div class="category-block" style="margin-bottom: 25px;">
                    <h2 style="font-size: 12px; font-weight: 800; letter-spacing: 2px; color: #8B5CF6; margin-bottom: 12px; text-transform: uppercase; border-left: 3px solid #8B5CF6; padding-left: 8px;">⚡ ACTION CHANNELS</h2>
                    <div class="game-grid-cluster" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;">
                        ${injectCardEngine("🥷","Cyber Ninja","Endless Runner Run Matrix","+40 XP","#8B5CF6","cyberninja")}
                        ${injectCardEngine("🚀","Space Shooter","Quantum Space Destroyer","+50 XP","#00D4FF","spaceshooter")}
                        ${injectCardEngine("🎯","Aim Trainer Pro","Grid Target Acquisition","+30 XP","#FF4757","aimtrainer")}
                        ${injectCardEngine("🏎️","Neon Drift","Hyper-Kinetic Premium Racer","+50 XP","#FF9F43","neondrift")}
                    </div>
                </div>

                <div class="category-block" style="margin-bottom: 25px;">
                    <h2 style="font-size: 12px; font-weight: 800; letter-spacing: 2px; color: #00D4FF; margin-bottom: 12px; text-transform: uppercase; border-left: 3px solid #00D4FF; padding-left: 8px;">🕹️ ARCADE PORTS</h2>
                    <div class="game-grid-cluster" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;">
                        ${injectCardEngine("🧱","Brick Breaker","Reflective Vector Shield","+30 XP","#FF6B81","brickbreaker")}
                        ${injectCardEngine("🏓","Pong","High-Voltage Laser Pong Matrix","+35 XP","#00D4FF","pong")}
                        ${injectCardEngine("🐦","Flappy Bird","Plasma Thrust Grav Infiltrator","+20 XP","#FF6B81","flappy")}
                    </div>
                </div>

                <div class="category-block" style="margin-bottom: 25px;">
                    <h2 style="font-size: 12px; font-weight: 800; letter-spacing: 2px; color: #2ED573; margin-bottom: 12px; text-transform: uppercase; border-left: 3px solid #2ED573; padding-left: 8px;">🧠 COGNITIVE MATRIX</h2>
                    <div class="game-grid-cluster" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;">
                        ${injectCardEngine("❌","Tic Tac Toe","Neural Minimax AI Overlord","+25 XP","#D4AF37","tictactoe")}
                        ${injectCardEngine("🧠","Memory Match","Synapse Grid Recall","+20 XP","#2ED573","memorymatch")}
                        ${injectCardEngine("⚡","Reaction Master","Reflex Latency Trigger","+20 XP","#FFD700","reactionmaster")}
                    </div>
                </div>
            </div>
        </div>

        <style>
            .premium-game-card { position: relative; overflow: hidden; z-index: 1; transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }
            .premium-game-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.6), 0 0 12px var(--glow-color, rgba(255,255,255,0.1)); border-color: var(--glow-border, #fff) !important; background: rgba(255,255,255,0.05) !important; }
            .premium-hover-node:hover { transform: scale(1.01); box-shadow: 0 15px 30px rgba(0,212,255,0.4); }
            #gameSearchInput:focus { border-color: #00D4FF !important; background: rgba(255,255,255,0.06) !important; box-shadow: 0 0 15px rgba(0,212,255,0.25), inset 0 2px 8px rgba(0,0,0,0.5) !important; }
        </style>
    `;

    renderRecentGamesQueue();
}

// Global Meta Register Database (Cleaned)
const GAME_DATABASE_RECORDS = {
    cyberninja: { icon: "🥷", title: "Cyber Ninja", desc: "Endless Runner Run Matrix", xp: "+40 XP", color: "#8B5CF6" },
    spaceshooter: { icon: "🚀", title: "Space Shooter", desc: "Quantum Space Destroyer", xp: "+50 XP", color: "#00D4FF" },
    aimtrainer: { icon: "🎯", title: "Aim Trainer Pro", desc: "Grid Target Acquisition", xp: "+30 XP", color: "#FF4757" },
    neondrift: { icon: "🏎️", title: "Neon Drift", desc: "Hyper-Kinetic Premium Racer", xp: "+50 XP", color: "#FF9F43" },
    brickbreaker: { icon: "🧱", title: "Brick Breaker", desc: "Reflective Vector Shield", xp: "+30 XP", color: "#FF6B81" },
    pong: { icon: "🏓", title: "Pong", desc: "High-Voltage Laser Pong Matrix", xp: "+35 XP", color: "#00D4FF" },
    flappy: { icon: "🐦", title: "Flappy Bird", desc: "Plasma Thrust Grav Infiltrator", xp: "+20 XP", color: "#FF6B81" },
    tictactoe: { icon: "❌", title: "Tic Tac Toe", desc: "Neural Minimax AI Overlord", xp: "+25 XP", color: "#D4AF37" },
    memorymatch: { icon: "🧠", title: "Memory Match", desc: "Synapse Grid Recall", xp: "+20 XP", color: "#2ED573" },
    reactionmaster: { icon: "⚡", title: "Reaction Master", desc: "Reflex Latency Trigger", xp: "+20 XP", color: "#FFD700" }
};

function injectCardEngine(icon, title, desc, xp, color, id) {
    return `
        <div class="premium-game-card" data-game-title="${title.toLowerCase()}" onclick="safeStart('${id}')" style="cursor:pointer; background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 14px; --glow-color: rgba(${utilHexToRgb(color)}, 0.12); --glow-border: ${color};">
            <div style="display:flex; align-items:center; gap:14px">
                <div style="font-size:32px; filter: drop-shadow(0 0 8px ${color}40);">${icon}</div>
                <div style="text-align:left; flex:1">
                    <h3 style="color:${color}; font-size:14px; margin:0; font-weight:800;">${title}</h3>
                    <p style="color:rgba(255,255,255,0.4); font-size:10px; margin:2px 0 0; font-weight:500;">${desc}</p>
                </div>
                <span style="color:#FFD700; font-size:9px; font-weight:700; background:rgba(255,215,0,0.06); padding:3px 6px; border-radius:6px; border:1px solid rgba(255,215,0,0.1); font-family: monospace;">${xp}</span>
            </div>
        </div>
    `;
}

function renderRecentGamesQueue() {
    const container = document.getElementById('recentGamesContainer');
    const recentSection = document.getElementById('recentlyPlayedSection');
    if (!container) return;

    let queue = JSON.parse(localStorage.getItem('recentlyPlayedGames')) || [];
    queue = queue.filter(id => GAME_DATABASE_RECORDS[id]); // Filter out removed games
    
    if (queue.length === 0) {
        recentSection.style.display = 'none';
        return;
    }

    recentSection.style.display = 'block';
    container.innerHTML = queue.map(id => {
        let meta = GAME_DATABASE_RECORDS[id];
        if (!meta) return '';
        return injectCardEngine(meta.icon, meta.title, meta.desc, meta.xp, meta.color, id);
    }).join('');
}

function filterHubGames() {
    let query = document.getElementById('gameSearchInput').value.toLowerCase();
    let cards = document.querySelectorAll('.premium-game-card');
    cards.forEach(card => {
        let title = card.getAttribute('data-game-title');
        if(title) card.style.display = title.includes(query) ? 'block' : 'none';
    });
    let blocks = document.querySelectorAll('.category-block');
    blocks.forEach(block => {
        let hasVisible = Array.from(block.querySelectorAll('.premium-game-card')).some(c => c.style.display !== 'none');
        block.style.display = hasVisible ? 'block' : 'none';
    });
}

function updateRecentQueue(id) {
    if (!GAME_DATABASE_RECORDS[id]) return;
    let queue = JSON.parse(localStorage.getItem('recentlyPlayedGames')) || [];
    queue = queue.filter(x => x !== id);
    queue.unshift(id);
    if (queue.length > 3) queue.pop();
    localStorage.setItem('recentlyPlayedGames', JSON.stringify(queue));
}

function safeStart(name) {
    try {
        updateRecentQueue(name);
        interceptAndHookGameOver(name);

        if (name === 'tictactoe' && typeof startTicTacToe === 'function') startTicTacToe();
        else if (name === 'tictactoe' && typeof startTTT === 'function') startTTT();
        else if (name === 'pong' && typeof startPongGame === 'function') startPongGame();
        else if (name === 'pong' && typeof startPong === 'function') startPong();
        else if (name === 'flappy' && typeof startFlappyBird === 'function') startFlappyBird();
        else if (name === 'flappy' && typeof startFlappy === 'function') startFlappy();
        else if (name === 'cyberninja' && typeof startCyberNinja === 'function') startCyberNinja();
        else if (name === 'aimtrainer' && typeof startAimTrainer === 'function') startAimTrainer();
        else if (name === 'brickbreaker' && typeof startBrickBreaker === 'function') startBrickBreaker();
        else if (name === 'spaceshooter' && typeof startSpaceShooter === 'function') startSpaceShooter();
        else if (name === 'memorymatch' && typeof startMemoryMatch === 'function') startMemoryMatch();
        else if (name === 'reactionmaster' && typeof startReactionMaster === 'function') startReactionMaster();
        else if (name === 'neondrift' && typeof startNeonDrift === 'function') startNeonDrift();
        else {
            if (typeof showToast === 'function') showToast('Loading segment...');
        }
    } catch (e) {
        console.error(e);
    }
}

function interceptAndHookGameOver(gameId) {
    setTimeout(() => {
        if (typeof window.endGame === 'function' && !window.endGame.hooked) {
            let originalEndGame = window.endGame;
            window.endGame = function(winner) {
                if (winner === 'human' || winner === 'player' || winner === true) rewardChronoxXP('win', gameId);
                else if (winner === 'ai' || winner === 'computer' || winner === false) rewardChronoxXP('lose', gameId);
                else rewardChronoxXP('draw', gameId);
                originalEndGame.apply(this, arguments);
            };
            window.endGame.hooked = true;
        }
    }, 400);
}

function utilHexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    let num = parseInt(hex, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

window.openGames = openChronoxGamesHub;

// =================================================================
// REALTIME MULTIPLAYER LOBBY SUB-ROUTER
// =================================================================
let currentRoomId = null;
let currentMultiplayerGame = null;
let roomListenerRef = null;

function createMultiplayerRoom(gameId, maxPlayers) {
    if (typeof firebase === 'undefined') {
        if (typeof showToast === 'function') showToast('❌ Firebase pipeline offline!');
        return;
    }
    const user = firebase.auth().currentUser;
    if (!user) {
        if (typeof showToast === 'function') showToast('🔑 Auth session not found.');
        return;
    }

    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    currentRoomId = roomId;
    currentMultiplayerGame = gameId;

    const roomRef = firebase.database().ref(`rooms/${roomId}`);
    const roomData = {
        gameId: gameId,
        maxPlayers: maxPlayers,
        status: 'waiting',
        hostId: user.uid,
        players: {
            [user.uid]: {
                name: user.displayName || "Operator One",
                icon: "🎮",
                joinedAt: Date.now()
            }
        },
        gameState: {}
    };

    roomRef.set(roomData).then(() => {
        renderMultiplayerLobbyUI(roomId, gameId, maxPlayers, true);
        listenToRoomUpdates(roomId);
    }).catch(err => console.error(err));
}

function joinMultiplayerRoom(roomId) {
    if (!roomId) return;
    roomId = roomId.trim().toUpperCase();
    const user = firebase.auth().currentUser;
    if (!user || typeof firebase === 'undefined') return;

    const roomRef = firebase.database().ref(`rooms/${roomId}`);
    roomRef.once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            if (typeof showToast === 'function') showToast('❌ Invalid Room Code.');
            return;
        }
        const room = snapshot.val();
        const playerKeys = Object.keys(room.players || {});

        if (playerKeys.length >= room.maxPlayers) {
            if (typeof showToast === 'function') showToast('🚫 Room Full!');
            return;
        }

        roomRef.child(`players/${user.uid}`).set({
            name: user.displayName || "Operator Two",
            icon: "⚡",
            joinedAt: Date.now()
        }).then(() => {
            currentRoomId = roomId;
            currentMultiplayerGame = room.gameId;
            renderMultiplayerLobbyUI(roomId, room.gameId, room.maxPlayers, false);
            listenToRoomUpdates(roomId);
        });
    });
}

function listenToRoomUpdates(roomId) {
    if (roomListenerRef) roomListenerRef.off(); // Clean active listener
    roomListenerRef = firebase.database().ref(`rooms/${roomId}`);
    
    roomListenerRef.on('value', (snapshot) => {
        if (!snapshot.exists()) return;
        const room = snapshot.val();
        
        // Prevent UI re-renders if game is already up and running
        if (room.status === 'active') {
            roomListenerRef.off(); // Turn off lobby updates listener
            bootMultiplayerGameEngine(room.gameId, roomId);
            return;
        }
        updateLobbyPlayersList(room.players, room.maxPlayers);
    });
}

function renderMultiplayerLobbyUI(roomId, gameId, maxPlayers, isHost) {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div style="padding: 20px; background: radial-gradient(circle at top, #140b36 0%, #03020a 100%); min-height: calc(100vh - 70px); font-family: 'Poppins', sans-serif; color: #fff; display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 24px; padding: 30px; width:100%; max-width:450px; text-align:center; box-shadow: 0 25px 50px rgba(0,0,0,0.6); backdrop-filter:blur(15px);">
                <span style="font-size:10px; color:#00D4FF; letter-spacing:3px; display:block; font-weight:800;">MULTIPLAYER LOBBY</span>
                <h2 style="margin:10px 0; font-size:26px; font-weight:900; text-transform:uppercase;">${gameId} MATRIX</h2>
                
                <div style="background:rgba(0,0,0,0.4); border:1px dashed rgba(255,255,255,0.1); padding:15px; border-radius:16px; margin:20px 0;">
                    <span style="font-size:10px; color:rgba(255,255,255,0.4); display:block; font-weight:700;">SHARE ROOM CODE</span>
                    <span style="font-size:36px; font-weight:900; color:#00D4FF; letter-spacing:4px; text-shadow:0 0 15px rgba(0,212,255,0.4); font-family:monospace;">${roomId}</span>
                </div>

                <div style="text-align:left; margin-bottom:25px;">
                    <span style="font-size:11px; color:rgba(255,255,255,0.5); font-weight:700; display:block; margin-bottom:10px;">CONNECTED CHANNELS:</span>
                    <div id="lobbyPlayersContainer" style="display:flex; flex-direction:column; gap:10px;"></div>
                </div>

                ${isHost ? `
                    <button onclick="triggerGameStart('${roomId}')" style="width:100%; background:linear-gradient(135deg, #00D4FF, #8B5CF6); border:none; color:#fff; font-weight:800; padding:14px; border-radius:14px; cursor:pointer; font-size:14px; letter-spacing:1px; font-family:'Poppins'; box-shadow:0 10px 20px rgba(139,92,246,0.3);">START SYSTEM</button>
                ` : `
                    <div style="font-size:12px; color:rgba(255,255,255,0.4); font-style:italic;">Awaiting host execution parameters...</div>
                `}
            </div>
        </div>
    `;
}

function updateLobbyPlayersList(players, maxPlayers) {
    const container = document.getElementById('lobbyPlayersContainer');
    if (!container) return;

    let html = '';
    const currentKeys = Object.keys(players || {});
    for (let i = 0; i < maxPlayers; i++) {
        if (i < currentKeys.length) {
            let p = players[currentKeys[i]];
            html += `
                <div style="display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); padding:10px 15px; border-radius:12px;">
                    <div style="font-size:20px;">${p.icon || '⚡'}</div>
                    <div style="font-weight:700; font-size:13px; color:#fff; flex:1;">${p.name}</div>
                    <span style="color:#2ed573; font-size:9px; font-weight:800; background:rgba(46,213,115,0.1); padding:3px 8px; border-radius:6px;">READY</span>
                </div>
            `;
        } else {
            html += `
                <div style="display:flex; align-items:center; gap:12px; background:rgba(0,0,0,0.2); border:1px dashed rgba(255,255,255,0.05); padding:10px 15px; border-radius:12px; opacity:0.5;">
                    <div style="font-size:18px; color:rgba(255,255,255,0.3);">⏳</div>
                    <div style="font-weight:600; font-size:13px; color:rgba(255,255,255,0.3);">Awaiting connection...</div>
                </div>
            `;
        }
    }
    container.innerHTML = html;
}

function triggerGameStart(roomId) {
    firebase.database().ref(`rooms/${roomId}`).update({ status: 'active' });
}

// FIX: Clean clear area completely before injection to fix routing bug 
// Apne games-main.js ke bootMultiplayerGameEngine mein ye add kar:
function bootMultiplayerGameEngine(gameId, roomId) {
    const c = document.getElementById('contentArea');
    c.innerHTML = '<div id="gameCanvas" style="width:100%; height:100vh;"></div>';
    
    // Check agar roomId 'BOT' hai toh Bot mode chalao
    if (roomId === 'BOT') {
        if (gameId === 'chess') startChessVsBot();
        else if (gameId === 'uno') startUnoVsBot();
        else if (gameId === 'ludo') startLudoVsBot();
    } else {
        // Multi-player logic
        if (gameId === 'chess') startMultiplayerChess(roomId);
        else if (gameId === 'ludo') startMultiplayerLudo(roomId);
        else if (gameId === 'uno') startMultiplayerUno(roomId);
    }
}

    c.innerHTML = ''; // Wipe UI clean of lobby interface remnants

    if (gameId === 'chess' && typeof startMultiplayerChess === 'function') startMultiplayerChess(roomId);
    else if (gameId === 'ludo' && typeof startMultiplayerLudo === 'function') startMultiplayerLudo(roomId);
    else if (gameId === 'uno' && typeof startMultiplayerUno === 'function') startMultiplayerUno(roomId);
    else {
        if (typeof showToast === 'function') showToast('❌ Target game canvas module mismatch.');
    }
}

// =================================================================
// CHRONOX NEURAL REWARD ENGINE
// =================================================================
function rewardChronoxXP(result, gameId) {
    let xpEarned = 0;
    if (result === 'win') xpEarned = 25;
    else if (result === 'draw') xpEarned = 10;

    if (xpEarned <= 0) return;

    if (typeof firebase !== 'undefined' && firebase.auth && firebase.firestore) {
        const user = firebase.auth().currentUser;
        if (user) {
            const userRef = firebase.firestore().collection('users').doc(user.uid);
            userRef.update({ xp: firebase.firestore.FieldValue.increment(xpEarned) })
            .then(() => {
                if (typeof showToast === 'function') showToast(`⚡ +${xpEarned} XP Secured!`);
            }).catch(e => console.error(e));
        } else { fallbackLocalXPAccumulator(xpEarned); }
    } else { fallbackLocalXPAccumulator(xpEarned); }
}

function fallbackLocalXPAccumulator(amount) {
    let currentLocalXP = parseInt(localStorage.getItem('chronox_sandbox_xp')) || 0;
    currentLocalXP += amount;
    localStorage.setItem('chronox_sandbox_xp', currentLocalXP);
}
