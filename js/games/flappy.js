var flappyData, flappyAnimation, flappyActive = false;

function startFlappy() {
    flappyActive = true;
    
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<div style="text-align:center">' +
            '<h2 style="color:#D4AF37;margin-bottom:2px;font-size:24px">🐦 Flappy Bird</h2>' +
            '<div style="display:flex;justify-content:center;gap:25px;margin:8px 0">' +
                '<div style="text-align:center"><span style="font-size:10px;color:rgba(255,255,255,0.5)">SCORE</span><br><b style="color:#D4AF37;font-size:20px" id="flScore">0</b></div>' +
                '<div style="text-align:center"><span style="font-size:10px;color:rgba(255,255,255,0.5)">BEST</span><br><b style="color:#2ED573;font-size:20px" id="flBest">' + (parseInt(localStorage.getItem('flappyBest')||'0')) + '</b></div>' +
            '</div>' +
            '<canvas id="flappyCanvas" width="340" height="440" style="border:2px solid rgba(212,175,55,0.3);border-radius:20px;display:block;margin:10px auto;max-width:95%;box-shadow:0 0 40px rgba(0,0,0,0.5)"></canvas>' +
            '<p style="color:rgba(255,255,255,0.5);font-size:11px;margin:5px 0">Tap or press Space to fly! 🐦</p>' +
            '<div style="display:flex;gap:8px;margin-top:8px">' +
                '<button class="btn-out" onclick="startFlappy()" style="flex:1">🔄 New Game</button>' +
                '<button class="btn-out" onclick="navigate(\'games\')" style="flex:1">← Games Hub</button>' +
            '</div>' +
        '</div>';
    
    setTimeout(function() { initFlappy(); }, 300);
}

function initFlappy() {
    var canvas = document.getElementById('flappyCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    
    var bird = {x: 100, y: canvas.height/2, vy: 0, r: 17};
    var pipes = [];
    var score = 0;
    var bestScore = parseInt(localStorage.getItem('flappyBest') || '0');
    var frame = 0;
    var gameSpeed = 1.8;
    var groundOffset = 0;
    var clouds = [];
    var particles = [];
    var stars = [];
    var buildings = [];
    
    // Background elements
    for (var i = 0; i < 30; i++) {
        stars.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height*0.6, size: Math.random()*1.5+0.5, twinkle: Math.random()*Math.PI*2});
    }
    for (var i = 0; i < 6; i++) {
        clouds.push({x: Math.random()*canvas.width, y: Math.random()*canvas.height*0.4, w: Math.random()*80+50, h: Math.random()*30+18, speed: Math.random()*0.3+0.1});
    }
    for (var i = 0; i < 8; i++) {
        buildings.push({x: i*50, w: Math.random()*30+25, h: Math.random()*60+40});
    }
    
    if (flappyAnimation) cancelAnimationFrame(flappyAnimation);
    
    function draw() {
        if (!flappyActive) return;
        frame++;
        groundOffset = (groundOffset + gameSpeed) % 30;
        
        // SKY GRADIENT
        var sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
        sky.addColorStop(0, '#0a1a3a');
        sky.addColorStop(0.3, '#1a3a5c');
        sky.addColorStop(0.6, '#2d5a87');
        sky.addColorStop(1, '#4a90d9');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // STARS
        stars.forEach(function(s) {
            s.twinkle += 0.02;
            var alpha = Math.sin(s.twinkle) * 0.3 + 0.5;
            ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = s.size * 2;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        
        // MOON
        ctx.fillStyle = '#FFF8DC';
        ctx.shadowColor = '#FFF8DC';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(canvas.width - 50, 50, 30, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#0a1a3a';
        ctx.beginPath();
        ctx.arc(canvas.width - 40, 42, 25, 0, Math.PI*2);
        ctx.fill();
        
        // BUILDINGS
        buildings.forEach(function(b) {
            b.x -= gameSpeed * 0.3;
            if (b.x < -b.w) b.x = canvas.width + b.w;
            var grad = ctx.createLinearGradient(0, canvas.height-50-b.h, 0, canvas.height-50);
            grad.addColorStop(0, '#1a1040');
            grad.addColorStop(1, '#0d0820');
            ctx.fillStyle = grad;
            ctx.fillRect(b.x, canvas.height-50-b.h, b.w, b.h);
            // Windows
            ctx.fillStyle = 'rgba(255,215,0,0.3)';
            for (var wy = canvas.height-50-b.h+5; wy < canvas.height-55; wy += 12) {
                for (var wx = b.x+5; wx < b.x+b.w-5; wx += 10) {
                    if (Math.random() < 0.4) ctx.fillRect(wx, wy, 4, 6);
                }
            }
        });
        
        // CLOUDS
        clouds.forEach(function(c) {
            c.x -= c.speed;
            if (c.x < -c.w) c.x = canvas.width + c.w;
            
            // Cloud shadow
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.beginPath();
            ctx.arc(c.x+2, c.y+2, c.w*0.5, 0, Math.PI*2);
            ctx.fill();
            
            // Main cloud
            var cg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.w*0.5);
            cg.addColorStop(0, 'rgba(255,255,255,0.4)');
            cg.addColorStop(0.7, 'rgba(255,255,255,0.15)');
            cg.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = cg;
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.w*0.5, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(c.x+c.w*0.25, c.y-c.h*0.2, c.w*0.35, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(c.x-c.w*0.15, c.y+c.h*0.1, c.w*0.3, 0, Math.PI*2);
            ctx.fill();
        });
        
        // BIRD PHYSICS
        bird.vy += 0.5;
        bird.y += bird.vy;
        
        // PIPE SPAWN
        if (frame % 90 === 0) {
            var gap = 150;
            var pipeY = Math.random() * (canvas.height - gap - 160) + 80;
            pipes.push({x: canvas.width, y: pipeY, gap: gap, scored: false});
        }
        
        pipes.forEach(function(p) { p.x -= gameSpeed; });
        pipes = pipes.filter(function(p) { return p.x > -60; });
        
        // DRAW PIPES WITH TEXTURE
        pipes.forEach(function(p) {
            // Pipe shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(p.x+3, 0, 50, p.y);
            ctx.fillRect(p.x+3, p.y+p.gap, 50, canvas.height);
            
            // Main pipe
            var pg = ctx.createLinearGradient(p.x, 0, p.x+50, 0);
            pg.addColorStop(0, '#1a8a3a');
            pg.addColorStop(0.3, '#2ED573');
            pg.addColorStop(0.5, '#7bed9f');
            pg.addColorStop(0.7, '#2ED573');
            pg.addColorStop(1, '#1a8a3a');
            ctx.fillStyle = pg;
            ctx.fillRect(p.x, 0, 50, p.y);
            ctx.fillRect(p.x, p.y+p.gap, 50, canvas.height);
            
            // Pipe cap
            var cg = ctx.createLinearGradient(p.x-4, 0, p.x+54, 0);
            cg.addColorStop(0, '#1a7a30');
            cg.addColorStop(0.5, '#2ED573');
            cg.addColorStop(1, '#1a7a30');
            ctx.fillStyle = cg;
            ctx.fillRect(p.x-4, p.y-24, 58, 24);
            ctx.fillRect(p.x-4, p.y+p.gap, 58, 24);
            
            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(p.x+4, 0, 8, p.y);
            ctx.fillRect(p.x+4, p.y+p.gap, 8, canvas.height);
            
            // Score
            if (!p.scored && p.x + 50 < bird.x) {
                p.scored = true;
                score++;
                document.getElementById('flScore').textContent = score;
                // Score particles
                for (var i = 0; i < 10; i++) {
                    particles.push({
                        x: bird.x, y: bird.y,
                        vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4-3,
                        life: 18, color: '#FFD700', size: Math.random()*4+3
                    });
                }
            }
        });
        
        // COLLISION
        if (bird.y - bird.r < 0 || bird.y + bird.r > canvas.height - 50) {
            gameOver(); return;
        }
        pipes.forEach(function(p) {
            if (bird.x + bird.r > p.x && bird.x - bird.r < p.x + 50) {
                if (bird.y - bird.r < p.y || bird.y + bird.r > p.y + p.gap) { gameOver(); }
            }
        });
        
        // DRAW BIRD WITH DETAIL
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(Math.min(Math.max(bird.vy * 0.06, -0.5), 1.2));
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.arc(2, 2, bird.r, 0, Math.PI*2);
        ctx.fill();
        
        // Body
        var bodyGrad = ctx.createLinearGradient(0, -bird.r, 0, bird.r);
        bodyGrad.addColorStop(0, '#FFE44D');
        bodyGrad.addColorStop(0.4, '#FFD700');
        bodyGrad.addColorStop(0.7, '#FFA500');
        bodyGrad.addColorStop(1, '#FF8C00');
        ctx.fillStyle = bodyGrad;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, bird.r, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Belly
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.arc(0, 3, bird.r*0.7, 0, Math.PI*2);
        ctx.fill();
        
        // Wing
        var wingGrad = ctx.createLinearGradient(-10, -8, 5, 5);
        wingGrad.addColorStop(0, '#FFC107');
        wingGrad.addColorStop(1, '#FF8C00');
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.ellipse(-5, -5, 12, 8, -0.3, 0, Math.PI*2);
        ctx.fill();
        
        // Wing detail
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, -5);
        ctx.quadraticCurveTo(-2, -10, 4, -5);
        ctx.stroke();
        
        // Eye white
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(8, -4, 7, 0, Math.PI*2);
        ctx.fill();
        
        // Eye black
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(10, -4, 3.5, 0, Math.PI*2);
        ctx.fill();
        
        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(11, -5, 1.5, 0, Math.PI*2);
        ctx.fill();
        
        // Beak top
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(24, -3);
        ctx.lineTo(15, -5);
        ctx.fill();
        
        // Beak bottom
        ctx.fillStyle = '#E64A19';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(22, 2);
        ctx.lineTo(15, -1);
        ctx.fill();
        
        // Head feather
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.moveTo(-5, -14);
        ctx.quadraticCurveTo(2, -22, 8, -16);
        ctx.quadraticCurveTo(2, -18, -5, -14);
        ctx.fill();
        
        ctx.restore();
        
        // GROUND WITH TEXTURE
        var gg = ctx.createLinearGradient(0, canvas.height-50, 0, canvas.height);
        gg.addColorStop(0, '#8B5E3C');
        gg.addColorStop(0.3, '#7A5230');
        gg.addColorStop(0.6, '#6B4520');
        gg.addColorStop(1, '#5D3A1A');
        ctx.fillStyle = gg;
        ctx.fillRect(0, canvas.height-50, canvas.width, 50);
        
        // Grass
        ctx.fillStyle = '#2ED573';
        for (var i = groundOffset; i < canvas.width; i += 25) {
            ctx.beginPath();
            ctx.moveTo(i, canvas.height-50);
            ctx.lineTo(i+3, canvas.height-58);
            ctx.lineTo(i+8, canvas.height-50);
            ctx.fill();
        }
        
        // Ground line
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height-50);
        ctx.lineTo(canvas.width, canvas.height-50);
        ctx.stroke();
        
        // PARTICLES
        particles = particles.filter(function(p) {
            p.x += p.vx; p.y += p.vy; p.life--;
            ctx.globalAlpha = p.life / 18;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size*(p.life/18), 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
            return p.life > 0;
        });
        ctx.globalAlpha = 1;
        
        flappyAnimation = requestAnimationFrame(draw);
    }
    
    function gameOver() {
        flappyActive = false;
        if (score > bestScore) { bestScore = score; localStorage.setItem('flappyBest', bestScore); document.getElementById('flBest').textContent = bestScore; }
        
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Game Over panel
        ctx.fillStyle = 'rgba(19,24,66,0.9)';
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2;
        var px = canvas.width/2-100, py = canvas.height/2-60;
        ctx.beginPath();
        ctx.roundRect(px, py, 200, 120, 15);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#FF4757';
        ctx.font = 'bold 24px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, py+35);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Poppins';
        ctx.fillText('Score: ' + score, canvas.width/2, py+60);
        ctx.fillStyle = '#2ED573';
        ctx.font = 'bold 13px Poppins';
        ctx.fillText('Best: ' + bestScore, canvas.width/2, py+82);
        
        if (score === bestScore && score > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 12px Poppins';
            ctx.fillText('🏆 NEW HIGH SCORE!', canvas.width/2, py+100);
        }
        
        if (typeof addXP === 'function') addXP(Math.floor(score * 3));
    }
    
    draw();
    
    function flap() { if (flappyActive && bird) bird.vy = -7.5; }
    canvas.onclick = flap;
    document.onkeydown = function(e) { if (e.key === ' ' || e.key === 'ArrowUp') { flap(); e.preventDefault(); } };
    canvas.ontouchstart = function(e) { flap(); e.preventDefault(); };
            }
