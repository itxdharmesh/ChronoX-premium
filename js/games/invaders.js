var invaderData = {};

function startInvadersPremium() {
    openFullPageGame('👾 Space Invaders');
    gameCanvas.style.display = 'block';
    
    invaderData = {
        canvas: gameCanvas, ctx: gameCtx,
        player: {x:gameCanvas.width/2, y:gameCanvas.height-60, w:50, h:25},
        enemies: [], bullets: [], enemyBullets: [],
        score: 0, level: 1, lives: 3,
        shields: [], stars: [], frame: 0,
        enemyDir: 1, enemySpeed: 1
    };
    
    // Stars
    for (var i=0;i<50;i++) {
        invaderData.stars.push({
            x:Math.random()*gameCanvas.width,
            y:Math.random()*gameCanvas.height,
            size:Math.random()*2+1,
            speed:Math.random()*0.5+0.2
        });
    }
    
    // Shields
    for (var i=0;i<3;i++) {
        invaderData.shields.push({x:gameCanvas.width/4*(i+1)-30, y:gameCanvas.height-140, hp:20});
    }
    
    spawnInvaderWave();
    gameAnimation = requestAnimationFrame(invaderLoop);
    currentGameRestart = startInvadersPremium;
}

function spawnInvaderWave() {
    invaderData.enemies = [];
    var types = [
        {color:'#FF4757', points:30, emoji:'👾'},
        {color:'#FF6B81', points:20, emoji:'👽'},
        {color:'#FFA502', points:10, emoji:'🤖'}
    ];
    
    for (var r=0;r<4;r++) {
        for (var c=0;c<8;c++) {
            invaderData.enemies.push({
                x: c*50+40,
                y: r*40+50,
                w:35, h:28,
                alive:true,
                type: types[Math.min(r,2)],
                bobOffset: Math.random()*Math.PI*2
            });
        }
    }
    invaderData.enemySpeed = 1 + invaderData.level * 0.5;
}

function invaderLoop() {
    if (!gameActive) return;
    
    var c = invaderData.canvas, ctx = invaderData.ctx;
    var p = invaderData.player;
    invaderData.frame++;
    
    // Background
    ctx.fillStyle = '#0A0E27';
    ctx.fillRect(0,0,c.width,c.height);
    
    // Stars
    invaderData.stars.forEach(function(s) {
        s.y += s.speed;
        if (s.y > c.height) { s.y = 0; s.x = Math.random()*c.width; }
        ctx.fillStyle = 'rgba(255,255,255,' + s.speed + ')';
        ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    
    // Enemies
    var hitEdge = false;
    invaderData.enemies.forEach(function(e) {
        if (!e.alive) return;
        e.x += invaderData.enemyDir * invaderData.enemySpeed;
        e.y += Math.sin(invaderData.frame*0.05 + e.bobOffset) * 0.3;
        if (e.x <= 10 || e.x >= c.width-45) hitEdge = true;
        if (e.y > c.height-100) { gameOver('👾 Invaders Win! Score: ' + invaderData.score); }
        
        // Draw enemy
        ctx.fillStyle = e.type.color;
        ctx.shadowColor = e.type.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(e.x, e.y, e.w, 5);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText(e.type.emoji, e.x+8, e.y+20);
    });
    
    if (hitEdge) {
        invaderData.enemyDir *= -1;
        invaderData.enemies.forEach(function(e) { e.y += 15; });
    }
    
    // Enemy bullets
    if (Math.random() < 0.02 + invaderData.level*0.005) {
        var alive = invaderData.enemies.filter(function(e) { return e.alive; });
        if (alive.length > 0) {
            var shooter = alive[Math.floor(Math.random()*alive.length)];
            invaderData.enemyBullets.push({x:shooter.x+17, y:shooter.y+28, vy:4+invaderData.level});
        }
    }
    
    invaderData.enemyBullets.forEach(function(b) {
        b.y += b.vy;
        ctx.fillStyle = '#FF4757';
        ctx.shadowColor = '#FF4757';
        ctx.shadowBlur = 6;
        ctx.fillRect(b.x, b.y, 3, 10);
        ctx.shadowBlur = 0;
    });
    invaderData.enemyBullets = invaderData.enemyBullets.filter(function(b) { return b.y < c.height; });
    
    // Player bullets
    invaderData.bullets.forEach(function(b) {
        b.y -= 8;
        ctx.fillStyle = '#00D4FF';
        ctx.shadowColor = '#00D4FF';
        ctx.shadowBlur = 8;
        ctx.fillRect(b.x, b.y, 3, 12);
        ctx.shadowBlur = 0;
        
        invaderData.enemies.forEach(function(e) {
            if (e.alive && b.x>e.x && b.x<e.x+e.w && b.y>e.y && b.y<e.y+e.h) {
                e.alive = false;
                b.y = -10;
                invaderData.score += e.type.points;
                updateScore(invaderData.score);
                for (var i=0;i<5;i++) invaderData.particles.push({x:e.x+e.w/2,y:e.y+e.h/2,vx:(Math.random()-0.5)*3,vy:(Math.random()-0.5)*3,life:10,color:e.type.color});
            }
        });
    });
    invaderData.bullets = invaderData.bullets.filter(function(b) { return b.y > 0; });
    
    // Collision - enemy bullets hit player
    invaderData.enemyBullets.forEach(function(b) {
        if (b.x>p.x && b.x<p.x+p.w && b.y>p.y && b.y<p.y+p.h) {
            invaderData.lives--;
            b.y = c.height + 10;
            if (invaderData.lives <= 0) gameOver('👾 Game Over! Score: ' + invaderData.score);
        }
    });
    
    // Shields
    invaderData.shields.forEach(function(s) {
        if (s.hp > 0) {
            ctx.fillStyle = 'rgba(0,212,255,' + (s.hp/20*0.5) + ')';
            ctx.fillRect(s.x, s.y, 60, 20);
            ctx.strokeStyle = '#00D4FF';
            ctx.strokeRect(s.x, s.y, 60, 20);
        }
    });
    
    // Player
    var pGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y+p.h);
    pGrad.addColorStop(0, '#00D4FF');
    pGrad.addColorStop(1, '#0088cc');
    ctx.fillStyle = pGrad;
    ctx.shadowColor = '#00D4FF';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(p.x+p.w/2, p.y);
    ctx.lineTo(p.x, p.y+p.h);
    ctx.lineTo(p.x+p.w, p.y+p.h);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Lives
    ctx.fillStyle = '#fff';
    ctx.font = '14px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText('❤️ x' + invaderData.lives + ' | Level ' + invaderData.level, 10, 20);
    
    // Check win
    if (invaderData.enemies.every(function(e){return !e.alive;})) {
        invaderData.level++;
        invaderData.score += 100;
        spawnInvaderWave();
    }
    
    gameAnimation = requestAnimationFrame(invaderLoop);
}

// Shoot
document.addEventListener('click', function(e) {
    if (invaderData.player && gameActive) {
        invaderData.bullets.push({x:invaderData.player.x+25, y:invaderData.player.y});
    }
});

document.addEventListener('mousemove', function(e) {
    if (invaderData.player && gameCanvas) {
        var rect = gameCanvas.getBoundingClientRect();
        invaderData.player.x = e.clientX - rect.left - 25;
    }
});

document.addEventListener('touchmove', function(e) {
    if (invaderData.player && gameCanvas) {
        var rect = gameCanvas.getBoundingClientRect();
        invaderData.player.x = e.touches[0].clientX - rect.left - 25;
        invaderData.bullets.push({x:invaderData.player.x+25, y:invaderData.player.y});
        e.preventDefault();
    }
}, {passive: false});

console.log('✅ Premium Space Invaders loaded');
