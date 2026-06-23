var doodleData;

function startDoodle() {
    openGameScreen('🎨 Doodle Jump');
    gameCanvas.style.display = 'block';
    gameCanvas.width = Math.min(window.innerWidth, 400);
    gameCanvas.height = Math.min(window.innerHeight - 100, 550);
    
    doodleData = {
        player: { x: gameCanvas.width / 2, y: gameCanvas.height - 80, w: 40, h: 45, vy: 0 },
        platforms: [],
        score: 0,
        bestScore: parseInt(localStorage.getItem('doodleBest') || '0'),
        cameraY: 0,
        frame: 0,
        particles: [],
        gameOver: false
    };
    
    var d = doodleData;
    
    // Create initial platforms
    d.platforms.push({ x: gameCanvas.width / 2 - 35, y: gameCanvas.height - 40, w: 70, h: 12, type: 'normal' });
    for (var i = 0; i < 8; i++) {
        d.platforms.push({
            x: Math.random() * (gameCanvas.width - 70),
            y: gameCanvas.height - 120 - i * 60,
            w: Math.random() * 50 + 50,
            h: 12,
            type: Math.random() < 0.15 ? 'moving' : Math.random() < 0.1 ? 'break' : 'normal',
            moveDir: Math.random() < 0.5 ? 1 : -1,
            moveSpeed: Math.random() * 2 + 1
        });
    }
    
    currentGameRestart = startDoodle;
    gameAnimation = requestAnimationFrame(doodleLoop);
}

function doodleLoop() {
    if (!gameActive || doodleData.gameOver) return;
    
    var c = gameCanvas, ctx = gameCtx;
    var d = doodleData, p = d.player;
    d.frame++;
    
    // Background gradient
    var bgGrad = ctx.createLinearGradient(0, 0, 0, c.height);
    bgGrad.addColorStop(0, '#1a3a5c');
    bgGrad.addColorStop(0.5, '#2d5a87');
    bgGrad.addColorStop(1, '#4a90d9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, c.width, c.height);
    
    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (var i = 0; i < 20; i++) {
        var sx = (i * 97 + d.frame * 0.2) % c.width;
        var sy = (i * 53 + d.cameraY * 0.1) % c.height;
        ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    
    // Physics
    p.vy += 0.6;
    p.y += p.vy;
    
    // Camera follow
    if (p.y < c.height / 3) {
        d.cameraY += (c.height / 3 - p.y);
        p.y = c.height / 3;
    }
    
    // Screen wrap
    if (p.x < -p.w) p.x = c.width;
    if (p.x > c.width) p.x = -p.w;
    
    // Platform collision
    if (p.vy > 0) {
        d.platforms.forEach(function(plat) {
            var py = plat.y - d.cameraY;
            if (py > c.height + 50 || py < -50) return;
            
            if (p.y + p.h >= py && p.y + p.h - p.vy <= py &&
                p.x + p.w > plat.x && p.x < plat.x + plat.w &&
                plat.type !== 'break' ? true : plat.type === 'break') {
                
                if (plat.type === 'break') {
                    plat.broken = true;
                    p.vy = -12;
                    for (var i = 0; i < 8; i++) {
                        d.particles.push({
                            x: plat.x + plat.w / 2, y: py,
                            vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 3 - 3,
                            life: 15, color: '#8B4513', size: Math.random() * 3 + 2
                        });
                    }
                } else {
                    p.vy = -13 + Math.random() * 2;
                    d.score += 10;
                    updateGameScore(d.score);
                    
                    if (d.score > d.bestScore) {
                        d.bestScore = d.score;
                        localStorage.setItem('doodleBest', d.bestScore);
                    }
                    
                    for (var i = 0; i < 4; i++) {
                        d.particles.push({
                            x: p.x + p.w / 2, y: p.y + p.h,
                            vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 4,
                            life: 10, color: '#FFD700', size: Math.random() * 2 + 1
                        });
                    }
                }
            }
        });
    }
    
    // Remove broken and off-screen platforms
    d.platforms = d.platforms.filter(function(plat) {
        var py = plat.y - d.cameraY;
        return py < c.height + 100 && !plat.broken;
    });
    
    // Generate new platforms
    while (d.platforms.length < 10) {
        var lowestY = Math.min.apply(null, d.platforms.map(function(p) { return p.y; }));
        d.platforms.push({
            x: Math.random() * (c.width - 70),
            y: lowestY - Math.random() * 60 - 40,
            w: Math.random() * 50 + 50,
            h: 12,
            type: Math.random() < 0.15 ? 'moving' : Math.random() < 0.08 ? 'break' : 'normal',
            moveDir: Math.random() < 0.5 ? 1 : -1,
            moveSpeed: Math.random() * 2 + 1
        });
    }
    
    // Move moving platforms
    d.platforms.forEach(function(plat) {
        if (plat.type === 'moving') {
            plat.x += plat.moveDir * plat.moveSpeed;
            if (plat.x < 0 || plat.x + plat.w > c.width) plat.moveDir *= -1;
        }
    });
    
    // Draw platforms
    d.platforms.forEach(function(plat) {
        var py = plat.y - d.cameraY;
        if (py > c.height + 50 || py < -50) return;
        
        var color = plat.type === 'moving' ? '#00D4FF' : plat.type === 'break' ? '#FF4757' : '#2ED573';
        var grad = ctx.createLinearGradient(plat.x, py, plat.x, py + plat.h);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = grad;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(plat.x, py, plat.w, plat.h, 6);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(plat.x + 4, py, plat.w - 8, 4);
    });
    
    // Draw player (Doodle)
    var px = p.x, py = p.y;
    
    // Body
    var bodyGrad = ctx.createLinearGradient(px, py, px, py + p.h);
    bodyGrad.addColorStop(0, '#FFD700');
    bodyGrad.addColorStop(1, '#FF8C00');
    ctx.fillStyle = bodyGrad;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(px, py, p.w, p.h, 10);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Face
    ctx.fillStyle = '#F5E6A3';
    ctx.beginPath();
    ctx.arc(px + p.w / 2, py + 10, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(px + p.w / 2 + 4, py + 8, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px + p.w / 2 - 6, py + 8, 2.5, 0, Math.PI * 2); ctx.fill();
    
    // Mouth
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px + p.w / 2 - 1, py + 14, 4, 0.1, Math.PI - 0.1);
    ctx.stroke();
    
    // Hat
    ctx.fillStyle = '#FF4757';
    ctx.beginPath();
    ctx.roundRect(px + p.w / 2 - 14, py - 8, 28, 10, 5);
    ctx.fill();
    ctx.fillRect(px + p.w / 2 - 8, py - 18, 16, 12);
    
    // Draw particles
    d.particles = d.particles.filter(function(pt) {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        ctx.globalAlpha = pt.life / 15;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y - d.cameraY, pt.size * (pt.life / 15), 0, Math.PI * 2);
        ctx.fill();
        return pt.life > 0;
    });
    ctx.globalAlpha = 1;
    
    // Game over
    if (p.y - d.cameraY > c.height + 100) {
        d.gameOver = true;
        if (d.score > d.bestScore) {
            d.bestScore = d.score;
            localStorage.setItem('doodleBest', d.bestScore);
        }
        endGame('🎨 Score: ' + d.score + ' | Best: ' + d.bestScore);
        return;
    }
    
    // HUD
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + d.score + ' | Best: ' + d.bestScore, 10, 25);
    
    gameAnimation = requestAnimationFrame(doodleLoop);
}

// Controls
document.addEventListener('keydown', function(e) {
    if (!doodleData || !doodleData.player || !gameActive) return;
    if (e.key === 'ArrowLeft') doodleData.player.x -= 15;
    if (e.key === 'ArrowRight') doodleData.player.x += 15;
});

document.addEventListener('touchmove', function(e) {
    if (!doodleData || !doodleData.player || !gameActive) return;
    var rect = gameCanvas.getBoundingClientRect();
    doodleData.player.x = e.touches[0].clientX - rect.left - doodleData.player.w / 2;
    e.preventDefault();
}, { passive: false });

// Tilt control for mobile
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(e) {
        if (!doodleData || !doodleData.player || !gameActive) return;
        var tilt = e.gamma;
        if (tilt > 10) doodleData.player.x += 8;
        if (tilt < -10) doodleData.player.x -= 8;
    });
}

console.log('✅ Doodle Jump loaded');
