var chatId = null;
var chatUser = null;
var chatListener = null;
var activeTab = 'chats';

function renderChats(c) {
    c.innerHTML = 
        '<h2 style="color:#D4AF37;margin-bottom:10px">💬 Messages</h2>' +
        '<div style="display:flex;gap:5px;margin-bottom:12px">' +
            '<button id="tabChats" class="btn-out" style="flex:1;background:rgba(212,175,55,0.2)" onclick="switchTab(\'chats\')">💬 Chats</button>' +
            '<button id="tabRequests" class="btn-out" style="flex:1" onclick="switchTab(\'requests\')">📩 Requests</button>' +
        '</div>' +
        '<div id="chatListContainer" style="display:flex;flex-direction:column;gap:6px"></div>';
    loadChatList();
}

function switchTab(tab) {
    activeTab = tab;
    document.getElementById('tabChats').style.background = tab==='chats'?'rgba(212,175,55,0.2)':'';
    document.getElementById('tabRequests').style.background = tab==='requests'?'rgba(212,175,55,0.2)':'';
    loadChatList();
}

function loadChatList() {
    var container = document.getElementById('chatListContainer');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:20px">Loading...</p>';
    
    if (activeTab === 'requests') {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No pending requests</p>';
        return;
    }
    
    // GET USERS I FOLLOW - Unki chat dikhao
    var followingIds = currentUserData.following || [];
    var mutualIds = followingIds.filter(function(id) {
        return (currentUserData.followers || []).indexOf(id) !== -1;
    });
    
    // Also get users from existing chats
    db.collection('chats')
        .where('participants', 'array-contains', currentUser.uid)
        .get()
        .then(function(snap) {
            var chatUsers = {};
            
            // Pehle existing chats se users lo
            snap.forEach(function(doc) {
                var chat = doc.data();
                var otherId = chat.participants.find(function(id) { return id !== currentUser.uid; });
                if (otherId && !['annaya_ai','tarun_ai','chronox_ai'].includes(otherId)) {
                    chatUsers[otherId] = { chatId: doc.id, lastMsg: chat.lastMessage || '', time: chat.lastMessageTime };
                }
            });
            
            // Add mutual followers who don't have chat yet
            mutualIds.forEach(function(id) {
                if (!chatUsers[id]) {
                    chatUsers[id] = { chatId: null, lastMsg: '', time: null };
                }
            });
            
            // Also add users I follow
            followingIds.forEach(function(id) {
                if (!chatUsers[id]) {
                    chatUsers[id] = { chatId: null, lastMsg: '', time: null };
                }
            });
            
            var userIds = Object.keys(chatUsers);
            
            if (userIds.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">Follow someone to start chatting!</p>';
                return;
            }
            
            // Fetch all user data
            var promises = userIds.map(function(uid) {
                return db.collection('users').doc(uid).get().then(function(ud) {
                    var u = ud.data();
                    if (!u) return null;
                    if ((currentUserData.blockedUsers||[]).indexOf(uid) !== -1) return null;
                    if ((u.blockedUsers||[]).indexOf(currentUser.uid) !== -1) return null;
                    
                    var info = chatUsers[uid];
                    var isOnline = u.onlineStatus === 'online';
                    var statusText = isOnline ? '● Online' : getLastSeenText(u.lastSeen ? u.lastSeen.toDate() : null);
                    var statusColor = isOnline ? '#2ED573' : '#888';
                    
                    return {
                        uid: uid,
                        chatId: info.chatId || ('new_' + [currentUser.uid, uid].sort().join('_')),
                        name: u.name,
                        avatar: u.avatar || '',
                        lastMsg: info.lastMsg || 'Tap to chat',
                        time: info.time ? formatTime(info.time.toDate()) : '',
                        isOnline: isOnline,
                        statusText: statusText,
                        statusColor: statusColor
                    };
                });
            });
            
            Promise.all(promises).then(function(results) {
                var users = results.filter(function(r) { return r !== null; });
                
                if (users.length === 0) {
                    container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No chats available</p>';
                    return;
                }
                
                // Sort: online first, then by name
                users.sort(function(a, b) {
                    if (a.isOnline && !b.isOnline) return -1;
                    if (!a.isOnline && b.isOnline) return 1;
                    return a.name.localeCompare(b.name);
                });
                
                var html = '';
                users.forEach(function(u) {
                    html += '<div class="chat-item" onclick="openChatWindow(\'' + u.chatId + '\',\'' + u.uid + '\',\'' + u.name + '\',\'' + u.avatar + '\',false)" style="display:flex;align-items:center;padding:14px;background:rgba(19,24,66,0.7);border:1px solid rgba(212,175,55,0.15);border-radius:14px;cursor:pointer;gap:12px;margin-bottom:6px">';
                    
                    // Avatar
                    html += '<div style="position:relative;flex-shrink:0">';
                    html += '<img src="' + (u.avatar || defaultAvatar(u.name)) + '" style="width:52px;height:52px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover" onerror="this.src=\'' + defaultAvatar(u.name) + '\'">';
                    html += '<span style="position:absolute;bottom:2px;right:2px;width:12px;height:12px;background:' + u.statusColor + ';border-radius:50%;border:2px solid #0A0E27"></span>';
                    html += '</div>';
                    
                    // Info
                    html += '<div style="flex:1;min-width:0">';
                    html += '<b>' + u.name + '</b><br>';
                    html += '<small style="color:rgba(255,255,255,0.5);display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + u.lastMsg + '</small>';
                    html += '</div>';
                    
                    // Meta
                    html += '<div style="text-align:right;flex-shrink:0">';
                    html += '<small style="color:' + u.statusColor + ';font-size:11px">' + u.statusText + '</small><br>';
                    html += '<small style="color:#D4AF37;font-size:10px">' + u.time + '</small>';
                    html += '</div>';
                    
                    html += '</div>';
                });
                
                container.innerHTML = html;
            });
        });
}

// Baaki functions
function openChatWindow(cid, uid, name, avt, ai) {
    chatId = cid; chatUser = { uid: uid, name: name, avt: avt, ai: ai || false };
    document.getElementById('chatWindow').classList.add('show');
    document.getElementById('chatName').textContent = name;
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('msgInput').value = '';
    document.getElementById('typingIndicator').textContent = '';
    setTimeout(function() { document.getElementById('msgInput').focus(); }, 300);
    
    var ai2 = document.getElementById('chatAvatar'), ae = document.getElementById('chatAvatarEmoji');
    if (ai) { ai2.style.display='none'; ae.style.display='inline'; ae.textContent=avt; document.getElementById('chatStatus').textContent='● Active now'; document.getElementById('chatStatus').style.color='#2ED573'; }
    else { ae.style.display='none'; ai2.style.display='inline'; ai2.src=avt||defaultAvatar(name); document.getElementById('chatStatus').textContent='Loading...'; }
    if (chatListener) chatListener();
    
    chatListener = db.collection('chats').doc(cid).collection('messages').orderBy('timestamp','asc').onSnapshot(function(snap) {
        var mc = document.getElementById('chatMessages'); if (!mc) return; mc.innerHTML = '';
        snap.forEach(function(doc) {
            var m = doc.data(), sent = m.senderId === currentUser.uid;
            mc.innerHTML += '<div class="' + (sent?'msg-sent':'msg-rec') + '">' + m.text + '<div style="margin-top:3px"><small style="opacity:0.7;font-size:10px">'+(m.timestamp?formatTime(m.timestamp.toDate()):'')+'</small>'+(sent?'<small style="font-size:10px;color:rgba(255,255,255,0.4);margin-left:8px">'+(m.seen?'✓✓ Seen':'✓ Sent')+'</small>':'')+'</div></div>';
        });
        mc.scrollTop = mc.scrollHeight;
    });
}

function closeChat() { document.getElementById('chatWindow').classList.remove('show'); if(chatListener)chatListener(); chatListener=null; chatId=null; chatUser=null; }

function sendMessage() {
    var input = document.getElementById('msgInput'); if (!input) return;
    var t = input.value.trim(); if (!t || !chatId || !chatUser) return;
    
    // If new chat, create it
    if (chatId.startsWith('new_')) {
        var newRef = db.collection('chats').doc();
        newRef.set({participants:[currentUser.uid, chatUser.uid], lastMessage: t, lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()}).then(function() {
            chatId = newRef.id;
            db.collection('chats').doc(chatId).collection('messages').add({senderId:currentUser.uid, text:t, timestamp:firebase.firestore.FieldValue.serverTimestamp(), seen:false});
            input.value=''; input.focus();
        });
        return;
    }
    
    db.collection('chats').doc(chatId).collection('messages').add({senderId:currentUser.uid, text:t, timestamp:firebase.firestore.FieldValue.serverTimestamp(), seen:false});
    db.collection('chats').doc(chatId).set({participants:[currentUser.uid, chatUser.uid], lastMessage:t, lastMessageTime:firebase.firestore.FieldValue.serverTimestamp()}, {merge:true});
    input.value=''; input.focus();
}

function getLastSeenText(ls) { if(!ls)return'Offline';var d=Date.now()-ls,m=Math.floor(d/60000),h=Math.floor(d/3600000);if(m<1)return'Just now';if(m<60)return m+'m ago';if(h<24)return h+'h ago';return ls.toLocaleDateString('en-IN',{day:'numeric',month:'short'}); }
function attachMedia() { var inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=function(){var f=inp.files[0];if(!f||!chatId)return;var r=new FileReader();r.onload=function(e){db.collection('chats').doc(chatId).collection('messages').add({senderId:currentUser.uid,text:'📷 Photo',mediaUrl:e.target.result,timestamp:firebase.firestore.FieldValue.serverTimestamp(),seen:false});};r.readAsDataURL(f);};inp.click(); }
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){var w=document.getElementById('chatWindow');if(w&&w.classList.contains('show')){e.preventDefault();sendMessage();}}});
document.addEventListener('click',function(e){if(e.target.classList.contains('modal'))e.target.classList.remove('show');});
console.log('✅ Chat loaded - Real Users Only');
