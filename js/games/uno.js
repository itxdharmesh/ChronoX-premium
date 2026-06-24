// js/games/uno.js

function startMultiplayerUno(roomId) {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div style="padding: 15px; background: #03010a; min-height: calc(100vh - 70px); font-family: 'Poppins', sans-serif; color: #fff; display:flex; flex-direction:column; align-items:center; justify-content:space-between; box-sizing:border-box;">
            
            <div style="width:100%; max-width:450px; display:flex; justify-content:space-between; background:rgba(255,255,255,0.02); padding:10px 15px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                <div><span style="font-size:9px; color:rgba(255,255,255,0.4);">ROOM MATRIX</span><br><span style="font-weight:900; color:#00D4FF; font-family:monospace;">${roomId}</span></div>
                <div id="unoTurnSystem" style="font-weight:800; font-size:12px; color:#ff006e; padding:4px 12px; background:rgba(255,0,110,0.1); border-radius:20px;">SYNC SIGNAL...</div>
            </div>

            <div style="text-align:center; margin:30px 0;">
                <span style="font-size:10px; color:rgba(255,255,255,0.4); display:block; margin-bottom:8px; letter-spacing:2px;">TOP DISCARD PILE</span>
                <div id="unoDiscardPile" style="width:90px; height:130px; line-height:130px; background:#ff4757; border-radius:14px; font-size:32px; font-weight:900; color:#fff; display:inline-block; border:2px solid #fff; box-shadow:0 0 25px rgba(255, 71, 87, 0.5); text-shadow:0 2px 5px rgba(0,0,0,0.3);">7</div>
            </div>

            <div style="width:100%; max-width:450px; background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.04); border-radius:20px; padding:15px; box-sizing:border-box;">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; align-items:center;">
                    <span style="font-size:11px; font-weight:800; color:rgba(255,255,255,0.5);">YOUR LOCAL FIELD DECK</span>
                    <button id="unoDrawBtn" style="background:#00D4FF; border:none; color:#000; font-size:10px; font-weight:800; padding:5px 12px; border-radius:6px; cursor:pointer;">DRAW CARD</button>
                </div>
                <div id="unoPlayerHand" style="display:flex; gap:8px; overflow-x:auto; padding:10px 0; min-height:100px;">
                    </div>
            </div>
        </div>
    `;

    const turnSystem = document.getElementById('unoTurnSystem');
    const discardPile = document.getElementById('unoDiscardPile');
    const playerHand = document.getElementById('unoPlayerHand');
    const drawBtn = document.getElementById('unoDrawBtn');

    const roomRef = firebase.database().ref(`rooms/${roomId}`);
    const user = firebase.auth().currentUser;

    let playerOrder = [];
    let state = { turnIdx: 0, topCard: { color: '#ff4757', val: '7' } };

    roomRef.on('value', (snapshot) => {
        if (!snapshot.exists()) return;
        const room = snapshot.val();
        playerOrder = Object.keys(room.players || {}).sort();

        if (room.gameState && room.gameState.topCard) {
            state = room.gameState;
        } else {
            roomRef.child('gameState').set(state);
        }

        renderDeckInterface();
    });

    function renderDeckInterface() {
        discardPile.innerText = state.topCard.val;
        discardPile.style.background = state.topCard.color;
        discardPile.style.boxShadow = `0 0 25px ${state.topCard.color}`;

        let currentActiveUid = playerOrder[state.turnIdx];
        let isMyTurn = (currentActiveUid === user.uid);

        if (isMyTurn) {
            turnSystem.innerText = "YOUR ACTION FIELD";
            turnSystem.style.color = "#00f5d4";
            turnSystem.style.background = "rgba(0,245,212,0.1)";
        } else {
            turnSystem.innerText = "WAITING LINK";
            turnSystem.style.color = "#ff006e";
            turnSystem.style.background = "rgba(255,0,110,0.1)";
        }

        // Mock synchronized card cluster deck rendering
        let mockCards = [
            { color: '#2ed573', val: '3' },
            { color: '#1e90ff', val: '9' },
            { color: '#ffa502', val: '🔥' }
        ];

        playerHand.innerHTML = mockCards.map((card, idx) => `
            <div onclick="playUnoCard(${idx}, '${card.color}', '${card.val}', ${isMyTurn})" style="flex:0 0 70px; height:100px; background:${card.color}; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:900; color:#fff; cursor:pointer; border:1px solid rgba(255,255,255,0.2); box-shadow:0 4px 10px rgba(0,0,0,0.3); transition:0.2s;">
                ${card.val}
            </div>
        `).join('');
    }

    window.playUnoCard = (idx, color, val, isMyTurn) => {
        if (!isMyTurn) {
            if (typeof showToast === 'function') showToast('🚫 Protocol Warning: Wait for turn sequencing.');
            return;
        }
        state.topCard = { color: color, val: val };
        state.turnIdx = (state.turnIdx + 1) % playerOrder.length;
        roomRef.child('gameState').set(state);
    };

    drawBtn.onclick = () => {
        if (playerOrder[state.turnIdx] !== user.uid) return;
        state.turnIdx = (state.turnIdx + 1) % playerOrder.length;
        roomRef.child('gameState').set(state);
    };
}
