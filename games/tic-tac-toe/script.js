let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;

const grid = document.getElementById('tttGrid');
const status = document.getElementById('tttStatus');

function render() {
    grid.innerHTML = board.map((cell, i) => `<div class="ttt-cell ${cell.toLowerCase()}" onclick="makeMove(${i})">${cell}</div>`).join('');
}

function makeMove(i) {
    if (!gameActive || board[i] !== '') return;
    board[i] = currentPlayer;
    if (checkWin()) { status.textContent = `${currentPlayer} Wins!`; gameActive = false; }
    else if (board.every(c => c)) { status.textContent = 'Draw!'; gameActive = false; }
    else { currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; status.textContent = `${currentPlayer}'s turn`; }
    render();
    if (currentPlayer === 'O' && gameActive) setTimeout(aiMove, 400);
}

function aiMove() {
    const empty = board.map((c, i) => c === '' ? i : -1).filter(i => i >= 0);
    if (empty.length) makeMove(empty[Math.floor(Math.random() * empty.length)]);
}

function checkWin() {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return wins.some(w => board[w[0]] && board[w[0]] === board[w[1]] && board[w[0]] === board[w[2]]);
}

document.getElementById('tttReset').addEventListener('click', () => { board = ['', '', '', '', '', '', '', '', '']; currentPlayer = 'X'; gameActive = true; status.textContent = 'Your turn'; render(); });
render();
