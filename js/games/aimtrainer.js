// js/games/aimtrainer.js

function startAimTrainer() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div id="atContainer" style="position:relative; width:100%; height:100%; min-height: 500px; height: calc(100vh - 120px); overflow:hidden; background: #060814; font-family: 'Poppins', sans-serif; user-select:none; -webkit-user-select:none;">
            
            <div style="position:absolute; top:15px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:10; pointer-events:none;">
                <div style="background: rgba(10, 15, 30, 0.85); border: 1px solid #00D4FF; padding: 6px 14px; border-radius: 10px; backdrop-filter: blur(8px);">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">SCORE</span>
                    <span id="atScore" style="color:#00D4FF; font-weight:900; font-size:16px; text-shadow: 0 0 10px #00D4FF;">0000</span>
                </div>
                <div style="background: rgba(10, 15, 30, 0.85); border: 1px solid #FFA502; padding: 6px 14px; border-radius: 10px; backdrop-filter: blur(8px);">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">TIME REMAINING</span>
                    <span id="atTimer" style="color:#FFA502; font-weight:800; font-size:16px;">30s</span>
                </div>
            </div>

            <canvas id="atCanvas" style="display:block; width:100%; height:100%; position:absolute; top:0; left:0; z-index:1; cursor:crosshair;"></canvas>

            <button id="atExitBtn" style="position:absolute; bottom:20px; right:20px; background:rgba(255,71,87,0.15); border:1px solid rgba(255,71,87,0.5); color:#ff4757; padding:8px 16px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; backdrop-filter:blur(5px); letter-spacing:1px;">ABORT TRAINING</button>

            <div id="atScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: rgba(10, 14, 30, 0.95); border:1px solid #00D4FF; backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); padding:35px 25px; border-radius:24px; text-align:center; width:88%; max-width:340px; box-shadow:0 20px 60px rgba(0,0,0,0.8); z-index:20; display:block;">
                <div style="width:60px; height:60px; background: rgba(0,212,255,0.15); border: 2px solid #00D4FF; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:26px;">🎯</div>
                <h1 style="font-size:22px; font-weight:900; letter-spacing:2px; color:#fff; margin-bottom:5px;">AIM TRAINER PRO</h1>
                <p id="atSub" style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:25px; letter-spacing:1px;">TACTICAL REFLEX SIMULATION</p>
                <button id="atBtn" style="background:linear-gradient(135deg,#00D4FF, #7C3AED); border:none; padding:12px 30px; font-size:13px; font-weight:800; color:#fff; border-radius:12px; cursor:pointer; text-transform:uppercase; width:100%; box-shadow: 0 5px 15px rgba(0,212,255,0.3);">START SIMULATION</button>
            </div>
        </div>
    `;

    const canvas = document.getElementById('atCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('atContainer');
    const atScreen = document.getElementById('atScreen');
    const atSub = document.getElementById('atSub');
    const atBtn = document.getElementById('atBtn');
    const atExitBtn = document.getElementById('atExitBtn');
    const atScore = document.getElementById('atScore');
    const atTimer = document.getElementById('atTimer');

    canvas.width = container.clientWidth || window.innerWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 120);

    let score = 0, timeLeft = 30, gameRunning = false;
    let targets = [], particles = [];
    let clockInterval = null, animationId = null;
    
    const targetRadius = 16; // Stable crisp size for professional look

    function spawnTarget() {
        // Strict cap: screen par hamesha maximum 4 separate targets hi dikhenge
        if (targets.length >= 4) return;

        let maxAttempts = 50; // Finite try-loop block to prevent browser freeze
        let colors = ['#00D4FF', '#7C3AED', '#2ED573', '#FFA502'];

        for (let i = 0; i < maxAttempts; i++) {
            let potentialX = Math.random() * (canvas.width - 100) + 50;
            let potentialY = Math.random() * (canvas.height - 180) + 90;
            
            // Distance check to guarantee no overlapping clumps
            let isOverlapping = false;
            for (let j = 0; j < targets.length; j++) {
                let dist = Math.hypot(targets[j].x - potentialX, targets[j].y - potentialY);
                if (dist < targetRadius * 3.5) { // Safe separation buffer zone
                    isOverlapping = true;
                    break;
                }
            }

            // Valid non-cluttered space found
            if (!isOverlapping) {
                targets.push({
                    x: potentialX,
                    y: potentialY,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
                break;
            }
        }
    }

    function createExplosion(x, y, color) {
        for (let i = 0; i < 10; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 3 + 1;
            particles.push({
                x, y,
                radius: Math.random() * 2 + 1,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.04 + 0.02,
                color
            });
        }
    }

    function handleInputFire(e) {
        if (!gameRunning) return;
        if (e.preventDefault) e.preventDefault();

        let rect = canvas.getBoundingClientRect();
        let clickX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        let clickY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

        let hitRegister = false;

        for (let i = targets.length - 1; i >= 0; i--) {
            let t = targets[i];
            let distance = Math.hypot(t.x - clickX, t.y - clickY);

            if (distance <= targetRadius + 6) { // Generous clickable padding box
                createExplosion(t.x, t.y, t.color);
                score += 10;
                atScore.innerText = String(score).padStart(4, '0');
                targets.splice(i, 1);
                hitRegister = true;
                
                // Instantly inject a clean replacement node somewhere else
                spawnTarget();
                break;
            }
        }

        if (!hitRegister && score > 2) {
            score -= 2;
            atScore.innerText = String(score).padStart(4, '0');
        }
    }

    canvas.addEventListener('mousedown', handleInputFire);
    canvas.addEventListener('touchstart', handleInputFire, { passive: false });

    function updateFrameLogic() {
        // Refill array if any target gets removed or pool drops
        while (targets.length < 4) {
            spawnTarget();
        }

        // Particle dynamics loops
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.dx; p.y += p.dy; p.alpha -= p.decay;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    function drawRenderPipeline() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render targets with tactical locked holographic vector details
        targets.forEach(t => {
            ctx.save();
            ctx.shadowBlur = 12;
            ctx.shadowColor = t.color;
            
            // Premium Crisp Outer Ring Layout
            ctx.strokeStyle = t.color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(t.x, t.y, targetRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Center Solid Core Pip
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Tactical Crosshair Peripheral Reticle Lines
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(t.x - targetRadius - 4, t.y); ctx.lineTo(t.x - targetRadius + 2, t.y);
            ctx.moveTo(t.x + targetRadius - 2, t.y); ctx.lineTo(t.x + targetRadius + 4, t.y);
            ctx.moveTo(t.x, t.y - targetRadius - 4); ctx.lineTo(t.x, t.y - targetRadius + 2);
            ctx.moveTo(t.x, t.y + targetRadius - 2); ctx.lineTo(t.x, t.y + targetRadius + 4);
            ctx.stroke();
            
            ctx.restore();
        });

        // Fragments Render pass
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    function engineLoop() {
        if (!gameRunning) return;
        updateFrameLogic();
        drawRenderPipeline();
        animationId = requestAnimationFrame(engineLoop);
    }

    function bootSequence() {
        atScreen.style.display = 'none';
        score = 0; timeLeft = 30; targets = []; particles = [];
        atScore.innerText = "0000";
        atTimer.innerText = "30s";
        gameRunning = true;

        // Fresh dynamic initial map population
        for (let i = 0; i < 4; i++) spawnTarget();

        clockInterval = setInterval(() => {
            timeLeft--;
            atTimer.innerText = timeLeft + "s";
            if (timeLeft <= 0) handleGameOver();
        }, 1000);

        engineLoop();
    }

    function handleGameOver() {
        gameRunning = false;
        clearInterval(clockInterval);
        cancelAnimationFrame(animationId);

        atScreen.style.display = 'block';
        atSub.innerHTML = `TRAINING COMPLETED! <br><span style="color:#00D4FF; font-weight:900; font-size:15px;">FINAL SCORE: ${score}</span>`;
        atBtn.innerText = "TRY AGAIN";
    }

    atBtn.onclick = bootSequence;

    window.atCancelRef = () => {
        gameRunning = false;
        clearInterval(clockInterval);
        cancelAnimationFrame(animationId);
    };

    atExitBtn.onclick = function() {
        if (typeof window.atCancelRef === 'function') window.atCancelRef();
        if (typeof openGames === 'function') openGames();
    };
}
