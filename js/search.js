function renderSearch(c) {
    c.innerHTML = '<h2 style="color:var(--gold);margin-bottom:15px">🔍 Discover People</h2><input class="inp" id="sinput" placeholder="Search by name or username..." onkeyup="searchUsers(this.value)" style="margin-bottom:12px"><div id="sresults"><p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">Type to search...</p></div>';
}

function searchUsers(q) {
    var c = document.getElementById('sresults');
    if (!c || !q || q.length < 1) { if (c) c.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">Type to search...</p>'; return; }
    
    db.collection('users').where('username','>=','@'+q).where('username','<=','@'+q+'\uf8ff').limit(20).get().then(function(snap) {
        var users = [];
        snap.forEach(function(doc) { if (doc.id !== currentUser.uid) users.push({ id: doc.id, data: doc.data() }); });
        
        db.collection('users').where('name','>=',q).where('name','<=',q+'\uf8ff').limit(20).get().then(function(snap2) {
            snap2.forEach(function(doc) { if (doc.id !== currentUser.uid && !users.find(function(u){return u.id===doc.id;})) users.push({ id: doc.id, data: doc.data() }); });
            
            if (users.length === 0) { c.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No users found</p>'; return; }
            
            if (q.length >= 2) {
                var recent = currentUserData.recentSearches || [];
                recent = [q].concat(recent.filter(function(s){return s!==q;})).slice(0,5);
                db.collection('users').doc(currentUser.uid).update({recentSearches:recent});
                if (currentUserData) currentUserData.recentSearches = recent;
            }
            
            var h = '';
            users.forEach(function(u) {
                var ud = u.data;
                var isFollowing = (ud.followers||[]).indexOf(currentUser.uid) !== -1;
                var isBlocked = (currentUserData.blockedUsers||[]).indexOf(u.id) !== -1;
                var blockedByThem = (ud.blockedUsers||[]).indexOf(currentUser.uid) !== -1;
                
                if (isBlocked) {
                    h += '<div class="chat-item"><div class="av" style="width:48px;height:48px;font-size:20px">🚫</div><div style="flex:1"><b>Blocked User</b><br><small style="color:var(--gold-light)">'+ud.username+'</small></div><button class="btn-out" style="width:auto;padding:6px 12px;font-size:11px" onclick="unblockThisUser(\''+u.id+'\')">Unblock</button></div>';
                } else if (blockedByThem) {
                    h += '<div class="chat-item"><img src="'+(ud.avatar||defaultAvatar(ud.name))+'" class="chat-avatar-img" style="width:48px;height:48px" onerror="this.src=\''+defaultAvatar(ud.name)+'\'"><div style="flex:1"><b>'+ud.name+'</b><br><small style="color:var(--gold-light)">'+ud.username+'</small></div><small style="color:rgba(255,255,255,0.4)">Cannot interact</small></div>';
                } else {
                    h += '<div class="chat-item" onclick="viewUserProfile(\''+u.id+'\')"><img src="'+(ud.avatar||defaultAvatar(ud.name))+'" class="chat-avatar-img" style="width:48px;height:48px" onerror="this.src=\''+defaultAvatar(ud.name)+'\'"><div style="flex:1"><b>'+ud.name+'</b><br><small style="color:var(--gold-light)">'+ud.username+'</small></div>'+(isFollowing?'<button class="btn-out" style="width:auto;padding:8px 14px;font-size:11px" onclick="event.stopPropagation();startChatUser(\''+u.id+'\')">Chat</button>':'<button class="btn" style="width:auto;padding:8px 14px;font-size:11px" onclick="event.stopPropagation();followUser(\''+u.id+'\',this)">Follow</button>')+'</div>';
                }
            });
            c.innerHTML = h;
        });
    });
}

function followUser(uid, btn) {
    db.collection('users').doc(currentUser.uid).update({following:firebase.firestore.FieldValue.arrayUnion(uid)});
    db.collection('users').doc(uid).update({followers:firebase.firestore.FieldValue.arrayUnion(currentUser.uid)});
    btn.textContent='Chat';btn.className='btn-out';btn.style.width='auto';btn.style.padding='8px 14px';btn.style.fontSize='11px';btn.onclick=function(e){e.stopPropagation();startChatUser(uid);};
    db.collection('users').doc(currentUser.uid).get().then(function(doc){currentUserData=doc.data();});
    db.collection('notifications').add({to:uid,from:currentUser.uid,fromName:currentUserData.name,type:'follow',read:false,timestamp:firebase.firestore.FieldValue.serverTimestamp()});
    showToast('Followed! ✅');
}

function startChatUser(uid) {
    if ((currentUserData.blockedUsers||[]).indexOf(uid) !== -1) return showToast('You blocked this user','error');
    db.collection('chats').where('participants','array-contains',currentUser.uid).get().then(function(snap) {
        var ec = null;
        snap.forEach(function(doc) { if (doc.data().participants.indexOf(uid) !== -1) ec = doc.id; });
        db.collection('users').doc(uid).get().then(function(ud) {
            var u = ud.data(); if (!u) return showToast('User not found','error');
            if (ec) { openChatWindow(ec, uid, u.name, u.avatar, false); }
            else {
                var ref = db.collection('chats').doc();
                ref.set({participants:[currentUser.uid,uid],lastMessage:'',lastMessageTime:firebase.firestore.FieldValue.serverTimestamp(),approved:false,messageCount:0}).then(function() { openChatWindow(ref.id, uid, u.name, u.avatar, false); });
            }
        });
    });
}

function viewUserProfile(userId) {
    db.collection('users').doc(userId).get().then(function(doc) {
        var u = doc.data(); if (!u) return showToast('User not found','error');
        openModal('genericModal');
        var isFollowing = (u.followers||[]).indexOf(currentUser.uid) !== -1;
        var isBlocked = (currentUserData.blockedUsers||[]).indexOf(userId) !== -1;
        var blockedByThem = (u.blockedUsers||[]).indexOf(currentUser.uid) !== -1;
        
        if (isBlocked) {
            document.getElementById('genericContent').innerHTML = '<div style="text-align:center;padding:20px"><div class="av" style="width:80px;height:80px;font-size:35px;margin:0 auto">🚫</div><h2 style="color:var(--gold)">Blocked</h2><button class="btn" onclick="unblockThisUser(\''+userId+'\')">✅ Unblock</button><button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button></div>';
            return;
        }
        if (blockedByThem) {
            document.getElementById('genericContent').innerHTML = '<div style="text-align:center;padding:20px"><img src="'+(u.avatar||defaultAvatar(u.name))+'" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--gold)" onerror="this.src=\''+defaultAvatar(u.name)+'\'"><h2 style="color:var(--gold)">'+u.name+'</h2><p>'+u.username+'</p><p style="color:rgba(255,255,255,0.6)">This user blocked you</p><button class="btn-out" onclick="closeModal(\'genericModal\')">Close</button></div>';
            return;
        }
        
        var h = '<div style="text-align:center"><img src="'+(u.avatar||defaultAvatar(u.name))+'" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--gold);object-fit:cover" onerror="this.src=\''+defaultAvatar(u.name)+'\'"><h2 style="color:var(--gold);margin:10px 0">'+u.name+'</h2><p style="color:var(--gold-light)">'+u.username+'</p><p style="color:rgba(255,255,255,0.6);font-size:13px">'+(u.bio||'No bio')+'</p>';
        h += '<div style="display:flex;justify-content:center;gap:25px;margin:15px 0"><div style="text-align:center"><b style="color:var(--gold);font-size:18px">'+(u.followers||[]).length+'</b><br><small>Followers</small></div><div style="text-align:center"><b style="color:var(--gold);font-size:18px">'+(u.following||[]).length+'</b><br><small>Following</small></div></div>';
        h += '<div style="text-align:center;color:var(--gold);margin:10px 0">🏆 '+(u.stats?.achievements||0)+' Achievements</div>';
        h += '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">';
        if (isFollowing) { h += '<button class="btn-out" style="flex:1" onclick="startChatUser(\''+userId+'\');closeModal(\'genericModal\')">💬 Chat</button><button class="btn-out" style="flex:1;color:#FF4757;border-color:#FF4757" onclick="unfollowThisUser(\''+userId+'\')">❌ Unfollow</button>'; }
        else { h += '<button class="btn" style="flex:1" onclick="followThisUser(\''+userId+'\')">👤 Follow</button>'; }
        h += '</div><div style="display:flex;gap:8px;justify-content:center;margin-top:8px"><button class="btn-out" style="flex:1;font-size:11px" onclick="reportUser(\''+userId+'\')">🚩 Report</button><button class="btn-out" style="flex:1;font-size:11px;color:#FF4757;border-color:#FF4757" onclick="blockThisUser(\''+userId+'\')">🚫 Block</button></div>';
        h += '<button class="btn-out" onclick="closeModal(\'genericModal\')" style="margin-top:10px">Close</button></div>';
        document.getElementById('genericContent').innerHTML = h;
    });
}

function followThisUser(uid) { db.collection('users').doc(currentUser.uid).update({following:firebase.firestore.FieldValue.arrayUnion(uid)});db.collection('users').doc(uid).update({followers:firebase.firestore.FieldValue.arrayUnion(currentUser.uid)});showToast('Followed!');closeModal('genericModal'); }
function unfollowThisUser(uid) { db.collection('users').doc(currentUser.uid).update({following:firebase.firestore.FieldValue.arrayRemove(uid)});db.collection('users').doc(uid).update({followers:firebase.firestore.FieldValue.arrayRemove(currentUser.uid)});showToast('Unfollowed');closeModal('genericModal'); }
function blockThisUser(uid) { if(!confirm('Block this user?'))return;db.collection('users').doc(currentUser.uid).update({blockedUsers:firebase.firestore.FieldValue.arrayUnion(uid)});if(!currentUserData.blockedUsers)currentUserData.blockedUsers=[];currentUserData.blockedUsers.push(uid);closeModal('genericModal');showToast('Blocked 🚫'); }
function unblockThisUser(uid) { db.collection('users').doc(currentUser.uid).update({blockedUsers:firebase.firestore.FieldValue.arrayRemove(uid)});currentUserData.blockedUsers=(currentUserData.blockedUsers||[]).filter(function(id){return id!==uid;});showToast('Unblocked ✅'); }
function reportUser(uid) { document.getElementById('genericContent').innerHTML='<h2 style="color:var(--gold);margin-bottom:15px">🚩 Report</h2><button class="btn-out" onclick="submitReport(\''+uid+'\',\'Spam\')">📢 Spam</button><button class="btn-out" onclick="submitReport(\''+uid+'\',\'Harassment\')">😡 Harassment</button><button class="btn-out" onclick="submitReport(\''+uid+'\',\'Other\')">📋 Other</button><button class="btn-out" onclick="closeModal(\'genericModal\')">Cancel</button>'; }
function submitReport(uid,reason) { db.collection('reports').add({reportedUser:uid,reportedBy:currentUser.uid,reason:reason,timestamp:firebase.firestore.FieldValue.serverTimestamp()});closeModal('genericModal');showToast('Reported 🚩'); }

console.log('✅ Search loaded');
