// ==================== GAMES HUB ====================
function openGames() {
    openModal('gamesModal');
    var content = document.getElementById('gamesContent');
    if (!content) return;
    
    content.innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:15px;text-align:center">🎮 Games Hub</h2>' +
        
        '<h3 style="color:var(--gold-light);margin:15px 0 10px;font-size:13px">🎯 Premium Games</h3>' +
        '<button class="btn-out" onclick="startGame(\'snake\')">🐍 Snake</button>' +
        '<button class="btn-out" onclick="startGame(\'pong\')">🏓 Pong</button>' +
        '<button class="btn-out" onclick="startGame(\'runner\')">🏃 Runner</button>' +
        '<button class="btn-out" onclick="startGame(\'flappy\')">🐦 Flappy Bird</button>' +
        '<button class="btn-out" onclick="startGame(\'invaders\')">👾 Space Invaders</button>' +
        '<button class="btn-out" onclick="startGame(\'breakout\')">🧱 Breakout</button>' +
        '<button class="btn-out" onclick="startGame(\'tower\')">🏰 Tower Defense</button>' +
        '<button class="btn-out" onclick="startGame(\'tictactoe\')">❌⭕ Tic Tac Toe</button>' +
        
        '<h3 style="color:var(--gold-light);margin:15px 0 10px;font-size:13px">🏆 Challenge</h3>' +
        '<button class="btn-out" onclick="startQuiz()">❓ Quiz</button>' +
        '<button class="btn-out" onclick="startRPS()">✂️ Rock Paper Scissors</button>' +
        
        '<h3 style="color:var(--gold-light);margin:15px 0 10px;font-size:13px">👥 Multiplayer</h3>' +
        '<button class="btn-out" onclick="showMultiplayer()">🔗 Challenge Friend</button>' +
        
        '<button class="btn-out" onclick="closeModal(\'gamesModal\')">Close</button>';
}

// ==================== START GAME HELPER ====================
function startGame(gameName) {
    closeModal('gamesModal');
    
    setTimeout(function() {
        switch(gameName) {
            case 'snake':
                if (typeof startSnakePremium === 'function') startSnakePremium();
                else showToast('Snake game loading...', 'error');
                break;
            case 'pong':
                if (typeof startPongPremium === 'function') startPongPremium();
                else showToast('Pong game loading...', 'error');
                break;
            case 'runner':
                if (typeof startRunnerPremium === 'function') startRunnerPremium();
                else showToast('Runner game loading...', 'error');
                break;
            case 'flappy':
                if (typeof startFlappyPremium === 'function') startFlappyPremium();
                else showToast('Flappy game loading...', 'error');
                break;
            case 'invaders':
                if (typeof startInvadersPremium === 'function') startInvadersPremium();
                else showToast('Invaders game loading...', 'error');
                break;
            case 'breakout':
                if (typeof startBreakoutPremium === 'function') startBreakoutPremium();
                else showToast('Breakout game loading...', 'error');
                break;
            case 'tower':
                if (typeof startTowerDefensePremium === 'function') startTowerDefensePremium();
                else showToast('Tower Defense loading...', 'error');
                break;
            case 'tictactoe':
                if (typeof startTTTPremium === 'function') startTTTPremium();
                else showToast('Tic Tac Toe loading...', 'error');
                break;
            default:
                showToast('Game not found!', 'error');
        }
    }, 400);
}

// ==================== FULL PAGE GAME ====================
function openFullPageGame(title) {
    // Remove existing game if any
    var existing = document.getElementById('fullGame');
    if (existing) existing.remove();
    
    // Stop any running game loops
    if (typeof gameAnimation !== 'undefined' && gameAnimation) cancelAnimationFrame(gameAnimation);
    if (typeof snakeInterval !== 'undefined' && snakeInterval) clearInterval(snakeInterval);
    
    // Reset game state
    window.gameActive = true;
    window.gameScore = 0;
    
    var html = 
        '<div id="fullGame" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#0A0E27;z-index:7000;display:flex;flex-direction:column">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 15px;background:rgba(19,24,66,0.95);border-bottom:1px solid var(--border);flex-shrink:0">' +
                '<button onclick="closeFullGame()" style="background:none;border:none;color:var(--gold);font-size:22px;cursor:pointer">←</button>' +
                '<h3 style="color:var(--gold);font-size:16px;margin:0">' + title + '</h3>' +
                '<span id="gameScoreDisplay" style="color:var(--gold);font-weight:700">Score: 0</span>' +
            '</div>' +
            '<canvas id="gameCanvas" style="flex:1;width:100%;display:block;background:#0A0E27"></canvas>' +
            '<div id="gameOverScreen" style="display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;background:rgba(19,24,66,0.95);padding:30px;border-radius:20px;border:1px solid var(--gold);z-index:10">' +
                '<h2 style="color:var(--gold);margin-bottom:10px">Game Over!</h2>' +
                '<p style="color:#fff;font-size:18px;margin:10px 0">Score: <span id="finalScore" style="color:var(--gold)"></span></p>' +
                '<p id="challengeResult" style="color:var(--gold-light);margin:10px 0"></p>' +
                '<button class="btn" onclick="restartGame()" style="margin:5px">🔄 Restart</button>' +
                '<button class="btn-out" onclick="closeFullGame()" style="margin:5px">🚪 Exit</button>' +
            '</div>' +
        '</div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
    
    // Set canvas references
    window.gameCanvas = document.getElementById('gameCanvas');
    window.gameCtx = window.gameCanvas ? window.gameCanvas.getContext('2d') : null;
    
    if (window.gameCanvas) {
        window.gameCanvas.width = window.innerWidth;
        window.gameCanvas.height = window.innerHeight - 100;
    }
}

function closeFullGame() {
    window.gameActive = false;
    if (typeof gameAnimation !== 'undefined' && gameAnimation) cancelAnimationFrame(gameAnimation);
    if (typeof snakeInterval !== 'undefined' && snakeInterval) clearInterval(snakeInterval);
    var el = document.getElementById('fullGame');
    if (el) el.remove();
    window.gameCanvas = null;
    window.gameCtx = null;
}

function updateScore(points) {
    window.gameScore = (window.gameScore || 0) + Math.floor(points);
    var display = document.getElementById('gameScoreDisplay');
    if (display) display.textContent = 'Score: ' + window.gameScore;
}

function gameOver(msg) {
    window.gameActive = false;
    if (typeof gameAnimation !== 'undefined' && gameAnimation) cancelAnimationFrame(gameAnimation);
    if (typeof snakeInterval !== 'undefined' && snakeInterval) clearInterval(snakeInterval);
    
    var finalScore = document.getElementById('finalScore');
    var challengeResult = document.getElementById('challengeResult');
    if (finalScore) finalScore.textContent = window.gameScore;
    if (challengeResult && msg) challengeResult.textContent = msg;
    
    var overlay = document.getElementById('gameOverScreen');
    if (overlay) overlay.style.display = 'block';
    
    if (window.gameScore > 0 && typeof addXP === 'function') {
        addXP(Math.floor(window.gameScore / 10));
    }
}

function restartGame() {
    var overlay = document.getElementById('gameOverScreen');
    if (overlay) overlay.style.display = 'none';
    window.gameScore = 0;
    updateScore(0);
    window.gameActive = true;
    
    // Call the current game's restart
    if (typeof currentGameRestart === 'function') {
        currentGameRestart();
    }
}

// ==================== QUIZ ====================
function startQuiz() {
    closeModal('gamesModal');
    setTimeout(function() {
        openModal('gamesModal');
        var qq = [
            {q:"Capital of France?",o:["London","Paris","Berlin","Madrid"],a:1},
            {q:"Red Planet?",o:["Venus","Jupiter","Mars","Saturn"],a:2},
            {q:"2+2×2=?",o:["6","8","4","10"],a:0},
            {q:"Largest ocean?",o:["Atlantic","Indian","Arctic","Pacific"],a:3},
            {q:"H2O is?",o:["Oxygen","Hydrogen","Water","Air"],a:2}
        ].sort(function() { return Math.random() - 0.5; });
        
        var qi=0, qs=0;
        
        function showQ() {
            if(qi >= qq.length) {
                document.getElementById('gamesContent').innerHTML =
                    '<div style="text-align:center;padding:30px">' +
                    '<h2 style="color:var(--gold)">' + qs + '/' + qq.length + '</h2>' +
                    '<p>' + (qs>=3?'🎉 Great!':'😢 Try Again!') + '</p>' +
                    '<button class="btn" onclick="startQuiz()">Retry</button>' +
                    '<button class="btn-out" onclick="openGames()">Back</button></div>';
                if(qs>=3 && typeof addXP==='function') addXP(qs*5);
                return;
            }
            var q = qq[qi];
            document.getElementById('gamesContent').innerHTML =
                '<h3 style="color:var(--gold)">❓ ' + (qi+1) + '/' + qq.length + '</h3>' +
                '<p style="margin:10px 0">' + q.q + '</p>' +
                q.o.map(function(o,i) {
                    return '<button class="btn-out" onclick="answerQ('+i+')" style="text-align:left;margin:4px 0">'+o+'</button>';
                }).join('');
        }
        
        window.answerQ = function(i) {
            if(qq[qi].a === i) qs++;
            qi++;
            showQ();
        };
        
        showQ();
    }, 400);
}

// ==================== RPS ====================
function startRPS() {
    closeModal('gamesModal');
    setTimeout(function() {
        openModal('gamesModal');
        var choices = ['👊 Rock','✋ Paper','✌️ Scissors'];
        document.getElementById('gamesContent').innerHTML =
            '<h3 style="color:var(--gold);text-align:center">✂️ Rock Paper Scissors</h3>' +
            '<div style="display:flex;gap:8px;justify-content:center;margin:15px 0">' +
            choices.map(function(c,i) {
                return '<button class="btn" style="flex:1" onclick="playRPS('+i+')">'+c+'</button>';
            }).join('') +
            '</div><div id="rpsResult" style="text-align:center;color:var(--gold);font-size:18px"></div>' +
            '<button class="btn-out" onclick="openGames()" style="margin-top:15px">Back</button>';
    }, 400);
}

window.playRPS = function(p) {
    var ai = Math.floor(Math.random() * 3);
    var emojis = ['👊','✋','✌️'];
    var result = (p===ai) ? '🤝 Draw!' : ((p===0&&ai===2)||(p===1&&ai===0)||(p===2&&ai===1)) ? '🎉 You Win!' : '😞 AI Wins!';
    if(result === '🎉 You Win!' && typeof addXP === 'function') addXP(10);
    document.getElementById('rpsResult').innerHTML = 'You: ' + emojis[p] + ' vs AI: ' + emojis[ai] + '<br><b>' + result + '</b>';
};

// ==================== MULTIPLAYER ====================
function showMultiplayer() {
    var mutual = (currentUserData.following || []).filter(function(id) {
        return (currentUserData.followers || []).indexOf(id) !== -1;
    });
    
    var h = '<h3 style="color:var(--gold);text-align:center">👥 Challenge Friend</h3>';
    
    if (mutual.length === 0) {
        h += '<p style="text-align:center;color:var(--text2);padding:20px">No mutual friends yet</p>';
    } else {
        h += '<div id="mutualList"></div>';
        document.getElementById('gamesContent').innerHTML = h + '<button class="btn-out" onclick="openGames()">Back</button>';
        
        var items = '';
        var done = 0;
        mutual.forEach(function(id) {
            db.collection('users').doc(id).get().then(function(d) {
                done++;
                var u = d.data();
                if (u) items += '<div class="chat-item"><div class="av" style="width:40px;height:40px;font-size:18px">' + (u.name||'?')[0] + '</div><div style="flex:1"><b>' + u.name + '</b></div><button class="btn" style="width:auto;padding:6px 14px" onclick="sendChallenge(\'' + id + '\')">⚔️</button></div>';
                if (done === mutual.length) {
                    document.getElementById('mutualList').innerHTML = items;
                }
            });
        });
        h += '<button class="btn-out" onclick="openGames()">Back</button>';
    }
    document.getElementById('gamesContent').innerHTML = h;
}

function sendChallenge(fid) {
    db.collection('challenges').add({
        from: currentUser.uid,
        fromName: currentUserData.name,
        to: fid,
        game: 'tictactoe',
        status: 'pending',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function() {
        showToast('Challenge sent! ⚔️');
        openGames();
    });
}

// Modal close
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

console.log('✅ Games Hub ready');
