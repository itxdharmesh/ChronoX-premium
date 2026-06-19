// ==================== GAMES MAIN MENU ====================

function openGames() {
    openModal('gamesModal');
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header">
            <h2>🎮 Games</h2>
            <button onclick="closeModal('gamesModal')">✕</button>
        </div>
        <p style="color:var(--text2);margin-bottom:15px;text-align:center">Choose a game mode</p>
        
        <h3 style="color:var(--gold);margin-bottom:10px">👤 Single Player</h3>
        <button class="btn-outline game-btn" onclick="openTicTacToe()">❌⭕ Tic Tac Toe (X O)</button>
        <button class="btn-outline game-btn" onclick="openMemoryGame()">🧠 Memory Match</button>
        <button class="btn-outline game-btn" onclick="openSnakeLadder()">🐍 Saap Sidhi 🪜</button>
        <button class="btn-outline game-btn" onclick="openUno()">🃏 UNO</button>
        <button class="btn-outline game-btn" onclick="openLudo()">🎲 Ludo</button>
        
        <h3 style="color:var(--gold);margin:15px 0 10px">👥 Multiplayer</h3>
        <button class="btn-outline game-btn" onclick="openMultiplayer()">🔗 Challenge a Friend</button>
    `;
}

console.log('✅ Games menu loaded');
