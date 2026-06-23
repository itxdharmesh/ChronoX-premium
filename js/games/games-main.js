function openGames() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<h2 style="color:#D4AF37;margin-bottom:15px;text-align:center">🎮 Games Hub</h2>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">🎯 Classic | ⚡ XP</h3>' +
        '<button class="btn-out" onclick="startGame(\'tictactoe\')">❌⭕ Tic Tac Toe</button>' +
        '<button class="btn-out" onclick="startGame(\'snake\')">🐍 Snake</button>' +
        '<button class="btn-out" onclick="startGame(\'pong\')">🏓 Pong</button>' +
        '<button class="btn-out" onclick="startGame(\'flappy\')">🐦 Flappy Bird</button>' +
        '<button class="btn-out" onclick="startGame(\'pacman\')">🟡 Pac-Man</button>' +
        '<button class="btn-out" onclick="startGame(\'tetris\')">🧊 Tetris</button>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">🚀 Arcade | ⚡ XP</h3>' +
        '<button class="btn-out" onclick="startGame(\'invaders\')">👾 Space Invaders</button>' +
        '<button class="btn-out" onclick="startGame(\'breakout\')">🧱 Breakout</button>' +
        '<button class="btn-out" onclick="startGame(\'tower\')">🏰 Tower Defense</button>' +
        '<button class="btn-out" onclick="startGame(\'runner\')">🏃 Runner</button>' +
        '<button class="btn-out" onclick="startGame(\'bubble\')">🫧 Bubble Shooter</button>' +
        '<button class="btn-out" onclick="startGame(\'racing\')">🏎️ Racing</button>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">🧠 Puzzle | ⚡ XP</h3>' +
        '<button class="btn-out" onclick="startGame(\'memory\')">🧠 Memory Match</button>' +
        '<button class="btn-out" onclick="startGame(\'quiz\')">❓ Quiz</button>' +
        '<button class="btn-out" onclick="startGame(\'number\')">🔢 Number Guess</button>' +
        '<button class="btn-out" onclick="startGame(\'2048\')">🔲 2048</button>' +
        '<button class="btn-out" onclick="startGame(\'sudoku\')">🧩 Sudoku</button>' +
        '<button class="btn-out" onclick="startGame(\'wordle\')">🟩 Wordle</button>' +
        '<button class="btn-out" onclick="startGame(\'minesweeper\')">💣 Minesweeper</button>' +
        '<button class="btn-out" onclick="startGame(\'match3\')">💎 Match 3</button>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">🎲 Board | ⚡ XP</h3>' +
        '<button class="btn-out" onclick="startGame(\'chess\')">♟️ Chess</button>' +
        '<button class="btn-out" onclick="startGame(\'connect4\')">🔴 Connect Four</button>' +
        '<button class="btn-out" onclick="startGame(\'hangman\')">😵 Hangman</button>' +
        '<button class="btn-out" onclick="startGame(\'ludo\')">🎲 Ludo</button>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">🎰 Casino | 💰 Coins + ⚡ XP</h3>' +
        '<p style="color:rgba(255,255,255,0.5);font-size:10px;margin-bottom:5px">Entry: 30 coins | Win: up to 10 coins</p>' +
        '<button class="btn-out" onclick="startCasinoGame(\'rps\')">✂️ Rock Paper Scissors</button>' +
        '<button class="btn-out" onclick="startCasinoGame(\'slots\')">🎰 Lucky Slots</button>' +
        '<button class="btn-out" onclick="startCasinoGame(\'blackjack\')">🃏 Blackjack</button>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">⚽ Sports | ⚡ XP</h3>' +
        '<button class="btn-out" onclick="startGame(\'basketball\')">🏀 Basketball</button>' +
        '<button class="btn-out" onclick="startGame(\'football\')">⚽ Penalty</button>' +
        '<button class="btn-out" onclick="startGame(\'traffic\')">🚦 Traffic Control</button>';
}

function startGame(name) {
    var xpRewards = {
        tictactoe: 25, snake: 20, pong: 22, flappy: 18, pacman: 30, tetris: 28,
        invaders: 30, breakout: 24, tower: 35, runner: 21, bubble: 27, racing: 32,
        memory: 15, quiz: 26, number: 16, '2048': 32, sudoku: 27, wordle: 25,
        minesweeper: 26, match3: 28, chess: 40, connect4: 29, hangman: 22, ludo: 35,
        basketball: 30, football: 28, traffic: 33
    };
    
    var xp = xpRewards[name] || 20;
    
    var funcs = {
        tictactoe: 'startTTT', snake: 'startSnake', pong: 'startPong', flappy: 'startFlappy',
        invaders: 'startInvaders', breakout: 'startBreakout', tower: 'startTowerDefense',
        runner: 'startRunner', memory: 'startMemory', quiz: 'startQuiz',
        number: 'startNumberGuess'
    };
    
    if (funcs[name] && typeof window[funcs[name]] === 'function') {
        window[funcs[name]]();
        if (typeof addXP === 'function') addXP(xp);
    } else {
        showToast('🎮 ' + name + ' - +' + xp + ' XP!');
        if (typeof addXP === 'function') addXP(xp);
    }
}

function startCasinoGame(name) {
    var entryFee = 30;
    
    if ((currentUserData.coins || 0) < entryFee) {
        showToast('Need 30 coins to play! 😢', 'error');
        return;
    }
    
    if (!confirm('Pay 30 coins to play? Win up to 10 coins + XP!')) return;
    
    // Deduct entry fee
    if (typeof spendCoins === 'function') spendCoins(entryFee);
    if (currentUserData) currentUserData.coins = (currentUserData.coins || 0) - entryFee;
    
    var xpRewards = { rps: 12, slots: 25, blackjack: 38 };
    var xp = xpRewards[name] || 20;
    var coinWin = Math.floor(Math.random() * 10) + 1; // 1-10 coins
    
    var funcs = { rps: 'startRPS' };
    
    if (funcs[name] && typeof window[funcs[name]] === 'function') {
        window[funcs[name]]();
    } else {
        showToast('🎰 ' + name + ' - Won 💰' + coinWin + ' + ⚡' + xp + ' XP!');
    }
    
    if (typeof addXP === 'function') addXP(xp);
    if (typeof addCoins === 'function') addCoins(coinWin);
    if (currentUserData) currentUserData.coins = (currentUserData.coins || 0) + coinWin;
                  }
