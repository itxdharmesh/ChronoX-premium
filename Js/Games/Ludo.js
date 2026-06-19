// ==================== LUDO (SIMPLIFIED) ====================

let ludoPlayerPos = [0, 0, 0, 0]; // 4 tokens
let ludoAIPos = [0, 0, 0, 0];
let ludoTurn = 'player';
let ludoGameActive = false;
const LUDO_BOARD_SIZE = 52;

function openLudo() {
    ludoPlayerPos = [0, 0, 0, 0];
    ludoAIPos = [0, 0, 0, 0];
    ludoTurn = 'player';
    ludoGameActive = true;
    
    openModal('gamesModal');
    renderLudo();
}

function renderLudo() {
    const playerHome = ludoPlayerPos.filter(p => p === 0).length;
    const aiHome = ludoAIPos.filter(p => p === 0).length;
    const playerFinished = ludoPlayerPos.filter(p => p >= LUDO_BOARD_SIZE).length;
    const aiFinished = ludoAIPos.filter(p => p >= LUDO_BOARD_SIZE).length;
    
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header">
            <button onclick="closeModal('gamesModal')">← Back</button>
            <h2>🎲 Ludo</h2>
            <div></div>
        </div>
        <div style="display:flex;justify-content:space-around;margin:15px 0">
            <div style="text-align:center">
                <div style="color:var(--gold)">🧑 You</div>
                <div>Home: ${playerHome} | Finished: ${playerFinished}</div>
                <div style="display:flex;gap:5px;justify-content:center;margin-top:5px">
                    ${ludoPlayerPos.map((pos, i) => `<div class="ludo-token ${pos===0?'ludo-home':pos>=LUDO_BOARD_SIZE?'ludo-finished':'ludo-active'}" onclick="ludoSelectToken(${i})" id="ptoken${i}">${pos===0?'🏠':pos>=LUDO_BOARD_SIZE?'✅':pos}</div>`).join('')}
                </div>
            </div>
            <div style="text-align:center">
                <div style="color:#FF4757">🤖 AI</div>
                <div>Home: ${aiHome} | Finished: ${aiFinished}</div>
                <div style="display:flex;gap:5px;justify-content:center;margin-top:5px">${ludoAIPos.map(p => `<div class="ludo-token ${p===0?'ludo-home':p>=LUDO_BOARD_SIZE?'ludo-finished':'ludo-active-ai'}">${p===0?'🏠':p>=LUDO_BOARD_SIZE?'✅':p}</div>`).join('')}</div>
            </div>
        </div>
        <div id="ludoStatus" style="text-align:center;color:var(--gold);font-weight:600;margin:10px 0">${ludoTurn==='player'?'Your turn! Select a token then roll':'AI is playing...'}</div>
        <button class="btn-gold" id="ludoRollBtn" onclick="ludoRollDice()">🎲 Roll Dice</button>
        <button class="btn-outline" onclick="openLudo()" style="margin-top:5px">New Game</button>
    `;
    
    if (ludoPlayerPos.every(p => p >= LUDO_BOARD_SIZE)) {
        document.getElementById('ludoStatus').innerHTML = '<h3 style="color:var(--gold)">🎉 You Win!</h3>';
        updateGameStats('win');
        ludoGameActive = false;
    } else if (ludoAIPos.every(p => p >= LUDO_BOARD_SIZE)) {
        document.getElementById('ludoStatus').innerHTML = '<h3 style="color:#FF4757">😞 AI Wins!</h3>';
        updateGameStats('loss');
        ludoGameActive = false;
    }
}

let selectedLudoToken = -1;

function ludoSelectToken(index) {
    if (!ludoGameActive || ludoTurn !== 'player') return;
    if (ludoPlayerPos[index] >= LUDO_BOARD_SIZE) return;
    
    selectedLudoToken = index;
    document.querySelectorAll('.ludo-active').forEach(el => el.style.border = '');
    document.getElementById(`ptoken${index}`).style.border = '3px solid var(--gold)';
}

function ludoRollDice() {
    if (!ludoGameActive) return;
    
    if (ludoTurn === 'player') {
        if (selectedLudoToken < 0) {
            showToast('Select a token first!', 'error');
            return;
        }
        
        const dice = Math.floor(Math.random() * 6) + 1;
        document.getElementById('ludoStatus').textContent = `You rolled: ${dice} 🎲`;
        
        if (dice === 6 && ludoPlayerPos[selectedLudoToken] === 0) {
            ludoPlayerPos[selectedLudoToken] = 1;
        } else if (ludoPlayerPos[selectedLudoToken] > 0) {
            ludoPlayerPos[selectedLudoToken] += dice;
        }
        
        selectedLudoToken = -1;
        ludoTurn = 'ai';
        renderLudo();
        
        setTimeout(ludoAITurn, 1000);
    }
}

function ludoAITurn() {
    if (!ludoGameActive) return;
    
    const dice = Math.floor(Math.random() * 6) + 1;
    
    if (dice === 6) {
        const homeToken = ludoAIPos.findIndex(p => p === 0);
        if (homeToken >= 0) {
            ludoAIPos[homeToken] = 1;
        } else {
            const activeTokens = ludoAIPos.map((p, i) => p > 0 && p < LUDO_BOARD_SIZE ? i : -1).filter(i => i >= 0);
            if (activeTokens.length > 0) {
                const token = activeTokens[Math.floor(Math.random() * activeTokens.length)];
                ludoAIPos[token] += dice;
            }
        }
    } else {
        const activeTokens = ludoAIPos.map((p, i) => p > 0 && p < LUDO_BOARD_SIZE ? i : -1).filter(i => i >= 0);
        if (activeTokens.length > 0) {
            const token = activeTokens[Math.floor(Math.random() * activeTokens.length)];
            ludoAIPos[token] += dice;
        }
    }
    
    ludoTurn = 'player';
    renderLudo();
    
    if (ludoPlayerPos.every(p => p >= LUDO_BOARD_SIZE)) {
        document.getElementById('ludoStatus').innerHTML = '<h3 style="color:var(--gold)">🎉 You Win!</h3>';
        updateGameStats('win');
        ludoGameActive = false;
    } else if (ludoAIPos.every(p => p >= LUDO_BOARD_SIZE)) {
        document.getElementById('ludoStatus').innerHTML = '<h3 style="color:#FF4757">😞 AI Wins!</h3>';
        updateGameStats('loss');
        ludoGameActive = false;
    }
}

console.log('✅ Ludo loaded');
