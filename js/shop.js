var SHOP_ITEMS = [
    { id: 'xp_boost', name: 'XP Boost 2x', desc: 'Double XP for 1 hour', icon: '⚡', price: 100, type: 'boost' },
    { id: 'coin_boost', name: 'Coin Boost 2x', desc: 'Double coins for 1 hour', icon: '💰', price: 150, type: 'boost' },
    { id: 'avatar_frame_gold', name: 'Gold Frame', desc: 'Premium gold avatar frame', icon: '🖼️', price: 500, type: 'cosmetic' },
    { id: 'badge_vip', name: 'VIP Badge', desc: 'Show off VIP status', icon: '👑', price: 1000, type: 'badge' },
    { id: 'username_color_gold', name: 'Gold Username', desc: 'Your name in gold color', icon: '✨', price: 600, type: 'cosmetic' }
];

function openShop() {
    openModal('genericModal');
    var h = '<h2 style="color:#D4AF37;margin-bottom:10px">🛍️ Shop</h2>';
    h += '<p style="color:rgba(255,255,255,0.6);margin-bottom:15px">Your Coins: <b style="color:#D4AF37">💰 ' + (currentUserData.coins || 0) + '</b></p>';
    
    SHOP_ITEMS.forEach(function(item) {
        var owned = (currentUserData.inventory || []).indexOf(item.id) !== -1;
        h += '<div class="chat-item" style="margin-bottom:5px">';
        h += '<div style="font-size:30px;width:40px;text-align:center">' + item.icon + '</div>';
        h += '<div style="flex:1"><b>' + item.name + '</b><br><small style="color:rgba(255,255,255,0.5)">' + item.desc + '</small></div>';
        if (owned) {
            h += '<small style="color:#2ED573">✅ Owned</small>';
        } else {
            h += '<button class="btn" style="width:auto;padding:6px 12px;font-size:11px" onclick="buyItem(\'' + item.id + '\')">💰 ' + item.price + '</button>';
        }
        h += '</div>';
    });
    
    h += '<button class="btn-out" onclick="closeModal(\'genericModal\')" style="margin-top:10px">Close</button>';
    document.getElementById('genericContent').innerHTML = h;
}

function buyItem(itemId) {
    var item = SHOP_ITEMS.find(function(i) { return i.id === itemId; });
    if (!item) return;
    if ((currentUserData.coins || 0) < item.price) { showToast('Not enough coins!', 'error'); return; }
    if ((currentUserData.inventory || []).indexOf(itemId) !== -1) { showToast('Already owned!', 'error'); return; }
    if (!confirm('Buy ' + item.name + ' for ' + item.price + ' coins?')) return;
    
    db.collection('users').doc(currentUser.uid).update({
        coins: firebase.firestore.FieldValue.increment(-item.price),
        inventory: firebase.firestore.FieldValue.arrayUnion(itemId)
    }).then(function() {
        currentUserData.coins -= item.price;
        if (!currentUserData.inventory) currentUserData.inventory = [];
        currentUserData.inventory.push(itemId);
        showToast('Purchased! 🎉');
        openShop();
    });
}
