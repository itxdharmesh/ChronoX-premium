import { db, auth } from './config.js';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, writeBatch, deleteDoc, collection, getDocs, query, where, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { deleteUser, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { showToast } from './utils.js';

function defaultAvatar(name) { name = name || 'User'; return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00D4FF&color=fff&size=200`; }
function getXPForLevel(lvl) { var r = {1:100,2:250,3:450,4:700,5:1000,6:1400,7:1900,8:2500,9:3200,10:4000}; return r[lvl] || lvl*500; }

// ============ OPEN PROFILE ============
async function openUserProfile(uid) {
    if (!uid) { showToast('Invalid user', 'error'); return; }
    try {
        var snap = await getDoc(doc(db, 'users', uid));
        if (!snap.exists()) { showToast('User not found', 'error'); return; }
        buildProfileUI(document.getElementById('profileContainer'), snap.data(), uid);
        window.navigate('profile');
    } catch(e) { showToast('Error', 'error'); }
}

// ============ RENDER OWN PROFILE ============
async function renderOwnProfile() {
    var me = window.auth?.currentUser;
    if (!me) return;
    var snap = await getDoc(doc(db, 'users', me.uid));
    if (snap.exists()) { window.currentUserData = snap.data(); buildProfileUI(document.getElementById('profileContainer'), snap.data(), me.uid); }
}

// ============ BUILD PROFILE UI ============
function buildProfileUI(container, data, uid) {
    var me = window.auth?.currentUser;
    var isMine = me && me.uid === uid;
    var badges = (data.badges||[]).map(b => `<span class="badge-pill">🏅 ${b.replace(/_/g,' ')}</span>`).join('') || '<span style="color:#666;font-size:0.7rem;">No badges</span>';
    var lvl = data.level||1, xp = data.xp||0, xpNeed = getXPForLevel(lvl), xpProg = xp % xpNeed, xpPct = Math.min(100,(xpProg/xpNeed)*100);
    var mutual = 0;
    if (!isMine && window.currentUserData) { var tf = data.following||[], mf = window.currentUserData.following||[]; tf.forEach(f => { if (mf.indexOf(f)!==-1) mutual++; }); }
    
    container.innerHTML = `
    <div class="profile-main">
        <div class="glass-panel profile-header-card">
            <div class="profile-avatar-wrap">
                <img src="${data.avatar||defaultAvatar(data.name)}" class="profile-avatar-lg" onerror="this.src='${defaultAvatar('User')}'" ${isMine?'onclick="window.triggerAvatarUpload()"':''}>
                ${isMine?'<span class="avatar-camera" onclick="window.triggerAvatarUpload()">📷</span>':''}
                <div class="avatar-glow"></div>
            </div>
            <h2 class="neon-text profile-name">${data.name||'User'}</h2>
            <p class="profile-username">@${data.username||'unknown'}</p>
            <div class="profile-follow-row" onclick="window.showFollowList('followers','${uid}')">
                <span>👥 ${(data.followers||[]).length} Followers</span>
                <span style="margin:0 8px;">•</span>
                <span onclick="event.stopPropagation();window.showFollowList('following','${uid}')">🫂 ${(data.following||[]).length} Following</span>
            </div>
            <p class="profile-bio">${data.bio||'No bio yet ✨'}</p>
            <div class="badges-scroll">${badges}</div>
            ${mutual>0?`<p style="color:var(--neon-blue);margin-top:8px;">🤝 ${mutual} mutual friends</p>`:''}
        </div>

        <div class="glass-panel xp-card">
            <h4 class="card-title">⚡ XP Progress</h4>
            <div class="xp-stats"><div><span>⭐ Level ${lvl}</span></div><div><span>✨ ${xp} XP</span></div><div><span>🪙 ${data.coins||0}</span></div><div><span>🔥 ${data.streak||0}</span></div></div>
            <div class="xp-bar-lg"><div class="xp-fill-lg" style="width:${xpPct}%"></div></div>
            <p class="xp-text">${xpProg} / ${xpNeed} XP to Level ${lvl+1}</p>
        </div>

        <div class="glass-panel achievements-card">
            <h4 class="card-title">🏆 Achievements</h4>
            <div class="achievements-grid">
                ${getAchievements(data).map(a => `
                    <div class="achievement-item ${a.unlocked?'unlocked':'locked'}" onclick="window.showAchievementDetail('${a.id}')">
                        <span class="ach-icon">${a.icon}</span>
                        <span class="ach-name">${a.name}</span>
                        ${a.unlocked ? '<span class="ach-check">✅</span>' : `<div class="ach-progress-mini"><div class="ach-progress-fill" style="width:${a.progress}%"></div></div>`}
                    </div>
                `).join('')}
            </div>
        </div>

        ${isMine ? `
        <div class="profile-buttons">
            <button class="btn-glow btn-full" onclick="window.openEditProfile()">✏️ Edit Profile</button>
            <button class="btn-gold btn-full" onclick="window.openShop()">🛒 Shop</button>
            <button class="btn-glow btn-full" onclick="window.openSettingsPage()">⚙️ Settings</button>
        </div>` : `
        <div class="profile-buttons">
            <button class="btn-glow btn-full" id="followBtn">${(window.currentUserData?.following||[]).indexOf(uid)!==-1?'<i class="fas fa-user-minus"></i> Unfollow':'<i class="fas fa-user-plus"></i> Follow'}</button>
            <button class="btn-gold btn-full" onclick="window.openChat('${uid}')">💬 Message</button>
            <button class="btn-glow btn-full" onclick="window.reportUser('${uid}')">⚠️ Report</button>
            <button class="btn-gold btn-full" onclick="window.blockUser('${uid}')">🚫 Block</button>
        </div>`}
    </div>`;

    if (!isMine) setTimeout(() => document.getElementById('followBtn')?.addEventListener('click', () => toggleFollow(uid)), 100);
}

function getAchievements(data) {
    var xp = data.xp||0, followers = (data.followers||[]).length;
    return [
        { id:'ach1', name:'Rising Star', icon:'⭐', unlocked: xp>=100, progress: Math.min(100,(xp/100)*100) },
        { id:'ach2', name:'XP Hunter', icon:'🎯', unlocked: xp>=1000, progress: Math.min(100,(xp/1000)*100) },
        { id:'ach3', name:'Social Butterfly', icon:'🦋', unlocked: followers>=10, progress: Math.min(100,(followers/10)*100) },
        { id:'ach4', name:'Coin Collector', icon:'💰', unlocked: (data.coins||0)>=500, progress: Math.min(100,((data.coins||0)/500)*100) },
        { id:'ach5', name:'Streak Master', icon:'🔥', unlocked: (data.streak||0)>=7, progress: Math.min(100,((data.streak||0)/7)*100) },
        { id:'ach6', name:'Legend', icon:'👑', unlocked: (data.level||1)>=5, progress: Math.min(100,((data.level||1)/5)*100) }
    ];
}

function showAchievementDetail(id) { showToast('Achievement details coming soon', 'info'); }

// ============ TOGGLE FOLLOW ============
async function toggleFollow(targetUid) {
    var me = window.auth?.currentUser;
    if (!me || me.uid===targetUid) return;
    var myRef = doc(db,'users',me.uid), targetRef = doc(db,'users',targetUid), batch = writeBatch(db);
    var myDoc = await getDoc(myRef), myData = myDoc.data();
    if ((myData.following||[]).indexOf(targetUid)!==-1) { batch.update(myRef,{following:arrayRemove(targetUid)}); batch.update(targetRef,{followers:arrayRemove(me.uid)}); }
    else { batch.update(myRef,{following:arrayUnion(targetUid)}); batch.update(targetRef,{followers:arrayUnion(me.uid)}); }
    await batch.commit();
    window.currentUserData = (await getDoc(myRef)).data();
    showToast('Updated!','success');
    setTimeout(()=>openUserProfile(targetUid),300);
}

// ============ EDIT PROFILE ============
function openEditProfile() {
    showModal('✏️ Edit Profile', `
        <input id="editName" class="glass-input" placeholder="Name" value="${window.currentUserData?.name||''}">
        <input id="editUsername" class="glass-input" placeholder="Username" value="${window.currentUserData?.username||''}">
        <textarea id="editBio" class="glass-input" placeholder="Bio" style="height:80px;">${window.currentUserData?.bio||''}</textarea>
        <button class="btn-glow btn-full" onclick="window.saveProfile()">💾 Save</button>
    `);
}

async function saveProfile() {
    var n = document.getElementById('editName')?.value.trim(), u = document.getElementById('editUsername')?.value.trim().toLowerCase(), b = document.getElementById('editBio')?.value.trim();
    if (!n||!u) { showToast('Required','error'); return; }
    await updateDoc(doc(db,'users',window.auth.currentUser.uid),{name:n,username:u,bio:b});
    window.currentUserData = (await getDoc(doc(db,'users',window.auth.currentUser.uid))).data();
    showToast('Saved!','success'); closeModal(); renderOwnProfile();
}

// ============ AVATAR ============
function triggerAvatarUpload() {
    var inp = document.createElement('input'); inp.type='file'; inp.accept='image/*';
    inp.onchange = async e => {
        var f = e.target.files[0]; if(!f) return;
        var r = new FileReader(); r.onload = async ev => {
            var img = new Image(); img.onload = async () => {
                var c = document.createElement('canvas'), s=200, w=img.width, h=img.height;
                if(w>h){if(w>s){h*=s/w;w=s;}}else{if(h>s){w*=s/h;h=s;}}
                c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);
                await updateDoc(doc(db,'users',window.auth.currentUser.uid),{avatar:c.toDataURL('image/jpeg',0.7)});
                window.currentUserData = (await getDoc(doc(db,'users',window.auth.currentUser.uid))).data();
                showToast('Updated!','success'); renderOwnProfile();
            }; img.src=ev.target.result;
        }; r.readAsDataURL(f);
    }; inp.click();
}

// ============ SHOP ============
function openShop() {
    var items = [{n:'Gold Border',i:'🟡',p:500},{n:'Neon Frame',i:'💠',p:750},{n:'Crown Badge',i:'👑',p:1000},{n:'Diamond Theme',i:'💎',p:1500},{n:'Fire Effect',i:'🔥',p:600},{n:'Star Bubble',i:'⭐',p:300}];
    var h = items.map(x=>`<div class="glass-panel shop-item"><div style="font-size:2rem;">${x.i}</div><p>${x.n}</p><p style="color:var(--gold);">🪙 ${x.p}</p><button class="btn-glow btn-sm" onclick="window.buyItem('${x.n}',${x.p})">Buy</button></div>`).join('');
    showModal('🛍️ Shop',`<p style="color:var(--gold);">🪙 ${window.currentUserData?.coins||0}</p><div class="shop-grid">${h}</div>`);
}

async function buyItem(n,p) {
    var me = window.auth?.currentUser; if(!me) return;
    var snap = await getDoc(doc(db,'users',me.uid)), d = snap.data();
    if((d.coins||0)<p){showToast('Not enough coins!','error');return;}
    var owned = d.ownedItems||[];
    if(owned.indexOf(n)!==-1){showToast('Already owned!','info');return;}
    owned.push(n);
    await updateDoc(doc(db,'users',me.uid),{coins:(d.coins||0)-p,ownedItems:owned});
    window.currentUserData = (await getDoc(doc(db,'users',me.uid))).data();
    showToast('Purchased!','success');closeModal();
}

// ============ SETTINGS PAGE ============
function openSettingsPage() {
    var h = `
    <div class="settings-page">
        <div class="settings-header"><button class="btn-icon" onclick="window.renderOwnProfile();window.navigate('profile');closeModal();"><i class="fas fa-arrow-left"></i></button><h3 class="neon-text">Settings</h3><div></div></div>
        
        <div class="settings-section"><h4>👤 Account</h4>
            <div class="settings-item" onclick="closeModal();window.openEditProfile();">✏️ Edit Profile</div>
            <div class="settings-item" onclick="closeModal();window.triggerAvatarUpload();">📷 Change Profile Picture</div>
        </div>
        
        <div class="settings-section"><h4>🔒 Privacy</h4>
            <div class="settings-item"><span>Private Account</span><input type="checkbox" ${window.currentUserData?.isPrivate?'checked':''} onchange="window.togglePrivacy()"></div>
            <div class="settings-item"><span>Hide Online Status</span><input type="checkbox" ${window.currentUserData?.hideStatus?'checked':''} onchange="window.toggleStatus()"></div>
        </div>
        
        <div class="settings-section"><h4>🔐 Security</h4>
            <div class="settings-item" onclick="window.openChangePassword()">🔑 Change Password</div>
        </div>
        
        <div class="settings-section"><h4>🚫 Blocked Users</h4>
            <input id="blockedSearch" class="glass-input" placeholder="Search blocked users..." oninput="window.searchBlockedUsers()">
            <div id="blockedList"></div>
        </div>
        
        <div class="settings-section"><h4>🔍 Discover</h4>
            <div id="suggestedUsers" class="suggested-list"></div>
        </div>
        
        <div class="settings-section danger-zone"><h4>⚠️ Danger Zone</h4>
            <button class="btn-glow btn-full" style="background:rgba(255,71,87,0.2);border-color:#ff4757;color:#ff4757;" onclick="window.confirmDeleteAccount()">🗑️ Delete Account</button>
        </div>
        
        <button class="btn-gold btn-full" onclick="window.confirmLogout()">🚪 Logout</button>
    </div>`;
    showModalFull(h);
    loadBlockedUsers();
    loadSuggestions();
}

// ============ CHANGE PASSWORD ============
function openChangePassword() {
    showModal('🔑 Change Password', `
        <input id="currentPass" class="glass-input" type="password" placeholder="Current Password">
        <input id="newPass" class="glass-input" type="password" placeholder="New Password">
        <input id="confirmPass" class="glass-input" type="password" placeholder="Confirm New Password">
        <button class="btn-glow btn-full" onclick="window.changePassword()">Update Password</button>
    `);
}

async function changePassword() {
    var cp = document.getElementById('currentPass')?.value, np = document.getElementById('newPass')?.value, conp = document.getElementById('confirmPass')?.value;
    if(!cp||!np||!conp){showToast('Fill all fields','error');return;}
    if(np!==conp){showToast('Passwords dont match','error');return;}
    if(np.length<6){showToast('Min 6 characters','error');return;}
    try {
        var cred = EmailAuthProvider.credential(window.auth.currentUser.email, cp);
        await reauthenticateWithCredential(window.auth.currentUser, cred);
        await updatePassword(window.auth.currentUser, np);
        showToast('Password updated!','success');closeModal();
    } catch(e) { showToast(e.message,'error'); }
}

// ============ BLOCKED USERS ============
async function loadBlockedUsers() {
    var me = window.auth?.currentUser; if(!me) return;
    var snap = await getDoc(doc(db,'users',me.uid));
    var blocked = snap.data()?.blockedUsers||[];
    var container = document.getElementById('blockedList');
    if(!container) return;
    if(!blocked.length){container.innerHTML='<p style="color:#888;padding:1rem;">No blocked users</p>';return;}
    container.innerHTML = '';
    for(var uid of blocked) {
        var u = await getDoc(doc(db,'users',uid));
        if(u.exists()){
            var d = u.data();
            container.innerHTML += `<div class="settings-item"><span>@${d.username}</span><button class="btn-sm" style="color:#2ED573;" onclick="window.unblockUser('${uid}')">Unblock</button></div>`;
        }
    }
}

async function unblockUser(uid) {
    await updateDoc(doc(db,'users',window.auth.currentUser.uid),{blockedUsers:arrayRemove(uid)});
    showToast('Unblocked','success');loadBlockedUsers();
}

async function searchBlockedUsers() {
    var term = document.getElementById('blockedSearch')?.value?.toLowerCase()||'';
    var me = window.auth?.currentUser; if(!me) return;
    var snap = await getDoc(doc(db,'users',me.uid));
    var blocked = snap.data()?.blockedUsers||[];
    var container = document.getElementById('blockedList');
    container.innerHTML = '';
    for(var uid of blocked) {
        var u = await getDoc(doc(db,'users',uid));
        if(u.exists() && u.data().username?.includes(term)) {
            container.innerHTML += `<div class="settings-item"><span>@${u.data().username}</span><button class="btn-sm" style="color:#2ED573;" onclick="window.unblockUser('${uid}')">Unblock</button></div>`;
        }
    }
}

// ============ SUGGESTIONS ============
async function loadSuggestions() {
    var me = window.auth?.currentUser; if(!me) return;
    var container = document.getElementById('suggestedUsers');
    if(!container) return;
    var snap = await getDocs(query(collection(db,'users'),limit(6)));
    container.innerHTML = '';
    snap.forEach(doc => {
        if(doc.id===me.uid) return;
        var u = doc.data();
        container.innerHTML += `<div class="settings-item" onclick="window.openUserProfile('${doc.id}')"><img src="${u.avatar||defaultAvatar(u.name)}" width="30" height="30" style="border-radius:50%;"><span>@${u.username}</span></div>`;
    });
}

// ============ DELETE ACCOUNT ============
function confirmDeleteAccount() {
    showModal('⚠️ Delete Account', `
        <p style="color:#ff4757;text-align:center;">This action cannot be undone!</p>
        <input id="delEmail" class="glass-input" placeholder="Your email">
        <input id="delPass" class="glass-input" type="password" placeholder="Your password">
        <button class="btn-glow btn-full" style="background:rgba(255,71,87,0.2);border-color:#ff4757;color:#ff4757;" onclick="window.deleteAccount()">🗑️ Permanently Delete</button>
    `);
}

async function deleteAccount() {
    var email = document.getElementById('delEmail')?.value, pass = document.getElementById('delPass')?.value;
    if(!email||!pass){showToast('Fill all fields','error');return;}
    try {
        var cred = EmailAuthProvider.credential(email, pass);
        await reauthenticateWithCredential(window.auth.currentUser, cred);
        var uid = window.auth.currentUser.uid;
        await deleteDoc(doc(db,'users',uid));
        var chats = await getDocs(query(collection(db,'chats'),where('participants','array-contains',uid)));
        chats.forEach(async c => await deleteDoc(doc(db,'chats',c.id)));
        await deleteUser(window.auth.currentUser);
        showToast('Account deleted','info');
    } catch(e) { showToast(e.message,'error'); }
}

// ============ LOGOUT ============
function confirmLogout() {
    showModal('🚪 Logout?', `
        <p style="text-align:center;">Are you sure you want to logout?</p>
        <div style="display:flex;gap:0.5rem;margin-top:1rem;">
            <button class="btn-gold" style="flex:1;" onclick="closeModal()">Cancel</button>
            <button class="btn-glow" style="flex:1;" onclick="closeModal();window.logout();">Logout</button>
        </div>
    `);
}

// ============ MODAL HELPERS ============
function showModal(title, body) {
    closeModal();
    var m = document.createElement('div'); m.id='globalModal'; m.className='glass-panel modal-popup';
    m.innerHTML = `<h3 class="neon-text">${title}</h3><div class="modal-body">${body}</div><button class="btn-gold btn-full" style="margin-top:0.5rem;" onclick="closeModal()">Close</button>`;
    document.body.appendChild(m);
}

function showModalFull(body) {
    closeModal();
    var m = document.createElement('div'); m.id='globalModal'; m.className='modal-fullscreen';
    m.innerHTML = body;
    document.body.appendChild(m);
}

function closeModal() { var m = document.getElementById('globalModal'); if(m) m.remove(); }

// ============ FOLLOW LIST ============
async function showFollowList(type, uid) {
    var snap = await getDoc(doc(db,'users',uid));
    if(!snap.exists()) return;
    var list = type==='followers'?(snap.data().followers||[]):(snap.data().following||[]);
    if(!list.length){showToast('No '+type,'info');return;}
    var h = '<div class="follow-list">';
    for(var i=0;i<Math.min(list.length,20);i++) {
        var u = await getDoc(doc(db,'users',list[i]));
        if(u.exists()) h += `<div class="follow-item" onclick="closeModal();window.openUserProfile('${list[i]}')"><img src="${u.data().avatar||defaultAvatar(u.data().name)}" width="35" height="35" style="border-radius:50%;"><div><strong>${u.data().name}</strong><p>@${u.data().username}</p></div></div>`;
    }
    h += '</div>';
    showModal(type==='followers'?'👥 Followers':'🫂 Following', h);
}

async function blockUser(uid) { if(!confirm('Block?')) return; await updateDoc(doc(db,'users',window.auth.currentUser.uid),{blockedUsers:arrayUnion(uid)}); showToast('Blocked','info'); }
async function reportUser(uid) { var r = prompt('Reason:'); if(!r) return; var {addDoc} = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"); await addDoc(collection(db,'reports'),{reportedUser:uid,reportedBy:window.auth.currentUser.uid,reason:r,timestamp:new Date()}); showToast('Reported','success'); }
async function togglePrivacy() { var v = document.querySelector('#privateAccount')?.checked||false; await updateDoc(doc(db,'users',window.auth.currentUser.uid),{isPrivate:v}); window.currentUserData = {...window.currentUserData,isPrivate:v}; }
async function toggleStatus() { var v = document.querySelector('#hideStatus')?.checked||false; await updateDoc(doc(db,'users',window.auth.currentUser.uid),{hideStatus:v}); window.currentUserData = {...window.currentUserData,hideStatus:v}; }

// ============ EXPORTS ============
window.openUserProfile = openUserProfile;
window.renderOwnProfile = renderOwnProfile;
window.openEditProfile = openEditProfile;
window.saveProfile = saveProfile;
window.triggerAvatarUpload = triggerAvatarUpload;
window.openShop = openShop;
window.buyItem = buyItem;
window.openSettingsPage = openSettingsPage;
window.openChangePassword = openChangePassword;
window.changePassword = changePassword;
window.confirmLogout = confirmLogout;
window.confirmDeleteAccount = confirmDeleteAccount;
window.deleteAccount = deleteAccount;
window.loadBlockedUsers = loadBlockedUsers;
window.searchBlockedUsers = searchBlockedUsers;
window.unblockUser = unblockUser;
window.blockUser = blockUser;
window.reportUser = reportUser;
window.showFollowList = showFollowList;
window.togglePrivacy = togglePrivacy;
window.toggleStatus = toggleStatus;
window.showAchievementDetail = showAchievementDetail;
window.closeModal = closeModal;

export { openUserProfile, renderOwnProfile };
