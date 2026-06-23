function openGames() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<h2 style="color:#D4AF37;margin-bottom:10px;text-align:center">🎮 Games Hub</h2>' +
        '<p style="color:rgba(255,255,255,0.5);font-size:11px;text-align:center;margin-bottom:15px">30 Premium Games | ⚡ XP Rewards</p>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px;background:rgba(212,175,55,0.1);padding:8px 12px;border-radius:8px">🎯 Classic Games</h3>' +
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
            '<button class="btn-out" onclick="playGame(\'bubble\',\'startBubble\')">🫧 Bubble Shooter</button>' +
            '<button class="btn-out" onclick="playGame(\'racing\',\'startRacing\')">🏎️ Racing</button>' +
        '</div>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px;background:rgba(124,58,237,0.1);padding:8px 12px;border-radius:8px">🧠 Puzzle</h3>' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:10px">' +
            '<button class="btn-out" onclick="playGame(\'memory\',\'startMemory\')">🧠 Memory Match</button>' +
            '<button class="btn-out" onclick="playGame(\'quiz\',\'startQuiz\')">❓ Quiz</button>' +
            '<button class="btn-out" onclick="playGame(\'number\',\'startNumberGuess\')">🔢 Number Guess</button>' +
            '<button class="btn-out" onclick="playGame(\'2048\',\'start2048\')">🔲 2048</button>' +
            '<button class="btn-out" onclick="playGame(\'sudoku\',\'startSudoku\')">🧩 Sudoku</button>' +
            '<button class="btn-out" onclick="playGame(\'wordle\',\'startWordle\')">🟩 Wordle</button>' +
            '<button class="btn-out" onclick="playGame(\'minesweeper\',\'startMinesweeper\')">💣 Minesweeper</button>' +
            '<button class="btn-out" onclick="playGame(\'match3\',\'startMatch3\')">💎 Match 3</button>' +
        '</div>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px;background:rgba(46,213,115,0.1);padding:8px 12px;border-radius:8px">🎲 Board Games</h3>' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:10px">' +
            '<button class="btn-out" onclick="playGame(\'connect4\',\'startConnect4\')">🔴 Connect Four</button>' +
            '<button class="btn-out" onclick="playGame(\'chess\',\'startChess\')">♟️ Chess</button>' +
            '<button class="btn-out" onclick="playGame(\'ludo\',\'startLudo\')">🎲 Ludo</button>' +
            '<button class="btn-out" onclick="playGame(\'doodle\',\'startDoodle\')">🎨 Doodle Jump</button>' +
        '</div>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px;background:rgba(255,71,87,0.1);padding:8px 12px;border-radius:8px">🎰 Casino | 💰 Entry: 30 coins</h3>' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:10px">' +
            '<button class="btn-out" onclick="playGame(\'rps\',\'startRPS\')">✂️ RPS</button>' +
            '<button class="btn-out" onclick="playGame(\'slots\',\'startSlots\')">🎰 Slots</button>' +
            '<button class="btn-out" onclick="playGame(\'blackjack\',\'startBlackjack\')">🃏 Blackjack</button>' +
        '</div>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px;background:rgba(255,165,2,0.1);padding:8px 12px;border-radius:8px">⚽ Sports</h3>' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:10px">' +
            '<button class="btn-out" onclick="playGame(\'basketball\',\'startBasketball\')">🏀 Basketball</button>' +
            '<button class="btn-out" onclick="playGame(\'football\',\'startFootball\')">⚽ Penalty Shootout</button>' +
            '<button class="btn-out" onclick="playGame(\'traffic\',\'startTraffic\')">🚦 Traffic Control</button>' +
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
        tower:'tower.js',runner:'runner.js',bubble:'bubble.js',racing:'racing.js',
        memory:'memory.js',quiz:'quiz.js',number:'number.js','2048':'2048.js',
        sudoku:'sudoku.js',wordle:'wordle.js',minesweeper:'minesweeper.js',
        connect4:'connect4.js',doodle:'doodle.js',ludo:'ludo.js',
        rps:'rps.js',slots:'slots.js',blackjack:'blackjack.js',
        basketball:'basketball.js',football:'football.js',traffic:'traffic.js',
        match3:'match3.js',chess:'chess.js'
    };
    
    showToast('Loading...');
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
