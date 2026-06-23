function openGames() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<h2 style="color:#D4AF37;text-align:center;margin-bottom:15px">🎮 Games Hub</h2>' +
        '<h3 style="color:#D4AF37;font-size:13px;margin:10px 0;background:rgba(212,175,55,0.1);padding:8px 12px;border-radius:8px">🎯 Classic Games</h3>' +
        '<button class="btn-out" onclick="safeStart(\'tictactoe\')">❌⭕ Tic Tac Toe</button>' +
        '<button class="btn-out" onclick="safeStart(\'snake\')">🐍 Snake</button>';
}

function safeStart(name) {
    try {
        if (name === 'tictactoe' && typeof startTTT === 'function') {
            startTTT();
        } else if (name === 'snake' && typeof startSnake === 'function') {
            startSnake();
        }
    } catch(e) {
        showToast('Game loading...');
    }
}
