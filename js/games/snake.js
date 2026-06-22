var snake, snakeDir, snakeFood, snakeInterval, snakeParticles = [];

function startSnake() {
    openGameScreen('🐍 Snake');
    gameCanvas.style.display = 'block';
    snake = [{x:10,y:10}]; snakeDir = {x:1,y:0};
    snakeFood = {x:15,y:10}; snakeParticles = [];
    if (snakeInterval) clearInterval(snakeInterval);
    snakeInterval = setInterval(snakeLoop, 90);
    currentGameRestart = startSnake;
}

function snakeLoop() {
    if (!gameActive) { clearInterval(snakeInterval); return; }
    var head = {x:snake[0].x+snakeDir.x, y:snake[0].y+snakeDir.y};
    var cols = Math.floor(gameCanvas.width/18), rows = Math.floor(gameCanvas.height/18);
    if (head.x<0||head.x>=cols||head.y<0||head.y>=rows) { endGame('🐍 Hit wall! Score: '+gameScore); return; }
    if (snake.some(function(s){return s.x===head.x&&s.y===head.y;})) { endGame('🐍 Hit yourself! Score: '+gameScore); return; }
    
    snake.unshift(head);
    if (head.x===snakeFood.x && head.y===snakeFood.y) {
        updateGameScore(5);
        snakeFood = {x:Math.floor(Math.random()*cols), y:Math.floor(Math.random()*rows)};
        for (var i=0;i<8;i++) snakeParticles.push({x:snakeFood.x*18+9,y:snakeFood.y*18+9,vx:(Math.random()-0.5)*4,vy:(Math.random()-0.5)*4,life:15});
    } else { snake.pop(); }
    
    var w=gameCanvas.width/cols, h=gameCanvas.height/rows;
    var ctx = gameCtx;
    
    // Background grid
    ctx.fillStyle='#0A0E27'; ctx.fillRect(0,0,gameCanvas.width,gameCanvas.height);
    ctx.strokeStyle='rgba(255,255,255,0.02)';
    for (var x=0;x<gameCanvas.width;x+=w) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,gameCanvas.height); ctx.stroke(); }
    for (var y=0;y<gameCanvas.height;y+=h) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(gameCanvas.width,y); ctx.stroke(); }
    
    // Snake body with gradient
    snake.forEach(function(s,i) {
        var ratio = 1 - (i/snake.length)*0.6;
        var grad = ctx.createLinearGradient(s.x*w, s.y*h, s.x*w+w, s.y*h+h);
        grad.addColorStop(0, '#D4AF37'); grad.addColorStop(1, '#F5E6A3');
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(212,175,55,0.5)'; ctx.shadowBlur = 6*ratio;
        ctx.beginPath(); ctx.roundRect(s.x*w+1, s.y*h+1, w-2, h-2, 4); ctx.fill();
        ctx.shadowBlur = 0;
        
        // Eyes on head
        if (i===0) {
            ctx.fillStyle='#fff';
            var es = w*0.18;
            ctx.beginPath(); ctx.arc(s.x*w+w*0.65,s.y*h+h*0.3,es,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(s.x*w+w*0.65,s.y*h+h*0.7,es,0,Math.PI*2); ctx.fill();
            ctx.fillStyle='#000';
            ctx.beginPath(); ctx.arc(s.x*w+w*0.7,s.y*h+h*0.3,es*0.5,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(s.x*w+w*0.7,s.y*h+h*0.7,es*0.5,0,Math.PI*2); ctx.fill();
        }
    });
    
    // Food with glow
    var fx = snakeFood.x*w+w/2, fy = snakeFood.y*h+h/2;
    var glow = ctx.createRadialGradient(fx,fy,0,fx,fy,w);
    glow.addColorStop(0,'rgba(255,71,87,0.6)'); glow.addColorStop(1,'rgba(255,71,87,0)');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(fx,fy,w,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#FF4757'; ctx.beginPath(); ctx.arc(fx,fy,w*0.4,0,Math.PI*2); ctx.fill();
    
    // Particles
    snakeParticles = snakeParticles.filter(function(p) {
        p.x+=p.vx; p.y+=p.vy; p.life--;
        ctx.globalAlpha=p.life/15; ctx.fillStyle='#D4AF37';
        ctx.beginPath(); ctx.arc(p.x,p.y,2,0,Math.PI*2); ctx.fill();
        return p.life>0;
    });
    ctx.globalAlpha=1;
}

// Swipe support
var touchStartX=0, touchStartY=0;
document.addEventListener('touchstart',function(e){if(snakeDir){touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY;}});
document.addEventListener('touchend',function(e){
    if(!snakeDir)return;
    var dx=e.changedTouches[0].clientX-touchStartX, dy=e.changedTouches[0].clientY-touchStartY;
    if(Math.abs(dx)>Math.abs(dy)){if(dx>0&&snakeDir.y!==0)snakeDir={x:1,y:0};else if(dx<0&&snakeDir.y!==0)snakeDir={x:-1,y:0};}
    else{if(dy>0&&snakeDir.x!==0)snakeDir={x:0,y:1};else if(dy<0&&snakeDir.x!==0)snakeDir={x:0,y:-1};}
});
