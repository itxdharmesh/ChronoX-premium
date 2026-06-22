// ==================== UTILS ====================

function getInitial(name) {
    if (!name || name === 'undefined') return 'U';
    return name.charAt(0).toUpperCase();
}

function defaultAvatar(name) {
    var letter = getInitial(name);
    return 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
        '<rect fill="%231a1f4e" width="100" height="100"/>' +
        '<text x="50" y="62" text-anchor="middle" fill="%23D4AF37" font-size="45" font-family="Arial">' + letter + '</text>' +
        '</svg>'
    );
}

function formatTime(d) {
    if (!d) return '';
    var diff = Date.now() - d;
    if (diff < 60000) return 'Now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function showToast(msg, type) {
    var old = document.querySelector('.toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.className = 'toast' + (type === 'error' ? ' error' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 3000);
}

function openModal(id) {
    document.getElementById(id).classList.add('show');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function shuffleArray(arr) {
    var shuffled = arr.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==================== RIPPLE EFFECT ON BUTTONS ====================
document.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn');
    if (!btn) return;
    
    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    
    setTimeout(function() { ripple.remove(); }, 600);
});

console.log('✅ Utils loaded');
