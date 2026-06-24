// js/games/cyberninja.js

function startCyberNinja() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Direct innerHTML block inject kar rahe hain with fixed full container bounds
    c.innerHTML = `
        <div id="cnContainer" style="position:relative; width:100%; height:100%; min-height: 500px; height: calc(100vh - 120px); overflow:hidden; background: #09061a; font-family: 'Poppins', sans-serif; user-select:none; -webkit-user-select:none;">
            
            <div style="position:absolute; top:15px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:10; pointer-events:none;">
                <div style="background: rgba(6, 9, 25, 0.85); border: 1px solid rgba(124, 58, 237, 0.4); padding: 6px 14px; border-radius: 10px; backdrop-filter: blur(8px);">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">METERS RUN</span>
                    <span id="cnScore" style="color:#7C3AED; font-weight:900; font-size:16px; text-shadow: 0 0 10px #7C3AED;">0000m</span>
                </div>
                <div style="background: rgba(6, 9, 25, 0.85); border: 1px solid rgba(212, 175, 55, 0.3); padding: 6px 14px; border-radius: 10px; backdrop-filter: blur(8px);">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">MULTIPLIER</span>
                    <span id="cnMultiplier" style="color:#D4AF37; font-weight:800; font-size:14px;">1.0x</span>
                </div>
            </div>

            <canvas id="cnCanvas" style="display:block; width:100%; height:100%; position:absolute; top:0; left:0; z-index:1; background:#09061a;"></canvas>
            
            <div id="cnTouchZone" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:5; cursor:pointer; display:none;"></div>

            <button id="cnExitBtn" style="position:absolute; bottom:20px; right:20px; background:rgba(255,71,87,0.2); border:1px solid rgba(255,71,87,0.5); color:#ff4757; padding:8px 16px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; backdrop-filter:blur(5px); letter-spacing:1px; display:block;">ABORT RUN</button>

            <div id="cnScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: rgba(15, 10, 35, 0.95); border:1px solid rgba(124, 58, 237, 0.4); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); padding:35px 25px; border-radius:24px; text-align:center; width:88%; max-width:340px; box-shadow:0 20px 60px rgba(0,0,0,0.8); z-index:20; display:block;">
                <div style="width:60px; height:60px; background: rgba(124,58,237,0.2); border: 2px solid #7C3AED; border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:28px;">🥷</div>
                <h1 style="font-size:22px; font-weight:900; letter-spacing:2px; color:#fff; margin-bottom:5px; text-transform:uppercase;">CYBER NINJA</h1>
                <p id="cnSub" style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:25px; letter-spacing:1px; line-height:1.5;">NEON REACTION RUNNER <br><span style="color:#7C3AED;">TAP ANYWHERE TO JUMP</span></p>
                <button id="cnBtn" style="background:linear-gradient(135deg,#7C3AED, #FF4757); border:none; padding:14px 30px; font-size:13px; font-weight:800; color:#fff; border-radius:12px; cursor:pointer; text-transform:uppercase; letter-spacing:1px; width:100%; box-shadow: 0 5px 15px rgba(124,58,237,0.4);">JACK INTO GRID</button>
            </div>
        </div>
    `;

    // Grabbing references from newly injected HTML content
    const canvas = document.getElementById('cnCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('cnContainer');
    const touchZone = document.getElementById('cnTouchZone');
    const cnScreen = document.getElementById('cnScreen');
    const cnSub = document.getElementById('cnSub');
    const cnBtn = document.getElementById('cnBtn');
    const cnExitBtn = document.getElementById('cnExitBtn');
    const cnScore = document.getElementById('cnScore');
    const cnMultiplier = document.getElementById('cnMultiplier');

    // Force strict dimensions sync on the layout viewport bounding boxes
    canvas.width = container.clientWidth || window.innerWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 120);

    let score = 0, speedMultiplier = 1.0, gameRunning = false, animationId = null;
    let obstacles = [], particles = [], ninjaTrails = [], gridLines = [];
    let frameCount = 0, screenShake = 0;

    const gravity = 0.6;
    const floorY = canvas.height - 120;

    const ninja = {
        x: 60,
        y: floorY - 32,
        width: 24,
        height: 32,
        dy: 0,
        jumpForce: -11,
        isJumping: false,
        jumpCount: 0,
        rotation: 0
    };

    // Construct perspective coordinates vector mappings
    for (let i = 0; i < canvas.width; i += 45) {
        gridLines.push({ startX: i, endX: i * 1.4 - (canvas.width * 0.2) });
    }

    // Jump Physics Core Mechanism Hook
    function executeJump(e) {
        if (!gameRunning) return;
        if (e && e.preventDefault) e.preventDefault();

        if (ninja.jumpCount < 2) {
            ninja.dy = ninja.jumpForce;
            ninja.isJumping = true;
            ninja.jumpCount++;
            screenShake = 1.0;
            spawnExplosion(ninja.x + ninja.width / 2, ninja.y + ninja.height, '#7C3AED', 8);
        }
    }

    // Capture standard control triggers on the tracking overlay
    touchZone.addEventListener('touchstart', executeJump, { passive: false });
    touchZone.addEventListener('mousedown', executeJump);
    
    const globalKeyHandler = (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') executeJump(e);
    };
    window.addEventListener('keydown', globalKeyHandler);

    function spawnExplosion(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 4 + 1;
            particles.push({
                x, y,
                radius: Math.random() * 2 + 1,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.02,
                color
            });
        }
    }

    function updateGameLogic() {
        frameCount++;
        score += 0.15 * speedMultiplier;
        cnScore.innerText = Math.floor(score) + "m";

        if (frameCount % 400 === 0 && speedMultiplier < 2.5) {
            speedMultiplier += 0.15;
            cnMultiplier.innerText = speedMultiplier.toFixed(1) + "x";
        }

        if (screenShake > 0) screenShake -= 0.05;

        ninja.dy += gravity;
        ninja.y += ninja.dy;

        if (ninja.y >= floorY - ninja.height) {
            ninja.y = floorY - ninja.height;
            ninja.dy = 0;
            ninja.isJumping = false;
            ninja.jumpCount = 0;
            ninja.rotation = 0;
        }

        if (ninja.isJumping) {
            ninja.rotation += 0.12;
        }

        if (frameCount % 3 === 0) {
            ninjaTrails.push({ x: ninja.x, y: ninja.y, rot: ninja.rotation });
            if (ninjaTrails.length > 5) ninjaTrails.shift();
        }

        let baseSpawnRate = Math.max(40, 80 - Math.floor(speedMultiplier * 12));
        if (frameCount % baseSpawnRate === 0) {
            let obsType = Math.random() > 0.4 ? 'ground' : 'air';
            if (obsType === 'ground') {
                obstacles.push({
                    type: 'ground',
                    x: canvas.width + 30,
                    y: floorY - 24,
                    width: 18,
                    height: 24,
                    color: '#FF4757'
                });
            } else {
                obstacles.push({
                    type: 'air',
                    x: canvas.width + 30,
                    y: floorY - 60,
                    width: 20,
                    height: 14,
                    color: '#00D4FF'
                });
            }
        }

        let currentVelocity = 5 * speedMultiplier;
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let o = obstacles[i];
            o.x -= currentVelocity;

            if (o.x < -40) {
                obstacles.splice(i, 1);
                continue;
            }

            // Box Intersection Collision Metric check
            if (ninja.x < o.x + o.width && ninja.x + ninja.width > o.x &&
                ninja.y < o.y + o.height && ninja.y + ninja.height > o.y) {
                
                spawnExplosion(ninja.x + ninja.width/2, ninja.y + ninja.height/2, '#FF4757', 25);
                screenShake = 3.0;
                handleGameOver();
                return;
            }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.dx; p.y += p.dy; p.alpha -= p.decay;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    function drawRenderPipeline() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        if (screenShake > 0) {
            ctx.translate((Math.random() - 0.5) * screenShake * 5, (Math.random() - 0.5) * screenShake * 5);
        }

        // Draw Perspective Horizon floor grid elements
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.15)';
        ctx.lineWidth = 1;
        gridLines.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line.startX, floorY);
            ctx.lineTo(line.endX, canvas.height);
            ctx.stroke();
        });

        // Glowing Neon Boundary Baseline
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#7C3AED';
        ctx.strokeStyle = '#7C3AED';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, floorY);
        ctx.lineTo(canvas.width, floorY);
        ctx.stroke();
        ctx.restore();

        // Phantom Motion Trails
        ninjaTrails.forEach((t, i) => {
            ctx.save();
            ctx.globalAlpha = (i / ninjaTrails.length) * 0.2;
            ctx.fillStyle = '#7C3AED';
            ctx.translate(t.x + ninja.width/2, t.y + ninja.height/2);
            ctx.rotate(t.rot);
            ctx.fillRect(-ninja.width/2, -ninja.height/2, ninja.width, ninja.height);
            ctx.restore();
        });

        // Obstacles Layer Vector Maps
        obstacles.forEach(o => {
            ctx.save();
            ctx.shadowBlur = 12;
            ctx.shadowColor = o.color;
            ctx.fillStyle = o.color;

            if (o.type === 'ground') {
                ctx.beginPath();
                ctx.moveTo(o.x, o.y + o.height);
                ctx.lineTo(o.x + o.width / 2, o.y);
                ctx.lineTo(o.x + o.width, o.y + o.height);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.roundRect(o.x, o.y, o.width, o.height, 4);
                ctx.fill();
            }
            ctx.restore();
        });

        // The Cyber Ninja Vector Character Model
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#7C3AED';
        ctx.translate(ninja.x + ninja.width / 2, ninja.y + ninja.height / 2);
        ctx.rotate(ninja.rotation);
        
        let grad = ctx.createLinearGradient(-ninja.width/2, -ninja.height/2, ninja.width/2, ninja.height/2);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#7C3AED');
        ctx.fillStyle = grad;
        
        ctx.beginPath();
        ctx.roundRect(-ninja.width / 2, -ninja.height / 2, ninja.width, ninja.height, 5);
        ctx.fill();

        // Laser Slit Scan Cyan Visor Line
        ctx.fillStyle = '#00D4FF';
        ctx.fillRect(0, -8, ninja.width/2, 3);
        ctx.restore();

        // Explosive Vector Micro Particle Shaders
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        ctx.restore();
    }

    function coreEngineLoop() {
        if (!gameRunning) return;
        updateGameLogic();
        drawRenderPipeline();
        animationId = requestAnimationFrame(coreEngineLoop);
    }

    function bootSequence() {
        // Toggle absolute UI displays clean layers swap
        cnScreen.style.display = 'none';
        touchZone.style.display = 'block';

        score = 0; speedMultiplier = 1.0; obstacles = []; particles = []; ninjaTrails = [];
        cnScore.innerText = "0000m";
        cnMultiplier.innerText = "1.0x";
        ninja.y = floorY - ninja.height;
        ninja.dy = 0;
        ninja.jumpCount = 0;
        ninja.isJumping = false;

        gameRunning = true;
        coreEngineLoop();
    }

    function handleGameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        
        // Return visibility back to menu panels overlay layers
        touchZone.style.display = 'none';
        cnScreen.style.display = 'block';
        
        cnSub.innerHTML = `NEON SYSTEM CRASHED! <br><span style="color:#FF4757; font-weight:900; font-size:14px;">RECORD: ${Math.floor(score)}m</span>`;
        cnBtn.innerText = "RE-INITIALIZE RUN";
    }

    // Attach click events on middle overlay play controls safely 
    cnBtn.onclick = bootSequence;

    // Clean tracking instance handles safely during global back routes redirection
    window.cnCancelRef = () => {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        window.removeEventListener('keydown', globalKeyHandler);
    };

    // Return to Main Menu Router link implementation
    cnExitBtn.onclick = function() {
        if (typeof window.cnCancelRef === 'function') window.cnCancelRef();
        if (typeof openGames === 'function') openGames(); // Calls your dynamic global router engine safely
    };
}
