var flappyData = {};

function startFlappyPremium() {
    openFullPageGame('🐦 Flappy Bird');
    gameCanvas.style.display = 'block';
    
    flappyData = {
        canvas: gameCanvas, ctx: gameCtx,
        bird: {x:100, y:gameCanvas.height/2, r:18, vy:0, angle:0},
        pipes: [], score: 0, bestScore: 0,
        particles: [], clouds: [], frame: 0,
        groundOffset: 0, gameSpeed: 3
    };
    
    flappyData.bestScore = parseInt(localStorage.getItem('flappyBest') || '0');
    
    // Create clouds
    for (var i=0;i<6;i++) {
        flappyData.clouds.push({
            x: Math.random()*gameCanvas.width,
            y: Math.random()*gameCanvas.height*0.5,
            w: Math.random()*80+40,
            h: Math.random()*30+15,
            speed: Math.random()*0.5+0.3
        });
    }
    
    gameAnimation = requestAnimationFrame(flappyLoop);
    currentGameRestart = startFlappyPremium;
}

function flappyLoop() {
    if (!gameActive) return;
    
    var c = flappyData.canvas, ctx = flappyData.ctx;
    var b = flappyData.bird, gs = flappyData.gameSpeed;
    flappyData.frame++;
    flappyData.groundOffset = (flappyData.groundOffset + gs) % 40;
    
    // Sky gradient
    var sky = ctx.createLinearGradient(0,0,0,c.height);
    sky.addColorStop(0, '#1a3a5c');
    sky.addColorStop(0.5, '#2d5a87');
    sky.addColorStop(1, '#4a90d9');
    ctx.fillStyle = sky;
    ctx.fillRect(0,0,c.width,c.height);
    
    // Clouds
    flappyData.clouds.forEach(function(cl) {
        cl.x -= cl.speed;
        if (cl.x < -cl.w) cl.x = c.width + cl.w;
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath();
        ctx.ellipse(cl.x, cl.y, cl.w/2, cl.h/2, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cl.x+cl.w*0.3, cl.y-cl.h*0.2, cl.w*0.3, cl.h*0.3, 0, 0, Math.PI*2);
        ctx.fill();
    });
    
    // Bird physics
    b.vy += 0.6;
    b.y += b.vy;
    b.angle = Math.min(Math.max(b.vy * 0.08, -0.5), 1.2);
    
    // Spawn pipes
    if (flappyData.frame % 90 === 0) {
        var gap = 150;
        var pipeY = Math.random()*(c.height-gap-150)+75;
        flappyData.pipes.push({x:c.width, y:pipeY, gap:gap, scored:false});
    }
    
    // Move pipes
    flappyData.pipes.forEach(function(p) { p.x -= gs; });
    flappyData.pipes = flappyData.pipes.filter(function(p) { return p.x > -80; });
    
    // Draw pipes
    flappyData.pipes.forEach(function(p) {
        var pipeGrad = ctx.createLinearGradient(p.x,0,p.x+60,0);
        pipeGrad.addColorStop(0, '#2ED573');
        pipeGrad.addColorStop(0.5, '#7bed9f');
        pipeGrad.addColorStop(1, '#2ED573');
        ctx.fillStyle = pipeGrad;
        
        // Top pipe
        ctx.fillRect(p.x,0,60,p.y);
        ctx.fillStyle = '#1e8e3e';
        ctx.fillRect(p.x-5, p.y-25, 70, 25);
        ctx.fillRect(p.x-2, p.y-30, 64, 8);
        
        // Bottom pipe
        ctx.fillStyle = pipeGrad;
        ctx.fillRect(p.x, p.y+p.gap, 60, c.height);
        ctx.fillStyle = '#1e8e3e';
        ctx.fillRect(p.x-5, p.y+p.gap, 70, 25);
        ctx.fillRect(p.x-2, p.y+p.gap+22, 64, 8);
        
        // Score
        if (!p.scored && p.x+60 < b.x) {
            p.scored = true;
            flappyData.score++;
            updateScore(flappyData.score);
            if (flappyData.score > flappyData.bestScore) {
                flappyData.bestScore = flappyData.score;
                localStorage.setItem('flappyBest', flappyData.bestScore);
            }
        }
    });
    
    // Collision
    if (b.y-b.r < 0 || b.y+b.r > c.height-50) {
        gameOver('🐦 Score: ' + flappyData.score + ' | Best: ' + flappyData.bestScore);
        return;
    }
    
    flappyData.pipes.forEach(function(p) {
        if (b.x+b.r > p.x && b.x-b.r < p.x+60) {
            if (b.y-b.r < p.y || b.y+b.r > p.y+p.gap) {
                gameOver('🐦 Score: ' + flappyData.score + ' | Best: ' + flappyData.bestScore);
            }
        }
    });
    
    // Draw bird
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);
    
    // Body
    var bodyGrad = ctx.createLinearGradient(0,-b.r,0,b.r);
    bodyGrad.addColorStop(0, '#FFD700');
    bodyGrad.addColorStop(0.5, '#FFA500');
    bodyGrad.addColorStop(1, '#FF8C00');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(0,0,b.r,0,Math.PI*2);
    ctx.fill();
    
    // Wing
    ctx.fillStyle = '#FFC107';
    ctx.beginPath();
    ctx.ellipse(-5, -5, 12, 8, -0.3, 0, Math.PI*2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(8, -4, 7, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(10, -4, 3.5, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(11, -5, 1.5, 0, Math.PI*2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.moveTo(15, 2);
    ctx.lineTo(25, 0);
    ctx.lineTo(15, -2);
    ctx.fill();
    
    ctx.restore();
    
    // Ground
    var gGrad = ctx.createLinearGradient(0,c.height-50,0,c.height);
    gGrad.addColorStop(0, '#8B5E3C');
    gGrad.addColorStop(1, '#5D3A1A');
    ctx.fillStyle = gGrad;
    ctx.fillRect(0,c.height-50,c.width,50);
    
    // Ground pattern
    ctx.fillStyle = '#7A5230';
    for (var i=flappyData.groundOffset;i<c.width;i+=40) {
        ctx.fillRect(i, c.height-48, 20, 5);
    }
    
    // Best score
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 13px Poppins';
    ctx.textAlign = 'right';
    ctx.fillText('Best: ' + flappyData.bestScore, c.width-15, 25);
    
    gameAnimation = requestAnimationFrame(flappyLoop);
}

// Flap
document.addEventListener('click', function(e) {
    if (flappyData.bird && gameActive) flappyData.bird.vy = -9;
});
document.addEventListener('keydown', function(e) {
    if ((e.key===' '||e.key==='ArrowUp') && flappyData.bird && gameActive) {
        flappyData.bird.vy = -9;
        e.preventDefault();
    }
});

console.log('✅ Premium Flappy Bird loaded');
