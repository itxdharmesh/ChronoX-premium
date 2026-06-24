// js/games/neondrift.js

function startNeonDrift() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Pure Canvas Architecture with zero external HTML dependencies
    c.innerHTML = `
        <div id="ndContainer" style="position:relative; width:100%; height:100%; min-height: 500px; height: calc(100vh - 120px); overflow:hidden; background: #050711; touch-action: none;">
            <canvas id="ndCanvas" style="display:block; width:100%; height:100%; cursor:crosshair;"></canvas>
            <button id="ndExitBtn" style="position:absolute; bottom:20px; right:20px; background:rgba(255, 0, 110, 0.15); border:1px solid #ff006e; color:#ff006e; padding:8px 16px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; font-family:'Poppins',sans-serif; letter-spacing:1px; box-shadow: 0 0 10px rgba(255, 0, 110, 0.2);">ABORT SYSTEM</button>
        </div>
    `;

    const canvas = document.getElementById('ndCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('ndContainer');
    const ndExitBtn = document.getElementById('ndExitBtn');

    canvas.width = container.clientWidth || window.innerWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 120);

    // States: 'MENU', 'PLAYING', 'GAME_OVER'
    let gameState = 'MENU';
    let score = 0;
    let highscore = 0;
    let animationId = null;

    // Cyber Player Car Object
    let car = {
        x: canvas.width / 2,
        y: canvas.height - 80,
        width: 36,
        height: 55,
        targetX: canvas.width / 2,
        speed: 0.15, // Smooth lerp transition factor
        color: '#00f5d4' // Neon Teal
    };

    // Game Arrays
    let obstacles = [];
    let particles = [];
    let gridOffset = 0;
    let baseSpeed = 4;
    let lastSpawnTime = 0;

    function resetGame() {
        score = 0;
        baseSpeed = 4;
        obstacles = [];
        particles = [];
        car.x = canvas.width / 2;
        car.targetX = canvas.width / 2;
        lastSpawnTime = window.performance.now();
    }

    function spawnObstacle() {
        let size = Math.random() * 20 + 25; // Random size block
        let lanes = [
            canvas.width * 0.2,
            canvas.width * 0.4,
            canvas.width * 0.6,
            canvas.width * 0.8
        ];
        // Dynamic random positioning across layout widths
        let spawnX = lanes[Math.floor(Math.random() * lanes.length)] + (Math.random() * 40 - 20);

        obstacles.push({
            x: spawnX,
            y: -50,
            w: size,
            h: size,
            speed: baseSpeed + (Math.random() * 1.5),
            color: Math.random() > 0.5 ? '#ff006e' : '#7b2cbf' // Neon Pink or Purple
        });
    }

    function createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 4 + 2;
            particles.push({
                x, y,
                radius: Math.random() * 2.5 + 1,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.02,
                color
            });
        }
    }

    // Capture User Target Controls (Both mouse and touch maps)
    function handleMovement(e) {
        if (e.cancelable) e.preventDefault();
        let rect = canvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        car.targetX = clientX - rect.left;

        // Keep inside canvas bounds securely
        if (car.targetX < car.width) car.targetX = car.width;
        if (car.targetX > canvas.width - car.width) car.targetX = canvas.width - car.width;
    }

    canvas.addEventListener('mousemove', handleMovement);
    canvas.addEventListener('touchmove', handleMovement, { passive: false });

    // Click handler mapping to change core status machine
    canvas.addEventListener('click', () => {
        if (gameState === 'MENU') {
            resetGame();
            gameState = 'PLAYING';
        } else if (gameState === 'GAME_OVER') {
            resetGame();
            gameState = 'PLAYING';
        }
    });

    // Physics Update Logic Frame Loop
    function updateEngine(currentTime) {
        if (gameState === 'PLAYING') {
            // Smooth Car Move Lerp interpolation
            car.x += (car.targetX - car.x) * car.speed;

            // Scroll Neon Draft lines
            gridOffset = (gridOffset + baseSpeed) % 40;

            // Step up difficulty curve dynamically
            baseSpeed += 0.001;
            score += 1;

            // Spawn Obstacles over ticking window
            if (currentTime - lastSpawnTime > Math.max(600, 1200 - baseSpeed * 50)) {
                spawnObstacle();
                lastSpawnTime = currentTime;
            }

            // Move & Check Obstacles collisions
            for (let i = obstacles.length - 1; i >= 0; i--) {
                let o = obstacles[i];
                o.y += o.speed;

                // Simple strict AABB Box collision scanner
                if (car.x - car.width/2 < o.x + o.w &&
                    car.x + car.width/2 > o.x &&
                    car.y < o.y + o.h &&
                    car.y + car.height > o.y) {
                    
                    // COLLISION IMPACT CRASH BREAKPOINT DETECTED
                    createExplosion(car.x, car.y, car.color);
                    createExplosion(o.x + o.w/2, o.y + o.h/2, o.color);
                    if (score > highscore) highscore = score;
                    gameState = 'GAME_OVER';
                    return;
                }

                // Remove offscreen objects
                if (o.y > canvas.height + 50) {
                    obstacles.splice(i, 1);
                }
            }
        }

        // De-spawn fade trail particles particles
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.dx; p.y += p.dy; p.alpha -= p.decay;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    // Draw Neon Horizon Perspective Draft Grid
    function drawNeonGrid() {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 245, 212, 0.06)'; // Subtle Neon Blue/Green lines
        ctx.lineWidth = 1;

        // Draw Perspective vertical grids vanishing lines
        let centerPointX = canvas.width / 2;
        for (let x = -200; x <= canvas.width + 200; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(centerPointX + (x - centerPointX) * 2, canvas.height);
            ctx.stroke();
        }

        // Draw Horizontal scrolling lanes lines
        let offset = gameState === 'PLAYING' ? gridOffset : 0;
        for (let y = offset; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Master Render Engine Loop Screen Drawings
    function drawPipeline() {
        // Deep space viewport background clear
        ctx.fillStyle = '#050711';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        drawNeonGrid();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (gameState === 'MENU') {
            // Neon Draft Main Header
            ctx.save();
            ctx.shadowBlur = 20; ctx.shadowColor = '#00f5d4';
            ctx.fillStyle = '#00f5d4'; ctx.font = '900 36px "Poppins", sans-serif';
            ctx.fillText('NEON DRIFT', canvas.width / 2, canvas.height / 2 - 40);
            ctx.restore();

            ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '500 12px "Poppins"';
            ctx.fillText('SLIDE / SWIPE TO DRIFT GLOW CAR', canvas.width / 2, canvas.height / 2 + 5);

            let pulse = 1 + Math.sin(window.performance.now() * 0.006) * 0.04;
            ctx.save(); ctx.translate(canvas.width / 2, canvas.height / 2 + 75); ctx.scale(pulse, pulse);
            ctx.fillStyle = '#7b2cbf'; ctx.shadowBlur = 15; ctx.shadowColor = '#7b2cbf';
            ctx.beginPath(); ctx.roundRect(-85, -20, 170, 40, 12); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.font = '800 12px "Poppins"'; ctx.fillText('INITIALIZE ENGINE', 0, 0);
            ctx.restore();

        } else if (gameState === 'PLAYING') {
            // Draw Player Glow Neon Racing Car
            ctx.save();
            ctx.shadowBlur = 15; ctx.shadowColor = car.color;
            ctx.fillStyle = car.color;
            ctx.beginPath();
            ctx.roundRect(car.x - car.width/2, car.y, car.width, car.height, 8);
            ctx.fill();
            
            // Cockpit glass decal
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(car.x - 10, car.y + 12, 20, 15, 4);
            ctx.fill();
            ctx.restore();

            // Draw Obstacles Cyber Blocks
            obstacles.forEach(o => {
                ctx.save();
                ctx.shadowBlur = 12; ctx.shadowColor = o.color;
                ctx.fillStyle = o.color;
                ctx.beginPath();
                ctx.roundRect(o.x, o.y, o.w, o.h, 6);
                ctx.fill();
                ctx.restore();
            });

            // Scoring HUD telemetry text Layer
            ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '900 14px "Poppins"';
            ctx.fillText(`SCORE: ${score}`, 25, 35);

        } else if (gameState === 'GAME_OVER') {
            ctx.save();
            ctx.shadowBlur = 20; ctx.shadowColor = '#ff006e';
            ctx.fillStyle = '#ff006e'; ctx.font = '900 36px "Poppins"';
            ctx.fillText('ENGINE CRASH', canvas.width / 2, canvas.height / 2 - 50);
            ctx.restore();

            ctx.fillStyle = '#ffffff'; ctx.font = '600 15px "Poppins"';
            ctx.fillText(`DRIFT DISTANCE: ${score}`, canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '500 13px "Poppins"';
            ctx.fillText(`RECORD MAXIMUM: ${highscore}`, canvas.width / 2, canvas.height / 2 + 25);

            ctx.fillStyle = '#00f5d4'; ctx.font = '800 12px "Poppins"';
            ctx.fillText('TAP SCREEN TO RE-BOOT IGNITION CORE', canvas.width / 2, canvas.height - 120);
        }

        // Draw particle blast pieces
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });
    }

    // Core Animation Request Dispatcher Tick Loop
    function primaryLoop(timestamp) {
        updateEngine(timestamp);
        drawPipeline();
        animationId = requestAnimationFrame(primaryLoop);
    }

    animationId = requestAnimationFrame(primaryLoop);

    // Module Route Destructor Kill Switch
    window.ndCancelRef = () => {
        cancelAnimationFrame(animationId);
    };

    ndExitBtn.onclick = function() {
        if (typeof window.ndCancelRef === 'function') window.ndCancelRef();
        if (typeof openGames === 'function') openGames();
    };
}
