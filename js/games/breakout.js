var breakoutData;

function startBreakout() {
    openGameScreen('🧱 Breakout');
    gameCanvas.style.display = 'block';
    breakoutData = {paddle:{x:gameCanvas.width/2-60,y:gameCanvas.height-40,w:120,h:14},ball:{x:gameCanvas.width/2,y:gameCanvas.height-60,dx:5,dy:-5,r:8},bricks:[],score:0,lives:3,level:1,particles:[]};
    spawnBricks();
    currentGameRestart = startBreakout;
    gameAnimation = requestAnimationFrame(breakoutLoop);
}

function spawnBricks() {
    breakoutData.bricks = [];
    var colors = ['#FF4757','#FF6B81','#FFA502','#2ED573','#1E90FF','#7C3AED','#FFD700'];
    for (var r=0;r<5+breakoutData.level;r++) for (var c=0;c<8;c++) breakoutData.bricks.push({x:c*55+20,y:r*28+40,w:48,h:22,alive:true,color:colors[r%colors.length],hp:r<3?1:2});
}

function breakoutLoop() {
    if (!gameActive) return;
    var c=gameCanvas,ctx=gameCtx,p=breakoutData.paddle,b=breakoutData.ball;
    var bg=ctx.createLinearGradient(0,0,0,c.height); bg.addColorStop(0,'#1a1a3e');bg.addColorStop(1,'#0A0E27');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);
    
    b.x+=b.dx;b.y+=b.dy;
    if(b.x-b.r<=0||b.x+b.r>=c.width)b.dx*=-1; if(b.y-b.r<=0)b.dy*=-1;
    if(b.y+b.r>=c.height){breakoutData.lives--;if(breakoutData.lives<=0){endGame('🧱 Score: '+breakoutData.score);return;}b.x=c.width/2;b.y=c.height-60;b.dx=5;b.dy=-5;}
    if(b.y+b.r>=p.y&&b.x>p.x&&b.x<p.x+p.w){var hit=(b.x-p.x)/p.w;b.dy=-Math.abs(b.dy);b.dx=Math.sin((hit-0.5)*1.2)*6;for(var i=0;i<5;i++)spawnBParticles(b.x,b.y,'#D4AF37');}
    
    breakoutData.bricks.forEach(function(br){if(!br.alive)return;if(b.x+b.r>br.x&&b.x-b.r<br.x+br.w&&b.y+b.r>br.y&&b.y-b.r<br.y+br.h){b.dy*=-1;br.hp--;if(br.hp<=0){br.alive=false;breakoutData.score+=10;updateGameScore(breakoutData.score);for(var i=0;i<6;i++)spawnBParticles(br.x+br.w/2,br.y+br.h/2,br.color);}}});
    
    // Draw bricks
    breakoutData.bricks.forEach(function(br){if(!br.alive)return;var g=ctx.createLinearGradient(br.x,br.y,br.x,br.y+br.h);g.addColorStop(0,br.color);g.addColorStop(1,'rgba(0,0,0,0.3)');ctx.fillStyle=g;ctx.shadowColor=br.color;ctx.shadowBlur=5;ctx.fillRect(br.x,br.y,br.w,br.h);ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(br.x,br.y,br.w,4);if(br.hp===2){ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(br.x+2,br.y+2,br.w-4,br.h-4);}});
    
    // Paddle
    var pg=ctx.createLinearGradient(p.x,p.y,p.x,p.y+p.h);pg.addColorStop(0,'#D4AF37');pg.addColorStop(1,'#8B6914');ctx.fillStyle=pg;ctx.shadowColor='#D4AF37';ctx.shadowBlur=12;ctx.beginPath();ctx.roundRect(p.x,p.y,p.w,p.h,7);ctx.fill();ctx.shadowBlur=0;
    
    // Ball
    var bg2=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*3);bg2.addColorStop(0,'rgba(255,255,255,0.8)');bg2.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=bg2;ctx.beginPath();ctx.arc(b.x,b.y,b.r*3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
    
    // Particles
    breakoutData.particles=breakoutData.particles.filter(function(pt){pt.x+=pt.vx;pt.y+=pt.vy;pt.life--;ctx.globalAlpha=pt.life/10;ctx.fillStyle=pt.color;ctx.beginPath();ctx.arc(pt.x,pt.y,pt.size*(pt.life/10),0,Math.PI*2);ctx.fill();return pt.life>0;});ctx.globalAlpha=1;
    
    if(breakoutData.bricks.every(function(br){return!br.alive;})){breakoutData.level++;breakoutData.score+=50;b.x=c.width/2;b.y=c.height-60;b.dx=5;b.dy=-5;spawnBricks();}
    ctx.fillStyle='#fff';ctx.font='14px Poppins';ctx.textAlign='left';ctx.fillText('❤️ x'+breakoutData.lives+' | Level '+breakoutData.level,10,22);
    gameAnimation=requestAnimationFrame(breakoutLoop);
}

function spawnBParticles(x,y,color){for(var i=0;i<5;i++)breakoutData.particles.push({x:x,y:y,vx:(Math.random()-0.5)*4,vy:(Math.random()-0.5)*4,life:10,size:Math.random()*3+2,color:color});}
document.addEventListener('mousemove',function(e){if(breakoutData&&breakoutData.paddle&&gameCanvas){var r=gameCanvas.getBoundingClientRect();breakoutData.paddle.x=e.clientX-r.left-breakoutData.paddle.w/2;}});
document.addEventListener('touchmove',function(e){if(breakoutData&&breakoutData.paddle&&gameCanvas){var r=gameCanvas.getBoundingClientRect();breakoutData.paddle.x=e.touches[0].clientX-r.left-breakoutData.paddle.w/2;e.preventDefault();}},{passive:false});
