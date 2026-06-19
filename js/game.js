// ==================== GAMES ====================

function openGames() {
    openModal('gamesModal');
    document.getElementById('gamesContent').innerHTML = `
        <h2 style="color:var(--gold);margin-bottom:15px">🎮 Games</h2>
        <button class="btn-out" onclick="startTTT()">❌⭕ Tic Tac Toe</button>
        <button class="btn-out" onclick="startMemory()">🧠 Memory Match</button>
        <button class="btn-out" onclick="startQuiz()">❓ Quiz</button>
        <button class="btn-out" onclick="startSnake()">🐍 Snake & Ladders</button>
        <button class="btn-out" onclick="closeModal('gamesModal')">Close</button>`;
}

// ==================== TIC TAC TOE ====================
var ttt = [], tttActive = false;

function startTTT() {
    ttt = ['','','','','','','','',''];
    tttActive = true;
    document.getElementById('gamesContent').innerHTML = `
        <h2 style="color:var(--gold);margin-bottom:15px">❌⭕ Tic Tac Toe</h2>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:280px;margin:20px auto">
            ${[0,1,2,3,4,5,6,7,8].map(function(i){return '<div style="aspect-ratio:1;background:var(--card);border:2px solid rgba(212,175,55,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:40px;cursor:pointer" onclick="tttMove('+i+')" id="ttt'+i+'"></div>';}).join('')}
        </div>
        <p id="tttStatus" style="text-align:center;color:var(--gold)">Your turn (X)</p>
        <button class="btn-out" onclick="openGames()">Back</button>`;
}

function tttMove(i) {
    if (!tttActive || ttt[i] !== '') return;
    ttt[i] = 'X';
    document.getElementById('ttt'+i).textContent = 'X';
    document.getElementById('ttt'+i).style.color = 'var(--gold)';
    
    if (tttCheck('X')) { tttActive = false; document.getElementById('tttStatus').textContent = '🎉 You Win!'; return; }
    if (ttt.every(function(c){return c!=='';})) { tttActive = false; document.getElementById('tttStatus').textContent = '🤝 Draw!'; return; }
    
    setTimeout(function() {
        var empty = [];
        for (var j=0;j<9;j++) { if (ttt[j]==='') empty.push(j); }
        var ai = empty[Math.floor(Math.random()*empty.length)];
        ttt[ai] = 'O';
        document.getElementById('ttt'+ai).textContent = 'O';
        document.getElementById('ttt'+ai).style.color = '#FF4757';
        
        if (tttCheck('O')) { tttActive = false; document.getElementById('tttStatus').textContent = '😞 AI Wins!'; }
        else if (ttt.every(function(c){return c!=='';})) { tttActive = false; document.getElementById('tttStatus').textContent = '🤝 Draw!'; }
        else { document.getElementById('tttStatus').textContent = 'Your turn (X)'; }
    }, 500);
}

function tttCheck(p) {
    var w = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return w.some(function(win){return win.every(function(i){return ttt[i]===p;});});
}

// ==================== MEMORY GAME ====================
var memCards=[], memFlipped=[], memMatched=[], memMoves=0, memLocked=false;

function startMemory() {
    var emojis = ['🎮','🎯','🎨','🎵','🎭','🎪','🎲','🎸'];
    memCards = emojis.concat(emojis).sort(function(){return Math.random()-0.5;});
    memFlipped = []; memMatched = []; memMoves = 0; memLocked = false;
    
    document.getElementById('gamesContent').innerHTML = `
        <h2 style="color:var(--gold);margin-bottom:15px">🧠 Memory Match</h2>
        <p style="text-align:center;color:var(--gold)">Moves: <span id="memMoves">0</span></p>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:320px;margin:15px auto">
            ${memCards.map(function(e,i){return '<div style="aspect-ratio:1;background:var(--card);border:2px solid rgba(212,175,55,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:30px;cursor:pointer" onclick="memFlip('+i+')" id="mem'+i+'">❓</div>';}).join('')}
        </div>
        <button class="btn-out" onclick="openGames()">Back</button>`;
}

function memFlip(i) {
    if (memLocked || memFlipped.includes(i) || memMatched.includes(i)) return;
    memFlipped.push(i);
    document.getElementById('mem'+i).textContent = memCards[i];
    
    if (memFlipped.length === 2) {
        memMoves++;
        document.getElementById('memMoves').textContent = memMoves;
        memLocked = true;
        var a = memFlipped[0], b = memFlipped[1];
        
        if (memCards[a] === memCards[b]) {
            memMatched.push(a,b);
            memFlipped = [];
            memLocked = false;
            if (memMatched.length === 16) toast('🎉 You won in '+memMoves+' moves!');
        } else {
            setTimeout(function() {
                document.getElementById('mem'+a).textContent = '❓';
                document.getElementById('mem'+b).textContent = '❓';
                memFlipped = [];
                memLocked = false;
            }, 800);
        }
    }
}

// ==================== QUIZ ====================
var quizQ=[], quizI=0, quizS=0;
var QUIZ_BANK = [
    {q:"Capital of France?",o:["London","Paris","Berlin","Madrid"],a:1},
    {q:"Red Planet?",o:["Venus","Jupiter","Mars","Saturn"],a:2},
    {q:"2+2×2=?",o:["6","8","4","10"],a:0},
    {q:"Mona Lisa painter?",o:["Van Gogh","Picasso","Da Vinci","Michelangelo"],a:2},
    {q:"Largest ocean?",o:["Atlantic","Indian","Arctic","Pacific"],a:3},
    {q:"King of Jungle?",o:["Tiger","Lion","Elephant","Bear"],a:1},
    {q:"H2O is?",o:["Oxygen","Hydrogen","Water","Air"],a:2},
    {q:"Continents?",o:["5","6","7","8"],a:2},
    {q:"Fastest animal?",o:["Lion","Cheetah","Horse","Dog"],a:1},
    {q:"India independence?",o:["1945","1947","1950","1942"],a:1}
];

function startQuiz() {
    quizQ = QUIZ_BANK.sort(function(){return Math.random()-0.5;}).slice(0,10);
    quizI = 0; quizS = 0;
    showQuizQ();
}

function showQuizQ() {
    if (quizI >= quizQ.length) { showQuizR(); return; }
    var q = quizQ[quizI];
    document.getElementById('gamesContent').innerHTML = `
        <h2 style="color:var(--gold);margin-bottom:15px">❓ Quiz ${quizI+1}/10</h2>
        <h3 style="margin:15px 0">${q.q}</h3>
        ${q.o.map(function(o,i){return '<button class="btn-out" onclick="quizAnswer('+i+')" style="text-align:left;margin:5px 0">'+o+'</button>';}).join('')}`;
}

function quizAnswer(i) {
    if (quizQ[quizI].a === i) quizS++;
    quizI++;
    showQuizQ();
}

function showQuizR() {
    var emoji, msg, mot;
    if (quizS <= 3) { emoji='😢'; msg='Need Hardwork'; mot='Keep learning! Every expert was a beginner 💪'; }
    else if (quizS <= 6) { emoji='🌟'; msg='Good'; mot='Youre doing well! Stay curious 📚'; }
    else if (quizS <= 8) { emoji='😍'; msg='Amazing'; mot='Great job! Keep this momentum 🚀'; }
    else { emoji='😱'; msg='Excellent'; mot='PERFECT! Youre a genius! 👑'; }
    
    document.getElementById('gamesContent').innerHTML = `
        <div style="text-align:center;padding:20px">
            <div style="font-size:60px">${emoji}</div>
            <h2 style="color:var(--gold);margin:15px 0">${quizS} / 10</h2>
            <h3>${msg}</h3>
            <p style="color:rgba(255,255,255,0.6);margin:10px 0">${mot}</p>
            <button class="btn" onclick="startQuiz()">Try Again</button>
            <button class="btn-out" onclick="openGames()">Back</button>
        </div>`;
}

// ==================== SNAKE & LADDERS ====================
function startSnake() {
    document.getElementById('gamesContent').innerHTML = `
        <h2 style="color:var(--gold);margin-bottom:15px">🐍 Snake & Ladders</h2>
        <p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">Coming soon! 🚧</p>
        <button class="btn-out" onclick="openGames()">Back</button>`;
}

// Modal close
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) e.target.classList.remove('show');
});

// Enter to send message
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && document.getElementById('chatWindow').classList.contains('show')) {
        sendMsg();
    }
});

console.log('Games loaded');
