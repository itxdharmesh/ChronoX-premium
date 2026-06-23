var shooterActive = false;
var shooterScore = 0;
var shooterBest = parseInt(localStorage.getItem('spaceBest') || '0');
var shooterAnimation;

function startSpaceShooter() {

    shooterActive = true;
    shooterScore = 0;

    var c = document.getElementById('contentArea');

    c.innerHTML =
        '<div style="text-align:center">' +
        '<h2 style="color:#D4AF37">🚀 Space Shooter</h2>' +

        '<div style="display:flex;justify-content:center;gap:25px;margin:10px 0">' +
        '<div><span style="font-size:10px;color:rgba(255,255,255,.5)">SCORE</span><br><b id="ssScore">0</b></div>' +
        '<div><span style="font-size:10px;color:rgba(255,255,255,.5)">BEST</span><br><b id="ssBest">' + shooterBest + '</b></div>' +
        '</div>' +

        '<canvas id="spaceCanvas" width="360" height="500" style="background:#05070D;border-radius:20px;border:2px solid rgba(212,175,55,.3)"></canvas>' +

        '<div style="margin-top:10px">' +
        '<button class="btn-out" onclick="startSpaceShooter()">🔄 Restart</button>' +
        '</div>' +
        '</div>';

    setTimeout(initSpaceShooter, 200);
}

function initSpaceShooter() {

    var canvas = document.getElementById('spaceCanvas');
    var ctx = canvas.getContext('2d');

    var ship = {
        x: 160,
        y: 430,
        w: 40,
        h: 40
    };

    var bullets = [];
    var enemies = [];

    function spawnEnemy() {

        enemies.push({
            x: Math.random() * 320,
            y: -30,
            w: 30,
            h: 30,
            speed: 2 + Math.random() * 3
        });
    }

    setInterval(function () {
        if (shooterActive) spawnEnemy();
    }, 1200);

    document.onkeydown = function (e) {

        if (!shooterActive) return;

        if (e.key === 'ArrowLeft')
            ship.x -= 20;

        if (e.key === 'ArrowRight')
            ship.x += 20;

        if (e.key === ' ')
            bullets.push({
                x: ship.x + 18,
                y: ship.y
            });
    };

    function draw() {

        if (!shooterActive) return;

        ctx.fillStyle = '#05070D';
        ctx.fillRect(0,0,canvas.width,canvas.height);

        // Stars
        for(var i=0;i<40;i++){
            ctx.fillStyle='rgba(255,255,255,.3)';
            ctx.fillRect(
                Math.random()*360,
                Math.random()*500,
                2,2
            );
        }

        // Ship
        ctx.fillStyle='#00D4FF';
        ctx.fillRect(ship.x,ship.y,ship.w,ship.h);

        // Bullets
        bullets.forEach(function(b,index){

            b.y -= 8;

            ctx.fillStyle='#FFD700';
            ctx.fillRect(b.x,b.y,4,12);

            if(b.y < 0)
                bullets.splice(index,1);

        });

        // Enemies
        enemies.forEach(function(enemy,eIndex){

            enemy.y += enemy.speed;

            ctx.fillStyle='#FF4757';
            ctx.fillRect(
                enemy.x,
                enemy.y,
                enemy.w,
                enemy.h
            );

            bullets.forEach(function(b,bIndex){

                if(
                    b.x < enemy.x + enemy.w &&
                    b.x + 4 > enemy.x &&
                    b.y < enemy.y + enemy.h &&
                    b.y + 12 > enemy.y
                ){

                    bullets.splice(bIndex,1);
                    enemies.splice(eIndex,1);

                    shooterScore += 10;

                    document.getElementById('ssScore').textContent =
                        shooterScore;
                }
            });

            // Player hit
            if(
                ship.x < enemy.x + enemy.w &&
                ship.x + ship.w > enemy.x &&
                ship.y < enemy.y + enemy.h &&
                ship.y + ship.h > enemy.y
            ){

                gameOver(ctx,canvas);
            }

        });

        shooterAnimation =
            requestAnimationFrame(draw);
    }

    draw();

    function gameOver(ctx,canvas){

        shooterActive = false;

        if(shooterScore > shooterBest){

            shooterBest = shooterScore;

            localStorage.setItem(
                'spaceBest',
                shooterBest
            );
        }

        ctx.fillStyle='rgba(0,0,0,.7)';
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle='#FF4757';
        ctx.font='bold 28px Arial';
        ctx.textAlign='center';

        ctx.fillText(
            'GAME OVER',
            canvas.width/2,
            canvas.height/2
        );

        ctx.fillStyle='#fff';

        ctx.fillText(
            shooterScore,
            canvas.width/2,
            canvas.height/2 + 40
        );

        var xp = Math.floor(
            shooterScore / 5
        );

        if(typeof addXP==='function')
            addXP(xp);
    }
}
