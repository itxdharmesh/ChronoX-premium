var chatId = null, chatUser = null, chatListener = null;

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
    var html = '', loaded = 0;
    
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

function openChatWindow(cid, uid, name, avt) {
    chatId = cid; chatUser = { uid: uid, name: name, avt: avt };
    
    var win = document.getElementById('chatWindow');
    win.style.display = 'flex';
    document.getElementById('chatNm').textContent = name;
    document.getElementById('chatAvImg').src = avt || getDefaultAvatar(name);
    document.getElementById('chatAvImg').onerror = function() { this.src = getDefaultAvatar(name); };
    document.getElementById('chatMsgs').innerHTML = '';
    document.getElementById('chatInput').value = '';
    
    document.getElementById('chatSt').textContent = 'Loading...';
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

function attachMedia() {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = function() {
        var f = inp.files[0];
        if (!f || !chatId) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            db.collection('chats').doc(chatId).collection('messages').add({ senderId: currentUser.uid, text: '📷 Photo', mediaUrl: e.target.result, timestamp: firebase.firestore.FieldValue.serverTimestamp(), seen: false });
            db.collection('chats').doc(chatId).update({ lastMessage: '📷 Photo', lastMessageTime: firebase.firestore.FieldValue.serverTimestamp() });
        };
        reader.readAsDataURL(f);
    };
    inp.click();
}

function getDefaultAvatar(name) {
    var l = (name || 'U')[0].toUpperCase();
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%231a1f4e" width="100" height="100"/><text x="50" y="62" text-anchor="middle" fill="%23D4AF37" font-size="45">' + l + '</text></svg>');
}

// BACK BUTTON - FIXED
document.getElementById('chatBackBtn').addEventListener('click', closeChatWindow);
document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
document.getElementById('chatInput').addEventListener('keydown', function(e) { if (e.key === 'Enter') sendChatMessage(); });
