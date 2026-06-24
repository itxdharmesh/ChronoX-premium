// CHRONOX V6 PREMIUM PROFILE SYSTEM

async function openUserProfile(uid) {
    const container = document.getElementById('contentArea');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center; padding:50px; color:var(--neon);">Loading Neural Matrix...</div>';
    
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (!doc.exists) throw new Error("User Offline");
        renderProfile(container, { uid, ...doc.data() });
    } catch (e) {
        showToast("User record unreachable", "error");
    }
}

function renderProfile(c, u) {
    const isOwner = (currentUser.uid === u.uid);
    const followers = u.followers || [];
    const following = u.following || [];
    const mutuals = followers.filter(id => (currentUserData.following || []).includes(id));
    
    c.innerHTML = `
        <div style="padding:20px; font-family:'Poppins',sans-serif; color:#fff;">
            <div class="chrono-glass glow-gold" style="margin-bottom:20px; padding:20px; border-radius:24px;">
                <div style="display:flex; align-items:center; gap:20px;">
                    <img src="${u.avatar || ''}" onerror="this.src='default.png'" style="width:90px; height:90px; border-radius:24px; border:2px solid #D4AF37; object-fit:cover;">
                    <div>
                        <h2 style="margin:0; font-size:22px;">${u.name || 'Operator'}</h2>
                        <p style="color:#00D4FF; margin:0;">${u.username || '@user'}</p>
                        <div style="font-size:11px; color:#D4AF37;">● ${u.status || 'Active'}</div>
                    </div>
                </div>
                <p style="margin:15px 0; font-size:14px; opacity:0.8;">${u.bio || 'No bio specified.'}</p>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; text-align:center;">
                    <div onclick="showFollowList('followers', '${u.uid}')" style="cursor:pointer"><b>${followers.length}</b><br><small>Followers</small></div>
                    <div onclick="showFollowList('following', '${u.uid}')" style="cursor:pointer"><b>${following.length}</b><br><small>Following</small></div>
                    <div onclick="renderMutualFriends('${u.uid}')" style="cursor:pointer"><b>${mutuals.length}</b><br><small>Mutual</small></div>
                </div>
            </div>

            <div class="chrono-glass glow-neon" style="margin-bottom:20px; padding:20px; border-radius:24px;">
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; text-align:center;">
                    <div>LVL<br><b>${u.level || 1}</b></div>
                    <div>XP<br><b>${u.xp || 0}</b></div>
                    <div>Coins<br><b>${u.coins || 0}</b></div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                ${isOwner ? 
                    `<button class="profile-btn" onclick="editProfile()">Edit Profile</button><button class="profile-btn" onclick="confirmLogout()">Logout</button>` : 
                    `<button class="profile-btn" onclick="toggleFollowUser('${u.uid}')">${currentUserData.following.includes(u.uid) ? 'Unfollow' : 'Follow'}</button>
                     <button class="profile-btn" onclick="startChatUser('${u.uid}')">Message</button>
                     <button class="profile-btn" onclick="blockUser('${u.uid}')">Block</button>
                     <button class="profile-btn" onclick="reportUser('${u.uid}')">Report</button>`
                }
            </div>
        </div>
    `;
}

async function toggleFollowUser(uid) {
    const batch = db.batch();
    const myRef = db.collection('users').doc(currentUser.uid);
    const targetRef = db.collection('users').doc(uid);
    const isFollowing = currentUserData.following.includes(uid);

    if (isFollowing) {
        batch.update(myRef, { following: firebase.firestore.FieldValue.arrayRemove(uid) });
        batch.update(targetRef, { followers: firebase.firestore.FieldValue.arrayRemove(currentUser.uid) });
    } else {
        batch.update(myRef, { following: firebase.firestore.FieldValue.arrayUnion(uid) });
        batch.update(targetRef, { followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
    }
    await batch.commit();
    openUserProfile(uid);
}

function showFollowList(type, uid) {
    openModal('genericModal');
    document.getElementById('genericContent').innerHTML = `<h3>${type.toUpperCase()}</h3><div id="listBody">Loading...</div>`;
    db.collection('users').doc(uid).get().then(doc => {
        const ids = doc.data()[type] || [];
        if(ids.length === 0) return document.getElementById('listBody').innerHTML = '<p>None</p>';
        Promise.all(ids.map(id => db.collection('users').doc(id).get())).then(snaps => {
            document.getElementById('listBody').innerHTML = snaps.map(s => `
                <div onclick="openUserProfile('${s.id}');closeModal('genericModal')" style="display:flex; gap:10px; padding:10px; cursor:pointer;">
                    <img src="${s.data().avatar}" style="width:40px; height:40px; border-radius:50%;">
                    <div>${s.data().name}<br><small style="color:#D4AF37">${s.data().username}</small></div>
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
                <div onclick="openUserProfile('${s.id}');closeModal('genericModal')" style="display:flex; gap:10px; padding:10px; cursor:pointer;">
                    <img src="${s.data().avatar}" style="width:40px; height:40px; border-radius:50%;">
                    <span>${s.data().name}</span>
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
    db.collection('users').doc(currentUser.uid).update({
        blockedUsers: firebase.firestore.FieldValue.arrayUnion(uid)
    }).then(() => { showToast('User Blocked'); navigate('home'); });
}

function reportUser(uid) {
    db.collection('reports').add({
        reportedUser: uid,
        reportedBy: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => showToast('Report Submitted'));
}

function confirmLogout() {
    if(confirm('Logout?')) { firebase.auth().signOut(); navigate('login'); }
}
// CHRONOX V6 PREMIUM PROFILE SYSTEM

async function openUserProfile(uid) {
    const container = document.getElementById('contentArea');
    if (!container) return;
    container.innerHTML = '<div style="text-align:center; padding:50px; color:var(--neon);">Loading Neural Matrix...</div>';
    
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (!doc.exists) throw new Error("User Offline");
        renderProfile(container, { uid, ...doc.data() });
    } catch (e) {
        showToast("User record unreachable", "error");
    }
}

function renderProfile(c, u) {
    const isOwner = (currentUser.uid === u.uid);
    const followers = u.followers || [];
    const following = u.following || [];
    const mutuals = followers.filter(id => (currentUserData.following || []).includes(id));
    
    c.innerHTML = `
        <div style="padding:20px; font-family:'Poppins',sans-serif; color:#fff;">
            <div class="chrono-glass glow-gold" style="margin-bottom:20px; padding:20px; border-radius:24px;">
                <div style="display:flex; align-items:center; gap:20px;">
                    <img src="${u.avatar || ''}" onerror="this.src='default.png'" style="width:90px; height:90px; border-radius:24px; border:2px solid #D4AF37; object-fit:cover;">
                    <div>
                        <h2 style="margin:0; font-size:22px;">${u.name || 'Operator'}</h2>
                        <p style="color:#00D4FF; margin:0;">${u.username || '@user'}</p>
                        <div style="font-size:11px; color:#D4AF37;">● ${u.status || 'Active'}</div>
                    </div>
                </div>
                <p style="margin:15px 0; font-size:14px; opacity:0.8;">${u.bio || 'No bio specified.'}</p>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; text-align:center;">
                    <div onclick="showFollowList('followers', '${u.uid}')" style="cursor:pointer"><b>${followers.length}</b><br><small>Followers</small></div>
                    <div onclick="showFollowList('following', '${u.uid}')" style="cursor:pointer"><b>${following.length}</b><br><small>Following</small></div>
                    <div onclick="renderMutualFriends('${u.uid}')" style="cursor:pointer"><b>${mutuals.length}</b><br><small>Mutual</small></div>
                </div>
            </div>

            <div class="chrono-glass glow-neon" style="margin-bottom:20px; padding:20px; border-radius:24px;">
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; text-align:center;">
                    <div>LVL<br><b>${u.level || 1}</b></div>
                    <div>XP<br><b>${u.xp || 0}</b></div>
                    <div>Coins<br><b>${u.coins || 0}</b></div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                ${isOwner ? 
                    `<button class="profile-btn" onclick="editProfile()">Edit Profile</button><button class="profile-btn" onclick="confirmLogout()">Logout</button>` : 
                    `<button class="profile-btn" onclick="toggleFollowUser('${u.uid}')">${currentUserData.following.includes(u.uid) ? 'Unfollow' : 'Follow'}</button>
                     <button class="profile-btn" onclick="startChatUser('${u.uid}')">Message</button>
                     <button class="profile-btn" onclick="blockUser('${u.uid}')">Block</button>
                     <button class="profile-btn" onclick="reportUser('${u.uid}')">Report</button>`
                }
            </div>
        </div>
    `;
}

async function toggleFollowUser(uid) {
    const batch = db.batch();
    const myRef = db.collection('users').doc(currentUser.uid);
    const targetRef = db.collection('users').doc(uid);
    const isFollowing = currentUserData.following.includes(uid);

    if (isFollowing) {
        batch.update(myRef, { following: firebase.firestore.FieldValue.arrayRemove(uid) });
        batch.update(targetRef, { followers: firebase.firestore.FieldValue.arrayRemove(currentUser.uid) });
    } else {
        batch.update(myRef, { following: firebase.firestore.FieldValue.arrayUnion(uid) });
        batch.update(targetRef, { followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
    }
    await batch.commit();
    openUserProfile(uid);
}

function showFollowList(type, uid) {
    openModal('genericModal');
    document.getElementById('genericContent').innerHTML = `<h3>${type.toUpperCase()}</h3><div id="listBody">Loading...</div>`;
    db.collection('users').doc(uid).get().then(doc => {
        const ids = doc.data()[type] || [];
        if(ids.length === 0) return document.getElementById('listBody').innerHTML = '<p>None</p>';
        Promise.all(ids.map(id => db.collection('users').doc(id).get())).then(snaps => {
            document.getElementById('listBody').innerHTML = snaps.map(s => `
                <div onclick="openUserProfile('${s.id}');closeModal('genericModal')" style="display:flex; gap:10px; padding:10px; cursor:pointer;">
                    <img src="${s.data().avatar}" style="width:40px; height:40px; border-radius:50%;">
                    <div>${s.data().name}<br><small style="color:#D4AF37">${s.data().username}</small></div>
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
                <div onclick="openUserProfile('${s.id}');closeModal('genericModal')" style="display:flex; gap:10px; padding:10px; cursor:pointer;">
                    <img src="${s.data().avatar}" style="width:40px; height:40px; border-radius:50%;">
                    <span>${s.data().name}</span>
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
    db.collection('users').doc(currentUser.uid).update({
        blockedUsers: firebase.firestore.FieldValue.arrayUnion(uid)
    }).then(() => { showToast('User Blocked'); navigate('home'); });
}

function reportUser(uid) {
    db.collection('reports').add({
        reportedUser: uid,
        reportedBy: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => showToast('Report Submitted'));
}

function confirmLogout() {
    if(confirm('Logout?')) { firebase.auth().signOut(); navigate('login'); }
}
