const canvas = document.getElementById('flappyCanvas');
const ctx = canvas.getContext('2d');
let bird = { x: 50, y: 250, vy: 0, size: 20 };
let pipes = [];
let score = 0, gameOver = false, frame = 0;

function jump() { if (!gameOver) bird.vy = -6; else resetGame(); }
document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); jump(); } });
canvas.addEventListener('click', jump);

function resetGame() { bird.y = 250; bird.vy = 0; pipes = []; score = 0; gameOver = false; }

function update() {
    if (gameOver) return;
    frame++; bird.vy += 0.3; bird.y += bird.vy;
    if (frame % 80 === 0) pipes.push({ x: canvas.width, h: 100 + Math.random() * 200 });
    pipes.forEach(p => p.x -= 3);
    pipes = pipes.filter(p => p.x > -50);
    pipes.forEach(p => {
        if (bird.x + bird.size > p.x && bird.x - bird.size < p.x + 40 && (bird.y - bird.size < p.h || bird.y + bird.size > p.h + 120)) gameOver = true;
        if (p.x + 20 < bird.x && !p.scored) { score++; p.scored = true; }
    });
    if (bird.y > canvas.height || bird.y < 0) gameOver = true;
    document.getElementById('flappyScore').textContent = 'Score: ' + score;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffd93d'; ctx.beginPath(); ctx.arc(bird.x, bird.y, bird.size, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6bcf7f';
    pipes.forEach(p => { ctx.fillRect(p.x, 0, 40, p.h); ctx.fillRect(p.x, p.h + 120, 40, canvas.height - p.h - 120); });
    if (gameOver) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = 'white'; ctx.font = '24px Inter'; ctx.fillText('Game Over - Click to restart', 30, 250); }
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
gameLoop();
