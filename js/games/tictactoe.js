var tttBoard,tttActive,tttDiff='medium',tttScore=0,tttAIScore=0,tttDraws=0;
function startTTT(){
    tttBoard=['','','','','','','','',''];tttActive=true;
    openGameScreen('❌⭕ Tic Tac Toe');gameCanvas.style.display='none';
    var d=document.createElement('div');d.id='tttContainer';
    d.style.cssText='flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:15px;overflow-y:auto';
    var h='<div style="display:flex;justify-content:center;gap:20px;margin-bottom:10px;color:rgba(255,255,255,0.6);font-size:12px">';
    h+='<span>🧑 <b style="color:#D4AF37">'+tttScore+'</b></span>';
    h+='<span>🤝 <b>'+tttDraws+'</b></span>';
    h+='<span>🤖 <b style="color:#FF4757">'+tttAIScore+'</b></span></div>';
    h+='<div style="display:flex;gap:6px;margin-bottom:12px">';
    ['easy','medium','hard'].forEach(function(x){h+='<button class="btn-out" style="flex:1;padding:8px;font-size:11px;'+(tttDiff===x?'background:rgba(212,175,55,0.2);border-color:#D4AF37':'')+'" onclick="tttDiff=\''+x+'\';startTTT()">'+x.charAt(0).toUpperCase()+x.slice(1)+'</button>';});
    h+='</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:300px;background:rgba(0,0,0,0.3);padding:10px;border-radius:16px">';
    for(var i=0;i<9;i++){h+='<div style="aspect-ratio:1;background:rgba(19,24,66,0.8);border:2px solid rgba(212,175,55,0.2);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:bold;cursor:pointer;transition:all 0.2s;box-shadow:0 4px 15px rgba(0,0,0,0.3)" onclick="tttClick('+i+')" id="ttt'+i+'"></div>';}
    h+='</div><p id="tttStatus" style="text-align:center;color:#D4AF37;margin-top:12px;font-weight:600;font-size:15px">Your turn (X)</p>';
    d.innerHTML=h;gameCanvas.parentNode.insertBefore(d,gameCanvas);currentGameRestart=startTTT;
}
function tttClick(i){if(!tttActive||tttBoard[i]!=='')return;tttBoard[i]='X';var c=document.getElementById('ttt'+i);c.textContent='X';c.style.color='#D4AF37';c.style.transform='scale(1.1)';c.style.borderColor='#D4AF37';c.style.boxShadow='0 0 20px rgba(212,175,55,0.3)';setTimeout(function(){c.style.transform='scale(1)';},150);
if(tttCheckWin('X')){tttActive=false;tttScore++;updateGameScore(10);endGame('🎉 You Win!');return;}
if(tttBoard.every(function(x){return x!=='';})){tttActive=false;tttDraws++;endGame('🤝 Draw!');return;}
document.getElementById('tttStatus').textContent='AI thinking...🤔';
setTimeout(function(){var empty=[];for(var j=0;j<9;j++)if(tttBoard[j]==='')empty.push(j);var ai=tttDiff==='easy'?empty[Math.floor(Math.random()*empty.length)]:tttDiff==='medium'?(Math.random()<0.5?tttBestMove():empty[Math.floor(Math.random()*empty.length)]):tttBestMove();tttBoard[ai]='O';var c2=document.getElementById('ttt'+ai);c2.textContent='O';c2.style.color='#FF4757';c2.style.transform='scale(1.1)';c2.style.borderColor='#FF4757';c2.style.boxShadow='0 0 20px rgba(255,71,87,0.3)';setTimeout(function(){c2.style.transform='scale(1)';},150);
if(tttCheckWin('O')){tttActive=false;tttAIScore++;endGame('😞 AI Wins!');}
else if(tttBoard.every(function(x){return x!=='';})){tttActive=false;tttDraws++;endGame('🤝 Draw!');}
else{document.getElementById('tttStatus').textContent='Your turn (X)';}},400);}
function tttCheckWin(p){var w=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];return w.some(function(w){return tttBoard[w[0]]===p&&tttBoard[w[1]]===p&&tttBoard[w[2]]===p;});}
function tttBestMove(){for(var i=0;i<9;i++){if(tttBoard[i]===''){tttBoard[i]='O';if(tttCheckWin('O')){tttBoard[i]='';return i;}tttBoard[i]='';}}for(var i=0;i<9;i++){if(tttBoard[i]===''){tttBoard[i]='X';if(tttCheckWin('X')){tttBoard[i]='';return i;}tttBoard[i]='';}}var p=[4,0,2,6,8,1,3,5,7];for(var i=0;i<p.length;i++)if(tttBoard[p[i]]==='')return p[i];return 0;}
