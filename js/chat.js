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
        '<div id="chatListContainer"></div>';
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
    
    if (activeTab === 'requests') {
        loadRequests(container);
        return;
    }
    
    var mutualIds = (currentUserData.following || []).filter(function(id) {
        return (currentUserData.followers || []).indexOf(id) !== -1;
    });
    
    if (mutualIds.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No chats yet.<br>Follow someone mutual to chat!</p>';
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
            
            html += '<div class="chat-item" onclick="openChat(\'' + cid + '\',\'' + uid + '\',\'' + u.name + '\',\'' + (u.avatar||'') + '\')">' +
                '<div style="position:relative;flex-shrink:0">' +
                    '<img src="' + dp + '" style="width:52px;height:52px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover;background:#1a1f4e" onerror="this.src=\'' + getDefaultAvatar(u.name) + '\'">' +
                    '<span style="position:absolute;bottom:2px;right:2px;width:13px;height:13px;background:' + (isOnline?'#2ED573':'#888') + ';border-radius:50%;border:2px solid #0A0E27"></span>' +
                '</div>' +
                '<div style="flex:1;min-width:0"><b>' + u.name + '</b><br><small style="color:rgba(255,255,255,0.5);display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Tap to chat</small></div>' +
                '<div style="text-align:right;flex-shrink:0"><small style="color:' + (isOnline?'#2ED573':'#888') + ';font-size:11px">' + (isOnline?'● Online':'Offline') + '</small></div>' +
            '</div>';
            
            if (loaded === mutualIds.length) container.innerHTML = html;
        });
    });
}

function loadRequests(container) {
    db.collection('chat_requests').where('to','==',currentUser.uid).where('status','==','pending').get().then(function(snap) {
        if (snap.empty) { container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No pending requests</p>'; return; }
        var html = '';
        snap.forEach(function(doc) {
            var req = doc.data();
            db.collection('users').doc(req.from).get().then(function(ud) {
                var u = ud.data();
                if (!u) return;
                html += '<div class="card" style="padding:15px;margin-bottom:10px">' +
                    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
                        '<img src="' + (u.avatar || getDefaultAvatar(u.name)) + '" style="width:44px;height:44px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover;background:#1a1f4e" onerror="this.src=\'' + getDefaultAvatar(u.name) + '\'">' +
                        '<div><b>' + u.name + '</b><br><small style="color:#D4AF37">' + u.username + '</small></div>' +
                    '</div>' +
                    '<p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:12px">💬 ' + (req.message || 'No message') + '</p>' +
                    '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">' +
                        '<button class="btn" style="font-size:11px;padding:8px" onclick="acceptReq(\'' + doc.id + '\',\'' + req.from + '\',\'' + req.chatId + '\')">✅ Accept</button>' +
                        '<button class="btn-out" style="font-size:11px;padding:8px;color:#FF4757;border-color:#FF4757" onclick="rejectReq(\'' + doc.id + '\')">❌ Reject</button>' +
                    '</div></div>';
                container.innerHTML = html;
            });
        });
    });
}

function acceptReq(rid, from, cid) {
    db.collection('chat_requests').doc(rid).update({status:'accepted'});
    db.collection('chats').doc(cid).update({approved:true});
    showToast('Accepted! ✅');
    activeTab='chats';
    loadChatList();
}
function rejectReq(rid) {
    db.collection('chat_requests').doc(rid).update({status:'rejected'});
    showToast('Rejected ❌');
    loadChatList();
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
    
    db.collection('users').doc(uid).onSnapshot(function(doc) {
        var u = doc.data();
        var el = document.getElementById('chatStatusText');
        if (!el) return;
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
            var mediaHtml = m.mediaUrl ? '<img src="' + m.mediaUrl + '" style="max-width:200px;border-radius:10px;margin-bottom:4px;display:block" onclick="this.classList.toggle(\'full-img\')">' : '';
            
            mc.innerHTML += '<div class="msg-wrapper" style="align-self:' + (sent?'flex-end':'flex-start') + ';max-width:75%;position:relative" oncontextmenu="event.preventDefault();showMsgOptions(\'' + doc.id + '\',' + sent + ',\'' + m.text.replace(/'/g,"\\'") + '\')" onlongpress="showMsgOptions(\'' + doc.id + '\',' + sent + ',\'' + m.text.replace(/'/g,"\\'") + '\')">' +
                '<div style="background:' + (sent?'linear-gradient(135deg,#D4AF37,#00D4FF)':'rgba(19,24,66,0.8)') + ';color:' + (sent?'#0A0E27':'#fff') + ';padding:10px 16px;border-radius:' + (sent?'20px 20px 4px 20px':'20px 20px 20px 4px') + ';font-size:14px;word-wrap:break-word">' +
                    mediaHtml +
                    '<span id="msgText_' + doc.id + '">' + m.text + '</span>' +
                    '<div style="margin-top:3px;font-size:10px;opacity:0.7;display:flex;justify-content:space-between">' +
                        '<span>' + (m.timestamp ? formatTime(m.timestamp.toDate()) : '') + '</span>' +
                        (sent ? '<span>' + (m.seen ? '✓✓' : '✓') + '</span>' : '') +
                    '</div>' +
                '</div>' +
                (m.edited ? '<small style="color:rgba(255,255,255,0.4);font-size:9px;margin-left:8px">edited</small>' : '') +
            '</div>';
        });
        mc.scrollTop = mc.scrollHeight;
    });
    
    // Mark seen
    db.collection('chats').doc(cid).collection('messages')
        .where('senderId','==',uid).where('seen','==',false)
        .get().then(function(snap) { snap.forEach(function(doc) { doc.ref.update({seen:true}); }); });
}

function showMsgOptions(msgId, isSent, text) {
    var options = document.createElement('div');
    options.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#131842;border:1px solid #D4AF37;border-radius:12px;padding:8px 0;z-index:9999;display:flex;gap:5px';
    
    if (isSent) {
        options.innerHTML = 
            '<button onclick="editMsg(\'' + msgId + '\',\'' + text + '\')" style="background:none;border:none;color:#fff;padding:10px 20px;cursor:pointer;font-size:13px">✏️ Edit</button>' +
            '<button onclick="deleteMsg(\'' + msgId + '\')" style="background:none;border:none;color:#FF4757;padding:10px 20px;cursor:pointer;font-size:13px">🗑️ Delete</button>';
    } else {
        options.innerHTML = '<button onclick="this.parentElement.remove()" style="background:none;border:none;color:#fff;padding:10px 20px;cursor:pointer;font-size:13px">✕ Close</button>';
    }
    options.innerHTML += '<button onclick="this.parentElement.remove()" style="background:none;border:none;color:#888;padding:10px 20px;cursor:pointer;font-size:13px">✕</button>';
    document.body.appendChild(options);
    setTimeout(function() { if (options.parentNode) options.remove(); }, 5000);
}

function editMsg(msgId, oldText) {
    var newText = prompt('Edit message:', oldText);
    if (newText && newText !== oldText) {
        db.collection('chats').doc(chatId).collection('messages').doc(msgId).update({ text: newText, edited: true });
        document.getElementById('msgText_' + msgId).textContent = newText;
    }
}

function deleteMsg(msgId) {
    if (confirm('Delete this message?')) {
        db.collection('chats').doc(chatId).collection('messages').doc(msgId).delete();
    }
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
        ref.collection('messages').add({ senderId: currentUser.uid, text: t, timestamp: firebase.firestore.FieldValue.serverTimestamp(), seen: false, edited: false });
        ref.update({ lastMessage: t, lastMessageTime: firebase.firestore.FieldValue.serverTimestamp() });
    });
    input.value = '';
}

function attachMedia() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = function() {
        var f = inp.files[0];
        if (!f || !chatId) return;
        showToast('Uploading...');
        var reader = new FileReader();
        reader.onload = function(e) {
            var ref = db.collection('chats').doc(chatId);
            ref.collection('messages').add({ senderId: currentUser.uid, text: '📷 Photo', mediaUrl: e.target.result, timestamp: firebase.firestore.FieldValue.serverTimestamp(), seen: false, edited: false });
            ref.update({ lastMessage: '📷 Photo', lastMessageTime: firebase.firestore.FieldValue.serverTimestamp() });
            showToast('Photo sent! 📸');
        };
        reader.readAsDataURL(f);
    };
    inp.click();
}

function getDefaultAvatar(name) {
    var l = (name||'U')[0].toUpperCase();
    return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%231a1f4e" width="100" height="100"/><text x="50" y="62" text-anchor="middle" fill="%23D4AF37" font-size="45">'+l+'</text></svg>');
}

// Long press for mobile
document.addEventListener('touchstart', function(e) {
    var target = e.target.closest('.msg-wrapper');
    if (!target) return;
    var timeout = setTimeout(function() {
        var msgId = target.getAttribute('data-msgid');
        if (msgId) showMsgOptions(msgId, true, '');
    }, 800);
    target.addEventListener('touchend', function() { clearTimeout(timeout); }, {once: true});
});
