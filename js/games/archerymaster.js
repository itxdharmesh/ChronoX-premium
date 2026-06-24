// Direct injection inside main router file to bypass loading issues
window.startArchery = function() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div id="archeryContainer" style="position:relative; width:100%; height:100%; min-height: 500px; height: calc(100vh - 120px); overflow:hidden; background: radial-gradient(circle at center, #0f172a 0%, #020617 100%); font-family: 'Poppins', sans-serif; user-select:none;">
            <div style="position:absolute; top:15px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:10; pointer-events:none;">
                <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #38bdf8; padding: 6px 14px; border-radius: 10px;">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block;">TOTAL SCORE</span>
                    <span id="arScore" style="color:#38bdf8; font-weight:900; font-size:16px;">0000</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #f43f5e; padding: 6px 14px; border-radius: 10px; text-align: right;">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block;">WIND VECTOR</span>
                    <span id="arWind" style="color:#f43f5e; font-weight:800; font-size:14px;">0.00 m/s ➡️</span>
                </div>
            </div>
            <canvas id="archeryCanvas" style="display:block; width:100%; height:100%; position:absolute; top:0; left:0; z-index:1; cursor:crosshair;"></canvas>
            <button id="arExitBtn" style="position:absolute; bottom:20px; right:20px; background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.4); color:#f43f5e; padding:8px 16px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10;">ABORT GAME</button>
            <div id="arScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: rgba(15, 23, 42, 0.95); border:1px solid #38bdf8; backdrop-filter:blur(20px); padding:35px 25px; border-radius:24px; text-align:center; width:88%; max-width:340px; z-index:20; display:block;">
                <div style="width:60px; height:60px; background: rgba(56,189,248,0.15); border: 2px solid #38bdf8; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:26px;">🏹</div>
                <h1 style="font-size:22px; font-weight:900; color:#fff; margin-bottom:5px;">ARCHERY MASTER</h1>
                <p id="arSub" style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:25px;">DRAG, CALIBRATE FOR WIND & RELEASE</p>
                <button id="arBtn" style="background:linear-gradient(135deg,#38bdf8, #818cf8); border:none; padding:12px 30px; font-size:13px; font-weight:800; color:#fff; border-radius:12px; cursor:pointer; width:100%;">ENGAGE RANGE</button>
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
    let animationId = null, windX = 0;
    let isDragging = false, dragStart = { x: 0, y: 0 }, dragCurrent = { x: 0, y: 0 };
    const bowPos = { x: 100, y: canvas.height / 2 + 30 };

    function generateNewWind() {
        windX = (Math.random() * 3.2) - 1.6;
        let dir = windX > 0 ? "➡️" : "⬅️";
        if (arWind) arWind.innerText = `${Math.abs(windX).toFixed(2)} m/s ${dir}`;
    }

    function initTargetSpace() {
        target = { x: canvas.width - 120, y: canvas.height / 2 + (Math.random() * 140 - 70), baseRadius: 38 };
    }

    function createExplosion(x, y, color) {
        for (let i = 0; i < 12; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 3 + 1;
            particles.push({
                x, y, radius: Math.random() * 2 + 1,
                dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed,
                alpha: 1, decay: Math.random() * 0.04 + 0.02, color
            });
        }
    }

    function handleStartDrag(e) {
        if (!gameRunning || arrow) return;
        let rect = canvas.getBoundingClientRect();
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let mouseX = clientX - rect.left, mouseY = clientY - rect.top;

        if (Math.hypot(mouseX - bowPos.x, mouseY - bowPos.y) < 100) {
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
        let dx = dragStart.x - dragCurrent.x, dy = dragStart.y - dragCurrent.y;
        if (Math.hypot(dx, dy) > 15) {
            arrow = { x: bowPos.x, y: bowPos.y, vx: dx * 0.14, vy: dy * 0.14, angle: Math.atan2(dy, dx), trail: [] };
            arrowsLeft--;
        }
    }

    canvas.addEventListener('mousedown', handleStartDrag);
    canvas.addEventListener('mousemove', handleMoveDrag);
    canvas.addEventListener('mouseup', handleReleaseDrag);
    canvas.addEventListener('touchstart', handleStartDrag, { passive: false });
    canvas.addEventListener('touchmove', handleMoveDrag, { passive: false });
    canvas.addEventListener('touchend', handleReleaseDrag);

    function updateFrameLogic() {
        if (arrow) {
            arrow.trail.push({ x: arrow.x, y: arrow.y });
            if (arrow.trail.length > 6) arrow.trail.shift();
            arrow.vx += windX * 0.025; arrow.vy += 0.075;
            arrow.x += arrow.vx; arrow.y += arrow.vy;
            arrow.angle = Math.atan2(arrow.vy, arrow.vx);

            if (arrow.x > canvas.width || arrow.y > canvas.height || arrow.x < 0 || arrow.y < 0) {
                arrow = null; generateNewWind();
                if (arrowsLeft <= 0) handleGameOver();
            } else {
                let dist = Math.hypot(arrow.x - target.x, arrow.y - target.y);
                if (arrow.x >= target.x - 5 && arrow.x <= target.x + 10 && dist <= target.baseRadius) {
                    let hitScore = 10, hitColor = '#ffffff';
                    if (dist <= target.baseRadius * 0.2) { hitScore = 50; hitColor = '#fbbf24'; }
                    else if (dist <= target.baseRadius * 0.5) { hitScore = 30; hitColor = '#ef4444'; }
                    else if (dist <= target.baseRadius * 0.8) { hitScore = 20; hitColor = '#3b82f6'; }

                    createExplosion(arrow.x, arrow.y, hitColor);
                    score += hitScore;
                    if (arScore) arScore.innerText = String(score).padStart(4, '0');
                    arrow = null; generateNewWind(); initTargetSpace();
                    if (arrowsLeft <= 0) handleGameOver();
                }
            }
        }
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i]; p.x += p.dx; p.y += p.dy; p.alpha -= p.decay;
            if (p.alpha <= 0) particles.splice(i, 1);
        }
    }

    function drawRenderPipeline() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        let rings = [
            { r: target.baseRadius, c: '#ffffff', b: '#cbd5e1' },
            { r: target.baseRadius * 0.8, c: '#3b82f6', b: '#1d4ed8' },
            { r: target.baseRadius * 0.5, c: '#ef4444', b: '#b91c1c' },
            { r: target.baseRadius * 0.2, c: '#fbbf24', b: '#b45309' }
        ];
        rings.forEach(ring => {
            ctx.fillStyle = ring.c; ctx.strokeStyle = ring.b; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(target.x, target.y, ring.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        });
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(bowPos.x, bowPos.y, 40, -Math.PI/2, Math.PI/2); ctx.stroke();
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.beginPath();
        if (isDragging) {
            ctx.moveTo(bowPos.x, bowPos.y - 40); ctx.lineTo(dragCurrent.x, dragCurrent.y); ctx.lineTo(bowPos.x, bowPos.y + 40);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            let tX = bowPos.x, tY = bowPos.y, tVx = (bowPos.x - dragCurrent.x) * 0.14, tVy = (bowPos.y - dragCurrent.y) * 0.14;
            for (let i = 0; i < 15; i++) {
                tVx += windX * 0.025; tVy += 0.075; tX += tVx; tY += tVy;
                if(i % 3 === 0) { ctx.beginPath(); ctx.arc(tX, tY, 2, 0, Math.PI*2); ctx.fill(); }
            }
        } else {
            ctx.moveTo(bowPos.x, bowPos.y - 40); ctx.lineTo(bowPos.x, bowPos.y + 40);
        }
        ctx.stroke(); ctx.restore();

        if (arrow) {
            ctx.save(); ctx.translate(arrow.x, arrow.y); ctx.rotate(arrow.angle);
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-25, 0); ctx.lineTo(0, 0); ctx.stroke();
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(-25, 0); ctx.lineTo(-30, -4); ctx.lineTo(-28, 0); ctx.lineTo(-30, 4); ctx.closePath(); ctx.fill();
            ctx.restore();
        }

        particles.forEach(p => {
            ctx.save(); ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        });

        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '11px Poppins';
        ctx.fillText(`QUIVER QUANTITY: ${arrowsLeft} 🏹`, 20, canvas.height - 25);
    }

    function engineLoop() {
        if (!gameRunning) return;
        updateFrameLogic(); drawRenderPipeline();
        animationId = requestAnimationFrame(engineLoop);
    }

    function bootSequence() {
        arScreen.style.display = 'none';
        score = 0; arrowsLeft = 10; arrow = null; particles = [];
        if (arScore) arScore.innerText = "0000";
        gameRunning = true; generateNewWind(); initTargetSpace(); engineLoop();
    }

    arBtn.onclick = bootSequence;
    window.arCancelRef = () => { gameRunning = false; cancelAnimationFrame(animationId); };
    arExitBtn.onclick = function() {
        if (typeof window.arCancelRef === 'function') window.arCancelRef();
        if (typeof openGames === 'function') openGames();
    };
};
