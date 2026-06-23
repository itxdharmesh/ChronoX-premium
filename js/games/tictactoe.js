var tttBoard, tttActive, tttDiff = 'medium';
var tttScore = 0, tttAIScore = 0, tttDraws = 0, tttStreak = 0;
var tttParticles = [];

function startTTT() {
    tttBoard = ['', '', '', '', '', '', '', '', ''];
    tttActive = true;
    tttParticles = [];
    
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        // HEADER
        '<div style="text-align:center;margin-bottom:15px">' +
            '<h2 style="color:#D4AF37;margin-bottom:5px">❌⭕ Tic Tac Toe</h2>' +
            '<div style="display:flex;justify-content:center;gap:25px;font-size:13px;color:rgba(255,255,255,0.6)">' +
                '<span>🧑 You: <b style="color:#D4AF37">' + tttScore + '</b></span>' +
                '<span>🤝 Draw: <b>' + tttDraws + '</b></span>' +
                '<span>🤖 AI: <b style="color:#FF4757">' + tttAIScore + '</b></span>' +
                (tttStreak > 2 ? '<span>🔥 Streak: <b style="color:#FFA502">' + tttStreak + '</b></span>' : '') +
            '</div>' +
        '</div>' +
        
        // DIFFICULTY
        '<div style="display:flex;gap:6px;margin-bottom:15px">' +
            '<button class="btn-out" style="flex:1;padding:8px;font-size:11px;' + (tttDiff==='easy'?'background:rgba(212,175,55,0.2);border-color:#D4AF37':'') + '" onclick="tttDiff=\'easy\';startTTT()">🟢 Easy</button>' +
            '<button class="btn-out" style="flex:1;padding:8px;font-size:11px;' + (tttDiff==='medium'?'background:rgba(212,175,55,0.2);border-color:#D4AF37':'') + '" onclick="tttDiff=\'medium\';startTTT()">🟡 Medium</button>' +
            '<button class="btn-out" style="flex:1;padding:8px;font-size:11px;' + (tttDiff==='hard'?'background:rgba(212,175,55,0.2);border-color:#D4AF37':'') + '" onclick="tttDiff=\'hard\';startTTT()">🔴 Hard</button>' +
        '</div>' +
        
        // BOARD
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:300px;margin:20px auto;background:rgba(0,0,0,0.3);padding:15px;border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,0.4)">' +
            [0,1,2,3,4,5,6,7,8].map(function(i) {
                return '<div style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.9),rgba(30,35,80,0.9));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:45px;font-weight:bold;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 15px rgba(0,0,0,0.3)" onclick="tttClick(' + i + ')" id="ttt' + i + '"></div>';
            }).join('') +
        '</div>' +
        
        // STATUS
        '<p id="tttStatus" style="text-align:center;color:#D4AF37;margin-top:15px;font-weight:600;font-size:16px;min-height:24px">Your turn (X)</p>' +
        
        // BUTTONS
        '<div style="display:flex;gap:10px;margin-top:15px">' +
            '<button class="btn-out" onclick="startTTT()" style="flex:1">🔄 New Game</button>' +
            '<button class="btn-out" onclick="navigate(\'games\')" style="flex:1">← Games Hub</button>' +
        '</div>';
}

function tttClick(i) {
    if (!tttActive || tttBoard[i] !== '') return;
    
    // Player move
    tttBoard[i] = 'X';
    var cell = document.getElementById('ttt' + i);
    cell.textContent = 'X';
    cell.style.color = '#D4AF37';
    cell.style.transform = 'scale(1.1)';
    cell.style.borderColor = '#D4AF37';
    cell.style.boxShadow = '0 0 25px rgba(212,175,55,0.4)';
    cell.style.background = 'linear-gradient(145deg,rgba(212,175,55,0.2),rgba(245,230,163,0.1))';
    setTimeout(function() { cell.style.transform = 'scale(1)'; }, 150);
    
    // Spawn particles
    spawnTTTParticles(i, '#D4AF37');
    
    if (tttCheckWin('X')) {
        tttActive = false;
        tttScore++;
        tttStreak++;
        document.getElementById('tttStatus').innerHTML = '🎉 <b style="color:#2ED573">You Win!</b> +25 XP';
        if (typeof addXP === 'function') addXP(25);
        if (typeof addCoins === 'function') addCoins(10);
        highlightWinCells('X');
        return;
    }
    
    if (tttBoard.every(function(x) { return x !== ''; })) {
        tttActive = false;
        tttDraws++;
        tttStreak = 0;
        document.getElementById('tttStatus').textContent = '🤝 Draw!';
        return;
    }
    
    document.getElementById('tttStatus').textContent = '🤔 AI thinking...';
    
    // AI move
    setTimeout(function() {
        var empty = [];
        for (var j = 0; j < 9; j++) if (tttBoard[j] === '') empty.push(j);
        
        var aiMove;
        if (tttDiff === 'easy') {
            aiMove = empty[Math.floor(Math.random() * empty.length)];
        } else if (tttDiff === 'medium') {
            aiMove = Math.random() < 0.5 ? tttBestMove() : empty[Math.floor(Math.random() * empty.length)];
        } else {
            aiMove = tttBestMove();
        }
        
        tttBoard[aiMove] = 'O';
        var aiCell = document.getElementById('ttt' + aiMove);
        aiCell.textContent = 'O';
        aiCell.style.color = '#FF4757';
        aiCell.style.transform = 'scale(1.1)';
        aiCell.style.borderColor = '#FF4757';
        aiCell.style.boxShadow = '0 0 25px rgba(255,71,87,0.4)';
        aiCell.style.background = 'linear-gradient(145deg,rgba(255,71,87,0.2),rgba(255,107,129,0.1))';
        setTimeout(function() { aiCell.style.transform = 'scale(1)'; }, 150);
        
        spawnTTTParticles(aiMove, '#FF4757');
        
        if (tttCheckWin('O')) {
            tttActive = false;
            tttAIScore++;
            tttStreak = 0;
            document.getElementById('tttStatus').innerHTML = '😞 <b style="color:#FF4757">AI Wins!</b>';
            highlightWinCells('O');
        } else if (tttBoard.every(function(x) { return x !== ''; })) {
            tttActive = false;
            tttDraws++;
            tttStreak = 0;
            document.getElementById('tttStatus').textContent = '🤝 Draw!';
        } else {
            document.getElementById('tttStatus').textContent = 'Your turn (X)';
        }
    }, 400);
}

function highlightWinCells(p) {
    var wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (var i = 0; i < wins.length; i++) {
        if (tttBoard[wins[i][0]] === p && tttBoard[wins[i][1]] === p && tttBoard[wins[i][2]] === p) {
            for (var j = 0; j < 3; j++) {
                var cell = document.getElementById('ttt' + wins[i][j]);
                if (cell) {
                    cell.style.borderColor = '#2ED573';
                    cell.style.boxShadow = '0 0 30px rgba(46,213,115,0.6)';
                    cell.style.animation = 'pulse 0.5s infinite';
                }
            }
        }
    }
}

function spawnTTTParticles(index, color) {
    var cell = document.getElementById('ttt' + index);
    if (!cell) return;
    var rect = cell.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    
    for (var i = 0; i < 10; i++) {
        var p = document.createElement('div');
        p.style.cssText = 'position:fixed;width:6px;height:6px;background:' + color + ';border-radius:50%;pointer-events:none;z-index:9999;left:' + cx + 'px;top:' + cy + 'px;transition:all 0.8s ease-out;opacity:1';
        document.body.appendChild(p);
        
        var angle = Math.random() * Math.PI * 2;
        var distance = Math.random() * 60 + 30;
        var dx = Math.cos(angle) * distance;
        var dy = Math.sin(angle) * distance;
        
        setTimeout(function() {
            p.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
            p.style.opacity = '0';
        }, 10);
        
        setTimeout(function() { p.remove(); }, 800);
    }
}

function tttCheckWin(p) {
    var wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (var i = 0; i < wins.length; i++) {
        if (tttBoard[wins[i][0]] === p && tttBoard[wins[i][1]] === p && tttBoard[wins[i][2]] === p) return true;
    }
    return false;
}

function tttBestMove() {
    // Try to win
    for (var i = 0; i < 9; i++) {
        if (tttBoard[i] === '') {
            tttBoard[i] = 'O';
            if (tttCheckWin('O')) { tttBoard[i] = ''; return i; }
            tttBoard[i] = '';
        }
    }
    // Block player
    for (var i = 0; i < 9; i++) {
        if (tttBoard[i] === '') {
            tttBoard[i] = 'X';
            if (tttCheckWin('X')) { tttBoard[i] = ''; return i; }
            tttBoard[i] = '';
        }
    }
    // Center, corners, edges
    var priority = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    for (var i = 0; i < priority.length; i++) {
        if (tttBoard[priority[i]] === '') return priority[i];
    }
    return 0;
            }
