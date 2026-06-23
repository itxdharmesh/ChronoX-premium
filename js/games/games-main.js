function openGames() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<h2 style="color:#D4AF37;text-align:center;margin-bottom:15px">🎮 Games Hub</h2>' +
        
        '<h3 style="color:#D4AF37;font-size:13px;margin:10px 0;background:rgba(212,175,55,0.1);padding:8px 12px;border-radius:8px">🎯 Classic Games</h3>' +
        '<button class="btn-out" onclick="safeStart(\'tictactoe\')">❌⭕ Tic Tac Toe</button>' +
        '<button class="btn-out" onclick="safeStart(\'snake\')">🐍 Snake</button>' +
        '<button class="btn-out" onclick="safeStart(\'pong\')">🏓 Pong</button>' +
        '<button class="btn-out" onclick="safeStart(\'flappy\')">🐦 Flappy Bird</button>' +
        
        '<h3 style="color:#D4AF37;font-size:13px;margin:10px 0;background:rgba(0,212,255,0.1);padding:8px 12px;border-radius:8px">🚀 Arcade</h3>' +
        '<button class="btn-out" onclick="safeStart(\'invaders\')">👾 Space Invaders</button>' +
        '<button class="btn-out" onclick="safeStart(\'breakout\')">🧱 Breakout</button>' +
        '<button class="btn-out" onclick="safeStart(\'runner\')">🏃 Runner</button>' +
        
        '<h3 style="color:#D4AF37;font-size:13px;margin:10px 0;background:rgba(124,58,237,0.1);padding:8px 12px;border-radius:8px">🧠 Puzzle</h3>' +
        '<button class="btn-out" onclick="safeStart(\'memory\')">🧠 Memory Match</button>' +
        '<button class="btn-out" onclick="safeStart(\'quiz\')">❓ Quiz</button>' +
        '<button class="btn-out" onclick="safeStart(\'number\')">🔢 Number Guess</button>' +
        
        '<p style="text-align:center;color:rgba(255,255,255,0.4);font-size:11px;margin-top:15px">Click any game to play! 🎮</p>';
}

function safeStart(name) {
    try {
        var funcs = {
            'tictactoe': startTTT,
            'snake': startSnake,
            'pong': startPong,
            'flappy': startFlappy,
            'invaders': startInvaders,
            'breakout': startBreakout,
            'runner': startRunner,
            'memory': startMemory,
            'quiz': startQuiz,
            'number': startNumberGuess
        };
        
        if (typeof funcs[name] === 'function') {
            funcs[name]();
        } else {
            showToast('🎮 Coming Soon! 🚧');
        }
    } catch(e) {
        showToast('🎮 Game loading...');
    }
}
