// js/games/games-main.js

if (!localStorage.getItem('recentlyPlayedGames')) {
    localStorage.setItem('recentlyPlayedGames', JSON.stringify(['spaceshooter', 'neondrift']));
}

function openChronoxGamesHub() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div id="gamesHubWrapper" style="padding: 20px; background: radial-gradient(circle at top, #0f0a2a 0%, #03020a 100%); min-height: calc(100vh - 70px); font-family: 'Poppins', sans-serif; color: #ffffff; user-select:none; -webkit-user-select:none; overflow-y:auto; padding-bottom:90px;">
            
            <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(124, 58, 237, 0.05) 100%); border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 24px; padding: 22px; position: relative; overflow: hidden; box-shadow: 0 20px 45px rgba(0,0,0,0.6); margin-bottom: 25px; backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);">
                <div style="position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; background: rgba(212, 175, 55, 0.1); border-radius: 50%; filter: blur(35px); pointer-events: none;"></div>
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <span style="font-size: 9px; color: #D4AF37; letter-spacing: 4px; font-weight: 800; text-transform: uppercase; display:block;">QUANTUM CORE SYSTEM</span>
                        <h1 style="margin: 4px 0 0; font-size: 28px; font-weight: 900;">🎮 GAMES HUB</h1>
                    </div>
                </div>
            </div>

            <div class="category-block">
                <h2>🔥 TARGET RECOM SYSTEMS</h2>
                <div onclick="safeStart('spaceshooter')" style="cursor:pointer;">
                    Space Shooter Pro
                </div>
            </div>

            <div id="recentlyPlayedSection">
                <h2>RECENT</h2>
                <div id="recentGamesContainer"></div>
            </div>

            <div>
                <div onclick="createMultiplayerRoom('chess', 2)">Chess</div>
                <div onclick="createMultiplayerRoom('ludo', 4)">Ludo</div>
                <div onclick="createMultiplayerRoom('uno', 4)">UNO</div>

                <input id="directRoomCodeInput" type="text" />
                <button onclick="joinMultiplayerRoom(document.getElementById('directRoomCodeInput').value)">Join</button>
            </div>
        </div>
    `;

    renderRecentGamesQueue();
}

// ---------------- GAME DB ----------------

const GAME_DATABASE_RECORDS = {
    cyberninja: { icon: "🥷", title: "Cyber Ninja", desc: "Endless Runner", xp: "+40 XP", color: "#8B5CF6" },
    spaceshooter: { icon: "🚀", title: "Space Shooter", desc: "Quantum Shooter", xp: "+50 XP", color: "#00D4FF" },
    aimtrainer: { icon: "🎯", title: "Aim Trainer Pro", desc: "Grid Target", xp: "+30 XP", color: "#FF4757" },
    neondrift: { icon: "🏎️", title: "Neon Drift", desc: "Racing", xp: "+50 XP", color: "#FF9F43" },
    brickbreaker: { icon: "🧱", title: "Brick Breaker", desc: "Classic", xp: "+30 XP", color: "#FF6B81" },
    pong: { icon: "🏓", title: "Pong", desc: "Classic", xp: "+35 XP", color: "#00D4FF" },
    flappy: { icon: "🐦", title: "Flappy Bird", desc: "Fly", xp: "+20 XP", color: "#FF6B81" },
    tictactoe: { icon: "❌", title: "Tic Tac Toe", desc: "AI Game", xp: "+25 XP", color: "#D4AF37" },
    memorymatch: { icon: "🧠", title: "Memory Match", desc: "Recall", xp: "+20 XP", color: "#2ED573" },
    reactionmaster: { icon: "⚡", title: "Reaction Master", desc: "Reflex", xp: "+20 XP", color: "#FFD700" }
};

function injectCardEngine(icon, title, desc, xp, color, id) {
    return `
        <div onclick="safeStart('${id}')">
            ${icon} ${title}
        </div>
    `;
}

// ---------------- RECENT ----------------

function renderRecentGamesQueue() {
    const container = document.getElementById('recentGamesContainer');
    const recentSection = document.getElementById('recentlyPlayedSection');
    if (!container) return;

    let queue = JSON.parse(localStorage.getItem('recentlyPlayedGames')) || [];
    queue = queue.filter(id => GAME_DATABASE_RECORDS[id]);

    if (queue.length === 0) {
        recentSection.style.display = 'none';
        return;
    }

    recentSection.style.display = 'block';

    container.innerHTML = queue.map(id => {
        let meta = GAME_DATABASE_RECORDS[id];
        if (!meta) return '';
        return `${meta.icon} ${meta.title}`;
    }).join('');
}

function filterHubGames() {
    let query = document.getElementById('gameSearchInput').value.toLowerCase();
    let cards = document.querySelectorAll('[data-game-title]');
    cards.forEach(card => {
        let title = card.getAttribute('data-game-title');
        if (title) card.style.display = title.includes(query) ? 'block' : 'none';
    });
}

// ---------------- SAFE START ----------------

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
        else if (name === 'pong' && typeof startPongGame === 'function') startPongGame();
        else if (name === 'flappy' && typeof startFlappyBird === 'function') startFlappyBird();
        else if (name === 'cyberninja' && typeof startCyberNinja === 'function') startCyberNinja();
        else if (name === 'aimtrainer' && typeof startAimTrainer === 'function') startAimTrainer();
        else if (name === 'brickbreaker' && typeof startBrickBreaker === 'function') startBrickBreaker();
        else if (name === 'spaceshooter' && typeof startSpaceShooter === 'function') startSpaceShooter();
        else if (name === 'memorymatch' && typeof startMemoryMatch === 'function') startMemoryMatch();
        else if (name === 'reactionmaster' && typeof startReactionMaster === 'function') startReactionMaster();
        else if (name === 'neondrift' && typeof startNeonDrift === 'function') startNeonDrift();
        else {
            if (typeof showToast === 'function') showToast('Loading...');
        }
    } catch (e) {
        console.error(e);
    }
}

// ---------------- FIXED MULTIPLAYER ----------------

let currentRoomId = null;
let currentMultiplayerGame = null;
let roomListenerRef = null;

function createMultiplayerRoom(gameId, maxPlayers) {
    if (typeof firebase === 'undefined') return;
    const user = firebase.auth().currentUser;
    if (!user) return;

    const roomId = Date.now().toString(36).slice(-4).toUpperCase();
    currentRoomId = roomId;
    currentMultiplayerGame = gameId;

    const roomRef = firebase.database().ref(`rooms/${roomId}`);

    const roomData = {
        gameId,
        maxPlayers,
        status: 'waiting',
        hostId: user.uid,
        players: {
            [user.uid]: {
                name: user.displayName || "Host",
                icon: "🎮",
                joinedAt: Date.now()
            }
        }
    };

    roomRef.set(roomData).then(() => {
        playerDisconnectHook(roomRef, user.uid);
        renderMultiplayerLobbyUI(roomId, gameId, maxPlayers, true);
        listenToRoomUpdates(roomId);
    });
}

function joinMultiplayerRoom(roomId) {
    if (!roomId) return;
    roomId = roomId.trim().toUpperCase();

    const user = firebase.auth().currentUser;
    if (!user) return;

    const roomRef = firebase.database().ref(`rooms/${roomId}`);

    roomRef.once('value').then(snapshot => {
        if (!snapshot.exists()) return;

        const room = snapshot.val();
        const players = Object.keys(room.players || {});

        if (players.length >= room.maxPlayers) return;

        roomRef.child(`players/${user.uid}`).set({
            name: user.displayName || "Player",
            icon: "⚡",
            joinedAt: Date.now()
        }).then(() => {
            currentRoomId = roomId;
            currentMultiplayerGame = room.gameId;

            playerDisconnectHook(roomRef, user.uid);
            renderMultiplayerLobbyUI(roomId, room.gameId, room.maxPlayers, false);
            listenToRoomUpdates(roomId);
        });
    });
}

function playerDisconnectHook(roomRef, uid) {
    const playerRef = roomRef.child(`players/${uid}`);
    if (playerRef.onDisconnect) {
        playerRef.onDisconnect().remove();
    }
}

function listenToRoomUpdates(roomId) {
    if (roomListenerRef) roomListenerRef.off();

    roomListenerRef = firebase.database().ref(`rooms/${roomId}`);

    roomListenerRef.on('value', snapshot => {
        if (!snapshot.exists()) return;

        const room = snapshot.val();

        if (room.status === 'active') {
            roomListenerRef.off();

            setTimeout(() => {
                bootMultiplayerGameEngine(room.gameId, roomId);
            }, 200);

            return;
        }

        updateLobbyPlayersList(room.players || {}, room.maxPlayers);
    });
}

// ---------------- LOBBY ----------------

function renderMultiplayerLobbyUI(roomId, gameId, maxPlayers, isHost) {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div>
            <h2>${gameId}</h2>
            <h3>${roomId}</h3>
            <div id="lobbyPlayersContainer"></div>

            ${isHost ? `<button onclick="triggerGameStart('${roomId}')">START</button>` : ''}
        </div>
    `;
}

function updateLobbyPlayersList(players, maxPlayers) {
    const container = document.getElementById('lobbyPlayersContainer');
    if (!container) return;

    let keys = Object.keys(players || {});
    let html = '';

    for (let i = 0; i < maxPlayers; i++) {
        if (i < keys.length) {
            let p = players[keys[i]];
            html += `<div>${p.icon} ${p.name}</div>`;
        } else {
            html += `<div>Waiting...</div>`;
        }
    }

    container.innerHTML = html;
}

function triggerGameStart(roomId) {
    const ref = firebase.database().ref(`rooms/${roomId}`);

    ref.once('value').then(snapshot => {
        const room = snapshot.val();
        if (!room) return;

        if (Object.keys(room.players || {}).length < 2) {
            if (typeof showToast === 'function') showToast('Need 2 players');
            return;
        }

        ref.update({ status: 'active' });
    });
}

// ---------------- GAME ENGINE BOOT ----------------

function bootMultiplayerGameEngine(gameId, roomId) {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = '';

    if (gameId === 'chess' && typeof startMultiplayerChess === 'function') startMultiplayerChess(roomId);
    else if (gameId === 'ludo' && typeof startMultiplayerLudo === 'function') startMultiplayerLudo(roomId);
    else if (gameId === 'uno' && typeof startMultiplayerUno === 'function') startMultiplayerUno(roomId);
    else if (typeof showToast === 'function') showToast('Game module missing');
}

// ---------------- XP ENGINE ----------------

function interceptAndHookGameOver(gameId) {
    setTimeout(() => {
        if (typeof window.endGame === 'function' && !window.endGame.hooked) {
            let original = window.endGame;

            window.endGame = function (winner) {
                if (winner === 'human' || winner === true) rewardChronoxXP('win', gameId);
                else if (winner === 'draw') rewardChronoxXP('draw', gameId);
                original.apply(this, arguments);
            };

            window.endGame.hooked = true;
        }
    }, 400);
}

function rewardChronoxXP(result, gameId) {
    let xp = 0;
    if (result === 'win') xp = 25;
    else if (result === 'draw') xp = 10;

    if (!xp) return;

    const user = firebase?.auth?.currentUser;
    if (user && firebase.firestore) {
        firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .update({
                xp: firebase.firestore.FieldValue.increment(xp)
            })
            .catch(() => fallbackLocalXPAccumulator(xp));
    } else {
        fallbackLocalXPAccumulator(xp);
    }
}

function fallbackLocalXPAccumulator(amount) {
    let xp = parseInt(localStorage.getItem('chronox_sandbox_xp')) || 0;
    localStorage.setItem('chronox_sandbox_xp', xp + amount);
}

window.openGames = openChronoxGamesHub;
