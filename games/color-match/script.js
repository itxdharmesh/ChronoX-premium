let colorScore = 0, targetColor = '';

function randomColor() { return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'); }

function initColor() {
    targetColor = randomColor();
    document.getElementById('colorTarget').style.backgroundColor = targetColor;
    const options = [targetColor, randomColor(), randomColor(), randomColor(), randomColor(), randomColor()].sort(() => Math.random() - 0.5);
    document.getElementById('colorOptions').innerHTML = options.map(c => `<div class="color-option-btn" style="background:${c}" onclick="checkColor('${c}')"></div>`).join('');
    document.getElementById('colorMessage').textContent = '';
}

function checkColor(c) {
    if (c === targetColor) { colorScore++; document.getElementById('colorScore').textContent = 'Score: ' + colorScore; document.getElementById('colorMessage').textContent = 'Correct! 🎉'; initColor(); }
    else document.getElementById('colorMessage').textContent = 'Try Again!';
}

initColor();
