var tttBoard, tttActive, tttDiff = 'medium';

function startTTT() {
    tttBoard = ['', '', '', '', '', '', '', '', ''];
    tttActive = true;
    
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    c.innerHTML = 
        '<h2 style="color:#D4AF37;text-align:center;margin-bottom:10px">❌⭕ Tic Tac Toe</h2>' +
        '<div style="display:flex;gap:6px;margin-bottom:12px;justify-content:center">' +
            '<button class="btn-out" style="width:auto;padding:6px 14px;font-size:11px;' + (tttDiff==='easy'?'background:rgba(212,175,55,0.2)':'') + '" onclick="tttDiff=\'easy\';startTTT()">Easy</button>' +
            '<button class="btn-out" style="width:auto;padding:6px 14px;font-size:11px;' + (tttDiff==='medium'?'background:rgba(212,175,55,0.2)':'') + '" onclick="tttDiff=\'medium\';startTTT()">Medium</button>' +
            '<button class="btn-out" style="width:auto;padding:6px 14px;font-size:11px;' + (tttDiff==='hard'?'background:rgba(212,175,55,0.2)':'') + '" onclick="tttDiff=\'hard\';startTTT()">Hard</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:280px;margin:15px auto">' +
            [0,1,2,3,4,5,6,7,8].map(function(i) {
                return '<div style="aspect-ratio:1;background:rgba(19,24,66,0.8);border:2px solid rgba(212,175,55,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:bold;cursor:pointer" onclick="tttClick(' + i + ')" id="ttt' + i + '"></div>';
            }).join('') +
        '</div>' +
        '<p id="tttStatus" style="text-align:center;color:#D4AF37;margin-top:12px;font-weight:600">Your turn (X)</p>' +
        '<button class="btn-out" onclick="navigate(\'games\')" style="margin-top:10px">← Back to Games</button>';
}

function tttClick(i) {
    if (!tttActive || tttBoard[i] !== '') return;
    tttBoard[i] = 'X';
    document.getElementById('ttt' + i).textContent = 'X';
    document.getElementById('ttt' + i).style.color = '#D4AF37';
    
    if (tttCheckWin('X')) {
        tttActive = false;
        document.getElementById('tttStatus').textContent = '🎉 You Win!';
        if (typeof addXP === 'function') addXP(25);
        return;
    }
    if (tttBoard.every(function(x) { return x !== ''; })) {
        tttActive = false;
        document.getElementById('tttStatus').textContent = '🤝 Draw!';
        return;
    }
    
    document.getElementById('tttStatus').textContent = 'AI thinking...';
    
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
        document.getElementById('ttt' + aiMove).textContent = 'O';
        document.getElementById('ttt' + aiMove).style.color = '#FF4757';
        
        if (tttCheckWin('O')) {
            tttActive = false;
            document.getElementById('tttStatus').textContent = '😞 AI Wins!';
        } else if (tttBoard.every(function(x) { return x !== ''; })) {
            tttActive = false;
            document.getElementById('tttStatus').textContent = '🤝 Draw!';
        } else {
            document.getElementById('tttStatus').textContent = 'Your turn (X)';
        }
    }, 500);
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
