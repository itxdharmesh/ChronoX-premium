// js/games/games-main.js - FINAL INTEGRATED SYSTEM (All Games Restored)

// 1. MAIN HUB (Landing)
function openChronoxGamesHub() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div style="padding: 20px; background: #03020a; min-height: 100vh; font-family: 'Poppins', sans-serif; color: white;">
            <h1 style="text-align: center; color: #D4AF37; margin-bottom: 25px;">🎮 CHRONOX GAMES HUB</h1>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <button onclick="renderMultiplayerSection()" style="padding: 15px; background: #8B5CF6; border: none; border-radius: 12px; color: white; font-weight: 800; cursor: pointer;">🌐 MULTIPLAYER</button>
                <button onclick="renderArcadeSection()" style="padding: 15px; background: #00D4FF; border: none; border-radius: 12px; color: black; font-weight: 800; cursor: pointer;">🕹️ ARCADE</button>
            </div>
            <div id="subSectionContent" style="padding: 10px;">
                <p style="text-align:center; color:#666;">Choose a terminal to begin operation.</p>
            </div>
        </div>
    `;
}

// 2. MULTIPLAYER SECTION
function renderMultiplayerSection() {
    document.getElementById('subSectionContent').innerHTML = `
        <h2 style="color:#8B5CF6; font-size:16px; margin-bottom:15px;">🌐 QUANTUM MULTIPLAYER</h2>
        <div style="margin-bottom:20px; background:#111; padding:15px; border-radius:10px;">
            <input id="roomInput" placeholder="ENTER 4-DIGIT CODE..." style="width:100%; padding:10px; background:#000; color:#fff; border:1px solid #333; border-radius:5px; box-sizing:border-box;">
            <button onclick="joinMultiplayerRoom(document.getElementById('roomInput').value)" style="width:100%; margin-top:10px; padding:10px; background:#8B5CF6; border:none; color:white; border-radius:5px;">JOIN DEPLOYMENT</button>
        </div>
        <div style="display:grid; gap:10px;">
            <button onclick="createMultiplayerRoom('chess', 2)" style="padding:15px; background:#222; border:1px solid #333; color:white; border-radius:8px;">👑 Quantum Chess</button>
            <button onclick="createMultiplayerRoom('ludo', 4)" style="padding:15px; background:#222; border:1px solid #333; color:#00f5d4; border-radius:8px;">🎲 Chrono Ludo</button>
            <button onclick="createMultiplayerRoom('uno', 4)" style="padding:15px; background:#222; border:1px solid #333; color:#ff006e; border-radius:8px;">🃏 Neon Uno Matrix</button>
        </div>
    `;
}

// 3. ARCADE SECTION (All Games Restored)
function renderArcadeSection() {
    document.getElementById('subSectionContent').innerHTML = `
        <h2 style="color:#00D4FF; font-size:16px; margin-bottom:15px;">🕹️ ARCADE TERMINAL</h2>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            ${arcBtn('🚀', 'Space Shooter', 'spaceshooter')}
            ${arcBtn('🥷', 'Cyber Ninja', 'cyberninja')}
            ${arcBtn('🎯', 'Aim Trainer', 'aimtrainer')}
            ${arcBtn('🏎️', 'Neon Drift', 'neondrift')}
            ${arcBtn('🧱', 'Brick Break', 'brickbreaker')}
            ${arcBtn('🏓', 'Pong', 'pong')}
            ${arcBtn('🐦', 'Flappy Bird', 'flappy')}
            ${arcBtn('❌', 'Tic Tac Toe', 'tictactoe')}
            ${arcBtn('🧠', 'Memory Match', 'memorymatch')}
            ${arcBtn('⚡', 'Reaction', 'reactionmaster')}
        </div>
    `;
}

function arcBtn(icon, name, id) {
    return `<button onclick="safeStart('${id}')" style="padding:12px; background:#1a1a1a; border:1px solid #333; color:white; border-radius:8px; font-size:12px;">${icon} ${name}</button>`;
}

// 4. MULTIPLAYER LOGIC
window.createMultiplayerRoom = function(gameId, maxPlayers) {
    if(typeof firebase === 'undefined') { alert("Firebase not loaded"); return; }
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    firebase.database().ref('rooms/'+roomId).set({
        gameId, status: 'waiting', players: { [firebase.auth().currentUser.uid]: { name: "Host", icon: "🎮" } }
    }).then(() => {
        renderMultiplayerLobbyUI(roomId, gameId, true);
        listenToRoomUpdates(roomId);
    });
};

window.joinMultiplayerRoom = function(roomId) {
    roomId = roomId.trim().toUpperCase();
    firebase.database().ref('rooms/'+roomId).once('value').then(snap => {
        if(!snap.exists()) { alert("Invalid Room!"); return; }
        renderMultiplayerLobbyUI(roomId, snap.val().gameId, false);
        listenToRoomUpdates(roomId);
    });
};

function renderMultiplayerLobbyUI(roomId, gameId, isHost) {
    document.getElementById('contentArea').innerHTML = `
        <div style="padding:50px; text-align:center; color:white; background:#03020a; min-height:100vh;">
            <h2>Room: ${roomId}</h2>
            <div id="lobbyPlayers">Waiting for players...</div>
            ${isHost ? `<button onclick="firebase.database().ref('rooms/${roomId}').update({status:'active'})" style="padding:15px; background:green; color:white; border:none; border-radius:10px; cursor:pointer;">START GAME</button>` : ''}
        </div>
    `;
}

function listenToRoomUpdates(roomId) {
    firebase.database().ref('rooms/'+roomId).on('value', snap => {
        if(snap.val()?.status === 'active') bootMultiplayerGameEngine(snap.val().gameId, roomId);
    });
}

function bootMultiplayerGameEngine(gameId, roomId) {
    document.getElementById('contentArea').innerHTML = "";
    if(gameId === 'ludo') startMultiplayerLudo(roomId);
    else if(gameId === 'uno') startMultiplayerUno(roomId);
    else if(gameId === 'chess') startMultiplayerChess(roomId);
}

// 5. ARCADE START LOGIC
function safeStart(name) {
    if(name === 'spaceshooter') startSpaceShooter();
    else if(name === 'cyberninja') startCyberNinja();
    else if(name === 'pong') startPong();
    else if(name === 'brickbreaker') startBrickBreaker();
    else if(name === 'flappy') startFlappyBird();
    else if(name === 'tictactoe') startTicTacToe();
    else if(name === 'memorymatch') startMemoryMatch();
    else if(name === 'reactionmaster') startReactionMaster();
    else if(name === 'aimtrainer') startAimTrainer();
    else if(name === 'neondrift') startNeonDrift();
}
