// js/games/neondrift_v2.js

function startNeonDrift() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `<canvas id="ndCanvas" style="display:block; width:100%; height:100%; background:#050711; cursor:none; touch-action:none;"></canvas>`;
    
    const canvas = document.getElementById('ndCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 120;

    // Game Variables
    let gameState = 'PLAYING';
    let car = { x: canvas.width/2, y: canvas.height - 150, targetX: canvas.width/2, tilt: 0 };
    let obstacles = [];
    let particles = [];
    let frame = 0;
    let gameSpeed = 5;

    // Core Loop
    function loop() {
        if (gameState !== 'PLAYING') return;
        
        ctx.fillStyle = '#050711';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 1. Perspective Grid (The "Drift" Look)
        drawGrid();

        // 2. Obstacles with Motion Blur
        updateObstacles();

        // 3. Player Car (Advanced Tilt Animation)
        car.x += (car.targetX - car.x) * 0.15;
        car.tilt = (car.targetX - car.x) * 0.1;
        drawCar();

        frame++;
        gameSpeed += 0.001;
        requestAnimationFrame(loop);
    }

    function drawGrid() {
        ctx.strokeStyle = '#2d1b4e';
        ctx.lineWidth = 2;
        let vanishingPoint = canvas.width / 2;
        
        // Draw converging lines
        for(let i = -10; i <= 10; i++) {
            ctx.beginPath();
            ctx.moveTo(vanishingPoint, canvas.height/2);
            ctx.lineTo(vanishingPoint + i * 200 + (frame * 2 % 200), canvas.height);
            ctx.stroke();
        }
    }

    function drawCar() {
        ctx.save();
        ctx.translate(car.x, car.y);
        ctx.rotate(car.tilt * 0.01);
        
        // Neon Glow Body
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f5d4';
        ctx.fillStyle = '#00f5d4';
        ctx.fillRect(-20, -30, 40, 60); // Car body
        
        ctx.restore();
    }

    function updateObstacles() {
        if (frame % 30 === 0) {
            obstacles.push({ x: Math.random() * canvas.width, y: -50, w: 60, h: 20 });
        }
        
        obstacles.forEach((o, i) => {
            o.y += gameSpeed;
            ctx.fillStyle = '#ff006e';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff006e';
            ctx.fillRect(o.x, o.y, o.w, o.h);
            
            if(o.y > canvas.height) obstacles.splice(i, 1);
        });
    }

    // Controls
    canvas.addEventListener('mousemove', e => car.targetX = e.clientX);
    canvas.addEventListener('touchmove', e => car.targetX = e.touches[0].clientX);

    loop();
}
