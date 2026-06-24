// js/games/games-main.js - COMPLETE INTEGRATED VERSION

// Active Storage Cache for Telemetry
if (!localStorage.getItem('recentlyPlayedGames')) {
    localStorage.setItem('recentlyPlayedGames', JSON.stringify(['spaceshooter', 'neondrift']));
}

function openGames() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div id="gamesHubWrapper" style="padding: 20px; background: #03020a; min-height: 100vh; font-family: sans-serif; color: #ffffff;">
            <h1 style="color: #D4AF37; font-size: 24px; margin-bottom: 20px;">🎮 Games Hub</h1>
            
            <input id="gameSearchInput" oninput="filterHubGames()" type="text" placeholder="Search games..." style="width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; margin-bottom: 20px;">

            <div id="categorizedGamesSection">
                <div class="category-block" style="margin-bottom: 20px;">
                    <h2 style="font-size: 14px; color: #8B5CF6; margin-bottom: 10px; text-transform: uppercase;">⚡ Action Channels</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">
                        ${injectCard("🥷","Cyber Ninja","cyberninja","#8B5CF6")}
                        ${injectCard("🚀","Space Shooter","spaceshooter","#00D4FF")}
                        ${injectCard("🎯","Aim Trainer","aimtrainer","#FF4757")}
                        ${injectCard("🏎️","Neon Drift","neondrift","#FF9F43")}
                    </div>
                </div>

                <div class="category-block" style="margin-bottom: 20px;">
                    <h2 style="font-size: 14px; color: #00D4FF; margin-bottom: 10px; text-transform: uppercase;">🕹️ Arcade Ports</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">
                        ${injectCard("🧱","Brick Breaker","brickbreaker","#FF6B81")}
                        ${injectCard("🏓","Pong","pong","#00D4FF")}
                        ${injectCard("🐦","Flappy Bird","flappy","#FF6B81")}
                    </div>
                </div>

                <div class="category-block" style="margin-bottom: 20px;">
                    <h2 style="font-size: 14px; color: #2ED573; margin-bottom: 10px; text-transform: uppercase;">🧠 Cognitive Matrix</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">
                        ${injectCard("❌","Tic Tac Toe","tictactoe","#D4AF37")}
                        ${injectCard("🧠","Memory Match","memorymatch","#2ED573")}
                        ${injectCard("⚡","Reaction Master","reactionmaster","#FFD700")}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function injectCard(icon, title, id, color) {
    return `
        <div class="game-card" onclick="safeStart('${id}')" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; text-align: center; border: 1px solid ${color}; cursor: pointer;">
            <div style="font-size: 30px;">${icon}</div>
            <div style="font-size: 12px; margin-top: 8px; font-weight: bold;">${title}</div>
        </div>
    `;
}

function filterHubGames() {
    let query = document.getElementById('gameSearchInput').value.toLowerCase();
    let cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        let title = card.innerText.toLowerCase();
        card.parentElement.parentElement.style.display = title.includes(query) ? 'block' : 'none';
    });
}

function safeStart(name) {
    updateRecentQueue(name);
    var funcName = 'start' + name.charAt(0).toUpperCase() + name.slice(1);
    if (window[funcName]) window[funcName]();
    else if (typeof showToast === 'function') showToast('Loading game...', 'info');
}

function updateRecentQueue(id) {
    let queue = JSON.parse(localStorage.getItem('recentlyPlayedGames')) || [];
    queue = queue.filter(x => x !== id);
    queue.unshift(id);
    if (queue.length > 3) queue.pop();
    localStorage.setItem('recentlyPlayedGames', JSON.stringify(queue));
}

// XP Reward Engine (Fixed for Firebase)
function rewardChronoxXP(result, gameId) {
    let xp = (result === 'win') ? 25 : (result === 'draw' ? 10 : 0);
    
    if (xp > 0 && typeof firebase !== 'undefined') {
        const user = firebase.auth().currentUser;
        if (user) {
            firebase.firestore().collection('users').doc(user.uid).update({
                xp: firebase.firestore.FieldValue.increment(xp)
            }).then(() => {
                if (typeof showToast === 'function') showToast(`⚡ +${xp} XP Secured!`);
                // Update local memory if profile is open
                if (currentUserData) currentUserData.xp += xp;
            }).catch(err => console.error("XP Error:", err));
        }
    }
}
