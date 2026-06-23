var chatId = null;
var chatUser = null;
var chatListener = null;

function renderChats(c) {
    c.innerHTML = '<h2 style="color:#D4AF37;margin-bottom:10px">💬 Messages</h2><div id="chatListContainer"></div>';
    loadChatList();
}

function loadChatList() {
    var container = document.getElementById('chatListContainer');
    if (!container) return;
    
    var mutualIds = (currentUserData.following || []).filter(function(id) {
        return (currentUserData.followers || []).indexOf(id) !== -1;
    });
    
    if (mutualIds.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No chats yet. Follow someone mutual!</p>';
        return;
    }
    
    container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:20px">Loading...</p>';
    var html = '';
    var loaded = 0;
    
    mutualIds.forEach(function(uid) {
        db.collection('users').doc(uid).get().then(function(doc) {
            loaded++;
            var u = doc.data();
            if (!u) return;
            var isOnline = u.onlineStatus === 'online';
            var cid = [currentUser.uid, uid].sort().join('_');
            
            html += '<div class="chat-item" onclick="openChat(\'' + cid + '\',\'' + uid + '\',\'' + u.name + '\',\'' + (u.avatar||'') + '\')" style="display:flex;align-items:center;padding:14px;background:rgba(19,24,66,0.7);border:1px solid rgba(212,175,55,0.15);border-radius:14px;cursor:pointer;gap:12px;margin-bottom:6px">' +
                '<div style="position:relative;flex-shrink:0">' +
                    '<img src="' + (u.avatar || getDefaultAvatar(u.name)) + '" style="width:52px;height:52px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover" onerror="this.src=\'' + getDefaultAvatar(u.name) + '\'">' +
                    '<span style="position:absolute;bottom:2px;right:2px;width:13px;height:13px;background:' + (isOnline?'#2ED573':'#888') + ';border-radius:50%;border:2px solid #0A0E27"></span>' +
                '</div>' +
                '<div style="flex:1"><b>' + u.name + '</b><br><small style="color:rgba(255,255,255,0.5)">Tap to chat</small></div>' +
                '<small style="color:' + (isOnline?'#2ED573':'rgba(255,255,255,0.5)') + ';font-size:11px">' + (isOnline?'● Online':'Offline') + '</small>' +
            '</div>';
            
            if (loaded === mutualIds.length) container.innerHTML = html;
        });
    });
}

function openChat(cid, uid, name, avt) {
    chatId = cid;
    chatUser = { uid: uid, name: name, avt: avt };
    
    document.getElementById('chatWindow').style.display = 'flex';
    document.getElementById('chatNameText').textContent = name;
    document.getElementById('chatAvatarImg').src = avt || getDefaultAvatar(name);
    document.getElementById('chatAvatarImg').onerror = function() { this.src = getDefaultAvatar(name); };
    document.getElementById('chatMessagesList').innerHTML = '';
    document.getElementById('chatMsgInput').value = '';
    
    db.collection('users').doc(uid).get().then(function(doc) {
        var u = doc.data();
        var el = document.getElementById('chatStatusText');
        if (u && u.onlineStatus === 'online') { el.textContent = '● Active now'; el.style.color = '#2ED573'; }
        else { el.textContent = 'Offline'; el.style.color = '#888'; }
    });
    
    if (chatListener) chatListener();
    chatListener = db.collection('chats').doc(cid).collection('messages').orderBy('timestamp','asc').onSnapshot(function(snap) {
        var mc = document.getElementById('chatMessagesList');
        if (!mc) return;
        mc.innerHTML = '';
        snap.forEach(function(doc) {
            var m = doc.data();
            var sent = m.senderId === currentUser.uid;
            mc.innerHTML += '<div style="align-self:'+(sent?'flex-end':'flex-start')+';background:'+(sent?'linear-gradient(135deg,#D4AF37,#00D4FF)':'rgba(19,24,66,0.8)')+';color:'+(sent?'#0A0E27':'#fff')+';padding:10px 16px;border-radius:'+(sent?'20px 20px 4px 20px':'20px 20px 20px 4px')+';max-width:75%;font-size:14px">'+m.text+'<div style="margin-top:3px;font-size:10px;opacity:0.7">'+(m.timestamp?formatTime(m.timestamp.toDate()):'')+(sent?' · '+(m.seen?'✓✓':'✓'):'')+'</div></div>';
        });
        mc.scrollTop = mc.scrollHeight;
    });
}

function closeChat() {
    document.getElementById('chatWindow').style.display = 'none';
    if (chatListener) chatListener();
    chatListener = null;
}

function sendMessage() {
    var input = document.getElementById('chatMsgInput');
    if (!input) return;
    var t = input.value.trim();
    if (!t || !chatId || !chatUser) return;
    
    var ref = db.collection('chats').doc(chatId);
    ref.get().then(function(doc) {
        if (!doc.exists) {
            ref.set({ participants: [currentUser.uid, chatUser.uid], lastMessage: t, lastMessageTime: firebase.firestore.FieldValue.serverTimestamp() });
        }
        ref.collection('messages').add({ senderId: currentUser.uid, text: t, timestamp: firebase.firestore.FieldValue.serverTimestamp(), seen: false });
        ref.update({ lastMessage: t, lastMessageTime: firebase.firestore.FieldValue.serverTimestamp() });
    });
    input.value = '';
}

function getDefaultAvatar(name) {
    var l = (name||'U')[0].toUpperCase();
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%231a1f4e" width="100" height="100"/><text x="50" y="62" text-anchor="middle" fill="%23D4AF37" font-size="45">'+l+'</text></svg>');
}
