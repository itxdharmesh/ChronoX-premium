// ==================== GAMES HUB ====================

function openGames() {
    openModal('gamesModal');
    document.getElementById('gamesContent').innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px">🎮 Games Hub</h2>' +
        
        '<h3 style="color:var(--gold-light);margin:15px 0 10px;font-size:14px">👤 Single Player</h3>' +
        '<button class="btn-out" onclick="startTTT()">❌⭕ Tic Tac Toe</button>' +
        '<button class="btn-out" onclick="startMemory()">🧠 Memory Match</button>' +
        '<button class="btn-out" onclick="startQuiz()">❓ Quiz Challenge</button>' +
        '<button class="btn-out" onclick="startNumberGuess()">🔢 Number Guessing</button>' +
        '<button class="btn-out" onclick="startReaction()">⚡ Reaction Speed</button>' +
        
        '<h3 style="color:var(--gold-light);margin:15px 0 10px;font-size:14px">👥 Multiplayer</h3>' +
        '<button class="btn-out" onclick="showMultiplayer()">🔗 Challenge Friend</button>' +
        '<button class="btn-out" onclick="startRPS()">✂️ Rock Paper Scissors</button>' +
        
        '<button class="btn-out" onclick="closeModal(\'gamesModal\')">Close</button>';
}

// ==================== TIC TAC TOE ====================
var ttt = [], tttActive = false, tttDiff = 'medium';

function startTTT() {
    ttt = ['','','','','','','','',''];
    tttActive = true;
    var h = '<h2 style="color:var(--gold);margin-bottom:10px">❌⭕ Tic Tac Toe</h2>';
    h += '<div style="display:flex;gap:6px;margin-bottom:12px">' +
        '<button class="btn-out" style="flex:1;' + (tttDiff==='easy'?'background:rgba(212,175,55,0.2)':'') + '" onclick="tttDiff=\'easy\';startTTT()">Easy</button>' +
        '<button class="btn-out" style="flex:1;' + (tttDiff==='medium'?'background:rgba(212,175,55,0.2)':'') + '" onclick="tttDiff=\'medium\';startTTT()">Medium</button>' +
        '<button class="btn-out" style="flex:1;' + (tttDiff==='hard'?'background:rgba(212,175,55,0.2)':'') + '" onclick="tttDiff=\'hard\';startTTT()">Hard</button>' +
        '</div>';
    h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:260px;margin:15px auto">';
    for (var i = 0; i < 9; i++) {
        h += '<div style="aspect-ratio:1;background:var(--card);border:2px solid rgba(212,175,55,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:36px;cursor:pointer" onclick="tttMove(' + i + ')" id="ttt' + i + '"></div>';
    }
    h += '</div><p id="tttStatus" style="text-align:center;color:var(--gold);margin:10px 0">Your turn (X)</p>';
    h += '<button class="btn-out" onclick="openGames()">Back</button>';
    document.getElementById('gamesContent').innerHTML = h;
}

function tttMove(i) {
    if (!tttActive || ttt[i] !== '') return;
    ttt[i] = 'X';
    document.getElementById('ttt' + i).textContent = 'X';
    document.getElementById('ttt' + i).style.color = 'var(--gold)';
    
    if (tttCheck('X')) { tttActive = false; document.getElementById('tttStatus').textContent = '🎉 You Win!'; addXP(20); return; }
    if (tttFull()) { tttActive = false; document.getElementById('tttStatus').textContent = '🤝 Draw!'; addXP(5); return; }
    
    setTimeout(function() {
        var aiMove;
        if (tttDiff === 'easy') aiMove = tttRandom();
        else if (tttDiff === 'medium') aiMove = Math.random() < 0.5 ? tttBest() : tttRandom();
        else aiMove = tttBest();
        
        ttt[aiMove] = 'O';
        document.getElementById('ttt' + aiMove).textContent = 'O';
        document.getElementById('ttt' + aiMove).style.color = '#FF4757';
        
        if (tttCheck('O')) { tttActive = false; document.getElementById('tttStatus').textContent = '😞 AI Wins!'; }
        else if (tttFull()) { tttActive = false; document.getElementById('tttStatus').textContent = '🤝 Draw!'; addXP(5); }
        else document.getElementById('tttStatus').textContent = 'Your turn (X)';
    }, 400);
}

function tttCheck(p) {
    var w = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return w.some(function(w) { return ttt[w[0]]===p && ttt[w[1]]===p && ttt[w[2]]===p; });
}

function tttFull() { return ttt.every(function(c) { return c !== ''; }); }

function tttRandom() {
    var e = [];
    for (var i=0;i<9;i++) if (ttt[i]==='') e.push(i);
    return e[Math.floor(Math.random()*e.length)];
}

function tttBest() {
    for (var i=0;i<9;i++) { if(ttt[i]===''){ttt[i]='O';if(tttCheck('O')){ttt[i]='';return i;}ttt[i]='';} }
    for (var i=0;i<9;i++) { if(ttt[i]===''){ttt[i]='X';if(tttCheck('X')){ttt[i]='';return i;}ttt[i]='';} }
    var p = [4,0,2,6,8,1,3,5,7];
    for (var i=0;i<p.length;i++) if (ttt[p[i]]==='') return p[i];
    return 0;
}

// ==================== MEMORY GAME ====================
var memC=[], memF=[], memM=[], memMoves=0, memLocked=false;

function startMemory() {
    var e = ['🎮','🎯','🎨','🎵','🎭','🎪','🎲','🎸'];
    memC = shuffleArray(e.concat(e));
    memF=[]; memM=[]; memMoves=0; memLocked=false;
    
    var h = '<h2 style="color:var(--gold);margin-bottom:10px">🧠 Memory Match</h2>';
    h += '<p style="text-align:center;color:var(--gold)">Moves: <span id="memMoves">0</span></p>';
    h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-width:300px;margin:15px auto">';
    for (var i=0;i<16;i++) {
        h += '<div style="aspect-ratio:1;background:var(--card);border:2px solid rgba(212,175,55,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:28px;cursor:pointer" onclick="memFlip('+i+')" id="mem'+i+'">❓</div>';
    }
    h += '</div><button class="btn-out" onclick="openGames()">Back</button>';
    document.getElementById('gamesContent').innerHTML = h;
}

function memFlip(i) {
    if (memLocked || memF.indexOf(i)!==-1 || memM.indexOf(i)!==-1) return;
    memF.push(i);
    document.getElementById('mem'+i).textContent = memC[i];
    if (memF.length===2) {
        memMoves++;
        document.getElementById('memMoves').textContent = memMoves;
        memLocked = true;
        var a=memF[0], b=memF[1];
        if (memC[a]===memC[b]) {
            memM.push(a,b); memF=[]; memLocked=false;
            if (memM.length===16) { showToast('🎉 Done in '+memMoves+' moves!'); addXP(15); }
        } else {
            setTimeout(function() { document.getElementById('mem'+a).textContent='❓'; document.getElementById('mem'+b).textContent='❓'; memF=[]; memLocked=false; }, 800);
        }
    }
}

// ==================== QUIZ ====================
var qQ=[], qI=0, qS=0;
var QB = [
    {q:"Capital of France?",o:["London","Paris","Berlin","Madrid"],a:1},
    {q:"Red Planet?",o:["Venus","Jupiter","Mars","Saturn"],a:2},
    {q:"2+2×2=?",o:["6","8","4","10"],a:0},
    {q:"Mona Lisa?",o:["Van Gogh","Picasso","Da Vinci","Michelangelo"],a:2},
    {q:"Largest ocean?",o:["Atlantic","Indian","Arctic","Pacific"],a:3},
    {q:"H2O is?",o:["Oxygen","Hydrogen","Water","Air"],a:2},
    {q:"Continents?",o:["5","6","7","8"],a:2},
    {q:"Fastest animal?",o:["Lion","Cheetah","Horse","Dog"],a:1},
    {q:"India independence?",o:["1945","1947","1950","1942"],a:1},
    {q:"Square root of 64?",o:["6","7","8","9"],a:2}
];

function startQuiz() {
    qQ = shuffleArray(QB).slice(0,10);
    qI=0; qS=0;
    showQuizQ();
}

function showQuizQ() {
    if (qI >= qQ.length) { showQuizR(); return; }
    var q = qQ[qI];
    var h = '<h2 style="color:var(--gold);margin-bottom:10px">❓ Quiz '+(qI+1)+'/10</h2>';
    h += '<h3 style="margin:10px 0">'+q.q+'</h3>';
    for (var i=0;i<q.o.length;i++) {
        h += '<button class="btn-out" onclick="quizAnswer('+i+')" style="text-align:left;margin:4px 0">'+q.o[i]+'</button>';
    }
    document.getElementById('gamesContent').innerHTML = h;
}

function quizAnswer(i) {
    if (qQ[qI].a === i) qS++;
    qI++;
    showQuizQ();
}

function showQuizR() {
    var emoji, msg, mot;
    if (qS <= 3) { emoji='😢'; msg='Need Hardwork'; mot='Keep learning! 💪'; }
    else if (qS <= 6) { emoji='🌟'; msg='Good'; mot='Stay curious! 📚'; }
    else if (qS <= 8) { emoji='😍'; msg='Amazing'; mot='Great job! 🚀'; }
    else { emoji='😱'; msg='Excellent'; mot='Genius! 👑'; }
    
    if (qS >= 7) addXP(qS * 5);
    
    document.getElementById('gamesContent').innerHTML = 
        '<div style="text-align:center;padding:20px"><div style="font-size:60px">'+emoji+'</div>' +
        '<h2 style="color:var(--gold);margin:10px 0">'+qS+' / 10</h2>' +
        '<h3>'+msg+'</h3><p style="color:rgba(255,255,255,0.6);margin:8px 0">'+mot+'</p>' +
        '<button class="btn" onclick="startQuiz()">Try Again</button>' +
        '<button class="btn-out" onclick="openGames()">Back</button></div>';
}

// ==================== NUMBER GUESSING ====================
var ngNum=0, ngAttempts=0;

function startNumberGuess() {
    ngNum = randomInt(1, 100);
    ngAttempts = 0;
    document.getElementById('gamesContent').innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:10px">🔢 Number Guessing</h2>' +
        '<p style="color:rgba(255,255,255,0.6);text-align:center">Guess a number between 1-100</p>' +
        '<input class="inp" id="ngInput" type="number" min="1" max="100" placeholder="Enter number...">' +
        '<button class="btn" onclick="checkGuess()">Guess</button>' +
        '<p id="ngHint" style="text-align:center;color:var(--gold);margin:10px 0"></p>' +
        '<p id="ngAttempts" style="text-align:center;color:rgba(255,255,255,0.5)"></p>' +
        '<button class="btn-out" onclick="openGames()">Back</button>';
}

function checkGuess() {
    var g = parseInt(document.getElementById('ngInput').value);
    if (!g) return;
    ngAttempts++;
    if (g === ngNum) {
        var pts = Math.max(50 - ngAttempts * 5, 5);
        document.getElementById('ngHint').textContent = '🎉 Correct! The number was ' + ngNum;
        addXP(pts);
    } else if (g < ngNum) {
        document.getElementById('ngHint').textContent = '📈 Higher!';
    } else {
        document.getElementById('ngHint').textContent = '📉 Lower!';
    }
    document.getElementById('ngAttempts').textContent = 'Attempts: ' + ngAttempts;
}

// ==================== REACTION SPEED ====================
var rsStart=0;

function startReaction() {
    document.getElementById('gamesContent').innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:10px">⚡ Reaction Speed</h2>' +
        '<p style="text-align:center;color:rgba(255,255,255,0.6)">Click when the screen turns green!</p>' +
        '<div id="rsBox" style="width:200px;height:200px;background:#FF4757;border-radius:20px;margin:30px auto;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;font-weight:700" onclick="reactClick()">Wait...</div>' +
        '<p id="rsResult" style="text-align:center;color:var(--gold)"></p>' +
        '<button class="btn-out" onclick="openGames()">Back</button>';
    
    setTimeout(function() {
        rsStart = Date.now();
        document.getElementById('rsBox').style.background = '#2ED573';
        document.getElementById('rsBox').textContent = 'CLICK NOW!';
    }, randomInt(1000, 4000));
}

function reactClick() {
    if (!rsStart) return;
    var time = Date.now() - rsStart;
    document.getElementById('rsBox').textContent = time + 'ms';
    document.getElementById('rsResult').textContent = 'Your reaction time: ' + time + 'ms';
    rsStart = 0;
    if (time < 300) { showToast('⚡ Lightning fast!'); addXP(25); }
    else if (time < 600) { showToast('👍 Good!'); addXP(10); }
}

// ==================== ROCK PAPER SCISSORS ====================
function startRPS() {
    document.getElementById('gamesContent').innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px">✂️ Rock Paper Scissors</h2>' +
        '<p style="text-align:center;color:rgba(255,255,255,0.6)">Choose your move:</p>' +
        '<div style="display:flex;gap:10px;justify-content:center;margin:20px 0">' +
            '<button class="btn" style="flex:1;font-size:30px" onclick="rpsPlay(\'rock\')">👊</button>' +
            '<button class="btn" style="flex:1;font-size:30px" onclick="rpsPlay(\'paper\')">✋</button>' +
            '<button class="btn" style="flex:1;font-size:30px" onclick="rpsPlay(\'scissors\')">✌️</button>' +
        '</div>' +
        '<div id="rpsResult" style="text-align:center;margin:15px 0"></div>' +
        '<button class="btn-out" onclick="openGames()">Back</button>';
}

function rpsPlay(player) {
    var choices = ['rock', 'paper', 'scissors'];
    var ai = choices[Math.floor(Math.random() * 3)];
    var emojis = { rock: '👊', paper: '✋', scissors: '✌️' };
    var result = '';
    
    if (player === ai) result = '🤝 Draw!';
    else if ((player==='rock'&&ai==='scissors') || (player==='paper'&&ai==='rock') || (player==='scissors'&&ai==='paper')) {
        result = '🎉 You Win!'; addXP(10);
    } else {
        result = '😞 AI Wins!';
    }
    
    document.getElementById('rpsResult').innerHTML = 
        'You: ' + emojis[player] + ' vs AI: ' + emojis[ai] + '<br><b style="color:var(--gold)">' + result + '</b>';
}

// ==================== MULTIPLAYER ====================
function showMultiplayer() {
    var mutual = (currentUserData.following || []).filter(function(id) {
        return (currentUserData.followers || []).indexOf(id) !== -1;
    });
    
    var h = '<h2 style="color:var(--gold);margin-bottom:15px">👥 Challenge Friend</h2>';
    h += '<p style="color:var(--text2);font-size:12px;margin-bottom:10px">Select Game:</p>';
    h += '<select id="multiGame" class="inp" style="margin-bottom:15px">' +
        '<option value="tictactoe">❌⭕ Tic Tac Toe</option>' +
        '<option value="memory">🧠 Memory Match</option>' +
        '<option value="quiz">❓ Quiz Battle</option>' +
        '</select>';
    
    if (mutual.length === 0) {
        h += '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:20px">No mutual friends</p>';
    } else {
        mutual.forEach(function(id) {
            db.collection('users').doc(id).get().then(function(doc) {
                var u = doc.data();
                if (u) h += '<div class="chat-item"><div class="av" style="width:40px;height:40px">' + (u.name||'?')[0] + '</div><div style="flex:1"><b>' + u.name + '</b></div><button class="btn" style="width:auto;padding:6px 14px" onclick="sendChallenge(\'' + id + '\')">⚔️ Challenge</button></div>';
            });
        });
    }
    h += '<button class="btn-out" onclick="openGames()">Back</button>';
    document.getElementById('gamesContent').innerHTML = h;
}

function sendChallenge(friendId) {
    var game = document.getElementById('multiGame') ? document.getElementById('multiGame').value : 'tictactoe';
    db.collection('challenges').add({
        from: currentUser.uid,
        fromName: currentUserData.name,
        to: friendId,
        game: game,
        status: 'pending',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function() {
        showToast('Challenge sent! ⚔️');
        openGames();
    });
}

document.addEventListener('click', function(e) { if (e.target.classList.contains('modal')) e.target.classList.remove('show'); });
console.log('✅ Games loaded');
