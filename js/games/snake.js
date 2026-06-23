var snake,snakeDir,snakeFood,snakeInterval,snakeParticles=[],snakeHighScore=0;
function startSnake(){
    openGameScreen('🐍 Snake');gameCanvas.style.display='block';
    gameCanvas.width=window.innerWidth;gameCanvas.height=window.innerHeight-100;
    var cols=Math.floor(gameCanvas.width/22);var rows=Math.floor(gameCanvas.height/22);
    snake=[{x:Math.floor(cols/2),y:Math.floor(rows/2)}];snakeDir={x:1,y:0};
    snakeFood={x:Math.floor(cols*0.7),y:Math.floor(rows*0.5)};snakeParticles=[];
    snakeHighScore=parseInt(localStorage.getItem('snakeHigh')||'0');
    if(snakeInterval)clearInterval(snakeInterval);
    snakeInterval=setInterval(snakeLoop,75);currentGameRestart=startSnake;
}
function snakeLoop(){if(!gameActive){clearInterval(snakeInterval);return;}
var cols=Math.floor(gameCanvas.width/22);var rows=Math.floor(gameCanvas.height/22);var cell=22;
var head={x:snake[0].x+snakeDir.x,y:snake[0].y+snakeDir.y};
if(head.x<0)head.x=cols-1;if(head.x>=cols)head.x=0;if(head.y<0)head.y=rows-1;if(head.y>=rows)head.y=0;
if(snake.some(function(s){return s.x===head.x&&s.y===head.y;})){if(gameScore>snakeHighScore){snakeHighScore=gameScore;localStorage.setItem('snakeHigh',snakeHighScore);}endGame('🐍 Score: '+gameScore+' | Best: '+snakeHighScore);return;}
snake.unshift(head);
if(head.x===snakeFood.x&&head.y===snakeFood.y){updateGameScore(5);snakeFood={x:Math.floor(Math.random()*cols),y:Math.floor(Math.random()*rows)};for(var i=0;i<10;i++)snakeParticles.push({x:snakeFood.x*cell+cell/2,y:snakeFood.y*cell+cell/2,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,life:20,color:'#FFD700',size:Math.random()*3+2});}
else{snake.pop();}
var ctx=gameCtx,w=cell,h=cell;
var bgGrad=ctx.createRadialGradient(gameCanvas.width/2,gameCanvas.height/2,0,gameCanvas.width/2,gameCanvas.height/2,gameCanvas.width/2);bgGrad.addColorStop(0,'#1a1f4e');bgGrad.addColorStop(1,'#0A0E27');ctx.fillStyle=bgGrad;ctx.fillRect(0,0,gameCanvas.width,gameCanvas.height);
ctx.strokeStyle='rgba(255,255,255,0.02)';ctx.lineWidth=1;for(var x=0;x<gameCanvas.width;x+=w){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,gameCanvas.height);ctx.stroke();}for(var y=0;y<gameCanvas.height;y+=h){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(gameCanvas.width,y);ctx.stroke();}
var fx=snakeFood.x*w+w/2,fy=snakeFood.y*h+h/2;
var glow=ctx.createRadialGradient(fx,fy,0,fx,fy,w*2);glow.addColorStop(0,'rgba(255,71,87,0.6)');glow.addColorStop(1,'rgba(255,71,87,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(fx,fy,w*2,0,Math.PI*2);ctx.fill();
var foodGrad=ctx.createRadialGradient(fx-2,fy-2,0,fx,fy,w*0.5);foodGrad.addColorStop(0,'#FF6B81');foodGrad.addColorStop(1,'#FF4757');ctx.fillStyle=foodGrad;ctx.shadowColor='#FF4757';ctx.shadowBlur=15;ctx.beginPath();ctx.arc(fx,fy,w*0.4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
ctx.fillStyle='rgba(255,255,255,0.3)';ctx.beginPath();ctx.arc(fx-w*0.1,fy-w*0.1,w*0.12,0,Math.PI*2);ctx.fill();
snake.forEach(function(s,i){var ratio=1-(i/snake.length)*0.5;var grad=ctx.createLinearGradient(s.x*w,s.y*h,s.x*w+w,s.y*h+h);grad.addColorStop(0,'#D4AF37');grad.addColorStop(0.5,'#F5E6A3');grad.addColorStop(1,'#B8941F');ctx.fillStyle=grad;ctx.shadowColor='rgba(212,175,55,0.8)';ctx.shadowBlur=10*ratio;var pad=2,rad=6;ctx.beginPath();ctx.moveTo(s.x*w+pad+rad,s.y*h+pad);ctx.lineTo(s.x*w+w-pad-rad,s.y*h+pad);ctx.quadraticCurveTo(s.x*w+w-pad,s.y*h+pad,s.x*w+w-pad,s.y*h+pad+rad);ctx.lineTo(s.x*w+w-pad,s.y*h+h-pad-rad);ctx.quadraticCurveTo(s.x*w+w-pad,s.y*h+h-pad,s.x*w+w-pad-rad,s.y*h+h-pad);ctx.lineTo(s.x*w+pad+rad,s.y*h+h-pad);ctx.quadraticCurveTo(s.x*w+pad,s.y*h+h-pad,s.x*w+pad,s.y*h+h-pad-rad);ctx.lineTo(s.x*w+pad,s.y*h+pad+rad);ctx.quadraticCurveTo(s.x*w+pad,s.y*h+pad,s.x*w+pad+rad,s.y*h+pad);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.stroke();
if(i===0){var es=w*0.16;ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=4;ctx.beginPath();ctx.arc(s.x*w+w*0.65,s.y*h+h*0.3,es,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(s.x*w+w*0.65,s.y*h+h*0.7,es,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#000';ctx.beginPath();ctx.arc(s.x*w+w*0.68,s.y*h+h*0.3,es*0.45,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(s.x*w+w*0.68,s.y*h+h*0.7,es*0.45,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x*w+w*0.7,s.y*h+h*0.25,es*0.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(s.x*w+w*0.7,s.y*h+h*0.65,es*0.2,0,Math.PI*2);ctx.fill();}});
snakeParticles=snakeParticles.filter(function(p){p.x+=p.vx;p.y+=p.vy;p.life--;ctx.globalAlpha=p.life/20;ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=6;ctx.beginPath();ctx.arc(p.x,p.y,p.size*(p.life/20),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;return p.life>0;});ctx.globalAlpha=1;
ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='bold 12px Poppins';ctx.textAlign='right';ctx.fillText('Best: '+snakeHighScore,gameCanvas.width-15,25);}
var tsX=0,tsY=0;document.addEventListener('touchstart',function(e){if(!snake||!gameActive)return;tsX=e.touches[0].clientX;tsY=e.touches[0].clientY;});document.addEventListener('touchend',function(e){if(!snake||!gameActive)return;var dx=e.changedTouches[0].clientX-tsX,dy=e.changedTouches[0].clientY-tsY;if(Math.abs(dx)>Math.abs(dy)){if(dx>25&&snakeDir.x===0)snakeDir={x:1,y:0};else if(dx<-25&&snakeDir.x===0)snakeDir={x:-1,y:0};}else{if(dy>25&&snakeDir.y===0)snakeDir={x:0,y:1};else if(dy<-25&&snakeDir.y===0)snakeDir={x:0,y:-1};}});document.addEventListener('keydown',function(e){if(!snake||!gameActive)return;if(e.key==='ArrowUp'&&snakeDir.y===0){snakeDir={x:0,y:-1};e.preventDefault();}if(e.key==='ArrowDown'&&snakeDir.y===0){snakeDir={x:0,y:1};e.preventDefault();}if(e.key==='ArrowLeft'&&snakeDir.x===0){snakeDir={x:-1,y:0};e.preventDefault();}if(e.key==='ArrowRight'&&snakeDir.x===0){snakeDir={x:1,y:0};e.preventDefault();}});
