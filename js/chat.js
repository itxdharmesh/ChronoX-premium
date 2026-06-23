function renderChats(c) {
    c.innerHTML = '<h2 style="color:#D4AF37;margin-bottom:15px">💬 Messages</h2><div id="clist"></div>';
    var container = document.getElementById('clist');
    if (!container) return;
    
    var mutualIds = (currentUserData.following || []).filter(function(id) {
        return (currentUserData.followers || []).indexOf(id) !== -1;
    });
    
    if (mutualIds.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No chats yet.<br>Follow someone and ask them to follow back!</p>';
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
            var dp = u.avatar || getDefaultAvatar(u.name);
            var cid = [currentUser.uid, uid].sort().join('_');
            
            html += '<div class="chat-item" onclick="openChatWindow(\'' + cid + '\',\'' + uid + '\',\'' + u.name + '\',\'' + (u.avatar||'') + '\')">' +
                '<div style="position:relative;flex-shrink:0">' +
                    '<img src="' + dp + '" style="width:52px;height:52px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover;background:#1a1f4e" onerror="this.src=\'' + getDefaultAvatar(u.name) + '\'">' +
                    '<span style="position:absolute;bottom:2px;right:2px;width:13px;height:13px;background:' + (isOnline?'#2ED573':'#888') + ';border-radius:50%;border:2px solid #0A0E27"></span>' +
                '</div>' +
                '<div style="flex:1;min-width:0"><b>' + u.name + '</b><br><small style="color:rgba(255,255,255,0.5)">Tap to chat</small></div>' +
                '<small style="color:' + (isOnline?'#2ED573':'#888') + ';font-size:11px">' + (isOnline?'● Online':'Offline') + '</small>' +
            '</div>';
            
            if (loaded === mutualIds.length) container.innerHTML = html;
        });
    });
}

var chatId = null, chatUser = null, chatListener = null;

function openChatWindow(cid, uid, name, avt) {
    chatId = cid; chatUser = { uid: uid, name: name, avt: avt };
    
    var win = document.getElementById('chatWindow');
    if (!win) {
        win = document.createElement('div');
        win.id = 'chatWindow';
        win.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#0A0E27;z-index:500;display:none;flex-direction:column';
        win.innerHTML = 
            '<div style="display:flex;align-items:center;padding:15px;background:rgba(19,24,66,0.9);border-bottom:1px solid rgba(212,175,55,0.2);gap:12px">' +
                '<button id="chatBackBtn" style="background:none;border:none;color:#D4AF37;font-size:24px;cursor:pointer;padding:5px">←</button>' +
                '<img id="chatAvImg" src="" style="width:40px;height:40px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover;background:#1a1f4e">' +
                '<div style="flex:1"><div style="font-weight:600" id="chatNm"></div><div style="font-size:11px" id="chatSt"></div></div>' +
            '</div>' +
            '<div id="chatMsgs" style="flex:1;overflow-y:auto;padding:15px;display:flex;flex-direction:column;gap:8px"></div>' +
            '<div style="display:flex;padding:12px 15px;background:rgba(19,24,66,0.9);border-top:1px solid rgba(212,175,55,0.2);gap:10px;align-items:center">' +
                '<input id="chatInput" placeholder="Type a message..." style="flex:1;padding:12px 18px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:25px;color:#fff;outline:none;font-size:16px" autocomplete="off">' +
                '<button id="chatSendBtn" style="width:44px;height:44px;background:linear-gradient(135deg,#D4AF37,#00D4FF);border:none;border-radius:50%;color:#0A0E27;font-size:20px;cursor:pointer">➤</button>' +
            '</div>';
        document.body.appendChild(win);
        
        document.getElementById('chatBackBtn').onclick = closeChatWindow;
        document.getElementById('chatSendBtn').onclick = sendChatMessage;
        document.getElementById('chatInput').onkeydown = function(e) { if (e.key === 'Enter') sendChatMessage(); };
    }
    
    win.style.display = 'flex';
    document.getElementById('chatNm').textContent = name;
    document.getElementById('chatAvImg').src = avt || getDefaultAvatar(name);
    document.getElementById('chatAvImg').onerror = function() { this.src = getDefaultAvatar(name); };
    document.getElementById('chatSt').textContent = 'Loading...';
    document.getElementById('chatMsgs').innerHTML = '';
    document.getElementById('chatInput').value = '';
    document.getElementById('chatInput').focus();
    
    db.collection('users').doc(uid).get().then(function(doc) {
        var u = doc.data();
        var el = document.getElementById('chatSt');
        if (u && u.onlineStatus === 'online') { el.textContent = '● Active now'; el.style.color = '#2ED573'; }
        else { el.textContent = 'Offline'; el.style.color = '#888'; }
    });
    
    if (chatListener) chatListener();
    chatListener = db.collection('chats').doc(cid).collection('messages').orderBy('timestamp','asc').onSnapshot(function(snap) {
        var mc = document.getElementById('chatMsgs'); if (!mc) return; mc.innerHTML = '';
        snap.forEach(function(doc) {
            var m = doc.data();
            mc.innerHTML += '<div style="align-self:' + (m.senderId === currentUser.uid ? 'flex-end' : 'flex-start') + ';background:' + (m.senderId === currentUser.uid ? 'linear-gradient(135deg,#D4AF37,#00D4FF)' : 'rgba(19,24,66,0.8)') + ';color:' + (m.senderId === currentUser.uid ? '#0A0E27' : '#fff') + ';padding:10px 16px;border-radius:18px;max-width:75%;font-size:14px">' + m.text + '</div>';
        });
        mc.scrollTop = mc.scrollHeight;
    });
}

function closeChatWindow() {
    document.getElementById('chatWindow').style.display = 'none';
    if (chatListener) chatListener();
    chatListener = null; chatId = null; chatUser = null;
}

function sendChatMessage() {
    var input = document.getElementById('chatInput');
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
    input.focus();
}

function getDefaultAvatar(name) {
    var l = (name || 'U')[0].toUpperCase();
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%231a1f4e" width="100" height="100"/><text x="50" y="62" text-anchor="middle" fill="%23D4AF37" font-size="45">' + l + '</text></svg>');
}
