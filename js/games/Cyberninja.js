// cyberninja.js
// ChronoX Cyber Ninja

var ninjaScore = 0;
var ninjaBest = parseInt(localStorage.getItem("cyberNinjaBest") || "0");
var ninjaRunning = false;
var ninjaCanvas, ninjaCtx, ninjaAnim;

function startCyberNinja() {

    ninjaScore = 0;
    ninjaRunning = true;

    document.getElementById("contentArea").innerHTML = `
    <div style="text-align:center">
        <h2 style="color:#D4AF37">🥷 Cyber Ninja</h2>

        <div style="display:flex;justify-content:center;gap:20px;margin:10px 0">
            <div>🏆 <span id="ninjaScore">0</span></div>
            <div>⭐ ${ninjaBest}</div>
        </div>

        <canvas
            id="ninjaCanvas"
            width="360"
            height="550"
            style="
                background:#0A0E27;
                border-radius:20px;
                border:2px solid rgba(212,175,55,.3);
            "
        ></canvas>

        <p style="opacity:.7">
            Tap / Space = Jump
        </p>
    </div>
    `;

    ninjaCanvas = document.getElementById("ninjaCanvas");
    ninjaCtx = ninjaCanvas.getContext("2d");

    initCyberNinja();
}

function initCyberNinja() {

    const player = {
        x:70,
        y:420,
        w:40,
        h:50,
        vy:0,
        jumps:0
    };

    let gravity = 0.6;
    let speed = 5;

    const obstacles = [];
    const coins = [];

    function spawnObstacle() {

        obstacles.push({
            x:380,
            y:450,
            w:35,
            h:60
        });
    }

    function spawnCoin() {

        coins.push({
            x:380,
            y:300 + Math.random()*100,
            r:10
        });
    }

    setInterval(() => {

        if(ninjaRunning)
            spawnObstacle();

    },1800);

    setInterval(() => {

        if(ninjaRunning)
            spawnCoin();

    },2200);

    function jump() {

        if(player.jumps < 2){

            player.vy = -11;
            player.jumps++;

        }
    }

    document.onkeydown = function(e){

        if(e.code === "Space")
            jump();
    };

    ninjaCanvas.onclick = jump;

    ninjaCanvas.ontouchstart = function(e){

        e.preventDefault();
        jump();

    };

    function loop() {

        if(!ninjaRunning)
            return;

        ninjaCtx.clearRect(
            0,
            0,
            360,
            550
        );

        drawBackground();

        player.vy += gravity;
        player.y += player.vy;

        if(player.y > 420){

            player.y = 420;
            player.vy = 0;
            player.jumps = 0;

        }

        drawPlayer(player);

        obstacles.forEach((o,index)=>{

            o.x -= speed;

            drawObstacle(o);

            if(
                player.x < o.x + o.w &&
                player.x + player.w > o.x &&
                player.y < o.y + o.h &&
                player.y + player.h > o.y
            ){

                finishCyberNinja();
            }

            if(o.x < -60){

                obstacles.splice(index,1);

                ninjaScore += 5;

                document.getElementById(
                    "ninjaScore"
                ).textContent =
                ninjaScore;

                if(ninjaScore % 100 === 0)
                    speed += 0.5;
            }
        });

        coins.forEach((c,index)=>{

            c.x -= speed;

            drawCoin(c);

            let dx =
                (player.x+20)-c.x;

            let dy =
                (player.y+25)-c.y;

            let dist =
                Math.sqrt(
                    dx*dx + dy*dy
                );

            if(dist < 25){

                coins.splice(index,1);

                ninjaScore += 10;

                document.getElementById(
                    "ninjaScore"
                ).textContent =
                ninjaScore;
            }

            if(c.x < -20)
                coins.splice(index,1);
        });

        ninjaAnim =
        requestAnimationFrame(loop);
    }

    loop();
}

function drawPlayer(p){

    ninjaCtx.fillStyle =
    "#00D4FF";

    ninjaCtx.fillRect(
        p.x,
        p.y,
        p.w,
        p.h
    );

    ninjaCtx.fillStyle =
    "#FFD700";

    ninjaCtx.fillRect(
        p.x+8,
        p.y+10,
        24,
        8
    );
}

function drawObstacle(o){

    ninjaCtx.fillStyle =
    "#FF4757";

    ninjaCtx.fillRect(
        o.x,
        o.y,
        o.w,
        o.h
    );
}

function drawCoin(c){

    ninjaCtx.beginPath();

    ninjaCtx.arc(
        c.x,
        c.y,
        c.r,
        0,
        Math.PI*2
    );

    ninjaCtx.fillStyle =
    "#FFD700";

    ninjaCtx.fill();
}

function drawBackground(){

    ninjaCtx.fillStyle =
    "#0A0E27";

    ninjaCtx.fillRect(
        0,
        0,
        360,
        550
    );

    for(let i=0;i<35;i++){

        ninjaCtx.fillStyle =
        "rgba(255,255,255,.2)";

        ninjaCtx.fillRect(
            Math.random()*360,
            Math.random()*550,
            2,
            2
        );
    }

    ninjaCtx.fillStyle =
    "rgba(0,212,255,.15)";

    for(let i=0;i<8;i++){

        ninjaCtx.fillRect(
            i*50,
            300,
            30,
            250
        );
    }
}

function finishCyberNinja(){

    ninjaRunning = false;

    cancelAnimationFrame(
        ninjaAnim
    );

    if(
        ninjaScore >
        ninjaBest
    ){

        ninjaBest =
        ninjaScore;

        localStorage.setItem(
            "cyberNinjaBest",
            ninjaBest
        );
    }

    let xp =
    Math.floor(
        ninjaScore / 4
    );

    if(
        typeof addXP ===
        "function"
    ){

        addXP(xp);
    }

    setTimeout(()=>{

        alert(
            "🥷 Cyber Ninja\n\n" +
            "Score: " +
            ninjaScore +
            "\nBest: " +
            ninjaBest +
            "\nXP: +" +
            xp
        );

    },200);
              }
