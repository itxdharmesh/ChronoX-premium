function openGames() {
    openModal('gamesModal');
    document.getElementById('gamesContent').innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px;text-align:center">🎮 Games Hub</h2>' +
        '<h3 style="color:var(--gold-light);margin:15px 0 10px;font-size:13px">🎯 Premium Games</h3>' +
        '<button class="btn-out" onclick="startSnakePremium()">🐍 Snake</button>' +
        '<button class="btn-out" onclick="startPongPremium()">🏓 Pong</button>' +
        '<button class="btn-out" onclick="startRunnerPremium()">🏃 Runner</button>' +
        '<button class="btn-out" onclick="startFlappyPremium()">🐦 Flappy Bird</button>' +
        '<button class="btn-out" onclick="startInvadersPremium()">👾 Space Invaders</button>' +
        '<button class="btn-out" onclick="startBreakoutPremium()">🧱 Breakout</button>' +
        '<button class="btn-out" onclick="startTowerDefensePremium()">🏰 Tower Defense</button>' +
        '<button class="btn-out" onclick="startTTTPremium()">❌⭕ Tic Tac Toe</button>' +
        '<button class="btn-out" onclick="closeModal(\'gamesModal\')">Close</button>';
}
