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
    container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:20px">Loading...</p>';
    
    if (activeTab === 'requests') {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No pending requests</p>';
        return;
    }
    
    var html = '';
    
    // AI BOTS - ALWAYS SHOW
    var ai = [
        { id: 'annaya_ai', name: 'Annaya', avatar: '👩‍🦰' },
        { id: 'tarun_ai', name: 'Tarun', avatar: '👨‍💻' },
        { id: 'chronox_ai', name: 'ChronoX AI', avatar: '🕷️' }
    ];
    
    ai.forEach(function(x) {
        html += '<div class="chat-item" onclick="openChatWindow(\'ai_' + currentUser.uid + '_' + x.id + '\',\'' + x.id + '\',\'' + x.name + '\',\'' + x.avatar + '\',true)">' +
            '<div class="av">' + x.avatar + '</div>' +
            '<div style="flex:1"><b>' + x.name + ' <span class="blue-tick">✓</span></b><br><small style="color:rgba(255,255,255,0.5)">Tap to chat</small></div>' +
            '<small style="color:#2ED573">● Online</small>' +
            '</div>';
    });
    
    // MUTUAL FRIENDS
    var mutualIds = (currentUserData.following || []).filter(function(id) {
        return (currentUserData.followers || []).indexOf(id) !== -1;
    });
    
    if (mutualIds.length > 0) {
        var loaded = 0;
        mutualIds.forEach(function(id) {
            db.collection('users').doc(id).get().then(function(doc) {
                loaded++;
                var u = doc.data();
                if (!u) return;
                var isOnline = u.onlineStatus === 'online';
                var cid = 'dm_' + [currentUser.uid, id].sort().join('_');
                html += '<div class="chat-item" onclick="openChatWindow(\'' + cid + '\',\'' + id + '\',\'' + u.name + '\',\'' + (u.avatar || '') + '\',false)">' +
                    '<div style="position:relative;flex-shrink:0">' +
                        '<img src="' + (u.avatar || defaultAvatar(u.name)) + '" style="width:48px;height:48px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover" onerror="this.src=\'' + defaultAvatar(u.name) + '\'">' +
                        '<span style="position:absolute;bottom:2px;right:2px;width:12px;height:12px;background:' + (isOnline?'#2ED573':'#888') + ';border-radius:50%;border:2px solid #0A0E27"></span>' +
                    '</div>' +
                    '<div style="flex:1"><b>' + u.name + '</b><br><small style="color:rgba(255,255,255,0.5)">Tap to chat</small></div>' +
                    '<small style="color:' + (isOnline?'#2ED573':'rgba(255,255,255,0.5)') + '">' + (isOnline?'● Online':'Offline') + '</small>' +
                    '</div>';
                container.innerHTML = html;
            });
        });
    }
    
    container.innerHTML = html || '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No chats yet. Follow someone mutual!</p>';
}

function openChatWindow(cid, uid, name, avt, ai) {
    chatId = cid;
    chatUser = { uid: uid, name: name, avt: avt, ai: ai || false };
    
    document.getElementById('chatWindow').classList.add('show');
    document.getElementById('chatName').textContent = name;
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('msgInput').value = '';
    document.getElementById('typingIndicator').textContent = '';
    
    setTimeout(function() { document.getElementById('msgInput').focus(); }, 300);
    
    var ai2 = document.getElementById('chatAvatar');
    var ae = document.getElementById('chatAvatarEmoji');
    
    if (ai) {
        ai2.style.display = 'none';
        ae.style.display = 'inline';
        ae.textContent = avt;
        document.getElementById('chatStatus').textContent = '● Active now';
        document.getElementById('chatStatus').style.color = '#2ED573';
    } else {
        ae.style.display = 'none';
        ai2.style.display = 'inline';
        ai2.src = avt || defaultAvatar(name);
        ai2.onerror = function() { this.src = defaultAvatar(name); };
        updateStatus(uid);
    }
    
    if (chatListener) chatListener();
    
    chatListener = db.collection('chats').doc(cid).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(function(snap) {
            var mc = document.getElementById('chatMessages');
            if (!mc) return;
            mc.innerHTML = '';
            snap.forEach(function(doc) {
                var m = doc.data();
                var sent = m.senderId === currentUser.uid;
                mc.innerHTML += '<div class="' + (sent ? 'msg-sent' : 'msg-rec') + '">' +
                    (m.mediaUrl ? '<img src="' + m.mediaUrl + '" style="max-width:180px;border-radius:10px;margin-bottom:4px">' : '') +
                    m.text +
                    '<div style="margin-top:3px;display:flex;justify-content:space-between">' +
                        '<small style="opacity:0.7;font-size:10px">' + (m.timestamp ? formatTime(m.timestamp.toDate()) : '') + '</small>' +
                        (sent ? '<small style="font-size:10px;color:rgba(255,255,255,0.4)">' + (m.seen ? '✓✓ Seen' : '✓ Sent') + '</small>' : '') +
                    '</div></div>';
            });
            mc.scrollTop = mc.scrollHeight;
        });
    
    // Mark as seen
    if (!ai) {
        db.collection('chats').doc(cid).collection('messages')
            .where('senderId', '==', uid)
            .where('seen', '==', false)
            .get()
            .then(function(snap) {
                snap.forEach(function(doc) { doc.ref.update({ seen: true }); });
            });
    }
}

function updateStatus(uid) {
    db.collection('users').doc(uid).onSnapshot(function(doc) {
        var u = doc.data();
        var el = document.getElementById('chatStatus');
        if (!el) return;
        if (u && u.onlineStatus === 'online') {
            el.textContent = '● Active now'; el.style.color = '#2ED573';
        } else {
            el.textContent = 'Offline'; el.style.color = '#888';
        }
    });
}

function closeChat() {
    document.getElementById('chatWindow').classList.remove('show');
    if (chatListener) chatListener();
    chatListener = null; chatId = null; chatUser = null;
}

function sendMessage() {
    var input = document.getElementById('msgInput');
    if (!input) return;
    var t = input.value.trim();
    if (!t || !chatId || !chatUser) return;
    
    // For new DM chats
    if (chatId.startsWith('dm_')) {
        var ref = db.collection('chats').doc(chatId);
        ref.get().then(function(doc) {
            if (!doc.exists) {
                ref.set({
                    participants: [currentUser.uid, chatUser.uid],
                    lastMessage: t,
                    lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            ref.collection('messages').add({
                senderId: currentUser.uid, text: t,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(), seen: false
            });
            ref.set({
                lastMessage: t,
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            input.value = ''; input.focus();
        });
        return;
    }
    
    // Normal chat
    db.collection('chats').doc(chatId).collection('messages').add({
        senderId: currentUser.uid, text: t,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(), seen: false
    });
    db.collection('chats').doc(chatId).set({
        participants: [currentUser.uid, chatUser.uid],
        lastMessage: t,
        lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    input.value = ''; input.focus();
    
    // AI Reply
    if (chatUser.ai) {
        document.getElementById('typingIndicator').textContent = chatUser.name + ' is typing...';
        setTimeout(function() {
            document.getElementById('typingIndicator').textContent = '';
            var replies = {
                annaya_ai: ["Hey! How are you? 😊", "That's cool! 💫", "Just painting 🎨", "Life's good!"],
                tarun_ai: ["Yo! 👋", "Nice bro! 💻", "What games? 🎮", "Coding all day!"],
                chronox_ai: ["How can I help? 🕷️", "Ask me anything!", "ChronoX is awesome!"]
            };
            var r = replies[chatUser.uid] || replies.chronox_ai;
            var reply = r[Math.floor(Math.random() * r.length)];
            db.collection('chats').doc(chatId).collection('messages').add({
                senderId: chatUser.uid, text: reply,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(), seen: true
            });
            db.collection('chats').doc(chatId).update({
                lastMessage: reply, lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
            });
        }, 1000 + Math.random() * 2000);
    }
}

function attachMedia() {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = function() {
        var f = inp.files[0];
        if (!f || !chatId) return;
        showToast('Uploading...');
        var reader = new FileReader();
        reader.onload = function(e) {
            db.collection('chats').doc(chatId).collection('messages').add({
                senderId: currentUser.uid, text: '📷 Photo',
                mediaUrl: e.target.result,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(), seen: false
            });
            db.collection('chats').doc(chatId).set({
                lastMessage: '📷 Photo',
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            showToast('Photo sent! 📸');
        };
        reader.readAsDataURL(f);
    };
    inp.click();
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        var w = document.getElementById('chatWindow');
        if (w && w.classList.contains('show')) { e.preventDefault(); sendMessage(); }
    }
});

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) e.target.classList.remove('show');
});

console.log('✅ Chat loaded');
