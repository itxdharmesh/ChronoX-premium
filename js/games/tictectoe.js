var tttData = {};

function startTTTPremium() {
    tttData = {
        board: ['','','','','','','','',''],
        active: true, difficulty: 'medium',
        player: 'X', ai: 'O',
        scores: {X:0, O:0, draw:0},
        winLine: null
    };
    
    openFullPageGame('❌⭕ Tic Tac Toe');
    gameCanvas.style.display = 'none';
    
    var div = document.createElement('div');
    div.id = 'tttPremium';
    div.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;overflow-y:auto';
    
    renderTTTBoard(div);
    gameCanvas.parentNode.insertBefore(div, gameCanvas);
    currentGameRestart = startTTTPremium;
}

function renderTTTBoard(container) {
    var h = '<h2 style="color:var(--gold);text-align:center;margin-bottom:10px">❌⭕ Tic Tac Toe</h2>';
    
    // Score
    h += '<div style="display:flex;justify-content:center;gap:20px;margin-bottom:15px;color:var(--gold)">';
    h += '<span>🧑 ' + tttData.scores.X + '</span><span>🤝 ' + tttData.scores.draw + '</span><span>🤖 ' + tttData.scores.O + '</span>';
    h += '</div>';
    
    // Difficulty
    h += '<div style="display:flex;gap:6px;margin-bottom:15px">';
    ['easy','medium','hard'].forEach(function(d) {
        h += '<button class="btn-out" style="flex:1;' + (tttData.difficulty===d?'background:rgba(212,175,55,0.2)':'') + '" onclick="tttData.difficulty=\''+d+'\';renderTTTBoard(document.getElementById(\'tttPremium\'))">'+d.charAt(0).toUpperCase()+d.slice(1)+'</button>';
    });
    h += '</div>';
    
    // Board
    h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:280px">';
    for (var i=0;i<9;i++) {
        var val = tttData.board[i];
        var style = 'aspect-ratio:1;background:var(--card);border:2px solid ' + (tttData.winLine&&tttData.winLine.includes(i)?'var(--gold)':'rgba(212,175,55,0.2)') + ';border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:40px;cursor:pointer;transition:all 0.2s';
        h += '<div style="' + style + '" onclick="tttPremiumMove('+i+')" id="tttCell'+i+'">';
        if (val==='X') h += '<span style="color:var(--gold)">X</span>';
        else if (val==='O') h += '<span style="color:#FF4757">O</span>';
        h += '</div>';
    }
    h += '</div>';
    
    h += '<p id="tttMsg" style="text-align:center;color:var(--gold);margin-top:15px;font-weight:600">' + (tttData.active?'Your turn (X)':'') + '</p>';
    h += '<button class="btn-out" onclick="tttData.board=[\'\',\'\',\'\',\'\',\'\',\'\',\'\',\'\',\'\'];tttData.active=true;tttData.winLine=null;renderTTTBoard(document.getElementById(\'tttPremium\'))" style="margin-top:10px">🔄 New Game</button>';
    
    container.innerHTML = h;
}

function tttPremiumMove(i) {
    if (!tttData.active || tttData.board[i]!=='') return;
    
    tttData.board[i] = 'X';
    if (tttCheckWin('X')) { tttData.active=false; tttData.scores.X++; updateScore(tttData.scores.X*10); renderTTTBoard(document.getElementById('tttPremium')); document.getElementById('tttMsg').textContent='🎉 You Win!'; return; }
    if (tttData.board.every(function(c){return c!=='';})) { tttData.active=false; tttData.scores.draw++; renderTTTBoard(document.getElementById('tttPremium')); document.getElementById('tttMsg').textContent='🤝 Draw!'; return; }
    
    document.getElementById('tttMsg').textContent = 'AI thinking...';
    
    setTimeout(function() {
        var aiMove;
        var empty = [];
        for (var j=0;j<9;j++) if(tttData.board[j]==='') empty.push(j);
        
        if (tttData.difficulty==='easy') aiMove = empty[Math.floor(Math.random()*empty.length)];
        else if (tttData.difficulty==='medium') aiMove = Math.random()<0.5 ? tttBestMove() : empty[Math.floor(Math.random()*empty.length)];
        else aiMove = tttBestMove();
        
        tttData.board[aiMove] = 'O';
        if (tttCheckWin('O')) { tttData.active=false; tttData.scores.O++; renderTTTBoard(document.getElementById('tttPremium')); document.getElementById('tttMsg').textContent='😞 AI Wins!'; }
        else if (tttData.board.every(function(c){return c!=='';})) { tttData.active=false; tttData.scores.draw++; renderTTTBoard(document.getElementById('tttPremium')); document.getElementById('tttMsg').textContent='🤝 Draw!'; }
        else { renderTTTBoard(document.getElementById('tttPremium')); document.getElementById('tttMsg').textContent='Your turn (X)'; }
    }, 400);
}

function tttCheckWin(p) {
    var wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (var i=0;i<wins.length;i++) {
        if (tttData.board[wins[i][0]]===p && tttData.board[wins[i][1]]===p && tttData.board[wins[i][2]]===p) {
            tttData.winLine = wins[i];
            return true;
        }
    }
    return false;
}

function tttBestMove() {
    for (var i=0;i<9;i++) { if(tttData.board[i]===''){tttData.board[i]='O';if(tttCheckWin('O')){tttData.board[i]='';return i;}tttData.board[i]='';}}
    for (var i=0;i<9;i++) { if(tttData.board[i]===''){tttData.board[i]='X';if(tttCheckWin('X')){tttData.board[i]='';return i;}tttData.board[i]='';}}
    var p=[4,0,2,6,8,1,3,5,7];
    for (var i=0;i<p.length;i++) if(tttData.board[p[i]]==='') return p[i];
    return 0;
}

console.log('✅ Premium Tic Tac Toe loaded');
