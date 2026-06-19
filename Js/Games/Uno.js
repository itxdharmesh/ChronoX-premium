// ==================== UNO (SIMPLIFIED) ====================

const UNO_COLORS = ['🟥', '🟦', '🟩', '🟨'];
const UNO_VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];

let unoPlayerHand = [];
let unoAIHand = [];
let unoDiscard = null;
let unoCurrentColor = null;
let unoTurn = 'player';
let unoGameActive = false;

function openUno() {
    // Generate hands
    unoPlayerHand = [];
    unoAIHand = [];
    for (let i = 0; i < 7; i++) {
        unoPlayerHand.push(generateUnoCard());
        unoAIHand.push(generateUnoCard());
    }
    
    unoDiscard = generateUnoCard();
    unoCurrentColor = unoDiscard.color;
    unoTurn = Math.random() < 0.5 ? 'player' : 'ai';
    unoGameActive = true;
    
    renderUno();
    
    if (unoTurn === 'ai') {
        setTimeout(unoAITurn, 1000);
    }
}

function generateUnoCard() {
    return {
        color: UNO_COLORS[Math.floor(Math.random() * 4)],
        value: UNO_VALUES[Math.floor(Math.random() * 13)]
    };
}

function renderUno() {
    openModal('gamesModal');
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header">
            <button onclick="closeModal('gamesModal')">← Back</button>
            <h2>🃏 UNO</h2>
            <span style="font-size:12px;color:var(--text2)">AI: ${unoAIHand.length} cards</span>
        </div>
        <div style="text-align:center;margin:15px 0">
            <div style="font-size:12px;color:var(--text2)">Discard Pile</div>
            <div class="uno-discard">${unoDiscard.color} ${unoDiscard.value}</div>
            <div style="color:var(--gold);margin-top:10px">${unoTurn==='player'?'Your turn!':'AI thinking...'}</div>
        </div>
        <div class="uno-hand" id="unoHand">
            ${unoPlayerHand.map((card, i) => `
                <div class="uno-card" onclick="playUnoCard(${i})" id="unoCard${i}">
                    ${card.color}<br>${card.value}
                </div>
            `).join('')}
        </div>
        <button class="btn-outline" onclick="drawUnoCard()" style="margin-top:10px">🎴 Draw Card</button>
        <button class="btn-outline" onclick="openUno()" style="margin-top:5px">New Game</button>
    `;
}

function playUnoCard(index) {
    if (!unoGameActive || unoTurn !== 'player') return;
    
    const card = unoPlayerHand[index];
    if (card.color === unoCurrentColor || card.value === unoDiscard.value || card.value === 'Skip' || card.value === 'Reverse') {
        unoPlayerHand.splice(index, 1);
        unoDiscard = card;
        unoCurrentColor = card.color;
        
        if (unoPlayerHand.length === 0) {
            unoGameActive = false;
            renderUno();
            document.getElementById('unoHand').innerHTML = '<h3 style="color:var(--gold);text-align:center">🎉 UNO! You Win!</h3>';
            updateGameStats('win');
            return;
        }
        
        if (card.value === 'Skip') {
            renderUno();
            document.getElementById('unoHand').innerHTML += '<p style="text-align:center;color:var(--gold)">AI skipped! Your turn again</p>';
            return;
        }
        
        unoTurn = 'ai';
        renderUno();
        setTimeout(unoAITurn, 1000 + Math.random() * 1000);
    }
}

function drawUnoCard() {
    if (!unoGameActive || unoTurn !== 'player') return;
    
    unoPlayerHand.push(generateUnoCard());
    unoTurn = 'ai';
    renderUno();
    setTimeout(unoAITurn, 1000 + Math.random() * 1000);
}

function unoAITurn() {
    if (!unoGameActive) return;
    
    const playableIndex = unoAIHand.findIndex(card => 
        card.color === unoCurrentColor || card.value === unoDiscard.value
    );
    
    if (playableIndex >= 0) {
        const card = unoAIHand[playableIndex];
        unoAIHand.splice(playableIndex, 1);
        unoDiscard = card;
        unoCurrentColor = card.color;
        
        if (unoAIHand.length === 0) {
            unoGameActive = false;
            renderUno();
            document.getElementById('unoHand').innerHTML = '<h3 style="color:#FF4757;text-align:center">😞 AI Wins!</h3>';
            updateGameStats('loss');
            return;
        }
    } else {
        unoAIHand.push(generateUnoCard());
    }
    
    unoTurn = 'player';
    renderUno();
}

console.log('✅ UNO loaded');
