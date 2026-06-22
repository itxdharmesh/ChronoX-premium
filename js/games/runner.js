// ==================== PREMIUM INFINITE RUNNER ====================
var runnerData = {};

function startRunnerPremium() {
    openFullPageGame('🏃 Runner');
    gameCanvas.style.display = 'block';
    
    runnerData = {
        canvas: gameCanvas, ctx: gameCtx,
        player: {x:70, y:0, w:35, h:55, vy:0, jumping:false, doubleJump:false},
        ground: 0, obstacles: [], coins: [],
        bgLayers: [{speed:1, offset:0},{speed:2, offset:0},{speed:4, offset:0}],
        score: 0, speed: 6, frame: 0,
        particles: []
    };
    runnerData.player.y = gameCanvas.height - 100;
    runnerData.ground = gameCanvas.height - 45;
    
    gameAnimation = requestAnimationFrame(runnerLoop);
    currentGameRestart = startRunnerPremium;
}

function runnerLoop() {
    if (!gameActive) return;
    
    var c = runnerData.canvas, ctx = runnerData.ctx;
    var p = runnerData.player, g = runnerData.ground;
    runnerData.frame++;
    
    // Background gradient
    var skyGrad = ctx.createLinearGradient(0,0,0,c.height);
    skyGrad.addColorStop(0, '#1a1a3e');
    skyGrad.addColorStop(0.5, '#2d1b69');
    skyGrad.addColorStop(1, '#0A0E27');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0,0,c.width,c.height);
    
    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (var i=0;i<30;i++) {
        var sx = (i*73 + runnerData.frame) % c.width;
        var sy = (i*47) % (g-50);
        ctx.fillRect(sx, sy, 2, 2);
    }
    
    // Mountains
    ctx.fillStyle = '#1a1040';
    ctx.beginPath();
    ctx.moveTo(0,g);
    for (var x=0;x<c.width;x+=2) {
        var my = g - 60 - Math.sin(x*0.008)*40 - Math.sin(x*0.02)*30;
        ctx.lineTo(x, my);
    }
    ctx.lineTo(c.width,g);
    ctx.fill();
    
    // Ground
    var gGrad = ctx.createLinearGradient(0,g,0,g+45);
    gGrad.addColorStop(0, '#2d1b69');
    gGrad.addColorStop(0.3, '#1a1040');
    gGrad.addColorStop(1, '#0A0E27');
    ctx.fillStyle = gGrad;
    ctx.fillRect(0,g,c.width,45);
    
    // Ground line
    ctx.strokeStyle = 'rgba(212,175,55,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0,g);
    ctx.lineTo(c.width,g);
    ctx.stroke();
    
    // Player physics
    if (p.jumping) {
        p.vy += 0.8;
        p.y += p.vy;
        if (p.y >= g - p.h) {
            p.y = g - p.h;
            p.jumping = false;
            p.doubleJump = false;
            p.vy = 0;
            spawnRunnerParticles(p.x+p.w/2, p.y+p.h, 5);
        }
    }
    
    // Spawn obstacles
    if (runnerData.frame % 70 === 0) {
        runnerData.obstacles.push({x:c.width, y:g-35, w:25, h:35, type:'spike'});
    }
    if (runnerData.frame % 120 === 0) {
        runnerData.obstacles.push({x:c.width, y:g-50, w:30, h:50, type:'block'});
    }
    if (runnerData.frame % 150 === 0) {
        runnerData.coins.push({x:c.width, y:g-90, r:10, collected:false});
    }
    
    // Move obstacles
    runnerData.obstacles.forEach(function(o) { o.x -= runnerData.speed; });
    runnerData.obstacles = runnerData.obstacles.filter(function(o) { return o.x > -50; });
    
    // Move coins
    runnerData.coins.forEach(function(c) { c.x -= runnerData.speed; });
    runnerData.coins = runnerData.coins.filter(function(c) { return c.x > -20; });
    
    // Draw obstacles
    runnerData.obstacles.forEach(function(o) {
        if (o.type === 'spike') {
            ctx.fillStyle = '#FF4757';
            ctx.beginPath();
            ctx.moveTo(o.x, o.y+o.h);
            ctx.lineTo(o.x+o.w/2, o.y);
            ctx.lineTo(o.x+o.w, o.y+o.h);
            ctx.closePath();
            ctx.fill();
            ctx.shadowColor = '#FF4757';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        } else {
            var bGrad = ctx.createLinearGradient(o.x, o.y, o.x+o.w, o.y);
            bGrad.addColorStop(0, '#FF4757');
            bGrad.addColorStop(1, '#c0392b');
            ctx.fillStyle = bGrad;
            ctx.fillRect(o.x, o.y, o.w, o.h);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(o.x, o.y, o.w, 5);
        }
    });
    
    // Draw coins
    runnerData.coins.forEach(function(c) {
        if (!c.collected) {
            var pulse = Math.sin(runnerData.frame*0.1)*0.2+0.8;
            ctx.fillStyle = '#FFD700';
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r*pulse, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#D4AF37';
            ctx.beginPath();
            ctx.arc(c.x-2, c.y-2, c.r*0.3, 0, Math.PI*2);
            ctx.fill();
        }
    });
    
    // Collision detection
    runnerData.obstacles.forEach(function(o) {
        if (p.x+p.w > o.x && p.x < o.x+o.w && p.y+p.h > o.y) {
            gameOver('🏃 Score: ' + Math.floor(runnerData.score));
        }
    });
    
    runnerData.coins.forEach(function(c) {
        if (!c.collected && Math.abs(p.x+p.w/2 - c.x) < 25 && Math.abs(p.y+p.h/2 - c.y) < 25) {
            c.collected = true;
            runnerData.score += 50;
            updateScore(Math.floor(runnerData.score));
            spawnRunnerParticles(c.x, c.y, 15);
        }
    });
    
    // Draw player
    var pGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y+p.h);
    pGrad.addColorStop(0, '#D4AF37');
    pGrad.addColorStop(1, '#8B6914');
    ctx.fillStyle = pGrad;
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 12;
    
    // Body
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Head
    ctx.fillStyle = '#F5E6A3';
    ctx.beginPath();
    ctx.arc(p.x+p.w/2, p.y+10, 12, 0, Math.PI*2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(p.x+p.w/2+4, p.y+7, 2.5, 0, Math.PI*2);
    ctx.fill();
    
    // Particles
    runnerData.particles = runnerData.particles.filter(function(pt) {
        pt.x += pt.vx; pt.y += pt.vy; pt.life--;
        ctx.globalAlpha = pt.life/20;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size*(pt.life/20), 0, Math.PI*2);
        ctx.fill();
        return pt.life > 0;
    });
    ctx.globalAlpha = 1;
    
    // Score
    runnerData.score += 0.3;
    updateScore(Math.floor(runnerData.score));
    if (runnerData.frame % 200 === 0) runnerData.speed += 0.3;
    
    gameAnimation = requestAnimationFrame(runnerLoop);
}

function spawnRunnerParticles(x, y, count) {
    for (var i=0;i<count;i++) {
        runnerData.particles.push({
            x:x, y:y,
            vx:(Math.random()-0.5)*4, vy:(Math.random()-0.5)*4-2,
            life:20, size:Math.random()*3+1,
            color:Math.random()<0.5?'#D4AF37':'#F5E6A3'
        });
    }
}

// Controls
document.addEventListener('click', function(e) {
    var p = runnerData.player;
    if (!p) return;
    if (!p.jumping) { p.jumping=true; p.vy=-14; }
    else if (!p.doubleJump) { p.doubleJump=true; p.vy=-10; }
});

document.addEventListener('keydown', function(e) {
    var p = runnerData.player;
    if (!p) return;
    if (e.key===' '||e.key==='ArrowUp') {
        if (!p.jumping) { p.jumping=true; p.vy=-14; }
        else if (!p.doubleJump) { p.doubleJump=true; p.vy=-10; }
        e.preventDefault();
    }
});

// RoundRect polyfill
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r) {
        if (typeof r === 'number') r = {tl:r,tr:r,br:r,bl:r};
        this.beginPath();
        this.moveTo(x+r.tl,y);
        this.lineTo(x+w-r.tr,y);
        this.quadraticCurveTo(x+w,y,x+w,y+r.tr);
        this.lineTo(x+w,y+h-r.br);
        this.quadraticCurveTo(x+w,y+h,x+w-r.br,y+h);
        this.lineTo(x+r.bl,y+h);
        this.quadraticCurveTo(x,y+h,x,y+h-r.bl);
        this.lineTo(x,y+r.tl);
        this.quadraticCurveTo(x,y,x+r.tl,y);
        this.closePath();
    };
}

console.log('✅ Premium Runner loaded');
