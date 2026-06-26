function startPong() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    c.innerHTML = `
        <div id="pgContainer" style="position:relative;width:100%;height:100%;min-height:500px;height:calc(100vh - 150px);overflow:hidden;background:radial-gradient(circle at center,#0a0f1e 0%,#03050a 100%);font-family:'Poppins',sans-serif;">
            <div style="position:absolute;top:15px;left:0;width:100%;display:flex;justify-content:space-between;padding:0 20px;z-index:10;pointer-events:none;">
                <div style="background:rgba(6,9,25,0.8);border:1px solid rgba(0,212,255,0.3);padding:8px 16px;border-radius:12px;backdrop-filter:blur(10px);box-shadow:0 0 15px rgba(0,212,255,0.2);">
                    <span style="font-size:10px;color:rgba(255,255,255,0.5);display:block;">SCORE</span>
                    <span id="pgScore" style="color:#00D4FF;font-weight:900;font-size:18px;text-shadow:0 0 10px #00D4FF;">0 - 0</span>
                </div>
                <div style="background:rgba(6,9,25,0.8);border:1px solid rgba(212,175,55,0.3);padding:8px 16px;border-radius:12px;backdrop-filter:blur(10px);">
                    <span style="font-size:10px;color:rgba(255,255,255,0.5);display:block;">SPEED</span>
                    <span id="pgSpeed" style="color:#D4AF37;font-weight:800;font-size:14px;">1.0x</span>
                </div>
            </div>
            <canvas id="pgCanvas" style="display:block;width:100%;height:100%;"></canvas>
            <button onclick="exitPong()" style="position:absolute;bottom:20px;right:20px;background:rgba(255,71,87,0.1);border:1px solid rgba(255,71,87,0.4);color:#ff4757;padding:8px 16px;border-radius:12px;font-size:11px;font-weight:700;cursor:pointer;z-index:10;backdrop-filter:blur(5px);">EXIT</button>
            <div id="pgScreen" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,rgba(10,14,39,0.9),rgba(19,24,66,0.8));border:1px solid rgba(0,212,255,0.3);backdrop-filter:blur(25px);padding:40px 30px;border-radius:24px;text-align:center;width:88%;max-width:340px;box-shadow:0 30px 70px rgba(0,0,0,0.8);z-index:20;">
                <div style="width:70px;height:70px;background:rgba(0,212,255,0.1);border:2px dashed #00D4FF;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:30px;animation:spin 10s linear infinite;">🏓</div>
                <h1 style="font-size:22px;font-weight:900;letter-spacing:3px;background:linear-gradient(135deg,#00D4FF,#D4AF37);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">NEON PONG</h1>
                <p id="pgSub" style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:25px;">DRAG TO MOVE PADDLE</p>
                <button id="pgBtn" style="background:linear-gradient(135deg,#00D4FF,#7C3AED);border:none;padding:14px 35px;font-size:13px;font-weight:800;color:#fff;border-radius:14px;cursor:pointer;text-transform:uppercase;width:100%;box-shadow:0 10px 25px rgba(0,212,255,0.4);">START MATCH</button>
            </div>
        </div>
        <style>@keyframes spin{100%{transform:rotate(360deg);}}</style>
    `;
    
    const canvas = document.getElementById('pgCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('pgContainer');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 150);
    
    let playerScore = 0, aiScore = 0, speed = 1, gameRunning = false, animId;
    
    const paddleH = 90, paddleW = 12;
    const player = { x: 20, y: canvas.height/2 - paddleH/2, targetY: canvas.height/2 - paddleH/2 };
    const ai = { x: canvas.width - 32, y: canvas.height/2 - paddleH/2 };
    const ball = { x: canvas.width/2, y: canvas.height/2, r: 8, dx: 5, dy: 3 };
    
    function updateControls(e) {
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        player.targetY = clientY - container.getBoundingClientRect().top - paddleH/2;
    }
    container.addEventListener('mousemove', updateControls);
    container.addEventListener('touchmove', updateControls, { passive: true });
    
    function reset() { ball.x = canvas.width/2; ball.y = canvas.height/2; ball.dx = (Math.random()>0.5?5:-5)*speed; ball.dy = (Math.random()*6-3)*speed; }
    
    function update() {
        player.y += (player.targetY - player.y) * 0.2;
        if (player.y < 0) player.y = 0;
        if (player.y > canvas.height - paddleH) player.y = canvas.height - paddleH;
        
        ai.y += (ball.y - (ai.y + paddleH/2)) * 0.05;
        
        ball.x += ball.dx; ball.y += ball.dy;
        if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) ball.dy *= -1;
        
        if (ball.x - ball.r < player.x + paddleW && ball.y > player.y && ball.y < player.y + paddleH) {
            ball.dx *= -1.1; speed += 0.1;
        }
        if (ball.x + ball.r > ai.x && ball.y > ai.y && ball.y < ai.y + paddleH) {
            ball.dx *= -1.1; speed += 0.1;
        }
        
        if (ball.x < 0) { aiScore++; reset(); }
        if (ball.x > canvas.width) { playerScore++; reset(); }
        
        document.getElementById('pgScore').textContent = playerScore + ' - ' + aiScore;
        document.getElementById('pgSpeed').textContent = speed.toFixed(1) + 'x';
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(0,212,255,0.2)'; ctx.lineWidth = 1;
        for (let i=0; i<canvas.height; i+=40) { ctx.beginPath(); ctx.moveTo(canvas.width/2, i); ctx.lineTo(canvas.width/2, i+20); ctx.stroke(); }
        
        ctx.shadowBlur = 20; ctx.shadowColor = '#00D4FF'; ctx.fillStyle = '#00D4FF';
        ctx.fillRect(player.x, player.y, paddleW, paddleH);
        
        ctx.shadowColor = '#ff4757'; ctx.fillStyle = '#ff4757';
        ctx.fillRect(ai.x, ai.y, paddleW, paddleH);
        
        ctx.shadowColor = '#fff'; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();
    }
    
    function loop() { if (!gameRunning) return; update(); draw(); animId = requestAnimationFrame(loop); }
    
    document.getElementById('pgBtn').onclick = function() {
        document.getElementById('pgScreen').style.display = 'none';
        reset(); gameRunning = true; loop();
    };
    
    window.pgCancelRef = () => { gameRunning = false; cancelAnimationFrame(animId); };
}

function exitPong() { if (typeof window.pgCancelRef === 'function') window.pgCancelRef(); if (typeof openGames === 'function') openGames(); }
