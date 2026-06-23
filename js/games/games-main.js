function openGames() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<div style="text-align:center">' +
            '<h2 style="color:#D4AF37;margin-bottom:15px;font-size:24px">🎮 Games Hub</h2>' +
            
            // TIC TAC TOE
            '<div class="card" onclick="safeStart(\'tictactoe\')" style="cursor:pointer;background:linear-gradient(135deg,rgba(212,175,55,0.1),rgba(0,212,255,0.05));border:1px solid rgba(212,175,55,0.2)">' +
                '<div style="display:flex;align-items:center;gap:15px">' +
                    '<div style="font-size:40px">❌</div>' +
                    '<div style="text-align:left;flex:1"><h3 style="color:#D4AF37;font-size:15px;margin:0">Tic Tac Toe</h3><p style="color:rgba(255,255,255,0.5);font-size:10px;margin:2px 0">3 Difficulties</p></div>' +
                    '<span style="color:#FFD700;font-size:10px">+25 XP</span>' +
                '</div>' +
            '</div>' +
            
            // SNAKE
            '<div class="card" onclick="safeStart(\'snake\')" style="cursor:pointer;background:linear-gradient(135deg,rgba(46,213,115,0.1),rgba(0,212,255,0.05));border:1px solid rgba(46,213,115,0.2)">' +
                '<div style="display:flex;align-items:center;gap:15px">' +
                    '<div style="font-size:40px">🐍</div>' +
                    '<div style="text-align:left;flex:1"><h3 style="color:#2ED573;font-size:15px;margin:0">Snake</h3><p style="color:rgba(255,255,255,0.5);font-size:10px;margin:2px 0">Speed increases</p></div>' +
                    '<span style="color:#FFD700;font-size:10px">+XP</span>' +
                '</div>' +
            '</div>' +
            
            // PONG
            '<div class="card" onclick="safeStart(\'pong\')" style="cursor:pointer;background:linear-gradient(135deg,rgba(0,212,255,0.1),rgba(124,58,237,0.05));border:1px solid rgba(0,212,255,0.2)">' +
                '<div style="display:flex;align-items:center;gap:15px">' +
                    '<div style="font-size:40px">🏓</div>' +
                    '<div style="text-align:left;flex:1"><h3 style="color:#00D4FF;font-size:15px;margin:0">Pong</h3><p style="color:rgba(255,255,255,0.5);font-size:10px;margin:2px 0">First to 7</p></div>' +
                    '<span style="color:#FFD700;font-size:10px">+35 XP</span>' +
                '</div>' +
            '</div>' +
            
            // FLAPPY BIRD
            '<div class="card" onclick="safeStart(\'flappy\')" style="cursor:pointer;background:linear-gradient(135deg,rgba(255,71,87,0.1),rgba(255,165,2,0.05));border:1px solid rgba(255,71,87,0.2)">' +
                '<div style="display:flex;align-items:center;gap:15px">' +
                    '<div style="font-size:40px">🐦</div>' +
                    '<div style="text-align:left;flex:1"><h3 style="color:#FF6B81;font-size:15px;margin:0">Flappy Bird</h3><p style="color:rgba(255,255,255,0.5);font-size:10px;margin:2px 0">Tap to fly</p></div>' +
                    '<span style="color:#FFD700;font-size:10px">+XP</span>' +
                '</div>' +
            '</div>' +
        '</div>';
}

function safeStart(name) {
    try {
        if (name === 'tictactoe' && typeof startTTT === 'function') startTTT();
        else if (name === 'snake' && typeof startSnake === 'function') startSnake();
        else if (name === 'pong' && typeof startPong === 'function') startPong();
        else if (name === 'flappy' && typeof startFlappy === 'function') startFlappy();
    } catch(e) { showToast('Game loading...'); }
}
