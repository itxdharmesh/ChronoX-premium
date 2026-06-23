var csCanvas, csCtx;
var csBall;
var csObstacles = [];
var csScore = 0;
var csBest = parseInt(localStorage.getItem('colorSwitchBest') || '0');
var csRunning = false;
var csAnimation;

function startColorSwitch() {

    csScore = 0;
    csObstacles = [];
    csRunning = true;

    document.getElementById('contentArea').innerHTML = `
    <div style="text-align:center">

        <h2 style="color:#D4AF37">
            🌈 Color Switch Deluxe
        </h2>

        <div style="display:flex;justify-content:center;gap:20px;margin:10px 0;">
            <div>🏆 <span id="csScore">0</span></div>
            <div>⭐ <span>${csBest}</span></div>
        </div>

        <canvas
            id="colorCanvas"
            width="360"
            height="550"
            style="
                background:#0A0E27;
                border-radius:20px;
                border:2px solid rgba(212,175,55,.3);
            "
        ></canvas>

        <p style="opacity:.7">
            Tap to jump
        </p>

    </div>
    `;

    csCanvas =
        document.getElementById(
            'colorCanvas'
        );

    csCtx =
        csCanvas.getContext('2d');

    initColorSwitch();
}

function initColorSwitch() {

    csBall = {
        x:180,
        y:450,
        r:10,
        vy:0,
        color:getRandomColor()
    };

    csObstacles = [];

    for(let i=0;i<5;i++){

        csObstacles.push({
            x:180,
            y:350 - i*180,
            radius:60,
            angle:0
        });
    }

    csCanvas.onclick = jumpBall;

    csCanvas.ontouchstart =
    function(e){

        e.preventDefault();
        jumpBall();
    };

    gameLoopColorSwitch();
}

function jumpBall(){

    if(!csRunning)
        return;

    csBall.vy = -7;
}

function gameLoopColorSwitch(){

    if(!csRunning)
        return;

    csCtx.clearRect(
        0,
        0,
        360,
        550
    );

    drawBackground();

    csBall.vy += 0.35;
    csBall.y += csBall.vy;

    if(csBall.y < 250){

        let diff =
            250 - csBall.y;

        csBall.y = 250;

        csObstacles.forEach(o=>{

            o.y += diff;
        });

        csScore++;

        document.getElementById(
            'csScore'
        ).textContent =
        csScore;
    }

    drawBall();

    csObstacles.forEach(o=>{

        o.angle += 0.03;

        drawObstacle(o);

        if(
            Math.abs(
                csBall.y - o.y
            ) < 8
        ){

            let section =
                getObstacleColor(
                    o,
                    csBall.x,
                    csBall.y
                );

            if(
                section !==
                csBall.color
            ){

                finishColorSwitch();
            }
        }

        if(
            o.y >
            700
        ){

            o.y =
                -150;

            csBall.color =
                getRandomColor();
        }
    });

    if(
        csBall.y >
        600
    ){

        finishColorSwitch();
    }

    csAnimation =
        requestAnimationFrame(
            gameLoopColorSwitch
        );
}

function drawBall(){

    csCtx.beginPath();

    csCtx.arc(
        csBall.x,
        csBall.y,
        csBall.r,
        0,
        Math.PI*2
    );

    csCtx.fillStyle =
        csBall.color;

    csCtx.fill();
}

function drawObstacle(o){

    let colors = [
        '#FF4757',
        '#FFD700',
        '#00D4FF',
        '#2ED573'
    ];

    for(
        let i=0;
        i<4;
        i++
    ){

        csCtx.beginPath();

        csCtx.strokeStyle =
            colors[i];

        csCtx.lineWidth = 12;

        csCtx.arc(
            o.x,
            o.y,
            o.radius,
            o.angle +
            i*Math.PI/2,
            o.angle +
            (i+1)*
            Math.PI/2
        );

        csCtx.stroke();
    }
}

function getObstacleColor(){

    let colors = [
        '#FF4757',
        '#FFD700',
        '#00D4FF',
        '#2ED573'
    ];

    return colors[
        Math.floor(
            Math.random()*4
        )
    ];
}

function getRandomColor(){

    let colors = [
        '#FF4757',
        '#FFD700',
        '#00D4FF',
        '#2ED573'
    ];

    return colors[
        Math.floor(
            Math.random()*4
        )
    ];
}

function drawBackground(){

    csCtx.fillStyle =
        '#0A0E27';

    csCtx.fillRect(
        0,
        0,
        360,
        550
    );

    for(
        let i=0;
        i<30;
        i++
    ){

        csCtx.fillStyle =
            'rgba(255,255,255,.15)';

        csCtx.fillRect(
            Math.random()*360,
            Math.random()*550,
            2,
            2
        );
    }
}

function finishColorSwitch(){

    csRunning = false;

    cancelAnimationFrame(
        csAnimation
    );

    if(
        csScore >
        csBest
    ){

        csBest =
            csScore;

        localStorage.setItem(
            'colorSwitchBest',
            csBest
        );
    }

    let xp =
        Math.floor(
            csScore / 2
        );

    if(
        typeof addXP ===
        'function'
    ){

        addXP(xp);
    }

    setTimeout(()=>{

        alert(
            "🌈 Game Over\n\n" +
            "Score: " +
            csScore +
            "\nBest: " +
            csBest +
            "\nXP: +" +
            xp
        );

    },200);
}
