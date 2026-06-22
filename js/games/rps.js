var rpsChoices = ['👊', '✋', '✌️'];
var rpsNames = ['Rock', 'Paper', 'Scissors'];
var rpsScore = 0;
var rpsAIScore = 0;
var rpsDraws = 0;

function startRPS() {
    openGameScreen('✂️ Rock Paper Scissors');
    gameCanvas.style.display = 'none';
    
    var div = document.createElement('div');
    div.id = 'rpsContainer';
    div.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px';
    
    div.innerHTML = 
        '<h2 style="color:#D4AF37;margin-bottom:10px">✂️ Rock Paper Scissors</h2>' +
        '<div style="display:flex;justify-content:center;gap:20px;margin-bottom:15px;color:rgba(255,255,255,0.6);font-size:13px">' +
            '<span>🧑 You: <b style="color:#D4AF37">' + rpsScore + '</b></span>' +
            '<span>🤝 Draw: <b>' + rpsDraws + '</b></span>' +
            '<span>🤖 AI: <b style="color:#FF4757">' + rpsAIScore + '</b></span>' +
        '</div>' +
        '<p style="color:rgba(255,255,255,0.6);margin-bottom:20px;font-size:14px">Choose your move:</p>' +
        '<div style="display:flex;gap:15px;justify-content:center;margin-bottom:20px">' +
            '<button class="btn" style="width:90px;height:90px;font-size:45px;border-radius:50%;display:flex;align-items:center;justify-content:center" onclick="playRPS(0)">👊</button>' +
            '<button class="btn" style="width:90px;height:90px;font-size:45px;border-radius:50%;display:flex;align-items:center;justify-content:center" onclick="playRPS(1)">✋</button>' +
            '<button class="btn" style="width:90px;height:90px;font-size:45px;border-radius:50%;display:flex;align-items:center;justify-content:center" onclick="playRPS(2)">✌️</button>' +
        '</div>' +
        '<div id="rpsResult" style="text-align:center;margin-top:10px"></div>' +
        '<button class="btn-out" onclick="closeGameScreen()" style="margin-top:20px">Exit</button>';
    
    gameCanvas.parentNode.insertBefore(div, gameCanvas);
    currentGameRestart = startRPS;
}

function playRPS(playerChoice) {
    var aiChoice = Math.floor(Math.random() * 3);
    var result = '';
    var resultColor = '';
    
    if (playerChoice === aiChoice) {
        result = '🤝 Draw!';
        resultColor = '#FFD700';
        rpsDraws++;
    } else if (
        (playerChoice === 0 && aiChoice === 2) ||
        (playerChoice === 1 && aiChoice === 0) ||
        (playerChoice === 2 && aiChoice === 1)
    ) {
        result = '🎉 You Win!';
        resultColor = '#2ED573';
        rpsScore++;
        updateGameScore(rpsScore * 10);
        if (typeof addXP === 'function') addXP(10);
    } else {
        result = '😞 AI Wins!';
        resultColor = '#FF4757';
        rpsAIScore++;
    }
    
    document.getElementById('rpsResult').innerHTML = 
        '<div style="display:flex;justify-content:center;align-items:center;gap:25px;margin-top:10px">' +
            '<div style="text-align:center">' +
                '<div style="font-size:55px;animation:bounceIn 0.4s">' + rpsChoices[playerChoice] + '</div>' +
                '<small style="color:rgba(255,255,255,0.6)">You</small>' +
            '</div>' +
            '<div style="font-size:25px;color:#D4AF37;font-weight:bold">VS</div>' +
            '<div style="text-align:center">' +
                '<div style="font-size:55px;animation:bounceIn 0.4s">' + rpsChoices[aiChoice] + '</div>' +
                '<small style="color:rgba(255,255,255,0.6)">AI</small>' +
            '</div>' +
        '</div>' +
        '<h3 style="color:' + resultColor + ';margin-top:15px;font-size:22px">' + result + '</h3>' +
        '<button class="btn" onclick="startRPS()" style="margin-top:15px">🔄 Play Again</button>';
}

// Add bounce animation
var style = document.createElement('style');
style.textContent = '@keyframes bounceIn{0%{transform:scale(0.3);opacity:0}50%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}';
document.head.appendChild(style);

console.log('✅ RPS loaded');
