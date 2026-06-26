function startFlappy() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    c.innerHTML = `
        <div id="fbContainer" style="position:relative;width:100%;height:100%;min-height:500px;height:calc(100vh - 150px);overflow:hidden;background:linear-gradient(180deg,#0f0c24 0%,#1a1040 50%,#0a0618 100%);font-family:'Poppins',sans-serif;">
            <div style="position:absolute;top:15px;left:0;width:100%;display:flex;justify-content:space-between;padding:0 20px;z-index:10;pointer-events:none;">
                <div style="background:rgba(6,9,25,0.8);border:1px solid rgba(0,212,255,0.3);padding:8px 16px;border-radius:12px;backdrop-filter:blur(10px);"><span style="font-size:10px;color:rgba(255,255,255,0.5);">SCORE</span><span id="fbScore" style="color:#00D4FF;font-weight:900;font-size:18px;text-shadow:0 0 10px #00D4FF;">0</span></div>
                <div style="background:rgba(6,9,25,0.8);border:1px solid rgba(212,175,55,0.3);padding:8px 16px;border-radius:12px;backdrop-filter:blur(10px);"><span style="font-size:10px;color:rgba(255,255,255,0.5);">BEST</span><span id="fbBest" style="color:#D4AF37;font-weight:800;font-size:14px;">0</span></div>
            </div>
            <canvas id="fbCanvas" style="display:block;width:100%;height:100%;"></canvas>
            <button onclick="exitFlappy()" style="position:absolute;bottom:20px;right:20px;background:rgba(255,71,87,0.1);border:1px solid rgba(255,71,87,0.4);color:#ff4757;padding:8px 16px;border-radius:12px;font-size:11px;font-weight:700;cursor:pointer;z-index:10;">EXIT</button>
            <div id="fbScreen" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,rgba(10,14,39,0.9),rgba(19,24,66,0.8));border:1px solid rgba(0,212,255,0.3);backdrop-filter:blur(25px);padding:40px 30px;border-radius:24px;text-align:center;width:88%;max-width:340px;box-shadow:0 30px 70px rgba(0,0,0,0.8);z-index:20;">
                <div style="width:70px;height:70px;background:rgba(0,212,255,0.1);border:2px dashed #00D4FF;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:30px;">🐦</div>
                <h1 style="font-size:22px;font-weight:900;letter-spacing:3px;background:linear-gradient(135deg,#00D4FF,#D4AF37);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">FLAPPY BIRD</h1>
                <p style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:25px;">TAP TO FLY</p>
                <button id="fbBtn" style="background:linear-gradient(135deg,#00D4FF,#7C3AED);border:none;padding:14px 35px;font-size:13px;font-weight:800;color:#fff;border-radius:14px;cursor:pointer;width:100%;box-shadow:0 10px 25px rgba(0,212,255,0.4);">START FLIGHT</button>
            </div>
        </div>
    `;
    
    const canvas = document.getElementById('fbCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = document.getElementById('fbContainer').clientWidth;
    canvas.height = document.getElementById('fbContainer').clientHeight || (window.innerHeight - 150);
    
    let score = 0, best = parseInt(localStorage.getItem('flappyBest')||'0'), gameRunning = false, animId;
    const bird = { x: 80, y: canvas.height/2, r: 15, dy: 0 };
    const gravity = 0.5, jumpForce = -8;
    let pipes = [], frameCount = 0;
    
    document.getElementById('fbBest').textContent = best;
    document.getElementById('fbContainer').addEventListener('touchstart', fly);
    document.getElementById('fbContainer').addEventListener('mousedown', fly);
    window.addEventListener('keydown', function(e) { if (e.code === 'Space') { e.preventDefault(); fly(); } });
    
    function fly() { if (!gameRunning) return; bird.dy = jumpForce; }
    
    function update() {
        frameCount++;
        bird.dy += gravity; bird.y += bird.dy;
        
        if (frameCount % 90 === 0) {
            let gap = 150, pipeY = Math.random() * (canvas.height - gap - 100) + 50;
            pipes.push({ x: canvas.width + 50, y: pipeY, gap, scored: false });
        }
        
        for (let i = pipes.length-1; i >= 0; i--) {
            pipes[i].x -= 4;
            if (pipes[i].x + 50 < 0) { pipes.splice(i,1); continue; }
            if (!pipes[i].scored && pipes[i].x < bird.x) { score++; pipes[i].scored = true; document.getElementById('fbScore').textContent = score; }
            
            if (bird.x + bird.r > pipes[i].x && bird.x - bird.r < pipes[i].x + 50) {
                if (bird.y - bird.r < pipes[i].y || bird.y + bird.r > pipes[i].y + pipes[i].gap) gameOver();
            }
        }
        
        if (bird.y + bird.r > canvas.height || bird.y - bird.r < 0) gameOver();
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.shadowBlur = 20; ctx.shadowColor = '#00D4FF';
        ctx.fillStyle = '#00D4FF'; ctx.beginPath(); ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI*2); ctx.fill();
        
        pipes.forEach(p => {
            ctx.shadowBlur = 10; ctx.shadowColor = '#7C3AED'; ctx.fillStyle = '#7C3AED';
            ctx.fillRect(p.x, 0, 50, p.y);
            ctx.fillRect(p.x, p.y + p.gap, 50, canvas.height - p.y - p.gap);
        });
    }
    
    function loop() { if (!gameRunning) return; update(); draw(); animId = requestAnimationFrame(loop); }
    
    function gameOver() {
        gameRunning = false; cancelAnimationFrame(animId);
        if (score > best) { best = score; localStorage.setItem('flappyBest', best); }
        document.getElementById('fbScreen').style.display = 'block';
        document.getElementById('fbSub') ? null : document.getElementById('fbScreen').querySelector('p').innerHTML = 'GAME OVER<br><span style="color:#ff4757;">SCORE: ' + score + '</span>';
    }
    
    document.getElementById('fbBtn').onclick = function() {
        document.getElementById('fbScreen').style.display = 'none';
        bird.y = canvas.height/2; bird.dy = 0; score = 0; pipes = []; frameCount = 0;
        document.getElementById('fbScore').textContent = '0';
        gameRunning = true; loop();
    };
    
    window.fbCancelRef = () => { gameRunning = false; cancelAnimationFrame(animId); };
}

function exitFlappy() { if (typeof window.fbCancelRef === 'function') window.fbCancelRef(); if (typeof openGames === 'function') openGames(); }
