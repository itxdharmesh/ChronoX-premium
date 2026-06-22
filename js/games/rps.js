function startRPS() {
    openGameScreen('✂️ Rock Paper Scissors');
    gameCanvas.style.display = 'none';
    
    var div = document.createElement('div');
    div.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';
    
    var choices = [
        {name:'Rock',emoji:'👊'},
        {name:'Paper',emoji:'✋'},
        {name:'Scissors',emoji:'✌️'}
    ];
    
    div.innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:20px">✂️ Rock Paper Scissors</h2>'+
        '<p style="color:rgba(255,255,255,0.6);margin-bottom:20px">Choose your move:</p>'+
        '<div style="display:flex;gap:15px;justify-content:center;margin-bottom:20px">'+
        choices.map(function(c,i) {
            return '<button class="btn" style="width:90px;height:90px;font-size:40px;border-radius:50%;display:flex;align-items:center;justify-content:center" onclick="playRPS('+i+')">'+c.emoji+'</button>';
        }).join('')+
        '</div>'+
        '<div id="rpsResult" style="text-align:center;margin-top:15px"></div>'+
        '<button class="btn-out" onclick="closeGameScreen()" style="margin-top:20px">Exit</button>';
    
    gameCanvas.parentNode.insertBefore(div, gameCanvas);
}

function playRPS(p) {
    var choices = ['👊','✋','✌️'];
    var ai = Math.floor(Math.random()*3);
    var result;
    
    if (p===ai) { result='🤝 Draw!'; updateGameScore(5); }
    else if ((p===0&&ai===2)||(p===1&&ai===0)||(p===2&&ai===1)) { result='🎉 You Win!'; updateGameScore(10); if(typeof addXP==='function')addXP(10); }
    else { result='😞 AI Wins!'; }
    
    document.getElementById('rpsResult').innerHTML = 
        '<div style="display:flex;justify-content:center;gap:30px;align-items:center">'+
        '<div style="text-align:center"><div style="font-size:50px">'+choices[p]+'</div><small style="color:rgba(255,255,255,0.6)">You</small></div>'+
        '<div style="font-size:30px;color:var(--gold)">VS</div>'+
        '<div style="text-align:center"><div style="font-size:50px">'+choices[ai]+'</div><small style="color:rgba(255,255,255,0.6)">AI</small></div>'+
        '</div>'+
        '<h3 style="color:var(--gold);margin-top:15px">'+result+'</h3>'+
        '<button class="btn" onclick="startRPS()" style="margin-top:10px">🔄 Play Again</button>';
}
