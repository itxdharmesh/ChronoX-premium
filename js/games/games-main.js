function openGames() {
    var content = document.getElementById('contentArea');
    if (!content) return;
    
    content.innerHTML = 
        '<h2 style="color:#D4AF37;margin-bottom:15px;text-align:center">🎮 Games Hub</h2>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">🎯 Classic</h3>' +
        '<button class="btn-out" onclick="launchGame(\'tictactoe\')">❌⭕ Tic Tac Toe</button>' +
        '<button class="btn-out" onclick="launchGame(\'snake\')">🐍 Snake</button>' +
        '<button class="btn-out" onclick="launchGame(\'pong\')">🏓 Pong</button>' +
        '<button class="btn-out" onclick="launchGame(\'flappy\')">🐦 Flappy Bird</button>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">🚀 Arcade</h3>' +
        '<button class="btn-out" onclick="launchGame(\'invaders\')">👾 Space Invaders</button>' +
        '<button class="btn-out" onclick="launchGame(\'breakout\')">🧱 Breakout</button>' +
        '<button class="btn-out" onclick="launchGame(\'tower\')">🏰 Tower Defense</button>' +
        '<button class="btn-out" onclick="launchGame(\'runner\')">🏃 Runner</button>' +
        
        '<h3 style="color:#D4AF37;margin:10px 0;font-size:13px">🧠 Puzzle</h3>' +
        '<button class="btn-out" onclick="launchGame(\'memory\')">🧠 Memory Match</button>' +
        '<button class="btn-out" onclick="launchGame(\'quiz\')">❓ Quiz</button>' +
        '<button class="btn-out" onclick="launchGame(\'rps\')">✂️ Rock Paper Scissors</button>' +
        '<button class="btn-out" onclick="launchGame(\'number\')">🔢 Number Guess</button>';
}

function launchGame(name) {
    var funcs = {
        tictactoe: typeof startTTT,
        snake: typeof startSnake,
        pong: typeof startPong,
        flappy: typeof startFlappy,
        invaders: typeof startInvaders,
        breakout: typeof startBreakout,
        tower: typeof startTowerDefense,
        runner: typeof startRunner,
        memory: typeof startMemory,
        quiz: typeof startQuiz,
        rps: typeof startRPS,
        number: typeof startNumberGuess
    };
    
    if (typeof funcs[name] === 'function' && funcs[name]) {
        var f = {
            tictactoe: startTTT, snake: startSnake, pong: startPong, flappy: startFlappy,
            invaders: startInvaders, breakout: startBreakout, tower: startTowerDefense,
            runner: startRunner, memory: startMemory, quiz: startQuiz, rps: startRPS,
            number: startNumberGuess
        };
        if (f[name]) f[name]();
    } else {
        showToast('🎮 Game coming soon! 🚧');
    }
}
