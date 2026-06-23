var tttBoard, tttActive, tttDiff = 'medium';
var tttScore = 0, tttAIScore = 0, tttDraws = 0;

function startTTT() {
    tttBoard = ['', '', '', '', '', '', '', '', ''];
    tttActive = true;
    
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<div style="text-align:center">' +
            '<h2 style="color:#D4AF37;margin-bottom:5px">Tic Tac Toe</h2>' +
            
            // SCOREBOARD
            '<div style="display:flex;justify-content:center;gap:25px;margin:10px 0;font-size:13px">' +
                '<div style="text-align:center"><span style="color:#D4AF37;font-size:22px;font-weight:700">' + tttScore + '</span><br><span style="color:rgba(255,255,255,0.5);font-size:10px">You (X)</span></div>' +
                '<div style="text-align:center"><span style="color:#fff;font-size:22px;font-weight:700">' + tttDraws + '</span><br><span style="color:rgba(255,255,255,0.5);font-size:10px">Draws</span></div>' +
                '<div style="text-align:center"><span style="color:#FF4757;font-size:22px;font-weight:700">' + tttAIScore + '</span><br><span style="color:rgba(255,255,255,0.5);font-size:10px">AI (O)</span></div>' +
            '</div>' +
            
            // DIFFICULTY
            '<div style="display:flex;gap:6px;margin:12px 0">' +
                '<button class="btn-out" style="flex:1;padding:10px;font-size:12px;' + (tttDiff==='easy'?'background:rgba(46,213,115,0.2);border-color:#2ED573;color:#2ED573':'') + '" onclick="tttDiff=\'easy\';startTTT()">Easy</button>' +
                '<button class="btn-out" style="flex:1;padding:10px;font-size:12px;' + (tttDiff==='medium'?'background:rgba(255,165,2,0.2);border-color:#FFA502;color:#FFA502':'') + '" onclick="tttDiff=\'medium\';startTTT()">Medium</button>' +
                '<button class="btn-out" style="flex:1;padding:10px;font-size:12px;' + (tttDiff==='hard'?'background:rgba(255,71,87,0.2);border-color:#FF4757;color:#FF4757':'') + '" onclick="tttDiff=\'hard\';startTTT()">Hard</button>' +
            '</div>' +
            
            // BOARD
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:310px;margin:20px auto;background:rgba(0,0,0,0.4);padding:18px;border-radius:20px;box-shadow:0 10px 50px rgba(0,0,0,0.5)">' +
                '<div onclick="tttClick(0)" id="ttt0" style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.95),rgba(30,35,80,0.95));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 15px rgba(0,0,0,0.3)"></div>' +
                '<div onclick="tttClick(1)" id="ttt1" style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.95),rgba(30,35,80,0.95));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 15px rgba(0,0,0,0.3)"></div>' +
                '<div onclick="tttClick(2)" id="ttt2" style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.95),rgba(30,35,80,0.95));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 15px rgba(0,0,0,0.3)"></div>' +
                '<div onclick="tttClick(3)" id="ttt3" style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.95),rgba(30,35,80,0.95));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 15px rgba(0,0,0,0.3)"></div>' +
                '<div onclick="tttClick(4)" id="ttt4" style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.95),rgba(30,35,80,0.95));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 15px rgba(0,0,0,0.3)"></div>' +
                '<div onclick="tttClick(5)" id="ttt5" style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.95),rgba(30,35,80,0.95));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 15px rgba(0,0,0,0.3)"></div>' +
                '<div onclick="tttClick(6)" id="ttt6" style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.95),rgba(30,35,80,0.95));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 15px rgba(0,0,0,0.3)"></div>' +
                '<div onclick="tttClick(7)" id="ttt7" style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.95),rgba(30,35,80,0.95));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 15px rgba(0,0,0,0.3)"></div>' +
                '<div onclick="tttClick(8)" id="ttt8" style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.95),rgba(30,35,80,0.95));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 15px rgba(0,0,0,0.3)"></div>' +
            '</div>' +
            
            // STATUS
            '<p id="tttStatus" style="text-align:center;color:#D4AF37;margin-top:12px;font-weight:600;font-size:15px;min-height:22px">Your turn (X)</p>' +
            
            // BUTTONS
            '<div style="display:flex;gap:10px;margin-top:12px">' +
                '<button class="btn-out" onclick="startTTT()" style="flex:1">New Game</button>' +
                '<button class="btn-out" onclick="navigate(\'games\')" style="flex:1">Games Hub</button>' +
            '</div>' +
        '</div>';
}

function tttClick(i) {
    if (!tttActive || tttBoard[i] !== '') return;
    
    // PLAYER MOVE
    tttBoard[i] = 'X';
    var cell = document.getElementById('ttt' + i);
    cell.innerHTML = '<b style="color:#D4AF37;font-size:55px">X</b>';
    cell.style.borderColor = '#D4AF37';
    cell.style.boxShadow = '0 0 25px rgba(212,175,55,0.5)';
    cell.style.background = 'linear-gradient(145deg,rgba(212,175,55,0.2),rgba(245,230,163,0.1))';
    cell.style.transform = 'scale(1.05)';
    setTimeout(function() { cell.style.transform = 'scale(1)'; }, 150);
    
    // CHECK WIN
    if (tttCheckWin('X')) {
        tttActive = false;
        tttScore++;
        document.getElementById('tttStatus').innerHTML = '<b style="color:#2ED573">You Win!</b> +25 XP';
        if (typeof addXP === 'function') addXP(25);
        return;
    }
    
    // CHECK DRAW
    if (tttBoard.every(function(x) { return x !== ''; })) {
        tttActive = false;
        tttDraws++;
        document.getElementById('tttStatus').textContent = 'Draw! +5 XP';
        if (typeof addXP === 'function') addXP(5);
        return;
    }
    
    document.getElementById('tttStatus').textContent = 'AI thinking...';
    
    // AI MOVE
    setTimeout(function() {
        var empty = [];
        for (var j = 0; j < 9; j++) if (tttBoard[j] === '') empty.push(j);
        
        var aiMove;
        if (tttDiff === 'easy') aiMove = empty[Math.floor(Math.random() * empty.length)];
        else if (tttDiff === 'medium') aiMove = Math.random() < 0.5 ? tttBestMove() : empty[Math.floor(Math.random() * empty.length)];
        else aiMove = tttBestMove();
        
        tttBoard[aiMove] = 'O';
        var aiCell = document.getElementById('ttt' + aiMove);
        aiCell.innerHTML = '<b style="color:#FF4757;font-size:55px">O</b>';
        aiCell.style.borderColor = '#FF4757';
        aiCell.style.boxShadow = '0 0 25px rgba(255,71,87,0.5)';
        aiCell.style.background = 'linear-gradient(145deg,rgba(255,71,87,0.2),rgba(255,107,129,0.1))';
        aiCell.style.transform = 'scale(1.05)';
        setTimeout(function() { aiCell.style.transform = 'scale(1)'; }, 150);
        
        if (tttCheckWin('O')) {
            tttActive = false;
            tttAIScore++;
            document.getElementById('tttStatus').innerHTML = '<b style="color:#FF4757">AI Wins!</b>';
        } else if (tttBoard.every(function(x) { return x !== ''; })) {
            tttActive = false;
            tttDraws++;
            document.getElementById('tttStatus').textContent = 'Draw! +5 XP';
            if (typeof addXP === 'function') addXP(5);
        } else {
            document.getElementById('tttStatus').textContent = 'Your turn (X)';
        }
    }, 400);
}

function tttCheckWin(p) {
    var wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (var i = 0; i < wins.length; i++) {
        if (tttBoard[wins[i][0]] === p && tttBoard[wins[i][1]] === p && tttBoard[wins[i][2]] === p) return true;
    }
    return false;
}

function tttBestMove() {
    for (var i = 0; i < 9; i++) {
        if (tttBoard[i] === '') { tttBoard[i] = 'O'; if (tttCheckWin('O')) { tttBoard[i] = ''; return i; } tttBoard[i] = ''; }
    }
    for (var i = 0; i < 9; i++) {
        if (tttBoard[i] === '') { tttBoard[i] = 'X'; if (tttCheckWin('X')) { tttBoard[i] = ''; return i; } tttBoard[i] = ''; }
    }
    var p = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    for (var i = 0; i < p.length; i++) { if (tttBoard[p[i]] === '') return p[i]; }
    return 0;
}
