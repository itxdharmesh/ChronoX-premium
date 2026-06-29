const emojis = ['🎮','🎯','🎪','🎨','🎭','🎪','🎯','🎮','🎨','🎭','🎲','🎰','🎲','🎰','🎸','🎺'];
let memCards = [], flipped = [], matched = [], moves = 0, lockBoard = false;

function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

function initMem() {
    memCards = shuffle(emojis.map((e, i) => ({ id: i, emoji: e })));
    flipped = []; matched = []; moves = 0; lockBoard = false;
    document.getElementById('memScore').textContent = 'Moves: 0';
    renderMem();
}

function renderMem() {
    document.getElementById('memGrid').innerHTML = memCards.map((c, i) => `
        <div class="mem-card ${flipped.includes(i) || matched.includes(i) ? 'flipped' : ''} ${matched.includes(i) ? 'matched' : ''}" 
             onclick="flipCard(${i})">${flipped.includes(i) || matched.includes(i) ? c.emoji : '?'}</div>`).join('');
}

function flipCard(i) {
    if (lockBoard || flipped.includes(i) || matched.includes(i)) return;
    flipped.push(i); renderMem();
    if (flipped.length === 2) {
        moves++; document.getElementById('memScore').textContent = 'Moves: ' + moves;
        lockBoard = true;
        if (memCards[flipped[0]].emoji === memCards[flipped[1]].emoji) {
            matched.push(...flipped); flipped = []; lockBoard = false; renderMem();
            if (matched.length === emojis.length) setTimeout(() => alert('You won in ' + moves + ' moves!'), 300);
        } else setTimeout(() => { flipped = []; lockBoard = false; renderMem(); }, 800);
    }
}

document.getElementById('memReset').addEventListener('click', initMem);
initMem();
