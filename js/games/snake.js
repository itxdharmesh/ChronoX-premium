var snake, snakeDir, snakeFood, snakeInterval, snakeScore, snakeHighScore, snakeSpeed;
var snakeActive = false, snakeParticles = [];

function startSnake() {
    snakeScore = 0;
    snakeSpeed = 90;
    snakeHighScore = parseInt(localStorage.getItem('snakeHigh') || '0');
    snakeActive = true;
    snakeParticles = [];
    
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<div style="text-align:center">' +
            '<h2 style="color:#D4AF37;margin-bottom:2px;font-size:24px">🐍 Snake</h2>' +
            '<div style="display:flex;justify-content:center;gap:25px;margin:8px 0">' +
                '<div style="text-align:center"><span style="font-size:10px;color:rgba(255,255,255,0.5)">SCORE</span><br><b style="color:#D4AF37;font-size:20px" id="snScore">0</b></div>' +
                '<div style="text-align:center"><span style="font-size:10px;color:rgba(255,255,255,0.5)">BEST</span><br><b style="color:#2ED573;font-size:20px" id="snBest">' + snakeHighScore + '</b></div>' +
                '<div style="text-align:center"><span style="font-size:10px;color:rgba(255,255,255,0.5)">SPEED</span><br><b style="color:#FFA502;font-size:20px" id="snSpeed">1x</b></div>' +
            '</div>' +
            '<canvas id="snakeCanvas" width="360" height="360" style="background:radial-gradient(ellipse at center,#1a1f4e 0%,#0A0E27 100%);border:2px solid rgba(212,175,55,0.3);border-radius:20px;display:block;margin:10px auto;max-width:95%;box-shadow:0 0 40px rgba(0,0,0,0.5)"></canvas>' +
            '<p style="color:rgba(255,255,255,0.4);font-size:10px;margin:5px 0">⬆️⬇️⬅️➡️ Arrow keys or swipe</p>' +
            '<div style="display:flex;gap:8px;margin-top:8px">' +
                '<button class="btn-out" onclick="startSnake()" style="flex:1">🔄 New Game</button>' +
                '<button class="btn-out" onclick="navigate(\'games\')" style="flex:1">← Games Hub</button>' +
            '</div>' +
        '</div>';
    
    setTimeout(function() { initSnake(); }, 300);
}

function initSnake() {
    var canvas = document.getElementById('snakeCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    
    var size = 18;
    var cols = Math.floor(canvas.width / size);
    var rows = Math.floor(canvas.height / size);
    
    snake = [{x: Math.floor(cols/2), y: Math.floor(rows/2)}];
    snakeDir = {x: 1, y: 0};
    snakeFood = {x: Math.floor(cols*0.7), y: Math.floor(rows/2)};
    snakeParticles = [];
    
    if (snakeInterval) clearInterval(snakeInterval);
    
    function gameLoop() {
        if (!snakeActive) { clearInterval(snakeInterval); return; }
        
        // MOVE
        var head = {x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y};
        
        // WRAP
        if (head.x < 0) head.x = cols - 1;
        if (head.x >= cols) head.x = 0;
        if (head.y < 0) head.y = rows - 1;
        if (head.y >= rows) head.y = 0;
        
        // SELF HIT
        for (var i = 0; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                gameOver(ctx, canvas);
                return;
            }
        }
        
        snake.unshift(head);
        
        // EAT FOOD
        var ate = false;
        if (head.x === snakeFood.x && head.y === snakeFood.y) {
            snakeScore += 5;
            ate = true;
            document.getElementById('snScore').textContent = snakeScore;
            
            // Particles
            for (var i = 0; i < 12; i++) {
                snakeParticles.push({
                    x: snakeFood.x * size + size/2,
                    y: snakeFood.y * size + size/2,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    life: 20,
                    color: '#FFD700',
                    size: Math.random() * 4 + 2
                });
            }
            
            snakeFood = {x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows)};
            
            // Speed up
            if (snakeSpeed > 45) {
                snakeSpeed -= 2;
                clearInterval(snakeInterval);
                snakeInterval = setInterval(gameLoop, snakeSpeed);
                var lvl = Math.floor((90 - snakeSpeed) / 10) + 1;
                document.getElementById('snSpeed').textContent = lvl + 'x';
            }
        } else {
            snake.pop();
        }
        
        // DRAW
        ctx.fillStyle = '#0A0E27';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // GRID
        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
        ctx.lineWidth = 1;
        for (var x = 0; x < canvas.width; x += size) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
        for (var y = 0; y < canvas.height; y += size) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
        
        // PARTICLES
        snakeParticles = snakeParticles.filter(function(p) {
            p.x += p.vx; p.y += p.vy; p.life--;
            ctx.globalAlpha = p.life / 20;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (p.life/20), 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
            return p.life > 0;
        });
        ctx.globalAlpha = 1;
        
        // FOOD GLOW
        var fx = snakeFood.x * size + size/2;
        var fy = snakeFood.y * size + size/2;
        var glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, size);
        glow.addColorStop(0, 'rgba(255,71,87,0.6)');
        glow.addColorStop(1, 'rgba(255,71,87,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(fx, fy, size, 0, Math.PI*2);
        ctx.fill();
        
        // FOOD
        var foodGrad = ctx.createRadialGradient(fx-2, fy-2, 0, fx, fy, size*0.45);
        foodGrad.addColorStop(0, '#FF6B81');
        foodGrad.addColorStop(1, '#FF4757');
        ctx.fillStyle = foodGrad;
        ctx.shadowColor = '#FF4757';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(fx, fy, size*0.4, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // FOOD SHINE
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(fx - size*0.1, fy - size*0.1, size*0.1, 0, Math.PI*2);
        ctx.fill();
        
        // SNAKE BODY
        snake.forEach(function(s, i) {
            var ratio = 1 - (i / snake.length) * 0.5;
            var sx = s.x * size;
            var sy = s.y * size;
            
            // Body gradient
            var grad = ctx.createLinearGradient(sx, sy, sx + size, sy + size);
            if (i === 0) {
                grad.addColorStop(0, '#F5E6A3');
                grad.addColorStop(1, '#D4AF37');
            } else {
                grad.addColorStop(0, 'rgba(212,175,55,' + ratio + ')');
                grad.addColorStop(1, 'rgba(180,150,30,' + ratio + ')');
            }
            
            ctx.fillStyle = grad;
            ctx.shadowColor = '#D4AF37';
            ctx.shadowBlur = i === 0 ? 15 : 6;
            
            // Rounded rect
            var r = 6;
            ctx.beginPath();
            ctx.moveTo(sx + r, sy);
            ctx.lineTo(sx + size - r, sy);
            ctx.quadraticCurveTo(sx + size, sy, sx + size, sy + r);
            ctx.lineTo(sx + size, sy + size - r);
            ctx.quadraticCurveTo(sx + size, sy + size, sx + size - r, sy + size);
            ctx.lineTo(sx + r, sy + size);
            ctx.quadraticCurveTo(sx, sy + size, sx, sy + size - r);
            ctx.lineTo(sx, sy + r);
            ctx.quadraticCurveTo(sx, sy, sx + r, sy);
            ctx.closePath();
            ctx.fill();
            
            ctx.shadowBlur = 0;
            
            // HEAD EYES
            if (i === 0) {
                var es = size * 0.2;
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#fff';
                ctx.shadowBlur = 3;
                ctx.beginPath();
                ctx.arc(sx + size*0.65, sy + size*0.3, es, 0, Math.PI*2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(sx + size*0.65, sy + size*0.7, es, 0, Math.PI*2);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(sx + size*0.68, sy + size*0.3, es*0.5, 0, Math.PI*2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(sx + size*0.68, sy + size*0.7, es*0.5, 0, Math.PI*2);
                ctx.fill();
                
                // Tongue
                if (ate) {
                    ctx.fillStyle = '#FF4757';
                    ctx.beginPath();
                    ctx.arc(sx + size*0.8, sy + size*0.5, es*0.6, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        });
    }
    
    function gameOver(ctx, canvas) {
        snakeActive = false;
        clearInterval(snakeInterval);
        
        if (snakeScore > snakeHighScore) {
            snakeHighScore = snakeScore;
            localStorage.setItem('snakeHigh', snakeHighScore);
        }
        
        // Darken
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Game Over text
        ctx.fillStyle = '#FF4757';
        ctx.font = 'bold 28px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 20);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Poppins';
        ctx.fillText('Score: ' + snakeScore, canvas.width/2, canvas.height/2 + 20);
        
        if (snakeScore >= snakeHighScore) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 14px Poppins';
            ctx.fillText('🏆 NEW HIGH SCORE!', canvas.width/2, canvas.height/2 + 50);
        }
        
        if (typeof addXP === 'function') addXP(Math.floor(snakeScore / 2));
    }
    
    snakeInterval = setInterval(gameLoop, snakeSpeed);
    
    // KEYBOARD
    document.onkeydown = function(e) {
        if (!snakeActive) return;
        if (e.key === 'ArrowUp' && snakeDir.y === 0) { snakeDir = {x:0,y:-1}; e.preventDefault(); }
        if (e.key === 'ArrowDown' && snakeDir.y === 0) { snakeDir = {x:0,y:1}; e.preventDefault(); }
        if (e.key === 'ArrowLeft' && snakeDir.x === 0) { snakeDir = {x:-1,y:0}; e.preventDefault(); }
        if (e.key === 'ArrowRight' && snakeDir.x === 0) { snakeDir = {x:1,y:0}; e.preventDefault(); }
    };
    
    // TOUCH SWIPE
    var tx = 0, ty = 0;
    canvas.ontouchstart = function(e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
    canvas.ontouchend = function(e) {
        if (!snakeActive) return;
        var dx = e.changedTouches[0].clientX - tx;
        var dy = e.changedTouches[0].clientY - ty;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 25 && snakeDir.x === 0) snakeDir = {x:1,y:0};
            else if (dx < -25 && snakeDir.x === 0) snakeDir = {x:-1,y:0};
        } else {
            if (dy > 25 && snakeDir.y === 0) snakeDir = {x:0,y:1};
            else if (dy < -25 && snakeDir.y === 0) snakeDir = {x:0,y:-1};
        }
    };
                }
