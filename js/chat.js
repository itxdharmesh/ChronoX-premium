var chatId = null;
var chatUser = null;
var chatListener = null;

function renderChats(c) {
    c.innerHTML = 
        '<h2 style="color:#D4AF37;margin-bottom:10px">💬 Messages</h2>' +
        '<div id="chatListContainer"></div>';
    loadChatList();
}

function loadChatList() {
    var container = document.getElementById('chatListContainer');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:20px">Loading...</p>';
    
    var html = '';
    
    // GET MUTUAL FRIENDS (Both follow each other)
    var mutualIds = (currentUserData.following || []).filter(function(id) {
        return (currentUserData.followers || []).indexOf(id) !== -1;
    });
    
    if (mutualIds.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No chats yet.<br>Follow someone and ask them to follow back!</p>';
        return;
    }
    
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
                    '<img src="' + dp + '" style="width:52px;height:52px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover" onerror="this.style.display=\'none\'">' +
                    '<span style="position:absolute;bottom:2px;right:2px;width:13px;height:13px;background:' + (isOnline?'#2ED573':'#888') + ';border-radius:50%;border:2px solid #0A0E27"></span>' +
                '</div>' +
                '<div style="flex:1;min-width:0">' +
                    '<b>' + u.name + '</b><br>' +
                    '<small style="color:rgba(255,255,255,0.5);display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Tap to chat</small>' +
                '</div>' +
                '<div style="text-align:right;flex-shrink:0">' +
                    '<small style="color:' + (isOnline?'#2ED573':'rgba(255,255,255,0.5)') + ';font-size:11px">' + (isOnline?'● Online':'Offline') + '</small>' +
                '</div>' +
            '</div>';
            
            if (loaded === mutualIds.length) {
                container.innerHTML = html;
            }
        });
    });
}

function openChatWindow(cid, uid, name, avt) {
    chatId = cid;
    chatUser = { uid: uid, name: name, avt: avt };
    
    var chatWin = document.getElementById('chatWindow');
    if (!chatWin) {
        chatWin = document.createElement('div');
        chatWin.id = 'chatWindow';
        chatWin.className = 'chat-window';
        chatWin.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#0A0E27;z-index:500;display:flex;flex-direction:column';
        chatWin.innerHTML = 
            '<div style="display:flex;align-items:center;padding:15px;background:rgba(19,24,66,0.9);border-bottom:1px solid rgba(212,175,55,0.2);gap:12px">' +
                '<button id="chatBackBtn" style="background:none;border:none;color:#D4AF37;font-size:24px;cursor:pointer;padding:5px">←</button>' +
                '<img id="chatAvatarImg" src="" style="width:40px;height:40px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover">' +
                '<div style="flex:1"><div style="font-weight:600" id="chatNameText"></div><div style="font-size:11px" id="chatStatusText"></div></div>' +
            '</div>' +
            '<div id="chatMessagesList" style="flex:1;overflow-y:auto;padding:15px;display:flex;flex-direction:column;gap:8px"></div>' +
            '<div style="display:flex;padding:12px 15px;background:rgba(19,24,66,0.9);border-top:1px solid rgba(212,175,55,0.2);gap:10px;align-items:center">' +
                '<input id="chatMsgInput" placeholder="Type a message..." style="flex:1;padding:12px 18px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:25px;color:#fff;outline:none;font-size:16px" autocomplete="off">' +
                '<button id="chatSendBtn" style="width:44px;height:44px;background:linear-gradient(135deg,#D4AF37,#00D4FF);border:none;border-radius:50%;color:#0A0E27;font-size:20px;cursor:pointer">➤</button>' +
            '</div>';
        document.body.appendChild(chatWin);
        
        document.getElementById('chatBackBtn').addEventListener('click', closeChat);
        document.getElementById('chatSendBtn').addEventListener('click', sendMessage);
        document.getElementById('chatMsgInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }
    
    chatWin.style.display = 'flex';
    document.getElementById('chatNameText').textContent = name;
    document.getElementById('chatAvatarImg').src = avt || getDefaultAvatar(name);
    document.getElementById('chatAvatarImg').onerror = function() { this.src = getDefaultAvatar(name); };
    document.getElementById('chatMessagesList').innerHTML = '';
    document.getElementById('chatMsgInput').value = '';
    
    // Update status
    db.collection('users').doc(uid).get().then(function(doc) {
        var u = doc.data();
        var statusEl = document.getElementById('chatStatusText');
        if (u && u.onlineStatus === 'online') {
            statusEl.textContent = '● Active now';
            statusEl.style.color = '#2ED573';
        } else {
            statusEl.textContent = 'Offline';
            statusEl.style.color = '#888';
        }
    });
    
    // Load messages
    if (chatListener) chatListener();
    chatListener = db.collection('chats').doc(cid).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(function(snap) {
            var msgContainer = document.getElementById('chatMessagesList');
            if (!msgContainer) return;
            msgContainer.innerHTML = '';
            snap.forEach(function(doc) {
                var m = doc.data();
                var isSent = m.senderId === currentUser.uid;
                msgContainer.innerHTML += '<div style="align-self:' + (isSent?'flex-end':'flex-start') + ';background:' + (isSent?'linear-gradient(135deg,#D4AF37,#00D4FF)':'rgba(19,24,66,0.8)') + ';color:' + (isSent?'#0A0E27':'#fff') + ';padding:10px 16px;border-radius:' + (isSent?'20px 20px 4px 20px':'20px 20px 20px 4px') + ';max-width:75%;font-size:14px;word-wrap:break-word">' + m.text + '<div style="margin-top:3px;font-size:10px;opacity:0.7">' + (m.timestamp ? formatTime(m.timestamp.toDate()) : '') + (isSent ? ' · ' + (m.seen ? '✓✓' : '✓') : '') + '</div></div>';
            });
            msgContainer.scrollTop = msgContainer.scrollHeight;
        });
    
    // Mark as seen
    db.collection('chats').doc(cid).collection('messages')
        .where('senderId', '==', uid)
        .where('seen', '==', false)
        .get().then(function(snap) {
            snap.forEach(function(doc) { doc.ref.update({ seen: true }); });
        });
}

function closeChat() {
    var chatWin = document.getElementById('chatWindow');
    if (chatWin) chatWin.style.display = 'none';
    if (chatListener) chatListener();
    chatListener = null;
    chatId = null;
    chatUser = null;
}

function sendMessage() {
    var input = document.getElementById('chatMsgInput');
    if (!input) return;
    var text = input.value.trim();
    if (!text || !chatId || !chatUser) return;
    
    var ref = db.collection('chats').doc(chatId);
    ref.get().then(function(doc) {
        if (!doc.exists) {
            ref.set({
                participants: [currentUser.uid, chatUser.uid],
                lastMessage: text,
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        ref.collection('messages').add({
            senderId: currentUser.uid,
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            seen: false
        });
        ref.update({
            lastMessage: text,
            lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
        });
    });
    
    input.value = '';
    input.focus();
}

function getDefaultAvatar(name) {
    var letter = (name || 'U')[0].toUpperCase();
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%231a1f4e" width="100" height="100"/><text x="50" y="62" text-anchor="middle" fill="%23D4AF37" font-size="45" font-family="Arial">' + letter + '</text></svg>');
                         }
