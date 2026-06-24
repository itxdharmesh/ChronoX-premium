// js/games/ludo.js

function startMultiplayerLudo(roomId) {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div style="padding: 15px; background: #050312; min-height: calc(100vh - 70px); font-family: 'Poppins', sans-serif; color: #fff; display:flex; flex-direction:column; align-items:center;">
            <div style="width:100%; max-width:420px; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:rgba(255,255,255,0.02); padding:8px 15px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                <div><span style="font-size:10px; color:#00f5d4; font-weight:800;">ROOM</span><br><span style="font-family:monospace; font-weight:900; color:#fff;">${roomId}</span></div>
                <div id="ludoTurnIndicator" style="font-size:12px; font-weight:800; color:#ff006e; text-transform:uppercase; background:rgba(255,0,110,0.1); padding:4px 12px; border-radius:20px;">SYNCING SYSTEM...</div>
            </div>

            <div style="position:relative; background:#111; border:3px solid rgba(0,245,212,0.2); border-radius:16px; overflow:hidden; width:100%; max-width:380px; aspect-ratio:1;">
                <canvas id="ludoCanvas" width="380" height="380" style="display:block; width:100%; height:100%;"></canvas>
            </div>

            <div style="width:100%; max-width:420px; margin-top:15px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:15px; text-align:center; box-sizing:border-box;">
                <div style="display:flex; justify-content:center; align-items:center; gap:20px; margin-bottom:12px;">
                    <div id="ludoDiceDisplay" style="font-size:42px; width:60px; height:60px; line-height:60px; background:rgba(255,255,255,0.05); border-radius:12px; border:1px solid rgba(255,255,255,0.1); box-shadow:0 0 15px rgba(0,245,212,0.1);">🎲</div>
                    <button id="ludoRollBtn" disabled style="background:linear-gradient(135deg, #00f5d4, #7b2cbf); border:none; color:#000; font-weight:900; padding:12px 30px; border-radius:12px; cursor:pointer; font-size:13px; letter-spacing:1px; text-transform:uppercase;">ROLL DICE</button>
                </div>
                <div id="ludoStatusLog" style="font-size:11px; color:rgba(255,255,255,0.5);">Awaiting turn validations...</div>
            </div>
        </div>
    `;

    const canvas = document.getElementById('ludoCanvas');
    const ctx = canvas.getContext('2d');
    const turnIndicator = document.getElementById('ludoTurnIndicator');
    const diceDisplay = document.getElementById('ludoDiceDisplay');
    const rollBtn = document.getElementById('ludoRollBtn');
    const statusLog = document.getElementById('ludoStatusLog');

    const roomRef = firebase.database().ref(`rooms/${roomId}`);
    const user = firebase.auth().currentUser;

    let localGameState = { turnIdx: 0, diceValue: 1, positions: { p0: 0, p1: 0, p2: 0, p3: 0 } };
    let playerOrder = [];

    // Ludo Engine Colors Array
    const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502'];

    // Real-Time Listener
    roomRef.on('value', (snapshot) => {
        if (!snapshot.exists()) return;
        const room = snapshot.val();
        playerOrder = Object.keys(room.players || {}).sort();
        
        if (room.gameState && room.gameState.positions) {
            localGameState = room.gameState;
        } else {
            // First boot init
            localGameState.positions = {};
            playerOrder.forEach((uid, index) => { localGameState.positions[uid] = 0; });
            roomRef.child('gameState').set(localGameState);
        }

        renderLudoBoard();
        updateTurnControls();
    });

    function updateTurnControls() {
        let activeUid = playerOrder[localGameState.turnIdx];
        if (!activeUid) return;

        if (activeUid === user.uid) {
            turnIndicator.innerText = "YOUR TURN";
            turnIndicator.style.color = "#00f5d4";
            turnIndicator.style.background = "rgba(0,245,212,0.1)";
            rollBtn.disabled = false;
            statusLog.innerText = "Select parameters to trigger token shifting matrix.";
        } else {
            turnIndicator.innerText = "WAITING FOR OPPONENT";
            turnIndicator.style.color = "#ff006e";
            turnIndicator.style.background = "rgba(255,0,110,0.1)";
            rollBtn.disabled = true;
            statusLog.innerText = `Awaiting network processing nodes...`;
        }
        
        const diceEmojis = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        diceDisplay.innerText = diceEmojis[localGameState.diceValue] || '🎲';
    }

    rollBtn.onclick = () => {
        rollBtn.disabled = true;
        let roll = Math.floor(Math.random() * 6) + 1;
        localGameState.diceValue = roll;
        
        // Update token path position instantly
        localGameState.positions[user.uid] = (localGameState.positions[user.uid] || 0) + roll;
        if (localGameState.positions[user.uid] > 57) localGameState.positions[user.uid] = 57; // Caps limits

        // Shift index round-robin
        localGameState.turnIdx = (localGameState.turnIdx + 1) % playerOrder.length;
        
        roomRef.child('gameState').set(localGameState).then(() => {
            if (localGameState.positions[user.uid] === 57) {
                if (typeof window.handleGameOver === 'function') window.handleGameOver(true);
            }
        });
    };

    function renderLudoBoard() {
        ctx.fillStyle = '#0f0a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let size = canvas.width / 15;
        // Draw Homes (Subtle Premium Aesthetics representation)
        ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, size*6, size*6);
        ctx.fillStyle = colors[1]; ctx.fillRect(size*9, 0, size*6, size*6);
        ctx.fillStyle = colors[2]; ctx.fillRect(0, size*9, size*6, size*6);
        ctx.fillStyle = colors[3]; ctx.fillRect(size*9, size*9, size*6, size*6);

        // Render Center Node Area
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(size*6, size*6, size*3, size*3);

        // Drawing active player vectors blocks dynamically
        playerOrder.forEach((uid, index) => {
            ctx.fillStyle = colors[index % 4];
            ctx.shadowBlur = 10; ctx.shadowColor = colors[index % 4];
            
            // Render basic dynamic visual track movement path offset offsets
            let pVal = localGameState.positions[uid] || 0;
            let targetX = size * 2 + (index * 30);
            let targetY = size * 2 + (pVal * 4);
            if (targetY > canvas.height - 40) targetY = canvas.height - 40;

            ctx.beginPath();
            ctx.arc(targetX, targetY, size/2, 0, Math.PI*2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
    }
}
