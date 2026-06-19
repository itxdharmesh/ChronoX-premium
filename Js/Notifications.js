// ==================== NOTIFICATION SYSTEM ====================

// Listen for notifications
function startNotificationListener() {
    if (!currentUser) return;
    
    db.collection('notifications')
        .where('to', '==', currentUser.uid)
        .where('read', '==', false)
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const notif = change.doc.data();
                    showInAppNotification(change.doc.id, notif);
                }
            });
        });
}

// Show in-app notification
function showInAppNotification(notifId, notif) {
    switch (notif.type) {
        case 'challenge':
            showChallengePopup(notifId, notif);
            break;
        case 'follow':
            showToast(`${notif.fromName} followed you! 👤`);
            markNotificationRead(notifId);
            break;
        case 'message':
            showToast(`New message from ${notif.fromName} 💬`);
            markNotificationRead(notifId);
            break;
        case 'ban':
            showBanNotification(notif);
            markNotificationRead(notifId);
            break;
        case 'appeal_result':
            showAppealResult(notif);
            markNotificationRead(notifId);
            break;
        default:
            markNotificationRead(notifId);
    }
}

// Challenge popup
function showChallengePopup(notifId, notif) {
    openModal('genericModal');
    document.getElementById('genericModalContent').innerHTML = `
        <div class="modal-header">
            <h2>⚔️ Challenge!</h2>
            <button onclick="closeModal('genericModal');denyChallengeFromPopup('${notifId}')">✕</button>
        </div>
        <div style="text-align:center;padding:20px">
            <div style="font-size:50px">🎮</div>
            <h3 style="color:#fff;margin:15px 0">${notif.fromName}</h3>
            <p style="color:var(--text2)">challenged you to</p>
            <h2 style="color:var(--gold);margin:10px 0">${notif.gameName}</h2>
            <div style="display:flex;gap:10px;margin-top:20px">
                <button class="btn-gold" style="flex:1" onclick="acceptChallengeFromPopup('${notifId}')">✅ Accept</button>
                <button class="btn-outline" style="flex:1;border-color:#FF4757;color:#FF4757" onclick="denyChallengeFromPopup('${notifId}')">❌ Deny</button>
            </div>
        </div>
    `;
}

// Accept from popup
async function acceptChallengeFromPopup(notifId) {
    const notifDoc = await db.collection('notifications').doc(notifId).get();
    const notif = notifDoc.data();
    
    await db.collection('notifications').doc(notifId).update({ read: true });
    await db.collection('challenges').doc(notif.challengeId).update({ status: 'accepted' });
    
    closeModal('genericModal');
    showToast('Challenge accepted! 🎮');
    
    setTimeout(() => {
        startMultiplayerGame(notif.game, notif.challengeId, notif.from, notif.fromName);
    }, 1000);
}

// Deny from popup
async function denyChallengeFromPopup(notifId) {
    const notifDoc = await db.collection('notifications').doc(notifId).get();
    const notif = notifDoc.data();
    
    await db.collection('notifications').doc(notifId).update({ read: true });
    await db.collection('challenges').doc(notif.challengeId).update({ status: 'denied' });
    
    closeModal('genericModal');
    showToast('Challenge denied');
}

// Ban notification
function showBanNotification(notif) {
    openModal('genericModal');
    document.getElementById('genericModalContent').innerHTML = `
        <div class="modal-header">
            <h2>⚠️ Account Banned</h2>
            <button onclick="closeModal('genericModal')">✕</button>
        </div>
        <div style="text-align:center;padding:20px">
            <div style="font-size:50px">🚫</div>
            <h3 style="color:#FF4757;margin:15px 0">Your account has been banned</h3>
            <p style="color:var(--text2);margin:10px 0">Reason: ${notif.reason}</p>
            <p style="color:var(--text2);font-size:12px">Banned on: ${notif.timestamp?.toDate?.() ? new Date(notif.timestamp.toDate()).toLocaleDateString() : 'Unknown'}</p>
            <button class="btn-gold" onclick="submitAppeal('${notif.banId}')">📝 Appeal This Ban</button>
        </div>
    `;
}

// Appeal result
function showAppealResult(notif) {
    if (notif.appealStatus === 'approved') {
        showToast('🎉 Your appeal was approved! Account restored!');
    } else {
        showToast('❌ Your appeal was denied.', 'error');
    }
}

// Mark notification as read
async function markNotificationRead(notifId) {
    await db.collection('notifications').doc(notifId).update({ read: true });
}

// Send follow notification
async function sendFollowNotification(toUserId) {
    if (toUserId === currentUser.uid) return;
    
    await db.collection('notifications').add({
        to: toUserId,
        from: currentUser.uid,
        fromName: currentUserData.name,
        type: 'follow',
        read: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

console.log('✅ Notifications module loaded');
