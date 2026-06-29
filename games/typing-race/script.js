const wordList = ['chronox', 'gaming', 'javascript', 'platform', 'achievement', 'community', 'leaderboard', 'avatar', 'coins', 'rewards'];
let typeScore = 0, currentWord = '';

function newWord() { currentWord = wordList[Math.floor(Math.random() * wordList.length)]; document.getElementById('typeDisplay').textContent = currentWord; }

document.getElementById('typeInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (e.target.value.trim().toLowerCase() === currentWord) { typeScore++; document.getElementById('typeScore').textContent = 'Score: ' + typeScore; }
        e.target.value = ''; newWord();
    }
});

newWord();
