// js/games/flappybird.js

function startFlappyBird() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Solid Error-Free UI Layer
    c.innerHTML = `
        <div id="fbContainer" style="position:relative; width:100%; height:100%; min-height: calc(100vh - 160px); overflow:hidden; background: #04020d; font-family: 'Poppins', sans-serif; user-select:none; -webkit-user-select:none;">
            
            <div style="position:absolute; top:15px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:10; pointer-events:none;">
                <div style="background: rgba(10, 5, 30, 0.85); border: 2px solid #ff006e; padding: 10px 20px; border-radius: 12px; box-shadow: 0 0 15px rgba(255, 0, 110, 0.4);">
                    <span style="font-size:9px; color:#ff006e; display:block; letter-spacing:2px; font-weight:700;">NODES BREACHED</span>
                    <span id="fbScore" style="color:#ffffff; font-weight:900; font-size:24px; text-shadow: 0 0 10px #ffffff;">0000</span>
                </div>
                <div style="background: rgba(10, 5, 30, 0.85); border: 2px solid #00f5d4; padding: 10px 20px; border-radius: 12px; box-shadow: 0 0 15px rgba(0, 245, 212, 0.4); width: 140px;">
                    <span style="font-size:9px; color:#00f5d4; display:block; letter-spacing:2px; font-weight:700;">ALTITUDE</span>
                    <div style="width:100%; height:6px; background:rgba(255,255,255,0.1); border-radius:3px; margin-top:8px; overflow:hidden;">
                        <div id="fbAltitudeBar" style="width:50%; height:100%; background: #00f5d4; box-shadow: 0 0 8px #00f5d4;"></div>
                    </div>
                </div>
            </div>

            <canvas id="fbCanvas" style="display:block; width:100%; height:100%;"></canvas>
            
            <button onclick="exitFlappyBird()" style="position:absolute; bottom:85px; right:20px; background:#ff006e; border:none; color:#ffffff; padding:10px 20px; border-radius:10px; font-size:11px; font-weight:800; cursor:pointer; z-index:10; letter-spacing:1px; box-shadow: 0 4px 10px rgba(255,0,110,0.3);">ABORT MISSION</button>

            <div id="fbScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: #0d0722; border: 3px solid #00f5d4; padding:45px 35px; border-radius:24px; text-align:center; width:90%; max-width:350px; box-shadow: 0 0 40px rgba(0, 245, 212, 0.25); z-index:20;">
                <div style="font-size:40px; margin-bottom:15px; animation: pulseGlow 2s infinite alternate;">🛸</div>
                <h1 style="font-size:28px; font-weight:900; color:#ffffff; letter-spacing:3px; margin-bottom:5px; text-shadow: 0 0 15px #00f5d4;">CYBER THRUST</h1>
                <p id="fbSub" style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:30px; letter-spacing:1px; line-height:1.6;">TAP SPACE OR CLICK TO JUMP</p>
                <button id="fbBtn" style="background: linear-gradient(135deg, #00f5d4, #ff006e); border:none; padding:15px 40px; font-size:14px; font-weight:900; color:#000000; border-radius:12px; cursor:pointer; text-transform:uppercase; letter-spacing:2px; width:100%; box-shadow: 0 5px 20px rgba(0,245,212,0.4);">ENGAGE DRIVE</button>
            </div>
        </div>
        <style>
            @keyframes pulseGlow { from { transform: scale(0.95); opacity: 0.8; } to { transform: scale(1.05); opacity: 1; } }
        </style>
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

    let score = 0;
    let gameRunning = false;
    let animationId = null;
    let obstacles = [];
    let particles = [];
    let starfield = [];
    let frameCount = 0;
    let backgroundGridScroll = 0;

    const gravity = 0.25;
    const jumpThrust = -5.8;

    const player = {
        x: canvas.width * 0.25,
        y: canvas.height / 2,
        velocity: 0,
        width: 40,
        height: 25,
        tilt: 0
    };

    // Stars Generation
    for (let i = 0; i < 30; i++) {
        starfield.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 1 + 0.5
        });
    }

    function triggerJump(e) {
        if (!gameRunning) return;
        if (e && e.cancelable) e.preventDefault();
        
        player.velocity = jumpThrust;
        
        // Thrust particles
        for (let i = 0; i < 5; i++) {
            particles.push({
                x: player.x - 20,
                y: player.y,
                radius: Math.random() * 3 + 1,
                dx: -(Math.random() * 3 + 2),
                dy: (Math.random() - 0.5) * 2,
                alpha: 1,
                color: '#00f5d4'
            });
        }
    }

    // Input Events Secure Handling
    const handleKeyDown = (e) => { if (e.code === 'Space') triggerJump(e); };
    window.addEventListener('keydown', handleKeyDown);
    container.addEventListener('mousedown', triggerJump);

    function explodeDrone(x, y) {
        for (let i = 0; i < 20; i++) {
            let angle = Math.random() * Math.PI * 2;
            let s = Math.random() * 4 + 1;
            particles.push({
                x: x, y: y,
                radius: Math.random() * 2 + 1,
                dx: Math.cos(angle) * s,
                dy: Math.sin(angle) * s,
                alpha: 1,
                color: '#ff006e'
            });
        }
    }

    function updateLogic() {
        frameCount++;
        player.velocity += gravity;
        player.y += player.velocity;
        player.tilt = Math.min(Math.PI / 4, Math.max(-Math.PI / 8, player.velocity * 0.08));

        backgroundGridScroll = (backgroundGridScroll + 2) % 40;

        let altPercent = Math.max(0, Math.min(100, 100 - (player.y / canvas.height) * 100));
        fbAltitudeBar.style.width = altPercent + '%';

        if (player.y < 0 || player.y > canvas.height - 25) {
            explodeDrone(player.x, player.y);
            handleGameOver();
            return;
        }

        starfield.forEach(s => {
            s.x -= s.speed;
            if (s.x < -5) s.x = canvas.width + 5;
        });

        if (frameCount % 100 === 0) {
            let gap = 140;
            let minH = 60;
            let maxH = canvas.height - gap - minH - 40;
            let topH = Math.floor(Math.random() * (maxH - minH + 1)) + minH;

            obstacles.push({
                x: canvas.width + 50,
                topHeight: topH,
                bottomY: topH + gap,
                width: 30,
                passed: false,
                pulse: 0
            });
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
            let o = obstacles[i];
            o.x -= 3;
            o.pulse += 0.2;

            if (o.x < -50) {
                obstacles.splice(i, 1);
                continue;
            }

            if (!o.passed && o.x < player.x) {
                o.passed = true;
                score++;
                fbScore.innerText = String(score).padStart(4, '0');
            }

            let pW = player.width / 2;
            let pH = player.height / 2;
            if (player.x + pW > o.x && player.x - pW < o.x + o.width) {
                if (player.y - pH < o.topHeight || player.y + pH > o.bottomY) {
                    explodeDrone(player.x, player.y);
                    handleGameOver();
                    return;
                }
            }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.dx; p.y += p.dy; p.alpha -= 0.03;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    function renderLayers() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Stars Background
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        starfield.forEach(s => { ctx.fillRect(s.x, s.y, s.size, s.size); });

        // 2. Neon Matrix Grid lines
        ctx.strokeStyle = "rgba(0, 245, 212, 0.03)";
        ctx.lineWidth = 1;
        for (let x = -backgroundGridScroll; x < canvas.width; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }

        // 3. Electronic Fences
        obstacles.forEach(o => {
            ctx.save();
            ctx.fillStyle = "#120c33";
            ctx.strokeStyle = "#ff006e";
            ctx.lineWidth = 2;
            ctx.fillRect(o.x, 0, o.width, o.topHeight);
            ctx.strokeRect(o.x, 0, o.width, o.topHeight);

            ctx.fillRect(o.x, o.bottomY, o.width, canvas.height - o.bottomY);
            ctx.strokeRect(o.x, o.bottomY, o.width, canvas.height - o.bottomY);

            // Crackling Laser
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2 + Math.sin(o.pulse) * 1;
            ctx.shadowColor = "#ff006e";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(o.x + o.width / 2, o.topHeight);
            ctx.lineTo(o.x + o.width / 2, o.bottomY);
            ctx.stroke();
            ctx.restore();
        });

        // 4. Exhaust Particles
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });

        // 5. Cyber Drone Jet
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.tilt);
        ctx.shadowColor = "#00f5d4";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "#00f5d4";
        ctx.beginPath();
        ctx.moveTo(-player.width / 2, -player.height / 2);
        ctx.lineTo(player.width / 2, 0);
        ctx.lineTo(-player.width / 2, player.height / 2);
        ctx.lineTo(-player.width / 4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 6. Danger Floor Line
        ctx.fillStyle = "#0a0521";
        ctx.fillRect(0, canvas.height - 25, canvas.width, 25);
        ctx.strokeStyle = "#ff006e";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, canvas.height - 25); ctx.lineTo(canvas.width, canvas.height - 25); ctx.stroke();
    }

    function engineLoop() {
        if (!gameRunning) return;
        updateLogic();
        renderLayers();
        animationId = requestAnimationFrame(engineLoop);
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
        engineLoop();
    }

    function handleGameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        fbScreen.style.opacity = '1';
        fbScreen.style.visibility = 'visible';
        fbSub.innerHTML = `DRONE CRASHED! <br><span style="color:#ff006e; font-weight:900; font-size:16px;">SCORE: ${score}</span>`;
        fbBtn.innerText = "REBOOT MATRIX";
    }

    fbBtn.onclick = bootSequence;
    
    // Clean-up Reference for switching games safely
    window.fbCancelRef = () => { 
        gameRunning = false; 
        cancelAnimationFrame(animationId); 
        window.removeEventListener('keydown', handleKeyDown);
    };
}

function exitFlappyBird() {
    if (typeof window.fbCancelRef === 'function') window.fbCancelRef();
    if (typeof openGames === 'function') openGames();
}
