var towerData = {};

function startTowerDefensePremium() {
    openFullPageGame('🏰 Tower Defense');
    gameCanvas.style.display = 'block';
    
    towerData = {
        canvas: gameCanvas, ctx: gameCtx,
        towers: [], enemies: [], bullets: [],
        gold: 200, lives: 20, score: 0, wave: 1,
        path: [{x:0,y:200},{x:200,y:200},{x:200,y:350},{x:400,y:350},{x:400,y:200},{x:600,y:200},{x:600,y:400},{x:800,y:400}],
        selectedTower: null, frame: 0
    };
    
    gameAnimation = requestAnimationFrame(towerLoop);
    currentGameRestart = startTowerDefensePremium;
    spawnTowerWave();
}

function spawnTowerWave() {
    for (var i=0;i<5+towerData.wave*2;i++) {
        setTimeout(function() {
            towerData.enemies.push({
                x:towerData.path[0].x, y:towerData.path[0].y,
                pathIndex:0, hp:3+towerData.wave,
                speed:1+towerData.wave*0.3,
                maxHp:3+towerData.wave,
                gold:10+towerData.wave*2
            });
        }, i*400);
    }
}

function towerLoop() {
    if (!gameActive) return;
    
    var c = towerData.canvas, ctx = towerData.ctx;
    towerData.frame++;
    
    // Background
    var bgGrad = ctx.createLinearGradient(0,0,0,c.height);
    bgGrad.addColorStop(0, '#1a2a1a');
    bgGrad.addColorStop(1, '#0A0E27');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0,0,c.width,c.height);
    
    // Draw path
    ctx.strokeStyle = '#5D3A1A';
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(towerData.path[0].x, towerData.path[0].y);
    for (var i=1;i<towerData.path.length;i++) ctx.lineTo(towerData.path[i].x, towerData.path[i].y);
    ctx.stroke();
    ctx.strokeStyle = '#8B5E3C';
    ctx.lineWidth = 34;
    ctx.stroke();
    
    // Move enemies
    towerData.enemies.forEach(function(e) {
        if (e.pathIndex < towerData.path.length-1) {
            var target = towerData.path[e.pathIndex+1];
            var dx = target.x - e.x, dy = target.y - e.y;
            var dist = Math.hypot(dx, dy);
            if (dist < e.speed) {
                e.pathIndex++;
                e.x = target.x;
                e.y = target.y;
            } else {
                e.x += (dx/dist)*e.speed;
                e.y += (dy/dist)*e.speed;
            }
        } else {
            towerData.lives--;
            e.hp = 0;
            if (towerData.lives <= 0) gameOver('🏰 Defeated! Wave: ' + towerData.wave + ' | Score: ' + towerData.score);
        }
        
        // Draw enemy
        if (e.hp > 0) {
            ctx.fillStyle = '#FF4757';
            ctx.shadowColor = '#FF4757';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(e.x, e.y, 12, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // HP bar
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(e.x-15, e.y-18, 30, 4);
            ctx.fillStyle = '#2ED573';
            ctx.fillRect(e.x-15, e.y-18, 30*(e.hp/e.maxHp), 4);
            
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('👾', e.x, e.y+4);
        }
    });
    
    towerData.enemies = towerData.enemies.filter(function(e) { return e.hp > 0; });
    
    // Towers shoot
    towerData.towers.forEach(function(t) {
        var target = null;
        var minDist = 150;
        towerData.enemies.forEach(function(e) {
            var dist = Math.hypot(t.x-e.x, t.y-e.y);
            if (dist < minDist) { minDist = dist; target = e; }
        });
        
        if (target && towerData.frame % 20 === 0) {
            towerData.bullets.push({x:t.x, y:t.y, target:target, speed:6});
        }
        
        // Draw tower
        var tGrad = ctx.createLinearGradient(t.x-15, t.y-15, t.x+15, t.y+15);
        tGrad.addColorStop(0, '#D4AF37');
        tGrad.addColorStop(1, '#8B6914');
        ctx.fillStyle = tGrad;
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 10;
        ctx.fillRect(t.x-15, t.y-15, 30, 30);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏰', t.x, t.y+6);
        
        // Range indicator
        if (towerData.selectedTower === t) {
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(t.x, t.y, 150, 0, Math.PI*2);
            ctx.stroke();
        }
    });
    
    // Move bullets
    towerData.bullets.forEach(function(b) {
        if (b.target.hp > 0) {
            var dx = b.target.x - b.x, dy = b.target.y - b.y;
            var dist = Math.hypot(dx, dy);
            b.x += (dx/dist)*b.speed;
            b.y += (dy/dist)*b.speed;
            
            if (dist < 10) {
                b.target.hp--;
                b.hit = true;
                if (b.target.hp <= 0) {
                    towerData.gold += b.target.gold;
                    towerData.score += b.target.gold;
                    updateScore(towerData.score);
                }
            }
        }
        
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI*2);
        ctx.fill();
    });
    towerData.bullets = towerData.bullets.filter(function(b) { return !b.hit; });
    
    // Wave complete
    if (towerData.enemies.length === 0) {
        towerData.wave++;
        towerData.gold += 50;
        spawnTowerWave();
    }
    
    // HUD
    ctx.fillStyle = '#fff';
    ctx.font = '14px Poppins';
    ctx.textAlign = 'left';
    ctx.fillText('❤️ ' + towerData.lives + ' | 💰 ' + towerData.gold + ' | 🌊 ' + towerData.wave, 10, 22);
    
    gameAnimation = requestAnimationFrame(towerLoop);
}

// Place tower on click
document.addEventListener('click', function(e) {
    if (!towerData.towers || !gameCanvas || !gameActive) return;
    if (towerData.gold < 100) { showToast('Need 100 gold!', 'error'); return; }
    var rect = gameCanvas.getBoundingClientRect();
    var x = e.clientX - rect.left, y = e.clientY - rect.top;
    towerData.t
