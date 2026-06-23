var ludoData;

function startLudo() {
    openGameScreen('🎲 Ludo');
    gameCanvas.style.display = 'none';
    
    ludoData = {
        players: [
            { name: 'You', color: '#FF4757', tokens: [0, 0, 0, 0], home: 0, finished: 0 },
            { name: 'AI 1', color: '#2ED573', tokens: [0, 0, 0, 0], home: 0, finished: 0 },
            { name: 'AI 2', color: '#FFD700', tokens: [0, 0, 0, 0], home: 0, finished: 0 },
            { name: 'AI 3', color: '#00D4FF', tokens: [0, 0, 0, 0], home: 0, finished: 0 }
        ],
        currentPlayer: 0,
        dice: 1,
        rolling: false,
        selectedToken: -1,
        score: 0,
        turnCount: 0,
        winner: null,
        message: 'Your turn! Roll the dice 🎲'
    };
    
    var d = document.createElement('div');
    d.id = 'ludoContainer';
    d.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;padding:15px;overflow-y:auto';
    renderLudo(d);
    gameCanvas.parentNode.insertBefore(d, gameCanvas);
    currentGameRestart = startLudo;
}

function renderLudo(d) {
    var h = '<h2 style="color:#D4AF37;margin-bottom:5px;text-align:center">🎲 Ludo</h2>';
    
    // Message
    h += '<p style="color:rgba(255,255,255,0.8);font-size:13px;margin-bottom:10px;text-align:center;min-height:20px">' + ludoData.message + '</p>';
    
    // Dice display
    var diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    h += '<div style="text-align:center;margin-bottom:10px">';
    h += '<span style="font-size:50px">' + diceEmojis[ludoData.dice - 1] + '</span>';
    h += '<p style="color:#D4AF37;font-size:12px">Dice: ' + ludoData.dice + '</p>';
    h += '</div>';
    
    // Player turn indicator
    h += '<div style="display:flex;justify-content:center;gap:10px;margin-bottom:12px">';
    ludoData.players.forEach(function(p, i) {
        var isActive = i === ludoData.currentPlayer;
        h += '<div style="padding:6px 12px;border-radius:20px;background:' + (isActive ? p.color : 'rgba(255,255,255,0.1)') + ';color:' + (isActive ? '#fff' : 'rgba(255,255,255,0.5)') + ';font-size:11px;font-weight:' + (isActive ? 'bold' : 'normal') + ';border:1px solid ' + p.color + '">' + p.name + '</div>';
    });
    h += '</div>';
    
    // Board with player tokens
    ludoData.players.forEach(function(p, i) {
        h += '<div style="background:rgba(0,0,0,0.2);padding:10px;border-radius:10px;margin-bottom:8px;width:100%;max-width:350px">';
        h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
        h += '<span style="color:' + p.color + ';font-weight:bold;font-size:13px">' + p.name + '</span>';
        h += '<span style="color:rgba(255,255,255,0.5);font-size:10px">🏠:' + p.home + ' ✅:' + p.finished + '</span>';
        h += '</div>';
        h += '<div style="display:flex;gap:8px">';
        p.tokens.forEach(function(t, j) {
            var bg = p.color;
            if (t === 0) bg = 'rgba(255,255,255,0.1)';
            else if (t >= 56) bg = '#2ED573';
            var isSelected = i === ludoData.currentPlayer && ludoData.selectedToken === j;
            h += '<div onclick="selectLudoToken(' + i + ',' + j + ')" style="width:40px;height:40px;border-radius:50%;background:' + bg + ';display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;cursor:pointer;border:' + (isSelected ? '3px solid #fff' : '2px solid ' + p.color) + ';transition:all 0.2s">' + (t === 0 ? '🏠' : t >= 56 ? '✅' : t) + '</div>';
        });
        h += '</div></div>';
    });
    
    // Buttons
    if (ludoData.winner) {
        h += '<h3 style="color:#2ED573;text-align:center;margin:10px 0">🎉 ' + ludoData.winner + ' Wins!</h3>';
        h += '<button class="btn" onclick="startLudo()" style="margin:5px">🔄 New Game</button>';
    } else if (ludoData.currentPlayer === 0) {
        if (ludoData.rolling) {
            h += '<button class="btn" disabled style="opacity:0.5;margin:5px">Rolling...</button>';
        } else {
            h += '<button class="btn" onclick="rollLudoDice()" style="margin:5px">🎲 Roll Dice</button>';
        }
        if (ludoData.selectedToken >= 0 && ludoData.dice === 6) {
            h += '<button class="btn-out" onclick="moveLudoToken()" style="margin:5px">▶️ Move Token</button>';
        } else if (ludoData.selectedToken >= 0 && ludoData.dice < 6) {
            h += '<button class="btn-out" onclick="moveLudoToken()" style="margin:5px">▶️ Move Token</button>';
        }
    } else {
        h += '<button class="btn" disabled style="opacity:0.5;margin:5px">AI Playing...</button>';
    }
    
    h += '<button class="btn-out" onclick="closeGameScreen()" style="margin:5px">Exit</button>';
    d.innerHTML = h;
}

function selectLudoToken(pi, ti) {
    if (pi !== ludoData.currentPlayer || ludoData.currentPlayer !== 0) return;
    if (ludoData.rolling) return;
    ludoData.selectedToken = ti;
    renderLudo(document.getElementById('ludoContainer'));
}

function rollLudoDice() {
    if (ludoData.currentPlayer !== 0 || ludoData.rolling) return;
    ludoData.rolling = true;
    ludoData.message = 'Rolling... 🎲';
    renderLudo(document.getElementById('ludoContainer'));
    
    var rollCount = 0;
    var maxRolls = 10;
    var rollInterval = setInterval(function() {
        ludoData.dice = Math.floor(Math.random() * 6) + 1;
        renderLudo(document.getElementById('ludoContainer'));
        rollCount++;
        if (rollCount >= maxRolls) {
            clearInterval(rollInterval);
            ludoData.dice = Math.floor(Math.random() * 6) + 1;
            ludoData.rolling = false;
            
            if (ludoData.dice === 6) {
                ludoData.message = 'You rolled 6! 🎉 Select a token or roll again!';
            } else {
                ludoData.message = 'You rolled ' + ludoData.dice + '! Select a token to move';
            }
            
            // Auto-select if only one token can move
            var movableTokens = [];
            ludoData.players[0].tokens.forEach(function(t, i) {
                if (t > 0 && t < 56) movableTokens.push(i);
                if (t === 0 && ludoData.dice === 6) movableTokens.push(i);
            });
            if (movableTokens.length === 1) {
                ludoData.selectedToken = movableTokens[0];
                ludoData.message += ' (Auto-selected)';
            }
            
            renderLudo(document.getElementById('ludoContainer'));
            
            // Auto-move after delay if no selection
            if (ludoData.dice < 6 && ludoData.selectedToken < 0 && movableTokens.length > 0) {
                setTimeout(function() {
                    ludoData.selectedToken = movableTokens[0];
                    moveLudoToken();
                }, 2000);
            }
        }
    }, 100);
}

function moveLudoToken() {
    if (ludoData.currentPlayer !== 0 || ludoData.selectedToken < 0) return;
    
    var token = ludoData.players[0].tokens[ludoData.selectedToken];
    var moved = false;
    
    if (ludoData.dice === 6 && token === 0) {
        // Move from home
        ludoData.players[0].tokens[ludoData.selectedToken] = 1;
        ludoData.players[0].home--;
        moved = true;
        ludoData.message = 'Token moved out of home! Roll again!';
        ludoData.dice = 0;
    } else if (token > 0) {
        var newPos = token + ludoData.dice;
        if (newPos > 56) {
            ludoData.message = 'Need exact roll to finish!';
            ludoData.selectedToken = -1;
            ludoData.dice = 0;
            renderLudo(document.getElementById('ludoContainer'));
            nextLudoTurn();
            return;
        }
        
        // Check for opponent token capture
        ludoData.players.forEach(function(p, i) {
            if (i === 0) return;
            p.tokens.forEach(function(t, j) {
                if (t === newPos) {
                    p.tokens[j] = 0;
                    p.home++;
                    ludoData.score += 20;
                    updateGameScore(ludoData.score);
                    ludoData.message = 'Captured ' + p.name + '\'s token! 🎯';
                }
            });
        });
        
        ludoData.players[0].tokens[ludoData.selectedToken] = newPos;
        moved = true;
        
        if (newPos >= 56) {
            ludoData.players[0].finished++;
            ludoData.score += 50;
            updateGameScore(ludoData.score);
            ludoData.message = 'Token reached home! 🏠';
        }
    }
    
    if (!moved) {
        ludoData.message = 'Cannot move this token!';
    }
    
    ludoData.selectedToken = -1;
    renderLudo(document.getElementById('ludoContainer'));
    
    // Check win
    if (ludoData.players[0].finished >= 4) {
        ludoData.winner = 'You';
        ludoData.score += 100;
        updateGameScore(ludoData.score);
        if (typeof addXP === 'function') addXP(35);
        renderLudo(document.getElementById('ludoContainer'));
        return;
    }
    
    // Next turn
    if (ludoData.dice !== 6) {
        setTimeout(function() { nextLudoTurn(); }, 1500);
    } else {
        setTimeout(function() {
            ludoData.message = 'Roll again! You got a 6! 🎉';
            renderLudo(document.getElementById('ludoContainer'));
        }, 500);
    }
}

function nextLudoTurn() {
    ludoData.currentPlayer = (ludoData.currentPlayer + 1) % 4;
    ludoData.selectedToken = -1;
    ludoData.dice = 1;
    ludoData.turnCount++;
    
    if (ludoData.currentPlayer === 0) {
        ludoData.message = 'Your turn! Roll the dice 🎲';
        ludoData.rolling = false;
        renderLudo(document.getElementById('ludoContainer'));
    } else {
        // AI turn
        ludoData.message = ludoData.players[ludoData.currentPlayer].name + ' is playing... 🤖';
        renderLudo(document.getElementById('ludoContainer'));
        setTimeout(function() { aiLudoTurn(); }, 1000);
    }
}

function aiLudoTurn() {
    var p = ludoData.players[ludoData.currentPlayer];
    var dice = Math.floor(Math.random() * 6) + 1;
    ludoData.dice = dice;
    
    var movedToken = -1;
    
    if (dice === 6) {
        // Try to bring out a token
        for (var i = 0; i < 4; i++) {
            if (p.tokens[i] === 0) {
                p.tokens[i] = 1;
                p.home--;
                movedToken = i;
                break;
            }
        }
    }
    
    if (movedToken < 0) {
        // Move an existing token
        var movableTokens = [];
        p.tokens.forEach(function(t, i) {
            if (t > 0 && t + dice <= 56) movableTokens.push(i);
        });
        
        if (movableTokens.length > 0) {
            var ti = movableTokens[Math.floor(Math.random() * movableTokens.length)];
            var newPos = p.tokens[ti] + dice;
            
            // Check capture
            ludoData.players.forEach(function(op, oi) {
                if (oi === ludoData.currentPlayer) return;
                op.tokens.forEach(function(ot, oj) {
                    if (ot === newPos) {
                        op.tokens[oj] = 0;
                        op.home++;
                    }
                });
            });
            
            p.tokens[ti] = newPos;
            if (newPos >= 56) p.finished++;
            movedToken = ti;
        }
    }
    
    ludoData.message = p.name + ' rolled ' + dice + '!';
    renderLudo(document.getElementById('ludoContainer'));
    
    // Check AI win
    if (p.finished >= 4) {
        ludoData.winner = p.name;
        renderLudo(document.getElementById('ludoContainer'));
        return;
    }
    
    // Next turn
    setTimeout(function() {
        if (dice === 6) {
            aiLudoTurn();
        } else {
            nextLudoTurn();
        }
    }, 800);
}

console.log('✅ Ludo loaded');
