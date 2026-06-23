// aimtrainer.js - ChronoX Premium Aim Trainer
// Drop into js/games/aimtrainer.js

var aimScore = 0,
    aimHits = 0,
    aimMisses = 0,
    aimCombo = 0,
    aimTime = 30,
    aimBest = 0,
    aimActive = false,
    aimAnimation = null,
    aimParticles = [],
    aimTargets = [];

function startAimTrainer() {

    aimScore = 0;
    aimHits = 0;
    aimMisses = 0;
    aimCombo = 0;
    aimTime = 30;
    aimParticles = [];
    aimTargets = [];
    aimActive = true;

    aimBest = parseInt(localStorage.getItem('aimTrainerBest') || '0');

    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML =
        '<div style="text-align:center">' +
            '<h2 style="color:#D4AF37;margin-bottom:2px;font-size:24px">🎯 Aim Trainer Pro</h2>' +

            '<div style="display:flex;justify-content:center;gap:18px;margin:8px 0;flex-wrap:wrap">' +

                '<div>' +
                    '<span style="font-size:10px;color:rgba(255,255,255,.5)">SCORE</span><br>' +
                    '<b id="aimScore" style="color:#D4AF37;font-size:20px">0</b>' +
                '</div>' +

                '<div>' +
                    '<span style="font-size:10px;color:rgba(255,255,255,.5)">BEST</span><br>' +
                    '<b id="aimBest" style="color:#2ED573;font-size:20px">' + aimBest + '</b>' +
                '</div>' +

                '<div>' +
                    '<span style="font-size:10px;color:rgba(255,255,255,.5)">COMBO</span><br>' +
                    '<b id="aimCombo" style="color:#00D4FF;font-size:20px">0x</b>' +
                '</div>' +

                '<div>' +
                    '<span style="font-size:10px;color:rgba(255,255,255,.5)">TIME</span><br>' +
                    '<b id="aimTime" style="color:#FF4757;font-size:20px">30</b>' +
                '</div>' +

            '</div>' +

            '<canvas id="aimCanvas" width="360" height="500" style="background:radial-gradient(ellipse at center,#1a1f4e 0%,#0A0E27 100%);border:2px solid rgba(212,175,55,.3);border-radius:20px;display:block;margin:10px auto;max-width:95%;box-shadow:0 0 40px rgba(0,0,0,.5)"></canvas>' +

            '<p style="font-size:10px;color:rgba(255,255,255,.4)">Tap targets as fast as possible</p>' +

            '<div style="display:flex;gap:8px;margin-top:8px">' +
                '<button class="btn-out" onclick="startAimTrainer()" style="flex:1">🔄 Restart</button>' +
                '<button class="btn-out" onclick="navigate(\'games\')" style="flex:1">← Games Hub</button>' +
            '</div>' +

        '</div>';

    setTimeout(initAimTrainer, 300);
}

function initAimTrainer() {

    var canvas = document.getElementById('aimCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');

    if (aimAnimation) cancelAnimationFrame(aimAnimation);

    spawnTarget();

    var timer = setInterval(function () {

        if (!aimActive) {
            clearInterval(timer);
            return;
        }

        aimTime--;

        var t = document.getElementById('aimTime');
        if (t) t.textContent = aimTime;

        if (aimTime <= 0) {
            clearInterval(timer);
            endAimTrainer(ctx, canvas);
        }

    }, 1000);

    function loop() {

        if (!aimActive) return;

        ctx.fillStyle = '#0A0E27';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawGrid(ctx, canvas);

        aimTargets.forEach(function (target) {

            target.pulse += 0.05;

            var glow = ctx.createRadialGradient(
                target.x,
                target.y,
                0,
                target.x,
                target.y,
                target.r * 2.5
            );

            glow.addColorStop(0, 'rgba(0,212,255,.5)');
            glow.addColorStop(1, 'rgba(0,212,255,0)');

            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(target.x, target.y, target.r * 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#00D4FF';
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#D4AF37';

            ctx.beginPath();
            ctx.arc(target.x, target.y, target.r * 0.65, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#FF4757';

            ctx.beginPath();
            ctx.arc(target.x, target.y, target.r * 0.25, 0, Math.PI * 2);
            ctx.fill();
        });

        aimParticles = aimParticles.filter(function (p) {

            p.x += p.vx;
            p.y += p.vy;
            p.life--;

            ctx.globalAlpha = p.life / 25;

            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;

            ctx.beginPath();
            ctx.arc(
                p.x,
                p.y,
                p.size * (p.life / 25),
                0,
                Math.PI * 2
            );
            ctx.fill();

            ctx.shadowBlur = 0;

            return p.life > 0;

        });

        ctx.globalAlpha = 1;

        aimAnimation = requestAnimationFrame(loop);
    }

    loop();

    canvas.onclick = function (e) {

        if (!aimActive) return;

        var rect = canvas.getBoundingClientRect();

        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;

        var hit = false;

        aimTargets.forEach(function (target, index) {

            var dx = mx - target.x;
            var dy = my - target.y;

            var dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= target.r) {

                hit = true;

                aimHits++;
                aimCombo++;

                aimScore += 10 + (aimCombo * 2);

                updateUI();

                spawnHitParticles(target.x, target.y);

                aimTargets.splice(index, 1);

                spawnTarget();
            }

        });

        if (!hit) {

            aimMisses++;
            aimCombo = 0;

            updateUI();
        }
    };

    canvas.ontouchstart = function (e) {

        if (!aimActive) return;

        e.preventDefault();

        var rect = canvas.getBoundingClientRect();

        var mx = e.touches[0].clientX - rect.left;
        var my = e.touches[0].clientY - rect.top;

        canvas.onclick({
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY
        });
    };
}

function spawnTarget() {

    aimTargets = [];

    aimTargets.push({
        x: 50 + Math.random() * 260,
        y: 50 + Math.random() * 380,
        r: 28,
        pulse: 0
    });
}

function spawnHitParticles(x, y) {

    for (var i = 0; i < 20; i++) {

        aimParticles.push({
            x: x,
            y: y,
            vx: (Math.random() - .5) * 8,
            vy: (Math.random() - .5) * 8,
            life: 25,
            size: Math.random() * 5 + 2,
            color: '#FFD700'
        });

    }
}

function updateUI() {

    var s = document.getElementById('aimScore');
    var c = document.getElementById('aimCombo');

    if (s) s.textContent = aimScore;
    if (c) c.textContent = aimCombo + 'x';
}

function drawGrid(ctx, canvas) {

    ctx.strokeStyle = 'rgba(255,255,255,.03)';

    for (var x = 0; x < canvas.width; x += 30) {

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (var y = 0; y < canvas.height; y += 30) {

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function endAimTrainer(ctx, canvas) {

    aimActive = false;

    if (aimAnimation) cancelAnimationFrame(aimAnimation);

    if (aimScore > aimBest) {

        aimBest = aimScore;
        localStorage.setItem('aimTrainerBest', aimBest);
    }

    var accuracy = 0;

    if ((aimHits + aimMisses) > 0) {

        accuracy = Math.round(
            (aimHits / (aimHits + aimMisses)) * 100
        );
    }

    ctx.fillStyle = 'rgba(0,0,0,.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 28px Poppins';
    ctx.textAlign = 'center';

    ctx.fillText(
        'Training Complete',
        canvas.width / 2,
        canvas.height / 2 - 80
    );

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Poppins';

    ctx.fillText(
        'Score: ' + aimScore,
        canvas.width / 2,
        canvas.height / 2 - 20
    );

    ctx.fillText(
        'Hits: ' + aimHits,
        canvas.width / 2,
        canvas.height / 2 + 10
    );

    ctx.fillText(
        'Accuracy: ' + accuracy + '%',
        canvas.width / 2,
        canvas.height / 2 + 40
    );

    var xp = Math.floor(aimScore / 4);

    ctx.fillStyle = '#FFD700';

    ctx.fillText(
        '+ ' + xp + ' XP',
        canvas.width / 2,
        canvas.height / 2 + 90
    );

    if (typeof addXP === 'function') {
        addXP(xp);
    }
}
