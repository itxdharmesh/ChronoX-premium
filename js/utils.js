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
    var m = document.getElementById(id);
    if (m) m.classList.add('show');
}

function closeModal(id) {
    var m = document.getElementById(id);
    if (m) m.classList.remove('show');
}

function addXP(amount) {
    if (!currentUser || !currentUserData) return;
    amount = Math.floor(amount);
    if (amount <= 0) return;
    
    var newXP = (currentUserData.xp || 0) + amount;
    currentUserData.xp = newXP;
    
    try {
        db.collection('users').doc(currentUser.uid).update({ xp: newXP });
    } catch(e) {}
}

function addCoins(amount) {
    if (!currentUser || !currentUserData) return;
    amount = Math.floor(amount);
    if (amount <= 0) return;
    
    var newCoins = (currentUserData.coins || 0) + amount;
    currentUserData.coins = newCoins;
    
    try {
        db.collection('users').doc(currentUser.uid).update({ coins: newCoins });
    } catch(e) {}
}

function spendCoins(amount) {
    if (!currentUser || !currentUserData) return false;
    if ((currentUserData.coins || 0) < amount) {
        showToast('Not enough coins!', 'error');
        return false;
    }
    currentUserData.coins -= amount;
    try {
        db.collection('users').doc(currentUser.uid).update({ coins: currentUserData.coins });
    } catch(e) {}
    return true;
}

console.log('✅ Utils loaded');
