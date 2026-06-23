var chatId = null, chatUser = null, chatListener = null;
var activeTab = 'chats';

function renderChats(c) {
    c.innerHTML = 
        '<h2 style="color:#D4AF37;margin-bottom:10px">💬 Messages</h2>' +
        '<div style="display:flex;gap:5px;margin-bottom:12px">' +
            '<button id="tabChats" class="btn-out" style="flex:1;background:rgba(212,175,55,0.2)" onclick="switchChatTab(\'chats\')">💬 Chats</button>' +
            '<button id="tabRequests" class="btn-out" style="flex:1" onclick="switchChatTab(\'requests\')">📩 Requests</button>' +
        '</div>' +
        '<div id="chatListContainer"></div>';
    loadChatList();
}

function switchChatTab(tab) {
    activeTab = tab;
    document.getElementById('tabChats').style.background = tab === 'chats' ? 'rgba(212,175,55,0.2)' : '';
    document.getElementById('tabRequests').style.background = tab === 'requests' ? 'rgba(212,175,55,0.2)' : '';
    loadChatList();
}

function loadChatList() {
    var container = document.getElementById('chatListContainer');
    if (!container) return;
    
    if (activeTab === 'requests') {
        loadRequests(container);
        return;
    }
    
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
            var dp = u.avatar || defaultAvatar(u.name);
            var cid = [currentUser.uid, uid].sort().join('_');
            
            html += '<div class="chat-item" onclick="openChatWindow(\'' + cid + '\',\'' + uid + '\',\'' + u.name + '\',\'' + (u.avatar||'') + '\')">' +
                '<img src="' + dp + '" style="width:48px;height:48px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover;background:#1a1f4e" onerror="this.src=\'' + defaultAvatar(u.name) + '\'">' +
                '<div style="flex:1"><b>' + u.name + '</b><br><small style="color:rgba(255,255,255,0.5)">Tap to chat</small></div>' +
                '<small style="color:' + (isOnline?'#2ED573':'#888') + '">' + (isOnline?'● Online':'Offline') + '</small>' +
            '</div>';
            
            if (loaded === mutualIds.length) container.innerHTML = html;
        });
    });
}

function loadRequests(container) {
    db.collection('chat_requests').where('to', '==', currentUser.uid).where('status', '==', 'pending').get().then(function(snap) {
        if (snap.empty) {
            container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No pending requests</p>';
            return;
        }
        var html = '';
        snap.forEach(function(doc) {
            var req = doc.data();
            db.collection('users').doc(req.from).get().then(function(ud) {
                var u = ud.data();
                if (!u) return;
                html += '<div class="card" style="padding:15px;margin-bottom:10px">' +
                    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
                        '<img src="' + (u.avatar || defaultAvatar(u.name)) + '" style="width:40px;height:40px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover;background:#1a1f4e">' +
                        '<div><b>' + u.name + '</b><br><small style="color:#D4AF37">' + u.username + '</small></div>' +
                    '</div>' +
                    '<p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:10px">💬 ' + (req.message || 'No message') + '</p>' +
                    '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">' +
                        '<button class="btn" style="font-size:11px;padding:8px" onclick="acceptReq(\'' + doc.id + '\')">✅ Accept</button>' +
                        '<button class="btn-out" style="font-size:11px;padding:8px;color:#FF4757;border-color:#FF4757" onclick="rejectReq(\'' + doc.id + '\')">❌ Reject</button>' +
                    '</div>' +
                '</div>';
                container.innerHTML = html;
            });
        });
    });
}

function acceptReq(rid) {
    db.collection('chat_requests').doc(rid).update({ status: 'accepted' });
    showToast('Accepted! ✅');
    activeTab = 'chats';
    loadChatList();
}

function rejectReq(rid) {
    db.collection('chat_requests').doc(rid).update({ status: 'rejected' });
    showToast('Rejected ❌');
    loadChatList();
}

function openChatWindow(cid, uid, name, avt) {
    chatId = cid; chatUser = { uid: uid, name: name, avt: avt };
    var win = document.getElementById('chatWindow');
    win.style.display = 'flex';
    document.getElementById('chatNm').textContent = name;
    document.getElementById('chatAvImg').src = avt || defaultAvatar(name);
    document.getElementById('chatAvImg').onerror = function() { this.src = defaultAvatar(name); };
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
            mc.innerHTML += '<div style="align-self:' + (m.senderId === currentUser.uid ? 'flex-end' : 'flex-start') + ';background:' + (m.senderId === currentUser.uid ? 'linear-gradient(135deg,#D4AF37,#00D4FF)' : 'rgba(19,24,66,0.8)') + ';color:' + (m.senderId === currentUser.uid ? '#0A0E27' : '#fff') + ';padding:10px 16px;border-radius:18px;max-width:75%">' + m.text + '</div>';
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
        if (!doc.exists) ref.set({ participants: [currentUser.uid, chatUser.uid], lastMessage: t, lastMessageTime: firebase.firestore.FieldValue.serverTimestamp() });
        ref.collection('messages').add({ senderId: currentUser.uid, text: t, timestamp: firebase.firestore.FieldValue.serverTimestamp(), seen: false });
        ref.update({ lastMessage: t, lastMessageTime: firebase.firestore.FieldValue.serverTimestamp() });
    });
    input.value = '';
}

console.log('✅ Chat loaded');
