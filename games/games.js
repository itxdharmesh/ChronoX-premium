const gamesList = [
    { id: 'flappy-bird', name: 'Flappy Bird', icon: '🐦', desc: 'Fly through pipes' },
    { id: 'snake', name: 'Snake', icon: '🐍', desc: 'Classic snake game' },
    { id: 'memory-match', name: 'Memory Match', icon: '🧠', desc: 'Match card pairs' },
    { id: '2048', name: '2048', icon: '🔢', desc: 'Merge tiles to 2048' },
    { id: 'tic-tac-toe', name: 'Tic Tac Toe', icon: '⭕', desc: 'Beat the AI' },
    { id: 'rock-paper-scissors', name: 'RPS', icon: '✂️', desc: 'Rock Paper Scissors' },
    { id: 'hangman', name: 'Hangman', icon: '💀', desc: 'Guess the word' },
    { id: 'minesweeper', name: 'Minesweeper', icon: '💣', desc: 'Avoid the mines' },
    { id: 'color-match', name: 'Color Match', icon: '🎨', desc: 'Match the colors' },
    { id: 'reaction-test', name: 'Reaction Test', icon: '⚡', desc: 'Test your speed' },
    { id: 'typing-race', name: 'Typing Race', icon: '⌨️', desc: 'Type fast!' }
];

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('gamesGrid');
    if (grid) {
        grid.innerHTML = gamesList.map(g => `
            <div class="game-card" onclick="router.navigate('/games/${g.id}')">
                <div class="game-icon">${g.icon}</div>
                <div class="game-name">${g.name}</div>
                <div class="game-desc">${g.desc}</div>
            </div>`).join('');
    }
});
