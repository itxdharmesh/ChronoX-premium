var breakoutData = {};

function startBreakoutPremium() {
    openFullPageGame('🧱 Breakout');
    gameCanvas.style.display = 'block';
    
    breakoutData = {
        canvas: gameCanvas, ctx: gameCtx,
        paddle: {x:gameCanvas.width/2-60, y:gameCanvas.height-40, w:120, h:14},
        ball: {x:gameCanvas.width/2, y:gameCanvas.height-60, dx:5, dy:-5, r:8},
        bricks: [], score: 0, lives: 3, level: 1,
        particles: [], powerUps: []
    };
    
    spawnBreakoutBricks();
    gameAnimation = requestAnimationFrame(breakoutLoop);
    currentGameRestart = startBreakoutPremium;
}

function spawnBreakoutBricks() {
    breakoutData.bricks = [];
    var colors = ['#FF4757','#FF6B81','#FFA502','#2ED573','#1E90FF','#7C3AED','#FFD700'];
    var rows = 5 + breakoutData.level;
    
    for (var r=0;r<rows;r++) {
        for (var c=0;c<8;c++) {
            breakoutData.bricks.push({
                x:c*55+20, y:r*28+40,
                w:48, h:22,
                alive:true,
                color: colors[r % colors.length],
                hp: r < 3 ? 1 : 2
            });
        }
    }
}

function breakoutLoop() {
    if (!gameActive) return;
    
    var c = breakoutData.canvas, ctx = breakoutData.ctx;
    var p = breakoutData.paddle, b = breakoutData.ball;
    
    // Background
    var bgGrad = ctx.createLinearGradient(0,0,0,c.height);
    bgGrad.addColorStop(0, '#1a1a3e');
    bgGrad.addColorStop(1, '#0A0E27');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0,0,c.width,c.height);
    
    // Move ball
    b.x += b.dx;
    b.y += b.dy;
    
    // Wall collision
    if (b.x-b.r <= 0 || b.x+b.r >= c.width) b.dx *= -1;
    if (b.y-b.r <= 0) b.dy *= -1;
    if (b.y+b.r >= c.height) {
        breakoutData.lives--;
        if (breakoutData.lives <= 0) { gameOver('🧱 Score: ' + breakoutData.score); return; }
        b.x = c.width/2; b.y = c.height-60; b.dx = 5; b.dy = -5;
    }
    
    // Paddle collision
    if (b.y+b.r >= p.y && b.x > p.x && b.x < p.x+p.w) {
        var hitPos = (b.x - p.x) / p.w;
        var angle = (hitPos - 0.5) * 1.2;
        b.dy = -Math.abs(b.dy);
        b.dx = Math.sin(angle) * 6;
        for (var i=0;i<5;i++) spawnBreakoutParticles(b.x, b.y, '#D4AF37');
    }
    
    // Bricks collision
    breakoutData.bricks.forEach(function(br) {
        if (!br.alive) return;
        if (b.x+b.r > br.x && b.x-b.r < br.x+br.w && b.y+b.r > br.y && b.y-b.r < br.y+br.h) {
            b.dy *= -1;
            br.hp--;
            if (br.hp <= 0) {
                br.alive = false;
                breakoutData.score += 10;
                updateScore(breakoutData.score);
                for (var i=0;i<8;i++) spawnBreakoutParticles(br.x+br.w/2, br.y+br.h/2, br.color);
            }
        }
    });
    
    // Draw bricks
    breakoutData.bricks.forEach(function(br) {
        if (!br.alive) return;
        var grad = ctx.createLinearGradient(br.x, br.y, br.x, br.y+br.h);
        grad.addColorStop(0, br.color);
        grad.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = grad;
        ctx.shadowColor = br.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(br.x, br.y, br.w, br.h);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(br.x, br.y, br.w, 4);
        if (br.hp === 2) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(br.x+2, br.y+2, br.w-4, br.h-4);
        }
    });
    
    // Draw paddle
    var pGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y+p.h);
    pGrad.addColorStop(0, '#D4AF37');
    pGrad.addColorStop(1, '#8B6914');
    ctx.fillStyle = pGrad;
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw ball
    var ballGlow = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*3);
    ballGlow.addColorStop(0, 'rgba(255,255,255,0.8)');
    ballGlow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = ballGlow;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r*3, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.fill();
    
    // Particles
    breakoutData.particles = breakoutData.particles.filter(function(pt) {
        pt.x += pt.vx; pt.y += pt.vy; pt.life--;
        ctx.globalAlpha = pt.life/12;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size*(pt.life/12), 0, Math.PI*2);
        ctx.fill();
        return pt.life > 0;
    });
    ctx.globalAlpha = 1;
    
    // Check win
    if (breakoutData.bricks.every(function(br){return !br.alive;})) {
        breakoutData.level++;
        breakoutData.score += 50;
        b.x = c.width/2; b.y = c.height-60; b.dx = 5; b.dy = -5;
        spawnBreakoutBricks();
    }
    
    // Lives
    ctx.fillStyle = '#fff';
    ctx.font = '14px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText('❤️ x' + breakoutData.lives + ' | Level ' + breakoutData.level, 10, 22);
    
    gameAnimation = requestAnimationFrame(breakoutLoop);
}

function spawnBreakoutParticles(x, y, color) {
    for (var i=0;i<6;i++) {
        breakoutData.particles.push({
            x:x, y:y,
            vx:(Math.random()-0.5)*5,
            vy:(Math.random()-0.5)*5,
            life:12, size:Math.random()*3+2,
            color:color
        });
    }
}

document.addEventListener('mousemove', function(e) {
    if (breakoutData.paddle && gameCanvas) {
        var rect = gameCanvas.getBoundingClientRect();
        breakoutData.paddle.x = e.clientX - rect.left - breakoutData.paddle.w/2;
    }
});

document.addEventListener('touchmove', function(e) {
    if (breakoutData.paddle && gameCanvas) {
        var rect = gameCanvas.getBoundingClientRect();
        breakoutData.paddle.x = e.touches[0].clientX - rect.left - breakoutData.paddle.w/2;
        e.preventDefault();
    }
}, {passive: false});

console.log('✅ Premium Breakout loaded');
