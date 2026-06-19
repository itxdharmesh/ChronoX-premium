// ==================== MEMORY MATCH GAME ====================

let memoryCards = [];
let memoryFlipped = [];
let memoryMatched = [];
let memoryMoves = 0;
let memoryLocked = false;

function openMemoryGame() {
    const emojis = ['🎮', '🎯', '🎨', '🎵', '🎭', '🎪', '🎲', '🎸'];
    memoryCards = shuffleArray([...emojis, ...emojis]);
    memoryFlipped = [];
    memoryMatched = [];
    memoryMoves = 0;
    memoryLocked = false;
    
    openModal('gamesModal');
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header">
            <button onclick="closeModal('gamesModal')">← Back</button>
            <h2>🧠 Memory Match</h2>
            <div></div>
        </div>
        <div style="text-align:center;color:var(--gold);margin-bottom:10px">Moves: <span id="memMoves">0</span></div>
        <div class="memory-grid" id="memoryGrid">
            ${memoryCards.map((emoji, i) => `
                <div class="memory-card" onclick="flipMemoryCard(${i})" id="mem${i}">
                    <div class="memory-card-inner">
                        <div class="memory-card-front">❓</div>
                        <div class="memory-card-back">${emoji}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        <button class="btn-gold" onclick="openMemoryGame()" style="margin-top:15px">New Game</button>
    `;
}

function flipMemoryCard(index) {
    if (memoryLocked) return;
    if (memoryFlipped.includes(index)) return;
    if (memoryMatched.includes(index)) return;
    
    memoryFlipped.push(index);
    document.getElementById(`mem${index}`).classList.add('flipped');
    
    if (memoryFlipped.length === 2) {
        memoryMoves++;
        document.getElementById('memMoves').textContent = memoryMoves;
        memoryLocked = true;
        
        const [a, b] = memoryFlipped;
        if (memoryCards[a] === memoryCards[b]) {
            memoryMatched.push(a, b);
            memoryFlipped = [];
            memoryLocked = false;
            
            if (memoryMatched.length === memoryCards.length) {
                setTimeout(() => {
                    showToast(`🎉 Completed in ${memoryMoves} moves!`);
                    updateGameStats('win');
                }, 500);
            }
        } else {
            setTimeout(() => {
                document.getElementById(`mem${a}`).classList.remove('flipped');
                document.getElementById(`mem${b}`).classList.remove('flipped');
                memoryFlipped = [];
                memoryLocked = false;
            }, 800);
        }
    }
}

console.log('✅ Memory Game loaded');
