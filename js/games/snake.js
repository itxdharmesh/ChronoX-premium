// js/games/snake.js

function startSnakeGame() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Premium Cyber Neon UI Layout
    c.innerHTML = `
        <div id="snakeContainer" style="position:relative; width:100%; height:100%; min-height: calc(100vh - 160px); overflow:hidden; background: radial-gradient(circle at center, #0b051d 0%, #020108 100%); font-family: 'Poppins', sans-serif; user-select:none; -webkit-user-select:none;">
            
            <div style="position:absolute; top:15px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:10; pointer-events:none;">
                <div style="background: rgba(10, 5, 30, 0.8); border: 1px solid rgba(0, 245, 212, 0.4); padding: 8px 16px; border-radius: 12px; backdrop-filter: blur(10px); box-shadow: 0 0 15px rgba(0, 245, 212, 0.15);">
                    <span style="font-size:9px; color:rgba(0, 245, 212, 0.7); display:block; letter-spacing:1px; font-weight:700;">DATA CORES</span>
                    <span id="snakeScore" style="color:#ffffff; font-weight:900; font-size:20px; text-shadow: 0 0 10px #00f5d4;">0000</span>
                </div>
                <div style="background: rgba(10, 5, 30, 0.8); border: 1px solid rgba(255, 0, 110, 0.4); padding: 8px 16px; border-radius: 12px; backdrop-filter: blur(10px); box-shadow: 0 0 15px rgba(255, 0, 110, 0.15);">
                    <span style="font-size:9px; color:rgba(255, 0, 110, 0.7); display:block; letter-spacing:1px; font-weight:700;">TOP NODE</span>
                    <span id="snakeHighScore" style="color:#ffffff; font-weight:900; font-size:20px; text-shadow: 0 0 10px #ff006e;">0000</span>
                </div>
            </div>

            <canvas id="snakeCanvas" style="display:block; margin: 0 auto; background: rgba(5, 2, 15, 0.4); box-shadow: 0 0 30px rgba(0,0,0,0.5);"></canvas>
            
            <button onclick="exitSnakeGame()" style="position:absolute; bottom:20px; right:20px; background:rgba(255, 0, 110, 0.1); border:1px solid rgba(255, 0, 110, 0.4); color:#ff006e; padding:8px 16px; border-radius:10px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; backdrop-filter:blur(5px); letter-spacing:1px; transition: 0.3s;">TERMINATE MATRIX</button>

            <div id="snakeScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: linear-gradient(135deg, rgba(15, 8, 38, 0.9) 0%, rgba(3, 2, 10, 0.98) 100%); border:2px solid #00f5d4; backdrop-filter:blur(20px); padding:40px 30px; border-radius:20px; text-align:center; width:88%; max-width:340px; box-shadow:0 20px 50px rgba(0,0,0,0.8); z-index:20; transition:0.3s;">
                <div style="font-size:38px; margin-bottom:15px; animation: pulseGlow 2s infinite alternate;">🐍</div>
                <h1 style="font-size:24px; font-weight:900; color:#ffffff; letter-spacing:4px; margin-bottom:8px; text-transform:uppercase; text-shadow: 0 0 10px #00f5d4;">CYBER SNAKE</h1>
                <p id="snakeSub" style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:30px; letter-spacing:1px; line-height:1.6;">USE ARROW KEYS TO NAVIGATE THE VECTOR GRID</p>
                <button id="snakeBtn" style="background:linear-gradient(135deg, #00f5d4, #ff006e); border:none; padding:12px 30px; font-size:13px; font-weight:800; color:#000000; border-radius:12px; cursor:pointer; text-transform:uppercase; letter-spacing:2px; width:100%; box-shadow:0 5px 15px rgba(0,245,212,0.35);">INITIALIZE GRID</button>
            </div>
        </div>
        <style>@keyframes pulseGlow{from{transform:scale(0.96);opacity:0.8;}to{transform:scale(1.04);opacity:1;}}</style>
    `;

    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('snakeContainer');
    const snakeScreen = document.getElementById('snakeScreen');
    const snakeSub = document.getElementById('snakeSub');
    const snakeBtn = document.getElementById('snakeBtn');
    const snakeScore = document.getElementById('snakeScore');
    const snakeHighScore = document.getElementById('snakeHighScore');

    // Make game responsive & fit perfectly inside viewport grid
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight || (window.innerHeight - 160);
    const size = Math.min(containerWidth - 40, containerHeight - 120, 400); // Perfect Square Grid
    canvas.width = size;
    canvas.height = size;

    // Grid System Math Architecture
    const gridSize = 20; 
    const tileSize = canvas.width / gridSize;

    let snake = [];
    let food = { x: 0, y: 0 };
    let dx = tileSize;
    let dy = 0;
    let score = 0;
    let highScore = localStorage.getItem('cyberSnakeHighScore') || 0;
    let gameRunning = false;
    let gameLoopTimeout = null;
    let particles = [];
    let foodPulse = 0;

    snakeHighScore.innerText = String(highScore).padStart(4, '0');

    // Spawn Food Core randomly on available grid nodes
    function generateFood() {
        food.x = Math.floor(Math.random() * gridSize) * tileSize;
        food.y = Math.floor(Math.random() * gridSize) * tileSize;
        
        // Prevent food spawning inside snake body
        for (let cell of snake) {
            if (cell.x === food.x && cell.y === food.y) {
                generateFood();
                break;
            }
        }
    }

    // Direction control handler safely preventing self-collision reversals
    function handleKeyDown(e) {
        if (!gameRunning) return;
        
        const key = e.key;
        const goingUp = dy === -tileSize;
        const goingDown = dy === tileSize;
        const goingRight = dx === tileSize;
        const goingLeft = dx === -tileSize;

        if ((key === 'ArrowLeft' || key === 'a') && !goingRight) { dx = -tileSize; dy = 0; }
        if ((key === 'ArrowRight' || key === 'd') && !goingLeft) { dx = tileSize; dy = 0; }
        if ((key === 'ArrowUp' || key === 'w') && !goingDown) { dx = 0; dy = -tileSize; }
        if ((key === 'ArrowDown' || key === 's') && !goingUp) { dx = 0; dy = tileSize; }
    }

    window.addEventListener('keydown', handleKeyDown);

    function createParticleBurst(x, y, color) {
        for (let i = 0; i < 12; i++) {
            let angle = Math.random() * Math.PI * 2;
            let spd = Math.random() * 3 + 1;
            particles.push({
                x: x + tileSize/2,
                y: y + tileSize/2,
                radius: Math.random() * 2 + 1,
                dx: Math.cos(angle) * spd,
                dy: Math.sin(angle) * spd,
                alpha: 1,
                color: color
            });
        }
    }

    function mainEngineLoop() {
        if (!gameRunning) return;

        // 1. Move Snake Head Node
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // 2. Wall Collisions Check Matrix
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
            createParticleBurst(snake[0].x, snake[0].y, '#ff006e');
            handleGameOver();
            return;
        }

        // 3. Self Body Eat Collision Check
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                createParticleBurst(snake[i].x, snake[i].y, '#ff006e');
                handleGameOver();
                return;
            }
        }

        // Insert new head vector
        snake.unshift(head);

        // 4. Check if Food Core is devoured
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            snakeScore.innerText = String(score).padStart(4, '0');
            createParticleBurst(food.x, food.y, '#00f5d4');
            generateFood();
            
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('cyberSnakeHighScore', highScore);
                snakeHighScore.innerText = String(highScore).padStart(4, '0');
            }
        } else {
            snake.pop(); // Remove tail segment if not growing
        }

        // 5. Update Particle Internals
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.dx; p.y += p.dy; p.alpha -= 0.04;
            if (p.alpha <= 0) particles.splice(i, 1);
        }

        foodPulse += 0.15;

        // Render Frame Pipeline
        renderGrid();

        // Speed curve gets tighter as snake gets longer
        let calculatedSpeed = Math.max(60, 110 - Math.floor(score / 30) * 5);
        gameLoopTimeout = setTimeout(mainEngineLoop, calculatedSpeed);
    }

    function renderGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // A. Subtle Neon Grid Matrix Lines Background
        ctx.strokeStyle = 'rgba(0, 245, 212, 0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= gridSize; i++) {
            ctx.beginPath(); ctx.moveTo(i * tileSize, 0); ctx.lineTo(i * tileSize, canvas.height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * tileSize); ctx.lineTo(canvas.width, i * tileSize); ctx.stroke();
        }

        // B. Render Quantum Battery Food Core (Glow Effect)
        ctx.save();
        ctx.shadowBlur = 12 + Math.sin(foodPulse) * 4;
        ctx.shadowColor = '#00f5d4';
        ctx.fillStyle = '#00f5d4';
        ctx.beginPath();
        let pad = 4;
        ctx.roundRect(food.x + pad, food.y + pad, tileSize - pad*2, tileSize - pad*2, 6);
        ctx.fill();
        ctx.restore();

        // C. Draw Tron Neon Glowing Snake Body
        snake.forEach((cell, index) => {
            ctx.save();
            let isHead = index === 0;
            
            ctx.shadowBlur = isHead ? 15 : 8;
            ctx.shadowColor = isHead ? '#00f5d4' : '#7b2cbf';
            ctx.fillStyle = isHead ? '#ffffff' : `rgba(123, 44, 191, ${1 - (index / snake.length) * 0.6})`;

            ctx.beginPath();
            let bPad = isHead ? 2 : 3;
            ctx.roundRect(cell.x + bPad, cell.y + bPad, tileSize - bPad*2, tileSize - bPad*2, isHead ? 6 : 4);
            ctx.fill();

            // Minimalist Direction eye pointer on snake head
            if (isHead) {
                ctx.fillStyle = '#020108';
                ctx.fillRect(cell.x + tileSize/2 - 2, cell.y + tileSize/2 - 2, 4, 4);
            }
            ctx.restore();
        });

        // D. Draw Hit Burst Particles
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });
    }

    function bootSequence() {
        snakeScreen.style.opacity = '0';
        snakeScreen.style.visibility = 'hidden';
        
        score = 0;
        snakeScore.innerText = "0000";
        dx = tileSize;
        dy = 0;
        particles = [];
        
        // Initial 3 node snake vector layout setup
        snake = [
            { x: tileSize * 5, y: tileSize * 5 },
            { x: tileSize * 4, y: tileSize * 5 },
            { x: tileSize * 3, y: tileSize * 5 }
        ];

        generateFood();
        gameRunning = true;
        mainEngineLoop();
    }

    function handleGameOver() {
        gameRunning = false;
        clearTimeout(gameLoopTimeout);
        snakeScreen.style.opacity = '1';
        snakeScreen.style.visibility = 'visible';
        snakeSub.innerHTML = `MATRIX INTERRUPTED! <br><span style="color:#ff006e; font-weight:800; font-size:15px;">CORES HARVESTED: ${score}</span>`;
        snakeBtn.innerText = "REBOOT GRID CORE";
    }

    snakeBtn.onclick = bootSequence;

    // Safety clear handler anchor
    window.snakeCancelRef = () => {
        gameRunning = false;
        clearTimeout(gameLoopTimeout);
        window.removeEventListener('keydown', handleKeyDown);
    };
}

function exitSnakeGame() {
    if (typeof window.snakeCancelRef === 'function') window.snakeCancelRef();
    if (typeof openGames === 'function') openGames();
}
