var snake, snakeDir, snakeFood, snakeInterval, snakeScore, snakeHighScore, snakeSpeed;
var snakeGameActive = false;

function startSnake() {
    snakeScore = 0;
    snakeSpeed = 100;
    snakeHighScore = parseInt(localStorage.getItem('snakeHigh') || '0');
    snakeGameActive = true;
    
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<div style="text-align:center">' +
            '<h2 style="color:#D4AF37;margin-bottom:5px">🐍 Snake</h2>' +
            '<div style="display:flex;justify-content:center;gap:20px;margin:10px 0;font-size:13px">' +
                '<span>Score: <b style="color:#D4AF37" id="snScore">0</b></span>' +
                '<span>Best: <b style="color:#2ED573" id="snBest">' + snakeHighScore + '</b></span>' +
            '</div>' +
            '<canvas id="snakeCanvas" style="width:100%;max-width:350px;height:350px;background:#0A0E27;border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:block;margin:10px auto"></canvas>' +
            '<p style="color:rgba(255,255,255,0.5);font-size:11px;margin:8px 0">Swipe or use arrow keys</p>' +
            '<div style="display:flex;gap:10px;margin-top:10px">' +
                '<button class="btn-out" onclick="startSnake()" style="flex:1">New Game</button>' +
                '<button class="btn-out" onclick="navigate(\'games\')" style="flex:1">Games Hub</button>' +
            '</div>' +
        '</div>';
    
    setTimeout(function() {
        initSnakeGame();
    }, 200);
}

function initSnakeGame() {
    var canvas = document.getElementById('snakeCanvas');
    if (!canvas) return;
    
    var size = 20;
    var cols = Math.floor(canvas.width / size);
    var rows = Math.floor(canvas.height / size);
    
    snake = [{x: Math.floor(cols/2), y: Math.floor(rows/2)}];
    snakeDir = {x: 1, y: 0};
    snakeFood = {x: Math.floor(cols*0.8), y: Math.floor(rows/2)};
    
    if (snakeInterval) clearInterval(snakeInterval);
    
    var ctx = canvas.getContext('2d');
    
    snakeInterval = setInterval(function() {
        if (!snakeGameActive) { clearInterval(snakeInterval); return; }
        
        // MOVE
        var head = {x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y};
        
        // WRAP
        if (head.x < 0) head.x = cols - 1;
        if (head.x >= cols) head.x = 0;
        if (head.y < 0) head.y = rows - 1;
        if (head.y >= rows) head.y = 0;
        
        // CHECK SELF HIT
        for (var i = 0; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                snakeGameActive = false;
                if (snakeScore > snakeHighScore) {
                    snakeHighScore = snakeScore;
                    localStorage.setItem('snakeHigh', snakeHighScore);
                }
                document.getElementById('snScore').textContent = snakeScore;
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 20px Poppins';
                ctx.textAlign = 'center';
                ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
                if (typeof addXP === 'function') addXP(Math.floor(snakeScore / 2));
                return;
            }
        }
        
        snake.unshift(head);
        
        // EAT FOOD
        if (head.x === snakeFood.x && head.y === snakeFood.y) {
            snakeScore += 5;
            document.getElementById('snScore').textContent = snakeScore;
            snakeFood = {x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows)};
            if (snakeSpeed > 50) { snakeSpeed -= 2; clearInterval(snakeInterval); snakeInterval = setInterval(arguments.callee, snakeSpeed); }
        } else {
            snake.pop();
        }
        
        // DRAW
        ctx.fillStyle = '#0A0E27';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // FOOD
        ctx.fillStyle = '#FF4757';
        ctx.shadowColor = '#FF4757';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(snakeFood.x * size + size/2, snakeFood.y * size + size/2, size/2.5, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // SNAKE
        snake.forEach(function(s, i) {
            var alpha = 1 - (i / snake.length) * 0.5;
            ctx.fillStyle = i === 0 ? '#D4AF37' : 'rgba(212,175,55,' + alpha + ')';
            ctx.shadowColor = '#D4AF37';
            ctx.shadowBlur = i === 0 ? 8 : 4;
            ctx.beginPath();
            ctx.roundRect(s.x * size + 1, s.y * size + 1, size - 2, size - 2, 5);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        
    }, snakeSpeed);
    
    // CONTROLS
    document.addEventListener('keydown', snakeKeyHandler);
}

function snakeKeyHandler(e) {
    if (!snakeGameActive) return;
    if (e.key === 'ArrowUp' && snakeDir.y === 0) { snakeDir = {x: 0, y: -1}; e.preventDefault(); }
    if (e.key === 'ArrowDown' && snakeDir.y === 0) { snakeDir = {x: 0, y: 1}; e.preventDefault(); }
    if (e.key === 'ArrowLeft' && snakeDir.x === 0) { snakeDir = {x: -1, y: 0}; e.preventDefault(); }
    if (e.key === 'ArrowRight' && snakeDir.x === 0) { snakeDir = {x: 1, y: 0}; e.preventDefault(); }
}

// TOUCH
var tx = 0, ty = 0;
document.addEventListener('touchstart', function(e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; });
document.addEventListener('touchend', function(e) {
    if (!snakeGameActive) return;
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20 && snakeDir.x === 0) snakeDir = {x: 1, y: 0};
        else if (dx < -20 && snakeDir.x === 0) snakeDir = {x: -1, y: 0};
    } else {
        if (dy > 20 && snakeDir.y === 0) snakeDir = {x: 0, y: 1};
        else if (dy < -20 && snakeDir.y === 0) snakeDir = {x: 0, y: -1};
    }
});
