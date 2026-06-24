// js/games/flappybird.js

function startFlappyBird() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Premium UI Architecture with Glassmorphism Overlays
    c.innerHTML = `
        <div id="fbContainer" style="position:relative; width:100%; height:100%; min-height: calc(100vh - 160px); overflow:hidden; background: radial-gradient(circle at center, #0e0926 0%, #03040f 100%); font-family: 'Poppins', sans-serif; user-select:none; -webkit-user-select:none;">
            
            <!-- Cyber Telemetry Dashboard Layer -->
            <div style="position:absolute; top:15px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:10; pointer-events:none;">
                <div style="background: rgba(4, 6, 20, 0.8); border: 1px solid rgba(255, 0, 110, 0.4); padding: 10px 20px; border-radius: 14px; backdrop-filter: blur(12px); box-shadow: 0 0 20px rgba(255, 0, 110, 0.2);">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:2px; font-weight:700;">NODES BREACHED</span>
                    <span id="fbScore" style="color:#ff006e; font-weight:900; font-size:22px; text-shadow: 0 0 12px #ff006e;">0000</span>
                </div>
                <div style="background: rgba(4, 6, 20, 0.8); border: 1px solid rgba(0, 245, 212, 0.4); padding: 10px 20px; border-radius: 14px; backdrop-filter: blur(12px); box-shadow: 0 0 20px rgba(0, 245, 212, 0.2); width: 140px;">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:2px; font-weight:700;">MATRIX COMPLIANCE</span>
                    <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; margin-top:8px; overflow:hidden;">
                        <div id="fbAltitudeBar" style="width:50%; height:100%; background: linear-gradient(90deg, #00f5d4, #00bbf9); box-shadow: 0 0 10px #00f5d4;"></div>
                    </div>
                </div>
            </div>

            <!-- Core Render Engine Canvas -->
            <canvas id="fbCanvas" style="display:block; width:100%; height:100%;"></canvas>
            
            <!-- Emergency Override Kill Switch -->
            <button onclick="exitFlappyBird()" style="position:absolute; bottom:85px; right:20px; background:rgba(255, 0, 110, 0.1); border:1px solid rgba(255, 0, 110, 0.5); color:#ff006e; padding:10px 20px; border-radius:14px; font-size:11px; font-weight:800; cursor:pointer; z-index:10; backdrop-filter:blur(6px); letter-spacing:1.5px; transition: 0.3s; box-shadow: 0 0 10px rgba(255, 0, 110, 0.15);">DISENGAGE DRIVE</button>

            <!-- Holographic UI Display Panel -->
            <div id="fbScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: linear-gradient(135deg, rgba(17, 11, 41, 0.9) 0%, rgba(5, 6, 18, 0.98) 100%); border:1px solid rgba(0, 245, 212, 0.3); backdrop-filter:blur(30px); -webkit-backdrop-filter:blur(30px); padding:45px 35px; border-radius:28px; text-align:center; width:90%; max-width:360px; box-shadow:0 35px 80px rgba(0,0,0,0.9), inset 0 0 40px rgba(0,245,212,0.05); z-index:20; transition:0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="width:75px; height:75px; background: rgba(0,245,212,0.1); border: 2px dashed #00f5d4; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 25px; box-shadow: 0 0 25px rgba(0,245,212,0.25); animation: spinMatrix 16s linear infinite;">🛸</div>
                <h1 style="font-size:26px; font-weight:900; letter-spacing:5px; background:linear-gradient(135deg, #00f5d4 0%, #ff006e 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:10px; text-transform:uppercase; text-shadow: 0 0 20px rgba(0,245,212,0.15);">CYBER THRUST</h1>
                <p id="fbSub" style="font-size:11px; color:rgba(255,255,255,0.55); margin-bottom:35px; letter-spacing:1px; line-height:1.7;">QUANTUM GRAVITY REVERSE INJECTOR <br><span style="color:#00f5d4; font-weight:700;">PREMIUM ARCADE CORE READY</span></p>
                <button id="fbBtn" style="background:linear-gradient(135deg,#00f5d4, #ff006e); border:none; padding:15px 40px; font-size:13px; font-weight:900; color:#040614; border-radius:16px; cursor:pointer; text-transform:uppercase; letter-spacing:2px; box-shadow:0 12px 30px rgba(0,245,212,0.35); width:100%; transition: 0.2s;">INITIALIZE THRUSTERS</button>
            </div>
        </div>
        <style>@keyframes spinMatrix{100%{transform:rotate(360deg);}}</style>
    `;

    const canvas = document.getElementById('fbCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('fbContainer');
    const fbScreen = document.getElementById('fbScreen');
    const fbSub = document.getElementById('fbSub');
    const fbBtn = document.getElementById('fbBtn');
    const fbScore = document.getElementById('fbScore');
    const fbAltitudeBar = document.getElementById('fbAltitudeBar');

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 160);

    // Physics Constants & Tracking Arrays
    let score = 0, gameRunning = false, animationId = null;
    let obstacles = [], particles = [], starfield = [];
    let frameCount = 0, screenShake = 0, backgroundGridScroll = 0;

    const gravity = 0.28;
    const jumpVelocity = -6.2;

    const player = {
        x: canvas.width * 0.28,
        y: canvas.height / 2,
        velocity: 0,
        width: 42,
        height: 24,
        tilt: 0
    };

    // Deep Space Cosmic Matrix Generation
    for (let i = 0; i < 45; i++) {
        starfield.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.6 + 0.3
        });
    }

    function droneThrustAction(e) {
        if (!gameRunning) return;
        if (e && e.cancelable) e.preventDefault();
        
        player.velocity = jumpVelocity;
        
        // Spawn Real-Time Plasma Ignition Thrust Sparks
        for (let i = 0; i < 8; i++) {
            particles.push({
                x: player.x - 20,
                y: player.y + (Math.random() - 0.5) * 8,
                radius: Math.random() * 3.5 + 1,
                dx: -(Math.random() * 5 + 3),
                dy: (Math.random() - 0.5) * 4,
                alpha: 1,
                decay: Math.random() * 0.05 + 0.03,
                color: '#00f5d4'
            });
        }
    }

    // Capture Input Interceptors
    window.addEventListener('keydown', (e) => { if (e.code === 'Space') droneThrustAction(e); });
    container.addEventListener('mousedown', droneThrustAction);
    container.addEventListener('touchstart', droneThrustAction, { passive: false });

    function createExplosionBurst(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 6 + 2;
            particles.push({
                x, y,
                radius: Math.random() * 3 + 1,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.015,
                color
            });
        }
    }

    function updateGameLogic() {
        frameCount++;

        if (screenShake > 0) screenShake -= 0.12;

        // Process Motion Velocity Models
        player.velocity += gravity;
        player.y += player.velocity;
        player.tilt = Math.min(Math.PI / 3, Math.max(-Math.PI / 6, player.velocity * 0.07));

        // Horizontal Parallax Matrix displacement updates
        backgroundGridScroll = (backgroundGridScroll + 2.5) % 40;

        let altPercent = Math.max(0, Math.min(100, 100 - (player.y / canvas.height) * 100));
        fbAltitudeBar.style.width = altPercent + '%';

        // Boundary Floor/Roof Impact Matrix Evaluator
        if (player.y - player.height/2 < 0 || player.y + player.height/2 > canvas.height - 20) {
            createExplosionBurst(player.x, player.y, '#ff006e', 25);
            screenShake = 4.0;
            handleGameOver();
            return;
        }

        starfield.forEach(s => {
            s.x -= s.speed;
            if (s.x < -10) { s.x = canvas.width + 10; s.y = Math.random() * canvas.height; }
        });

        // Procedural Generation of Laser Barriers (Completely Non-Pipe Framework)
        if (frameCount % 85 === 0) {
            let gapSize = 140; // Internal Laser Gates Clearance Windows
            let minHeight = 80;
            let maxHeight = canvas.height - gapSize - minHeight - 40;
            let upperGateHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

            obstacles.push({
                x: canvas.width + 80,
                topHeight: upperGateHeight,
                bottomY: upperGateHeight + gapSize,
                width: 34,
                passed: false,
                color: Math.random() > 0.5 ? '#ff006e' : '#7b2cbf',
                pulseState: 0
            });
        }

        // Processing Obstacles Columns Vectors
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let o = obstacles[i];
            o.x -= 3.6; // Core horizontal scrolling velocity vector
            o.pulseState += 0.15;

            if (o.x < -80) {
                obstacles.splice(i, 1);
                continue;
            }

            if (!o.passed && o.x < player.x) {
                o.passed = true;
                score++;
                fbScore.innerText = String(score).padStart(4, '0');
            }

            // High Sensitivity Geometric Collision Matrix Maps
            let halfW = player.width / 2;
            let halfH = player.height / 2;

            if (player.x + halfW > o.x && player.x - halfW < o.x + o.width) {
                if (player.y - halfH < o.topHeight || player.y + halfH > o.bottomY) {
                    createExplosionBurst(player.x, player.y, '#ffffff', 20);
                    createExplosionBurst(o.x + o.width/2, player.y, o.color, 15);
                    screenShake = 5.0;
                    handleGameOver();
                    return;
                }
            }
        }

        // Particle Decay Tickers
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
            let dx = (Math.random() - 0.5) * screenShake * 6;
            let dy = (Math.random() - 0.5) * screenShake * 6;
            ctx.translate(dx, dy);
        }

        // 1. Far Backdrop Cosmic Particles
        starfield.forEach(s => {
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });

        // 2. High-Tech Synthwave Background Grid Matrices
        ctx.strokeStyle = 'rgba(123, 44, 191, 0.08)';
        ctx.lineWidth = 1;
        for (let x = -backgroundGridScroll; x < canvas.width; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // 3. Render Cyber Pylons & High-Voltage Plasma Laser Barriers
        obstacles.forEach(o => {
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = o.color;
            ctx.fillStyle = o.color;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;

            // Upper Mechanical Pylon emitter box
            ctx.beginPath();
            ctx.roundRect(o.x, 0, o.width, o.topHeight, [0, 0, 10, 10]);
            ctx.fill(); ctx.stroke();

            // Lower Mechanical Pylon emitter box
            ctx.beginPath();
            ctx.roundRect(o.x, o.bottomY, o.width, canvas.height - o.bottomY, [10, 10, 0, 0]);
            ctx.fill(); ctx.stroke();

            // Dynamic Crackling High Voltage Neon Laser Line Drawing Mapping
            let laserAlpha = 0.6 + Math.sin(o.pulseState) * 0.3;
            ctx.strokeStyle = `rgba(255, 255, 255, ${laserAlpha + 0.2})`;
            ctx.lineWidth = 4 + Math.sin(o.pulseState) * 1.5;
            ctx.shadowColor = o.color;
            ctx.shadowBlur = 20;

            ctx.beginPath();
            ctx.moveTo(o.x + o.width/2, o.topHeight);
            
            // Generate lightning/plasma zigzag node vectors inside the laser column
            let segments = 5;
            let currentY = o.topHeight;
            let targetY = o.bottomY;
            let segmentHeight = (targetY - currentY) / segments;

            for (let j = 1; j < segments; j++) {
                currentY += segmentHeight;
                let deviation = (Math.random() - 0.5) * 8;
                ctx.lineTo(o.x + o.width/2 + deviation, currentY);
            }
            ctx.lineTo(o.x + o.width/2, targetY);
            ctx.stroke();

            ctx.restore();
        });

        // 4. Draw Premium Cyber Drone Infiltrator (The Player Vector Body Model)
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.tilt);

        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ff006e';

        let droneGradient = ctx.createLinearGradient(-player.width/2, -player.height/2, player.width/2, player.height/2);
        droneGradient.addColorStop(0, '#ffffff');
        droneGradient.addColorStop(0.4, '#ff006e');
        droneGradient.addColorStop(1, '#7b2cbf');
        ctx.fillStyle = droneGradient;

        // Custom Aerodynamic Hexagonal Geometry Vector Track Path Config
        ctx.beginPath();
        ctx.moveTo(-player.width * 0.5, -player.height * 0.1); // Rear Engine Port
        ctx.lineTo(-player.width * 0.2, -player.height * 0.5); // Upper Stabilizer Intake
        ctx.lineTo(player.width * 0.4, -player.height * 0.2); // Forward Weapon Wing Riser
        ctx.lineTo(player.width * 0.5, 0); // Hyper-sharp Forward Target Apex Point Nose
        ctx.lineTo(player.width * 0.4, player.height * 0.2); // Bottom Wing Fuselage Segment
        ctx.lineTo(-player.width * 0.2, player.height * 0.5); // Lower Chassis Base Assembly
        ctx.lineTo(-player.width * 0.5, player.height * 0.1);
        ctx.closePath();
        ctx.fill();

        // Glowing Core Power Core Crystal Decal Overlay Ring
        ctx.fillStyle = 'rgba(4, 6, 20, 0.9)';
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#00f5d4';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(-player.width * 0.05, 0, 5, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        ctx.restore();

        // 5. Render Core Engine Particles Layer
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 6. Cyber Horizon Synthwave Track Base Floor Segment
        ctx.fillStyle = '#050718';
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f5d4';
        ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(0, canvas.height - 20); ctx.lineTo(canvas.width, canvas.height - 20); ctx.stroke();

        ctx.restore(); // Drop screen transformations sandbox
    }

    function coreEngineLoop() {
        if (!gameRunning) return;
        updateGameLogic();
        drawRenderPipeline();
        animationId = requestAnimationFrame(coreEngineLoop);
    }

    function bootSequence() {
        fbScreen.style.opacity = '0';
        fbScreen.style.visibility = 'hidden';
        score = 0; obstacles = []; particles = [];
        player.y = canvas.height / 2;
        player.velocity = 0;
        fbScore.innerText = "0000";
        fbAltitudeBar.style.width = '50%';
        gameRunning = true;
        coreEngineLoop();
    }

    function handleGameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        fbScreen.style.opacity = '1';
        fbScreen.style.visibility = 'visible';
        fbSub.innerHTML = `DRONE TRANSCEIVER TERMINATED! <br><span style="color:#ff006e; font-weight:700; font-size:14px; text-shadow:0 0 10px #ff006e;">NODES COMPLETED: ${score}</span>`;
        fbBtn.innerText = "RE-ENGAGE THRUST MATRIX";
    }

    fbBtn.onclick = bootSequence;
    window.fbCancelRef = () => { gameRunning = false; cancelAnimationFrame(animationId); };
}

function exitFlappyBird() {
    if (typeof window.fbCancelRef === 'function') window.fbCancelRef();
    if (typeof openGames === 'function') openGames();
}
