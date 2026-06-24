// js/games/tictactoe.js

function startTicTacToe() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Premium Cyberpunk Matrix Grid Layout
    c.innerHTML = `
        <div id="tttContainer" style="position:relative; width:100%; height:100%; min-height: calc(100vh - 160px); overflow:hidden; background: radial-gradient(circle at center, #0a0520 0%, #010107 100%); font-family: 'Poppins', sans-serif; user-select:none; -webkit-user-select:none; display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 20px;">
            
            <div style="background: rgba(10, 5, 30, 0.85); border: 1px solid rgba(0, 245, 212, 0.3); padding: 12px 25px; border-radius: 16px; backdrop-filter: blur(12px); box-shadow: 0 0 20px rgba(0, 245, 212, 0.1); margin-bottom: 25px; text-align:center; min-width:260px;">
                <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:2px; font-weight:700;">SYSTEM MATRIX STATUS</span>
                <span id="tttStatus" style="color:#00f5d4; font-weight:900; font-size:16px; letter-spacing:1px; text-shadow: 0 0 10px #00f5d4;">YOUR TURN (X)</span>
            </div>

            <div id="tttGrid" style="display: grid; grid-template-columns: repeat(3, 100px); grid-template-rows: repeat(3, 100px); gap: 12px; background: rgba(5, 2, 15, 0.5); padding: 12px; border-radius: 20px; border: 1px solid rgba(255, 0, 110, 0.2); box-shadow: 0 15px 40px rgba(0,0,0,0.5);">
                ${[0,1,2,3,4,5,6,7,8].map(i => `
                    <div class="ttt-cell" data-index="${i}" style="width:100px; height:100px; background: #0e082b; border: 1px solid rgba(123, 44, 191, 0.25); border-radius: 12px; display:flex; align-items:center; justify-content:center; font-size:42px; font-weight:900; color:#ffffff; cursor:pointer; transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: inset 0 0 15px rgba(0,0,0,0.2);"></div>
                `).join('')}
            </div>
            
            <button onclick="exitTicTacToe()" style="position:absolute; bottom:20px; right:20px; background:rgba(255, 0, 110, 0.1); border:1px solid rgba(255, 0, 110, 0.4); color:#ff006e; padding:8px 18px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; backdrop-filter:blur(5px); letter-spacing:1px; transition: 0.3s;">PURGE MODULE</button>

            <div id="tttScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: linear-gradient(135deg, rgba(16, 9, 43, 0.95) 0%, rgba(3, 1, 12, 0.99) 100%); border:2px solid #00f5d4; backdrop-filter:blur(25px); padding:40px 30px; border-radius:24px; text-align:center; width:88%; max-width:320px; box-shadow:0 25px 60px rgba(0,0,0,0.8); z-index:20; display:none;">
                <div id="tttIcon" style="font-size:45px; margin-bottom:15px;">🤖</div>
                <h1 id="tttResultTitle" style="font-size:24px; font-weight:900; color:#ffffff; letter-spacing:3px; margin-bottom:5px; text-transform:uppercase;">GRID LOCKED</h1>
                <p id="tttSub" style="font-size:11px; color:rgba(255,255,255,0.55); margin-bottom:30px; letter-spacing:1px; line-height:1.6;">NEURAL MATRIX OVERRIDE COMPLETE.</p>
                <button id="tttBtn" style="background:linear-gradient(135deg, #00f5d4, #ff006e); border:none; padding:12px 30px; font-size:13px; font-weight:800; color:#03020a; border-radius:14px; cursor:pointer; text-transform:uppercase; letter-spacing:2px; width:100%; box-shadow:0 6px 20px rgba(0,245,212,0.35);">RE-ENGAGE SYSTEM</button>
            </div>
        </div>

        <style>
            .ttt-cell:hover {
                background: #180d45 !important;
                border-color: #00f5d4 !important;
                box-shadow: 0 0 15px rgba(0, 245, 212, 0.2), inset 0 0 10px rgba(0, 245, 212, 0.1) !important;
                transform: scale(1.04);
            }
            .ttt-cell.x-marked {
                color: #00f5d4 !important;
                text-shadow: 0 0 15px #00f5d4, 0 0 30px rgba(0,245,212,0.5);
            }
            .ttt-cell.o-marked {
                color: #ff006e !important;
                text-shadow: 0 0 15px #ff006e, 0 0 30px rgba(255,0,110,0.5);
            }
            .cell-winner {
                background: linear-gradient(135deg, #00f5d4, #7b2cbf) !important;
                border-color: #ffffff !important;
                animation: cellPulse 0.8s infinite alternate;
            }
            @keyframes cellPulse { from { transform: scale(1); } to { transform: scale(1.05); } }
        </style>
    `;

    const cells = document.querySelectorAll('.ttt-cell');
    const statusHUD = document.getElementById('tttStatus');
    const tttScreen = document.getElementById('tttScreen');
    const tttResultTitle = document.getElementById('tttResultTitle');
    const tttSub = document.getElementById('tttSub');
    const tttBtn = document.getElementById('tttBtn');
    const tttIcon = document.getElementById('tttIcon');

    let board = Array(9).fill('');
    let gameActive = true;
    const human = 'X';
    const ai = 'O';

    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontals
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticals
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    function handleCellClick(e) {
        const cell = e.target;
        const idx = parseInt(cell.getAttribute('data-index'));

        if (board[idx] !== '' || !gameActive) return;

        // Human Turn Commit
        makeMove(idx, human);

        if (checkWin(board, human)) {
            endGame(human);
            return;
        }

        if (board.every(cell => cell !== '')) {
            endGame('draw');
            return;
        }

        // Shift control to Neural AI Engine
        gameActive = false;
        statusHUD.innerText = "COMPUTING MATRIX CORRELATION...";
        statusHUD.style.color = "#ff006e";

        setTimeout(() => {
            const bestIdx = findBestMove();
            makeMove(bestIdx, ai);

            if (checkWin(board, ai)) {
                endGame(ai);
                return;
            }

            if (board.every(cell => cell !== '')) {
                endGame('draw');
                return;
            }

            gameActive = true;
            statusHUD.innerText = "YOUR TURN (X)";
            statusHUD.style.color = "#00f5d4";
        }, 550); // Fluid thinking delay vector simulation
    }

    function makeMove(index, player) {
        board[index] = player;
        const targetCell = document.querySelector(`[data-index="${index}"]`);
        targetCell.innerText = player;
        targetCell.classList.add(player === 'X' ? 'x-marked' : 'o-marked');
    }

    function checkWin(currentBoard, player) {
        return winConditions.some(condition => {
            return condition.every(index => currentBoard[index] === player);
        });
    }

    // Minimax Unbeatable Core Logic Engine Mapping
    function findBestMove() {
        let bestScore = -Infinity;
        let move = null;

        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = ai;
                let score = minimax(board, 0, false);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    function minimax(currBoard, depth, isMaximizing) {
        if (checkWin(currBoard, ai)) return 10 - depth;
        if (checkWin(currBoard, human)) return depth - 10;
        if (currBoard.every(cell => cell !== '')) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (currBoard[i] === '') {
                    currBoard[i] = ai;
                    let score = minimax(currBoard, depth + 1, false);
                    currBoard[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (currBoard[i] === '') {
                    currBoard[i] = human;
                    let score = minimax(currBoard, depth + 1, true);
                    currBoard[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    function endGame(winner) {
        gameActive = false;
        tttScreen.style.display = 'block';

        if (winner === human) {
            tttIcon.innerText = "👑";
            tttResultTitle.innerText = "NODE CONQUERED";
            tttResultTitle.style.color = "#00f5d4";
            tttSub.innerHTML = "YOU BYPASSED THE AI FIREWALL! <br>Improbable achievement.";
            highlightWinningLine(human);
        } else if (winner === ai) {
            tttIcon.innerText = "☠️";
            tttResultTitle.innerText = "MATRIX PURGED";
            tttResultTitle.style.color = "#ff006e";
            tttScreen.style.borderColor = "#ff006e";
            tttSub.innerHTML = "THE AI PREDICTED EVERY SECTOR VECTOR.<br>System Access Denied.";
            highlightWinningLine(ai);
        } else {
            tttIcon.innerText = "🤝";
            tttResultTitle.innerText = "GRID LOCK STALEMATE";
            tttResultTitle.style.color = "#ffffff";
            tttScreen.style.borderColor = "#ffffff";
            tttSub.innerHTML = "EQUILIBRIUM REACHED.<br>Both cores neutralized perfectly.";
        }
    }

    function highlightWinningLine(player) {
        winConditions.forEach(condition => {
            if (condition.every(idx => board[idx] === player)) {
                condition.forEach(idx => {
                    document.querySelector(`[data-index="${idx}"]`).classList.add('cell-winner');
                });
            }
        });
    }

    function resetGridCore() {
        board = Array(9).fill('');
        gameActive = true;
        tttScreen.style.display = 'none';
        tttScreen.style.borderColor = "#00f5d4";
        statusHUD.innerText = "YOUR TURN (X)";
        statusHUD.style.color = "#00f5d4";

        cells.forEach(cell => {
            cell.innerText = '';
            cell.className = 'ttt-cell';
        });
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    tttBtn.onclick = resetGridCore;

    // Strict sandbox clean execution tracking anchor
    window.tttCancelRef = () => {
        cells.forEach(cell => cell.removeEventListener('click', handleCellClick));
    };
}

function exitTicTacToe() {
    if (typeof window.tttCancelRef === 'function') window.tttCancelRef();
    if (typeof openGames === 'function') openGames();
}
