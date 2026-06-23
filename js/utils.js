function getInitial(name) { return (name && name !== 'undefined') ? name.charAt(0).toUpperCase() : 'U'; }

function defaultAvatar(name) {
    var l = getInitial(name);
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%231a1f4e" width="100" height="100"/><text x="50" y="62" text-anchor="middle" fill="%23D4AF37" font-size="45">' + l + '</text></svg>');
}

function formatTime(d) {
    if (!d) return '';
    var diff = Date.now() - d;
    if (diff < 60000) return 'Now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
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

function openModal(id) { var m = document.getElementById(id); if (m) m.classList.add('show'); }
function closeModal(id) { var m = document.getElementById(id); if (m) m.classList.remove('show'); }

function addXP(amount) {
    if (!currentUser || !currentUserData) return;
    currentUserData.xp = (currentUserData.xp || 0) + Math.floor(amount);
    try { db.collection('users').doc(currentUser.uid).update({ xp: currentUserData.xp }); } catch(e) {}
}

function addCoins(amount) {
    if (!currentUser || !currentUserData) return;
    currentUserData.coins = (currentUserData.coins || 0) + Math.floor(amount);
    try { db.collection('users').doc(currentUser.uid).update({ coins: currentUserData.coins }); } catch(e) {}
}

console.log('✅ Utils loaded');
