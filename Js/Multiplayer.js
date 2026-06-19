// ==================== MULTIPLAYER SYSTEM ====================

let currentMultiplayerGame = null;
let multiplayerListener = null;

// Open multiplayer menu
function openMultiplayer() {
    openModal('gamesModal');
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header">
            <button onclick="openGames()">← Back</button>
            <h2>👥 Multiplayer</h2>
            <div></div>
        </div>
        <p style="color:var(--text2);margin-bottom:15px;text-align:center">Challenge a friend!</p>
        
        <h3 style="color:var(--gold);margin-bottom:10px">Select Game</h3>
        <select id="multiGameSelect" style="width:100%;padding:12px;background:var(--card);color:#fff;border:1px solid var(--border);border-radius:10px;margin-bottom:15px">
            <option value="tictactoe">❌⭕ Tic Tac Toe</option>
            <option value="memory">🧠 Memory Match</option>
            <option value="snake-ladder">🐍 Saap Sidhi</option>
            <option value="uno">🃏 UNO</option>
            <option value="ludo">🎲 Ludo</option>
        </select>
        
        <h3 style="color:var(--gold);margin-bottom:10px">Select Friend</h3>
        <div id="friendsList" style="max-height:200px;overflow-y:auto">Loading friends...</div>
        <div id="multiplayerStatus" style="text-align:center;margin-top:15px"></div>
    `;
    
    loadFriendsForMultiplayer();
    listenForChallenges();
}

// Load friends (mutual follows)
async function loadFriendsForMultiplayer() {
    const container = document.getElementById('friendsList');
    if (!container) return;
    
    const following = currentUserData?.following || [];
    const followers = currentUserData?.followers || [];
    const mutualFriends = following.filter(id => followers.includes(id));
    
    if (mutualFriends.length === 0) {
        container.innerHTML = '<div class="empty-state">No mutual friends yet. Follow someone who follows you back!</div>';
        return;
    }
    
    let html = '';
    for (const friendId of mutualFriends) {
        const doc = await db.collection('users').doc(friendId).get();
        const friend = doc.data();
        if (!friend) continue;
        
        const isOnline = friend.onlineStatus === 'online';
        
        html += `
            <div class="user-card" style="margin-bottom:8px">
                <img src="${friend.avatar || getAvatar(friend.name)}" class="user-avatar-sm" onerror="this.src='${getAvatar(friend.name)}'">
                <div class="user-card-info">
                    <div class="user-card-name">${friend.name}</div>
                    <div class="user-card-username">${friend.username} ${isOnline ? '<span style="color:#2ED573">●</span>' : ''}</div>
                </div>
                <button class="btn-sm btn-gold-sm" onclick="sendChallenge('${friendId}', '${friend.name}')">Challenge</button>
            </div>
        `;
    }
    container.innerHTML = html;
}

// Send challenge
async function sendChallenge(friendId, friendName) {
    const gameSelect = document.getElementById('multiGameSelect');
    const game = gameSelect?.value || 'tictactoe';
    
    const gameNames = {
        tictactoe: 'Tic Tac Toe',
        memory: 'Memory Match',
        'snake-ladder': 'Saap Sidhi',
        uno: 'UNO',
        ludo: 'Ludo'
    };
    
    // Create challenge
    const challengeRef = await db.collection('challenges').add({
        from: currentUser.uid,
        fromName: currentUserData.name,
        to: friendId,
        game,
        gameName: gameNames[game],
        status: 'pending',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Send notification
    await db.collection('notifications').add({
        to: friendId,
        from: currentUser.uid,
        fromName: currentUserData.name,
        type: 'challenge',
        game,
        gameName: gameNames[game],
        challengeId: challengeRef.id,
        read: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    document.getElementById('multiplayerStatus').innerHTML = `
        <div style="color:var(--gold);padding:20px">
            <div style="font-size:30px">📤</div>
            <p>Challenge sent to ${friendName}!</p>
            <p style="color:var(--text2);font-size:12px">Waiting for response...</p>
            <div class="loading-spinner"></div>
        </div>
    `;
    
    // Listen for response
    listenForChallengeResponse(challengeRef.id, game, friendId, friendName);
}

// Listen for challenge response
function listenForChallengeResponse(challengeId, game, friendId, friendName) {
    if (multiplayerListener) multiplayerListener();
    
    multiplayerListener = db.collection('challenges').doc(challengeId)
        .onSnapshot(async (doc) => {
            const challenge = doc.data();
            if (!challenge) return;
            
            if (challenge.status === 'accepted') {
                multiplayerListener();
                document.getElementById('multiplayerStatus').innerHTML = `
                    <div style="color:#2ED573;padding:20px">
                        <div style="font-size:30px">✅</div>
                        <p>${friendName} accepted!</p>
                        <p style="color:var(--text2);font-size:12px">Starting game...</p>
                    </div>
                `;
                
                // Start the game
                setTimeout(() => {
                    closeModal('gamesModal');
                    startMultiplayerGame(game, challengeId, friendId, friendName);
                }, 1500);
                
            } else if (challenge.status === 'denied') {
                multiplayerListener();
                document.getElementById('multiplayerStatus').innerHTML = `
                    <div style="color:#FF4757;padding:20px">
                        <div style="font-size:30px">❌</div>
                        <p>${friendName} denied your challenge</p>
                        <button class="btn-outline" onclick="openMultiplayer()" style="margin-top:10px">Try Again</button>
                    </div>
                `;
            }
        });
}

// Listen for incoming challenges
function listenForChallenges() {
    if (!currentUser) return;
    
    db.collection('notifications')
        .where('to', '==', currentUser.uid)
        .where('type', '==', 'challenge')
        .where('read', '==', false)
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const notif = change.doc.data();
                    showChallengeNotification(change.doc.id, notif);
                }
            });
        });
}

// Show challenge notification
function showChallengeNotification(notifId, notif) {
    const accept = confirm(`${notif.fromName} challenged you to ${notif.gameName}!\n\nAccept challenge?`);
    
    if (accept) {
        acceptChallenge(notifId, notif);
    } else {
        denyChallenge(notifId, notif);
    }
}

// Accept challenge
async function acceptChallenge(notifId, notif) {
    // Update notification
    await db.collection('notifications').doc(notifId).update({ read: true });
    
    // Update challenge
    await db.collection('challenges').doc(notif.challengeId).update({
        status: 'accepted'
    });
    
    showToast('Challenge accepted! Starting game...');
    
    // Start game
    setTimeout(() => {
        startMultiplayerGame(notif.game, notif.challengeId, notif.from, notif.fromName);
    }, 1000);
}

// Deny challenge
async function denyChallenge(notifId, notif) {
    await db.collection('notifications').doc(notifId).update({ read: true });
    await db.collection('challenges').doc(notif.challengeId).update({
        status: 'denied'
    });
    showToast('Challenge denied');
}

// Start multiplayer game
function startMultiplayerGame(game, challengeId, opponentId, opponentName) {
    currentMultiplayerGame = { game, challengeId, opponentId, opponentName };
    
    switch (game) {
        case 'tictactoe':
            startMultiplayerTicTacToe(opponentId, opponentName);
            break;
        case 'snake-ladder':
            startMultiplayerSnakeLadder(opponentId, opponentName);
            break;
        default:
            showToast(`${game} multiplayer coming soon!`, '');
    }
}

// Multiplayer Tic Tac Toe
let mptttBoard = ['', '', '', '', '', '', '', '', ''];
let mptttHost = '';
let mptttGuest = '';
let mptttCurrent = '';

function startMultiplayerTicTacToe(opponentId, opponentName) {
    mptttBoard = ['', '', '', '', '', '', '', '', ''];
    mptttHost = currentUser.uid;
    mptttGuest = opponentId;
    mptttCurrent = mptttHost;
    
    openModal('gamesModal');
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header">
            <button onclick="closeModal('gamesModal')">←</button>
            <h2>❌⭕ vs ${opponentName}</h2>
            <div></div>
        </div>
        <div id="mptttStatus" style="text-align:center;color:var(--gold);margin:10px 0">Your turn (X)</div>
        <div class="ttt-grid" id="mptttGrid">
            ${[0,1,2,3,4,5,6,7,8].map(i => `
                <div class="ttt-cell" onclick="mptttMove(${i})" id="mpttt${i}"></div>
            `).join('')}
        </div>
    `;
    
    // Listen for opponent moves
    db.collection('game_moves').doc(currentMultiplayerGame.challengeId)
        .onSnapshot(doc => {
            const data = doc.data();
            if (!data || data.lastMoveBy === currentUser.uid) return;
            
            mptttBoard = data.board || mptttBoard;
            mptttCurrent = currentUser.uid;
            
            // Update UI
            for (let i = 0; i < 9; i++) {
                const cell = document.getElementById(`mpttt${i}`);
                if (cell && mptttBoard[i]) {
                    cell.textContent = mptttBoard[i];
                    cell.style.color = mptttBoard[i] === 'X' ? 'var(--gold)' : '#FF4757';
                }
            }
            
            document.getElementById('mptttStatus').textContent = 'Your turn!';
            checkMPTTTResult();
        });
}

function mptttMove(index) {
    if (mptttCurrent !== currentUser.uid || mptttBoard[index] !== '') return;
    
    mptttBoard[index] = 'X';
    document.getElementById(`mpttt${index}`).textContent = 'X';
    document.getElementById(`mpttt${index}`).style.color = 'var(--gold)';
    mptttCurrent = mptttGuest;
    document.getElementById('mptttStatus').textContent = `${currentMultiplayerGame.opponentName}'s turn...`;
    
    // Save move
    db.collection('game_moves').doc(currentMultiplayerGame.challengeId).set({
        board: mptttBoard,
        lastMoveBy: currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    checkMPTTTResult();
}

function checkMPTTTResult() {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    
    for (const w of wins) {
        if (w.every(i => mptttBoard[i] === 'X')) {
            document.getElementById('mptttStatus').innerHTML = '<span style="color:var(--gold)">🎉 You Win!</span>';
            updateGameStats('win');
            return;
        }
        if (w.every(i => mptttBoard[i] === 'O')) {
            document.getElementById('mptttStatus').innerHTML = `<span style="color:#FF4757">😞 ${currentMultiplayerGame.opponentName} Wins!</span>`;
            updateGameStats('loss');
            return;
        }
    }
    
    if (mptttBoard.every(c => c !== '')) {
        document.getElementById('mptttStatus').textContent = '🤝 Draw!';
        updateGameStats('draw');
    }
}

// Multiplayer Snake & Ladders
function startMultiplayerSnakeLadder(opponentId, opponentName) {
    showToast('Multiplayer Saap Sidhi coming soon!', '');
    openGames();
}

console.log('✅ Multiplayer module loaded');
