var gamesLoaded = {};

function openGames() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<h2 style="color:#D4AF37;margin-bottom:10px;text-align:center">🎮 Games Hub</h2>' +
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">🎯 Classic</h3>' +
        '<button class="btn-out" onclick="playGame(\'tictactoe\')">❌⭕ Tic Tac Toe</button>' +
        '<button class="btn-out" onclick="playGame(\'snake\')">🐍 Snake</button>' +
        '<button class="btn-out" onclick="playGame(\'pong\')">🏓 Pong</button>' +
        '<button class="btn-out" onclick="playGame(\'flappy\')">🐦 Flappy Bird</button>' +
        '<button class="btn-out" onclick="playGame(\'pacman\')">🟡 Pac-Man</button>' +
        '<button class="btn-out" onclick="playGame(\'tetris\')">🧊 Tetris</button>' +
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">🚀 Arcade</h3>' +
        '<button class="btn-out" onclick="playGame(\'invaders\')">👾 Space Invaders</button>' +
        '<button class="btn-out" onclick="playGame(\'breakout\')">🧱 Breakout</button>' +
        '<button class="btn-out" onclick="playGame(\'tower\')">🏰 Tower Defense</button>' +
        '<button class="btn-out" onclick="playGame(\'runner\')">🏃 Runner</button>' +
        '<button class="btn-out" onclick="playGame(\'bubble\')">🫧 Bubble Shooter</button>' +
        '<button class="btn-out" onclick="playGame(\'racing\')">🏎️ Racing</button>' +
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">🧠 Puzzle</h3>' +
        '<button class="btn-out" onclick="playGame(\'memory\')">🧠 Memory Match</button>' +
        '<button class="btn-out" onclick="playGame(\'quiz\')">❓ Quiz</button>' +
        '<button class="btn-out" onclick="playGame(\'number\')">🔢 Number Guess</button>' +
        '<button class="btn-out" onclick="playGame(\'2048\')">🔲 2048</button>' +
        '<button class="btn-out" onclick="playGame(\'sudoku\')">🧩 Sudoku</button>' +
        '<button class="btn-out" onclick="playGame(\'wordle\')">🟩 Wordle</button>' +
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">🎲 Board</h3>' +
        '<button class="btn-out" onclick="playGame(\'connect4\')">🔴 Connect Four</button>' +
        '<button class="btn-out" onclick="playGame(\'chess\')">♟️ Chess</button>' +
        '<button class="btn-out" onclick="playGame(\'ludo\')">🎲 Ludo</button>' +
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">🎰 Casino</h3>' +
        '<button class="btn-out" onclick="playGame(\'rps\')">✂️ RPS</button>' +
        '<button class="btn-out" onclick="playGame(\'slots\')">🎰 Slots</button>' +
        '<button class="btn-out" onclick="playGame(\'blackjack\')">🃏 Blackjack</button>' +
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">⚽ Sports</h3>' +
        '<button class="btn-out" onclick="playGame(\'basketball\')">🏀 Basketball</button>' +
        '<button class="btn-out" onclick="playGame(\'football\')">⚽ Penalty</button>';
}

function playGame(name) {
    var fileMap = {
        tictactoe:'tictactoe.js', snake:'snake.js', pong:'pong.js', flappy:'flappy.js',
        pacman:'pacman.js', tetris:'tetris.js', invaders:'invaders.js', breakout:'breakout.js',
        tower:'tower.js', runner:'runner.js', bubble:'bubble.js', racing:'racing.js',
        memory:'memory.js', quiz:'quiz.js', number:'number.js', '2048':'2048.js',
        sudoku:'sudoku.js', wordle:'wordle.js', minesweeper:'minesweeper.js',
        connect4:'connect4.js', doodle:'doodle.js', ludo:'ludo.js',
        rps:'rps.js', slots:'slots.js', blackjack:'blackjack.js',
        basketball:'basketball.js', football:'football.js', traffic:'traffic.js',
        match3:'match3.js', chess:'chess.js'
    };
    
    var funcMap = {
        tictactoe:'startTTT', snake:'startSnake', pong:'startPong', flappy:'startFlappy',
        pacman:'startPacman', tetris:'startTetris', invaders:'startInvaders', breakout:'startBreakout',
        tower:'startTowerDefense', runner:'startRunner', bubble:'startBubble', racing:'startRacing',
        memory:'startMemory', quiz:'startQuiz', number:'startNumberGuess', '2048':'start2048',
        sudoku:'startSudoku', wordle:'startWordle', minesweeper:'startMinesweeper',
        connect4:'startConnect4', doodle:'startDoodle', ludo:'startLudo',
        rps:'startRPS', slots:'startSlots', blackjack:'startBlackjack',
        basketball:'startBasketball', football:'startFootball', traffic:'startTraffic',
        match3:'startMatch3', chess:'startChess'
    };
    
    var fileName = fileMap[name];
    var funcName = funcMap[name];
    
    if (!fileName) { showToast('Game not found!', 'error'); return; }
    
    // Check if already loaded
    if (gamesLoaded[name] && typeof window[funcName] === 'function') {
        window[funcName]();
        if (typeof addXP === 'function') addXP(20);
        return;
    }
    
    // Load game script dynamically
    showToast('Loading game...');
    var script = document.createElement('script');
    script.src = 'js/games/' + fileName;
    script.onload = function() {
        gamesLoaded[name] = true;
        if (typeof window[funcName] === 'function') {
            window[funcName]();
            if (typeof addXP === 'function') addXP(20);
        } else {
            showToast('Game loaded! Tap again to play');
        }
    };
    script.onerror = function() {
        showToast('Failed to load game', 'error');
    };
    document.head.appendChild(script);
}
