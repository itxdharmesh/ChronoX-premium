// js/games/games-main.js

// Active Storage Cache for Telemetry Realtime Queue
if (!localStorage.getItem('recentlyPlayedGames')) {
    localStorage.setItem('recentlyPlayedGames', JSON.stringify(['spaceshooter', 'neondrift']));
}

function openChronoxGamesHub() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div id="gamesHubWrapper" style="padding: 20px; background: radial-gradient(circle at top, #0f0a2a 0%, #03020a 100%); min-height: calc(100vh - 70px); font-family: 'Poppins', sans-serif; color: #ffffff; user-select:none; -webkit-user-select:none; overflow-y:auto; padding-bottom:90px;">
            
            <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(124, 58, 237, 0.05) 100%); border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 24px; padding: 22px; margin-bottom: 25px; backdrop-filter: blur(15px);">
                <h1 style="margin: 4px 0 0; font-size: 28px; font-weight: 900; background: linear-gradient(90deg, #D4AF37, #f3e5ab); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🎮 GAMES HUB</h1>
            </div>

            <input id="gameSearchInput" oninput="filterHubGames()" type="text" placeholder="Search operational matrices..." style="width: 100%; padding: 15px 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; color: #ffffff; margin-bottom: 20px;">

            <div id="categorizedGamesSection">
                <div class="category-block" style="margin-bottom: 25px;">
                    <h2 style="font-size: 12px; color: #8B5CF6; margin-bottom: 12px; text-transform: uppercase;">⚡ ACTION CHANNELS</h2>
                    <div class="game-grid-cluster" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;">
                        ${injectCardEngine("🥷","Cyber Ninja","Endless Runner Matrix","+40 XP","#8B5CF6","cyberninja")}
                        ${injectCardEngine("🚀","Space Shooter","Quantum Space Destroyer","+50 XP","#00D4FF","spaceshooter")}
                        ${injectCardEngine("🎯","Aim Trainer Pro","Target Acquisition","+30 XP","#FF4757","aimtrainer")}
                        ${injectCardEngine("🏎️","Neon Drift","Hyper-Kinetic Racer","+50 XP","#FF9F43","neondrift")}
                    </div>
                </div>

                <div class="category-block" style="margin-bottom: 25px;">
                    <h2 style="font-size: 12px; color: #00D4FF; margin-bottom: 12px; text-transform: uppercase;">🕹️ ARCADE PORTS</h2>
                    <div class="game-grid-cluster" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;">
                        ${injectCardEngine("🧱","Brick Breaker","Reflective Vector Shield","+30 XP","#FF6B81","brickbreaker")}
                        ${injectCardEngine("🏓","Pong","High-Voltage Laser Pong","+35 XP","#00D4FF","pong")}
                        ${injectCardEngine("🐦","Flappy Bird","Plasma Thrust Grav","+20 XP","#FF6B81","flappy")}
                    </div>
                </div>

                <div class="category-block" style="margin-bottom: 25px;">
                    <h2 style="font-size: 12px; color: #2ED573; margin-bottom: 12px; text-transform: uppercase;">🧠 COGNITIVE MATRIX</h2>
                    <div class="game-grid-cluster" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px;">
                        ${injectCardEngine("❌","Tic Tac Toe","Neural Minimax AI","+25 XP","#D4AF37","tictactoe")}
                        ${injectCardEngine("🧠","Memory Match","Synapse Grid Recall","+20 XP","#2ED573","memorymatch")}
                        ${injectCardEngine("⚡","Reaction Master","Reflex Latency Trigger","+20 XP","#FFD700","reactionmaster")}
                    </div>
                </div>
            </div>
        </div>
    `;
}

const GAME_DATABASE_RECORDS = {
    cyberninja: { icon: "🥷", title: "Cyber Ninja", desc: "Endless Runner Matrix", xp: "+40 XP", color: "#8B5CF6" },
    spaceshooter: { icon: "🚀", title: "Space Shooter", desc: "Quantum Space Destroyer", xp: "+50 XP", color: "#00D4FF" },
    aimtrainer: { icon: "🎯", title: "Aim Trainer Pro", desc: "Target Acquisition", xp: "+30 XP", color: "#FF4757" },
    neondrift: { icon: "🏎️", title: "Neon Drift", desc: "Hyper-Kinetic Racer", xp: "+50 XP", color: "#FF9F43" },
    brickbreaker: { icon: "🧱", title: "Brick Breaker", desc: "Reflective Vector Shield", xp: "+30 XP", color: "#FF6B81" },
    pong: { icon: "🏓", title: "Pong", desc: "High-Voltage Laser Pong", xp: "+35 XP", color: "#00D4FF" },
    flappy: { icon: "🐦", title: "Flappy Bird", desc: "Plasma Thrust Grav", xp: "+20 XP", color: "#FF6B81" },
    tictactoe: { icon: "❌", title: "Tic Tac Toe", desc: "Neural Minimax AI", xp: "+25 XP", color: "#D4AF37" },
    memorymatch: { icon: "🧠", title: "Memory Match", desc: "Synapse Grid Recall", xp: "+20 XP", color: "#2ED573" },
    reactionmaster: { icon: "⚡", title: "Reaction Master", desc: "Reflex Latency Trigger", xp: "+20 XP", color: "#FFD700" }
};

function injectCardEngine(icon, title, desc, xp, color, id) {
    return `<div class="premium-game-card" onclick="safeStart('${id}')" style="cursor:pointer; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); padding:15px; border-radius:14px;">
                <div style="display:flex; align-items:center; gap:14px">
                    <div style="font-size:32px;">${icon}</div>
                    <div style="flex:1">
                        <h3 style="color:${color}; font-size:14px; margin:0;">${title}</h3>
                        <p style="color:rgba(255,255,255,0.4); font-size:10px;">${desc}</p>
                    </div>
                </div>
            </div>`;
}

function safeStart(name) {
    // Ye function tere individual game files se linked hona chahiye
    if(window['start' + name.charAt(0).toUpperCase() + name.slice(1)]) {
        window['start' + name.charAt(0).toUpperCase() + name.slice(1)]();
    }
}

// XP REWARD ENGINE
function rewardChronoxXP(result, gameId) {
    let xpEarned = (result === 'win') ? 25 : (result === 'draw' ? 10 : 0);
    
    if (xpEarned > 0 && typeof firebase !== 'undefined') {
        const user = firebase.auth().currentUser;
        if (user) {
            firebase.firestore().collection('users').doc(user.uid).update({
                xp: firebase.firestore.FieldValue.increment(xpEarned)
            }).then(() => {
                if (typeof showToast === 'function') showToast(`⚡ +${xpEarned} XP Secured!`);
            });
        }
    }
}
