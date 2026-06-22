var quizQ, quizI, quizS;

function startQuiz() {
    openGameScreen('❓ Quiz Challenge');
    gameCanvas.style.display = 'none';
    
    quizQ = [
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
    ].sort(function(){return Math.random()-0.5;});
    
    quizI=0; quizS=0;
    
    var div = document.createElement('div');
    div.id = 'quizContainer';
    div.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;overflow-y:auto';
    gameCanvas.parentNode.insertBefore(div, gameCanvas);
    currentGameRestart = startQuiz;
    showQuizQ();
}

function showQuizQ() {
    if (quizI >= quizQ.length) { showQuizR(); return; }
    var q = quizQ[quizI];
    var div = document.getElementById('quizContainer');
    div.innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:10px">❓ Question '+(quizI+1)+'/'+quizQ.length+'</h2>'+
        '<h3 style="color:#fff;margin:15px 0;text-align:center">'+q.q+'</h3>'+
        q.o.map(function(o,i){return '<button class="btn-out" onclick="quizAnswer('+i+')" style="text-align:left;margin:5px 0;width:100%;max-width:350px">'+o+'</button>';}).join('');
}

function quizAnswer(i) {
    if (quizQ[quizI].a === i) { quizS++; updateGameScore(quizS*10); }
    quizI++;
    showQuizQ();
}

function showQuizR() {
    var emoji, msg, mot;
    if (quizS <= 3) { emoji='😢'; msg='Need Hardwork'; mot='Keep learning! 💪'; }
    else if (quizS <= 6) { emoji='🌟'; msg='Good'; mot='Stay curious! 📚'; }
    else if (quizS <= 8) { emoji='😍'; msg='Amazing'; mot='Great job! 🚀'; }
    else { emoji='😱'; msg='Excellent'; mot='GENIUS! 👑'; }
    
    if (quizS >= 5 && typeof addXP === 'function') addXP(quizS * 5);
    
    document.getElementById('quizContainer').innerHTML = 
        '<div style="text-align:center;padding:30px">'+
        '<div style="font-size:60px">'+emoji+'</div>'+
        '<h2 style="color:var(--gold);margin:15px 0">'+quizS+' / '+quizQ.length+'</h2>'+
        '<h3 style="color:#fff">'+msg+'</h3>'+
        '<p style="color:rgba(255,255,255,0.6);margin:10px 0">'+mot+'</p>'+
        '<button class="btn" onclick="startQuiz()">🔄 Retry</button>'+
        '<button class="btn-out" onclick="closeGameScreen()">Exit</button></div>';
}
