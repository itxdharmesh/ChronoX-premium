const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const grid = 20;
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 10 };
let dir = { x: 1, y: 0 };
let score = 0, gameOver = false;

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && dir.y === 0) dir = { x: 0, y: -1 };
    if (e.key === 'ArrowDown' && dir.y === 0) dir = { x: 0, y: 1 };
    if (e.key === 'ArrowLeft' && dir.x === 0) dir = { x: -1, y: 0 };
    if (e.key === 'ArrowRight' && dir.x === 0) dir = { x: 1, y: 0 };
});

function update() {
    if (gameOver) return;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snake.some(s => s.x === head.x && s.y === head.y)) { gameOver = true; return; }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) { score++; food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) }; }
    else snake.pop();
    document.getElementById('snakeScore').textContent = 'Score: ' + score;
}

function draw() {
    ctx.fillStyle = 'var(--bg-card)'; ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#6bcf7f'; snake.forEach(s => ctx.fillRect(s.x * grid, s.y * grid, grid - 1, grid - 1));
    ctx.fillStyle = '#ff6b6b'; ctx.fillRect(food.x * grid, food.y * grid, grid - 1, grid - 1);
    if (gameOver) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, 400, 400); ctx.fillStyle = 'white'; ctx.font = '20px Inter'; ctx.fillText('Game Over! Refresh to restart', 40, 200); }
}

setInterval(() => { update(); draw(); }, 100);
