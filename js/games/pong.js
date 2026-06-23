var pongData, pongAnimation, pongActive = false, pongParticles = [];

function startPong() {
    pongActive = true;
    pongParticles = [];
    
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<div style="text-align:center">' +
            '<h2 style="color:#D4AF37;margin-bottom:2px;font-size:24px">🏓 Pong</h2>' +
            '<div style="display:flex;justify-content:center;gap:30px;margin:8px 0">' +
                '<div style="text-align:center"><span style="font-size:10px;color:rgba(255,255,255,0.5)">YOU</span><br><b style="color:#D4AF37;font-size:22px" id="pScore">0</b></div>' +
                '<div style="text-align:center"><span style="font-size:10px;color:rgba(255,255,255,0.5)">AI</span><br><b style="color:#FF4757;font-size:22px" id="aScore">0</b></div>' +
            '</div>' +
            '<canvas id="pongCanvas" width="360" height="420" style="background:radial-gradient(ellipse at center,#1a1f4e 0%,#0A0E27 100%);border:2px solid rgba(212,175,55,0.3);border-radius:20px;display:block;margin:10px auto;max-width:95%;box-shadow:0 0 40px rgba(0,0,0,0.5)"></canvas>' +
            '<p style="color:rgba(255,255,255,0.4);font-size:10px;margin:5px 0">Move mouse or finger to control paddle</p>' +
            '<div style="display:flex;gap:8px;margin-top:8px">' +
                '<button class="btn-out" onclick="startPong()" style="flex:1">🔄 New Game</button>' +
                '<button class="btn-out" onclick="navigate(\'games\')" style="flex:1">← Games Hub</button>' +
            '</div>' +
        '</div>';
    
    setTimeout(function() { initPong(); }, 300);
}

function initPong() {
    var canvas = document.getElementById('pongCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    
    var ball = {x: canvas.width/2, y: canvas.height/2, dx: 5, dy: 5, r: 10};
    var player = {x: 15, y: canvas.height/2 - 55, w: 12, h: 110, score: 0};
    var ai = {x: canvas.width - 27, y: canvas.height/2 - 55, w: 12, h: 110, score: 0};
    var trail = [];
    
    if (pongAnimation) cancelAnimationFrame(pongAnimation);
    
    function draw() {
        if (!pongActive) return;
        
        // BG
        ctx.fillStyle = '#0A0E27';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Center line
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.setLineDash([8, 15]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(canvas.width/2, 0);
        ctx.lineTo(canvas.width/2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        
        // Center circle
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, 60, 0, Math.PI*2);
        ctx.stroke();
        
        // Ball trail
        trail.push({x: ball.x, y: ball.y, life: 10});
        trail = trail.filter(function(t) {
            t.life--;
            ctx.globalAlpha = t.life / 10;
            ctx.fillStyle = '#00D4FF';
            ctx.beginPath();
            ctx.arc(t.x, t.y, ball.r * (t.life/10), 0, Math.PI*2);
            ctx.fill();
            return t.life > 0;
        });
        ctx.globalAlpha = 1;
        
        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Wall bounce
        if (ball.y <= ball.r || ball.y >= canvas.height - ball.r) {
            ball.dy *= -1;
            spawnParticles(ball.x, ball.y, '#fff', 6);
        }
        
        // Player hit
        if (ball.x - ball.r <= player.x + player.w && ball.y >= player.y && ball.y <= player.y + player.h) {
            ball.dx = Math.abs(ball.dx) + 0.3;
            ball.x = player.x + player.w + ball.r;
            spawnParticles(ball.x, ball.y, '#D4AF37', 10);
        }
        
        // AI hit
        if (ball.x + ball.r >= ai.x && ball.y >= ai.y && ball.y <= ai.y + ai.h) {
            ball.dx = -Math.abs(ball.dx) - 0.3;
            ball.x = ai.x - ball.r;
            spawnParticles(ball.x, ball.y, '#FF4757', 10);
        }
        
        // Score
        if (ball.x < 0) { ai.score++; document.getElementById('aScore').textContent = ai.score; resetBall(ball, canvas); }
        if (ball.x > canvas.width) { player.score++; document.getElementById('pScore').textContent = player.score; resetBall(ball, canvas); }
        
        // Game over
        if (player.score >= 7) {
            pongActive = false;
            drawGameOver(ctx, canvas, true, player.score, ai.score);
            if (typeof addXP === 'function') addXP(35);
            return;
        }
        if (ai.score >= 7) {
            pongActive = false;
            drawGameOver(ctx, canvas, false, player.score, ai.score);
            return;
        }
        
        // AI move
        var aiCenter = ai.y + ai.h/2;
        if (ball.x > canvas.width/2) {
            ai.y += (ball.y - aiCenter) * 0.12;
        } else {
            ai.y += (canvas.height/2 - aiCenter) * 0.03;
        }
        if (ai.y < 0) ai.y = 0;
        if (ai.y + ai.h > canvas.height) ai.y = canvas.height - ai.h;
        
        // DRAW PADDLES
        drawPaddle(ctx, player.x, player.y, player.w, player.h, '#D4AF37', '#F5E6A3');
        drawPaddle(ctx, ai.x, ai.y, ai.w, ai.h, '#FF4757', '#FF6B81');
        
        // DRAW BALL
        var ballGlow = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.r*3);
        ballGlow.addColorStop(0, 'rgba(0,212,255,0.8)');
        ballGlow.addColorStop(1, 'rgba(0,212,255,0)');
        ctx.fillStyle = ballGlow;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r*3, 0, Math.PI*2);
        ctx.fill();
        
        var ballGrad = ctx.createRadialGradient(ball.x-2, ball.y-2, 0, ball.x, ball.y, ball.r);
        ballGrad.addColorStop(0, '#fff');
        ballGrad.addColorStop(1, '#00D4FF');
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
        ctx.fill();
        
        // Particles
        pongParticles = pongParticles.filter(function(p) {
            p.x += p.vx; p.y += p.vy; p.life--;
            ctx.globalAlpha = p.life / 15;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (p.life/15), 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
            return p.life > 0;
        });
        ctx.globalAlpha = 1;
        
        pongAnimation = requestAnimationFrame(draw);
    }
    
    function resetBall(b, c) { b.x = c.width/2; b.y = c.height/2; b.dx = (Math.random() > 0.5 ? 5 : -5); b.dy = (Math.random() - 0.5) * 6; }
    
    function drawPaddle(ctx, x, y, w, h, c1, c2) {
        var grad = ctx.createLinearGradient(x, y, x + w, y + h);
        grad.addColorStop(0, c1);
        grad.addColorStop(0.5, c2);
        grad.addColorStop(1, c1);
        ctx.fillStyle = grad;
        ctx.shadowColor = c1;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        var r = 6;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    function drawGameOver(ctx, canvas, win, ps, as) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = win ? '#2ED573' : '#FF4757';
        ctx.font = 'bold 26px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText(win ? '🎉 You Win!' : '😞 AI Wins!', canvas.width/2, canvas.height/2 - 15);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Poppins';
        ctx.fillText(ps + ' - ' + as, canvas.width/2, canvas.height/2 + 25);
        if (win) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 14px Poppins';
            ctx.fillText('+35 XP', canvas.width/2, canvas.height/2 + 50);
        }
    }
    
    function spawnParticles(x, y, color, count) {
        for (var i = 0; i < count; i++) {
            pongParticles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 15,
                size: Math.random() * 4 + 2,
                color: color
            });
        }
    }
    
    draw();
    
    // CONTROLS
    canvas.onmousemove = function(e) {
        var rect = canvas.getBoundingClientRect();
        player.y = e.clientY - rect.top - player.h/2;
        if (player.y < 0) player.y = 0;
        if (player.y + player.h > canvas.height) player.y = canvas.height - player.h;
    };
    
    canvas.ontouchmove = function(e) {
        var rect = canvas.getBoundingClientRect();
        player.y = e.touches[0].clientY - rect.top - player.h/2;
        if (player.y < 0) player.y = 0;
        if (player.y + player.h > canvas.height) player.y = canvas.height - player.h;
        e.preventDefault();
    };
                  }
