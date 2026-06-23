function openGames() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<h2 style="color:#D4AF37;margin-bottom:10px;text-align:center">🎮 Games Hub</h2>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px;background:rgba(212,175,55,0.1);padding:8px 12px;border-radius:8px">🎯 Classic</h3>' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:10px">' +
            '<button class="btn-out" onclick="playGame(\'tictactoe\',\'startTTT\')">❌⭕ Tic Tac Toe</button>' +
            '<button class="btn-out" onclick="playGame(\'snake\',\'startSnake\')">🐍 Snake</button>' +
            '<button class="btn-out" onclick="playGame(\'pong\',\'startPong\')">🏓 Pong</button>' +
            '<button class="btn-out" onclick="playGame(\'flappy\',\'startFlappy\')">🐦 Flappy Bird</button>' +
            '<button class="btn-out" onclick="playGame(\'pacman\',\'startPacman\')">🟡 Pac-Man</button>' +
            '<button class="btn-out" onclick="playGame(\'tetris\',\'startTetris\')">🧊 Tetris</button>' +
        '</div>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px;background:rgba(0,212,255,0.1);padding:8px 12px;border-radius:8px">🚀 Arcade</h3>' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:10px">' +
            '<button class="btn-out" onclick="playGame(\'invaders\',\'startInvaders\')">👾 Space Invaders</button>' +
            '<button class="btn-out" onclick="playGame(\'breakout\',\'startBreakout\')">🧱 Breakout</button>' +
            '<button class="btn-out" onclick="playGame(\'tower\',\'startTowerDefense\')">🏰 Tower Defense</button>' +
            '<button class="btn-out" onclick="playGame(\'runner\',\'startRunner\')">🏃 Runner</button>' +
        '</div>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px;background:rgba(124,58,237,0.1);padding:8px 12px;border-radius:8px">🧠 Puzzle</h3>' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:10px">' +
            '<button class="btn-out" onclick="playGame(\'memory\',\'startMemory\')">🧠 Memory Match</button>' +
            '<button class="btn-out" onclick="playGame(\'quiz\',\'startQuiz\')">❓ Quiz</button>' +
            '<button class="btn-out" onclick="playGame(\'number\',\'startNumberGuess\')">🔢 Number Guess</button>' +
            '<button class="btn-out" onclick="playGame(\'2048\',\'start2048\')">🔲 2048</button>' +
        '</div>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px;background:rgba(255,71,87,0.1);padding:8px 12px;border-radius:8px">🎰 Casino</h3>' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:10px">' +
            '<button class="btn-out" onclick="playGame(\'rps\',\'startRPS\')">✂️ RPS</button>' +
            '<button class="btn-out" onclick="playGame(\'slots\',\'startSlots\')">🎰 Slots</button>' +
            '<button class="btn-out" onclick="playGame(\'blackjack\',\'startBlackjack\')">🃏 Blackjack</button>' +
        '</div>';
}

function playGame(name, funcName) {
    if (typeof window[funcName] === 'function') {
        window[funcName]();
        if (typeof addXP === 'function') addXP(20);
        return;
    }
    
    var files = {
        tictactoe:'tictactoe.js',snake:'snake.js',pong:'pong.js',flappy:'flappy.js',
        pacman:'pacman.js',tetris:'tetris.js',invaders:'invaders.js',breakout:'breakout.js',
        tower:'tower.js',runner:'runner.js',memory:'memory.js',quiz:'quiz.js',
        number:'number.js','2048':'2048.js',rps:'rps.js',slots:'slots.js',blackjack:'blackjack.js'
    };
    
    showToast('Loading game...');
    var s = document.createElement('script');
    s.src = 'js/games/' + files[name];
    s.onload = function() {
        if (typeof window[funcName] === 'function') {
            window[funcName]();
            if (typeof addXP === 'function') addXP(20);
        }
    };
    document.head.appendChild(s);
}
