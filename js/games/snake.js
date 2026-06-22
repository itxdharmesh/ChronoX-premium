// ==================== PREMIUM SNAKE GAME ====================
var snakeGame = {
    canvas: null, ctx: null,
    snake: [], food: {}, direction: {x:1,y:0}, nextDir: {x:1,y:0},
    score: 0, highScore: 0, speed: 80, gameLoop: null,
    particles: [], gridSize: 20,
    colors: ['#D4AF37','#F5E6A3','#FFD700','#FFA500'],
    foodPulse: 0
};

function startSnakePremium() {
    openFullPageGame('🐍 Snake');
    gameCanvas.style.display = 'block';
    gameCanvas.style.background = 'radial-gradient(ellipse at center, #1a1f4e 0%, #0A0E27 100%)';
    
    snakeGame.canvas = gameCanvas;
    snakeGame.ctx = gameCtx;
    snakeGame.snake = [{x:10,y:10}];
    snakeGame.direction = {x:1,y:0};
    snakeGame.nextDir = {x:1,y:0};
    snakeGame.score = 0;
    snakeGame.particles = [];
    snakeGame.speed = 80;
    snakeGame.gridSize = Math.floor(Math.min(gameCanvas.width, gameCanvas.height) / 25);
    
    spawnSnakeFood();
    if (snakeGame.gameLoop) clearInterval(snakeGame.gameLoop);
    snakeGame.gameLoop = setInterval(snakeGameUpdate, snakeGame.speed);
    currentGameRestart = startSnakePremium;
    
    // Load high score
    snakeGame.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
}

function spawnSnakeFood() {
    var cols = Math.floor(snakeGame.canvas.width / snakeGame.gridSize);
    var rows = Math.floor(snakeGame.canvas.height / snakeGame.gridSize);
    var pos;
    do {
        pos = {x:Math.floor(Math.random()*cols), y:Math.floor(Math.random()*rows)};
    } while (snakeGame.snake.some(function(s){return s.x===pos.x && s.y===pos.y;}));
    snakeGame.food = pos;
}

function snakeGameUpdate() {
    if (!gameActive) { clearInterval(snakeGame.gameLoop); return; }
    
    var ctx = snakeGame.ctx;
    var canvas = snakeGame.canvas;
    var gs = snakeGame.gridSize;
    
    // Update direction
    snakeGame.direction = snakeGame.nextDir;
    
    // Move snake
    var head = {x:snakeGame.snake[0].x + snakeGame.direction.x, y:snakeGame.snake[0].y + snakeGame.direction.y};
    var cols = Math.floor(canvas.width/gs), rows = Math.floor(canvas.height/gs);
    
    // Wall collision - wrap around
    if (head.x < 0) head.x = cols-1;
    if (head.x >= cols) head.x = 0;
    if (head.y < 0) head.y = rows-1;
    if (head.y >= rows) head.y = 0;
    
    // Self collision
    if (snakeGame.snake.some(function(s){return s.x===head.x && s.y===head.y;})) {
        gameOver('🐍 Score: ' + snakeGame.score);
        if (snakeGame.score > snakeGame.highScore) {
            localStorage.setItem('snakeHighScore', snakeGame.score);
        }
        return;
    }
    
    snakeGame.snake.unshift(head);
    
    // Check food
    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score += 10;
        updateScore(snakeGame.score);
        spawnSnakeFood();
        // Spawn particles
        for (var i=0;i<8;i++) {
            snakeGame.particles.push({
                x: snakeGame.food.x*gs+gs/2,
                y: snakeGame.food.y*gs+gs/2,
                vx: (Math.random()-0.5)*4,
                vy: (Math.random()-0.5)*4,
                life: 20,
                color: snakeGame.colors[Math.floor(Math.random()*snakeGame.colors.length)]
            });
        }
        // Speed up
        if (snakeGame.speed > 40 && snakeGame.score % 50 === 0) {
            snakeGame.speed -= 5;
            clearInterval(snakeGame.gameLoop);
            snakeGame.gameLoop = setInterval(snakeGameUpdate, snakeGame.speed);
        }
    } else {
        snakeGame.snake.pop();
    }
    
    // Draw
    snakeGameDraw(ctx, canvas, gs);
}

function snakeGameDraw(ctx, canvas, gs) {
    // Clear with gradient
    var grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width/2);
    grad.addColorStop(0, '#1a1f4e');
    grad.addColorStop(1, '#0A0E27');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 1;
    for (var x=0;x<canvas.width;x+=gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
    for (var y=0;y<canvas.height;y+=gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
    
    // Draw food with glow
    snakeGame.foodPulse += 0.1;
    var foodGlow = Math.sin(snakeGame.foodPulse) * 0.3 + 0.7;
    var fx = snakeGame.food.x * gs + gs/2, fy = snakeGame.food.y * gs + gs/2;
    
    // Glow
    var glowGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, gs);
    glowGrad.addColorStop(0, 'rgba(255,71,87,' + foodGlow + ')');
    glowGrad.addColorStop(1, 'rgba(255,71,87,0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(fx, fy, gs, 0, Math.PI*2);
    ctx.fill();
    
    // Food emoji
    ctx.font = (gs-4) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍎', fx, fy);
    
    // Draw snake with gradient
    snakeGame.snake.forEach(function(s, i) {
        var sx = s.x * gs, sy = s.y * gs;
        var ratio = 1 - (i / snakeGame.snake.length) * 0.5;
        
        // Body with rounded rect
        var bodyGrad = ctx.createLinearGradient(sx, sy, sx+gs, sy+gs);
        bodyGrad.addColorStop(0, '#D4AF37');
        bodyGrad.addColorStop(1, '#F5E6A3');
        ctx.fillStyle = bodyGrad;
        ctx.shadowColor = 'rgba(212,175,55,0.5)';
        ctx.shadowBlur = 8 * ratio;
        
        var r = gs * 0.3;
        ctx.beginPath();
        ctx.moveTo(sx+r, sy);
        ctx.lineTo(sx+gs-r, sy);
        ctx.quadraticCurveTo(sx+gs, sy, sx+gs, sy+r);
        ctx.lineTo(sx+gs, sy+gs-r);
        ctx.quadraticCurveTo(sx+gs, sy+gs, sx+gs-r, sy+gs);
        ctx.lineTo(sx+r, sy+gs);
        ctx.quadraticCurveTo(sx, sy+gs, sx, sy+gs-r);
        ctx.lineTo(sx, sy+r);
        ctx.quadraticCurveTo(sx, sy, sx+r, sy);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        // Eyes on head
        if (i === 0) {
            ctx.fillStyle = '#fff';
            var eyeSize = gs * 0.2;
            if (snakeGame.direction.x === 1) {
                ctx.beginPath(); ctx.arc(sx+gs*0.7, sy+gs*0.3, eyeSize, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(sx+gs*0.7, sy+gs*0.7, eyeSize, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath(); ctx.arc(sx+gs*0.75, sy+gs*0.3, eyeSize*0.5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(sx+gs*0.75, sy+gs*0.7, eyeSize*0.5, 0, Math.PI*2); ctx.fill();
            }
        }
    });
    
    // Draw particles
    snakeGame.particles = snakeGame.particles.filter(function(p) {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.globalAlpha = p.life / 20;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
        ctx.fill();
        return p.life > 0;
    });
    ctx.globalAlpha = 1;
    
    // Draw score
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 14px Poppins';
    ctx.textAlign = 'right';
    ctx.fillText('Best: ' + snakeGame.highScore, canvas.width-15, 25);
}

// Controls
document.addEventListener('keydown', function(e) {
    if (!snakeGame.nextDir) return;
    if (e.key==='ArrowUp' && snakeGame.direction.y===0) { snakeGame.nextDir={x:0,y:-1}; e.preventDefault(); }
    if (e.key==='ArrowDown' && snakeGame.direction.y===0) { snakeGame.nextDir={x:0,y:1}; e.preventDefault(); }
    if (e.key==='ArrowLeft' && snakeGame.direction.x===0) { snakeGame.nextDir={x:-1,y:0}; e.preventDefault(); }
    if (e.key==='ArrowRight' && snakeGame.direction.x===0) { snakeGame.nextDir={x:1,y:0}; e.preventDefault(); }
});

// Swipe controls
var touchStartX=0, touchStartY=0;
document.addEventListener('touchstart', function(e) {
    if (!snakeGame.nextDir) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
    if (!snakeGame.nextDir) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && snakeGame.direction.y !== 0) snakeGame.nextDir = {x:1,y:0};
        else if (dx < 0 && snakeGame.direction.y !== 0) snakeGame.nextDir = {x:-1,y:0};
    } else {
        if (dy > 0 && snakeGame.direction.x !== 0) snakeGame.nextDir = {x:0,y:1};
        else if (dy < 0 && snakeGame.direction.x !== 0) snakeGame.nextDir = {x:0,y:-1};
    }
});

console.log('✅ Premium Snake loaded');
