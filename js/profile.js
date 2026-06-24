// CHRONOX V6 PREMIUM PROFILE SYSTEM - UPGRADED MASTER BUILD

async function openUserProfile(uid) {
    const container = document.getElementById('contentArea');
    if (!container) return;
    
    // Smooth transition effect
    container.style.opacity = '0';
    container.innerHTML = '<div class="loader-glow"></div>';
    
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (!doc.exists) throw new Error("User Offline");
        container.style.opacity = '1';
        renderProfile(container, { uid, ...doc.data() });
    } catch (e) {
        showToast("User record unreachable", "error");
        navigate('home');
    }
}

function renderProfile(c, u) {
    const isOwner = (currentUser.uid === u.uid);
    const followers = u.followers || [];
    const following = u.following || [];
    const mutuals = followers.filter(id => (currentUserData.following || []).includes(id));
    
    c.innerHTML = `
        <div class="profile-container" style="padding:20px; color:#fff; font-family:'Poppins',sans-serif;">
            <div class="chrono-glass glow-gold" style="padding:25px; border-radius:24px; border:1px solid #D4AF37; margin-bottom:20px; background:rgba(212,175,55,0.05);">
                <div style="display:flex; align-items:center; gap:20px;">
                    <img src="${u.avatar || defaultAvatar(u.name)}" style="width:90px; height:90px; border-radius:50%; border:3px solid #D4AF37; box-shadow:0 0 15px #D4AF37;">
                    <div>
                        <h2 style="margin:0; font-size:24px;">${u.name || 'User'}</h2>
                        <p style="color:#00D4FF; margin:0; font-size:14px;">${u.username || '@user'}</p>
                        <div style="font-size:11px; margin-top:5px; color:${u.status === 'online' ? '#00ff00' : '#888'};">● ${u.status || 'Offline'}</div>
                    </div>
                </div>
                <p style="margin:20px 0; font-size:14px; opacity:0.9; line-height:1.6;">${u.bio || 'No bio found.'}</p>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:20px;">
                <div class="chrono-glass" style="padding:10px; text-align:center; border:1px solid #333;" onclick="showFollowList('followers', '${u.uid}')"><b>${followers.length}</b><br><small>Followers</small></div>
                <div class="chrono-glass" style="padding:10px; text-align:center; border:1px solid #333;" onclick="showFollowList('following', '${u.uid}')"><b>${following.length}</b><br><small>Following</small></div>
                <div class="chrono-glass" style="padding:10px; text-align:center; border:1px solid #333;" onclick="renderMutualFriends('${u.uid}')"><b>${mutuals.length}</b><br><small>Mutual</small></div>
            </div>

            <div class="chrono-glass glow-neon" style="padding:20px; border-radius:20px; margin-bottom:20px; border:1px solid #00D4FF;">
                <div style="display:flex; justify-content:space-between;">
                    <span>LVL: <b>${u.level || 1}</b></span>
                    <span>XP: <b>${u.xp || 0}</b></span>
                    <span>💰: <b>${u.coins || 0}</b></span>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                ${isOwner ? 
                    `<button class="btn-glow" onclick="editProfile()">✏️ Edit</button><button class="btn-glow" onclick="confirmLogout()">🚪 Exit</button>` : 
                    `<button class="btn-glow" onclick="toggleFollowUser('${u.uid}')">${currentUserData.following.includes(u.uid) ? 'Following' : 'Follow'}</button>
                     <button class="btn-glow" onclick="startChatUser('${u.uid}')">💬 Chat</button>
                     <button class="btn-glow" style="border-color:red" onclick="blockUser('${u.uid}')">🚫 Block</button>
                     <button class="btn-glow" style="border-color:orange" onclick="reportUser('${u.uid}')">⚠️ Report</button>`
                }
            </div>
        </div>
    `;
}

// Ensure you have these CSS styles in your main stylesheet
// .btn-glow { background:transparent; border:1px solid #fff; color:#fff; padding:10px; border-radius:10px; cursor:pointer; }
// .btn-glow:hover { background:rgba(255,255,255,0.1); }

async function toggleFollowUser(uid) {
    const batch = db.batch();
    const myRef = db.collection('users').doc(currentUser.uid);
    const targetRef = db.collection('users').doc(uid);
    
    if (currentUserData.following.includes(uid)) {
        batch.update(myRef, { following: firebase.firestore.FieldValue.arrayRemove(uid) });
        batch.update(targetRef, { followers: firebase.firestore.FieldValue.arrayRemove(currentUser.uid) });
    } else {
        batch.update(myRef, { following: firebase.firestore.FieldValue.arrayUnion(uid) });
        batch.update(targetRef, { followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
    }
    await batch.commit();
    openUserProfile(uid); // Refresh Profile View
}

function showFollowList(type, uid) {
    openModal('genericModal');
    document.getElementById('genericContent').innerHTML = `<h3>${type.toUpperCase()}</h3><div id="listBody">Loading...</div>`;
    db.collection('users').doc(uid).get().then(doc => {
        const ids = doc.data()[type] || [];
        if(ids.length === 0) return document.getElementById('listBody').innerHTML = '<p>No users found.</p>';
        Promise.all(ids.map(id => db.collection('users').doc(id).get())).then(snaps => {
            document.getElementById('listBody').innerHTML = snaps.map(s => `
                <div class="user-card" onclick="openUserProfile('${s.id}');closeModal('genericModal')" style="display:flex; align-items:center; gap:10px; padding:10px; border-bottom:1px solid #222;">
                    <img src="${s.data().avatar}" style="width:40px; height:40px; border-radius:50%;">
                    <div>${s.data().name}</div>
                </div>
            `).join('');
        });
    });
}

function renderMutualFriends(uid) {
    openModal('genericModal');
    db.collection('users').doc(uid).get().then(doc => {
        const mutuals = (currentUserData.following || []).filter(id => (doc.data().followers || []).includes(id));
        if(mutuals.length === 0) return document.getElementById('genericContent').innerHTML = '<p>No mutual friends.</p>';
        Promise.all(mutuals.map(id => db.collection('users').doc(id).get())).then(snaps => {
            document.getElementById('genericContent').innerHTML = snaps.map(s => `
                <div class="user-card" onclick="openUserProfile('${s.id}');closeModal('genericModal')" style="padding:10px;">
                    ${s.data().name}
                </div>
            `).join('');
        });
    });
}

function startChatUser(uid) {
    const chatId = [currentUser.uid, uid].sort().join('_');
    db.collection('chats').doc(chatId).set({
        participants: [currentUser.uid, uid],
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, {merge: true}).then(() => navigate('chat', chatId));
}

function blockUser(uid) {
    db.collection('users').doc(currentUser.uid).update({ blockedUsers: firebase.firestore.FieldValue.arrayUnion(uid) });
    showToast('User Blocked'); navigate('home');
}

function reportUser(uid) {
    db.collection('reports').add({ reportedUser: uid, reportedBy: currentUser.uid, timestamp: Date.now() });
    showToast('Reported!');
}

function confirmLogout() {
    if(confirm('Logout?')) { firebase.auth().signOut(); navigate('login'); }
}
