function startMemoryMatch() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    
    const emojis = ['🚀','🌟','💎','🎯','🔥','🛸','🎮','💜'];
    let cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    let flipped = [], matched = [], moves = 0, canFlip = true;
    
    c.innerHTML = `
        <div id="mmContainer" style="position:relative;width:100%;height:100%;min-height:500px;height:calc(100vh - 150px);overflow:hidden;background:radial-gradient(circle at center,#0a0f1e 0%,#03050a 100%);font-family:'Poppins',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem;">
            <div style="display:flex;justify-content:space-between;width:100%;max-width:350px;margin-bottom:1rem;">
                <div class="glass-panel" style="padding:8px 16px;"><span style="font-size:10px;color:#888;">MOVES</span><div id="mmMoves" style="color:#00D4FF;font-weight:900;">0</div></div>
                <div class="glass-panel" style="padding:8px 16px;"><span style="font-size:10px;color:#888;">MATCHED</span><div id="mmMatched" style="color:#D4AF37;font-weight:900;">0/8</div></div>
            </div>
            <div id="mmGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:350px;width:100%;"></div>
            <button onclick="exitMemoryMatch()" class="btn-glow" style="margin-top:1rem;">EXIT</button>
        </div>
    `;
    
    const grid = document.getElementById('mmGrid');
    cards.forEach((emoji, i) => {
        const card = document.createElement('div');
        card.className = 'glass-panel';
        card.style.cssText = 'aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:pointer;transition:all 0.3s;';
        card.innerHTML = '<span style="opacity:0;">' + emoji + '</span>';
        card.onclick = () => flipCard(i, card, emoji);
        grid.appendChild(card);
    });
    
    function flipCard(i, card, emoji) {
        if (!canFlip || flipped.length >= 2 || flipped.includes(i) || matched.includes(i)) return;
        card.querySelector('span').style.opacity = '1';
        card.style.borderColor = '#00D4FF';
        flipped.push(i);
        
        if (flipped.length === 2) {
            moves++;
            document.getElementById('mmMoves').textContent = moves;
            canFlip = false;
            
            if (cards[flipped[0]] === cards[flipped[1]]) {
                matched.push(flipped[0], flipped[1]);
                document.getElementById('mmMatched').textContent = matched.length/2 + '/8';
                flipped = [];
                canFlip = true;
                if (matched.length === 16) {
                    setTimeout(() => {
                        if (typeof window.completeGame === 'function') window.completeGame('Memory Match', 30, 15);
                    }, 500);
                }
            } else {
                setTimeout(() => {
                    flipped.forEach(idx => {
                        grid.children[idx].querySelector('span').style.opacity = '0';
                        grid.children[idx].style.borderColor = '';
                    });
                    flipped = [];
                    canFlip = true;
                }, 600);
            }
        }
    }
}

function exitMemoryMatch() { if (typeof openGames === 'function') openGames(); }
