// js/games/cyberninja.js

function startCyberNinja() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Premium UI Overlays with Glassmorphism & Cyber Neon Accents
    c.innerHTML = `
        <div id="cnContainer" style="position:relative; width:100%; height:100%; min-height: calc(100vh - 160px); overflow:hidden; background: linear-gradient(180deg, #09061a 0%, #03020a 100%); font-family: 'Poppins', sans-serif;">
            
            <div style="position:absolute; top:15px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:10; pointer-events:none;">
                <div style="background: rgba(6, 9, 25, 0.75); border: 1px solid rgba(124, 58, 237, 0.4); padding: 6px 14px; border-radius: 10px; backdrop-filter: blur(8px); box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">METERS RUN</span>
                    <span id="cnScore" style="color:#7C3AED; font-weight:900; font-size:18px; text-shadow: 0 0 10px #7C3AED;">0000m</span>
                </div>
                <div style="background: rgba(6, 9, 25, 0.75); border: 1px solid rgba(212, 175, 55, 0.3); padding: 6px 14px; border-radius: 10px; backdrop-filter: blur(8px); box-shadow: 0 0 15px rgba(212, 175, 55, 0.15);">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">MULTIPLIER</span>
                    <span id="cnMultiplier" style="color:#D4AF37; font-weight:800; font-size:16px;">1.0x</span>
                </div>
            </div>

            <canvas id="cnCanvas" style="display:block; width:100%; height:100%;"></canvas>
            
            <div id="cnTouchZone" style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:5; cursor:pointer;"></div>

            <button onclick="exitCyberNinja()" style="position:absolute; bottom:85px; right:20px; background:rgba(255,71,87,0.1); border:1px solid rgba(255,71,87,0.4); color:#ff4757; padding:8px 16px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; backdrop-filter:blur(5px); letter-spacing:1px;">ABORT NEON RUN</button>

            <div id="cnScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: linear-gradient(135deg, rgba(20, 10, 45, 0.85) 0%, rgba(5, 3, 15, 0.95) 100%); border:1px solid rgba(124, 58, 237, 0.3); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); padding:40px 30px; border-radius:24px; text-align:center; width:88%; max-width:345px; box-shadow:0 30px 80px rgba(0,0,0,0.8); z-index:20; transition:0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="width:65px; height:65px; background: rgba(124,58,237,0.15); border: 2px solid #7C3AED; border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:32px; box-shadow: 0 0 20px rgba(124,58,237,0.3);">🥷</div>
                <h1 style="font-size:24px; font-weight:900; letter-spacing:3px; background:linear-gradient(135deg,#7C3AED, #FF4757); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:8px; text-transform:uppercase;">CYBER NINJA</h1>
                <p id="cnSub" style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:30px; letter-spacing:1px; line-height:1.6;">NEON ARCADE VECTOR RUNNER <br><span style="color:#FF4757; font-weight:bold;">TAP / SPACE TO DOUBLE JUMP</span></p>
                <button id="cnBtn" style="background:linear-gradient(135deg,#7C3AED, #FF4757); border:none; padding:14px 35px; font-size:13px; font-weight:800; color:#fff; border-radius:14px; cursor:pointer; text-transform:uppercase; letter-spacing:2px; box-shadow:0 10px 25px rgba(124,58,237,0.4); width:100%;">JACK INTO GRID</button>
            </div>
        </div>
    `;

    const canvas = document.getElementById('cnCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('cnContainer');
    const touchZone = document.getElementById('cnTouchZone');
    const cnScreen = document.getElementById('cnScreen');
    const cnSub = document.getElementById('cnSub');
    const cnBtn = document.getElementById('cnBtn');
    const cnScore = document.getElementById('cnScore');
    const cnMultiplier = document.getElementById('cnMultiplier');

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 160);

    let score = 0, speedMultiplier = 1.0, gameRunning = false, animationId = null;
    let obstacles = [], particles = [], ninjaTrails = [], gridLines = [];
    let frameCount = 0, screenShake = 0;

    const gravity = 0.6;
    const floorY = canvas.height - 120;

    // Hero Object Settings
    const ninja = {
        x: 60,
        y: floorY - 30,
        width: 24,
        height: 32,
        dy: 0,
        jumpForce: -11,
        isJumping: false,
        jumpCount: 0,
        rotation: 0
    };

    // Build Cyberpunk Grid Lines
    for (let i = 0; i < canvas.width; i += 40) {
        gridLines.push({ startX: i, endX: i * 1.5 - (canvas.width * 0.25) });
    }

    // Input Trigger Mapping (Both Mobile Screen Tap and Desktop Space/Up Arrow)
    function executeJump(e) {
        if (!gameRunning) return;
        if (e.preventDefault) e.preventDefault();

        if (ninja.jumpCount < 2) {
            ninja.dy = ninja.jumpForce;
            ninja.isJumping = true;
            ninja.jumpCount++;
            screenShake = 0.8;
            
            // Spawn Flash Particle at point of jump thrust
            spawnExplosion(ninja.x + ninja.width/2, ninja.y + ninja.height, '#7C3AED', 8);
        }
    }

    touchZone.addEventListener('touchstart', executeJump, { passive: false });
    touchZone.addEventListener('mousedown', executeJump);
    
    const globalKeyHandler = (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') executeJump(e);
    };
    window.addEventListener('keydown', globalKeyHandler);

    function spawnExplosion(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 4 + 1;
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

    function updateGameLogic() {
        frameCount++;
        score += 0.2 * speedMultiplier;
        cnScore.innerText = Math.floor(score) + "m";

        // Dynamic difficulty scalar
        if (frameCount % 400 === 0 && speedMultiplier < 2.5) {
            speedMultiplier += 0.15;
            cnMultiplier.innerText = speedMultiplier.toFixed(1) + "x";
            spawnExplosion(canvas.width / 2, 40, '#D4AF37', 20);
        }

        if (screenShake > 0) screenShake -= 0.05;

        // Gravity Physics on Ninja
        ninja.dy += gravity;
        ninja.y += ninja.dy;

        // Ground Collision
        if (ninja.y >= floorY - ninja.height) {
            ninja.y = floorY - ninja.height;
            ninja.dy = 0;
            ninja.isJumping = false;
            ninja.jumpCount = 0;
            ninja.rotation = 0;
        }

        // Active Spin rotation during flight jump actions
        if (ninja.isJumping) {
            ninja.rotation += 0.15;
        }

        // Store Running Trails for Cyber Aesthetic
        if (frameCount % 3 === 0) {
            ninjaTrails.push({ x: ninja.x, y: ninja.y, rot: ninja.rotation });
            if (ninjaTrails.length > 6) ninjaTrails.shift();
        }

        // Spawning Obstacles procedurally (Sentries / Low Barricades)
        let baseSpawnRate = Math.max(45, 90 - Math.floor(speedMultiplier * 15));
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
                    y: floorY - 65,
                    width: 22,
                    height: 14,
                    color: '#00D4FF',
                    pulse: 0
                });
            }
        }

        // Loop Through Obstacles
        let currentGameSpeed = 4.5 * speedMultiplier;
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let o = obstacles[i];
            o.x -= currentGameSpeed;

            if (o.x < -40) {
                obstacles.splice(i, 1);
                continue;
            }

            // High Precision Box-to-Box Intersection Hitbox Collision 
            if (ninja.x < o.x + o.width && ninja.x + ninja.width > o.x &&
                ninja.y < o.y + o.height && ninja.y + ninja.height > o.y) {
                
                spawnExplosion(ninja.x + ninja.width/2, ninja.y + ninja.height/2, '#FF4757', 30);
                screenShake = 3.5;
                handleGameOver();
                return;
            }
        }

        // Process Vectors Decay inside Particle Engine
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
            ctx.translate((Math.random() - 0.5) * screenShake * 6, (Math.random() - 0.5) * screenShake * 6);
        }

        // 1. Draw Synthwave Perspective Neon Floor Grid
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.15)';
        ctx.lineWidth = 1.5;
        gridLines.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line.startX, floorY);
            ctx.lineTo(line.endX, canvas.height);
            ctx.stroke();
        });

        // Horizontal Horizon boundary line
        ctx.strokeStyle = '#7C3AED';
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#7C3AED';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, floorY);
        ctx.lineTo(canvas.width, floorY);
        ctx.stroke();
        ctx.restore();

        // 2. Ninja Back Trails (Glow Effect Matrix)
        ninjaTrails.forEach((t, i) => {
            ctx.save();
            ctx.globalAlpha = (i / ninjaTrails.length) * 0.25;
            ctx.fillStyle = '#7C3AED';
            ctx.translate(t.x + ninja.width/2, t.y + ninja.height/2);
            ctx.rotate(t.rot);
            ctx.fillRect(-ninja.width/2, -ninja.height/2, ninja.width, ninja.height);
            ctx.restore();
        });

        // 3. Render Cyber Obstacles with specific Vector Shaders
        obstacles.forEach(o => {
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = o.color;
            ctx.fillStyle = o.color;

            if (o.type === 'ground') {
                // Sharp Laser Spike Triangle Geometry
                ctx.beginPath();
                ctx.moveTo(o.x, o.y + o.height);
                ctx.lineTo(o.x + o.width / 2, o.y);
                ctx.lineTo(o.x + o.width, o.y + o.height);
                ctx.closePath();
                ctx.fill();
            } else {
                // Flying Drone Rectangle Sentry Shape
                ctx.beginPath();
                ctx.roundRect(o.x, o.y, o.width, o.height, 4);
                ctx.fill();
                // Drone Laser center eye
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(o.x + o.width/2, o.y + o.height/2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });

        // 4. Draw Core Glowing Cyber Ninja Player Model
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#7C3AED';
        
        ctx.translate(ninja.x + ninja.width / 2, ninja.y + ninja.height / 2);
        ctx.rotate(ninja.rotation);
        
        // Dynamic Neon Gradient mapping for Ninja Core Box
        let ninjaGrad = ctx.createLinearGradient(-ninja.width/2, -ninja.height/2, ninja.width/2, ninja.height/2);
        ninjaGrad.addColorStop(0, '#ffffff');
        ninjaGrad.addColorStop(0.6, '#7C3AED');
        ninjaGrad.addColorStop(1, '#FF4757');
        ctx.fillStyle = ninjaGrad;
        
        ctx.beginPath();
        ctx.roundRect(-ninja.width / 2, -ninja.height / 2, ninja.width, ninja.height, 6);
        ctx.fill();

        // Neon Glowing Eye Band visor slit
        ctx.fillStyle = '#00D4FF';
        ctx.shadowColor = '#00D4FF';
        ctx.fillRect(0, -ninja.height/4, ninja.width/2, 4);

        ctx.restore();

        // 5. Draw Explosion Particles 
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
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
        cnScreen.style.opacity = '0';
        cnScreen.style.visibility = 'hidden';
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
        cnScreen.style.opacity = '1';
        cnScreen.style.visibility = 'visible';
        cnSub.innerHTML = `NEON RUN TERMINATED! <br><span style="color:#FF4757; font-weight:900; font-size:15px; text-shadow:0 0 8px #FF4757;">DISTANCE: ${Math.floor(score)}m</span>`;
        cnBtn.innerText = "RE-JACK INTO GRID";
    }

    cnBtn.onclick = bootSequence;
    
    // Store reference to close cleanup accurately on menu exits
    window.cnCancelRef = () => {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        window.removeEventListener('keydown', globalKeyHandler);
    };
}

function exitCyberNinja() {
    if (typeof window.cnCancelRef === 'function') window.cnCancelRef();
    if (typeof openGames === 'function') openGames();
}
