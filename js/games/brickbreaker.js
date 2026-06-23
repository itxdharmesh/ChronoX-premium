var bbCanvas, bbCtx;
var bbScore = 0;
var bbBest = parseInt(localStorage.getItem('brickBest') || '0');
var bbRunning = false;
var bbAnimation;

var bbPaddle;
var bbBall;
var bbBricks = [];

function startBrickBreaker() {

    bbScore = 0;
    bbRunning = true;
    bbBricks = [];

    document.getElementById('contentArea').innerHTML = `
    <div style="text-align:center">

        <h2 style="color:#D4AF37">
            🧱 Brick Breaker Deluxe
        </h2>

        <div style="display:flex;justify-content:center;gap:20px;margin:10px 0;">
            <div>🏆 <span id="bbScore">0</span></div>
            <div>⭐ <span>${bbBest}</span></div>
        </div>

        <canvas
            id="bbCanvas"
            width="360"
            height="550"
            style="
                background:#0A0E27;
                border-radius:20px;
                border:2px solid rgba(212,175,55,.3);
            "
        ></canvas>

        <p style="opacity:.7">
            Move paddle and break all bricks
        </p>

    </div>
    `;

    bbCanvas = document.getElementById('bbCanvas');
    bbCtx = bbCanvas.getContext('2d');

    initBrickBreaker();
}

function initBrickBreaker() {

    bbPaddle = {
        x:130,
        y:510,
        w:100,
        h:14
    };

    bbBall = {
        x:180,
        y:300,
        r:8,
        dx:4,
        dy:-4
    };

    for(let r=0;r<5;r++){
        for(let c=0;c<7;c++){

            bbBricks.push({
                x:15 + c*48,
                y:40 + r*30,
                w:42,
                h:18,
                alive:true
            });

        }
    }

    bbCanvas.onmousemove = function(e){

        let rect =
            bbCanvas.getBoundingClientRect();

        bbPaddle.x =
            e.clientX -
            rect.left -
            bbPaddle.w/2;
    };

    bbCanvas.ontouchmove = function(e){

        let rect =
            bbCanvas.getBoundingClientRect();

        bbPaddle.x =
            e.touches[0].clientX -
            rect.left -
            bbPaddle.w/2;
    };

    gameLoopBrick();
}

function gameLoopBrick(){

    if(!bbRunning)
        return;

    bbCtx.clearRect(0,0,360,550);

    drawBricks();
    drawPaddle();
    drawBall();

    bbBall.x += bbBall.dx;
    bbBall.y += bbBall.dy;

    if(bbBall.x < 0 || bbBall.x > 360)
        bbBall.dx *= -1;

    if(bbBall.y < 0)
        bbBall.dy *= -1;

    if(bbBall.y > 550){

        finishBrickBreaker();
        return;
    }

    if(
        bbBall.x > bbPaddle.x &&
        bbBall.x < bbPaddle.x + bbPaddle.w &&
        bbBall.y + bbBall.r > bbPaddle.y
    ){

        bbBall.dy *= -1;
    }

    bbBricks.forEach(brick=>{

        if(!brick.alive)
            return;

        if(
            bbBall.x > brick.x &&
            bbBall.x < brick.x + brick.w &&
            bbBall.y > brick.y &&
            bbBall.y < brick.y + brick.h
        ){

            brick.alive = false;

            bbBall.dy *= -1;

            bbScore += 10;

            document.getElementById(
                'bbScore'
            ).textContent = bbScore;
        }
    });

    let left =
        bbBricks.filter(
            b=>b.alive
        ).length;

    if(left === 0){

        finishBrickBreaker();
        return;
    }

    bbAnimation =
        requestAnimationFrame(
            gameLoopBrick
        );
}

function drawPaddle(){

    bbCtx.fillStyle =
        '#D4AF37';

    bbCtx.fillRect(
        bbPaddle.x,
        bbPaddle.y,
        bbPaddle.w,
        bbPaddle.h
    );
}

function drawBall(){

    bbCtx.beginPath();

    bbCtx.arc(
        bbBall.x,
        bbBall.y,
        bbBall.r,
        0,
        Math.PI*2
    );

    bbCtx.fillStyle =
        '#00D4FF';

    bbCtx.fill();
}

function drawBricks(){

    bbBricks.forEach(brick=>{

        if(!brick.alive)
            return;

        bbCtx.fillStyle =
            '#FF4757';

        bbCtx.fillRect(
            brick.x,
            brick.y,
            brick.w,
            brick.h
        );
    });
}

function finishBrickBreaker(){

    bbRunning = false;

    cancelAnimationFrame(
        bbAnimation
    );

    if(
        bbScore >
        bbBest
    ){

        bbBest =
            bbScore;

        localStorage.setItem(
            'brickBest',
            bbBest
        );
    }

    let xp =
        Math.floor(
            bbScore / 3
        );

    if(
        typeof addXP ===
        'function'
    ){

        addXP(xp);
    }

    setTimeout(()=>{

        alert(
            "🧱 Game Finished\n\n" +
            "Score: " + bbScore +
            "\nBest: " + bbBest +
            "\nXP: +" + xp
        );

    },200);
      }
