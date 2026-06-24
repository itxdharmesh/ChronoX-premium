// js/games/aimtrainer.js

function startAimTrainer() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Premium Cyber HTML Structure Injection
    c.innerHTML = `
        <div id="atContainer" style="position:relative; width:100%; height:100%; min-height: 500px; height: calc(100vh - 120px); overflow:hidden; background: #050716; font-family: 'Poppins', sans-serif; user-select:none; -webkit-user-select:none;">
            
            <div style="position:absolute; top:15px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:10; pointer-events:none;">
                <div style="background: rgba(6, 9, 25, 0.85); border: 1px solid rgba(46, 213, 115, 0.4); padding: 6px 14px; border-radius: 10px; backdrop-filter: blur(8px);">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">SCORE METRIC</span>
                    <span id="atScore" style="color:#2ED573; font-weight:900; font-size:16px; text-shadow: 0 0 10px #2ED573;">0000</span>
                </div>
                <div style="background: rgba(6, 9, 25, 0.85); border: 1px solid rgba(255, 165, 2, 0.3); padding: 6px 14px; border-radius: 10px; backdrop-filter: blur(8px);">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">TIME REMAINING</span>
                    <span id="atTimer" style="color:#FFA502; font-weight:800; font-size:16px; text-shadow: 0 0 10px #FFA502;">30s</span>
                </div>
            </div>

            <canvas id="atCanvas" style="display:block; width:100%; height:100%; position:absolute; top:0; left:0; z-index:1; background:#050716; cursor:crosshair;"></canvas>

            <button id="atExitBtn" style="position:absolute; bottom:20px; right:20px; background:rgba(255,71,87,0.2); border:1px solid rgba(255,71,87,0.5); color:#ff4757; padding:8px 16px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; backdrop-filter:blur(5px); letter-spacing:1px;">ABORT TRAINING</button>

            <div id="atScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: rgba(14, 20, 45, 0.95); border:1px solid rgba(46, 213, 115, 0.4); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); padding:35px 25px; border-radius:24px; text-align:center; width:88%; max-width:340px; box-shadow:0 20px 60px rgba(0,0,0,0.8); z-index:20; display:block;">
                <div style="width:60px; height:60px; background: rgba(46,213,115,0.2); border: 2px solid #2ED573; border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:28px;">🎯</div>
                <h1 style="font-size:22px; font-weight:900; letter-spacing:2px; color:#fff; margin-bottom:5px; text-transform:uppercase;">AIM TRAINER</h1>
                <p id="atSub" style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:25px; letter-spacing:1px; line-height:1.5;">REFLEX & ACCURACY STIMULUS <br><span style="color:#2ED573;">HIT THE TARGET CORES RAPIDLY</span></p>
                <button id="atBtn" style="background:linear-gradient(135deg,#2ED573, #FFA502); border:none; padding:14px 30px; font-size:13px; font-weight:800; color:#fff; border-radius:12px; cursor:pointer; text-transform:uppercase; letter-spacing:1px; width:100%; box-shadow: 0 5px 15px rgba(46,213,115,0.4);">START SIMULATION</button>
            </div>
        </div>
    `;

    // Grabbing Dynamic Layout DOM Handles
    const canvas = document.getElementById('atCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('atContainer');
    const atScreen = document.getElementById('atScreen');
    const atSub = document.getElementById('atSub');
    const atBtn = document.getElementById('atBtn');
    const atExitBtn = document.getElementById('atExitBtn');
    const atScore = document.getElementById('atScore');
    const atTimer = document.getElementById('atTimer');

    // Safe Canvas Bounds Calculations
    canvas.width = container.clientWidth || window.innerWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 120);

    let score = 0, timeLeft = 30, gameRunning = false;
    let targets = [], particles = [];
    let clockInterval = null, animationId = null, frameCount = 0;

    function spawnTarget() {
        // Maximum 4 active core nodes inside view grid bounds
        if (targets.length < 4) {
            let colors = ['#00D4FF', '#7C3AED', '#FF4757', '#2ED573', '#FFA502'];
            targets.push({
                id: Math.random(),
                x: Math.random() * (canvas.width - 80) + 40,
                y: Math.random() * (canvas.height - 180) + 90,
                radius: 2,
                maxRadius: Math.random() * 12 + 18,
                growing: true,
                speed: Math.random() * 0.3 + 0.35,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    function createExplosion(x, y, color) {
        for (let i = 0; i < 12; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 3.5 + 1.5;
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

    // High Precision Input Raycast Matrix Handler
    function handleInputFire(e) {
        if (!gameRunning) return;
        if (e.preventDefault) e.preventDefault();

        let rect = canvas.getBoundingClientRect();
        let clickX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        let clickY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

        let hitRegister = false;

        // Trace vectors backwards to catch topmost overlapping node layers
        for (let i = targets.length - 1; i >= 0; i--) {
            let t = targets[i];
            let distance = Math.hypot(t.x - clickX, t.y - clickY);

            // Generous mobile hit bounding box padding (adds 8px dynamic tap area)
            if (distance <= t.radius + 8) {
                createExplosion(t.x, t.y, t.color);
                
                // Bonus Score Calculation: Smarter precise tiny targets fetch massive multipliers
                let precisionFactor = Math.max(10, Math.floor((1 - (t.radius / t.maxRadius)) * 50));
                score += precisionFactor;
                
                atScore.innerText = String(score).padStart(4, '0');
                targets.splice(i, 1);
                hitRegister = true;
                
                spawnTarget();
                break;
            }
        }

        // Tactical missed penalizer flash
        if (!hitRegister) {
            createExplosion(clickX, clickY, 'rgba(255,255,255,0.2)');
            if (score > 5) score -= 5;
            atScore.innerText = String(score).padStart(4, '0');
        }
    }

    canvas.addEventListener('mousedown', handleInputFire);
    canvas.addEventListener('touchstart', handleInputFire, { passive: false });

    function updateFrameLogic() {
        frameCount++;

        // Lifecycle loops inside expanding node targets arrays
        for (let i = targets.length - 1; i >= 0; i--) {
            let t = targets[i];
            if (t.growing) {
                t.radius += t.speed;
                if (t.radius >= t.maxRadius) t.growing = false;
            } else {
                t.radius -= t.speed * 0.8;
                // Target completely shriveled and expired without manual clicks
                if (t.radius <= 2) {
                    targets.splice(i, 1);
                    continue;
                }
            }
        }

        // Continuous automatic node structural stream refills
        if (frameCount % 45 === 0 || targets.length === 0) {
            spawnTarget();
        }

        // Decay micro fragments inside explosion particle loops
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.dx; p.y += p.dy; p.alpha -= p.decay;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    function drawRenderPipeline() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Geometric Targets Layers with Double Outer Bloom Ring Blurs
        targets.forEach(t => {
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = t.color;
            
            // Outer Concentric Circle Ring
            ctx.strokeStyle = t.color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner Quantum White Tracking Core Eye
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(t.x, t.y, Math.max(1.5, t.radius * 0.35), 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });

        // 2. Render Burst Fragments Matrix
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
        // Clear UI states layers cleanly
        atScreen.style.display = 'none';

        score = 0; timeLeft = 30; targets = []; particles = [];
        atScore.innerText = "0000";
        atTimer.innerText = "30s";

        gameRunning = true;
        
        // Populate view grid blocks instantly
        spawnTarget(); spawnTarget(); spawnTarget();

        // Safe Clock Countdown Engine 
        clockInterval = setInterval(() => {
            timeLeft--;
            atTimer.innerText = timeLeft + "s";
            
            if (timeLeft <= 0) {
                handleGameOver();
            }
        }, 1000);

        engineLoop();
    }

    function handleGameOver() {
        gameRunning = false;
        clearInterval(clockInterval);
        cancelAnimationFrame(animationId);

        atScreen.style.display = 'block';
        atSub.innerHTML = `TRAINING MATRICES FINALIZED! <br><span style="color:#2ED573; font-weight:900; font-size:15px; text-shadow:0 0 10px #2ED573;">EFFICIENCY SCORE: ${score}</span>`;
        atBtn.innerText = "RE-ENGAGE TARGET SECTORS";
    }

    // Attach click triggers cleanly to inner button instances
    atBtn.onclick = bootSequence;

    // Window global tracker destruction cleanup handling leaks 
    window.atCancelRef = () => {
        gameRunning = false;
        clearInterval(clockInterval);
        cancelAnimationFrame(animationId);
    };

    // Return Routing back into layout Main Menu Router Engine
    atExitBtn.onclick = function() {
        if (typeof window.atCancelRef === 'function') window.atCancelRef();
        if (typeof openGames === 'function') openGames();
    };
}
