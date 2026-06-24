// js/games/archery.js

function startArchery() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Advanced Cyber Archey Layout Structure Injected
    c.innerHTML = `
        <div id="archeryContainer" style="position:relative; width:100%; height:100%; min-height: 500px; height: calc(100vh - 120px); overflow:hidden; background: radial-gradient(circle at center, #0f172a 0%, #020617 100%); font-family: 'Poppins', sans-serif; user-select:none; -webkit-user-select:none;">
            
            <!-- Real-time Archer HUD Telemetry -->
            <div style="position:absolute; top:15px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:10; pointer-events:none;">
                <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #38bdf8; padding: 6px 14px; border-radius: 10px; backdrop-filter: blur(8px);">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">TOTAL SCORE</span>
                    <span id="arScore" style="color:#38bdf8; font-weight:900; font-size:16px; text-shadow: 0 0 10px rgba(56,189,248,0.4);">0000</span>
                </div>
                <!-- Dynamic Wind Vector Display -->
                <div id="arWindHUD" style="background: rgba(15, 23, 42, 0.85); border: 1px solid #f43f5e; padding: 6px 14px; border-radius: 10px; backdrop-filter: blur(8px); text-align: right;">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">WIND VECTOR</span>
                    <span id="arWind" style="color:#f43f5e; font-weight:800; font-size:14px;">0.00 m/s ➡️</span>
                </div>
            </div>

            <!-- Absolute Hardware Canvas Engine -->
            <canvas id="archeryCanvas" style="display:block; width:100%; height:100%; position:absolute; top:0; left:0; z-index:1; cursor:crosshair;"></canvas>

            <!-- Global Return Route Redirector Button -->
            <button id="arExitBtn" style="position:absolute; bottom:20px; right:20px; background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.4); color:#f43f5e; padding:8px 16px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; backdrop-filter:blur(5px); letter-spacing:1px;">ABORT GAME</button>

            <!-- Center Loaded Glass UI Pop Menu Panel -->
            <div id="arScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: rgba(15, 23, 42, 0.95); border:1px solid #38bdf8; backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); padding:35px 25px; border-radius:24px; text-align:center; width:88%; max-width:340px; box-shadow:0 20px 60px rgba(0,0,0,0.8); z-index:20; display:block;">
                <div style="width:60px; height:60px; background: rgba(56,189,248,0.15); border: 2px solid #38bdf8; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:26px;">🏹</div>
                <h1 style="font-size:22px; font-weight:900; letter-spacing:2px; color:#fff; margin-bottom:5px;">ARCHERY MASTER</h1>
                <p id="arSub" style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:25px; letter-spacing:1px; line-height:1.5;">DRAG, CALIBRATE FOR WIND FORCE <br>& RELEASE TO HIT THE CORE PIP</p>
                <button id="arBtn" style="background:linear-gradient(135deg,#38bdf8, #818cf8); border:none; padding:12px 30px; font-size:13px; font-weight:800; color:#fff; border-radius:12px; cursor:pointer; text-transform:uppercase; width:100%; box-shadow: 0 5px 15px rgba(56,189,248,0.3);">ENGAGE RANGE</button>
            </div>
        </div>
    `;

    const canvas = document.getElementById('archeryCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('archeryContainer');
    const arScreen = document.getElementById('arScreen');
    const arSub = document.getElementById('arSub');
    const arBtn = document.getElementById('arBtn');
    const arExitBtn = document.getElementById('arExitBtn');
    const arScore = document.getElementById('arScore');
    const arWind = document.getElementById('arWind');

    canvas.width = container.clientWidth || window.innerWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 120);

    let score = 0, arrowsLeft = 10, gameRunning = false;
    let arrow = null, target = {}, particles = [];
    let animationId = null;
    let windX = 0; // Wind velocity factor

    // Touch/Mouse Drag Tracking Model
    let isDragging = false;
    let dragStart = { x: 0, y: 0 }, dragCurrent = { x: 0, y: 0 };

    // Set static platform coordinates based on layout width bounds
    const bowPos = { x: 100, y: canvas.height / 2 + 50 };

    function generateNewWind() {
        // Generates crosswind force value between -1.8 and +1.8
        windX = (Math.random() * 3.6) - 1.8;
        let directionIndicator = windX > 0 ? "➡️" : "⬅️";
        arWind.innerText = `${Math.abs(windX).toFixed(2)} m/s ${directionIndicator}`;
    }

    function initTargetSpace() {
        target = {
            x: canvas.width - 120,
            y: canvas.height / 2 + (Math.random() * 160 - 80), // Vertical variation offset grid
            baseRadius: 40
        };
    }

    function createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 4 + 1;
            particles.push({
                x, y,
                radius: Math.random() * 2 + 1,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.015,
                color
            });
        }
    }

    function handleStartDrag(e) {
        if (!gameRunning || arrow) return;
        let rect = canvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        let mouseX = clientX - rect.left;
        let mouseY = clientY - rect.top;

        // Start pulling string only if player grabs near the Bow platform area
        if (Math.hypot(mouseX - bowPos.x, mouseY - bowPos.y) < 80) {
            isDragging = true;
            dragStart = { x: bowPos.x, y: bowPos.y };
            dragCurrent = { x: mouseX, y: mouseY };
        }
    }

    function handleMoveDrag(e) {
        if (!isDragging) return;
        if (e.preventDefault) e.preventDefault();
        
        let rect = canvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;

        dragCurrent.x = clientX - rect.left;
        dragCurrent.y = clientY - rect.top;
    }

    function handleReleaseDrag() {
        if (!isDragging) return;
        isDragging = false;

        // Calculate dynamic launching vectors based on the distance string was dragged backward
        let dx = dragStart.x - dragCurrent.x;
        let dy = dragStart.y - dragCurrent.y;
        let pullDistance = Math.hypot(dx, dy);

        if (pullDistance > 15) { // Minimum activation threshold trigger
            let velocityMultiplier = 0.15; // Velocity conversion scale factor
            arrow = {
                x: bowPos.x,
                y: bowPos.y,
                vx: dx * velocityMultiplier,
                vy: dy * velocityMultiplier,
                angle: Math.atan2(dy, dx),
                trail: []
            };
            arrowsLeft--;
        }
    }

    canvas.addEventListener('mousedown', handleStartDrag);
    canvas.addEventListener('mousemove', handleMoveDrag);
    window.addEventListener('mouseup', handleReleaseDrag);

    canvas.addEventListener('touchstart', handleStartDrag, { passive: false });
    canvas.addEventListener('touchmove', handleMoveDrag, { passive: false });
    window.addEventListener('touchend', handleReleaseDrag);

    function updateFrameLogic() {
        // 1. Kinetic Flight Matrix Processor for Active Arrow
        if (arrow) {
            arrow.trail.push({ x: arrow.x, y: arrow.y });
            if (arrow.trail.length > 8) arrow.trail.shift();

            // Inject continuous Crosswind offset and Gravity drag to the vector curves
            arrow.vx += windX * 0.03; 
            arrow.vy += 0.08; // Continuous down-pull Gravity factor
            
            arrow.x += arrow.vx;
            arrow.y += arrow.vy;
            arrow.angle = Math.atan2(arrow.vy, arrow.vx);

            // Bounds check: Out of screen bounds clear
            if (arrow.x > canvas.width || arrow.y > canvas.height || arrow.x < 0 || arrow.y < 0) {
                arrow = null;
                generateNewWind();
                if (arrowsLeft <= 0) handleGameOver();
            } else {
                // Raycast collision parsing with standard Olympic target rings
                let distToTargetCenter = Math.hypot(arrow.x - target.x, arrow.y - target.y);
                
                if (arrow.x >= target.x - 8 && arrow.x <= target.x + 15 && distToTargetCenter <= target.baseRadius) {
                    // Bullseye Score Evaluation Scale Matrix
                    let hitScore = 0;
                    let hitColor = '#000';

                    if (distToTargetCenter <= target.baseRadius * 0.2) {
                        hitScore = 50; hitColor = '#fbbf24'; // Yellow Bullseye Core Pip
                    } else if (distToTargetCenter <= target.baseRadius * 0.5) {
                        hitScore = 30; hitColor = '#ef4444'; // Red Ring Layer
                    } else if (distToTargetCenter <= target.baseRadius * 0.8) {
                        hitScore = 20; hitColor = '#3b82f6'; // Blue Ring Layer
                    } else {
                        hitScore = 10; hitColor = '#ffffff'; // White Outer Bound Layer
                    }

                    createExplosion(arrow.x, arrow.y, hitColor);
                    score += hitScore;
                    arScore.innerText = String(score).padStart(4, '0');
                    
                    arrow = null;
                    generateNewWind();
                    initTargetSpace(); // Relocate target ring grid positions cleanly

                    if (arrowsLeft <= 0) handleGameOver();
                }
            }
        }

        // Particle Decay loop
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.dx; p.y += p.dy; p.alpha -= p.decay;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    function drawRenderPipeline() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Olympic Target Board Rings
        ctx.save();
        let rings = [
            { r: target.baseRadius, c: '#ffffff', b: '#cbd5e1' }, // White ring
            { r: target.baseRadius * 0.8, c: '#3b82f6', b: '#1d4ed8' }, // Blue ring
            { r: target.baseRadius * 0.5, c: '#ef4444', b: '#b91c1c' }, // Red ring
            { r: target.baseRadius * 0.2, c: '#fbbf24', b: '#b45309' }  // Yellow Gold Core Pip
        ];

        rings.forEach(ring => {
            ctx.fillStyle = ring.c;
            ctx.strokeStyle = ring.b;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(target.x, target.y, ring.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
        ctx.restore();

        // 2. Render Archer Mechanical Bow Asset Control System
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Drawing standard recurve arc shapes
        ctx.arc(bowPos.x, bowPos.y, 45, -Math.PI/2, Math.PI/2);
        ctx.stroke();

        // If string drag state is live, track tension lines
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (isDragging) {
            ctx.moveTo(bowPos.x, bowPos.y - 45);
            ctx.lineTo(dragCurrent.x, dragCurrent.y);
            ctx.lineTo(bowPos.x, bowPos.y + 45);
            
            // Render tactical launch guide vector prediction dots
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            let tX = bowPos.x, tY = bowPos.y;
            let tVx = (bowPos.x - dragCurrent.x) * 0.15;
            let tVy = (bowPos.y - dragCurrent.y) * 0.15;
            for (let i = 0; i < 20; i++) {
                tVx += windX * 0.03; tVy += 0.08;
                tX += tVx; tY += tVy;
                if(i % 3 === 0) {
                    ctx.beginPath(); ctx.arc(tX, tY, 2, 0, Math.PI*2); ctx.fill();
                }
            }
        } else {
            ctx.moveTo(bowPos.x, bowPos.y - 45);
            ctx.lineTo(bowPos.x, bowPos.y + 45);
        }
        ctx.stroke();
        ctx.restore();

        // 3. Active Arrow Flight Path Pipeline Render
        if (arrow) {
            ctx.save();
            // Arrow Trail Lines
            if (arrow.trail.length > 1) {
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(arrow.trail[0].x, arrow.trail[0].y);
                for(let i=1; i<arrow.trail.length; i++) ctx.lineTo(arrow.trail[i].x, arrow.trail[i].y);
                ctx.stroke();
            }

            ctx.translate(arrow.x, arrow.y);
            ctx.rotate(arrow.angle);
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-30, 0);
            ctx.lineTo(0, 0);
            ctx.stroke();

            // Arrow Feather Fletchings Block
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(-30, 0);
            ctx.lineTo(-36, -5);
            ctx.lineTo(-32, 0);
            ctx.lineTo(-36, 5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // 4. Render Fragments Matrix Passes
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 5. Remaining Quiver Arrow Count Indicator UI Element
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '11px Poppins';
        ctx.fillText(`QUIVER QUANTITY: ${arrowsLeft} 🏹`, 20, canvas.height - 25);
    }

    function engineLoop() {
        if (!gameRunning) return;
        updateFrameLogic();
        drawRenderPipeline();
        animationId = requestAnimationFrame(engineLoop);
    }

    function bootSequence() {
        arScreen.style.display = 'none';
        score = 0; arrowsLeft = 10; arrow = null; particles = [];
        arScore.innerText = "0000";
        gameRunning = true;

        generateNewWind();
        initTargetSpace();
        engineLoop();
    }

    function handleGameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);

        arScreen.style.display = 'block';
        arSub.innerHTML = `RANGE TRAINING CONCLUDED! <br><span style="color:#38bdf8; font-weight:900; font-size:15px;">TOTAL ARCHERY SCORE: ${score}</span>`;
        arBtn.innerText = "RE-LOAD RANGE PLATFORM";
    }

    arBtn.onclick = bootSequence;

    // Window global tracker destruction cleanup handling memory leaks
    window.arCancelRef = () => {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        window.removeEventListener('mouseup', handleReleaseDrag);
        window.removeEventListener('touchend', handleReleaseDrag);
    };

    arExitBtn.onclick = function() {
        if (typeof window.arCancelRef === 'function') window.arCancelRef();
        if (typeof openGames === 'function') openGames();
    };
}
