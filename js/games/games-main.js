function openGames() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    var games = [
        {n:'❌⭕ Tic Tac Toe',f:'startTTT'},
        {n:'🐍 Snake',f:'startSnake'},
        {n:'🏓 Pong',f:'startPong'},
        {n:'🐦 Flappy Bird',f:'startFlappy'},
        {n:'👾 Space Invaders',f:'startInvaders'},
        {n:'🧱 Breakout',f:'startBreakout'},
        {n:'🏰 Tower Defense',f:'startTowerDefense'},
        {n:'🏃 Runner',f:'startRunner'},
        {n:'🧠 Memory Match',f:'startMemory'},
        {n:'❓ Quiz',f:'startQuiz'},
        {n:'🔢 Number Guess',f:'startNumberGuess'},
        {n:'🔲 2048',f:'start2048'},
        {n:'✂️ RPS',f:'startRPS'},
        {n:'🎰 Slots',f:'startSlots'}
    ];
    
    var h = '<h2 style="color:#D4AF37;text-align:center;margin-bottom:15px">🎮 Games Hub</h2>';
    
    for (var i = 0; i < games.length; i++) {
        h += '<button class="btn-out" onclick="tryGame(\'' + games[i].f + '\')">' + games[i].n + '</button>';
    }
    
    c.innerHTML = h;
}

function tryGame(funcName) {
    if (typeof window[funcName] === 'function') {
        window[funcName]();
        if (typeof addXP === 'function') addXP(20);
    } else {
        showToast('Game loading... Try again!');
        if (typeof addXP === 'function') addXP(20);
    }
}
