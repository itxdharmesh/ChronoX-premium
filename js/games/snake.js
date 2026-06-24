// js/games/snake.js

function startSnakeGame() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div id="snakeContainer" style="position:relative; width:100%; height:100%; min-height: calc(100vh - 90px); background: #060314; font-family: 'Poppins', sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px; box-sizing:border-box;">
            
            <div style="width:100%; max-width:400px; display:flex; justify-content:space-between; margin-bottom:15px; background:rgba(255,255,255,0.03); padding:10px 20px; border-radius:14px; border:1px solid rgba(255,255,255,0.05); box-sizing:border-box;">
                <div>
                    <span style="font-size:10px; color:#00f5d4; font-weight:700; letter-spacing:1px; display:block;">SCORE</span>
                    <span id="snakeScore" style="font-size:24px; font-weight:900; color:#fff; text-shadow:0 0 10px #00f5d4;">0</span>
                </div>
                <div style="text-align:right;">
                    <span style="font-size:10px; color:#ff006e; font-weight:700; letter-spacing:1px; display:block;">BEST NODE</span>
                    <span id="snakeHighScore" style="font-size:24px; font-weight:900; color:#fff; text-shadow:0 0 10px #ff006e;">0</span>
                </div>
            </div>

            <div style="position:relative; background:rgba(0,0,0,0.5); border:2px solid rgba(0,245,212,0.2); border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,0.8); overflow:hidden;">
                <canvas id="snakeCanvas" width="360" height="360" style="display:block; max-width:100%; box-sizing:border-box;"></canvas>
                
                <div id="snakeScreen" style="position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(6,3,20,0.95); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; box-sizing:border-box;">
                    <div style="font-size:45px; margin-bottom:10px; filter:drop-shadow(0 0 10px #00f5d4);">🐍</div>
                    <h2 id="snakeTitle" style="color:#fff; font-size:22px; font-weight:900; letter-spacing:2px; margin:0 0 10px 0;">CYBER SNAKE</h2>
                    <p id="snakeSub" style="color:rgba(255,255,255,0.6); font-size:12px; max-width:260px; margin:0 0 25px 0; line-height:1.6;">WALLLESS MODE: CHRONOX VECTOR WILL RE-LOOP FROM EDGES INTERNALLY.</p>
                    <button id="snakeBtn" style="background:linear-gradient(135deg, #00f5d4, #7b2cbf); border:none; color:#000; font-weight:800; font-size:13px; padding:12px 35px; border-radius:12px; cursor:pointer; letter-spacing:1px; text-transform:uppercase; transition:0.2s; box-shadow:0 0 15px rgba(0,245,212,0.4);">START SIMULATION</button>
                </div>
            </div>

            <button onclick="exitSnakeGame()" style="margin-top:20px; background:transparent; border:1px solid rgba(255,0,110,0.3); color:#ff006e; padding:8px 20px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; transition:0.2s;">DISCONNECT MATRIX</button>
        </div>
    `;

    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const snakeScreen = document.getElementById('snakeScreen');
    const snakeTitle = document.getElementById('snakeTitle');
    const snakeSub = document.getElementById('snakeSub');
    const snakeBtn = document.getElementById('snakeBtn');
    const snakeScore = document.getElementById('snakeScore');
    const snakeHighScore = document.getElementById('snakeHighScore');

    const gridSize = 20; 
    const tileSize = canvas.width / gridSize;

    let snake = [];
    let food = { x: 0, y: 0 };
    let dx = tileSize, dy = 0;
    let score = 0;
    let highScore = localStorage.getItem('cyberSnakeHighScore') || 0;
    let gameRunning = false;
    let gameLoopTimeout = null;

    snakeHighScore.innerText = highScore;

    function generateFood() {
        food.x = Math.floor(Math.random() * gridSize) * tileSize;
        food.y = Math.floor(Math.random() * gridSize) * tileSize;
        for (let cell of snake) {
            if (cell.x === food.x && cell.y === food.y) { generateFood(); break; }
        }
    }

    function handleKeyDown(e) {
        if (!gameRunning) return;
        const key = e.key.toLowerCase();
        if ((key === 'arrowleft' || key === 'a') && dx === 0) { dx = -tileSize; dy = 0; e.preventDefault(); }
        if ((key === 'arrowright' || key === 'd') && dx === 0) { dx = tileSize; dy = 0; e.preventDefault(); }
        if ((key === 'arrowup' || key === 'w') && dy === 0) { dx = 0; dy = -tileSize; e.preventDefault(); }
        if ((key === 'arrowdown' || key === 's') && dy === 0) { dx = 0; dy = tileSize; e.preventDefault(); }
    }

    window.addEventListener('keydown', handleKeyDown);

    function mainEngineLoop() {
        if (!gameRunning) return;

        // Calculate Next Coordinates
        let nextX = snake[0].x + dx;
        let nextY = snake[0].y + dy;

        // --- END-TO-END RE-LOOP WALL TELEPORTATION ---
        if (nextX < 0) nextX = canvas.width - tileSize;
        else if (nextX >= canvas.width) nextX = 0;

        if (nextY < 0) nextY = canvas.height - tileSize;
        else if (nextY >= canvas.height) nextY = 0;

        const head = { x: nextX, y: nextY };

        // Self-Collision Check Only (Since walls are porous now)
        for (let cell of snake) {
            if (head.x === cell.x && head.y === cell.y) {
                handleGameOver();
                return;
            }
        }

        snake.unshift(head);

        // Check if Food Consumed
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            snakeScore.innerText = score;
            generateFood();
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('cyberSnakeHighScore', highScore);
                snakeHighScore.innerText = highScore;
            }
        } else {
            snake.pop();
        }

        renderGrid();
        gameLoopTimeout = setTimeout(mainEngineLoop, 90); // 90ms optimal dynamic latency
    }

    function renderGrid() {
        ctx.fillStyle = '#060314';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cyber Grid Subtle Background Linings
        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += tileSize) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
        }

        // Render Food Orb
        ctx.fillStyle = '#00f5d4';
        ctx.shadowBlur = 15; ctx.shadowColor = '#00f5d4';
        ctx.beginPath();
        ctx.arc(food.x + tileSize/2, food.y + tileSize/2, tileSize/2 - 2, 0, Math.PI*2);
        ctx.fill();

        // Render Snake Vector Node Path
        snake.forEach((cell, idx) => {
            ctx.fillStyle = idx === 0 ? '#ffffff' : '#7b2cbf';
            ctx.shadowBlur = idx === 0 ? 15 : 0; ctx.shadowColor = '#7b2cbf';
            ctx.fillRect(cell.x + 1, cell.y + 1, tileSize - 2, tileSize - 2);
        });
        ctx.shadowBlur = 0; // reset
    }

    function bootSequence() {
        snakeScreen.style.display = 'none';
        score = 0; snakeScore.innerText = "0";
        dx = tileSize; dy = 0;
        snake = [
            { x: tileSize * 5, y: tileSize * 8 },
            { x: tileSize * 4, y: tileSize * 8 },
            { x: tileSize * 3, y: tileSize * 8 }
        ];
        generateFood();
        gameRunning = true;
        mainEngineLoop();
    }

    function handleGameOver() {
        gameRunning = false;
        clearTimeout(gameLoopTimeout);
        snakeScreen.style.display = 'flex';
        snakeTitle.innerText = "SYSTEM TERMINATED";
        snakeSub.innerHTML = `MATRIX COLLISION ENGAGED.<br><span style="color:#00f5d4; font-size:16px; font-weight:800;">SCORE: ${score}</span>`;
        snakeBtn.innerText = "REBOOT VECTOR";

        // Global Game Over Hook for games-main.js Interceptor
        if (typeof window.handleGameOver === 'function') {
            window.handleGameOver(score >= 50 ? 'win' : (score > 0 ? 'draw' : 'lose'));
        }
    }

    snakeBtn.onclick = bootSequence;

    window.snakeCancelRef = () => {
        gameRunning = false;
        clearTimeout(gameLoopTimeout);
        window.removeEventListener('keydown', handleKeyDown);
    };
}

function exitSnakeGame() {
    if (typeof window.snakeCancelRef === 'function') window.snakeCancelRef();
    if (typeof openChronoxGamesHub === 'function') openChronoxGamesHub();
}
