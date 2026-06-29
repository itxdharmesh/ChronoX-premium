const SIZE = 8, MINES = 10;
let mineBoard = [], revealed = [], flagged = [], gameOver = false;

function initMine() {
    mineBoard = Array(SIZE).fill().map(() => Array(SIZE).fill(0));
    revealed = Array(SIZE).fill().map(() => Array(SIZE).fill(false));
    flagged = Array(SIZE).fill().map(() => Array(SIZE).fill(false));
    gameOver = false;
    let placed = 0;
    while (placed < MINES) { const r = Math.floor(Math.random() * SIZE), c = Math.floor(Math.random() * SIZE); if (!mineBoard[r][c]) { mineBoard[r][c] = 'M'; placed++; } }
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (mineBoard[r][c] !== 'M') { let count = 0; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const nr = r + dr, nc = c + dc; if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && mineBoard[nr][nc] === 'M') count++; } mineBoard[r][c] = count; }
    renderMine();
}

function renderMine() {
    document.getElementById('mineGrid').innerHTML = mineBoard.map((row, r) => row.map((cell, c) => `
        <div class="mine-cell ${revealed[r][c] ? 'revealed' : ''} ${revealed[r][c] && cell === 'M' ? 'mine' : ''} ${flagged[r][c] ? 'flag' : ''}" 
             onclick="revealCell(${r},${c})" oncontextmenu="flagCell(event,${r},${c})">${revealed[r][c] ? (cell === 'M' ? '💣' : cell || '') : flagged[r][c] ? '🚩' : ''}</div>`).join('')).join('');
}

function revealCell(r, c) {
    if (gameOver || revealed[r][c] || flagged[r][c]) return;
    revealed[r][c] = true;
    if (mineBoard[r][c] === 'M') { gameOver = true; mineBoard.forEach((row, ri) => row.forEach((_, ci) => { if (mineBoard[ri][ci] === 'M') revealed[ri][ci] = true; })); }
    else if (mineBoard[r][c] === 0) { for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const nr = r + dr, nc = c + dc; if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) revealCell(nr, nc); } }
    renderMine();
}

function flagCell(e, r, c) { e.preventDefault(); if (!gameOver && !revealed[r][c]) { flagged[r][c] = !flagged[r][c]; renderMine(); } }

document.getElementById('mineReset').addEventListener('click', initMine);
initMine();
