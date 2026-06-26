function startBrickBreaker() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    c.innerHTML = `
        <div id="bbContainer" style="position:relative;width:100%;height:100%;min-height:500px;height:calc(100vh - 150px);overflow:hidden;background:radial-gradient(circle at center,#0a0f1e 0%,#03050a 100%);font-family:'Poppins',sans-serif;">
            <div style="position:absolute;top:15px;left:0;width:100%;display:flex;justify-content:space-between;padding:0 20px;z-index:10;pointer-events:none;">
                <div class="glass-panel" style="padding:8px 16px;"><span style="font-size:10px;color:#888;">SCORE</span><span id="bbScore" style="color:#00D4FF;font-weight:900;">0</span></div>
                <div class="glass-panel" style="padding:8px 16px;"><span style="font-size:10px;color:#888;">LIVES</span><span id="bbLives" style="color:#ff4757;font-weight:900;">❤️❤️❤️</span></div>
            </div>
            <canvas id="bbCanvas" style="display:block;width:100%;height:100%;"></canvas>
            <button onclick="exitBrickBreaker()" style="position:absolute;bottom:20px;right:20px;background:rgba(255,71,87,0.1);border:1px solid rgba(255,71,87,0.4);color:#ff4757;padding:8px 16px;border-radius:12px;font-size:11px;cursor:pointer;z-index:10;">EXIT</button>
        </div>
    `;
    
    const canvas = document.getElementById('bbCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = document.getElementById('bbContainer').clientWidth;
    canvas.height = document.getElementById('bbContainer').clientHeight || (window.innerHeight - 150);
    
    let score = 0, lives = 3, gameRunning = true, animId;
    const paddle = { x: canvas.width/2 - 60, y: canvas.height - 40, w: 120, h: 12 };
    const ball = { x: canvas.width/2, y: canvas.height - 60, r: 8, dx: 4, dy: -4 };
    let bricks = [];
    
    const colors = ['#ff4757','#ff6b81','#ffa502','#2ed573','#00d4ff','#7c3aed','#ff70a6'];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 8; col++) {
            bricks.push({ x: col * (canvas.width/8) + 5, y: row * 30 + 50, w: canvas.width/8 - 10, h: 22, color: colors[row], alive: true });
        }
    }
    
    document.getElementById('bbContainer').addEventListener('mousemove', function(e) {
        paddle.x = e.clientX - this.getBoundingClientRect().left - paddle.w/2;
    });
    document.getElementById('bbContainer').addEventListener('touchmove', function(e) {
        paddle.x = e.touches[0].clientX - this.getBoundingClientRect().left - paddle.w/2;
    }, { passive: true });
    
    function update() {
        ball.x += ball.dx; ball.y += ball.dy;
        if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) ball.dx *= -1;
        if (ball.y - ball.r < 0) ball.dy *= -1;
        
        if (ball.y + ball.r > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
            ball.dy *= -1;
        }
        
        bricks.forEach(b => {
            if (b.alive && ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) {
                b.alive = false; ball.dy *= -1; score += 10;
                document.getElementById('bbScore').textContent = score;
            }
        });
        
        if (ball.y > canvas.height) {
            lives--;
            document.getElementById('bbLives').textContent = '❤️'.repeat(lives);
            if (lives <= 0) { gameRunning = false; cancelAnimationFrame(animId); alert('Game Over! Score: ' + score); }
            else { ball.x = canvas.width/2; ball.y = canvas.height - 60; ball.dx = 4; ball.dy = -4; }
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.shadowBlur = 15; ctx.shadowColor = '#00D4FF'; ctx.fillStyle = '#00D4FF';
        ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
        ctx.shadowColor = '#fff'; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();
        bricks.forEach(b => {
            if (b.alive) { ctx.shadowBlur = 5; ctx.shadowColor = b.color; ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.w, b.h); }
        });
    }
    
    function loop() { if (!gameRunning) return; update(); draw(); animId = requestAnimationFrame(loop); }
    loop();
    
    window.bbCancelRef = () => { gameRunning = false; cancelAnimationFrame(animId); };
}

function exitBrickBreaker() { if (typeof window.bbCancelRef === 'function') window.bbCancelRef(); if (typeof openGames === 'function') openGames(); }
