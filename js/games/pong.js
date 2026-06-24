// js/games/pong.js

function startPongGame() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div id="pongContainer" style="position:relative; width:100%; height:100%; min-height: calc(100vh - 90px); background:#020108; font-family:'Poppins', sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px; box-sizing:border-box; user-select:none; -webkit-user-select:none;">
            
            <div style="width:100%; max-width:500px; display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; background:rgba(255,255,255,0.02); padding:10px 25px; border-radius:16px; border:1px solid rgba(255,255,255,0.05); box-sizing:border-box;">
                <div style="text-align:center;">
                    <span style="font-size:10px; color:#00f5d4; font-weight:800; letter-spacing:1px; display:block;">PLAYER</span>
                    <span id="playerScore" style="font-size:32px; font-weight:900; color:#fff; text-shadow:0 0 15px #00f5d4;">0</span>
                </div>
                <div id="aiTierHUD" style="font-size:11px; color:#fff; background:rgba(123,44,191,0.2); border:1px solid #7b2cbf; padding:4px 14px; border-radius:20px; font-weight:700; letter-spacing:1px;">AI: MEDIUM</div>
                <div style="text-align:center;">
                    <span style="font-size:10px; color:#ff006e; font-weight:800; letter-spacing:1px; display:block;">AI MATRIX</span>
                    <span id="aiScore" style="font-size:32px; font-weight:900; color:#fff; text-shadow:0 0 15px #ff006e;">0</span>
                </div>
            </div>

            <div style="position:relative; background:#050212; border:2px solid rgba(123,44,191,0.3); border-radius:16px; box-shadow:0 25px 60px rgba(0,0,0,0.85); overflow:hidden; width:100%; max-width:540px;">
                <canvas id="pongCanvas" width="540" height="320" style="display:block; width:100%; height:auto; box-sizing:border-box; background:#04020f;"></canvas>
                
                <div id="pongScreen" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(4,2,15,0.96); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; box-sizing:border-box;">
                    <div style="font-size:45px; margin-bottom:5px; filter:drop-shadow(0 0 12px #ff006e);">🏓</div>
                    <h2 id="pongTitle" style="color:#fff; font-size:24px; font-weight:900; letter-spacing:3px; margin:0 0 5px 0;">CYBER PONG</h2>
                    <p id="pongSub" style="color:rgba(255,255,255,0.5); font-size:11px; margin:0 0 25px 0; max-width:280px;">MOVE MOUSE OR SLIDE ON CANVAS TO DEFEND MATRIX FIELD</p>
                    
                    <div style="display:flex; gap:10px; margin-bottom:25px; width:100%; max-width:280px;">
                        <button class="diff-btn" data-diff="easy" style="flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:8px; border-radius:10px; font-size:11px; font-weight:700; cursor:pointer; transition:0.2s;">EASY</button>
                        <button class="diff-btn active-diff" data-diff="medium" style="flex:1; background:rgba(0,245,212,0.15); border:1px solid #00f5d4; color:#00f5d4; padding:8px; border-radius:10px; font-size:11px; font-weight:700; cursor:pointer; transition:0.2s;">MEDIUM</button>
                        <button class="diff-btn" data-diff="hard" style="flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); color:#fff; padding:8px; border-radius:10px; font-size:11px; font-weight:700; cursor:pointer; transition:0.2s;">HARD</button>
                    </div>

                    <button id="pongBtn" style="background:linear-gradient(135deg, #00f5d4, #ff006e); border:none; color:#000; font-weight:900; font-size:13px; padding:12px 40px; border-radius:12px; cursor:pointer; letter-spacing:2px; text-transform:uppercase; box-shadow:0 0 20px rgba(0,245,212,0.35);">BOOT CONSOLE</button>
                </div>
            </div>

            <button onclick="exitPongGame()" style="margin-top:20px; background:transparent; border:1px solid rgba(255,0,110,0.3); color:#ff006e; padding:8px 22px; border-radius:11px; font-size:12px; font-weight:700; cursor:pointer;">TERMINATE SYSTEM</button>
        </div>
        
        <style>
            .active-diff { background: rgba(0,245,212,0.2) !important; border-color:#00f5d4 !important; color:#00f5d4 !important; font-weight:900 !important; }
            .diff-btn:hover { background: rgba(255,255,255,0.08); }
        </style>
    `;

    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('pongContainer');
    const pongScreen = document.getElementById('pongScreen');
    const pongTitle = document.getElementById('pongTitle');
    const pongSub = document.getElementById('pongSub');
    const pongBtn = document.getElementById('pongBtn');
    const pScoreHUD = document.getElementById('playerScore');
    const aScoreHUD = document.getElementById('aiScore');
    const aiTierHUD = document.getElementById('aiTierHUD');

    const pWidth = 12, pHeight = 70;
    let pScore = 0, aScore = 0;
    let gameRunning = false, animId = null;
    let currentDifficulty = 'medium';
    let aiSpeeds = { easy: 2.5, medium: 4.2, hard: 5.8 };

    const player = { x: 15, y: canvas.height/2 - pHeight/2 };
    const ai = { x: canvas.width - 27, y: canvas.height/2 - pHeight/2 };
    const ball = { x: canvas.width/2, y: canvas.height/2, r: 7, speed: 5, dx: 5, dy: 3 };

    // Setup Interactive Difficulty Selectors
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.onclick = (e) => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active-diff'));
            e.target.classList.add('active-diff');
            currentDifficulty = e.target.getAttribute('data-diff');
            aiTierHUD.innerText = `AI: ${currentDifficulty.toUpperCase()}`;
        };
    });

    function trackMove(e) {
        let rect = canvas.getBoundingClientRect();
        let clientY = e.clientY || (e.touches && e.touches[0].clientY) || canvas.height/2;
        // Proper scale normalization depending on CSS resize adjustments
        let relativeY = (clientY - rect.top) * (canvas.height / rect.height);
        player.y = Math.max(5, Math.min(canvas.height - pHeight - 5, relativeY - pHeight/2));
    }

    container.addEventListener('mousemove', trackMove);
    container.addEventListener('touchmove', trackMove, { passive: true });

    function resetBall() {
        ball.x = canvas.width / 2; ball.y = canvas.height / 2;
        ball.speed = currentDifficulty === 'hard' ? 7 : 5;
        ball.dx = -ball.dx; ball.dy = (Math.random() - 0.5) * 5;
    }

    function update() {
        ball.x += ball.dx; ball.y += ball.dy;

        // Smart Tracking AI Interpolation
        let aiTarget = ai.y + pHeight/2;
        let speedModifier = aiSpeeds[currentDifficulty];
        if (aiTarget < ball.y - 10) ai.y += speedModifier;
        else if (aiTarget > ball.y + 10) ai.y -= speedModifier;
        ai.y = Math.max(5, Math.min(canvas.height - pHeight - 5, ai.y));

        // Upper & Lower Floor Rebound Collisions
        if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) ball.dy = -ball.dy;

        // Paddle Collision Triggers (Left Player)
        if (ball.dx < 0 && ball.x - ball.r < player.x + pWidth && ball.y > player.y && ball.y < player.y + pHeight) {
            let norm = (ball.y - (player.y + pHeight/2)) / (pHeight/2);
            ball.speed += 0.5; ball.dx = Math.cos(norm * 0.7) * ball.speed; ball.dy = Math.sin(norm * 0.7) * ball.speed;
        }

        // Paddle Collision Triggers (Right AI)
        if (ball.dx > 0 && ball.x + ball.r > ai.x && ball.y > ai.y && ball.y < ai.y + pHeight) {
            let norm = (ball.y - (ai.y + pHeight/2)) / (pHeight/2);
            ball.speed += 0.5; ball.dx = -Math.cos(norm * 0.7) * ball.speed; ball.dy = Math.sin(norm * 0.7) * ball.speed;
        }

        // Score Distribution Validation
        if (ball.x < 0) {
            aScore++; aScoreHUD.innerText = aScore;
            if (aScore >= 5) handleGameOver(false); else resetBall();
        } else if (ball.x > canvas.width) {
            pScore++; pScoreHUD.innerText = pScore;
            if (pScore >= 5) handleGameOver(true); else resetBall();
        }
    }

    function draw() {
        ctx.fillStyle = '#04020f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Neon Matrix Center Separator Net
        ctx.strokeStyle = "rgba(123, 44, 191, 0.15)"; ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height); ctx.stroke(); ctx.setLineDash([]);

        // Player Paddle Node
        ctx.fillStyle = '#00f5d4'; ctx.shadowBlur = 15; ctx.shadowColor = '#00f5d4';
        ctx.fillRect(player.x, player.y, pWidth, pHeight);

        // AI Paddle Node
        ctx.fillStyle = '#ff006e'; ctx.shadowBlur = 15; ctx.shadowColor = '#ff006e';
        ctx.fillRect(ai.x, ai.y, pWidth, pHeight);

        // Plasma Ball Core Ball
        ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 12; ctx.shadowColor = '#fff';
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0; // cleanup
    }

    function loop() {
        if (!gameRunning) return;
        update(); draw();
        animId = requestAnimationFrame(loop);
    }

    function boot() {
        pongScreen.style.display = 'none';
        pScore = 0; aScore = 0;
        pScoreHUD.innerText = "0"; aScoreHUD.innerText = "0";
        player.y = canvas.height/2 - pHeight/2; ai.y = canvas.height/2 - pHeight/2;
        resetBall();
        gameRunning = true;
        loop();
    }

    function handleGameOver(userWon) {
        gameRunning = false; cancelAnimationFrame(animId);
        pongScreen.style.display = 'flex';
        pongTitle.innerText = userWon ? "VICTORY ATTAINED" : "AI CORE OVERLOAD";
        pongSub.innerHTML = userWon ? 
            `<span style="color:#00f5d4; font-size:16px; font-weight:800;">YOU WIN THE MATCH!</span>` : 
            `<span style="color:#ff006e; font-size:16px; font-weight:800;">AI DEFEATED YOU.</span>`;
        pongBtn.innerText = "REBOOT MATRIX";

        // Global Game Over Hook for games-main.js Interceptor
        if (typeof window.handleGameOver === 'function') {
            window.handleGameOver(userWon ? 'win' : 'lose');
        }
    }

    pongBtn.onclick = boot;

    window.pongCancelRef = () => {
        gameRunning = false; cancelAnimationFrame(animId);
        container.removeEventListener('mousemove', trackMove);
    };
}

function exitPongGame() {
    if (typeof window.pongCancelRef === 'function') window.pongCancelRef();
    if (typeof openChronoxGamesHub === 'function') openChronoxGamesHub();
}
