// ==================== NOTIFICATIONS ====================

function listenNotifications() {
    if (!currentUser) return;
    
    db.collection('notifications')
        .where('to', '==', currentUser.uid)
        .where('read', '==', false)
        .onSnapshot(function(snap) {
            snap.docChanges().forEach(function(change) {
                if (change.type === 'added') {
                    var n = change.doc.data();
                    showNotificationPopup(change.doc.id, n);
                }
            });
        });
}

function showNotificationPopup(id, n) {
    var msg = '';
    if (n.type === 'follow') msg = n.fromName + ' started following you! 👤';
    else if (n.type === 'challenge') msg = n.fromName + ' challenged you to a game! ⚔️';
    else if (n.type === 'message') msg = 'New message from ' + n.fromName + ' 💬';
    else if (n.type === 'mention') msg = n.fromName + ' mentioned you! 📢';
    
    openModal('genericModal');
    document.getElementById('genericContent').innerHTML = 
        '<div style="text-align:center;padding:20px">' +
            '<div style="font-size:50px">🔔</div>' +
            '<h3 style="color:var(--gold);margin:15px 0">' + msg + '</h3>' +
            (n.type === 'challenge' ? 
                '<div style="display:flex;gap:10px">' +
                    '<button class="btn" style="flex:1" onclick="acceptChallenge(\'' + id + '\')">✅ Accept</button>' +
                    '<button class="btn-out" style="flex:1;color:#FF4757;border-color:#FF4757" onclick="declineChallenge(\'' + id + '\')">❌ Decline</button>' +
                '</div>' :
                '<button class="btn" onclick="closeModal(\'genericModal\');markRead(\'' + id + '\')">OK</button>'
            ) +
        '</div>';
}

function markRead(id) {
    db.collection('notifications').doc(id).update({ read: true });
}

function acceptChallenge(id) {
    var ref = db.collection('notifications').doc(id);
    ref.get().then(function(doc) {
        var n = doc.data();
        ref.update({ read: true });
        closeModal('genericModal');
        showToast('Challenge accepted! Starting game...');
        // Start multiplayer game here
    });
}

function declineChallenge(id) {
    db.collection('notifications').doc(id).update({ read: true });
    closeModal('genericModal');
    showToast('Challenge declined');
}

function sendNotification(to, type, extra) {
    db.collection('notifications').add({
        to: to,
        from: currentUser.uid,
        fromName: currentUserData.name,
        type: type,
        read: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

console.log('✅ Notifications loaded');
