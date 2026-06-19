// ==================== MODERATION SYSTEM ====================

// Report user
async function submitReport(userId, reason) {
    try {
        await db.collection('reports').add({
            reportedUser: userId,
            reportedBy: currentUser.uid,
            reason,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        });
        
        closeModal('genericModal');
        showToast('Report submitted. We will review it.');
        
        // Auto-check: if user gets 5+ reports, auto-ban
        checkAutoBan(userId);
    } catch (e) {
        showToast('Error submitting report', 'error');
    }
}

// Check auto-ban (5+ reports)
async function checkAutoBan(userId) {
    const snapshot = await db.collection('reports')
        .where('reportedUser', '==', userId)
        .where('status', '==', 'pending')
        .get();
    
    if (snapshot.size >= 5) {
        // Auto-ban the user
        await banUser(userId, 'Multiple reports from users');
    }
}

// Ban user
async function banUser(userId, reason) {
    const banId = generateId();
    
    await db.collection('banned_users').doc(banId).set({
        userId,
        reason,
        bannedAt: firebase.firestore.FieldValue.serverTimestamp(),
        bannedBy: 'system',
        appealStatus: 'none'
    });
    
    // Update user status
    await db.collection('users').doc(userId).update({
        isBanned: true,
        bannedAt: firebase.firestore.FieldValue.serverTimestamp(),
        banReason: reason
    });
    
    // Send ban notification
    await db.collection('notifications').add({
        to: userId,
        type: 'ban',
        reason,
        banId,
        read: false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Mark all reports as resolved
    const reports = await db.collection('reports')
        .where('reportedUser', '==', userId)
        .get();
    
    const batch = db.batch();
    reports.forEach(doc => {
        batch.update(doc.ref, { status: 'resolved' });
    });
    await batch.commit();
}

// Submit appeal
function submitAppeal(banId) {
    openModal('genericModal');
    document.getElementById('genericModalContent').innerHTML = `
        <div class="modal-header">
            <h2>📝 Appeal Ban</h2>
            <button onclick="closeModal('genericModal')">✕</button>
        </div>
        <p style="color:var(--text2);margin-bottom:15px">Explain why your account should be unbanned:</p>
        <textarea class="input-field" id="appealMessage" placeholder="Write your appeal here..." rows="4" style="resize:none"></textarea>
        <button class="btn-gold" onclick="sendAppeal('${banId}')">Submit Appeal</button>
        <p style="color:var(--text2);font-size:11px;margin-top:10px;text-align:center">38% chance of recovery</p>
    `;
}

// Send appeal
async function sendAppeal(banId) {
    const message = document.getElementById('appealMessage')?.value?.trim();
    if (!message) return showToast('Please write your appeal', 'error');
    
    await db.collection('banned_users').doc(banId).update({
        appealMessage: message,
        appealStatus: 'pending',
        appealSubmittedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    closeModal('genericModal');
    showToast('Appeal submitted!');
    
    // Simulate appeal review (38% chance)
    setTimeout(() => {
        const approved = Math.random() < 0.38;
        reviewAppeal(banId, approved);
    }, 5000);
}

// Review appeal
async function reviewAppeal(banId, approved) {
    const banDoc = await db.collection('banned_users').doc(banId).get();
    const banData = banDoc.data();
    
    if (approved) {
        // Unban user
        await db.collection('users').doc(banData.userId).update({
            isBanned: false,
            bannedAt: null,
            banReason: null
        });
        
        await db.collection('banned_users').doc(banId).update({
            appealStatus: 'approved'
        });
        
        // Send approval notification
        await db.collection('notifications').add({
            to: banData.userId,
            type: 'appeal_result',
            appealStatus: 'approved',
            banId,
            read: false,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } else {
        await db.collection('banned_users').doc(banId).update({
            appealStatus: 'denied'
        });
        
        // Send denial notification
        await db.collection('notifications').add({
            to: banData.userId,
            type: 'appeal_result',
            appealStatus: 'denied',
            banId,
            read: false,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
}

// Show user options (About, Report, Block)
function showUserOptions() {
    const dropdown = document.getElementById('userOptionsDropdown');
    dropdown.classList.toggle('show');
}

// About account
async function aboutAccount() {
    const userId = document.getElementById('userOptionsDropdown').dataset.userId;
    document.getElementById('userOptionsDropdown').classList.remove('show');
    
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    const usernameChanges = userData.usernameChangeCount || 0;
    const createdAt = userData.createdAt?.toDate?.() || userData.createdAt;
    const isOnline = userData.onlineStatus === 'online';
    
    openModal('genericModal');
    document.getElementById('genericModalContent').innerHTML = `
        <div class="modal-header">
            <h2>ℹ️ About Account</h2>
            <button onclick="closeModal('genericModal')">✕</button>
        </div>
        <div style="padding:10px">
            <div class="info-row"><span>Username:</span> <span>${userData.username}</span></div>
            <div class="info-row"><span>Username Changes:</span> <span>${usernameChanges} times</span></div>
            <div class="info-row"><span>Account Created:</span> <span>${createdAt ? new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Unknown'}</span></div>
            <div class="info-row"><span>Status:</span> <span style="color:${isOnline ? '#2ED573' : 'var(--text2)'}">${isOnline ? '● Active now' : 'Offline'}</span></div>
            <div class="info-row"><span>Achievements:</span> <span>${userData.stats?.achievements || 0}</span></div>
            <div class="info-row"><span>Level:</span> <span>${userData.level?.title || 'Explorer'} (Lv.${userData.level?.current || 1})</span></div>
        </div>
    `;
}

// Block user from dropdown
async function blockUser() {
    const userId = document.getElementById('userOptionsDropdown').dataset.userId;
    document.getElementById('userOptionsDropdown').classList.remove('show');
    
    if (!confirm('Are you sure you want to block this user?')) return;
    
    await db.collection('users').doc(currentUser.uid).update({
        blockedUsers: firebase.firestore.FieldValue.arrayUnion(userId)
    });
    
    // Remove from followers/following
    await db.collection('users').doc(currentUser.uid).update({
        following: firebase.firestore.FieldValue.arrayRemove(userId),
        followers: firebase.firestore.FieldValue.arrayRemove(userId)
    });
    await db.collection('users').doc(userId).update({
        followers: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
        following: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
    });
    
    const doc = await db.collection('users').doc(currentUser.uid).get();
    currentUserData = doc.data();
    
    closeModal('userProfileModal');
    showToast('User blocked! 🚫');
}

// Unblock from dropdown
async function unblockUserFromDropdown() {
    const userId = document.getElementById('userOptionsDropdown').dataset.userId;
    document.getElementById('userOptionsDropdown').classList.remove('show');
    
    await db.collection('users').doc(currentUser.uid).update({
        blockedUsers: firebase.firestore.FieldValue.arrayRemove(userId)
    });
    
    const doc = await db.collection('users').doc(currentUser.uid).get();
    currentUserData = doc.data();
    
    closeModal('userProfileModal');
    showToast('User unblocked! ✅');
}

console.log('✅ Moderation module loaded');
