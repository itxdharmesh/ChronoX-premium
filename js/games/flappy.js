// js/games/flappybird.js

function startFlappyBird() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Premium UI Overlays with Glassmorphism & Cyber Pink/Blue Drop Shadows
    c.innerHTML = `
        <div id="fbContainer" style="position:relative; width:100%; height:100%; min-height: calc(100vh - 160px); overflow:hidden; background: radial-gradient(circle at center, #0a091e 0%, #03040b 100%); font-family: 'Poppins', sans-serif; user-select:none; -webkit-user-select:none;">
            
            <div style="position:absolute; top:15px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:10; pointer-events:none;">
                <div style="background: rgba(6, 9, 25, 0.75); border: 1px solid rgba(255, 0, 110, 0.3); padding: 8px 16px; border-radius: 12px; backdrop-filter: blur(10px); box-shadow: 0 0 15px rgba(255, 0, 110, 0.15);">
                    <span style="font-size:10px; color:rgba(255,255,255,0.5); display:block; letter-spacing:1px;">CORES PASSED</span>
                    <span id="fbScore" style="color:#ff006e; font-weight:900; font-size:18px; text-shadow: 0 0 10px rgba(255, 0, 110, 0.4);">0000</span>
                </div>
                <div style="background: rgba(6, 9, 25, 0.75); border: 1px solid rgba(0, 245, 212, 0.3); padding: 8px 16px; border-radius: 12px; backdrop-filter: blur(10px); box-shadow: 0 0 15px rgba(0, 245, 212, 0.15); width: 130px;">
                    <span style="font-size:10px; color:rgba(255,255,255,0.5); display:block; letter-spacing:1px;">ALTITUDE INDICATION</span>
                    <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; margin-top:6px; overflow:hidden;">
                        <div id="fbAltitudeBar" style="width:50%; height:100%; background: linear-gradient(90deg, #00f5d4, #00bbf9); box-shadow: 0 0 8px #00f5d4; transition: width 0.05s linear;"></div>
                    </div>
                </div>
            </div>

            <canvas id="fbCanvas" style="display:block; width:100%; height:100%;"></canvas>
            
            <button onclick="exitFlappyBird()" style="position:absolute; bottom:85px; right:20px; background:rgba(0,245,212,0.1); border:1px solid rgba(0,245,212,0.4); color:#00f5d4; padding:8px 16px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; backdrop-filter:blur(5px); letter-spacing:1px; transition: 0.3s;">ABORT FLIGHT</button>

            <div id="fbScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: linear-gradient(135deg, rgba(16, 12, 40, 0.85) 0%, rgba(6, 7, 20, 0.95) 100%); border:1px solid rgba(255, 0, 110, 0.25); backdrop-filter:blur(25px); -webkit-backdrop-filter:blur(25px); padding:40px 30px; border-radius:24px; text-align:center; width:88%; max-width:350px; box-shadow:0 30px 70px rgba(0,0,0,0.8), inset 0 0 30px rgba(255,0,110,0.05); z-index:20; transition:0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="width:70px; height:70px; background: rgba(255,0,110,0.1); border: 2px dashed #ff006e; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; box-shadow: 0 0 20px rgba(255,0,110,0.2); animation: spinMatrix 15s linear infinite;">🛸</div>
                <h1 style="font-size:24px; font-weight:900; letter-spacing:4px; background:linear-gradient(135deg, #ff006e 0%, #00f5d4 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:8px; text-transform:uppercase;">NEON THRUST</h1>
                <p id="fbSub" style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:30px; letter-spacing:1px; line-height:1.6;">CYBERNETIC VECTOR DRONE SIMULATOR <br><span style="color:#ff006e;">VECTOR MATRIX HIGH GRADE</span></p>
                <button id="fbBtn" style="background:linear-gradient(135deg,#ff006e, #00f5d4); border:none; padding:14px 35px; font-size:13px; font-weight:800; color:#050711; border-radius:14px; cursor:pointer; text-transform:uppercase; letter-spacing:2px; box-shadow:0 10px 25px rgba(255,0,110,0.3); width:100%;">BOOT THRUSTERS</button>
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

    // Engine Configurations & Physics Properties Matrix
    let score = 0, gameRunning = false, animationId = null;
    let obstacles = [], particles = [], starfield = [];
    let frameCount = 0, screenShake = 0;

    const gravity = 0.25;
    const jumpThrust = -5.8;

    // Player Cyber Drone Setup
    const player = {
        x: canvas.width * 0.25,
        y: canvas.height / 2,
        velocity: 0,
        width: 38,
        height: 26,
        tilt: 0
    };

    // Deep Neon Backdrop Particles Generator
    for (let i = 0; i < 40; i++) {
        starfield.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.5 + 0.2
        });
    }

    // Capture Fly Action (Both Space/Click and Mobile Touch)
    function triggerDroneJump(e) {
        if (!gameRunning) return;
        if (e && e.cancelable) e.preventDefault();
        
        player.velocity = jumpThrust;
        
        // Spawn afterburner neon engine ignition particles
        for (let i = 0; i < 6; i++) {
            particles.push({
                x: player.x - 15,
                y: player.y + (Math.random() - 0.5) * 10,
                radius: Math.random() * 3 + 1,
                dx: -(Math.random() * 4 + 2),
                dy: (Math.random() - 0.5) * 3,
                alpha: 1,
                decay: Math.random() * 0.04 + 0.03,
                color: '#ff006e'
            });
        }
    }

    window.addEventListener('keydown', (e) => { if(e.code === 'Space') triggerDroneJump(e); });
    container.addEventListener('mousedown', triggerDroneJump);
    container.addEventListener('touchstart', triggerDroneJump, { passive: false });

    function spawnExplosionSparks(x, y, color, count = 15) {
        for (let i = 0; i < count; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 5 + 1;
            particles.push({
                x: x, y: y,
                radius: Math.random() * 2.5 + 1,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.02 + 0.015,
                color: color
            });
        }
    }

    function updateGameLogic() {
        frameCount++;

        if (screenShake > 0) screenShake -= 0.1;

        // Apply Flight Physics Matrix Engine
        player.velocity += gravity;
        player.y += player.velocity;
        
        // Rotational tilt handling based on falling/flying delta vectors
        player.tilt = Math.min(Math.PI / 4, Math.max(-Math.PI / 7, player.velocity * 0.06));

        // Sync HUD Altitude Bar gauge progress
        let altPercent = Math.max(0, Math.min(100, 100 - (player.y / canvas.height) * 100));
        fbAltitudeBar.style.width = altPercent + '%';

        // Sky/Ground Boundary crash detection vectors
        if (player.y - player.height/2 < 0 || player.y + player.height/2 > canvas.height) {
            spawnExplosionSparks(player.x, player.y, '#00f5d4', 25);
            screenShake = 3.5;
            handleGameOver();
            return;
        }

        // Horizontal star map translation scroll
        starfield.forEach(s => {
            s.x -= s.speed;
            if (s.x < -5) { s.x = canvas.width + 5; s.y = Math.random() * canvas.height; }
        });

        // Procedural Laser Security Barrier Columns Spawning Architecture
        if (frameCount % 90 === 0) {
            let gapSize = 135; // Size of passage clearance gate matrix
            let minHeight = 60;
            let maxHeight = canvas.height - gapSize - minHeight;
            let topBarrierHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

            obstacles.push({
                x: canvas.width + 60,
                topHeight: topBarrierHeight,
                bottomY: topBarrierHeight + gapSize,
                width: 45,
                passed: false,
                color: Math.random() > 0.5 ? '#ff006e' : '#7b2cbf'
            });
        }

        // Processing Obstacles Columns Pipeline Management
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let o = obstacles[i];
            o.x -= 3.2; // Gate displacement translation vector speed

            // Delete off-viewport components out of memory bounds
            if (o.x < -60) {
                obstacles.splice(i, 1);
                continue;
            }

            // Score configuration trigger point mapping tracking
            if (!o.passed && o.x < player.x) {
                o.passed = true;
                score++;
                fbScore.innerText = String(score).padStart(4, '0');
            }

            // High Precision AABB Box Collisions Check Matrix Loop
            let padW = player.width / 2;
            let padH = player.height / 2;

            if (player.x + padW > o.x && player.x - padW < o.x + o.width) {
                // Inside target coordinate range column segment
                if (player.y - padH < o.topHeight || player.y + padH > o.bottomY) {
                    spawnExplosionSparks(player.x, player.y, '#ffffff', 20);
                    spawnExplosionSparks(o.x + o.width/2, player.y, o.color, 15);
                    screenShake = 4.0;
                    handleGameOver();
                    return;
                }
            }
        }

        // Update Particle Fade Decay Engine Arrays
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.dx; p.y += p.dy; p.alpha -= p.decay;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    function drawRenderPipeline() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        // Camera Screen Shake Translation Anchor
        if (screenShake > 0) {
            let dx = (Math.random() - 0.5) * screenShake * 6;
            let dy = (Math.random() - 0.5) * screenShake * 6;
            ctx.translate(dx, dy);
        }

        // 1. Cosmic Deep Layer Starfield
        starfield.forEach(s => {
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });

        // 2. Render Neon Laser Gate Security Barrier Towers
        obstacles.forEach(o => {
            // High Glow Neon Shader Profiles
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = o.color;
            ctx.fillStyle = o.color;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;

            // Top Laser Wall Frame
            ctx.beginPath();
            ctx.roundRect(o.x, -10, o.width, o.topHeight + 10, [0, 0, 8, 8]);
            ctx.fill(); ctx.stroke();

            // Bottom Laser Wall Frame
            ctx.beginPath();
            ctx.roundRect(o.x, o.bottomY, o.width, canvas.height - o.bottomY + 10, [8, 8, 0, 0]);
            ctx.fill(); ctx.stroke();
            
            // Draw Core Neon Plasma Laser Beam Indicator Line
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(o.x + o.width/2, o.topHeight);
            ctx.lineTo(o.x + o.width/2, o.bottomY);
            ctx.stroke();

            ctx.restore();
        });

        // 3. Draw God-Level Cyber Glowing Drone Interceptor (The Player Jet)
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.tilt);

        ctx.shadowBlur = 22;
        ctx.shadowColor = '#00f5d4';

        // Complex Multi-Gradient Vector Path Geometry Engine Core Chassis Layout
        let droneGrad = ctx.createLinearGradient(-player.width/2, -player.height/2, player.width/2, player.height/2);
        droneGrad.addColorStop(0, '#ffffff');
        droneGrad.addColorStop(0.5, '#00f5d4');
        droneGrad.addColorStop(1, '#7b2cbf');
        ctx.fillStyle = droneGrad;

        ctx.beginPath();
        ctx.moveTo(-player.width * 0.5, -player.height * 0.2); // Rear thruster intake assembly
        ctx.lineTo(-player.width * 0.1, -player.height * 0.5); // Upper wing flap chassis riser
        ctx.lineTo(player.width * 0.5, 0); // Front hyper-focused sensor nose cone assembly
        ctx.lineTo(-player.width * 0.1, player.height * 0.5); // Lower wing stabilizer structural layout
        ctx.lineTo(-player.width * 0.5, player.height * 0.2); // Bottom combustion outlet port frame
        ctx.closePath();
        ctx.fill();

        // Holographic Navigation Cockpit Shield Layer Decal Overlay
        ctx.fillStyle = 'rgba(6, 9, 25, 0.8)';
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(player.width * 0.1, -player.height * 0.05, 6, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        ctx.restore();

        // 4. Processing Particle Emitter Engine Vectors Layer Drawing
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

        ctx.restore(); // Terminate screen camera adjustments transform sandbox tracking blocks
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
        fbSub.innerHTML = `FLIGHT CORES DECONSTRUCTED! <br><span style="color:#ff006e; font-weight:700; font-size:14px; text-shadow:0 0 10px #ff006e;">CORES CLEARED: ${score}</span>`;
        fbBtn.innerText = "RE-INITIALIZE THRUSTERS";
    }

    fbBtn.onclick = bootSequence;
    window.fbCancelRef = () => { gameRunning = false; cancelAnimationFrame(animationId); };
}

function exitFlappyBird() {
    if (typeof window.fbCancelRef === 'function') window.fbCancelRef();
    if (typeof openGames === 'function') openGames();
}
