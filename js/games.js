// ==================== GAMES ====================

function openGames() {
    openModal('gamesModal');
    document.getElementById('gamesContent').innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px">🎮 Games</h2>' +
        '<button class="btn-out" onclick="startTTT()">❌⭕ Tic Tac Toe</button>' +
        '<button class="btn-out" onclick="startMemory()">🧠 Memory Match</button>' +
        '<button class="btn-out" onclick="startQuiz()">❓ Quiz</button>' +
        '<button class="btn-out" onclick="closeModal(\'gamesModal\')">Close</button>';
}

// Tic Tac Toe
var ttt = [], tttActive = false;

function startTTT() {
    ttt = ['','','','','','','','',''];
    tttActive = true;
    var h = '<h2 style="color:var(--gold);margin-bottom:15px">❌⭕ Tic Tac Toe</h2>';
    h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:280px;margin:20px auto">';
    for (var i = 0; i < 9; i++) {
        h += '<div style="aspect-ratio:1;background:var(--card);border:2px solid rgba(212,175,55,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:40px;cursor:pointer" onclick="tttMove(' + i + ')" id="ttt' + i + '"></div>';
    }
    h += '</div><p id="tttStatus" style="text-align:center;color:var(--gold)">Your turn (X)</p>';
    h += '<button class="btn-out" onclick="openGames()">Back</button>';
    document.getElementById('gamesContent').innerHTML = h;
}

function tttMove(i) {
    if (!tttActive || ttt[i] !== '') return;
    ttt[i] = 'X';
    document.getElementById('ttt' + i).textContent = 'X';
    document.getElementById('ttt' + i).style.color = 'var(--gold)';
    if (tttCheck('X')) { tttActive = false; document.getElementById('tttStatus').textContent = '🎉 You Win!'; return; }
    var full = true;
    for (var j = 0; j < 9; j++) { if (ttt[j] === '') full = false; }
    if (full) { tttActive = false; document.getElementById('tttStatus').textContent = '🤝 Draw!'; return; }
    setTimeout(function() {
        var empty = [];
        for (var j = 0; j < 9; j++) { if (ttt[j] === '') empty.push(j); }
        var ai = empty[Math.floor(Math.random() * empty.length)];
        ttt[ai] = 'O';
        document.getElementById('ttt' + ai).textContent = 'O';
        document.getElementById('ttt' + ai).style.color = '#FF4757';
        if (tttCheck('O')) { tttActive = false; document.getElementById('tttStatus').textContent = '😞 AI Wins!'; }
        else { document.getElementById('tttStatus').textContent = 'Your turn (X)'; }
    }, 500);
}

function tttCheck(p) {
    var w = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (var i = 0; i < w.length; i++) {
        if (ttt[w[i][0]] === p && ttt[w[i][1]] === p && ttt[w[i][2]] === p) return true;
    }
    return false;
}

// Memory Game
var memCards = [], memFlipped = [], memMatched = [], memMoves = 0, memLocked = false;

function startMemory() {
    var emojis = ['🎮','🎯','🎨','🎵','🎭','🎪','🎲','🎸'];
    memCards = emojis.concat(emojis);
    for (var i = memCards.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = memCards[i]; memCards[i] = memCards[j]; memCards[j] = temp;
    }
    memFlipped = []; memMatched = []; memMoves = 0; memLocked = false;
    var h = '<h2 style="color:var(--gold);margin-bottom:15px">🧠 Memory</h2>';
    h += '<p style="text-align:center;color:var(--gold)">Moves: <span id="memMoves">0</span></p>';
    h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:320px;margin:15px auto">';
    for (var i = 0; i < 16; i++) {
        h += '<div style="aspect-ratio:1;background:var(--card);border:2px solid rgba(212,175,55,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:30px;cursor:pointer" onclick="memFlip(' + i + ')" id="mem' + i + '">❓</div>';
    }
    h += '</div><button class="btn-out" onclick="openGames()">Back</button>';
    document.getElementById('gamesContent').innerHTML = h;
}

function memFlip(i) {
    if (memLocked || memFlipped.indexOf(i) !== -1 || memMatched.indexOf(i) !== -1) return;
    memFlipped.push(i);
    document.getElementById('mem' + i).textContent = memCards[i];
    if (memFlipped.length === 2) {
        memMoves++;
        document.getElementById('memMoves').textContent = memMoves;
        memLocked = true;
        var a = memFlipped[0], b = memFlipped[1];
        if (memCards[a] === memCards[b]) {
            memMatched.push(a, b);
            memFlipped = [];
            memLocked = false;
            if (memMatched.length === 16) toast('🎉 Done in ' + memMoves + ' moves!');
        } else {
            setTimeout(function() {
                document.getElementById('mem' + a).textContent = '❓';
                document.getElementById('mem' + b).textContent = '❓';
                memFlipped = [];
                memLocked = false;
            }, 800);
        }
    }
}

// Quiz
var quizQ = [], quizI = 0, quizS = 0;
var QUIZ_BANK = [
    {q:"Capital of France?",o:["London","Paris","Berlin","Madrid"],a:1},
    {q:"Red Planet?",o:["Venus","Jupiter","Mars","Saturn"],a:2},
    {q:"2+2×2=?",o:["6","8","4","10"],a:0},
    {q:"Mona Lisa?",o:["Van Gogh","Picasso","Da Vinci","Michelangelo"],a:2},
    {q:"Largest ocean?",o:["Atlantic","Indian","Arctic","Pacific"],a:3},
    {q:"King of Jungle?",o:["Tiger","Lion","Elephant","Bear"],a:1},
    {q:"H2O is?",o:["Oxygen","Hydrogen","Water","Air"],a:2},
    {q:"Continents?",o:["5","6","7","8"],a:2},
    {q:"Fastest animal?",o:["Lion","Cheetah","Horse","Dog"],a:1},
    {q:"India independence?",o:["1945","1947","1950","1942"],a:1}
];

function startQuiz() {
    quizQ = QUIZ_BANK.slice();
    for (var i = quizQ.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = quizQ[i]; quizQ[i] = quizQ[j]; quizQ[j] = t; }
    quizQ = quizQ.slice(0, 10);
    quizI = 0; quizS = 0;
    showQuizQ();
}

function showQuizQ() {
    if (quizI >= quizQ.length) { showQuizR(); return; }
    var q = quizQ[quizI];
    var h = '<h2 style="color:var(--gold);margin-bottom:15px">❓ Quiz ' + (quizI+1) + '/10</h2>';
    h += '<h3 style="margin:15px 0">' + q.q + '</h3>';
    for (var i = 0; i < q.o.length; i++) {
        h += '<button class="btn-out" onclick="quizAnswer(' + i + ')" style="text-align:left;margin:5px 0">' + q.o[i] + '</button>';
    }
    document.getElementById('gamesContent').innerHTML = h;
}

function quizAnswer(i) {
    if (quizQ[quizI].a === i) quizS++;
    quizI++;
    showQuizQ();
}

function showQuizR() {
    var emoji, msg, mot;
    if (quizS <= 3) { emoji='😢'; msg='Need Hardwork'; mot='Keep learning! 💪'; }
    else if (quizS <= 6) { emoji='🌟'; msg='Good'; mot='Stay curious! 📚'; }
    else if (quizS <= 8) { emoji='😍'; msg='Amazing'; mot='Great job! 🚀'; }
    else { emoji='😱'; msg='Excellent'; mot='PERFECT! 👑'; }
    document.getElementById('gamesContent').innerHTML = 
        '<div style="text-align:center;padding:20px"><div style="font-size:60px">' + emoji + '</div>' +
        '<h2 style="color:var(--gold);margin:15px 0">' + quizS + ' / 10</h2>' +
        '<h3>' + msg + '</h3><p style="color:rgba(255,255,255,0.6);margin:10px 0">' + mot + '</p>' +
        '<button class="btn" onclick="startQuiz()">Try Again</button>' +
        '<button class="btn-out" onclick="openGames()">Back</button></div>';
}

document.addEventListener('click', function(e) { if (e.target.classList.contains('modal')) e.target.classList.remove('show'); });
console.log('Games loaded');
