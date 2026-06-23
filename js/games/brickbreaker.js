// js/games/brickbreaker.js

function startBrickBreaker() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // 1. Inject Canvas and Game UI inside contentArea dynamically
    c.innerHTML = `
        <div id="bbContainer" style="position:relative; width:100%; height:100%; min-height: calc(100vh - 160px); overflow:hidden;">
            <div style="position:absolute; top:10px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 15px; font-weight:700; font-size:12px; z-index:10; pointer-events:none;">
                <div id="bbScore" style="color:#00D4FF; text-shadow:0 0 8px rgba(0,212,255,0.5); background:rgba(10,14,39,0.6); padding:4px 12px; border-radius:20px;">SCORE: 0</div>
                <div id="bbLives" style="color:#FF4757; text-shadow:0 0 8px rgba(255,71,87,0.5); background:rgba(10,14,39,0.6); padding:4px 12px; border-radius:20px;">LIVES: ❤️ ❤️ ❤️</div>
            </div>

            <canvas id="bbCanvas" style="display:block; width:100%; height:100%; background:rgba(6,9,25,0.4);"></canvas>

            <button onclick="exitBrickBreaker()" style="position:absolute; bottom:85px; right:15px; background:transparent; border:1px solid #FF4757; color:#FF4757; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; letter-spacing:1px;">EXIT GAME</button>

            <div id="bbScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(19,24,66,0.95); border:1px solid rgba(212,175,55,0.2); backdrop-filter:blur(15px); -webkit-backdrop-filter:blur(15px); padding:30px 20px; border-radius:20px; text-align:center; width:85%; max-width:320px; box-shadow:0 15px 40px rgba(0,0,0,0.6); z-index:20; transition:0.3s;">
                <h1 id="bbTitle" style="font-size:22px; font-weight:900; letter-spacing:3px; background:linear-gradient(135deg,#D4AF37,#00D4FF); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:5px; text-transform:uppercase;">NEON BREAKER</h1>
                <p id="bbSub" style="font-size:10px; color:rgba(255,255,255,0.6); margin-bottom:20px; letter-spacing:1px;">PREMIUM EXPERT EDITION</p>
                <button id="bbBtn" style="background:linear-gradient(135deg,#D4AF37,#00D4FF); border:none; padding:10px 25px; font-size:12px; font-weight:700; color:#060919; border-radius:8px; cursor:pointer; text-transform:uppercase; letter-spacing:1px; box-shadow:0 0 15px rgba(0,212,255,0.3);">TAP TO PLAY</button>
            </div>
        </div>
    `;

    // 2. Initialize Game variables inside local closure scope to prevent memory leaks
    const canvas = document.getElementById('bbCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('bbContainer');
    const bbScreen = document.getElementById('bbScreen');
    const bbTitle = document.getElementById('bbTitle');
    const bbSub = document.getElementById('bbSub');
    const bbBtn = document.getElementById('bbBtn');
    const bbScore = document.getElementById('bbScore');
    const bbLives = document.getElementById('bbLives');

    // Adapt Resolution to container sizing
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 160);

    let score = 0;
    let lives = 3;
    let gameRunning = false;
    let particles = [];
    let ballTrails = [];
    let animationId = null;

    const paddle = {
        width: 80,
        height: 10,
        x: canvas.width / 2 - 40,
        y: canvas.height - 110,
        targetX: canvas.width / 2 - 40,
        speed: 0.25
    };

    const ball = {
        x: 0, y: 0, radius: 6, dx: 0, dy: 0, baseSpeed: 4.5, speed: 4.5
    };

    const brickConfig = { rows: 5, cols: 5, padding: 6, offsetTop: 60, offsetLeft: 10, height: 16 };
    let bricks = [];
    const neonColors = ['#FF4757', '#00D4FF', '#7C3AED', '#2ED573', '#FFA502'];

    function setupLevel() {
        score = 0;
        lives = 3;
        bbScore.innerText = `SCORE: ${score}`;
        bbLives.innerText = `LIVES: ` + `❤️ `.repeat(lives);
        paddle.x = canvas.width / 2 - paddle.width / 2;
        paddle.targetX = paddle.x;
        
        resetBall();

        const totalWidth = canvas.width - (brickConfig.offsetLeft * 2);
        const brickWidth = (totalWidth - (brickConfig.padding * (brickConfig.cols - 1))) / brickConfig.cols;
        
        bricks = [];
        for (let r = 0; r < brickConfig.rows; r++) {
            bricks[r] = [];
            for (let c = 0; c < brickConfig.cols; c++) {
                bricks[r][c] = {
                    x: brickConfig.offsetLeft + c * (brickWidth + brickConfig.padding),
                    y: brickConfig.offsetTop + r * (brickConfig.height + brickConfig.padding),
                    width: brickWidth,
                    status: 1,
                    color: neonColors[r % neonColors.length]
                };
            }
        }
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = paddle.y - 20;
        ball.speed = ball.baseSpeed;
        ball.dx = (Math.random() - 0.5) * 3;
        ball.dy = -ball.speed;
        ballTrails = [];
    }

    function createExplosion(x, y, color) {
        for (let i = 0; i < 10; i++) {
            particles.push({
                x: x, y: y, radius: Math.random() * 2.5 + 1,
                dx: (Math.random() - 0.5) * 5, dy: (Math.random() - 0.5) * 5,
                alpha: 1, decay: Math.random() * 0.03 + 0.02, color: color
            });
        }
    }

    // Touch and Controls handler attached directly to container scope
    function handleControl(e) {
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const rect = canvas.getBoundingClientRect();
        paddle.targetX = (clientX - rect.left) - paddle.width / 2;
    }

    container.addEventListener('mousemove', handleControl);
    container.addEventListener('touchmove', handleControl, { passive: true });

    function update() {
        paddle.x += (paddle.targetX - paddle.x) * paddle.speed;
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;

        ball.x += ball.dx;
        ball.y += ball.dy;

        ballTrails.push({ x: ball.x, y: ball.y });
        if (ballTrails.length > 6) ballTrails.shift();

        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
            ball.dx = -ball.dx;
            createExplosion(ball.x, ball.y, '#00D4FF');
        }
        if (ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
            createExplosion(ball.x, ball.y, '#00D4FF');
        }

        // Paddle Collision
        if (ball.y + ball.radius >= paddle.y && ball.y - ball.radius <= paddle.y + paddle.height) {
            if (ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
                let hitPt = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
                ball.speed += 0.1;
                ball.dx = hitPt * ball.speed * 0.8;
                ball.dy = -Math.sqrt(Math.abs(ball.speed * ball.speed - ball.dx * ball.dx));
                createExplosion(ball.x, ball.y, '#D4AF37');
            }
        }

        // Fall Down Out of Bounds
        if (ball.y > canvas.height) {
            lives--;
            bbLives.innerText = `LIVES: ` + `❤️ `.repeat(lives);
            if (lives <= 0) {
                endGame(false);
                return;
            } else {
                resetBall();
            }
        }

        // Bricks Collision
        let currentWin = true;
        for (let r = 0; r < brickConfig.rows; r++) {
            for (let c = 0; c < brickConfig.cols; c++) {
                let b = bricks[r][c];
                if (b.status === 1) {
                    currentWin = false;
                    if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + b.width &&
                        ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + b.height) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        score += 10;
                        bbScore.innerText = `SCORE: ${score}`;
                        createExplosion(ball.x, ball.y, b.color);
                    }
                }
            }
        }

        if (currentWin) {
            endGame(true);
            return;
        }

        // Particles cycle
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.dx; p.y += p.dy; p.alpha -= p.decay;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Trails
        ballTrails.forEach((t, i) => {
            ctx.beginPath();
            ctx.arc(t.x, t.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 212, 255, ${(i / ballTrails.length) * 0.2})`;
            ctx.fill();
        });

        // Bricks with glow shadows
        for (let r = 0; r < brickConfig.rows; r++) {
            for (let c = 0; c < brickConfig.cols; c++) {
                let b = bricks[r][c];
                if (b.status === 1) {
                    ctx.save();
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = b.color;
                    ctx.fillStyle = b.color;
                    ctx.beginPath();
                    ctx.roundRect(b.x, b.y, b.width, brickConfig.height, 4);
                    ctx.fill();
                    ctx.restore();
                }
            }
        }

        // Paddle
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#D4AF37';
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 4);
        ctx.fill();
        ctx.restore();

        // Ball
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00D4FF';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();

        // Particles
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    function loop() {
        if (!gameRunning) return;
        update();
        draw();
        animationId = requestAnimationFrame(loop);
    }

    function loopStarter() {
        bbScreen.style.opacity = '0';
        bbScreen.style.visibility = 'hidden';
        setupLevel();
        gameRunning = true;
        loop();
    }

    function endGame(isWin) {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        bbScreen.style.opacity = '1';
        bbScreen.style.visibility = 'visible';
        if (isWin) {
            bbTitle.innerText = "VICTORY!";
            bbSub.innerText = `CLEARED WITH ${score} POINTS`;
        } else {
            bbTitle.innerText = "GAME OVER";
            bbSub.innerText = `FINAL SCORE: ${score}`;
        }
        bbBtn.innerText = "RESTART";
    }

    // Attach play trigger
    bbBtn.onclick = loopStarter;
    
    // Store critical cancel reference inside global window so exit logic handles it cleanly
    window.bbCancelRef = function() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
    };
}

// Function to safely close game and redirect to Games Hub menu layout
function exitBrickBreaker() {
    if (typeof window.bbCancelRef === 'function') {
        window.bbCancelRef();
    }
    // Call your global routing function to reload the games main list menu
    if (typeof openGames === 'function') {
        openGames();
    }
}
