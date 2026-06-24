// games-main.js

// Mock telemetry session data cache
if (!localStorage.getItem('recentlyPlayedGames')) {
    localStorage.setItem('recentlyPlayedGames', JSON.stringify(['spaceshooter', 'neondrift']));
}

function openGames() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    // Ultra Premium Glassmorphism UI Base Layer Injector
    c.innerHTML = `
        <div id="gamesHubWrapper" style="padding: 25px; background: radial-gradient(circle at top, #0f0a2a 0%, #03020a 100%); min-height: 100vh; font-family: 'Poppins', sans-serif; color: #ffffff; user-select:none;">
            
            <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 20px; padding: 25px; position: relative; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); margin-bottom: 30px; backdrop-filter: blur(10px);">
                <div style="position: absolute; top: -50px; right: -50px; width: 180px; height: 180px; background: rgba(212, 175, 55, 0.08); border-radius: 50%; filter: blur(40px); pointer-events: none;"></div>
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                    <div>
                        <span style="font-size: 10px; color: #D4AF37; letter-spacing: 3px; font-weight: 800; text-transform: uppercase;">QUANTUM CHRONOX NODE</span>
                        <h1 style="margin: 5px 0 0; font-size: 32px; font-weight: 900; background: linear-gradient(90deg, #D4AF37, #f3e5ab); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(212,175,55,0.2);">🎮 GAMES HUB OVERRIDE</h1>
                    </div>
                    <div style="background: rgba(4, 3, 15, 0.7); padding: 10px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: right;">
                        <span style="font-size: 9px; color: rgba(255,255,255,0.4); display:block; font-weight:700; letter-spacing: 1px;">SYSTEM INTEGRITY</span>
                        <span style="color: #2ed573; font-size: 14px; font-weight: 900; text-shadow: 0 0 10px #2ed573;">● ONLINE [MAX-SPEED]</span>
                    </div>
                </div>
            </div>

            <div style="position: relative; margin-bottom: 30px;">
                <span style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%); font-size: 18px; color: rgba(255,255,255,0.4);">🔍</span>
                <input id="gameSearchInput" oninput="filterHubGames()" type="text" placeholder="Search target simulation matrix..." style="width: 100%; padding: 16px 20px 16px 55px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; color: #ffffff; font-family: 'Poppins', sans-serif; font-size: 14px; outline: none; transition: 0.3s; box-shadow: inset 0 2px 10px rgba(0,0,0,0.4); font-weight: 500;">
            </div>

            <div style="margin-bottom: 35px;">
                <h2 style="font-size: 14px; font-weight: 800; letter-spacing: 2px; color: rgba(255,255,255,0.4); margin-bottom: 15px; text-transform: uppercase;">🔥 TARGET RECOM SYSTEMS</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1xl)); gap: 20px;">
                    <div onclick="safeStart('cyberninja')" style="cursor: pointer; background: linear-gradient(135deg, #7C3AED 0%, #2563EB 100%); border-radius: 20px; padding: 25px; position: relative; overflow: hidden; box-shadow: 0 15px 30px rgba(124,58,237,0.3); transition: 0.3s;" class="premium-hover-node">
                        <div style="position: absolute; right: -20px; bottom: -20px; font-size: 100px; opacity: 0.12; transform: rotate(-15deg);">🥷</div>
                        <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-size: 9px; font-weight: 800; letter-spacing: 1px;">CRITICAL TARGET</span>
                        <h3 style="margin: 10px 0 5px; font-size: 22px; font-weight: 900;">Cyber Ninja Premium</h3>
                        <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.85);">Evasion simulation matrix v4.0.0 ready.</p>
                    </div>
                </div>
            </div>

            <div id="recentlyPlayedSection" style="margin-bottom: 35px;">
                <h2 style="font-size: 14px; font-weight: 800; letter-spacing: 2px; color: rgba(255,255,255,0.4); margin-bottom: 15px; text-transform: uppercase;">⏳ RECENT LOG ACTIONS</h2>
                <div id="recentGamesContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px;">
                    </div>
            </div>

            <div id="categorizedGamesSection">
                <div class="category-block" style="margin-bottom: 35px;">
                    <h2 style="font-size: 14px; font-weight: 800; letter-spacing: 2px; color: #8B5CF6; margin-bottom: 15px; text-transform: uppercase; border-left: 3px solid #8B5CF6; padding-left: 10px;">⚡ ACTION INTERFACES</h2>
                    <div class="game-grid-cluster" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px;">
                        ${injectCardEngine("🥷","Cyber Ninja","Endless Runner Run Matrix","+40 XP","#8B5CF6","cyberninja")}
                        ${injectCardEngine("🚀","Space Shooter","Quantum Space Destroyer","+50 XP","#00D4FF","spaceshooter")}
                        ${injectCardEngine("🎯","Aim Trainer Pro","Grid Target Acquisition","+30 XP","#FF4757","aimtrainer")}
                        ${injectCardEngine("🏎️","Neon Drift","Hyper-Kinetic Premium Racer","+50 XP","#FF9F43","neondrift")}
                    </div>
                </div>

                <div class="category-block" style="margin-bottom: 35px;">
                    <h2 style="font-size: 14px; font-weight: 800; letter-spacing: 2px; color: #00D4FF; margin-bottom: 15px; text-transform: uppercase; border-left: 3px solid #00D4FF; padding-left: 10px;">🕹️ ARCADE MODULES</h2>
                    <div class="game-grid-cluster" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px;">
                        ${injectCardEngine("🧱","Brick Breaker","Reflective Vector Shield","+30 XP","#FF6B81","brickbreaker")}
                        ${injectCardEngine("🏓","Pong","High-Voltage Laser Pong Matrix","+35 XP","#00D4FF","pong")}
                        ${injectCardEngine("🐦","Flappy Bird","Plasma Thrust Grav Infiltrator","+20 XP","#FF6B81","flappy")}
                        ${injectCardEngine("🐍","Snake","Tron Neon Light Trail Snake","+20 XP","#2ED573","snake")}
                    </div>
                </div>

                <div class="category-block" style="margin-bottom: 35px;">
                    <h2 style="font-size: 14px; font-weight: 800; letter-spacing: 2px; color: #2ED573; margin-bottom: 15px; text-transform: uppercase; border-left: 3px solid #2ED573; padding-left: 10px;">🧠 COGNITIVE PROTOCOLS</h2>
                    <div class="game-grid-cluster" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 15px;">
                        ${injectCardEngine("❌","Tic Tac Toe","Neural Minimax AI Overlord","+25 XP","#D4AF37","tictactoe")}
                        ${injectCardEngine("🌈","Color Switch","Spectrum Chromatic Match","+25 XP","#FFA502","colorswitch")}
                        ${injectCardEngine("🧠","Memory Match","Synapse Grid Recall","+20 XP","#2ED573","memorymatch")}
                        ${injectCardEngine("🏹","Archery Master","Kinetic Arrow Projectile","+35 XP","#10B981","archerymaster")}
                        ${injectCardEngine("⚡","Reaction Master","Reflex Latency Trigger","+20 XP","#FFD700","reactionmaster")}
                    </div>
                </div>
            </div>
        </div>

        <style>
            /* Custom Premium Texture Animations Sandbox CSS Elements */
            .premium-game-card {
                position: relative; overflow: hidden; z-index: 1; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
            .premium-game-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 12px 25px rgba(0,0,0,0.5), 0 0 15px var(--glow-color);
                border-color: var(--glow-border) !important;
                background: rgba(255,255,255,0.06) !important;
            }
            .premium-hover-node:hover {
                transform: scale(1.02);
                box-shadow: 0 20px 35px rgba(124,58,237,0.45);
            }
            #gameSearchInput:focus {
                border-color: #00D4FF !important;
                background: rgba(255,255,255,0.06) !important;
                box-shadow: 0 0 20px rgba(0,212,255,0.2), inset 0 2px 10px rgba(0,0,0,0.5) !important;
            }
        </style>
    `;

    // Initialize Recent Exec Logs rendering data allocation loops
    renderRecentGamesQueue();
}

// Master Static Dataset Framework Matrix Configuration
const GAME_DATABASE_RECORDS = {
    cyberninja: { icon: "🥷", title: "Cyber Ninja", desc: "Endless Runner Run Matrix", xp: "+40 XP", color: "#8B5CF6" },
    spaceshooter: { icon: "🚀", title: "Space Shooter", desc: "Quantum Space Destroyer", xp: "+50 XP", color: "#00D4FF" },
    aimtrainer: { icon: "🎯", title: "Aim Trainer Pro", desc: "Grid Target Acquisition", xp: "+30 XP", color: "#FF4757" },
    neondrift: { icon: "🏎️", title: "Neon Drift", desc: "Hyper-Kinetic Premium Racer", xp: "+50 XP", color: "#FF9F43" },
    brickbreaker: { icon: "🧱", title: "Brick Breaker", desc: "Reflective Vector Shield", xp: "+30 XP", color: "#FF6B81" },
    pong: { icon: "🏓", title: "Pong", desc: "High-Voltage Laser Pong Matrix", xp: "+35 XP", color: "#00D4FF" },
    flappy: { icon: "🐦", title: "Flappy Bird", desc: "Plasma Thrust Grav Infiltrator", xp: "+20 XP", color: "#FF6B81" },
    snake: { icon: "🐍", title: "Snake", desc: "Tron Neon Light Trail Snake", xp: "+20 XP", color: "#2ED573" },
    tictactoe: { icon: "❌", title: "Tic Tac Toe", desc: "Neural Minimax AI Overlord", xp: "+25 XP", color: "#D4AF37" },
    colorswitch: { icon: "🌈", title: "Color Switch", desc: "Spectrum Chromatic Match", xp: "+25 XP", color: "#FFA502" },
    memorymatch: { icon: "🧠", title: "Memory Match", desc: "Synapse Grid Recall", xp: "+20 XP", color: "#2ED573" },
    archerymaster: { icon: "🏹", title: "Archery Master", desc: "Kinetic Arrow Projectile", xp: "+35 XP", color: "#10B981" },
    reactionmaster: { icon: "⚡", title: "Reaction Master", desc: "Reflex Latency Trigger", xp: "+20 XP", color: "#FFD700" }
};

function injectCardEngine(icon, title, desc, xp, color, id) {
    return `
        <div class="premium-game-card" data-game-title="${title.toLowerCase()}" onclick="safeStart('${id}')" style="cursor:pointer; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 18px; border-radius: 16px; --glow-color: rgba(${hexToRgb(color)}, 0.15); --glow-border: ${color};">
            <div style="display:flex; align-items:center; gap:16px">
                <div style="font-size:36px; filter: drop-shadow(0 0 10px ${color}50);">${icon}</div>
                <div style="text-align:left; flex:1">
                    <h3 style="color:${color}; font-size:15px; margin:0; font-weight:800; letter-spacing:0.5px;">${title}</h3>
                    <p style="color:rgba(255,255,255,0.45); font-size:10px; margin:3px 0 0; font-weight:500; line-height:1.4;">${desc}</p>
                </div>
                <span style="color:#FFD700; font-size:10px; font-weight:700; background:rgba(255,215,0,0.08); padding:4px 8px; border-radius:8px; border:1px solid rgba(255,215,0,0.15); font-family: monospace;">${xp}</span>
            </div>
        </div>
    `;
}

function renderRecentGamesQueue() {
    const container = document.getElementById('recentGamesContainer');
    const recentSection = document.getElementById('recentlyPlayedSection');
    if (!container) return;

    let queue = JSON.parse(localStorage.getItem('recentlyPlayedGames')) || [];
    if (queue.length === 0) {
        recentSection.style.display = 'none';
        return;
    }

    recentSection.style.display = 'block';
    container.innerHTML = queue.map(id => {
        let metaData = GAME_DATABASE_RECORDS[id];
        if (!metaData) return '';
        return injectCardEngine(metaData.icon, metaData.title, metaData.desc, metaData.xp, metaData.color, id);
    }).join('');
}

function filterHubGames() {
    let query = document.getElementById('gameSearchInput').value.toLowerCase();
    let cards = document.querySelectorAll('.premium-game-card');

    cards.forEach(card => {
        let title = card.getAttribute('data-game-title');
        if (title.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    // Automatically hide empty visual node blocks dynamically during filters
    let blocks = document.querySelectorAll('.category-block');
    blocks.forEach(block => {
        let absoluteVisible = Array.from(block.querySelectorAll('.premium-game-card')).some(c => c.style.display !== 'none');
        block.style.display = absoluteVisible ? 'block' : 'none';
    });
}

function updateRecentlyPlayedCache(id) {
    if (!GAME_DATABASE_RECORDS[id]) return;
    let queue = JSON.parse(localStorage.getItem('recentlyPlayedGames')) || [];
    queue = queue.filter(x => x !== id);
    queue.unshift(id); // Shift priority matrix pointer up
    if (queue.length > 4) queue.pop(); // Cap history buffer nodes count
    localStorage.setItem('recentlyPlayedGames', JSON.stringify(queue));
}

// SECURE BOOT ENGINE WITH EXACT MATCH FOR SPECIFIC APP ROUTINGS
function safeStart(name) {
    try {
        // Track recently played game state allocation buffers
        updateRecentlyPlayedCache(name);

        // MAP EXACT ROUTING TO THE SPECIFIC FUNCTION NAMES BUILT
        if (name === 'tictactoe' && typeof startTicTacToe === 'function') startTicTacToe();
        else if (name === 'tictactoe' && typeof startTTT === 'function') startTTT();
        
        else if (name === 'snake' && typeof startSnakeGame === 'function') startSnakeGame();
        else if (name === 'snake' && typeof startSnake === 'function') startSnake();
        
        else if (name === 'pong' && typeof startPongGame === 'function') startPongGame();
        else if (name === 'pong' && typeof startPong === 'function') startPong();
        
        else if (name === 'flappy' && typeof startFlappyBird === 'function') startFlappyBird();
        else if (name === 'flappy' && typeof startFlappy === 'function') startFlappy();
        
        // General fallbacks for other core dashboard structures
        else if (name === 'cyberninja' && typeof startCyberNinja === 'function') startCyberNinja();
        else if (name === 'aimtrainer' && typeof startAimTrainer === 'function') startAimTrainer();
        else if (name === 'archerymaster' && typeof startArcheryMaster === 'function') startArcheryMaster();
        else if (name === 'brickbreaker' && typeof startBrickBreaker === 'function') startBrickBreaker();
        else if (name === 'colorswitch' && typeof startColorSwitch === 'function') startColorSwitch();
        else if (name === 'spaceshooter' && typeof startSpaceShooter === 'function') startSpaceShooter();
        else if (name === 'memorymatch' && typeof startMemoryMatch === 'function') startMemoryMatch();
        else if (name === 'reactionmaster' && typeof startReactionMaster === 'function') startReactionMaster();
        else if (name === 'neondrift' && typeof startNeonDrift === 'function') startNeonDrift();
        else {
            if (typeof showToast === 'function') showToast('Loading execution module...');
            else console.log("Initializing: " + name);
        }
    } catch (e) {
        console.error("Simulation initialization crash intercepted: ", e);
        if (typeof showToast === 'function') showToast('Simulation loading...');
    }
}

// Pure Utility Decoder mapping dynamic element shadows safely
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
    let num = parseInt(hex, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}
