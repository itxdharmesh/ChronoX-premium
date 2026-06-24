// js/games/reactionmaster.js

function startReactionMaster() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div id="rmContainer" style="position:relative; width:100%; height:100%; min-height: 500px; height: calc(100vh - 120px); overflow:hidden; background: #0a0f1d; font-family: 'Poppins', sans-serif; user-select:none; -webkit-user-select:none; touch-action: none;">
            
            <div style="position:absolute; top:15px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; z-index:10; pointer-events:none;">
                <div style="background: rgba(10, 15, 30, 0.85); border: 1px solid #38bdf8; padding: 6px 14px; border-radius: 10px; backdrop-filter: blur(8px);">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">BEST TIME</span>
                    <span id="rmBest" style="color:#38bdf8; font-weight:900; font-size:16px; text-shadow: 0 0 10px rgba(56,189,248,0.4);">-- ms</span>
                </div>
                <div style="background: rgba(10, 15, 30, 0.85); border: 1px solid #a855f7; padding: 6px 14px; border-radius: 10px; backdrop-filter: blur(8px); text-align: right;">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">ATTEMPTS</span>
                    <span id="rmAttempts" style="color:#a855f7; font-weight:800; font-size:16px;">0/5</span>
                </div>
            </div>

            <div id="rmClickZone" style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; transition: background 0.1s ease; padding:20px;">
                <div id="rmMainIcon" style="font-size:55px; margin-bottom:15px; transition: transform 0.2s;">⚡</div>
                <h1 id="rmStatusText" style="font-size:26px; font-weight:900; color:#fff; text-align:center; letter-spacing:1px; margin:0;">REACTION TESTER</h1>
                <p id="rmDescText" style="font-size:12px; color:rgba(255,255,255,0.5); text-align:center; margin-top:10px; max-width:280px; line-height:1.6;">TAP TO START THE APPARATUS</p>
            </div>

            <button id="rmExitBtn" style="position:absolute; bottom:20px; right:20px; background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.4); color:#f43f5e; padding:8px 16px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; z-index:10; backdrop-filter:blur(5px); letter-spacing:1px;">ABORT TEST</button>

            <div id="rmScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: rgba(15, 23, 42, 0.98); border:1px solid #38bdf8; backdrop-filter:blur(20px); padding:35px 25px; border-radius:24px; text-align:center; width:88%; max-width:340px; box-shadow:0 20px 60px rgba(0,0,0,0.8); z-index:20; display:block;">
                <div style="width:60px; height:60px; background: rgba(56,189,248,0.15); border: 2px solid #38bdf8; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:26px;">🧠</div>
                <h1 style="font-size:21px; font-weight:900; letter-spacing:1px; color:#fff; margin-bottom:5px;">NEURAL REFLEX</h1>
                <p id="rmSub" style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:25px; letter-spacing:0.5px; line-height:1.5;">TEST YOUR SYNAPTIC SPEED. <br>TAP IMMEDIATELY WHEN SCREEN FLIPS GREEN.</p>
                <button id="rmBtn" style="background:linear-gradient(135deg,#38bdf8, #a855f7); border:none; padding:12px 30px; font-size:13px; font-weight:800; color:#fff; border-radius:12px; cursor:pointer; text-transform:uppercase; width:100%; box-shadow: 0 5px 15px rgba(56,189,248,0.3);">START EVALUATION</button>
            </div>
        </div>
    `;

    const clickZone = document.getElementById('rmClickZone');
    const rmMainIcon = document.getElementById('rmMainIcon');
    const statusText = document.getElementById('rmStatusText');
    const descText = document.getElementById('rmDescText');
    
    const rmScreen = document.getElementById('rmScreen');
    const rmSub = document.getElementById('rmSub');
    const rmBtn = document.getElementById('rmBtn');
    const rmExitBtn = document.getElementById('rmExitBtn');
    
    const rmBest = document.getElementById('rmBest');
    const rmAttempts = document.getElementById('rmAttempts');

    // Game States: 'IDLE', 'WAITING', 'TRIGGERED', 'RESULT'
    let gameState = 'IDLE'; 
    let startTime = 0;
    let timeoutId = null;
    let attempts = 0;
    let bestScore = Infinity;
    let totalScoreSum = 0;

    function resetInteractiveUI() {
        gameState = 'IDLE';
        clickZone.style.background = '#0a0f1d';
        rmMainIcon.innerText = '⚡';
        statusText.innerText = 'READY PLAYER';
        descText.innerText = 'TAP ANYWHERE TO INITIATE TIMING SCAN';
    }

    // Dynamic Action Controller
    function handleZoneClick(e) {
        if (e && e.cancelable) e.preventDefault();

        if (gameState === 'IDLE') {
            // Switch to Waiting Mode (Red Screen)
            gameState = 'WAITING';
            clickZone.style.background = '#b91c1c'; // Vivid Alert Red
            rmMainIcon.innerText = '🛑';
            statusText.innerText = 'HOLD POSITION...';
            descText.innerText = 'WAIT FOR GREEN ILLUMINATION';

            // Set dynamic randomize trigger timing window (1.5s to 4.5s)
            let randomDelay = Math.floor(Math.random() * 3000) + 1500;
            timeoutId = setTimeout(() => {
                gameState = 'TRIGGERED';
                clickZone.style.background = '#15803d'; // High Intensity Neon Green
                rmMainIcon.innerText = '💥';
                statusText.innerText = 'TAP NOW!';
                descText.innerText = 'BURST THE ZONE PROMPT!';
                startTime = window.performance.now(); // High precision clock timing
            }, randomDelay);

        } else if (gameState === 'WAITING') {
            // CHEATING PREVENTED: Tapped too early
            clearTimeout(timeoutId);
            gameState = 'RESULT';
            attempts++;
            if (rmAttempts) rmAttempts.innerText = `${attempts}/5`;
            
            clickZone.style.background = '#1e293b';
            rmMainIcon.innerText = '⚠️';
            statusText.innerText = 'TOO EARLY!';
            descText.innerText = 'Sanction applied. Click to cycle next round.';

            if (attempts >= 5) setTimeout(terminateEvaluationSuite, 1200);

        } else if (gameState === 'TRIGGERED') {
            // SUCCESSFUL REFLEX CAPTURE
            let endTime = window.performance.now();
            let reactionTime = Math.floor(endTime - startTime);
            gameState = 'RESULT';
            attempts++;
            totalScoreSum += reactionTime;
            
            if (rmAttempts) rmAttempts.innerText = `${attempts}/5`;
            
            if (reactionTime < bestScore) {
                bestScore = reactionTime;
                if (rmBest) rmBest.innerText = `${bestScore} ms`;
            }

            clickZone.style.background = '#0f172a';
            rmMainIcon.innerText = '⏱️';
            statusText.innerText = `${reactionTime} ms`;
            
            // Speed ratings descriptions
            let rating = "GODLIKE REFLEXES!";
            if (reactionTime > 400) rating = "SLUGGISH RESPONSES...";
            else if (reactionTime > 280) rating = "AVERAGE HUMAN TIMING.";
            else if (reactionTime > 200) rating = "CHAMPION SPEED TIER!";
            
            descText.innerText = `${rating} Tap to continue scanning.`;

            if (attempts >= 5) setTimeout(terminateEvaluationSuite, 1200);
        } else if (gameState === 'RESULT') {
            if (attempts < 5) {
                resetInteractiveUI();
            }
        }
    }

    clickZone.addEventListener('mousedown', handleZoneClick);
    clickZone.addEventListener('touchstart', handleZoneClick, { passive: false });

    function terminateEvaluationSuite() {
        gameState = 'IDLE';
        let avgScore = Math.floor(totalScoreSum / attempts);
        let absoluteBest = bestScore === Infinity ? 'N/A' : `${bestScore} ms`;
        
        rmScreen.style.display = 'block';
        rmSub.innerHTML = `NEURAL DIAGNOSTIC OVER! <br>
            Best Reflex: <span style="color:#38bdf8; font-weight:900;">${absoluteBest}</span><br>
            Avg Frequency: <span style="color:#a855f7; font-weight:900;">${attempts > 0 ? avgScore : 0} ms</span>`;
        rmBtn.innerText = "RE-ENGAGE SYSTEM";
    }

    function bootSequence() {
        rmScreen.style.display = 'none';
        attempts = 0;
        bestScore = Infinity;
        totalScoreSum = 0;
        if (rmBest) rmBest.innerText = "-- ms";
        if (rmAttempts) rmAttempts.innerText = "0/5";
        resetInteractiveUI();
    }

    rmBtn.onclick = bootSequence;

    rmExitBtn.onclick = function() {
        clearTimeout(timeoutId);
        if (typeof openGames === 'function') openGames();
    };
}
