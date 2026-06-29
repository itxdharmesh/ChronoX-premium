let grid2048 = Array(4).fill().map(() => Array(4).fill(0));
let score2048 = 0;

function init2048() { grid2048 = Array(4).fill().map(() => Array(4).fill(0)); score2048 = 0; addRandom(); addRandom(); render2048(); }
function addRandom() { const empty = []; grid2048.forEach((r, i) => r.forEach((c, j) => { if (!c) empty.push([i, j]); })); if (empty.length) { const [i, j] = empty[Math.floor(Math.random() * empty.length)]; grid2048[i][j] = Math.random() < 0.9 ? 2 : 4; } }
function render2048() {
    document.getElementById('grid2048').innerHTML = grid2048.flat().map(v => `<div class="cell-2048 cell-${v}">${v || ''}</div>`).join('');
    document.getElementById('score2048').textContent = 'Score: ' + score2048;
}
function move(dir) {
    let moved = false;
    const rotate = (g) => g[0].map((_, i) => g.map(r => r[i]).reverse());
    let g = grid2048;
    if (dir === 'up') g = rotate(rotate(rotate(g)));
    if (dir === 'down') g = rotate(g);
    if (dir === 'right') g = g.map(r => r.reverse());
    g = g.map(r => { let nr = r.filter(v => v); for (let i = 0; i < nr.length - 1; i++) { if (nr[i] === nr[i + 1]) { nr[i] *= 2; score2048 += nr[i]; nr.splice(i + 1, 1); } } while (nr.length < 4) nr.push(0); return nr; });
    if (dir === 'up') g = rotate(g);
    if (dir === 'down') g = rotate(rotate(rotate(g)));
    if (dir === 'right') g = g.map(r => r.reverse());
    if (JSON.stringify(g) !== JSON.stringify(grid2048)) { grid2048 = g; moved = true; }
    if (moved) { addRandom(); render2048(); }
}
document.addEventListener('keydown', e => { if (e.key.startsWith('Arrow')) { e.preventDefault(); move({ ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key]); } });
document.getElementById('reset2048').addEventListener('click', init2048);
init2048();
