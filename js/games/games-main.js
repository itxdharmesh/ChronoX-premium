function openGames() {
    openModal('gamesModal');
    var content = document.getElementById('gamesContent');
    if (!content) return;
    
    content.innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px;text-align:center">🎮 Games Hub</h2>' +
        '<button class="btn-out" onclick="launchGame(\'tictactoe\')">❌⭕ Tic Tac Toe</button>' +
        '<button class="btn-out" onclick="launchGame(\'snake\')">🐍 Snake</button>' +
        '<button class="btn-out" onclick="launchGame(\'pong\')">🏓 Pong</button>' +
        '<button class="btn-out" onclick="launchGame(\'flappy\')">🐦 Flappy Bird</button>' +
        '<button class="btn-out" onclick="launchGame(\'invaders\')">👾 Space Invaders</button>' +
        '<button class="btn-out" onclick="launchGame(\'breakout\')">🧱 Breakout</button>' +
        '<button class="btn-out" onclick="launchGame(\'tower\')">🏰 Tower Defense</button>' +
        '<button class="btn-out" onclick="launchGame(\'runner\')">🏃 Runner</button>' +
        '<button class="btn-out" onclick="launchGame(\'memory\')">🧠 Memory Match</button>' +
        '<button class="btn-out" onclick="launchGame(\'quiz\')">❓ Quiz</button>' +
        '<button class="btn-out" onclick="launchGame(\'rps\')">✂️ Rock Paper Scissors</button>' +
        '<button class="btn-out" onclick="launchGame(\'number\')">🔢 Number Guess</button>' +
        '<button class="btn-out" onclick="closeModal(\'gamesModal\')" style="margin-top:10px">Close</button>';
}

// Loading screen
function showLoading(gameName) {
    var names = {tictactoe:'Tic Tac Toe',snake:'Snake',pong:'Pong',flappy:'Flappy Bird',invaders:'Space Invaders',breakout:'Breakout',tower:'Tower Defense',runner:'Infinite Runner',memory:'Memory Match',quiz:'Quiz Challenge',rps:'Rock Paper Scissors',number:'Number Guess'};
    var loader = document.createElement('div');
    loader.id = 'gameLoader';
    loader.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#0A0E27;z-index:8000;display:flex;align-items:center;justify-content:center;flex-direction:column';
    loader.innerHTML = '<div style="font-size:60px;animation:pulse 1s infinite">🕷️</div><h2 style="color:#D4AF37;margin:15px 0">ChronoX</h2><p style="color:rgba(255,255,255,0.6);margin-bottom:20px">'+(names[gameName]||gameName)+' is loading...</p><div style="width:150px;height:3px;background:rgba(255,255,255,0.1);border-radius:10px;overflow:hidden"><div style="width:40%;height:100%;background:linear-gradient(90deg,#D4AF37,#00D4FF);border-radius:10px;animation:loadShimmer 1s infinite"></div></div>';
    document.body.appendChild(loader);
}

function hideLoading() {
    var loader = document.getElementById('gameLoader');
    if (loader) { loader.style.opacity = '0'; loader.style.transition = '0.3s'; setTimeout(function() { if(loader.parentNode) loader.remove(); }, 300); }
}

function launchGame(name) {
    closeModal('gamesModal');
    showLoading(name);
    setTimeout(function() {
        hideLoading();
        var funcs = {tictactoe:startTTT,snake:startSnake,pong:startPong,flappy:startFlappy,invaders:startInvaders,breakout:startBreakout,tower:startTowerDefense,runner:startRunner,memory:startMemory,quiz:startQuiz,rps:startRPS,number:startNumberGuess};
        if (funcs[name]) funcs[name]();
    }, 1500);
}

// Global game functions
var gameCanvas, gameCtx, gameAnimation, gameActive = false, gameScore = 0, currentGameRestart = null;

function openGameScreen(title) {
    var existing = document.getElementById('fullGame');
    if (existing) existing.remove();
    if (gameAnimation) cancelAnimationFrame(gameAnimation);
    gameActive = true; gameScore = 0;
    
    var html = '<div id="fullGame" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#0A0E27;z-index:7500;display:flex;flex-direction:column">'+
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 15px;background:rgba(19,24,66,0.95);border-bottom:1px solid rgba(212,175,55,0.2);flex-shrink:0">'+
            '<button onclick="closeGameScreen()" style="background:none;border:none;color:#D4AF37;font-size:22px;cursor:pointer">← Back</button>'+
            '<h3 style="color:#D4AF37;font-size:16px;margin:0">'+title+'</h3>'+
            '<span id="gameScoreDisplay" style="color:#D4AF37;font-weight:700">Score: 0</span>'+
        '</div>'+
        '<canvas id="gameCanvas" style="flex:1;width:100%;display:block;background:#0A0E27"></canvas>'+
        '<div id="gameOverScreen" style="display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;background:rgba(19,24,66,0.95);padding:30px;border-radius:20px;border:1px solid #D4AF37;z-index:10">'+
            '<h2 style="color:#D4AF37;margin-bottom:10px">Game Over!</h2>'+
            '<p style="color:#fff;font-size:18px">Score: <span id="finalScore" style="color:#D4AF37"></span></p>'+
            '<button class="btn" onclick="restartCurrentGame()" style="margin:8px">🔄 Restart</button>'+
            '<button class="btn-out" onclick="closeGameScreen()" style="margin:8px">🚪 Exit</button>'+
        '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
    gameCanvas = document.getElementById('gameCanvas');
    gameCtx = gameCanvas.getContext('2d');
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight - 100;
}

function closeGameScreen() {
    gameActive = false;
    if (gameAnimation) cancelAnimationFrame(gameAnimation);
    var el = document.getElementById('fullGame');
    if (el) el.remove();
    gameCanvas = null; gameCtx = null;
}

function updateGameScore(points) {
    gameScore += Math.floor(points);
    var d = document.getElementById('gameScoreDisplay');
    if (d) d.textContent = 'Score: ' + gameScore;
}

function endGame(msg) {
    gameActive = false;
    if (gameAnimation) cancelAnimationFrame(gameAnimation);
    document.getElementById('finalScore').textContent = gameScore;
    document.getElementById('gameOverScreen').style.display = 'block';
    if (gameScore > 0 && typeof addXP === 'function') addXP(Math.floor(gameScore / 10));
}

function restartCurrentGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    gameScore = 0; updateGameScore(0);
    gameActive = true;
    if (currentGameRestart) currentGameRestart();
}

document.addEventListener('click', function(e) { if (e.target.classList.contains('modal')) e.target.classList.remove('show'); });
console.log('✅ Games Hub ready');
