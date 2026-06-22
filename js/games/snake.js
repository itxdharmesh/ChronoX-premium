var snake, snakeDir, snakeFood, snakeInterval, snakeParticles=[];
var snakeTouchStart={x:0,y:0};

function startSnake() {
    openGameScreen('🐍 Snake');
    gameCanvas.style.display = 'block';
    
    // SET CANVAS SIZE FULL SCREEN
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight - 100;
    
    var cols = Math.floor(gameCanvas.width / 22);
    var rows = Math.floor(gameCanvas.height / 22);
    
    snake = [{x: Math.floor(cols/2), y: Math.floor(rows/2)}];
    snakeDir = {x: 1, y: 0};
    snakeFood = {x: Math.floor(cols*0.7), y: Math.floor(rows*0.5)};
    snakeParticles = [];
    
    if (snakeInterval) clearInterval(snakeInterval);
    snakeInterval = setInterval(snakeLoop, 80);
    currentGameRestart = startSnake;
}

function snakeLoop() {
    if (!gameActive) { clearInterval(snakeInterval); return; }
    
    var cols = Math.floor(gameCanvas.width / 22);
    var rows = Math.floor(gameCanvas.height / 22);
    var cellSize = 22;
    
    var head = {
        x: snake[0].x + snakeDir.x,
        y: snake[0].y + snakeDir.y
    };
    
    // Wall wrap
    if (head.x < 0) head.x = cols - 1;
    if (head.x >= cols) head.x = 0;
    if (head.y < 0) head.y = rows - 1;
    if (head.y >= rows) head.y = 0;
    
    // Self hit
    if (snake.some(function(s) { return s.x === head.x && s.y === head.y; })) {
        endGame('🐍 Score: ' + gameScore);
        return;
    }
    
    snake.unshift(head);
    
    // Eat food
    if (head.x === snakeFood.x && head.y === snakeFood.y) {
        updateGameScore(5);
        snakeFood = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
        for (var i = 0; i < 8; i++) {
            snakeParticles.push({
                x: snakeFood.x * cellSize + cellSize/2,
                y: snakeFood.y * cellSize + cellSize/2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 15,
                color: '#FFD700'
            });
        }
    } else {
        snake.pop();
    }
    
    // DRAW
    var ctx = gameCtx;
    var w = cellSize, h = cellSize;
    
    // Background
    ctx.fillStyle = '#0A0E27';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (var x = 0; x < gameCanvas.width; x += w) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, gameCanvas.height); ctx.stroke();
    }
    for (var y = 0; y < gameCanvas.height; y += h) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(gameCanvas.width, y); ctx.stroke();
    }
    
    // Food glow
    var fx = snakeFood.x * w + w/2, fy = snakeFood.y * h + h/2;
    var glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, w*1.5);
    glow.addColorStop(0, 'rgba(255, 71, 87, 0.8)');
    glow.addColorStop(1, 'rgba(255, 71, 87, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(fx, fy, w*1.5, 0, Math.PI*2); ctx.fill();
    
    // Food
    ctx.fillStyle = '#FF4757';
    ctx.shadowColor = '#FF4757';
    ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(fx, fy, w*0.45, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    
    // Snake body
    snake.forEach(function(s, i) {
        var ratio = 1 - (i / snake.length) * 0.6;
        var grad = ctx.createLinearGradient(s.x*w, s.y*h, s.x*w+w, s.y*h+h);
        grad.addColorStop(0, '#D4AF37');
        grad.addColorStop(1, '#F5E6A3');
        
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
        ctx.shadowBlur = 8 * ratio;
        
        var padding = 1.5;
        var radius = 5;
        ctx.beginPath();
        ctx.moveTo(s.x*w + padding + radius, s.y*h + padding);
        ctx.lineTo(s.x*w + w - padding - radius, s.y*h + padding);
        ctx.quadraticCurveTo(s.x*w + w - padding, s.y*h + padding, s.x*w + w - padding, s.y*h + padding + radius);
        ctx.lineTo(s.x*w + w - padding, s.y*h + h - padding - radius);
        ctx.quadraticCurveTo(s.x*w + w - padding, s.y*h + h - padding, s.x*w + w - padding - radius, s.y*h + h - padding);
        ctx.lineTo(s.x*w + padding + radius, s.y*h + h - padding);
        ctx.quadraticCurveTo(s.x*w + padding, s.y*h + h - padding, s.x*w + padding, s.y*h + h - padding - radius);
        ctx.lineTo(s.x*w + padding, s.y*h + padding + radius);
        ctx.quadraticCurveTo(s.x*w + padding, s.y*h + padding, s.x*w + padding + radius, s.y*h + padding);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Eyes on head
        if (i === 0) {
            var eyeSize = w * 0.18;
            ctx.fillStyle = '#fff';
            
            if (snakeDir.x === 1) {
                ctx.beginPath(); ctx.arc(s.x*w + w*0.7, s.y*h + h*0.3, eyeSize, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(s.x*w + w*0.7, s.y*h + h*0.7, eyeSize, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath(); ctx.arc(s.x*w + w*0.75, s.y*h + h*0.3, eyeSize*0.5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(s.x*w + w*0.75, s.y*h + h*0.7, eyeSize*0.5, 0, Math.PI*2); ctx.fill();
            } else if (snakeDir.x === -1) {
                ctx.beginPath(); ctx.arc(s.x*w + w*0.3, s.y*h + h*0.3, eyeSize, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(s.x*w + w*0.3, s.y*h + h*0.7, eyeSize, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath(); ctx.arc(s.x*w + w*0.25, s.y*h + h*0.3, eyeSize*0.5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(s.x*w + w*0.25, s.y*h + h*0.7, eyeSize*0.5, 0, Math.PI*2); ctx.fill();
            } else if (snakeDir.y === -1) {
                ctx.beginPath(); ctx.arc(s.x*w + w*0.3, s.y*h + h*0.3, eyeSize, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(s.x*w + w*0.7, s.y*h + h*0.3, eyeSize, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath(); ctx.arc(s.x*w + w*0.25, s.y*h + h*0.25, eyeSize*0.5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(s.x*w + w*0.75, s.y*h + h*0.25, eyeSize*0.5, 0, Math.PI*2); ctx.fill();
            } else {
                ctx.beginPath(); ctx.arc(s.x*w + w*0.3, s.y*h + h*0.7, eyeSize, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(s.x*w + w*0.7, s.y*h + h*0.7, eyeSize, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath(); ctx.arc(s.x*w + w*0.25, s.y*h + h*0.75, eyeSize*0.5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(s.x*w + w*0.75, s.y*h + h*0.75, eyeSize*0.5, 0, Math.PI*2); ctx.fill();
            }
        }
    });
    
    // Particles
    snakeParticles = snakeParticles.filter(function(p) {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.globalAlpha = p.life / 15;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
        return p.life > 0;
    });
    ctx.globalAlpha = 1;
}

// SWIPE CONTROLS
document.addEventListener('touchstart', function(e) {
    if (!snake || !gameActive) return;
    snakeTouchStart.x = e.touches[0].clientX;
    snakeTouchStart.y = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
    if (!snake || !gameActive) return;
    var dx = e.changedTouches[0].clientX - snakeTouchStart.x;
    var dy = e.changedTouches[0].clientY - snakeTouchStart.y;
    var minSwipe = 20;
    
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > minSwipe && snakeDir.x === 0) snakeDir = {x: 1, y: 0};
        else if (dx < -minSwipe && snakeDir.x === 0) snakeDir = {x: -1, y: 0};
    } else {
        if (dy > minSwipe && snakeDir.y === 0) snakeDir = {x: 0, y: 1};
        else if (dy < -minSwipe && snakeDir.y === 0) snakeDir = {x: 0, y: -1};
    }
});

// KEYBOARD
document.addEventListener('keydown', function(e) {
    if (!snake || !gameActive) return;
    if (e.key === 'ArrowUp' && snakeDir.y === 0) { snakeDir = {x: 0, y: -1}; e.preventDefault(); }
    if (e.key === 'ArrowDown' && snakeDir.y === 0) { snakeDir = {x: 0, y: 1}; e.preventDefault(); }
    if (e.key === 'ArrowLeft' && snakeDir.x === 0) { snakeDir = {x: -1, y: 0}; e.preventDefault(); }
    if (e.key === 'ArrowRight' && snakeDir.x === 0) { snakeDir = {x: 1, y: 0}; e.preventDefault(); }
});

console.log('✅ Snake - Big UI + Swipe');
