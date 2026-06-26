function startReactionMaster() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    c.innerHTML = `
        <div id="rmContainer" style="position:relative;width:100%;height:100%;min-height:500px;height:calc(100vh - 150px);overflow:hidden;background:radial-gradient(circle at center,#0a0f1e 0%,#03050a 100%);font-family:'Poppins',sans-serif;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            <div style="position:absolute;top:15px;left:0;width:100%;display:flex;justify-content:space-between;padding:0 20px;z-index:10;pointer-events:none;">
                <div class="glass-panel" style="padding:8px 16px;"><span style="font-size:10px;color:#888;">SCORE</span><span id="rmScore" style="color:#00D4FF;font-weight:900;">0</span></div>
                <div class="glass-panel" style="padding:8px 16px;"><span style="font-size:10px;color:#888;">BEST</span><span id="rmBest" style="color:#D4AF37;font-weight:900;">0</span></div>
            </div>
            <div id="rmTarget" class="glass-panel" style="width:120px;height:120px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:3rem;background:rgba(0,212,255,0.15);border:2px solid #00D4FF;box-shadow:0 0 40px rgba(0,212,255,0.4);transition:all 0.1s;cursor:pointer;">🎯</div>
            <div id="rmStatus" style="position:absolute;bottom:100px;text-align:center;color:#00D4FF;font-weight:900;font-size:14px;">TAP THE TARGET!</div>
            <button onclick="exitReactionMaster()" style="position:absolute;bottom:20px;right:20px;background:rgba(255,71,87,0.1);border:1px solid rgba(255,71,87,0.4);color:#ff4757;padding:8px 16px;border-radius:12px;font-size:11px;cursor:pointer;z-index:10;">EXIT</button>
        </div>
    `;
    
    let score = 0, best = parseInt(localStorage.getItem('reactionBest')||'0'), startTime, timeoutId;
    const target = document.getElementById('rmTarget');
    const container = document.getElementById('rmContainer');
    document.getElementById('rmBest').textContent = best;
    
    function spawnTarget() {
        target.style.left = Math.random() * (container.clientWidth - 140) + 10 + 'px';
        target.style.top = Math.random() * (container.clientHeight - 250) + 60 + 'px';
        target.style.display = 'flex';
        target.style.background = 'rgba(' + [0,255,71,0,212,255][Math.floor(Math.random()*6)] + ',' + Math.random()*0.3 + ')';
        startTime = Date.now();
    }
    
    target.onclick = function(e) {
        e.stopPropagation();
        let reactionTime = Date.now() - startTime;
        if (reactionTime < 800) {
            score += Math.max(10, 100 - Math.floor(reactionTime/10));
            document.getElementById('rmScore').textContent = score;
        }
        target.style.display = 'none';
        clearTimeout(timeoutId);
        timeoutId = setTimeout(spawnTarget, Math.random() * 1000 + 500);
    };
    
    container.onclick = function() {
        score = Math.max(0, score - 5);
        document.getElementById('rmScore').textContent = score;
        document.getElementById('rmStatus').textContent = 'MISS! -5';
        setTimeout(() => document.getElementById('rmStatus').textContent = 'TAP THE TARGET!', 500);
    };
    
    spawnTarget();
    
    window.rmCancelRef = () => {
        clearTimeout(timeoutId);
        if (score > best) { best = score; localStorage.setItem('reactionBest', best); }
    };
}

function exitReactionMaster() { if (typeof window.rmCancelRef === 'function') window.rmCancelRef(); if (typeof openGames === 'function') openGames(); }
