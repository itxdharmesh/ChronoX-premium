function startTicTacToe() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    let board = Array(9).fill(''), turn = 'X', gameOver = false;
    
    c.innerHTML = `
        <div style="position:relative;width:100%;height:100%;min-height:500px;height:calc(100vh - 150px);background:radial-gradient(circle at center,#0a0f1e,#03050a);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Poppins',sans-serif;gap:1rem;">
            <h2 class="neon-text">TIC TAC TOE</h2>
            <div id="tttStatus" class="glass-panel" style="padding:8px 20px;color:#00D4FF;">TURN: X</div>
            <div id="tttGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:280px;width:100%;"></div>
            <button class="btn-glow" onclick="startTicTacToe()">🔄 RESTART</button>
            <button class="btn-gold" onclick="exitTicTacToe()">EXIT</button>
        </div>
    `;
    
    const grid = document.getElementById('tttGrid');
    const status = document.getElementById('tttStatus');
    
    function render() {
        grid.innerHTML = '';
        board.forEach((cell, i) => {
            const btn = document.createElement('div');
            btn.className = 'glass-panel';
            btn.style.cssText = 'aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:2.5rem;cursor:pointer;font-weight:900;';
            btn.textContent = cell;
            btn.style.color = cell === 'X' ? '#00D4FF' : '#D4AF37';
            btn.onclick = () => clickCell(i);
            grid.appendChild(btn);
        });
    }
    
    function clickCell(i) {
        if (gameOver || board[i]) return;
        board[i] = turn;
        render();
        if (checkWin()) { status.textContent = turn + ' WINS! 🎉'; status.style.color = '#2ED573'; gameOver = true; return; }
        if (board.every(c => c)) { status.textContent = 'DRAW!'; status.style.color = '#888'; gameOver = true; return; }
        turn = turn === 'X' ? 'O' : 'X';
        status.textContent = 'TURN: ' + turn;
    }
    
    function checkWin() {
        const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        return wins.some(w => board[w[0]] && board[w[0]] === board[w[1]] && board[w[1]] === board[w[2]]);
    }
    
    render();
}

function exitTicTacToe() { if (typeof openGames === 'function') openGames(); }
