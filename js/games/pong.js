var pongData,pongHighScore=0;
function startPong(){
    openGameScreen('🏓 Pong');gameCanvas.style.display='block';
    pongHighScore=parseInt(localStorage.getItem('pongHigh')||'0');
    pongData={ball:{x:gameCanvas.width/2,y:gameCanvas.height/2,dx:5,dy:5,r:10},player:{x:15,y:gameCanvas.height/2-60,w:12,h:120,score:0},ai:{x:gameCanvas.width-27,y:gameCanvas.height/2-60,w:12,h:120,score:0},particles:[],trail:[]};
    currentGameRestart=startPong;gameAnimation=requestAnimationFrame(pongLoop);
}
function pongLoop(){if(!gameActive)return;var c=gameCanvas,ctx=gameCtx,b=pongData.ball,p=pongData.player,a=pongData.ai;
var bgGrad=ctx.createRadialGradient(c.width/2,c.height/2,0,c.width/2,c.height/2,c.width/2);bgGrad.addColorStop(0,'#1a1f4e');bgGrad.addColorStop(1,'#0A0E27');ctx.fillStyle=bgGrad;ctx.fillRect(0,0,c.width,c.height);
ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.setLineDash([8,12]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(c.width/2,0);ctx.lineTo(c.width/2,c.height);ctx.stroke();ctx.setLineDash([]);
ctx.strokeStyle='rgba(255,255,255,0.04)';ctx.beginPath();ctx.arc(c.width/2,c.height/2,80,0,Math.PI*2);ctx.stroke();
pongData.trail.push({x:b.x,y:b.y,life:10});pongData.trail=pongData.trail.filter(function(t){t.life--;ctx.globalAlpha=t.life/10;var tg=ctx.createRadialGradient(t.x,t.y,0,t.x,t.y,b.r*(t.life/10));tg.addColorStop(0,'rgba(0,212,255,0.5)');tg.addColorStop(1,'rgba(0,212,255,0)');ctx.fillStyle=tg;ctx.beginPath();ctx.arc(t.x,t.y,b.r*(t.life/10),0,Math.PI*2);ctx.fill();return t.life>0;});ctx.globalAlpha=1;
b.x+=b.dx;b.y+=b.dy;if(b.y<=b.r||b.y>=c.height-b.r){b.dy*=-1;spawnPongParticles(b.x,b.y,'#fff');}
if(b.x-b.r<=p.x+p.w&&b.y>=p.y&&b.y<=p.y+p.h){b.dx=Math.abs(b.dx);b.x=p.x+p.w+b.r;spawnPongParticles(b.x,b.y,'#D4AF37');}
if(b.x+b.r>=a.x&&b.y>=a.y&&b.y<=a.y+a.h){b.dx=-Math.abs(b.dx);b.x=a.x-b.r;spawnPongParticles(b.x,b.y,'#FF4757');updateGameScore(1);}
if(b.x<0){a.score++;b.x=c.width/2;b.y=c.height/2;b.dx=5;if(a.score>=7){var score=Math.max(p.score,pongHighScore);if(score>pongHighScore){pongHighScore=score;localStorage.setItem('pongHigh',pongHighScore);}endGame('😞 AI Wins! '+a.score+'-'+p.score+' | Best: '+pongHighScore);}}
if(b.x>c.width){p.score++;b.x=c.width/2;b.y=c.height/2;b.dx=-5;if(p.score>=7){if(p.score>pongHighScore){pongHighScore=p.score;localStorage.setItem('pongHigh',pongHighScore);}endGame('🎉 You Win! '+p.score+'-'+a.score+' | Best: '+pongHighScore);}}
a.y+=(b.y-(a.y+a.h/2))*0.12;if(a.y<0)a.y=0;if(a.y+a.h>c.height)a.y=c.height-a.h;
[p,a].forEach(function(pad,i){var pg=ctx.createLinearGradient(pad.x,pad.y,pad.x+pad.w,pad.y+pad.h);pg.addColorStop(0,i===0?'#D4AF37':'#FF4757');pg.addColorStop(0.5,i===0?'#F5E6A3':'#FF6B81');pg.addColorStop(1,i===0?'#B8941F':'#c0392b');ctx.fillStyle=pg;ctx.shadowColor=i===0?'#D4AF37':'#FF4757';ctx.shadowBlur=20;ctx.beginPath();ctx.roundRect(pad.x,pad.y,pad.w,pad.h,8);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=2;ctx.stroke();});
var ballGlow=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r*3);ballGlow.addColorStop(0,'rgba(0,212,255,0.8)');ballGlow.addColorStop(1,'rgba(0,212,255,0)');ctx.fillStyle=ballGlow;ctx.beginPath();ctx.arc(b.x,b.y,b.r*3,0,Math.PI*2);ctx.fill();var ballGrad=ctx.createRadialGradient(b.x-2,b.y-2,0,b.x,b.y,b.r);ballGrad.addColorStop(0,'#fff');ballGrad.addColorStop(1,'#00D4FF');ctx.fillStyle=ballGrad;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
pongData.particles=pongData.particles.filter(function(pt){pt.x+=pt.vx;pt.y+=pt.vy;pt.life--;ctx.globalAlpha=pt.life/15;ctx.fillStyle=pt.color;ctx.shadowColor=pt.color;ctx.shadowBlur=4;ctx.beginPath();ctx.arc(pt.x,pt.y,pt.size*(pt.life/15),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;return pt.life>0;});ctx.globalAlpha=1;
ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='bold 50px Poppins';ctx.textAlign='center';ctx.fillText(p.score,c.width/4,60);ctx.fillText(a.score,c.width*3/4,60);
ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='12px Poppins';ctx.fillText('Best: '+pongHighScore,c.width/2,25);
gameAnimation=requestAnimationFrame(pongLoop);}
function spawnPongParticles(x,y,color){for(var i=0;i<10;i++)pongData.particles.push({x:x,y:y,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6,life:15,size:Math.random()*3+2,color:color});}
document.addEventListener('mousemove',function(e){if(pongData&&gameCanvas){var r=gameCanvas.getBoundingClientRect();pongData.player.y=e.clientY-r.top-pongData.player.h/2;if(pongData.player.y<0)pongData.player.y=0;if(pongData.player.y+pongData.player.h>gameCanvas.height)pongData.player.y=gameCanvas.height-pongData.player.h;}});document.addEventListener('touchmove',function(e){if(pongData&&gameCanvas&&gameActive){var r=gameCanvas.getBoundingClientRect();pongData.player.y=e.touches[0].clientY-r.top-pongData.player.h/2;if(pongData.player.y<0)pongData.player.y=0;if(pongData.player.y+pongData.player.h>gameCanvas.height)pongData.player.y=gameCanvas.height-pongData.player.h;e.preventDefault();}},{passive:false});
