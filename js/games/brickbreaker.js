// js/games/brickbreaker.js

function startBrickBreaker() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div id="bbContainer" style="position:relative; width:100%; height:100%; min-height: 500px; height: calc(100vh - 120px); overflow:hidden; background: #070913; font-family: 'Poppins', sans-serif; user-select:none; -webkit-user-select:none; touch-action: none;">
            
            <div style="position:absolute; top:15px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:10; pointer-events:none;">
                <div style="background: rgba(10, 15, 30, 0.85); border: 1px solid #00F5D4; padding: 6px 14px; border-radius: 10px; backdrop-filter: blur(8px);">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">SCORE</span>
                    <span id="bbScore" style="color:#00F5D4; font-weight:900; font-size:16px; text-shadow: 0 0 10px #00F5D4;">0000</span>
                </div>
                <div style="background: rgba(10, 15, 30, 0.85); border: 1px solid #FF007F; padding: 6px 14px; border-radius: 10px; backdrop-filter: blur(8px);">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">LIVES</span>
                    <span id="bbLives" style="color:#FF007F; font-weight:800; font-size:16px;">❤️❤️❤️</span>
                </div>
            </div>

            <canvas id="bbCanvas" style="display:block; width:100%; height:100%; position:absolute; top:0; left:0; z-index:1; cursor:none; touch-action: none;"></canvas>

            <button id="bbExitBtn" style="position:absolute; bottom:20px; right:20px; background:rgba(255,0,127,0.15); border:1px solid rgba(255,0,127,0.4); color:#FF007F; padding:8px 16px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; backdrop-filter:blur(5px); letter-spacing:1px;">ABORT GAME</button>

            <div id="bbScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: rgba(7, 11, 26, 0.95); border:1px solid #00F5D4; backdrop-filter:blur(20px); padding:35px 25px; border-radius:24px; text-align:center; width:88%; max-width:340px; box-shadow:0 20px 60px rgba(0,0,0,0.8); z-index:20; display:block;">
                <div style="width:60px; height:60px; background: rgba(0,245,212,0.15); border: 2px solid #00F5D4; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:26px;">🎮</div>
                <h1 style="font-size:22px; font-weight:900; letter-spacing:2px; color:#fff; margin-bottom:5px;">BRICK BREAKER</h1>
                <p id="bbSub" style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:25px; letter-spacing:1px; line-height:1.5;">MOVE PADDLE TO BOUNCE NEON ORB <br>AND CLEAR ALL BREAKABLE WALLS</p>
                <button id="bbBtn" style="background:linear-gradient(135deg,#00F5D4, #7B2CBF); border:none; padding:12px 30px; font-size:13px; font-weight:800; color:#fff; border-radius:12px; cursor:pointer; text-transform:uppercase; width:100%; box-shadow: 0 5px 15px rgba(0,245,212,0.3);">INITIALIZE GRID</button>
            </div>
        </div>
    `;

    const canvas = document.getElementById('bbCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('bbContainer');
    const bbScreen = document.getElementById('bbScreen');
    const bbSub = document.getElementById('bbSub');
    const bbBtn = document.getElementById('bbBtn');
    const bbExitBtn = document.getElementById('bbExitBtn');
    const bbScore = document.getElementById('bbScore');
    const bbLives = document.getElementById('bbLives');

    canvas.width = container.clientWidth || window.innerWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 120);

    let score = 0, lives = 3, gameRunning = false;
    let ball = {}, paddle = {}, bricks = [], particles = [];
    let animationId = null;

    const paddleWidth = 110;
    const paddleHeight = 14;
    const ballRadius = 8;
    
    // Grid settings
    const brickRows = 4;
    const brickCols = 5; // Columns thodi kam kari taaki bricks badi aur solid rahein
    const brickHeight = 24;
    const brickPadding = 10;
    
    function initGameObjects() {
        paddle = {
            x: canvas.width / 2 - paddleWidth / 2,
            y: canvas.height - 50,
            width: paddleWidth,
            height: paddleHeight,
            color: '#00F5D4'
        };

        ball = {
            x: canvas.width / 2,
            y: paddle.y - ballRadius - 10,
            vx: 3,
            vy: -4,
            radius: ballRadius,
            color: '#FFFFFF'
        };

        // Precise integer pixel calculation for bricks to prevent gap bypass
        bricks = [];
        let totalPaddingSpace = brickPadding * (brickCols + 1);
        let availableWidth = canvas.width - totalPaddingSpace;
        let singleBrickWidth = Math.floor(availableWidth / brickCols);
        let offsetLeft = Math.floor((canvas.width - ((singleBrickWidth * brickCols) + (brickPadding * (brickCols - 1)))) / 2);

        let rowColors = ['#FF007F', '#7B2CBF', '#00F5D4', '#FFA502'];
        for (let r = 0; r < brickRows; r++) {
            for (let c = 0; c < brickCols; c++) {
                let brickX = offsetLeft + (c * (singleBrickWidth + brickPadding));
                let brickY = 90 + (r * (brickHeight + brickPadding));
                bricks.push({
                    x: brickX,
                    y: brickY,
                    w: singleBrickWidth,
                    h: brickHeight,
                    color: rowColors[r],
                    active: true
                });
            }
        }
    }

    function createExplosion(x, y, color) {
        for (let i = 0; i < 8; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 2 + 1;
            particles.push({
                x, y, radius: Math.random() * 2 + 0.5,
                dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed,
                alpha: 1, decay: Math.random() * 0.05 + 0.03, color
            });
        }
    }

    function handleMove(e) {
        if (!gameRunning) return;
        if (e.cancelable) e.preventDefault();

        let rect = canvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let relativeX = clientX - rect.left;

        paddle.x = relativeX - paddle.width / 2;

        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
    }

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchstart', (e) => { if (gameRunning && e.cancelable) e.preventDefault(); }, { passive: false });

    function updateFrameLogic() {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Wall Reflections
        if (ball.x - ball.radius <= 0) {
            ball.vx = Math.abs(ball.vx);
            ball.x = ball.radius;
        } else if (ball.x + ball.radius >= canvas.width) {
            ball.vx = -Math.abs(ball.vx);
            ball.x = canvas.width - ball.radius;
        }

        if (ball.y - ball.radius <= 0) {
            ball.vy = Math.abs(ball.vy);
            ball.y = ball.radius;
        }

        // Bottom Pit Death Area
        if (ball.y + ball.radius >= canvas.height) {
            lives--;
            if (bbLives) bbLives.innerText = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
            
            if (lives <= 0) {
                handleGameOver(false);
                return;
            } else {
                ball.x = paddle.x + paddle.width / 2;
                ball.y = paddle.y - ball.radius - 10;
                ball.vx = 3 * (Math.random() > 0.5 ? 1 : -1);
                ball.vy = -4;
                return;
            }
        }

        // Paddle Collision Engine
        if (ball.y + ball.radius >= paddle.y && ball.y - ball.radius <= paddle.y + paddle.height) {
            if (ball.x + ball.radius >= paddle.x && ball.x - ball.radius <= paddle.x + paddle.width) {
                let hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
                ball.vx = hitPoint * 4.5;
                ball.vy = -Math.abs(ball.vy);
                ball.y = paddle.y - ball.radius; 
            }
        }

        // ULTRA-STRICT MATRIX HITBOX SCANNER
        let activeCount = 0;
        for (let i = 0; i < bricks.length; i++) {
            let b = bricks[i];
            if (!b.active) continue;
            activeCount++;

            // Closest edge algorithm detection
            let closestX = Math.max(b.x, Math.min(ball.x, b.x + b.w));
            let closestY = Math.max(b.y, Math.min(ball.y, b.y + b.h));

            let distanceX = ball.x - closestX;
            let distanceY = ball.y - closestY;
            let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

            // If collision verified
            if (distanceSquared < (ball.radius * ball.radius)) {
                b.active = false;
                createExplosion(closestX, closestY, b.color);
                score += 20;
                if (bbScore) bbScore.innerText = String(score).padStart(4, '0');

                // Determine precise impact orientation vector deflection
                let overlapX = ball.radius - Math.abs(distanceX);
                let overlapY = ball.radius - Math.abs(distanceY);

                if (closestX === b.x || closestX === b.x + b.w) {
                    if (closestY === b.y || closestY === b.y + b.h) {
                        // Corner collision mechanics
                        ball.vx = distanceX > 0 ? Math.abs(ball.vx) : -Math.abs(ball.vx);
                        ball.vy = distanceY > 0 ? Math.abs(ball.vy) : -Math.abs(ball.vy);
                    } else {
                        ball.vx = -ball.vx; // Side strike hit
                    }
                } else {
                    ball.vy = -ball.vy; // Top or bottom face strike hit
                }
                
                // Break after single hit reflection frame to prevent multiple bounces inside single tick
                break; 
            }
        }

        if (activeCount === 0) {
            handleGameOver(true);
            return;
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i]; p.x += p.dx; p.y += p.dy; p.alpha -= p.decay;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    function drawRenderPipeline() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render Bricks
        bricks.forEach(b => {
            if (!b.active) return;
            ctx.save();
            ctx.shadowBlur = 4; ctx.shadowColor = b.color;
            ctx.fillStyle = b.color;
            ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 4); ctx.fill();
            ctx.restore();
        });

        // Render Paddle
        ctx.save();
        ctx.shadowBlur = 10; ctx.shadowColor = paddle.color;
        ctx.fillStyle = paddle.color;
        ctx.beginPath(); ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 6); ctx.fill();
        ctx.restore();

        // Render Ball Core Orb
        ctx.save();
        ctx.shadowBlur = 8; ctx.shadowColor = '#FFFFFF';
        ctx.fillStyle = ball.color;
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Render Particles
        particles.forEach(p => {
            ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });
    }

    function engineLoop() {
        if (!gameRunning) return;
        updateFrameLogic(); drawRenderPipeline();
        animationId = requestAnimationFrame(engineLoop);
    }

    function bootSequence() {
        bbScreen.style.display = 'none';
        score = 0; lives = 3; particles = [];
        if (bbScore) bbScore.innerText = "0000";
        if (bbLives) bbLives.innerText = "❤️❤️❤️";
        gameRunning = true;
        initGameObjects(); engineLoop();
    }

    function handleGameOver(winStatus) {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        bbScreen.style.display = 'block';
        if (winStatus) {
            bbSub.innerHTML = `STAGE CLEARED SUCCESSFULLY! <br><span style="color:#00F5D4; font-weight:900; font-size:15px;">FINAL SCORE: ${score}</span>`;
            bbBtn.innerText = "LAUNCH NEXT STAGE";
        } else {
            bbSub.innerHTML = `TACTICAL GRID DEFEAT! <br><span style="color:#FF007F; font-weight:900; font-size:15px;">TOTAL SCORE: ${score}</span>`;
            bbBtn.innerText = "RE-INITIALIZE GRID";
        }
    }

    bbBtn.onclick = bootSequence;
    window.bbCancelRef = () => { gameRunning = false; cancelAnimationFrame(animationId); };
    bbExitBtn.onclick = function() {
        if (typeof window.bbCancelRef === 'function') window.bbCancelRef();
        if (typeof openGames === 'function') openGames();
    };
}
