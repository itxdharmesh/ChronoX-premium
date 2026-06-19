// ==================== SNAKE & LADDERS (SAAP SIDHI) ====================

let slBoard = [];
let slPlayerPos = 1;
let slAIPos = 1;
let slTurn = 'player';
let slDifficulty = 'medium';
let slGameActive = false;

const SNAKES = { 17: 7, 54: 34, 62: 19, 87: 24, 93: 73, 95: 75, 99: 78 };
const LADDERS = { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91 };

function openSnakeLadder() {
    slPlayerPos = 1;
    slAIPos = 1;
    slTurn = 'player';
    slGameActive = true;
    
    openModal('gamesModal');
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header">
            <button onclick="closeModal('gamesModal')">← Back</button>
            <h2>🐍 Saap Sidhi 🪜</h2>
            <div></div>
        </div>
        <div style="text-align:center;margin-bottom:15px">
            <select id="slDiff" onchange="slDifficulty=this.value" style="padding:5px 10px;border-radius:5px;background:var(--card);color:#fff;border:1px solid var(--border)">
                <option value="easy">Easy</option>
                <option value="medium" selected>Medium</option>
                <option value="hard">Hard</option>
            </select>
        </div>
        <div style="display:flex;justify-content:space-around;margin-bottom:15px">
            <div style="text-align:center"><span style="color:var(--gold)">🧑 You:</span> <span id="slPlayerPos">1</span></div>
            <div style="text-align:center"><span style="color:#FF4757">🤖 AI:</span> <span id="slAIPos">1</span></div>
        </div>
        <div id="slStatus" style="text-align:center;color:var(--gold);font-weight:600;margin:10px 0">Your turn! Roll the dice 🎲</div>
        <div class="sl-board" id="slBoard"></div>
        <button class="btn-gold" id="slRollBtn" onclick="slRollDice()" style="margin-top:15px">🎲 Roll Dice</button>
        <button class="btn-outline" onclick="openSnakeLadder()" style="margin-top:5px">New Game</button>
    `;
    renderSLBoard();
}

function renderSLBoard() {
    const board = document.getElementById('slBoard');
    if (!board) return;
    
    let html = '<div class="sl-grid">';
    for (let row = 9; row >= 0; row--) {
        const start = row * 10 + 1;
        const cells = [];
        for (let col = 0; col < 10; col++) {
            const num = row % 2 === 0 ? start + col : start + 9 - col;
            let marker = '';
            if (num === slPlayerPos && num === slAIPos) marker = '🧑🤖';
            else if (num === slPlayerPos) marker = '🧑';
            else if (num === slAIPos) marker = '🤖';
            
            let type = '';
            if (SNAKES[num]) type = '🐍';
            if (LADDERS[num]) type = '🪜';
            
            cells.push(`<div class="sl-cell ${num===100?'sl-finish':''}"><span class="sl-num">${num}</span>${marker?`<span class="sl-marker">${marker}</span>`:''}${type?`<span class="sl-type">${type}</span>`:''}</div>`);
        }
        html += `<div class="sl-row">${cells.join('')}</div>`;
    }
    html += '</div>';
    board.innerHTML = html;
}

function slRollDice() {
    if (!slGameActive || slTurn !== 'player') return;
    
    const dice = Math.floor(Math.random() * 6) + 1;
    document.getElementById('slStatus').textContent = `You rolled: ${dice} 🎲`;
    document.getElementById('slRollBtn').disabled = true;
    
    setTimeout(() => {
        slPlayerPos = slMovePlayer(slPlayerPos, dice);
        document.getElementById('slPlayerPos').textContent = slPlayerPos;
        renderSLBoard();
        
        if (slPlayerPos >= 100) {
            slGameActive = false;
            document.getElementById('slStatus').textContent = '🎉 You Win!';
            updateGameStats('win');
            return;
        }
        
        // AI turn
        slTurn = 'ai';
        document.getElementById('slStatus').textContent = 'AI is rolling... 🤖';
        
        setTimeout(() => {
            const aiDice = Math.floor(Math.random() * 6) + 1;
            document.getElementById('slStatus').textContent = `AI rolled: ${aiDice} 🎲`;
            
            setTimeout(() => {
                slAIPos = slMovePlayer(slAIPos, aiDice);
                document.getElementById('slAIPos').textContent = slAIPos;
                renderSLBoard();
                
                if (slAIPos >= 100) {
                    slGameActive = false;
                    document.getElementById('slStatus').textContent = '😞 AI Wins!';
                    updateGameStats('loss');
                } else {
                    slTurn = 'player';
                    document.getElementById('slStatus').textContent = 'Your turn! Roll the dice 🎲';
                    document.getElementById('slRollBtn').disabled = false;
                }
            }, 500);
        }, 1000);
    }, 500);
}

function slMovePlayer(pos, dice) {
    let newPos = pos + dice;
    if (newPos > 100) newPos = pos;
    if (SNAKES[newPos]) newPos = SNAKES[newPos];
    if (LADDERS[newPos]) newPos = LADDERS[newPos];
    return newPos;
}

console.log('✅ Snake & Ladders loaded');
