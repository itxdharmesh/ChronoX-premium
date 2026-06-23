function openGames() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML =
        '<div style="text-align:center">' +

            '<h2 style="color:#D4AF37;margin-bottom:15px;font-size:24px">🎮 Games Hub</h2>' +

            // FEATURED
            '<div class="card" style="background:linear-gradient(135deg,#D4AF37,#7C3AED);border:none;margin-bottom:15px">' +
                '<h3 style="margin:0;color:white">🔥 Featured Today</h3>' +
                '<p style="margin:5px 0;color:rgba(255,255,255,.8)">Cyber Ninja • Space Shooter • Neon Drift</p>' +
            '</div>' +

            createGameCard("🥷","Cyber Ninja","Endless Runner","+40 XP","#8B5CF6","cyberninja") +

            createGameCard("🎯","Aim Trainer Pro","Accuracy Challenge","+30 XP","#00D4FF","aimtrainer") +

            createGameCard("🏹","Archery Master","Hit The Bullseye","+35 XP","#2ED573","archerymaster") +

            createGameCard("🧱","Brick Breaker","Break All Bricks","+30 XP","#FF6B81","brickbreaker") +

            createGameCard("🌈","Color Switch","Color Matching","+25 XP","#FFA502","colorswitch") +

            createGameCard("🚀","Space Shooter","Destroy Enemies","+50 XP","#00D4FF","spaceshooter") +

            createGameCard("🧠","Memory Match","Train Your Brain","+20 XP","#2ED573","memorymatch") +

            createGameCard("⚡","Reaction Master","Fastest Reflex","+20 XP","#FFD700","reactionmaster") +

            createGameCard("🏎️","Neon Drift","Premium Racing","+50 XP","#FF4757","neondrift") +

            createGameCard("❌","Tic Tac Toe","3 Difficulties","+25 XP","#D4AF37","tictactoe") +

            createGameCard("🐍","Snake","Classic Arcade","+20 XP","#2ED573","snake") +

            createGameCard("🏓","Pong","First To 7","+35 XP","#00D4FF","pong") +

            createGameCard("🐦","Flappy Bird","Tap To Fly","+20 XP","#FF6B81","flappy") +

        '</div>';
}

function createGameCard(icon,title,desc,xp,color,id){

    return '<div class="card" onclick="safeStart(\''+id+'\')" style="cursor:pointer;background:linear-gradient(135deg,'+color+'20,rgba(0,212,255,0.05));border:1px solid '+color+'40">' +
        '<div style="display:flex;align-items:center;gap:15px">' +
            '<div style="font-size:40px">'+icon+'</div>' +
            '<div style="text-align:left;flex:1">' +
                '<h3 style="color:'+color+';font-size:15px;margin:0">'+title+'</h3>' +
                '<p style="color:rgba(255,255,255,0.5);font-size:10px;margin:2px 0">'+desc+'</p>' +
            '</div>' +
            '<span style="color:#FFD700;font-size:10px">'+xp+'</span>' +
        '</div>' +
    '</div>';
}

function safeStart(name){

    try{

        if(name==='tictactoe' && typeof startTTT==='function') startTTT();
        else if(name==='snake' && typeof startSnake==='function') startSnake();
        else if(name==='pong' && typeof startPong==='function') startPong();
        else if(name==='flappy' && typeof startFlappy==='function') startFlappy();
        else if(name==='cyberninja' && typeof startCyberNinja==='function') startCyberNinja();
        else if(name==='aimtrainer' && typeof startAimTrainer==='function') startAimTrainer();
        else if(name==='archerymaster' && typeof startArcheryMaster==='function') startArcheryMaster();
        else if(name==='brickbreaker' && typeof startBrickBreaker==='function') startBrickBreaker();
        else if(name==='colorswitch' && typeof startColorSwitch==='function') startColorSwitch();
        else if(name==='spaceshooter' && typeof startSpaceShooter==='function') startSpaceShooter();
        else if(name==='memorymatch' && typeof startMemoryMatch==='function') startMemoryMatch();
        else if(name==='reactionmaster' && typeof startReactionMaster==='function') startReactionMaster();
        else if(name==='neondrift' && typeof startNeonDrift==='function') startNeonDrift();

    }catch(e){

        showToast('Game loading...');

    }
                }
