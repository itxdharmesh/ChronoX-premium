var tttBoard, tttActive, tttDiff = 'medium';
var tttScore = 0, tttAIScore = 0, tttDraws = 0;

function startTTT() {
    tttBoard = ['', '', '', '', '', '', '', '', ''];
    tttActive = true;
    
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<h2 style="color:#D4AF37;text-align:center;margin-bottom:5px">❌⭕ Tic Tac Toe</h2>' +
        '<div style="display:flex;justify-content:center;gap:20px;font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:10px">' +
            '<span>🧑 <b style="color:#D4AF37">' + tttScore + '</b></span>' +
            '<span>🤝 <b>' + tttDraws + '</b></span>' +
            '<span>🤖 <b style="color:#FF4757">' + tttAIScore + '</b></span>' +
        '</div>' +
        '<div style="display:flex;gap:6px;margin-bottom:15px">' +
            '<button class="btn-out" style="flex:1;padding:8px;font-size:11px;' + (tttDiff==='easy'?'background:rgba(212,175,55,0.2)':'') + '" onclick="tttDiff=\'easy\';startTTT()">🟢 Easy</button>' +
            '<button class="btn-out" style="flex:1;padding:8px;font-size:11px;' + (tttDiff==='medium'?'background:rgba(212,175,55,0.2)':'') + '" onclick="tttDiff=\'medium\';startTTT()">🟡 Medium</button>' +
            '<button class="btn-out" style="flex:1;padding:8px;font-size:11px;' + (tttDiff==='hard'?'background:rgba(212,175,55,0.2)':'') + '" onclick="tttDiff=\'hard\';startTTT()">🔴 Hard</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:300px;margin:20px auto;background:rgba(0,0,0,0.3);padding:15px;border-radius:20px">' +
            '<div style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.9),rgba(30,35,80,0.9));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.3)" onclick="tttClick(0)" id="ttt0"></div>' +
            '<div style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.9),rgba(30,35,80,0.9));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.3)" onclick="tttClick(1)" id="ttt1"></div>' +
            '<div style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.9),rgba(30,35,80,0.9));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.3)" onclick="tttClick(2)" id="ttt2"></div>' +
            '<div style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.9),rgba(30,35,80,0.9));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.3)" onclick="tttClick(3)" id="ttt3"></div>' +
            '<div style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.9),rgba(30,35,80,0.9));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.3)" onclick="tttClick(4)" id="ttt4"></div>' +
            '<div style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.9),rgba(30,35,80,0.9));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.3)" onclick="tttClick(5)" id="ttt5"></div>' +
            '<div style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.9),rgba(30,35,80,0.9));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.3)" onclick="tttClick(6)" id="ttt6"></div>' +
            '<div style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.9),rgba(30,35,80,0.9));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.3)" onclick="tttClick(7)" id="ttt7"></div>' +
            '<div style="aspect-ratio:1;background:linear-gradient(145deg,rgba(19,24,66,0.9),rgba(30,35,80,0.9));border:2px solid rgba(212,175,55,0.2);border-radius:16px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.3)" onclick="tttClick(8)" id="ttt8"></div>' +
        '</div>' +
        '<p id="tttStatus" style="text-align:center;color:#D4AF37;margin-top:15px;font-weight:600;font-size:16px">Your turn (X)</p>' +
        '<div style="display:flex;gap:10px;margin-top:15px">' +
            '<button class="btn-out" onclick="startTTT()" style="flex:1">🔄 New Game</button>' +
            '<button class="btn-out" onclick="navigate(\'games\')" style="flex:1">← Games Hub</button>' +
        '</div>';
}

function tttClick(i) {
    if (!tttActive || tttBoard[i] !== '') return;
    
    tttBoard[i] = 'X';
    var cell = document.getElementById('ttt' + i);
    cell.innerHTML = '<b style="color:#D4AF37;font-size:50px">X</b>';
    cell.style.borderColor = '#D4AF37';
    cell.style.boxShadow = '0 0 20px rgba(212,175,55,0.4)';
    
    if (tttCheckWin('X')) {
        tttActive = false;
        tttScore++;
        document.getElementById('tttStatus').innerHTML = '🎉 <b style="color:#2ED573">You Win!</b> +25 XP';
        if (typeof addXP === 'function') addXP(25);
        return;
    }
    if (tttBoard.every(function(x) { return x !== ''; })) {
        tttActive = false;
        tttDraws++;
        document.getElementById('tttStatus').textContent = '🤝 Draw! +5 XP';
        if (typeof addXP === 'function') addXP(5);
        return;
    }
    
    document.getElementById('tttStatus').textContent = '🤔 AI thinking...';
    
    setTimeout(function() {
        var empty = [];
        for (var j = 0; j < 9; j++) if (tttBoard[j] === '') empty.push(j);
        
        var aiMove;
        if (tttDiff === 'easy') aiMove = empty[Math.floor(Math.random() * empty.length)];
        else if (tttDiff === 'medium') aiMove = Math.random() < 0.5 ? tttBestMove() : empty[Math.floor(Math.random() * empty.length)];
        else aiMove = tttBestMove();
        
        tttBoard[aiMove] = 'O';
        var aiCell = document.getElementById('ttt' + aiMove);
        aiCell.innerHTML = '<b style="color:#FF4757;font-size:50px">O</b>';
        aiCell.style.borderColor = '#FF4757';
        aiCell.style.boxShadow = '0 0 20px rgba(255,71,87,0.4)';
        
        if (tttCheckWin('O')) {
            tttActive = false;
            tttAIScore++;
            document.getElementById('tttStatus').innerHTML = '😞 <b style="color:#FF4757">AI Wins!</b>';
        } else if (tttBoard.every(function(x) { return x !== ''; })) {
            tttActive = false;
            tttDraws++;
            document.getElementById('tttStatus').textContent = '🤝 Draw! +5 XP';
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
        if (tttBoard[i] === '') {
            tttBoard[i] = 'O'; if (tttCheckWin('O')) { tttBoard[i] = ''; return i; }
            tttBoard[i] = '';
        }
    }
    for (var i = 0; i < 9; i++) {
        if (tttBoard[i] === '') {
            tttBoard[i] = 'X'; if (tttCheckWin('X')) { tttBoard[i] = ''; return i; }
            tttBoard[i] = '';
        }
    }
    var priority = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    for (var i = 0; i < priority.length; i++) {
        if (tttBoard[priority[i]] === '') return priority[i];
    }
    return 0;
}
