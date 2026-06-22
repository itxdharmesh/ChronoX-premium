// ==================== PREMIUM PONG ====================
var pongData = {};

function startPongPremium() {
    openFullPageGame('🏓 Pong');
    gameCanvas.style.display = 'block';
    gameCanvas.style.background = '#0A0E27';
    
    pongData = {
        canvas: gameCanvas, ctx: gameCtx,
        ball: {x:gameCanvas.width/2, y:gameCanvas.height/2, dx:5, dy:5, r:10},
        player: {x:15, y:gameCanvas.height/2-60, w:12, h:120, score:0},
        ai: {x:gameCanvas.width-27, y:gameCanvas.height/2-60, w:12, h:120, score:0},
        particles: [], trail: [],
        maxScore: 7, winner: null
    };
    
    gameAnimation = requestAnimationFrame(pongLoop);
    currentGameRestart = startPongPremium;
}

function pongLoop() {
    if (!gameActive || pongData.winner) {
        if (pongData.winner) showPongResult();
        return;
    }
    
    var ctx = pongData.ctx, c = pongData.canvas;
    var b = pongData.ball, p = pongData.player, a = pongData.ai;
    
    // Clear
    ctx.fillStyle = '#0A0E27';
    ctx.fillRect(0,0,c.width,c.height);
    
    // Center line
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.setLineDash([8,12]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.width/2, 0);
    ctx.lineTo(c.width/2, c.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Center circle
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.arc(c.width/2, c.height/2, 60, 0, Math.PI*2);
    ctx.stroke();
    
    // Ball trail
    pongData.trail.push({x:b.x, y:b.y, life:5});
    pongData.trail = pongData.trail.filter(function(t) {
        t.life--;
        ctx.globalAlpha = t.life / 5;
        ctx.fillStyle = '#00D4FF';
        ctx.beginPath();
        ctx.arc(t.x, t.y, b.r*(t.life/5), 0, Math.PI*2);
        ctx.fill();
        return t.life > 0;
    });
    ctx.globalAlpha = 1;
    
    // Move ball
    b.x += b.dx;
    b.y += b.dy;
    
    // Wall bounce
    if (b.y <= b.r || b.y >= c.height - b.r) {
        b.dy *= -1;
        spawnPongParticles(b.x, b.y, '#fff');
    }
    
    // Player paddle collision
    if (b.x - b.r <= p.x + p.w && b.y >= p.y && b.y <= p.y + p.h) {
        var angle = ((b.y - (p.y + p.h/2)) / (p.h/2)) * 0.75;
        b.dx = Math.abs(b.dx) * Math.cos(angle) * 1.1;
        b.dy = Math.abs(b.dx) * Math.sin(angle) * 1.1;
        b.x = p.x + p.w + b.r;
        spawnPongParticles(b.x, b.y, '#D4AF37');
        updateScore(p.score);
    }
    
    // AI paddle collision
    if (b.x + b.r >= a.x && b.y >= a.y && b.y <= a.y + a.h) {
        var angle2 = ((b.y - (a.y + a.h/2)) / (a.h/2)) * 0.75;
        b.dx = -Math.abs(b.dx) * Math.cos(angle2) * 1.1;
        b.dy = Math.abs(b.dx) * Math.sin(angle2) * 1.1;
        b.x = a.x - b.r;
        spawnPongParticles(b.x, b.y, '#FF4757');
    }
    
    // AI movement
    var aiTarget = b.y - a.h/2;
    a.y += (aiTarget - a.y) * 0.12;
    if (a.y < 0) a.y = 0;
    if (a.y + a.h > c.height) a.y = c.height - a.h;
    
    // Scoring
    if (b.x < 0) { a.score++; b.x=c.width/2; b.y=c.height/2; b.dx=5; b.dy=(Math.random()-0.5)*6; if(a.score>=pongData.maxScore)pongData.winner='ai'; }
    if (b.x > c.width) { p.score++; b.x=c.width/2; b.y=c.height/2; b.dx=-5; b.dy=(Math.random()-0.5)*6; if(p.score>=pongData.maxScore)pongData.winner='player'; }
    
    // Draw paddles with glow
    drawPongPaddle(p.x, p.y, p.w, p.h, '#D4AF37', '🧑');
    drawPongPaddle(a.x, a.y, a.w, a.h, '#FF4757', '🤖');
    
    // Draw ball with glow
    var ballGlow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r*3);
    ballGlow.addColorStop(0, 'rgba(0,212,255,0.8)');
    ballGlow.addColorStop(0.5, 'rgba(0,212,255,0.3)');
    ballGlow.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.fillStyle = ballGlow;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r*3, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.fill();
    
    // Scores
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = 'bold 48px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText(p.score, c.width/4, 60);
    ctx.fillText(a.score, c.width*3/4, 60);
    
    // Update display score
    updateScore(p.score);
    
    // Particles
    pongData.particles = pongData.particles.filter(function(pt) {
        pt.x += pt.vx; pt.y += pt.vy; pt.life--;
        ctx.globalAlpha = pt.life / 15;
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 3, 3);
        return pt.life > 0;
    });
    ctx.globalAlpha = 1;
    
    gameAnimation = requestAnimationFrame(pongLoop);
}

function drawPongPaddle(x, y, w, h, color, emoji) {
    var ctx = pongData.ctx;
    var grad = ctx.createLinearGradient(x, y, x+w, y);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(255,255,255,0.3)');
    ctx.fillStyle = grad;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    
    var r = 6;
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
}

function spawnPongParticles(x, y, color) {
    for (var i=0;i<10;i++) {
        pongData.particles.push({
            x:x, y:y,
            vx:(Math.random()-0.5)*6,
            vy:(Math.random()-0.5)*6,
            life:15,
            color:color
        });
    }
}

function showPongResult() {
    var msg = pongData.winner==='player' ? '🎉 You Win! ' + pongData.player.score + '-' + pongData.ai.score :
              '😞 AI Wins! ' + pongData.ai.score + '-' + pongData.player.score;
    gameOver(msg);
}

// Mouse/Touch control
document.addEventListener('mousemove', function(e) {
    if (pongData.player) {
        var rect = gameCanvas ? gameCanvas.getBoundingClientRect() : null;
        if (rect) pongData.player.y = e.clientY - rect.top - pongData.player.h/2;
    }
});

document.addEventListener('touchmove', function(e) {
    if (pongData.player && gameCanvas) {
        var rect = gameCanvas.getBoundingClientRect();
        pongData.player.y = e.touches[0].clientY - rect.top - pongData.player.h/2;
        e.preventDefault();
    }
}, {passive: false});

console.log('✅ Premium Pong loaded');
