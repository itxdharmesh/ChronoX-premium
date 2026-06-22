// ==================== GAMES HUB ====================
function openGames() {
    openModal('gamesModal');
    document.getElementById('gamesContent').innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px;text-align:center">🎮 Games Hub</h2>' +
        
        '<h3 style="color:var(--gold-light);margin:15px 0 10px;font-size:13px">🎯 Premium Games</h3>' +
        '<button class="btn-out" onclick="closeModal(\'gamesModal\');setTimeout(function(){startSnakePremium()},300)">🐍 Snake</button>' +
        '<button class="btn-out" onclick="closeModal(\'gamesModal\');setTimeout(function(){startPongPremium()},300)">🏓 Pong</button>' +
        '<button class="btn-out" onclick="closeModal(\'gamesModal\');setTimeout(function(){startRunnerPremium()},300)">🏃 Runner</button>' +
        '<button class="btn-out" onclick="closeModal(\'gamesModal\');setTimeout(function(){startFlappyPremium()},300)">🐦 Flappy Bird</button>' +
        '<button class="btn-out" onclick="closeModal(\'gamesModal\');setTimeout(function(){startInvadersPremium()},300)">👾 Space Invaders</button>' +
        '<button class="btn-out" onclick="closeModal(\'gamesModal\');setTimeout(function(){startBreakoutPremium()},300)">🧱 Breakout</button>' +
        '<button class="btn-out" onclick="closeModal(\'gamesModal\');setTimeout(function(){startTowerDefensePremium()},300)">🏰 Tower Defense</button>' +
        '<button class="btn-out" onclick="closeModal(\'gamesModal\');setTimeout(function(){startTTTPremium()},300)">❌⭕ Tic Tac Toe</button>' +
        
        '<button class="btn-out" onclick="closeModal(\'gamesModal\')">Close</button>';
}

// Helper functions for old games (if needed)
function startTTT() { closeModal('gamesModal'); setTimeout(function(){ startTTTPremium(); }, 300); }
function startSnake() { closeModal('gamesModal'); setTimeout(function(){ startSnakePremium(); }, 300); }
function startPong() { closeModal('gamesModal'); setTimeout(function(){ startPongPremium(); }, 300); }
function startFlappy() { closeModal('gamesModal'); setTimeout(function(){ startFlappyPremium(); }, 300); }
function startSpaceInvaders() { closeModal('gamesModal'); setTimeout(function(){ startInvadersPremium(); }, 300); }
function startBreakout() { closeModal('gamesModal'); setTimeout(function(){ startBreakoutPremium(); }, 300); }
function startTowerDefense() { closeModal('gamesModal'); setTimeout(function(){ startTowerDefensePremium(); }, 300); }

// Quiz
function startQuiz() {
    closeModal('gamesModal');
    openModal('gamesModal');
    var qq = shuffleArray([
        {q:"Capital of France?",o:["London","Paris","Berlin","Madrid"],a:1},
        {q:"Red Planet?",o:["Venus","Jupiter","Mars","Saturn"],a:2},
        {q:"2+2×2=?",o:["6","8","4","10"],a:0},
        {q:"Largest ocean?",o:["Atlantic","Indian","Arctic","Pacific"],a:3},
        {q:"H2O is?",o:["Oxygen","Hydrogen","Water","Air"],a:2}
    ]);
    var qi=0, qs=0;
    function showQ(){
        if(qi>=qq.length){
            document.getElementById('gamesContent').innerHTML=
                '<div style="text-align:center;padding:30px">'+
                '<h2 style="color:var(--gold)">'+qs+'/'+qq.length+'</h2>'+
                '<p>'+(qs>=3?'🎉 Great!':'😢 Try Again!')+'</p>'+
                '<button class="btn" onclick="startQuiz()">Retry</button>'+
                '<button class="btn-out" onclick="openGames()">Back</button></div>';
            if(qs>=3&&typeof addXP==='function')addXP(qs*5);
            return;
        }
        var q=qq[qi];
        document.getElementById('gamesContent').innerHTML=
            '<h3 style="color:var(--gold)">❓ '+(qi+1)+'/'+qq.length+'</h3>'+
            '<p style="margin:10px 0">'+q.q+'</p>'+
            q.o.map(function(o,i){return'<button class="btn-out" onclick="answerQ('+i+')" style="text-align:left;margin:4px 0">'+o+'</button>';}).join('');
    }
    function answerQ(i){if(qq[qi].a===i)qs++;qi++;showQ();}
    showQ();
}

// RPS
function startRPS() {
    closeModal('gamesModal');
    openModal('gamesModal');
    var choices=['👊 Rock','✋ Paper','✌️ Scissors'];
    document.getElementById('gamesContent').innerHTML=
        '<h3 style="color:var(--gold);text-align:center">✂️ RPS</h3>'+
        '<div style="display:flex;gap:8px;justify-content:center;margin:15px 0">'+
        choices.map(function(c,i){return'<button class="btn" style="flex:1" onclick="playRPS('+i+')">'+c+'</button>';}).join('')+
        '</div><div id="rpsResult" style="text-align:center"></div>'+
        '<button class="btn-out" onclick="openGames()">Back</button>';
}

function playRPS(p){
    var ai=Math.floor(Math.random()*3);
    var emojis=['👊','✋','✌️'];
    var result=(p===ai)?'🤝 Draw!':((p===0&&ai===2)||(p===1&&ai===0)||(p===2&&ai===1))?'🎉 Win!':'😞 Lose!';
    if(result==='🎉 Win!'&&typeof addXP==='function')addXP(10);
    document.getElementById('rpsResult').innerHTML='You: '+emojis[p]+' AI: '+emojis[ai]+'<br><b>'+result+'</b>';
}

// Multiplayer
function showMultiplayer() {
    var mutual=(currentUserData.following||[]).filter(function(id){return (currentUserData.followers||[]).indexOf(id)!==-1;});
    var h='<h3 style="color:var(--gold);text-align:center">👥 Challenge</h3>';
    if(mutual.length===0)h+='<p style="text-align:center;color:var(--text2);padding:20px">No mutual friends</p>';
    else {
        mutual.forEach(function(id){
            db.collection('users').doc(id).get().then(function(d){
                var u=d.data();
                if(u)h+='<div class="chat-item"><div class="av" style="width:40px;height:40px;font-size:18px">'+(u.name||'?')[0]+'</div><div style="flex:1"><b>'+u.name+'</b></div><button class="btn" style="width:auto;padding:6px 14px" onclick="sendChallenge(\''+id+'\')">⚔️</button></div>';
                document.getElementById('gamesContent').innerHTML=h+'<button class="btn-out" onclick="openGames()">Back</button>';
            });
        });
        h+='<button class="btn-out" onclick="openGames()">Back</button>';
    }
    document.getElementById('gamesContent').innerHTML=h;
}

function sendChallenge(fid){
    db.collection('challenges').add({
        from:currentUser.uid,fromName:currentUserData.name,
        to:fid,game:'tictactoe',status:'pending',
        timestamp:firebase.firestore.FieldValue.serverTimestamp()
    });
    showToast('Challenge sent! ⚔️');
    openGames();
}

console.log('✅ Games Hub loaded');
