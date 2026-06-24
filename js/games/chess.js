// js/games/chess.js

function startMultiplayerChess(roomId) {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div style="padding: 15px; background: #080711; min-height: calc(100vh - 70px); font-family: 'Poppins', sans-serif; color: #fff; display:flex; flex-direction:column; align-items:center; justify-content:center;">
            
            <div style="width:100%; max-width:360px; display:flex; justify-content:space-between; background:rgba(255,255,255,0.02); padding:8px 12px; border-radius:10px; margin-bottom:12px; border:1px solid rgba(255,255,255,0.05);">
                <div style="font-size:12px; font-weight:800;">CHESS SECTOR: <span style="color:#00D4FF; font-family:monospace;">${roomId}</span></div>
                <div id="chessTurnSystem" style="font-size:11px; font-weight:800; color:#00f5d4; text-transform:uppercase;">LOADING NODES...</div>
            </div>

            <div style="background:#111; border:2px solid rgba(255,255,255,0.08); border-radius:12px; overflow:hidden; width:100%; max-width:360px; aspect-ratio:1; box-shadow:0 20px 45px rgba(0,0,0,0.7);">
                <div id="chessBoardMatrix" style="display:grid; grid-template-columns:repeat(8, 1fr); width:100%; height:100%;"></div>
            </div>

            <div id="chessStatusLogs" style="margin-top:15px; font-size:11px; color:rgba(255,255,255,0.4); text-align:center;">
                Click vector paths to initialize quantum relocation parameter checks.
            </div>
        </div>
    `;

    const boardMatrix = document.getElementById('chessBoardMatrix');
    const turnSystem = document.getElementById('chessTurnSystem');
    const statusLogs = document.getElementById('chessStatusLogs');

    const roomRef = firebase.database().ref(`rooms/${roomId}`);
    const user = firebase.auth().currentUser;

    let playerOrder = [];
    let myColor = 'white';
    let gameState = { turn: 'white', lastMove: null };

    // Standard Unicode Matrix Setup Definition
    const initialPieces = [
        '♜','♞','♝','♛','♚','♝','♞','♜',
        '♟','♟','♟','♟','♟','♟','♟','♟',
        '','','','','','','','',
        '','','','','','','','',
        '','','','','','','','',
        '','','','','','','','',
        '♙','♙','♙','♙','♙','♙','♙','♙',
        '♖','♘','♗','♕','♔','♗','♘','♖'
    ];

    roomRef.on('value', (snapshot) => {
        if (!snapshot.exists()) return;
        const room = snapshot.val();
        playerOrder = Object.keys(room.players || {}).sort();

        // White assignation rules
        if(playerOrder[0] === user.uid) myColor = 'white'; else myColor = 'black';

        if (room.gameState && room.gameState.turn) {
            gameState = room.gameState;
        } else {
            gameState.boardState = initialPieces;
            roomRef.child('gameState').set(gameState);
        }

        renderChessGrid();
    });

    function renderChessGrid() {
        let bState = gameState.boardState || initialPieces;
        boardMatrix.innerHTML = '';

        let isMyTurn = (gameState.turn === myColor);
        turnSystem.innerText = isMyTurn ? "YOUR TURN" : "OPPONENT TURN";
        turnSystem.style.color = isMyTurn ? "#00f5d4" : "#ff006e";

        for (let i = 0; i < 64; i++) {
            let row = Math.floor(i / 8);
            let col = i % 8;
            let isDark = (row + col) % 2 === 1;

            let square = document.createElement('div');
            square.style.background = isDark ? '#1e1a3a' : '#342f5c';
            square.style.display = 'flex';
            square.style.alignItems = 'center';
            square.style.justifyContent = 'center';
            square.style.fontSize = '26px';
            square.style.cursor = 'pointer';
            square.style.color = '#fff';
            square.innerText = bState[i] || '';

            square.onclick = () => {
                if (!isMyTurn) return;
                // Move Intercept Logic
                statusLogs.innerText = `Square coordinate matrix block indexed: [Index ${i}]`;
                
                // Swap Turn Mechanics Simulator Integration
                gameState.turn = (myColor === 'white') ? 'black' : 'white';
                roomRef.child('gameState').set(gameState);
            };

            boardMatrix.appendChild(square);
        }
    }
}
