// js/games/reactionmaster.js

function startReactionMaster() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Zero-HTML Layout (Space Shooter Style Core Anchor)
    c.innerHTML = `
        <div id="rmContainer" style="position:relative; width:100%; height:100%; min-height: 500px; height: calc(100vh - 120px); overflow:hidden; background: #060913; touch-action: none;">
            <canvas id="rmCanvas" style="display:block; width:100%; height:100%; cursor:pointer;"></canvas>
            <button id="rmExitBtn" style="position:absolute; bottom:20px; right:20px; background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.4); color:#f43f5e; padding:8px 16px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; font-family:'Poppins',sans-serif; letter-spacing:1px;">ABORT TEST</button>
        </div>
    `;

    const canvas = document.getElementById('rmCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('rmContainer');
    const rmExitBtn = document.getElementById('rmExitBtn');

    // Handle responsive pixel ratios
    canvas.width = container.clientWidth || window.innerWidth;
    canvas.height = container.clientHeight || (window.innerHeight - 120);

    // Engine Core Variables
    // States: 'START_MENU', 'WAITING_RED', 'TRIGGER_GREEN', 'SHOW_RESULT', 'FINAL_SUMMARY'
    let gameState = 'START_MENU'; 
    let attempts = 0;
    const maxAttempts = 5;
    let bestScore = Infinity;
    let totalScoreSum = 0;
    
    let stateStartTime = 0;
    let triggerDelay = 0;
    let currentReactionTime = 0;
    let earlyTapPenalty = false;
    let animationId = null;

    // Glowing Neon Particle Array for background grid effect
    let matrixParticles = [];
    for (let i = 0; i < 25; i++) {
        matrixParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.2
        });
    }

    // Helper: Reset variables for a fresh game loop
    function bootNewSession() {
        attempts = 0;
        bestScore = Infinity;
        totalScoreSum = 0;
        goToState('START_MENU');
    }

    function goToState(nextState) {
        gameState = nextState;
        stateStartTime = window.performance.now();
        earlyTapPenalty = false;

        if (gameState === 'WAITING_RED') {
            // Random window between 1.5s to 4s
            triggerDelay = 1500 + Math.random() * 2500; 
        }
    }

    // Canvas Engine Physics & State Logic Updates
    function updateEngineFrame(currentTime) {
        // Particle background update
        matrixParticles.forEach(p => {
            p.y += p.speed;
            if (p.y > canvas.height) p.y = 0;
        });

        // Time ticker verification for Auto-Triggering Green
        if (gameState === 'WAITING_RED') {
            let elapsed = currentTime - stateStartTime;
            if (elapsed >= triggerDelay) {
                goToState('TRIGGER_GREEN');
            }
        }
    }

    // Canvas Core Render Pipeline (All Graphics Drawn Here)
    function drawEnginePipeline() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Space Cyber Background Space
        ctx.fillStyle = '#060913';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Matrix Background Particles
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        matrixParticles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // 2. Render UI Layers Based on State Machine
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (gameState === 'START_MENU') {
            // Title Glow
            ctx.shadowBlur = 20; ctx.shadowColor = '#38bdf8';
            ctx.fillStyle = '#ffffff'; ctx.font = '900 28px Poppins, sans-serif';
            ctx.fillText('REACTION MASTER', canvas.width / 2, canvas.height / 2 - 40);
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '500 12px Poppins';
            ctx.fillText('TEST YOUR NEURAL SYNAPSE TIMING', canvas.width / 2, canvas.height / 2);

            // Pulse Start Button
            let pulse = 1 + Math.sin(window.performance.now() * 0.005) * 0.05;
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2 + 70);
            ctx.scale(pulse, pulse);
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath(); ctx.roundRect(-80, -20, 160, 40, 10); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13px Poppins';
            ctx.fillText('ENGAGE TARGET', 0, 0);
            ctx.restore();

        } else if (gameState === 'WAITING_RED') {
            // High Intensity Warning Red Fill Overlays
            ctx.fillStyle = '#7f1d1d';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#ffffff'; ctx.font = '900 32px Poppins';
            ctx.fillText('HOLD POSITION...', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '500 13px Poppins';
            ctx.fillText('DO NOT TAP UNTIL GREEN STRIKES', canvas.width / 2, canvas.height / 2 + 20);

        } else if (gameState === 'TRIGGER_GREEN') {
            // Reaction Core Green Fill Overlays
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#ffffff'; ctx.font = '900 50px Poppins';
            ctx.shadowBlur = 30; ctx.shadowColor = '#ffffff';
            ctx.fillText('TAP NOW!', canvas.width / 2, canvas.height / 2);
            ctx.shadowBlur = 0;

        } else if (gameState === 'SHOW_RESULT') {
            ctx.fillStyle = '#ffffff'; ctx.font = '900 45px Poppins';
            
            if (earlyTapPenalty) {
                ctx.fillStyle = '#f43f5e';
                ctx.fillText('TOO EARLY!', canvas.width / 2, canvas.height / 2 - 20);
                ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '500 13px Poppins';
                ctx.fillText('Round registration disqualified.', canvas.width / 2, canvas.height / 2 + 25);
            } else {
                ctx.fillStyle = '#38bdf8'; ctx.shadowBlur = 15; ctx.shadowColor = '#38bdf8';
                ctx.fillText(`${currentReactionTime} ms`, canvas.width / 2, canvas.height / 2 - 20);
                ctx.shadowBlur = 0;
                
                ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '600 14px Poppins';
                let comment = currentReactionTime < 230 ? "⚡ EXTREME SPEED!" : "👍 STABLE REFLEX";
                ctx.fillText(comment, canvas.width / 2, canvas.height / 2 + 30);
            }

            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '500 11px Poppins';
            ctx.fillText('TAP ANYWHERE FOR NEXT LOOP SEQUENCE', canvas.width / 2, canvas.height - 100);

        } else if (gameState === 'FINAL_SUMMARY') {
            ctx.shadowBlur = 20; ctx.shadowColor = '#a855f7';
            ctx.fillStyle = '#ffffff'; ctx.font = '900 26px Poppins';
            ctx.fillText('EVALUATION COMPLETE', canvas.width / 2, canvas.height / 2 - 80);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#rgba(255,255,255,0.7)'; ctx.font = '500 14px Poppins';
            ctx.fillText(`Best Score: ${bestScore === Infinity ? 'N/A' : bestScore + ' ms'}`, canvas.width / 2, canvas.height / 2 - 20);
            
            let avg = Math.floor(totalScoreSum / maxAttempts);
            ctx.fillText(`Average Velocity: ${avg} ms`, canvas.width / 2, canvas.height / 2 + 10);

            // Re-engage Button
            ctx.fillStyle = '#a855f7';
            ctx.beginPath(); ctx.roundRect(canvas.width / 2 - 85, canvas.height / 2 + 60, 170, 42, 12); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px Poppins';
            ctx.fillText('RE-RUN CALIBRATION', canvas.width / 2, canvas.height / 2 + 81);
        }

        // 3. Persistent HUD Metrics Layer
        if (gameState !== 'START_MENU' && gameState !== 'FINAL_SUMMARY') {
            ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = 'bold 11px Poppins';
            ctx.fillText(`ATTEMPT: ${attempts}/${maxAttempts}`, 25, 30);
            ctx.textAlign = 'right';
            let bestStr = bestScore === Infinity ? '--' : `${bestScore} ms`;
            ctx.fillText(`PERSONAL BEST: ${bestStr}`, canvas.width - 25, 30);
        }
    }

    // Engine Core Animation Loop Frame
    function primaryEngineLoop(timestamp) {
        updateEngineFrame(timestamp);
        drawEnginePipeline();
        animationId = requestAnimationFrame(primaryEngineLoop);
    }

    // Explicit User Action Core Vector Parser
    function handleInteractions(e) {
        if (e && e.cancelable) e.preventDefault();
        let now = window.performance.now();

        if (gameState === 'START_MENU') {
            // Boundaries bounding check for menu click
            bootNewSession();
            goToState('WAITING_RED');

        } else if (gameState === 'WAITING_RED') {
            // User flunked: Tapped early
            earlyTapPenalty = true;
            attempts++;
            goToState('SHOW_RESULT');

            if (attempts >= maxAttempts) {
                setTimeout(() => { goToState('FINAL_SUMMARY'); }, 1200);
            }

        } else if (gameState === 'TRIGGER_GREEN') {
            // Perfect precision timing calculations
            let clickTime = window.performance.now();
            currentReactionTime = Math.floor(clickTime - stateStartTime);
            attempts++;
            
            if (!earlyTapPenalty) {
                totalScoreSum += currentReactionTime;
                if (currentReactionTime < bestScore) bestScore = currentReactionTime;
            }

            goToState('SHOW_RESULT');

            if (attempts >= maxAttempts) {
                setTimeout(() => { goToState('FINAL_SUMMARY'); }, 1500);
            }

        } else if (gameState === 'SHOW_RESULT') {
            if (attempts < maxAttempts) {
                goToState('WAITING_RED');
            } else {
                goToState('FINAL_SUMMARY');
            }
        } else if (gameState === 'FINAL_SUMMARY') {
            // Check boundary reset matrix
            bootNewSession();
            goToState('WAITING_RED');
        }
    }

    // Canvas Safe Listener Binding Mapping
    canvas.addEventListener('mousedown', handleInteractions);
    canvas.addEventListener('touchstart', handleInteractions, { passive: false });

    // Core Initialization Call
    animationId = requestAnimationFrame(primaryEngineLoop);

    // Secure Route Destructor
    window.rmCancelRef = () => {
        cancelAnimationFrame(animationId);
    };

    rmExitBtn.onclick = function() {
        if (typeof window.rmCancelRef === 'function') window.rmCancelRef();
        if (typeof openGames === 'function') openGames();
    };
}
