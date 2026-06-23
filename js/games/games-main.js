function openGames() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<h2 style="color:#D4AF37;text-align:center;margin-bottom:15px">🎮 Games Hub</h2>' +
        '<button class="btn-out" onclick="startGame()">❌⭕ Tic Tac Toe</button>' +
        '<p style="text-align:center;color:rgba(255,255,255,0.4);font-size:11px;margin-top:20px">More games coming soon! 🚧</p>';
}

function startGame() {
    if (typeof startTTT === 'function') {
        startTTT();
        if (typeof addXP === 'function') addXP(25);
    } else {
        showToast('Game loading...');
    }
}
