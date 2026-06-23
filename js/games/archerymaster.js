var archeryScore = 0;
var archeryShots = 10;
var archeryWind = 0;
var archeryTarget = null;
var archeryGameActive = false;
var archeryBest = parseInt(localStorage.getItem('archeryBest') || '0');

function startArcheryMaster() {

    archeryScore = 0;
    archeryShots = 10;
    archeryGameActive = true;

    document.getElementById('contentArea').innerHTML = `
    <div style="text-align:center">
        <h2 style="color:#D4AF37">🏹 Archery Master</h2>

        <div style="display:flex;justify-content:center;gap:20px;margin:10px 0;">
            <div>🎯 <span id="archeryScore">0</span></div>
            <div>🏹 <span id="archeryShots">10</span></div>
            <div>🌪️ <span id="archeryWind">0</span></div>
        </div>

        <canvas
            id="archeryCanvas"
            width="360"
            height="500"
            style="
                background:#0A0E27;
                border-radius:20px;
                border:2px solid rgba(212,175,55,.3);
            "
        ></canvas>

        <p style="opacity:.7">
            Tap the target to shoot
        </p>
    </div>
    `;

    initArchery();
}

function initArchery() {

    var canvas =
        document.getElementById(
            'archeryCanvas'
        );

    var ctx =
        canvas.getContext('2d');

    spawnArcheryTarget();

    canvas.onclick = function(e) {

        if(!archeryGameActive)
            return;

        var rect =
            canvas.getBoundingClientRect();

        var x =
            e.clientX - rect.left;

        var y =
            e.clientY - rect.top;

        shootArrow(x,y);
    };

    function gameLoop() {

        if(!archeryGameActive)
            return;

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        drawStars(ctx);

        archeryTarget.x +=
            archeryTarget.speed;

        if(
            archeryTarget.x > 310 ||
            archeryTarget.x < 50
        ){
            archeryTarget.speed *= -1;
        }

        drawTarget(
            ctx,
            archeryTarget.x,
            archeryTarget.y
        );

        requestAnimationFrame(
            gameLoop
        );
    }

    gameLoop();
}

function spawnArcheryTarget() {

    archeryWind =
        Math.floor(
            Math.random()*11
        ) - 5;

    document.getElementById(
        'archeryWind'
    ).textContent = archeryWind;

    archeryTarget = {
        x:180,
        y:140,
        speed:3
    };
}

function shootArrow(x,y) {

    archeryShots--;

    document.getElementById(
        'archeryShots'
    ).textContent = archeryShots;

    var tx =
        archeryTarget.x +
        archeryWind * 3;

    var ty =
        archeryTarget.y;

    var dist =
        Math.sqrt(
            Math.pow(x-tx,2) +
            Math.pow(y-ty,2)
        );

    var points = 0;

    if(dist < 15)
        points = 50;
    else if(dist < 30)
        points = 25;
    else if(dist < 50)
        points = 10;

    archeryScore += points;

    document.getElementById(
        'archeryScore'
    ).textContent = archeryScore;

    if(archeryShots <= 0)
        finishArcheryGame();
}

function finishArcheryGame() {

    archeryGameActive = false;

    var xp =
        Math.floor(
            archeryScore / 5
        );

    if(
        archeryScore >
        archeryBest
    ){
        archeryBest =
            archeryScore;

        localStorage.setItem(
            'archeryBest',
            archeryBest
        );
    }

    if(
        typeof addXP ===
        'function'
    ){
        addXP(xp);
    }

    setTimeout(function(){

        alert(
            "🏹 Game Complete!\n\n" +
            "Score: " +
            archeryScore +
            "\nBest: " +
            archeryBest +
            "\nXP: +" +
            xp
        );

    },200);
}

function drawTarget(
    ctx,
    x,
    y
){

    var colors = [
        '#FF4757',
        '#FFFFFF',
        '#00D4FF',
        '#FFFFFF',
        '#FFD700'
    ];

    for(
        var i=5;
        i>0;
        i--
    ){

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            i*12,
            0,
            Math.PI*2
        );

        ctx.fillStyle =
            colors[5-i];

        ctx.fill();
    }
}

function drawStars(ctx){

    for(
        var i=0;
        i<40;
        i++
    ){

        ctx.fillStyle =
            'rgba(255,255,255,.3)';

        ctx.fillRect(
            Math.random()*360,
            Math.random()*500,
            2,
            2
        );
    }
}
