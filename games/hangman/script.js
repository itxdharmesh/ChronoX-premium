const words = ['CHRONOX', 'GAMING', 'JAVASCRIPT', 'PLATFORM', 'ACHIEVEMENT', 'COMMUNITY', 'LEADERBOARD'];
let hangWord = '', guessed = [], wins = 0, wrongs = 0;

function initHang() {
    hangWord = words[Math.floor(Math.random() * words.length)];
    guessed = []; wrongs = 0;
    document.getElementById('hangMessage').textContent = '';
    renderHang();
}

function renderHang() {
    document.getElementById('hangWord').textContent = hangWord.split('').map(l => guessed.includes(l) ? l : '_').join(' ');
    document.getElementById('hangKeyboard').innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => `
        <button class="hang-key ${guessed.includes(l) ? 'used' : ''}" onclick="guessLetter('${l}')">${l}</button>`).join('');
}

function guessLetter(l) {
    if (guessed.includes(l)) return;
    guessed.push(l);
    if (!hangWord.includes(l)) wrongs++;
    if (hangWord.split('').every(l => guessed.includes(l))) { wins++; document.getElementById('hangMessage').textContent = 'You Won! 🎉'; document.getElementById('hangScore').textContent = 'Wins: ' + wins; }
    else if (wrongs >= 6) document.getElementById('hangMessage').textContent = 'Game Over! Word was: ' + hangWord;
    renderHang();
}

document.getElementById('hangReset').addEventListener('click', initHang);
initHang();
