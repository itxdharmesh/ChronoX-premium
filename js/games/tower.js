var towerData;

function startTowerDefense() {
    openGameScreen('🏰 Tower Defense');
    gameCanvas.style.display = 'block';
    towerData = {
        towers: [], enemies: [], bullets: [],
        gold: 200, lives: 20, score: 0, wave: 1, frame: 0,
        path: [{x:0,y:150},{x:150,y:150},{x:150,y:280},{x:300,y:280},{x:300,y:150},{x:450,y:150},{x:450,y:280},{x:600,y:280},{x:600,y:200},{x:750,y:200}]
    };
    currentGameRestart = startTowerDefense;
    gameAnimation = requestAnimationFrame(towerLoop);
    spawnWave();
}

function spawnWave() {
    for (var i=0;i<5+towerData.wave*3;i++) {
        setTimeout(function() {
            if (!gameActive) return;
            towerData.enemies.push({x:towerData.path[0].x,y:towerData.path[0].y,pathIndex:0,hp:3+towerData.wave,speed:1+towerData.wave*0.3,maxHp:3+towerData.wave,gold:10+towerData.wave*2,size:14});
        }, i*300);
    }
}

function towerLoop() {
    if (!gameActive) return;
    var c=gameCanvas,ctx=gameCtx,d=towerData;
    d.frame++;
    
    // Background
    var bg=ctx.createLinearGradient(0,0,0,c.height); bg.addColorStop(0,'#1a2a1a');bg.addColorStop(1,'#0A0E27');
    ctx.fillStyle=bg; ctx.fillRect(0,0,c.width,c.height);
    
    // Path
    ctx.strokeStyle='#5D3A1A';ctx.lineWidth=36;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(d.path[0].x,d.path[0].y);
    for(var i=1;i<d.path.length;i++)ctx.lineTo(d.path[i].x,d.path[i].y);
    ctx.stroke();
    ctx.strokeStyle='#8B5E3C';ctx.lineWidth=30;ctx.stroke();
    
    // Enemies
    d.enemies.forEach(function(e){
        if(e.pathIndex<d.path.length-1){
            var t=d.path[e.pathIndex+1],dx=t.x-e.x,dy=t.y-e.y,dist=Math.hypot(dx,dy);
            if(dist<e.speed){e.pathIndex++;e.x=t.x;e.y=t.y;}else{e.x+=(dx/dist)*e.speed;e.y+=(dy/dist)*e.speed;}
        }else{d.lives--;e.hp=0;if(d.lives<=0)endGame('🏰 Defeated! Wave: '+d.wave+' | Score: '+d.score);}
        if(e.hp>0){
            var eg=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,e.size);eg.addColorStop(0,'#FF4757');eg.addColorStop(1,'rgba(255,71,87,0)');
            ctx.fillStyle=eg;ctx.beginPath();ctx.arc(e.x,e.y,e.size*1.5,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#FF4757';ctx.beginPath();ctx.arc(e.x,e.y,e.size,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='#000';ctx.beginPath();ctx.arc(e.x-4,e.y-3,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(e.x+4,e.y-3,3,0,Math.PI*2);ctx.fill();
            ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(e.x-12,e.y-18,24,3);
            ctx.fillStyle='#2ED573';ctx.fillRect(e.x-12,e.y-18,24*(e.hp/e.maxHp),3);
        }
    });
    d.enemies=d.enemies.filter(function(e){return e.hp>0;});
    
    // Towers shoot
    d.towers.forEach(function(t){
        var target=null,minDist=130;
        d.enemies.forEach(function(e){var dist=Math.hypot(t.x-e.x,t.y-e.y);if(dist<minDist){minDist=dist;target=e;}});
        if(target&&d.frame%15===0)d.bullets.push({x:t.x,y:t.y,target:target,speed:7});
        
        var tg=ctx.createLinearGradient(t.x-16,t.y-16,t.x+16,t.y+16);tg.addColorStop(0,'#D4AF37');tg.addColorStop(1,'#8B6914');
        ctx.fillStyle=tg;ctx.shadowColor='#D4AF37';ctx.shadowBlur=8;
        ctx.fillRect(t.x-16,t.y-16,32,32);ctx.shadowBlur=0;
        ctx.fillStyle='#fff';ctx.font='20px Arial';ctx.textAlign='center';ctx.fillText('🏰',t.x,t.y+7);
    });
    
    // Bullets
    d.bullets.forEach(function(b){
        if(b.target.hp>0){var dx=b.target.x-b.x,dy=b.target.y-b.y,dist=Math.hypot(dx,dy);b.x+=(dx/dist)*b.speed;b.y+=(dy/dist)*b.speed;if(dist<12){b.target.hp--;b.hit=true;if(b.target.hp<=0){d.gold+=b.target.gold;d.score+=b.target.gold;updateGameScore(d.score);}}}
        ctx.fillStyle='#FFD700';ctx.shadowColor='#FFD700';ctx.shadowBlur=4;ctx.beginPath();ctx.arc(b.x,b.y,4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    });
    d.bullets=d.bullets.filter(function(b){return!b.hit;});
    
    if(d.enemies.length===0){d.wave++;d.gold+=50;spawnWave();}
    ctx.fillStyle='#fff';ctx.font='14px Poppins';ctx.textAlign='left';
    ctx.fillText('❤️ '+d.lives+' | 💰 '+d.gold+' | 🌊 Wave '+d.wave,10,22);
    ctx.fillText('Tap to place tower (100💰)',10,c.height-10);
    gameAnimation=requestAnimationFrame(towerLoop);
}

document.addEventListener('click',function(e){
    if(!towerData||!towerData.towers||!gameCanvas||!gameActive)return;
    if(towerData.gold<100){showToast('Need 100 gold!','error');return;}
    var r=gameCanvas.getBoundingClientRect();
    towerData.towers.push({x:e.clientX-r.left,y:e.clientY-r.top});
    towerData.gold-=100;
});
