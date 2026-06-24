// js/games/spaceshooter.js

function startSpaceShooter() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Premium UI Overlays with Glassmorphism & Neon Drop Shadows
    c.innerHTML = `
        <div id="ssContainer" style="position:relative; width:100%; height:100%; min-height: calc(100vh - 160px); overflow:hidden; background: radial-gradient(circle at center, #0c1033 0%, #050716 100%); font-family: 'Poppins', sans-serif;">
            
            <div style="position:absolute; top:15px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:10; pointer-events:none;">
                <div style="background: rgba(6, 9, 25, 0.7); border: 1px solid rgba(0, 212, 255, 0.3); padding: 8px 16px; border-radius: 12px; backdrop-filter: blur(10px); box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);">
                    <span style="font-size:10px; color:rgba(255,255,255,0.5); display:block; letter-spacing:1px;">SCORE</span>
                    <span id="ssScore" style="color:#00D4FF; font-weight:900; font-size:18px; text-shadow: 0 0 10px #00D4FF;">0000</span>
                </div>
                <div style="background: rgba(6, 9, 25, 0.7); border: 1px solid rgba(255, 71, 87, 0.3); padding: 8px 16px; border-radius: 12px; backdrop-filter: blur(10px); box-shadow: 0 0 15px rgba(255, 71, 87, 0.2); width: 130px;">
                    <span style="font-size:10px; color:rgba(255,255,255,0.5); display:block; letter-spacing:1px;">SHIELD COMPLIANCE</span>
                    <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; margin-top:6px; overflow:hidden;">
                        <div id="ssShieldBar" style="width:100%; height:100%; background: linear-gradient(90deg, #ff4757, #ff6b81); box-shadow: 0 0 8px #ff4757; transition: width 0.2s;"></div>
                    </div>
                </div>
            </div>

            <canvas id="ssCanvas" style="display:block; width:100%; height:100%;"></canvas>
            
            <button onclick="exitSpaceShooter()" style="position:absolute; bottom:85px; right:20px; background:rgba(255,71,87,0.1); border:1px solid rgba(255,71,87,0.4); color:#ff4757; padding:8px 16px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; backdrop-filter:blur(5px); letter-spacing:1px; transition: 0.3s;">EXIT MISSION</button>

            <div id="ssScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: linear-gradient(135deg, rgba(19, 24, 66, 0.8) 0%, rgba(10, 14, 39, 0.9) 100%); border:1px solid rgba(212, 175, 55, 0.25); backdrop-filter:blur(25px); -webkit-backdrop-filter:blur(25px); padding:40px 30px; border-radius:24px; text-align:center; width:88%; max-width:350px; box-shadow:0 30px 70px rgba(0,0,0,0.8), inset 0 0 30px rgba(212,175,55,0.05); z-index:20; transition:0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <div style="width:70px; height:70px; background: rgba(0,212,255,0.1); border: 2px dashed #00D4FF; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; box-shadow: 0 0 20px rgba(0,212,255,0.2); animation: spin 10s linear infinite;">🚀</div>
                <h1 style="font-size:24px; font-weight:900; letter-spacing:4px; background:linear-gradient(135deg,#D4AF37 30%, #00D4FF 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:8px; text-transform:uppercase;">NEO CRISIS</h1>
                <p id="ssSub" style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:30px; letter-spacing:1px; line-height:1.6;">INTERSTELLAR VECTOR SIMULATOR <br><span style="color:#D4AF37;">PREMIUM LEVEL ACTIVE</span></p>
                <button id="ssBtn" style="background:linear-gradient(135deg,#D4AF37, #00D4FF); border:none; padding:14px 35px; font-size:13px; font-weight:800; color:#060919; border-radius:14px; cursor:pointer; text-transform:uppercase; letter-spacing:2px; box-shadow:0 10px 25px rgba(0,212,255,0.4); width:100%;">ENGAGE QUANTUM DRIVE</button>
            </div>
        </div>
        <style>@keyframes spin{100%{transform:rotate(360deg);}}</style>
    `;

    const canvas = document.getElementById('ssCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('ssContainer');
    const ssScreen = document.getElementById('ssScreen');
    const ssSub = document.getElementById('ssSub');
    const ssBtn = document.getElementById('ssBtn');
    const ssScore = document.getElementById('ssScore');
    const ssShieldBar = document.getElementById('ssShieldBar');

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 160);

    let score = 0, shield = 100, gameRunning = false, animationId = null;
    let lasers = [], enemies = [], particles = [], starfield = [];
    let frameCount = 0, lastShot = 0, screenShake = 0;

    // Generate Deep Hyperspace Background
    for (let i = 0; i < 50; i++) {
        starfield.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 3 + 1,
            alpha: Math.random() * 0.5 + 0.3
        });
    }

    const player = {
        x: canvas.width / 2,
        y: canvas.height - 130,
        targetX: canvas.width / 2,
        width: 34,
        height: 38,
        speed: 0.18 // Smooth lerping velocity
    };

    // Tracking Control (Supports Desktop Drag & Mobile Touch perfectly)
    function updateControls(e) {
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let rect = canvas.getBoundingClientRect();
        player.targetX = clientX - rect.left;
    }
    container.addEventListener('mousemove', updateControls);
    container.addEventListener('touchmove', updateControls, { passive: true });

    // Shockwave Particle System (Glow Burst Engine)
    function spawnExplosion(x, y, color, count = 15) {
        for (let i = 0; i < count; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 5 + 2;
            particles.push({
                x: x, y: y,
                radius: Math.random() * 3 + 1,
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
        
        // Handle Screen Shake Engine (Juice Property)
        if (screenShake > 0) screenShake -= 0.1;

        // Player Mechanics
        player.x += (player.targetX - player.x) * player.speed;
        if (player.x < player.width) player.x = player.width;
        if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

        // Tactical Plasma Cannons Autofire (Slightly staggered for rapid action)
        let now = Date.now();
        if (now - lastShot > 180) {
            lasers.push({ x: player.x - 12, y: player.y - 10, dy: -9, color: '#00D4FF' });
            lasers.push({ x: player.x + 12, y: player.y - 10, dy: -9, color: '#00D4FF' });
            lastShot = now;
        }

        // Hyperspace Star Shift
        starfield.forEach(s => {
            s.y += s.speed;
            if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
        });

        // Laser Arrays Lifecycle
        for (let i = lasers.length - 1; i >= 0; i--) {
            lasers[i].y += lasers[i].dy;
            if (lasers[i].y < -20) lasers.splice(i, 1);
        }

        // Procedural Alien Raider Spawning
        if (frameCount % 35 === 0) {
            let colors = ['#ff4757', '#7c3aed', '#ffa502', '#00d4ff'];
            enemies.push({
                x: Math.random() * (canvas.width - 50) + 25,
                y: -30,
                radius: Math.random() * 8 + 12,
                speed: Math.random() * 2 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                pulse: 0
            });
        }

        // Enemy Management & Collision System
        for (let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            e.y += e.speed;
            e.pulse += 0.1; // Animation metric

            // Out-of-bounds evasion penalty
            if (e.y > canvas.height + 30) {
                enemies.splice(i, 1);
                shield -= 10;
                screenShake = 1.5;
                if (shield <= 0) { shield = 0; handleGameOver(); }
                ssShieldBar.style.width = shield + '%';
                continue;
            }

            // High Precision Circle-to-Polygon Craft Collision
            let shipDistance = Math.hypot(e.x - player.x, e.y - player.y);
            if (shipDistance < e.radius + 20) {
                spawnExplosion(e.x, e.y, e.color, 25);
                spawnExplosion(player.x, player.y, '#ffffff', 15);
                enemies.splice(i, 1);
                shield -= 25;
                screenShake = 4.0;
                if (shield <= 0) { shield = 0; handleGameOver(); }
                ssShieldBar.style.width = shield + '%';
                continue;
            }

            // Laser Intersections Checks
            for (let j = lasers.length - 1; j >= 0; j--) {
                let l = lasers[j];
                let hitDistance = Math.hypot(e.x - l.x, e.y - l.y);
                if (hitDistance < e.radius + 6) {
                    spawnExplosion(e.x, e.y, e.color, 15);
                    enemies.splice(i, 1);
                    lasers.splice(j, 1);
                    score += 15;
                    ssScore.innerText = String(score).padStart(4, '0');
                    break;
                }
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
        // Camera Shake Matrix Hook
        if (screenShake > 0) {
            let dx = (Math.random() - 0.5) * screenShake * 5;
            let dy = (Math.random() - 0.5) * screenShake * 5;
            ctx.translate(dx, dy);
        }

        // 1. Cosmic Deep Layer
        starfield.forEach(s => {
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });

        // 2. High-intensity Laser Canvas Shaders
        lasers.forEach(l => {
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = l.color;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.x, l.y + 16);
            ctx.stroke();
            ctx.restore();
        });

        // 3. Cyberpunk Alien Raiders with Reactive Inner Shadows
        enemies.forEach(e => {
            ctx.save();
            let animatedRadius = e.radius + Math.sin(e.pulse) * 2;
            
            // Bloom Halo
            ctx.shadowBlur = 20;
            ctx.shadowColor = e.color;
            
            // Outer Core
            ctx.fillStyle = e.color;
            ctx.beginPath();
            ctx.arc(e.x, e.y, animatedRadius, 0, Math.PI * 2);
            ctx.fill();

            // Core Geometry Mask
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(e.x, e.y, animatedRadius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });

        // 4. God-Level Glowing Fighter Interceptor (The Player Ship)
        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00D4FF';
        
        // Custom Complex Vector Path Geometry for Fighter Jet
        let x = player.x, y = player.y, w = player.width, h = player.height;
        
        let shipGrad = ctx.createLinearGradient(x, y - h, x, y + h);
        shipGrad.addColorStop(0, '#ffffff');
        shipGrad.addColorStop(0.5, '#00D4FF');
        shipGrad.addColorStop(1, '#7C3AED');
        ctx.fillStyle = shipGrad;

        ctx.beginPath();
        ctx.moveTo(x, y - h); // Nose cone
        ctx.lineTo(x + w * 0.4, y - h * 0.3); // Upper fuselage fuselage
        ctx.lineTo(x + w, y + h * 0.4); // Right wingtip
        ctx.lineTo(x + w * 0.3, y + h * 0.2); // Wing structural fold
        ctx.lineTo(x + w * 0.2, y + h * 0.5); // Right engine exhaust ports
        ctx.lineTo(x - w * 0.2, y + h * 0.5); // Left engine exhaust ports
        ctx.lineTo(x - w * 0.3, y + h * 0.2); // Wing structural fold
        ctx.lineTo(x - w, y + h * 0.4); // Left wingtip
        ctx.lineTo(x - w * 0.4, y - h * 0.3); // Upper fuselage fuselage
        ctx.closePath();
        ctx.fill();

        // High Engine Thrust Visualizer Trail
        ctx.shadowColor = '#FFA502';
        ctx.fillStyle = Math.random() > 0.5 ? '#FFA502' : '#FF4757';
        ctx.beginPath();
        ctx.arc(x, y + h * 0.6, Math.random() * 4 + 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // 5. High Fidelity Explosion Particles Layer
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

        ctx.restore(); // Drop screen shake matrix state
    }

    function coreEngineLoop() {
        if (!gameRunning) return;
        updateGameLogic();
        drawRenderPipeline();
        animationId = requestAnimationFrame(coreEngineLoop);
    }

    function bootSequence() {
        ssScreen.style.opacity = '0';
        ssScreen.style.visibility = 'hidden';
        score = 0; shield = 100; lasers = []; enemies = []; particles = [];
        ssScore.innerText = "0000";
        ssShieldBar.style.width = '100%';
        gameRunning = true;
        coreEngineLoop();
    }

    function handleGameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        ssScreen.style.opacity = '1';
        ssScreen.style.visibility = 'visible';
        ssSub.innerHTML = `CRITICAL DEFUSED LOGGED! <br><span style="color:#ff4757; font-weight:700; font-size:14px; text-shadow:0 0 10px #ff4757;">SCORE: ${score}</span>`;
        ssBtn.innerText = "RE-INITIALIZE ENGINE";
    }

    ssBtn.onclick = bootSequence;
    window.ssCancelRef = () => { gameRunning = false; cancelAnimationFrame(animationId); };
}

function exitSpaceShooter() {
    if (typeof window.ssCancelRef === 'function') window.ssCancelRef();
    if (typeof openGames === 'function') openGames();
}
