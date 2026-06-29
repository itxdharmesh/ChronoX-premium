let reactBest = Infinity, startTime, waiting = false;

document.getElementById('reactArea').addEventListener('click', () => {
    if (!waiting) { startReaction(); return; }
    const time = Date.now() - startTime;
    if (time < reactBest) { reactBest = time; document.getElementById('reactBest').textContent = 'Best: ' + time + 'ms'; }
    document.getElementById('reactResult').textContent = time + 'ms! Click to try again';
    document.getElementById('reactArea').style.background = 'var(--error)';
    document.getElementById('reactArea').innerHTML = '<p>Click when green appears!</p>';
    waiting = false;
});

function startReaction() {
    document.getElementById('reactArea').style.background = '#fcc419';
    document.getElementById('reactArea').innerHTML = '<p>Wait...</p>';
    waiting = true;
    const delay = 1000 + Math.random() * 3000;
    setTimeout(() => {
        if (waiting) {
            document.getElementById('reactArea').style.background = 'var(--success)';
            document.getElementById('reactArea').innerHTML = '<p>CLICK NOW!</p>';
            startTime = Date.now();
        }
    }, delay);
}
