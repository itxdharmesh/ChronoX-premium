// ==================== TIC TAC TOE (X O GAME) ====================

let tttBoard = ['', '', '', '', '', '', '', '', ''];
let tttPlayer = 'X';
let tttAI = 'O';
let tttDifficulty = 'medium';
let tttGameActive = false;

function openTicTacToe() {
    tttBoard = ['', '', '', '', '', '', '', '', ''];
    tttGameActive = true;
    
    openModal('gamesModal');
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header">
            <button onclick="closeModal('gamesModal')">← Back</button>
            <h2>❌⭕ Tic Tac Toe</h2>
            <div></div>
        </div>
        <div style="text-align:center;margin-bottom:15px">
            <label style="color:var(--text2);font-size:13px">Difficulty:</label>
            <select id="tttDifficulty" onchange="tttDifficulty=this.value" style="margin-left:10px;padding:5px 10px;border-radius:5px;background:var(--card);color:#fff;border:1px solid var(--border)">
                <option value="easy">Easy</option>
                <option value="medium" selected>Medium</option>
                <option value="hard">Hard</option>
            </select>
        </div>
        <div id="tttStatus" style="text-align:center;color:var(--gold);margin-bottom:15px;font-weight:600">Your turn (X)</div>
        <div class="ttt-grid" id="tttGrid">
            ${[0,1,2,3,4,5,6,7,8].map(i => `
                <div class="ttt-cell" onclick="tttMove(${i})" id="ttt${i}"></div>
            `).join('')}
        </div>
        <button class="btn-gold" onclick="openTicTacToe()" style="margin-top:15px">New Game</button>
    `;
}

function tttMove(index) {
    if (!tttGameActive || tttBoard[index] !== '') return;
    
    // Player move
    tttBoard[index] = tttPlayer;
    document.getElementById(`ttt${index}`).textContent = tttPlayer;
    document.getElementById(`ttt${index}`).style.color = 'var(--gold)';
    
    if (tttCheckWin(tttPlayer)) {
        tttGameActive = false;
        document.getElementById('tttStatus').textContent = '🎉 You Win!';
        updateGameStats('win');
        return;
    }
    
    if (tttBoard.every(cell => cell !== '')) {
        tttGameActive = false;
        document.getElementById('tttStatus').textContent = '🤝 Draw!';
        updateGameStats('draw');
        return;
    }
    
    // AI move
    document.getElementById('tttStatus').textContent = 'AI thinking...';
    setTimeout(() => {
        const aiIndex = tttGetAIMove();
        tttBoard[aiIndex] = tttAI;
        document.getElementById(`ttt${aiIndex}`).textContent = tttAI;
        document.getElementById(`ttt${aiIndex}`).style.color = '#FF4757';
        
        if (tttCheckWin(tttAI)) {
            tttGameActive = false;
            document.getElementById('tttStatus').textContent = '😞 AI Wins!';
            updateGameStats('loss');
        } else if (tttBoard.every(cell => cell !== '')) {
            tttGameActive = false;
            document.getElementById('tttStatus').textContent = '🤝 Draw!';
            updateGameStats('draw');
        } else {
            document.getElementById('tttStatus').textContent = 'Your turn (X)';
        }
    }, 500);
}

function tttCheckWin(player) {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return wins.some(w => w.every(i => tttBoard[i] === player));
}

function tttGetAIMove() {
    const empty = tttBoard.map((c, i) => c === '' ? i : null).filter(i => i !== null);
    
    if (tttDifficulty === 'easy') {
        return empty[Math.floor(Math.random() * empty.length)];
    }
    
    if (tttDifficulty === 'hard') {
        // Try to win
        for (const i of empty) {
            tttBoard[i] = tttAI;
            if (tttCheckWin(tttAI)) { tttBoard[i] = ''; return i; }
            tttBoard[i] = '';
        }
        // Block player
        for (const i of empty) {
            tttBoard[i] = tttPlayer;
            if (tttCheckWin(tttPlayer)) { tttBoard[i] = ''; return i; }
            tttBoard[i] = '';
        }
    }
    
    // Medium or fallback
    if (Math.random() < 0.5 && tttDifficulty === 'medium') {
        return empty[Math.floor(Math.random() * empty.length)];
    }
    
    // Strategic: take center, corners, then edges
    const priority = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    for (const p of priority) {
        if (empty.includes(p)) return p;
    }
    
    return empty[0];
}

async function updateGameStats(result) {
    if (!currentUser) return;
    const field = result === 'win' ? 'gameStats.wins' : result === 'loss' ? 'gameStats.losses' : 'gameStats.draws';
    await db.collection('users').doc(currentUser.uid).update({
        [field]: firebase.firestore.FieldValue.increment(1),
        'stats.gamesPlayed': firebase.firestore.FieldValue.increment(1)
    });
    checkAchievements();
}

console.log('✅ Tic Tac Toe loaded');
