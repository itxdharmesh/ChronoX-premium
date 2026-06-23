var pacmanData;

function startPacman() {
    openGameScreen('🟡 Pac-Man');
    gameCanvas.style.display = 'block';
    gameCanvas.width = Math.min(window.innerWidth, 500);
    gameCanvas.height = Math.min(window.innerHeight - 100, 500);
    
    pacmanData = {
        player: { x: 7, y: 7, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 }, mouth: 0, mouthOpen: true },
        ghosts: [
            { x: 3, y: 3, dir: { x: 1, y: 0 }, color: '#FF4757' },
            { x: 12, y: 3, dir: { x: -1, y: 0 }, color: '#FF6B81' },
            { x: 3, y: 12, dir: { x: 0, y: 1 }, color: '#7C3AED' }
        ],
        dots: [],
        score: 0,
        lives: 3,
        level: 1,
        cellSize: 30,
        frame: 0,
        highScore: parseInt(localStorage.getItem('pacmanHigh') || '0'),
        powerMode: false,
        powerTimer: 0,
        scaredGhosts: false
    };
    
    var size = pacmanData.cellSize;
    var cols = Math.floor(gameCanvas.width / size);
    var rows = Math.floor(gameCanvas.height / size);
    
    // Create dots
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            if (Math.random() < 0.85) {
                pacmanData.dots.push({ x: c, y: r, eaten: false, big: Math.random() < 0.03 });
            }
        }
    }
    
    // Place player and ghosts on empty spots
    pacmanData.player.x = Math.floor(cols / 2);
    pacmanData.player.y = Math.floor(rows / 2);
    
    pacmanData.ghosts.forEach(function(g, i) {
        g.x = 3 + i * 3;
        g.y = 3;
    });
    
    currentGameRestart = startPacman;
    gameAnimation = requestAnimationFrame(pacmanLoop);
}

function pacmanLoop() {
    if (!gameActive) return;
    
    var c = gameCanvas, ctx = gameCtx;
    var d = pacmanData, size = d.cellSize;
    var cols = Math.floor(c.width / size);
    var rows = Math.floor(c.height / size);
    d.frame++;
    
    // Background
    ctx.fillStyle = '#0A0E27';
    ctx.fillRect(0, 0, c.width, c.height);
    
    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (var x = 0; x < c.width; x += size) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke();
    }
    for (var y = 0; y < c.height; y += size) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke();
    }
    
    // Draw dots
    d.dots.forEach(function(dot) {
        if (dot.eaten) return;
        var dx = dot.x * size + size / 2;
        var dy = dot.y * size + size / 2;
        
        if (dot.big) {
            // Power pellet
            var pulse = Math.sin(d.frame * 0.1) * 0.3 + 0.7;
            var glow = ctx.createRadialGradient(dx, dy, 0, dx, dy, size * 0.5);
            glow.addColorStop(0, 'rgba(255,215,0,' + pulse + ')');
            glow.addColorStop(1, 'rgba(255,215,0,0)');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(dx, dy, size * 0.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#FFD700';
            ctx.beginPath(); ctx.arc(dx, dy, size * 0.2, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 3;
            ctx.beginPath(); ctx.arc(dx, dy, size * 0.08, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        }
    });
    
    // Move player
    if (d.player.nextDir.x !== 0 || d.player.nextDir.y !== 0) {
        var nx = d.player.x + d.player.nextDir.x;
        var ny = d.player.y + d.player.nextDir.y;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            d.player.dir = d.player.nextDir;
        }
    }
    
    if (d.frame % 4 === 0) {
        var px = d.player.x + d.player.dir.x;
        var py = d.player.y + d.player.dir.y;
        if (px >= 0 && px < cols && py >= 0 && py < rows) {
            d.player.x = px;
            d.player.y = py;
        }
    }
    
    // Animate mouth
    d.player.mouth += 0.2;
    
    // Eat dots
    d.dots.forEach(function(dot) {
        if (dot.eaten) return;
        if (d.player.x === dot.x && d.player.y === dot.y) {
            dot.eaten = true;
            d.score += dot.big ? 50 : 10;
            updateGameScore(d.score);
            
            if (dot.big) {
                d.powerMode = true;
                d.powerTimer = 60;
                d.scaredGhosts = true;
            }
        }
    });
    
    // Power timer
    if (d.powerMode) {
        d.powerTimer--;
        if (d.powerTimer <= 0) {
            d.powerMode = false;
            d.scaredGhosts = false;
        }
    }
    
    // Move ghosts
    if (d.frame % 6 === 0) {
        d.ghosts.forEach(function(g) {
            var gx = g.x + g.dir.x;
            var gy = g.y + g.dir.y;
            if (gx < 0 || gx >= cols) g.dir.x *= -1;
            if (gy < 0 || gy >= rows) g.dir.y *= -1;
            g.x += g.dir.x;
            g.y += g.dir.y;
            
            if (Math.random() < 0.05) {
                var dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
                g.dir = dirs[Math.floor(Math.random() * dirs.length)];
            }
            
            // Ghost collision
            if (g.x === d.player.x && g.y === d.player.y) {
                if (d.scaredGhosts) {
                    // Eat ghost
                    g.x = 3;
                    g.y = 3;
                    d.score += 200;
                    updateGameScore(d.score);
                } else {
                    // Lose life
                    d.lives--;
                    if (d.lives <= 0) {
                        if (d.score > d.highScore) {
                            d.highScore = d.score;
                            localStorage.setItem('pacmanHigh', d.highScore);
                        }
                        endGame('🟡 Score: ' + d.score + ' | Best: ' + d.highScore);
                        return;
                    }
                    // Reset positions
                    d.player.x = Math.floor(cols / 2);
                    d.player.y = Math.floor(rows / 2);
                    d.player.dir = { x: 0, y: 0 };
                    d.player.nextDir = { x: 0, y: 0 };
                }
            }
        });
    }
    
    // Draw player (Pac-Man)
    var px = d.player.x * size + size / 2;
    var py = d.player.y * size + size / 2;
    var mouthAngle = Math.abs(Math.sin(d.player.mouth)) * 0.3;
    var startAngle = mouthAngle;
    var endAngle = Math.PI * 2 - mouthAngle;
    
    // Rotate based on direction
    ctx.save();
    ctx.translate(px, py);
    if (d.player.dir.x === 1) ctx.rotate(0);
    else if (d.player.dir.x === -1) ctx.rotate(Math.PI);
    else if (d.player.dir.y === -1) ctx.rotate(-Math.PI / 2);
    else if (d.player.dir.y === 1) ctx.rotate(Math.PI / 2);
    
    var pacGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.45);
    pacGrad.addColorStop(0, '#FFD700');
    pacGrad.addColorStop(1, '#FFA500');
    ctx.fillStyle = pacGrad;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.42, startAngle, endAngle);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
    
    // Draw ghosts
    d.ghosts.forEach(function(g) {
        var gx = g.x * size + size / 2;
        var gy = g.y * size + size / 2;
        
        ctx.fillStyle = d.scaredGhosts ? '#2ED573' : g.color;
        ctx.shadowColor = d.scaredGhosts ? '#2ED573' : g.color;
        ctx.shadowBlur = 8;
        
        // Ghost body
        ctx.beginPath();
        ctx.arc(gx, gy - size * 0.15, size * 0.4, Math.PI, 0);
        ctx.lineTo(gx + size * 0.4, gy + size * 0.3);
        
        // Wavy bottom
        for (var i = 0; i < 3; i++) {
            var wx = gx + size * 0.4 - (i * size * 0.25);
            ctx.quadraticCurveTo(wx - size * 0.1, gy + size * 0.1, wx - size * 0.2, gy + size * 0.3);
        }
        
        ctx.lineTo(gx - size * 0.4, gy + size * 0.3);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(gx - size * 0.12, gy - size * 0.18, size * 0.12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(gx + size * 0.12, gy - size * 0.18, size * 0.12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(gx - size * 0.1, gy - size * 0.18, size * 0.05, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(gx + size * 0.14, gy - size * 0.18, size * 0.05, 0, Math.PI * 2); ctx.fill();
    });
    
    // Power mode indicator
    if (d.powerMode) {
        ctx.fillStyle = 'rgba(0,212,255,0.8)';
        ctx.font = 'bold 14px Poppins';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ POWER MODE ' + Math.ceil(d.powerTimer / 10) + 's', c.width / 2, c.height - 15);
    }
    
    // HUD
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText('❤️ x' + d.lives + ' | Lvl ' + d.level + ' | Best: ' + d.highScore, 10, 22);
    
    // Check win
    if (d.dots.every(function(dot) { return dot.eaten; })) {
        d.level++;
        d.score += 100;
        // Reset dots
        d.dots.forEach(function(dot) { dot.eaten = false; });
    }
    
    gameAnimation = requestAnimationFrame(pacmanLoop);
}

// Swipe controls
var pacTouchX = 0, pacTouchY = 0;
document.addEventListener('touchstart', function(e) {
    if (!pacmanData || !gameActive) return;
    pacTouchX = e.touches[0].clientX;
    pacTouchY = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
    if (!pacmanData || !gameActive) return;
    var dx = e.changedTouches[0].clientX - pacTouchX;
    var dy = e.changedTouches[0].clientY - pacTouchY;
    if (Math.abs(dx) > Math.abs(dy)) {
        pacmanData.player.nextDir = { x: dx > 0 ? 1 : -1, y: 0 };
    } else if (Math.abs(dy) > 20) {
        pacmanData.player.nextDir = { x: 0, y: dy > 0 ? 1 : -1 };
    }
});

// Keyboard
document.addEventListener('keydown', function(e) {
    if (!pacmanData || !gameActive) return;
    if (e.key === 'ArrowUp') pacmanData.player.nextDir = { x: 0, y: -1 };
    if (e.key === 'ArrowDown') pacmanData.player.nextDir = { x: 0, y: 1 };
    if (e.key === 'ArrowLeft') pacmanData.player.nextDir = { x: -1, y: 0 };
    if (e.key === 'ArrowRight') pacmanData.player.nextDir = { x: 1, y: 0 };
});

console.log('✅ Pac-Man loaded');
