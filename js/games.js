// ==================== GAMES HUB - 10 GAMES ====================
var gameCanvas, gameCtx, gameAnimation, gameActive = false, gameScore = 0;
var currentGameRestart = null;
var snake, snakeDir, snakeFood, snakeInterval;
var pongBall, pongPaddle, pongAIPaddle;
var flappyBird, flappyPipes;
var invaders, invaderBullets, playerBullet, playerPos;
var bricks, breakPaddle, breakBall;
var towers, enemies, tdLives, tdGold;
var runner, obstacles, runnerSpeed;
var ttt = [], tttActive = false, tttDiff = 'medium';

function openGames() {
    openModal('gamesModal');
    document.getElementById('gamesContent').innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px;text-align:center">🎮 Games Hub</h2>' +
        '<h3 style="color:var(--gold-light);margin:15px 0 10px;font-size:13px">🎯 Classic</h3>' +
        '<button class="btn-out" onclick="startTTT()">❌⭕ Tic Tac Toe</button>' +
        '<button class="btn-out" onclick="startSnake()">🐍 Snake</button>' +
        '<button class="btn-out" onclick="startPong()">🏓 Pong</button>' +
        '<button class="btn-out" onclick="startFlappy()">🐦 Flappy Bird</button>' +
        '<h3 style="color:var(--gold-light);margin:15px 0 10px;font-size:13px">🚀 Arcade</h3>' +
        '<button class="btn-out" onclick="startSpaceInvaders()">👾 Space Invaders</button>' +
        '<button class="btn-out" onclick="startBreakout()">🧱 Breakout</button>' +
        '<button class="btn-out" onclick="startTowerDefense()">🏰 Tower Defense</button>' +
        '<button class="btn-out" onclick="startRunner()">🏃 Infinite Runner</button>' +
        '<h3 style="color:var(--gold-light);margin:15px 0 10px;font-size:13px">🏆 Challenge</h3>' +
        '<button class="btn-out" onclick="startQuiz()">❓ Quiz</button>' +
        '<button class="btn-out" onclick="startRPS()">✂️ Rock Paper Scissors</button>' +
        '<h3 style="color:var(--gold-light);margin:15px 0 10px;font-size:13px">👥 Multiplayer</h3>' +
        '<button class="btn-out" onclick="showMultiplayer()">🔗 Challenge Friend</button>' +
        '<button class="btn-out" onclick="closeModal(\'gamesModal\')">Close</button>';
}

function openFullPageGame(title) {
    closeModal('gamesModal');
    var el = document.getElementById('fullGame');
    if (el) el.remove();
    if (snakeInterval) clearInterval(snakeInterval);
    if (gameAnimation) cancelAnimationFrame(gameAnimation);
    gameActive = true;
    gameScore = 0;
    
    var html = '<div id="fullGame" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#0A0E27;z-index:7000;display:flex;flex-direction:column">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 15px;background:rgba(19,24,66,0.95);border-bottom:1px solid var(--border)">' +
            '<button onclick="closeFullGame()" style="background:none;border:none;color:var(--gold);font-size:22px;cursor:pointer">←</button>' +
            '<h3 style="color:var(--gold);font-size:16px">' + title + '</h3>' +
            '<span id="gameScoreDisplay" style="color:var(--gold);font-weight:700">Score: 0</span>' +
        '</div>' +
        '<canvas id="gameCanvas" style="flex:1;width:100%;display:block;background:#0A0E27"></canvas>' +
        '<div id="gameOverScreen" style="display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;background:rgba(19,24,66,0.95);padding:30px;border-radius:20px;border:1px solid var(--gold);z-index:10">' +
            '<h2 style="color:var(--gold);margin-bottom:10px">Game Over!</h2>' +
            '<p style="color:#fff;font-size:18px;margin:10px 0">Score: <span id="finalScore" style="color:var(--gold)"></span></p>' +
            '<p id="challengeResult" style="color:var(--gold-light);margin:10px 0"></p>' +
            '<button class="btn" onclick="restartGame()" style="margin:5px">🔄 Restart</button>' +
            '<button class="btn-out" onclick="closeFullGame()" style="margin:5px">🚪 Exit</button>' +
        '</div>' +
    '</div>';
    document.body.insertAdjacentHTML('beforeend', html);
    gameCanvas = document.getElementById('gameCanvas');
    gameCtx = gameCanvas.getContext('2d');
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight - 100;
}

function closeFullGame() {
    gameActive = false;
    if (gameAnimation) cancelAnimationFrame(gameAnimation);
    if (snakeInterval) clearInterval(snakeInterval);
    var el = document.getElementById('fullGame');
    if (el) el.remove();
    gameCanvas = null;
    gameCtx = null;
}

function updateScore(points) {
    gameScore += Math.floor(points);
    var display = document.getElementById('gameScoreDisplay');
    if (display) display.textContent = 'Score: ' + gameScore;
}

function gameOver(msg) {
    gameActive = false;
    if (gameAnimation) cancelAnimationFrame(gameAnimation);
    if (snakeInterval) clearInterval(snakeInterval);
    var finalScore = document.getElementById('finalScore');
    var challengeResult = document.getElementById('challengeResult');
    if (finalScore) finalScore.textContent = gameScore;
    if (challengeResult && msg) challengeResult.textContent = msg;
    var overlay = document.getElementById('gameOverScreen');
    if (overlay) overlay.style.display = 'block';
    if (gameScore > 0) addXP(Math.floor(gameScore / 10));
}

function restartGame() {
    var overlay = document.getElementById('gameOverScreen');
    if (overlay) overlay.style.display = 'none';
    gameScore = 0;
    updateScore(0);
    gameActive = true;
    if (currentGameRestart) currentGameRestart();
}

// ==================== TIC TAC TOE ====================
function startTTT() {
    ttt = ['','','','','','','','',''];
    tttActive = true;
    openFullPageGame('❌⭕ Tic Tac Toe');
    gameCanvas.style.display = 'none';
    
    var div = document.createElement('div');
    div.id = 'tttContainer';
    div.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;overflow-y:auto';
    
    var h = '<div style="display:flex;gap:6px;margin-bottom:15px">';
    ['easy','medium','hard'].forEach(function(d) {
        h += '<button class="btn-out" style="flex:1;' + (tttDiff===d?'background:rgba(212,175,55,0.2)':'') + '" onclick="tttDiff=\'' + d + '\';startTTT()">' + d.charAt(0).toUpperCase()+d.slice(1) + '</button>';
    });
    h += '</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:280px">';
    for (var i = 0; i < 9; i++) {
        h += '<div style="aspect-ratio:1;background:var(--card);border:2px solid rgba(212,175,55,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:40px;cursor:pointer" onclick="tttMove(' + i + ')" id="ttt' + i + '"></div>';
    }
    h += '</div><p id="tttStatus" style="text-align:center;color:var(--gold);margin-top:15px">Your turn (X)</p>';
    div.innerHTML = h;
    gameCanvas.parentNode.insertBefore(div, gameCanvas);
    currentGameRestart = startTTT;
}

function tttMove(i) {
    if (!tttActive || ttt[i] !== '') return;
    ttt[i] = 'X';
    var cell = document.getElementById('ttt' + i);
    if (cell) { cell.textContent = 'X'; cell.style.color = 'var(--gold)'; }
    if (tttCheck('X')) { tttActive = false; updateScore(10); gameOver('🎉 You Win!'); return; }
    if (ttt.every(function(c){return c!=='';})) { tttActive = false; gameOver('🤝 Draw!'); return; }
    
    setTimeout(function() {
        var empty = [];
        for (var j=0;j<9;j++) if(ttt[j]==='') empty.push(j);
        var ai = tttDiff==='easy' ? empty[Math.floor(Math.random()*empty.length)] : 
                 tttDiff==='medium' ? (Math.random()<0.5?tttBest():empty[Math.floor(Math.random()*empty.length)]) : tttBest();
        ttt[ai] = 'O';
        var cell2 = document.getElementById('ttt' + ai);
        if (cell2) { cell2.textContent = 'O'; cell2.style.color = '#FF4757'; }
        if (tttCheck('O')) { tttActive = false; gameOver('😞 AI Wins!'); }
        else if (ttt.every(function(c){return c!=='';})) { tttActive = false; gameOver('🤝 Draw!'); }
    }, 400);
}

function tttCheck(p) {
    var w = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return w.some(function(w){return ttt[w[0]]===p&&ttt[w[1]]===p&&ttt[w[2]]===p;});
}

function tttBest() {
    for (var i=0;i<9;i++) { if(ttt[i]===''){ttt[i]='O';if(tttCheck('O')){ttt[i]='';return i;}ttt[i]='';} }
    for (var i=0;i<9;i++) { if(ttt[i]===''){ttt[i]='X';if(tttCheck('X')){ttt[i]='';return i;}ttt[i]='';} }
    var p=[4,0,2,6,8,1,3,5,7];
    for (var i=0;i<p.length;i++) if(ttt[p[i]]==='') return p[i];
    return 0;
}

// ==================== SNAKE ====================
function startSnake() {
    openFullPageGame('🐍 Snake');
    gameCanvas.style.display = 'block';
    snake = [{x:10,y:10}];
    snakeDir = {x:1,y:0};
    snakeFood = {x:15,y:10};
    if (snakeInterval) clearInterval(snakeInterval);
    snakeInterval = setInterval(snakeLoop, 100);
    currentGameRestart = startSnake;
}

function snakeLoop() {
    if (!gameActive) { clearInterval(snakeInterval); return; }
    var head = {x:snake[0].x+snakeDir.x, y:snake[0].y+snakeDir.y};
    var cols = Math.floor(gameCanvas.width/20), rows = Math.floor(gameCanvas.height/20);
    if (head.x<0||head.x>=cols||head.y<0||head.y>=rows) { gameOver('🐍 Hit the wall!'); return; }
    if (snake.some(function(s){return s.x===head.x&&s.y===head.y;})) { gameOver('🐍 Hit yourself!'); return; }
    snake.unshift(head);
    if (head.x===snakeFood.x && head.y===snakeFood.y) {
        updateScore(5);
        snakeFood = {x:Math.floor(Math.random()*cols), y:Math.floor(Math.random()*rows)};
    } else { snake.pop(); }
    
    var w = gameCanvas.width/cols, h = gameCanvas.height/rows;
    gameCtx.fillStyle = '#0A0E27';
    gameCtx.fillRect(0,0,gameCanvas.width,gameCanvas.height);
    gameCtx.fillStyle = '#D4AF37';
    snake.forEach(function(s){gameCtx.fillRect(s.x*w,s.y*h,w-1,h-1);});
    gameCtx.fillStyle = '#FF4757';
    gameCtx.fillRect(snakeFood.x*w,snakeFood.y*h,w-1,h-1);
}

// ==================== PONG ====================
function startPong() {
    openFullPageGame('🏓 Pong');
    gameCanvas.style.display = 'block';
    pongBall = {x:gameCanvas.width/2, y:gameCanvas.height/2, dx:4, dy:4, r:8};
    pongPaddle = {x:10, y:gameCanvas.height/2-50, w:10, h:100};
    pongAIPaddle = {x:gameCanvas.width-20, y:gameCanvas.height/2-50, w:10, h:100};
    currentGameRestart = startPong;
    gameAnimation = requestAnimationFrame(pongLoop);
}

function pongLoop() {
    if (!gameActive) return;
    gameCtx.fillStyle = '#0A0E27';
    gameCtx.fillRect(0,0,gameCanvas.width,gameCanvas.height);
    gameCtx.strokeStyle = 'rgba(255,255,255,0.1)';
    gameCtx.setLineDash([10,10]);
    gameCtx.beginPath();
    gameCtx.moveTo(gameCanvas.width/2,0);
    gameCtx.lineTo(gameCanvas.width/2,gameCanvas.height);
    gameCtx.stroke();
    
    pongBall.x += pongBall.dx;
    pongBall.y += pongBall.dy;
    if (pongBall.y<=pongBall.r||pongBall.y>=gameCanvas.height-pongBall.r) pongBall.dy*=-1;
    if (pongBall.x<=pongPaddle.x+pongPaddle.w && pongBall.y>=pongPaddle.y && pongBall.y<=pongPaddle.y+pongPaddle.h) { pongBall.dx*=-1; pongBall.x=pongPaddle.x+pongPaddle.w+pongBall.r; }
    if (pongBall.x>=pongAIPaddle.x-pongBall.r && pongBall.y>=pongAIPaddle.y && pongBall.y<=pongAIPaddle.y+pongAIPaddle.h) { pongBall.dx*=-1; pongBall.x=pongAIPaddle.x-pongBall.r; updateScore(1); }
    if (pongBall.x<0) { gameOver('😞 AI Wins!'); return; }
    if (pongBall.x>gameCanvas.width) { gameOver('🎉 You Win!'); return; }
    
    pongAIPaddle.y += (pongBall.y - (pongAIPaddle.y+pongAIPaddle.h/2)) * 0.15;
    if (pongAIPaddle.y<0) pongAIPaddle.y=0;
    if (pongAIPaddle.y+pongAIPaddle.h>gameCanvas.height) pongAIPaddle.y=gameCanvas.height-pongAIPaddle.h;
    
    gameCtx.fillStyle = '#D4AF37';
    gameCtx.fillRect(pongPaddle.x,pongPaddle.y,pongPaddle.w,pongPaddle.h);
    gameCtx.fillStyle = '#FF4757';
    gameCtx.fillRect(pongAIPaddle.x,pongAIPaddle.y,pongAIPaddle.w,pongAIPaddle.h);
    gameCtx.fillStyle = '#fff';
    gameCtx.beginPath();
    gameCtx.arc(pongBall.x,pongBall.y,pongBall.r,0,Math.PI*2);
    gameCtx.fill();
    gameAnimation = requestAnimationFrame(pongLoop);
}

// ==================== FLAPPY BIRD ====================
function startFlappy() {
    openFullPageGame('🐦 Flappy Bird');
    gameCanvas.style.display = 'block';
    flappyBird = {x:80, y:gameCanvas.height/2, r:18, vy:0};
    flappyPipes = [];
    currentGameRestart = startFlappy;
    gameAnimation = requestAnimationFrame(flappyLoop);
}

function flappyLoop() {
    if (!gameActive) return;
    gameCtx.fillStyle = '#0A0E27';
    gameCtx.fillRect(0,0,gameCanvas.width,gameCanvas.height);
    flappyBird.vy += 0.5;
    flappyBird.y += flappyBird.vy;
    if (flappyBird.y<0||flappyBird.y>gameCanvas.height) { gameOver('🐦 Crashed!'); return; }
    
    if (Math.random()<0.02) {
        var gap = 160;
        var pos = Math.random()*(gameCanvas.height-gap-80)+40;
        flappyPipes.push({x:gameCanvas.width, y:pos, gap:gap, scored:false});
    }
    for (var i=flappyPipes.length-1;i>=0;i--) {
        flappyPipes[i].x -= 3;
        gameCtx.fillStyle = '#2ED573';
        gameCtx.fillRect(flappyPipes[i].x,0,45,flappyPipes[i].y);
        gameCtx.fillRect(flappyPipes[i].x,flappyPipes[i].y+flappyPipes[i].gap,45,gameCanvas.height);
        if (!flappyPipes[i].scored && flappyPipes[i].x+45<flappyBird.x) { flappyPipes[i].scored=true; updateScore(1); }
        if (flappyBird.x+flappyBird.r>flappyPipes[i].x && flappyBird.x-flappyBird.r<flappyPipes[i].x+45 && (flappyBird.y-flappyBird.r<flappyPipes[i].y||flappyBird.y+flappyBird.r>flappyPipes[i].y+flappyPipes[i].gap)) { gameOver('🐦 Crashed!'); return; }
        if (flappyPipes[i].x<-45) flappyPipes.splice(i,1);
    }
    gameCtx.fillStyle = '#D4AF37';
    gameCtx.beginPath();
    gameCtx.arc(flappyBird.x,flappyBird.y,flappyBird.r,0,Math.PI*2);
    gameCtx.fill();
    gameAnimation = requestAnimationFrame(flappyLoop);
}

// ==================== SPACE INVADERS ====================
function startSpaceInvaders() {
    openFullPageGame('👾 Space Invaders');
    gameCanvas.style.display = 'block';
    invaders = [];
    for (var r=0;r<3;r++) for (var c=0;c<6;c++) invaders.push({x:c*55+35,y:r*45+30,alive:true});
    invaderBullets = [];
    playerBullet = null;
    playerPos = gameCanvas.width/2;
    currentGameRestart = startSpaceInvaders;
    gameAnimation = requestAnimationFrame(invaderLoop);
}

function invaderLoop() {
    if (!gameActive) return;
    gameCtx.fillStyle = '#0A0E27';
    gameCtx.fillRect(0,0,gameCanvas.width,gameCanvas.height);
    
    if (Math.random()<0.03) {
        var alive = invaders.filter(function(i){return i.alive;});
        if (alive.length>0) invaderBullets.push({x:alive[Math.floor(Math.random()*alive.length)].x+18,y:alive[0].y+25});
    }
    invaders.forEach(function(i){if(i.alive){i.y+=0.2;gameCtx.fillStyle='#FF4757';gameCtx.fillRect(i.x,i.y,35,22);if(i.y>gameCanvas.height-60){gameOver('👾 Invaders Win!');}}});
    invaderBullets.forEach(function(b,i){b.y+=5;gameCtx.fillStyle='#FF4757';gameCtx.fillRect(b.x,b.y,3,12);if(b.y>gameCanvas.height) invaderBullets.splice(i,1);});
    
    if (playerBullet) {
        playerBullet.y-=7;
        gameCtx.fillStyle='#D4AF37';
        gameCtx.fillRect(playerBullet.x,playerBullet.y,3,12);
        invaders.forEach(function(inv){if(inv.alive&&playerBullet&&playerBullet.x>inv.x&&playerBullet.x<inv.x+35&&playerBullet.y>inv.y&&playerBullet.y<inv.y+22){inv.alive=false;playerBullet=null;updateScore(10);}});
        if(playerBullet&&playerBullet.y<0) playerBullet=null;
    }
    gameCtx.fillStyle='#00D4FF';
    gameCtx.fillRect(playerPos-22,gameCanvas.height-40,44,18);
    if(invaders.every(function(i){return!i.alive;})){gameOver('🎉 You Win!');return;}
    gameAnimation=requestAnimationFrame(invaderLoop);
}

// ==================== BREAKOUT ====================
function startBreakout() {
    openFullPageGame('🧱 Breakout');
    gameCanvas.style.display = 'block';
    bricks = [];
    for (var r=0;r<4;r++) for (var c=0;c<7;c++) bricks.push({x:c*52+18,y:r*22+20,w:48,h:18,alive:true});
    breakPaddle = {x:gameCanvas.width/2-45,y:gameCanvas.height-35,w:90,h:12};
    breakBall = {x:gameCanvas.width/2,y:gameCanvas.height-60,dx:4,dy:-4,r:7};
    currentGameRestart = startBreakout;
    gameAnimation = requestAnimationFrame(breakLoop);
}

function breakLoop() {
    if (!gameActive) return;
    gameCtx.fillStyle = '#0A0E27';
    gameCtx.fillRect(0,0,gameCanvas.width,gameCanvas.height);
    breakBall.x+=breakBall.dx; breakBall.y+=breakBall.dy;
    if(breakBall.x<=breakBall.r||breakBall.x>=gameCanvas.width-breakBall.r) breakBall.dx*=-1;
    if(breakBall.y<=breakBall.r) breakBall.dy*=-1;
    if(breakBall.y>=gameCanvas.height) { gameOver('🧱 Game Over!'); return; }
    if(breakBall.y+breakBall.r>=breakPaddle.y && breakBall.x>breakPaddle.x && breakBall.x<breakPaddle.x+breakPaddle.w) breakBall.dy*=-1;
    
    bricks.forEach(function(b){if(b.alive&&breakBall.x>b.x&&breakBall.x<b.x+b.w&&breakBall.y>b.y&&breakBall.y<b.y+b.h){b.alive=false;breakBall.dy*=-1;updateScore(5);}});
    gameCtx.fillStyle='#D4AF37'; gameCtx.fillRect(breakPaddle.x,breakPaddle.y,breakPaddle.w,breakPaddle.h);
    bricks.forEach(function(b){if(b.alive){gameCtx.fillStyle='#7C3AED';gameCtx.fillRect(b.x,b.y,b.w,b.h);}});
    gameCtx.fillStyle='#fff'; gameCtx.beginPath(); gameCtx.arc(breakBall.x,breakBall.y,breakBall.r,0,Math.PI*2); gameCtx.fill();
    if(bricks.every(function(b){return!b.alive;})){gameOver('🎉 You Win!');return;}
    gameAnimation=requestAnimationFrame(breakLoop);
}

// ==================== TOWER DEFENSE ====================
function startTowerDefense() {
    openFullPageGame('🏰 Tower Defense');
    gameCanvas.style.display = 'block';
    towers = []; enemies = []; tdLives = 10; tdGold = 150;
    currentGameRestart = startTowerDefense;
    gameAnimation = requestAnimationFrame(tdLoop);
}

function tdLoop() {
    if (!gameActive) return;
    gameCtx.fillStyle = '#0A0E27';
    gameCtx.fillRect(0,0,gameCanvas.width,gameCanvas.height);
    if(Math.random()<0.03) enemies.push({x:0,y:Math.random()*(gameCanvas.height-80)+40,hp:3,speed:1.5});
    
    enemies.forEach(function(e,i){
        e.x+=e.speed;
        gameCtx.fillStyle='#FF4757'; gameCtx.fillRect(e.x,e.y,22,22);
        gameCtx.fillStyle='#fff'; gameCtx.fillText(e.hp,e.x+8,e.y+15);
        if(e.x>gameCanvas.width){enemies.splice(i,1);tdLives--;if(tdLives<=0){gameOver('🏰 Defeated!');}}
    });
    
    towers.forEach(function(t){
        gameCtx.fillStyle='#D4AF37'; gameCtx.fillRect(t.x,t.y,28,28);
        gameCtx.fillStyle='#fff'; gameCtx.fillText('🔫',t.x+4,t.y+20);
        enemies.forEach(function(e,i){var dist=Math.hypot(t.x-e.x,t.y-e.y);if(dist<120&&e.hp>0){e.hp--;if(e.hp<=0){enemies.splice(i,1);updateScore(15);tdGold+=15;}}});
    });
    
    gameCtx.fillStyle='#fff'; gameCtx.font='14px Poppins';
    gameCtx.fillText('❤️ '+tdLives+'  💰 '+tdGold,15,25);
    gameAnimation=requestAnimationFrame(tdLoop);
}

// ==================== INFINITE RUNNER ====================
function startRunner() {
    openFullPageGame('🏃 Infinite Runner');
    gameCanvas.style.display = 'block';
    runner = {x:60,y:gameCanvas.height-80,w:28,h:48,vy:0,jumping:false};
    obstacles = []; runnerSpeed = 5;
    currentGameRestart = startRunner;
    gameAnimation = requestAnimationFrame(runnerLoop);
}

function runnerLoop() {
    if (!gameActive) return;
    gameCtx.fillStyle = '#0A0E27';
    gameCtx.fillRect(0,0,gameCanvas.width,gameCanvas.height);
    gameCtx.fillStyle = 'rgba(255,255,255,0.05)';
    for(var i=0;i<gameCanvas.width;i+=40){gameCtx.fillRect(i,gameCanvas.height-20,20,20);}
    
    if(runner.jumping){runner.vy+=0.7;runner.y+=runner.vy;if(runner.y>=gameCanvas.height-80){runner.y=gameCanvas.height-80;runner.jumping=false;runner.vy=0;}}
    if(Math.random()<0.03) obstacles.push({x:gameCanvas.width,y:gameCanvas.height-45,w:22,h:45});
    
    obstacles.forEach(function(o,i){
        o.x-=runnerSpeed;
        gameCtx.fillStyle='#FF4757'; gameCtx.fillRect(o.x,o.y,o.w,o.h);
        if(o.x<runner.x+runner.w&&o.x+o.w>runner.x&&o.y<runner.y+runner.h){gameOver('🏃 Hit obstacle!');}
        if(o.x<-30) obstacles.splice(i,1);
    });
    
    updateScore(0.2);
    gameCtx.fillStyle='#D4AF37'; gameCtx.fillRect(runner.x,runner.y,runner.w,runner.h);
    gameAnimation=requestAnimationFrame(runnerLoop);
}

// ==================== OTHER GAMES ====================
function startQuiz() {
    closeModal('gamesModal');
    var qq=shuffleArray([{q:"Capital of France?",o:["London","Paris","Berlin","Madrid"],a:1},{q:"Red Planet?",o:["Venus","Jupiter","Mars","Saturn"],a:2},{q:"2+2×2=?",o:["6","8","4","10"],a:0},{q:"Largest ocean?",o:["Atlantic","Indian","Arctic","Pacific"],a:3},{q:"H2O is?",o:["Oxygen","Hydrogen","Water","Air"],a:2}]);
    var qi=0,qs=0;
    openModal('gamesModal');
    function showQ(){if(qi>=qq.length){document.getElementById('gamesContent').innerHTML='<div style="text-align:center;padding:30px"><h2 style="color:var(--gold)">'+qs+'/'+qq.length+'</h2><p>'+(qs>=4?'🎉 Great!':'😢 Try Again!')+'</p><button class="btn" onclick="startQuiz()">Retry</button><button class="btn-out" onclick="openGames()">Back</button></div>';if(qs>=3)addXP(qs*5);return;}
        var q=qq[qi];
        document.getElementById('gamesContent').innerHTML='<h3 style="color:var(--gold)">❓ '+(qi+1)+'/'+qq.length+'</h3><p style="margin:10px 0">'+q.q+'</p>'+q.o.map(function(o,i){return'<button class="btn-out" onclick="answerQ('+i+')" style="text-align:left;margin:4px 0">'+o+'</button>';}).join('');}
    function answerQ(i){if(qq[qi].a===i)qs++;qi++;showQ();}
    showQ();
}

function startRPS() {
    closeModal('gamesModal');
    openModal('gamesModal');
    var choices=['👊 Rock','✋ Paper','✌️ Scissors'];
    document.getElementById('gamesContent').innerHTML='<h3 style="color:var(--gold);text-align:center">✂️ RPS</h3><div style="display:flex;gap:8px;justify-content:center;margin:15px 0">'+choices.map(function(c,i){return'<button class="btn" style="flex:1" onclick="playRPS('+i+')">'+c+'</button>';}).join('')+'</div><div id="rpsResult" style="text-align:center"></div><button class="btn-out" onclick="openGames()">Back</button>';
}

function playRPS(p){
    var ai=Math.floor(Math.random()*3);
    var emojis=['👊','✋','✌️'];
    var result=(p===ai)?'🤝 Draw!':((p===0&&ai===2)||(p===1&&ai===0)||(p===2&&ai===1))?'🎉 Win!':'😞 Lose!';
    if(result==='🎉 Win!')addXP(10);
    document.getElementById('rpsResult').innerHTML='You: '+emojis[p]+' AI: '+emojis[ai]+'<br><b>'+result+'</b>';
}

function showMultiplayer() {
    var mutual=(currentUserData.following||[]).filter(function(id){return (currentUserData.followers||[]).indexOf(id)!==-1;});
    var h='<h3 style="color:var(--gold);text-align:center">👥 Challenge</h3>';
    if(mutual.length===0)h+='<p style="text-align:center;color:var(--text2)">No mutual friends</p>';
    else mutual.forEach(function(id){db.collection('users').doc(id).get().then(function(d){var u=d.data();if(u)h+='<div class="chat-item"><div class="av">'+(u.name||'?')[0]+'</div><div style="flex:1"><b>'+u.name+'</b></div><button class="btn" style="width:auto;padding:6px 14px" onclick="sendChallenge(\''+id+'\')">⚔️</button></div>';});});
    h+='<button class="btn-out" onclick="openGames()">Back</button>';
    document.getElementById('gamesContent').innerHTML=h;
}

function sendChallenge(fid){
    db.collection('challenges').add({from:currentUser.uid,fromName:currentUserData.name,to:fid,game:'tictactoe',status:'pending',timestamp:firebase.firestore.FieldValue.serverTimestamp()});
    showToast('Challenge sent! ⚔️');
    openGames();
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('click', function(e) { if (e.target.classList.contains('modal')) e.target.classList.remove('show'); });

document.addEventListener('keydown', function(e) {
    if (e.key==='ArrowUp'&&snakeDir&&snakeDir.y===0) {snakeDir={x:0,y:-1};e.preventDefault();}
    if (e.key==='ArrowDown'&&snakeDir&&snakeDir.y===0) {snakeDir={x:0,y:1};e.preventDefault();}
    if (e.key==='ArrowLeft'&&snakeDir&&snakeDir.x===0) {snakeDir={x:-1,y:0};e.preventDefault();}
    if (e.key==='ArrowRight'&&snakeDir&&snakeDir.x===0) {snakeDir={x:1,y:0};e.preventDefault();}
});

document.addEventListener('mousemove', function(e) {
    if (pongPaddle) pongPaddle.y = e.clientY - pongPaddle.h/2;
    if (typeof playerPos !== 'undefined') playerPos = e.clientX;
    if (breakPaddle) breakPaddle.x = e.clientX - breakPaddle.w/2;
});

document.addEventListener('touchmove', function(e) {
    if (pongPaddle) pongPaddle.y = e.touches[0].clientY - pongPaddle.h/2;
    if (typeof playerPos !== 'undefined') playerPos = e.touches[0].clientX;
    if (breakPaddle) breakPaddle.x = e.touches[0].clientX - breakPaddle.w/2;
    if (runner && !runner.jumping) { runner.jumping=true; runner.vy=-12; }
    e.preventDefault();
}, {passive: false});

document.addEventListener('click', function(e) {
    if (flappyBird) flappyBird.vy = -8;
    if (typeof playerBullet !== 'undefined' && !playerBullet && gameActive) playerBullet = {x:playerPos,y:gameCanvas.height-50};
    if (runner && !runner.jumping) { runner.jumping=true; runner.vy=-12; }
    if (typeof tdGold !== 'undefined' && tdGold>=50 && gameActive) {
        var rect = gameCanvas.getBoundingClientRect();
        towers.push({x:e.clientX-rect.left-14,y:e.clientY-rect.top-14});
        tdGold-=50;
    }
});

console.log('✅ Games Hub loaded - 10 games');
