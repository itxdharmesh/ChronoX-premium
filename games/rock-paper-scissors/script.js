let rpsScore = 0;
function playRPS(player) {
    const choices = ['rock', 'paper', 'scissors'];
    const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
    const ai = choices[Math.floor(Math.random() * 3)];
    document.getElementById('playerChoice').textContent = emojis[player];
    document.getElementById('aiChoice').textContent = emojis[ai];
    let result = '';
    if (player === ai) result = 'Draw!';
    else if ((player === 'rock' && ai === 'scissors') || (player === 'paper' && ai === 'rock') || (player === 'scissors' && ai === 'paper')) { result = 'You Win!'; rpsScore++; }
    else result = 'AI Wins!';
    document.getElementById('rpsResult').textContent = result;
    document.getElementById('rpsScore').textContent = 'Score: ' + rpsScore;
}
