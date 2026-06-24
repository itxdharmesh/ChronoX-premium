// js/games/neondrift.js

function startNeonDrift() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Premium UI Overlays with Glassmorphism & Neon Cyan Drop Shadows
    c.innerHTML = `
        <div id="ndContainer" style="position:relative; width:100%; height:100%; min-height: calc(100vh - 160px); overflow:hidden; background: radial-gradient(circle at center, #0f0c24 0%, #040510 100%); font-family: 'Poppins', sans-serif; user-select:none; -webkit-user-select:none;">
            
            <!-- Real-Time Cyber Telemetry HUD -->
            <div style="position:absolute; top:15px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:10; pointer-events:none;">
                <div style="background: rgba(6, 9, 25, 0.75); border: 1px solid rgba(0, 245, 212, 0.3); padding: 8px 16px; border-radius: 12px; backdrop-filter: blur(10px); box-shadow: 0 0 15px rgba(0, 245, 212, 0.15);">
                    <span style="font-size:10px; color:rgba(255,255,255,0.5); display:block; letter-spacing:1px;">SCORE / DISTANCE</span>
                    <span id="ndScore" style="color:#00f5d4; font-weight:900; font-size:18px; text-shadow: 0 0 10px rgba(0, 245, 212, 0.4);">0000</span>
                </div>
                <div style="background: rgba(6, 9, 25, 0.75); border: 1px solid rgba(255, 0, 110, 0.3); padding: 8px 16px; border-radius: 12px; backdrop-filter: blur(10px); box-shadow: 0 0 15px rgba(255, 0, 110, 0.15); width: 130px;">
                    <span style="font-size:10px; color:rgba(255,255,255,0.5); display:block; letter-spacing:1px;">NITRO RECHARGE</span>
                    <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; margin-top:6px; overflow:hidden;">
                        <div id="ndNitroBar" style="width:100%; height:100%; background: linear-gradient(90deg, #ff006e, #ff70a6); box-shadow: 0 0 8px #ff006e; transition: width 0.1s linear;"></div>
                    </div>
                </div>
            </div>

            <!-- Core Render Canvas -->
            <canvas id="ndCanvas" style="display:block; width:100%; height:100%; cursor:none;"></canvas>
            
            <!-- Router Kill Switch -->
            <button onclick="exitNeonDrift()" style="position:absolute; bottom:85px; right:20px; background:rgba(255,0,110,0.1); border:1px solid rgba(255,0,110,0.4); color:#ff006e; padding:8px 16px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; backdrop-filter:blur(5px); letter-spacing:1px; transition: 0.3s;">ABORT DRIVE</button>

            <!-- Holographic Welcome/Gameover Panel Interface -->
            <div id="ndScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: linear-gradient(135deg, rgba(20, 16, 45, 0.85) 0%, rgba(7, 8, 22, 0.95) 100%); border:1px solid rgba(0, 245, 212, 0.25); backdrop-filter:blur(25px); -webkit-backdrop-filter:blur(25px); padding:40px 30px; border-radius:24px; text-align:center; width:88%; max-width:350px; box-shadow:0 30px 70px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,245,212,0.05); z-index:20; transition:0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="width:70px; height:70px; background: rgba(0,245,212,0.1); border: 2px dashed #00f5d4; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; box-shadow: 0 0 20px rgba(0,245,212,0.2); animation: spinGrid 12s linear infinite;">🏎️</div>
                <h1 style="font-size:24px; font-weight:900; letter-spacing:4px; background:linear-gradient(135deg, #00f5d4 0%, #7b2cbf 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:8px; text-transform:uppercase;">NEON DRIFT</h1>
                <p id="ndSub" style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:30px; letter-spacing:1px; line-height:1.6;">SYNTHWAVE VECTOR RACING TRON GRID <br><span style="color:#00f5d4;">OVERDRIVE SPEED EDITION</span></p>
                <button id="ndBtn" style="background:linear-gradient(135deg,#00f5d4, #7b2cbf); border:none; padding:14px 35px; font-size:13px; font-weight:800; color:#050711; border-radius:14px; cursor:pointer; text-transform:uppercase; letter-spacing:2px; box-shadow:0 10px 25px rgba(0,245,212,0.3); width:100%;">IGNITE CORES</button>
            </div>
        </div>
        <style>@keyframes spinGrid{100%{transform:rotate(360deg);}}</style>
    `;

    const canvas = document.getElementById('ndCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('ndContainer');
    const ndScreen = document.getElementById('ndScreen');
    const ndSub = document.getElementById('ndSub');
    const ndBtn = document.getElementById('ndBtn');
    const ndScore = document.getElementById('ndScore');
    const ndNitroBar = document.getElementById('ndNitroBar');

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 160);

    // Engine Parameters & Vectors Matrices
    let score = 0, speed = 0, maxSpeed = 15, gameRunning = false, animationId = null;
    let obstacles = [], particles = [], starfield = [];
    let frameCount = 0, screenShake = 0, roadTrackCurve = 0, currentCurve = 0;

    // Build Retro-Synthwave Horizon Atmosphere
    for (let i = 0; i < 40; i++) {
        starfield.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height * 0.55),
            size: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.6 + 0.4
        });
    }

    const player = {
        x: canvas.width / 2,
        y: canvas.height - 110,
        targetX: canvas.width / 2,
        width: 38,
        height: 60,
        speed: 0.14, // Smooth lerping velocity matrix
        tilt: 0
    };

    function updateControls(e) {
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let rect = canvas.getBoundingClientRect();
        player.targetX = clientX - rect.left;
    }
    container.addEventListener('mousemove', updateControls);
    container.addEventListener('touchmove', updateControls, { passive: true });

    // Premium Spark Particle Shader
    function spawnSparks(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x, y: y,
                radius: Math.random() * 2 + 0.5,
                dx: (Math.random() - 0.5) * 6,
                dy: (Math.random() - 0.5) * 2 - (speed * 0.3),
                alpha: 1,
                decay: Math.random() * 0.03 + 0.02,
                color: color
            });
        }
    }

    function updateGameLogic() {
        frameCount++;
        
        if (screenShake > 0) screenShake -= 0.15;

        // Sync Speed & Difficulty Curve Acceleration
        if (speed < maxSpeed) speed += 0.015;
        score += Math.floor(speed * 0.2);
        ndScore.innerText = String(score).padStart(4, '0');
        ndNitroBar.style.width = Math.min(100, (speed / maxSpeed) * 100) + '%';

        // Vehicle Structural Calculations & Tilting
        let previousX = player.x;
        player.x += (player.targetX - player.x) * player.speed;
        player.tilt = (player.x - previousX) * 0.15; // Smooth rotational physics frame delta

        // Boundary constraints
        if (player.x < canvas.width * 0.15) player.x = canvas.width * 0.15;
        if (player.x > canvas.width * 0.85) player.x = canvas.width * 0.85;

        // Tire Drift Sparks generation
        if (Math.abs(player.tilt) > 0.4 && frameCount % 2 === 0) {
            spawnSparks(player.x - 14, player.y + 25, '#00f5d4', 2);
            spawnSparks(player.x + 14, player.y + 25, '#00f5d4', 2);
        }

        // Procedural Horizon Curvature Math Architecture
        if (frameCount % 120 === 0) {
            roadTrackCurve = (Math.random() - 0.5) * 4; // Shift road left or right
        }
        currentCurve += (roadTrackCurve - currentCurve) * 0.03;

        // Procedural Cyber Obstructors Spawning
        if (frameCount % Math.max(20, Math.floor(45 - speed * 1.5)) === 0) {
            obstacles.push({
                scaleProgress: 0, // Out of pseudo-3D perspective horizon projection line matrix (0 to 1)
                trackPos: (Math.random() - 0.5) * 1.4, // Positioning inside perspective layout matrix
                width: 25,
                height: 18,
                color: Math.random() > 0.5 ? '#ff006e' : '#7b2cbf',
                rot: Math.random() * Math.PI
            });
        }

        // Processing Obstacles perspective pipeline mapping
        let horizonY = canvas.height * 0.5;
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let o = obstacles[i];
            o.scaleProgress += (speed * 0.0018); // Forward positioning incremental vector

            // Out-of-bounds calculations safe clearance matrix
            if (o.scaleProgress >= 1) {
                obstacles.splice(i, 1);
                continue;
            }

            // Pseudo-3D Perspective Projection Mapping Coordinate Translators
            let currentScale = Math.pow(o.scaleProgress, 2.5); // Perspective scaling progression logic curves
            let currentRoadWidth = canvas.width * 0.7 * currentScale;
            let currentRoadCenterX = (canvas.width / 2) + (currentCurve * canvas.width * 0.12 * Math.pow(o.scaleProgress, 2));
            
            let obsX = currentRoadCenterX + (o.trackPos * currentRoadWidth);
            let obsY = horizonY + (canvas.height * 0.5 * currentScale);

            // High Fidelity Collision Matrix Mapping AABB Check vector hooks
            if (o.scaleProgress > 0.88 && o.scaleProgress < 0.97) {
                let currentObsWidth = o.width * (currentScale * 4);
                let distanceToCar = Math.abs(obsX - player.x);
                
                if (distanceToCar < (currentObsWidth / 2 + player.width / 1.4) && obsY > player.y - 10 && obsY < player.y + player.height) {
                    spawnSparks(obsX, obsY, o.color, 30);
                    spawnSparks(player.x, player.y, '#ffffff', 20);
                    screenShake = 4.5;
                    speed = Math.max(2, speed * 0.3); // Apply kinetic friction structural brake impact penalties
                    obstacles.splice(i, 1);
                    
                    if (speed <= 2.5) { handleGameOver(); }
                    continue;
                }
            }
        }

        // Particle Decay Arrays Update Routine
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.dx; p.y += p.dy; p.alpha -= p.decay;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    function drawRenderPipeline() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        // Camera Shake Matrix Hook Implementation
        if (screenShake > 0) {
            let dx = (Math.random() - 0.5) * screenShake * 6;
            let dy = (Math.random() - 0.5) * screenShake * 6;
            ctx.translate(dx, dy);
        }

        // 1. Cosmic Deep Sky Star Matrix Layer
        starfield.forEach(s => {
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });

        // 2. Draw Retro Synthwave Glowing Sun Element
        let horizonY = canvas.height * 0.5;
        ctx.save();
        let sunGrad = ctx.createLinearGradient(canvas.width/2, horizonY - 120, canvas.width/2, horizonY);
        sunGrad.addColorStop(0, '#ff006e');
        sunGrad.addColorStop(1, '#ffbe0b');
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ff006e';
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, horizonY, 80, Math.PI, 0, false);
        ctx.fill();
        ctx.restore();

        // 3. Draw Perspective Wireframe Road Matrix Layer
        ctx.save();
        let scanlineOffset = (frameCount * speed * 0.5) % 40;
        
        // Draw horizontal receding lines
        for (let y = 0; y < canvas.height * 0.5; y += 15) {
            let relativeY = Math.pow(y / (canvas.height * 0.5), 2); // Exponential scaling distribution curve
            let drawY = horizonY + (canvas.height * 0.5 * relativeY);
            
            ctx.strokeStyle = `rgba(123, 44, 191, ${relativeY * 0.4})`;
            ctx.lineWidth = 1 + relativeY * 2;
            ctx.beginPath();
            ctx.moveTo(0, drawY);
            ctx.lineTo(canvas.width, drawY);
            ctx.stroke();
        }

        // Perspective Outward Main Border Tracks Guidelines
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00f5d4';
        
        let trackEdges = [-0.5, 0.5]; // Left and right road layout boundaries lines vectors
        trackEdges.forEach(edge => {
            ctx.beginPath();
            for (let progress = 0; progress <= 1.05; progress += 0.05) {
                let currentScale = Math.pow(progress, 2.5);
                let currentRoadWidth = canvas.width * 0.7 * currentScale;
                let currentRoadCenterX = (canvas.width / 2) + (currentCurve * canvas.width * 0.12 * Math.pow(progress, 2));
                
                let drawX = currentRoadCenterX + (edge * currentRoadWidth);
                let drawY = horizonY + (canvas.height * 0.5 * currentScale);
                
                if (progress === 0) ctx.moveTo(drawX, drawY);
                else ctx.lineTo(drawX, drawY);
            }
            ctx.stroke();
        });
        ctx.restore();

        // 4. Rendering Pseudo-3D Perspective Obstacles Space Objects
        obstacles.forEach(o => {
            ctx.save();
            let currentScale = Math.pow(o.scaleProgress, 2.5);
            let currentRoadWidth = canvas.width * 0.7 * currentScale;
            let currentRoadCenterX = (canvas.width / 2) + (currentCurve * canvas.width * 0.12 * Math.pow(o.scaleProgress, 2));
            
            let obsX = currentRoadCenterX + (o.trackPos * currentRoadWidth);
            let obsY = horizonY + (canvas.height * 0.5 * currentScale);
            
            let finalW = o.width * (currentScale * 4);
            let finalH = o.height * (currentScale * 4);

            ctx.translate(obsX, obsY);
            ctx.rotate(o.rot + frameCount * 0.02);
            
            ctx.shadowBlur = 15;
            ctx.shadowColor = o.color;
            ctx.fillStyle = o.color;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1 + currentScale * 2;
            
            ctx.beginPath();
            ctx.roundRect(-finalW/2, -finalH/2, finalW, finalH, 3 + currentScale * 3);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });

        // 5. Draw God-Level Cyber Glowing Racer Engine Vehicle (The Player Car)
        ctx.save();
        ctx.translate(player.x, player.y + player.height/2);
        ctx.rotate(player.tilt); // Structural tilt matrix configuration inject
        
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00f5d4';

        // Custom Complex Multi-Gradient Structure Vector Paths Layout
        let bodyGrad = ctx.createLinearGradient(-player.width/2, -player.height/2, player.width/2, player.height/2);
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(0.4, '#00f5d4');
        bodyGrad.addColorStop(1, '#7b2cbf');
        ctx.fillStyle = bodyGrad;

        // Draw Sports Car Custom Geometry Body Archetype
        ctx.beginPath();
        ctx.moveTo(0, -player.height/2); // Center nose cone point front bumper
        ctx.lineTo(player.width * 0.35, -player.height * 0.35); // Front wheel arch right
        ctx.lineTo(player.width * 0.45, -player.height * 0.05); // Side intake right side aerodynamic frame
        ctx.lineTo(player.width * 0.5, player.height * 0.35); // Rear wing corner spoiler edge right
        ctx.lineTo(player.width * 0.25, player.height * 0.45); // Engine cooling exhaust block right
        ctx.lineTo(-player.width * 0.25, player.height * 0.45); // Engine cooling exhaust block left
        ctx.lineTo(-player.width * 0.5, player.height * 0.35); // Rear wing corner spoiler edge left
        ctx.lineTo(-player.width * 0.45, -player.height * 0.05); // Side intake left side aerodynamic frame
        ctx.lineTo(-player.width * 0.35, -player.height * 0.35); // Front wheel arch left
        ctx.closePath();
        ctx.fill();

        // Neon Digital Cockpit Window Element Decal overlay
        ctx.fillStyle = 'rgba(6, 9, 25, 0.85)';
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-player.width * 0.2, -player.height * 0.1);
        ctx.lineTo(player.width * 0.2, -player.height * 0.1);
        ctx.lineTo(player.width * 0.28, player.height * 0.15);
        ctx.lineTo(-player.width * 0.28, player.height * 0.15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // High Intensity Afterburner Glowing Thrust Trails
        ctx.shadowColor = '#ff006e';
        ctx.fillStyle = Math.random() > 0.4 ? '#ff006e' : '#ff70a6';
        ctx.beginPath();
        ctx.roundRect(-player.width * 0.22, player.height * 0.42, player.width * 0.12, Math.random() * 8 + 8, 2);
        ctx.roundRect(player.width * 0.1, player.height * 0.42, player.width * 0.12, Math.random() * 8 + 8, 2);
        ctx.fill();

        ctx.restore();

        // 6. Cybernetic High Frequency Fusion Spark Particles Rendering
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

        ctx.restore(); // Terminate screen shake transformations safe sandbox isolation layer
    }

    function coreEngineLoop() {
        if (!gameRunning) return;
        updateGameLogic();
        drawRenderPipeline();
        animationId = requestAnimationFrame(coreEngineLoop);
    }

    function bootSequence() {
        ndScreen.style.opacity = '0';
        ndScreen.style.visibility = 'hidden';
        score = 0; speed = 5; obstacles = []; particles = [];
        ndScore.innerText = "0000";
        ndNitroBar.style.width = '0%';
        gameRunning = true;
        coreEngineLoop();
    }

    function handleGameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        ndScreen.style.opacity = '1';
        ndScreen.style.visibility = 'visible';
        ndSub.innerHTML = `NEON EXHAUSTION DETECTED! <br><span style="color:#ff006e; font-weight:700; font-size:14px; text-shadow:0 0 10px #ff006e;">RECORDED DISTANCE: ${score}</span>`;
        ndBtn.innerText = "RE-ENGAGE GENERATORS";
    }

    ndBtn.onclick = bootSequence;
    window.ndCancelRef = () => { gameRunning = false; cancelAnimationFrame(animationId); };
}

function exitNeonDrift() {
    if (typeof window.ndCancelRef === 'function') window.ndCancelRef();
    if (typeof openGames === 'function') openGames();
}
