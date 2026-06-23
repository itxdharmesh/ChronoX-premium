var tetrisData;

function startTetris() {
    openGameScreen('🧊 Tetris');
    gameCanvas.style.display = 'block';
    gameCanvas.width = Math.min(window.innerWidth, 350);
    gameCanvas.height = Math.min(window.innerHeight - 100, 500);
    
    tetrisData = {
        board: [],
        current: null,
        next: null,
        score: 0,
        level: 1,
        lines: 0,
        cellSize: Math.floor(gameCanvas.width / 10),
        cols: 10,
        rows: 20,
        dropInterval: 800,
        lastDrop: 0,
        frame: 0,
        highScore: parseInt(localStorage.getItem('tetrisHigh') || '0'),
        gameOver: false,
        particles: []
    };
    
    var d = tetrisData;
    d.cellSize = Math.floor(gameCanvas.width / d.cols);
    d.board = [];
    for (var r = 0; r < d.rows; r++) {
        d.board[r] = [];
        for (var c = 0; c < d.cols; c++) {
            d.board[r][c] = null;
        }
    }
    
    d.current = spawnTetrisPiece();
    d.next = spawnTetrisPiece();
    
    currentGameRestart = startTetris;
    gameAnimation = requestAnimationFrame(tetrisLoop);
}

var TETRIS_PIECES = [
    { shape: [[1,1,1,1]], color: '#00D4FF' },
    { shape: [[1,1],[1,1]], color: '#FFD700' },
    { shape: [[0,1,0],[1,1,1]], color: '#7C3AED' },
    { shape: [[1,0,0],[1,1,1]], color: '#2ED573' },
    { shape: [[0,0,1],[1,1,1]], color: '#FF4757' },
    { shape: [[0,1,1],[1,1,0]], color: '#FFA502' },
    { shape: [[1,1,0],[0,1,1]], color: '#1E90FF' }
];

function spawnTetrisPiece() {
    var p = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)];
    return {
        shape: p.shape,
        color: p.color,
        x: Math.floor((tetrisData.cols - p.shape[0].length) / 2),
        y: 0
    };
}

function tetrisLoop(timestamp) {
    if (!gameActive || tetrisData.gameOver) return;
    
    var d = tetrisData;
    d.frame++;
    
    // Auto drop
    if (d.frame - d.lastDrop > d.dropInterval / 16) {
        if (tetrisCanMove(d.current, 0, 1)) {
            d.current.y++;
        } else {
            tetrisLockPiece();
        }
        d.lastDrop = d.frame;
    }
    
    // Draw
    var ctx = gameCtx, c = gameCanvas, size = d.cellSize;
    
    // Background
    var bgGrad = ctx.createLinearGradient(0, 0, 0, c.height);
    bgGrad.addColorStop(0, '#1a1a3e');
    bgGrad.addColorStop(1, '#0A0E27');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, c.width, c.height);
    
    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (var x = 0; x <= d.cols; x++) {
        ctx.beginPath(); ctx.moveTo(x * size, 0); ctx.lineTo(x * size, d.rows * size); ctx.stroke();
    }
    for (var y = 0; y <= d.rows; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * size); ctx.lineTo(d.cols * size, y * size); ctx.stroke();
    }
    
    // Draw board
    for (var r = 0; r < d.rows; r++) {
        for (var c = 0; c < d.cols; c++) {
            if (d.board[r][c]) {
                var grad = ctx.createLinearGradient(c*size, r*size, c*size+size, r*size+size);
                grad.addColorStop(0, d.board[r][c]);
                grad.addColorStop(1, 'rgba(0,0,0,0.3)');
                ctx.fillStyle = grad;
                ctx.fillRect(c*size+1, r*size+1, size-2, size-2);
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillRect(c*size+1, r*size+1, size-2, 3);
            }
        }
    }
    
    // Draw current piece
    if (d.current) {
        drawTetrisPiece(d.current, ctx, size);
    }
    
    // Draw ghost piece (shadow)
    var ghost = { shape: d.current.shape, color: 'rgba(255,255,255,0.2)', x: d.current.x, y: d.current.y };
    while (tetrisCanMove(ghost, 0, 1)) ghost.y++;
    drawTetrisPiece(ghost, ctx, size);
    
    // Particles
    d.particles = d.particles.filter(function(pt) {
        pt.x += pt.vx; pt.y += pt.vy; pt.life--;
        ctx.globalAlpha = pt.life / 20;
        ctx.fillStyle = pt.color;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2); ctx.fill();
        return pt.life > 0;
    });
    ctx.globalAlpha = 1;
    
    // HUD
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + d.score + ' | Lvl ' + d.level + ' | Best: ' + d.highScore, 10, 22);
    ctx.fillText('Lines: ' + d.lines, 10, 44);
    
    gameAnimation = requestAnimationFrame(tetrisLoop);
}

function drawTetrisPiece(piece, ctx, size) {
    piece.shape.forEach(function(row, r) {
        row.forEach(function(cell, c) {
            if (cell) {
                var x = (piece.x + c) * size;
                var y = (piece.y + r) * size;
                var grad = ctx.createLinearGradient(x, y, x+size, y+size);
                grad.addColorStop(0, piece.color);
                grad.addColorStop(1, 'rgba(0,0,0,0.3)');
                ctx.fillStyle = grad;
                ctx.fillRect(x+1, y+1, size-2, size-2);
                ctx.fillStyle = 'rgba(255,255,255,0.25)';
                ctx.fillRect(x+1, y+1, size-2, 3);
            }
        });
    });
}

function tetrisCanMove(piece, dx, dy) {
    var d = tetrisData;
    for (var r = 0; r < piece.shape.length; r++) {
        for (var c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
                var nx = piece.x + c + dx;
                var ny = piece.y + r + dy;
                if (nx < 0 || nx >= d.cols || ny >= d.rows) return false;
                if (ny >= 0 && d.board[ny][nx]) return false;
            }
        }
    }
    return true;
}

function tetrisRotatePiece() {
    var d = tetrisData;
    if (!d.current) return;
    var shape = d.current.shape;
    var newShape = [];
    for (var c = 0; c < shape[0].length; c++) {
        newShape[c] = [];
        for (var r = shape.length - 1; r >= 0; r--) {
            newShape[c][shape.length - 1 - r] = shape[r][c];
        }
    }
    var test = { shape: newShape, x: d.current.x, y: d.current.y };
    if (tetrisCanMove(test, 0, 0)) {
        d.current.shape = newShape;
    }
}

function tetrisLockPiece() {
    var d = tetrisData;
    if (!d.current) return;
    
    d.current.shape.forEach(function(row, r) {
        row.forEach(function(cell, c) {
            if (cell) {
                var x = d.current.x + c;
                var y = d.current.y + r;
                if (y >= 0 && y < d.rows && x >= 0 && x < d.cols) {
                    d.board[y][x] = d.current.color;
                }
            }
        });
    });
    
    // Clear lines
    var cleared = 0;
    for (var r = d.rows - 1; r >= 0; r--) {
        if (d.board[r].every(function(cell) { return cell !== null; })) {
            d.board.splice(r, 1);
            d.board.unshift(new Array(d.cols).fill(null));
            cleared++;
            r++;
        }
    }
    
    if (cleared > 0) {
        d.lines += cleared;
        var points = [0, 100, 300, 500, 800];
        d.score += points[cleared] * d.level;
        updateGameScore(d.score);
        d.level = Math.floor(d.lines / 10) + 1;
        d.dropInterval = Math.max(100, 800 - (d.level - 1) * 70);
        
        // Particles
        for (var i = 0; i < cleared * 15; i++) {
            d.particles.push({
                x: Math.random() * gameCanvas.width,
                y: Math.random() * gameCanvas.height * 0.3,
                vx: (Math.random()-0.5)*3,
                vy: (Math.random()-0.5)*3-2,
                life: 20,
                size: Math.random()*4+2,
                color: ['#FFD700','#00D4FF','#FF4757','#2ED573'][Math.floor(Math.random()*4)]
            });
        }
    }
    
    d.current = d.next;
    d.next = spawnTetrisPiece();
    
    if (!tetrisCanMove(d.current, 0, 0)) {
        d.gameOver = true;
        if (d.score > d.highScore) {
            d.highScore = d.score;
            localStorage.setItem('tetrisHigh', d.highScore);
        }
        endGame('🧊 Score: ' + d.score + ' | Best: ' + d.highScore + ' | Lines: ' + d.lines);
    }
}

// Controls
document.addEventListener('keydown', function(e) {
    var d = tetrisData;
    if (!d || !d.current || !gameActive || d.gameOver) return;
    
    if (e.key === 'ArrowLeft' && tetrisCanMove(d.current, -1, 0)) { d.current.x--; e.preventDefault(); }
    if (e.key === 'ArrowRight' && tetrisCanMove(d.current, 1, 0)) { d.current.x++; e.preventDefault(); }
    if (e.key === 'ArrowDown' && tetrisCanMove(d.current, 0, 1)) { d.current.y++; d.lastDrop = d.frame; e.preventDefault(); }
    if (e.key === 'ArrowUp') { tetrisRotatePiece(); e.preventDefault(); }
    if (e.key === ' ') {
        while (tetrisCanMove(d.current, 0, 1)) d.current.y++;
        tetrisLockPiece();
        d.lastDrop = d.frame;
        e.preventDefault();
    }
});

// Touch controls
var tetrisTouchStart = null;
document.addEventListener('touchstart', function(e) {
    if (!tetrisData || !gameActive) return;
    tetrisTouchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
});

document.addEventListener('touchend', function(e) {
    if (!tetrisTouchStart || !tetrisData || !gameActive) return;
    var d = tetrisData;
    var dx = e.changedTouches[0].clientX - tetrisTouchStart.x;
    var dy = e.changedTouches[0].clientY - tetrisTouchStart.y;
    var dt = Date.now() - tetrisTouchStart.time;
    
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
        if (dx > 0 && tetrisCanMove(d.current, 1, 0)) d.current.x++;
        else if (dx < 0 && tetrisCanMove(d.current, -1, 0)) d.current.x--;
    } else if (dy > 80) {
        while (tetrisCanMove(d.current, 0, 1)) d.current.y++;
        tetrisLockPiece();
        d.lastDrop = d.frame;
    } else if (dt < 300 && Math.abs(dx) < 20 && Math.abs(dy) < 20) {
        tetrisRotatePiece();
    }
    
    tetrisTouchStart = null;
});

console.log('✅ Tetris loaded');
