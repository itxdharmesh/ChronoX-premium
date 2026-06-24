// js/games/pong.js

function startPongGame() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Premium Synthwave Dashboard & Glassmorphism Canvas Layout
    c.innerHTML = `
        <div id="pongContainer" style="position:relative; width:100%; height:100%; min-height: calc(100vh - 160px); overflow:hidden; background: radial-gradient(circle at center, #0b0726 0%, #02010a 100%); font-family: 'Poppins', sans-serif; user-select:none; -webkit-user-select:none;">
            
            <div style="position:absolute; top:20px; left:0; width:100%; display:flex; justify-content:center; align-items:center; gap:60px; z-index:10; pointer-events:none;">
                <div style="text-align:center;">
                    <span style="font-size:9px; color:#00f5d4; display:block; letter-spacing:2px; font-weight:700;">USER CORE</span>
                    <span id="playerScore" style="color:#ffffff; font-weight:900; font-size:32px; text-shadow: 0 0 15px #00f5d4;">0</span>
                </div>
                <div style="font-size:20px; color:rgba(255,255,255,0.2); font-weight:800; margin-top:15px;">VS</div>
                <div style="text-align:center;">
                    <span style="font-size:9px; color:#ff006e; display:block; letter-spacing:2px; font-weight:700;">AI MATRIX</span>
                    <span id="aiScore" style="color:#ffffff; font-weight:900; font-size:32px; text-shadow: 0 0 15px #ff006e;">0</span>
                </div>
            </div>

            <canvas id="pongCanvas" style="display:block; margin: 0 auto; background: rgba(6, 3, 20, 0.5); box-shadow: 0 0 40px rgba(0,0,0,0.6);"></canvas>
            
            <button onclick="exitPongGame()" style="position:absolute; bottom:20px; right:20px; background:rgba(255, 0, 110, 0.15); border:1px solid rgba(255, 0, 110, 0.4); color:#ff006e; padding:8px 18px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; backdrop-filter:blur(5px); letter-spacing:1px; transition: 0.3s;">TERMINATE CORE</button>

            <div id="pongScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: linear-gradient(135deg, rgba(16, 9, 43, 0.92) 0%, rgba(4, 2, 12, 0.98) 100%); border:2px solid #ff006e; backdrop-filter:blur(25px); padding:45px 35px; border-radius:24px; text-align:center; width:88%; max-width:350px; box-shadow:0 25px 60px rgba(0,0,0,0.85); z-index:20;">
                <div style="font-size:42px; margin-bottom:15px; animation: glitchFloat 2.5s infinite alternate;">🏓</div>
                <h1 style="font-size:26px; font-weight:900; color:#ffffff; letter-spacing:4px; margin-bottom:8px; text-transform:uppercase; text-shadow: 0 0 12px #ff006e;">CYBER PONG</h1>
                <p id="pongSub" style="font-size:11px; color:rgba(255,255,255,0.55); margin-bottom:35px; letter-spacing:1px; line-height:1.6;">USE MOUSE OR TOUCH TO MOVE YOUR BLUE NEON PADDLE</p>
                <button id="pongBtn" style="background:linear-gradient(135deg, #ff006e, #00f5d4); border:none; padding:14px 35px; font-size:13px; font-weight:900; color:#03020a; border-radius:14px; cursor:pointer; text-transform:uppercase; letter-spacing:2px; width:100%; box-shadow:0 6px 20px rgba(255,0,110,0.35);">BOOT INTERFACE</button>
            </div>
        </div>
        <style>@keyframes glitchFloat{from{transform:translateY(0px);}to{transform:translateY(-8px);}}</style>
    `;

    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('pongContainer');
    const pongScreen = document.getElementById('pongScreen');
    const pongSub = document.getElementById('pongSub');
    const pongBtn = document.getElementById('pongBtn');
    const pScoreHUD = document.getElementById('playerScore');
    const aScoreHUD = document.getElementById('aiScore');

    // Canvas Auto Resizing Matrix
    const cWidth = container.clientWidth;
    const cHeight = container.clientHeight || (window.innerHeight - 160);
    canvas.width = Math.min(cWidth - 30, 650);
    canvas.height = Math.min(cHeight - 120, 400);

    // Gameplay Attributes Configurations
    const paddleWidth = 12;
    const paddleHeight = 75;
    
    let pScore = 0;
    let aScore = 0;
    let gameRunning = false;
    let animationId = null;
    let particles = [];

    const player = { x: 15, y: canvas.height / 2 - paddleHeight / 2, score: 0 };
    const ai = { x: canvas.width - 15 - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, score: 0 };
    
    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 7,
        speed: 5,
        dx: 5,
        dy: 3
    };

    // Tracker capture handler tracking user mouse movement vectors
    function trackMouseMove(e) {
        let rect = canvas.getBoundingClientRect();
        let rootY = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        // Anchor tracking center bound target mechanics
        player.y = Math.max(10, Math.min(canvas.height - paddleHeight - 10, rootY - paddleHeight / 2));
    }

    container.addEventListener('mousemove', trackMouseMove);
    container.addEventListener('touchmove', trackMouseMove, { passive: true });

    function createExplosionSparks(x, y, color) {
        for (let i = 0; i < 10; i++) {
            let angle = Math.random() * Math.PI * 2;
            let spd = Math.random() * 4 + 1;
            particles.push({
                x, y,
                radius: Math.random() * 2 + 1,
                dx: Math.cos(angle) * spd,
                dy: Math.sin(angle) * spd,
                alpha: 1,
                color
            });
        }
    }

    function resetBallVector() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speed = 5;
        ball.dx = -ball.dx; // Serve to the scorer
        ball.dy = (Math.random() - 0.5) * 5;
    }

    function updateLogic() {
        // Ball Translation Motion Updates
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Smart Adaptive AI Follow Bot Logic Matrix
        let aiCenter = ai.y + paddleHeight / 2;
        let trackingInterpolation = 0.085; // Skill tuning ratio mapping acceleration curves
        if (aiCenter < ball.y - 10) {
            ai.y += Math.min(4.5, (ball.y - aiCenter) * trackingInterpolation);
        } else if (aiCenter > ball.y + 10) {
            ai.y -= Math.min(4.5, (aiCenter - ball.y) * trackingInterpolation);
        }
        ai.y = Math.max(10, Math.min(canvas.height - paddleHeight - 10, ai.y));

        // Upper & Lower Screen Edge Inversions
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius; ball.dy = -ball.dy;
            createExplosionSparks(ball.x, ball.y, '#ffffff');
        }
        if (ball.y + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius; ball.dy = -ball.dy;
            createExplosionSparks(ball.x, ball.y, '#ffffff');
        }

        // Active Collisions Check - Left Side Player Paddle Box
        if (ball.dx < 0 && ball.x - ball.radius < player.x + paddleWidth && ball.x + ball.radius > player.x) {
            if (ball.y > player.y && ball.y < player.y + paddleHeight) {
                let hitAngle = (ball.y - (player.y + paddleHeight/2)) / (paddleHeight/2);
                ball.speed = Math.min(12, ball.speed + 0.4);
                ball.dx = Math.cos(hitAngle * 0.8) * ball.speed;
                ball.dy = Math.sin(hitAngle * 0.8) * ball.speed;
                createExplosionSparks(ball.x, ball.y, '#00f5d4');
            }
        }

        // Active Collisions Check - Right Side AI Paddle Box
        if (ball.dx > 0 && ball.x + ball.radius > ai.x && ball.x - ball.radius < ai.x + paddleWidth) {
            if (ball.y > ai.y && ball.y < ai.y + paddleHeight) {
                let hitAngle = (ball.y - (ai.y + paddleHeight/2)) / (paddleHeight/2);
                ball.speed = Math.min(12, ball.speed + 0.4);
                ball.dx = -Math.cos(hitAngle * 0.8) * ball.speed;
                ball.dy = Math.sin(hitAngle * 0.8) * ball.speed;
                createExplosionSparks(ball.x, ball.y, '#ff006e');
            }
        }

        // Processing Out of Bounds Tracking - Point Distribution
        if (ball.x < 0) {
            aScore++;
            aScoreHUD.innerText = aScore;
            createExplosionSparks(0, ball.y, '#ff006e');
            if (aScore >= 7) handleGameOver(false);
            else resetBallVector();
        } else if (ball.x > canvas.width) {
            pScore++;
            pScoreHUD.innerText = pScore;
            createExplosionSparks(canvas.width, ball.y, '#00f5d4');
            if (pScore >= 7) handleGameOver(true);
            else resetBallVector();
        }

        // Particles Tickers Processing
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.dx; p.y += p.dy; p.alpha -= 0.04;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    function renderPipeline() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // A. Synthwave Field Centered Net Divide Line
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 10]);
        ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke();
        ctx.setLineDash([]); // Core Reset

        // B. Draw Player Neon Blue Paddle Node
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00f5d4";
        ctx.fillStyle = "#00f5d4";
        ctx.beginPath(); ctx.roundRect(player.x, player.y, paddleWidth, paddleHeight, 6); ctx.fill();
        ctx.restore();

        // C. Draw AI Neon Pink Paddle Node
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ff006e";
        ctx.fillStyle = "#ff006e";
        ctx.beginPath(); ctx.roundRect(ai.x, ai.y, paddleWidth, paddleHeight, 6); ctx.fill();
        ctx.restore();

        // D. Render Active Energy Core Ball
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = ball.dx > 0 ? "#00f5d4" : "#ff006e";
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // E. Render Exploding Burst Layer Sparks
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });
    }

    function engineLoop() {
        if (!gameRunning) return;
        updateLogic();
        renderPipeline();
        animationId = requestAnimationFrame(engineLoop);
    }

    function bootSequence() {
        pongScreen.style.opacity = '0';
        pongScreen.style.visibility = 'hidden';
        
        pScore = 0; aScore = 0;
        pScoreHUD.innerText = "0";
        aScoreHUD.innerText = "0";
        particles = [];
        
        player.y = canvas.height / 2 - paddleHeight / 2;
        ai.y = canvas.height / 2 - paddleHeight / 2;
        
        resetBallVector();
        gameRunning = true;
        engineLoop();
    }

    function handleGameOver(userWon) {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        pongScreen.style.opacity = '1';
        pongScreen.style.visibility = 'visible';
        pongScreen.style.borderColor = userWon ? '#00f5d4' : '#ff006e';
        
        pongSub.innerHTML = userWon ? 
            `<span style="color:#00f5d4; font-weight:800; font-size:16px; text-shadow: 0 0 8px #00f5d4;">MATRIX CONQUERED!</span><br>YOU DOMINATED THE SYSTEM.` : 
            `<span style="color:#ff006e; font-weight:800; font-size:16px; text-shadow: 0 0 8px #ff006e;">AI CORE OVERLOAD!</span><br>THE MATRIX BREACHED YOUR GRID.`;
        
        pongBtn.innerText = "REBOOT CONSOLE CORE";
    }

    pongBtn.onclick = bootSequence;

    // Safety clear handler anchor
    window.pongCancelRef = () => {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        container.removeEventListener('mousemove', trackMouseMove);
    };
}

function exitPongGame() {
    if (typeof window.pongCancelRef === 'function') window.pongCancelRef();
    if (typeof openGames === 'function') openGames();
}
