var chatId = null;
var chatUser = null;
var chatListener = null;
var activeTab = 'chats';

function renderChats(c) {
    c.innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:10px">💬 Messages</h2>' +
        '<div style="display:flex;gap:5px;margin-bottom:12px">' +
            '<button class="btn-out" style="flex:1;' + (activeTab==='chats'?'background:rgba(212,175,55,0.2)':'') + '" onclick="activeTab=\'chats\';loadChatList()">💬 Chats</button>' +
            '<button class="btn-out" style="flex:1;' + (activeTab==='requests'?'background:rgba(212,175,55,0.2)':'') + '" onclick="activeTab=\'requests\';loadChatList()">📩 Requests</button>' +
        '</div>' +
        '<div id="chatListContainer">Loading...</div>';
    loadChatList();
}

function loadChatList() {
    var container = document.getElementById('chatListContainer');
    if (!container) return;
    
    if (activeTab === 'requests') {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No pending requests</p>';
        return;
    }
    
    var html = '';
    
    // AI Users
    var ai = [
        { id: 'annaya_ai', n: 'Annaya', a: '👩‍🦰' },
        { id: 'tarun_ai', n: 'Tarun', a: '👨‍💻' },
        { id: 'chronox_ai', n: 'ChronoX AI', a: '🕷️' }
    ];
    
    ai.forEach(function(x) {
        html += '<div class="chat-item" onclick="openChatWindow(\'ai_' + currentUser.uid + '_' + x.id + '\',\'' + x.id + '\',\'' + x.n + '\',\'' + x.a + '\',true)">' +
            '<div class="av">' + x.a + '</div>' +
            '<div style="flex:1"><b>' + x.n + ' <span class="blue-tick">✓</span></b><br><small style="color:rgba(255,255,255,0.5)">Tap to chat</small></div>' +
            '<small style="color:#2ED573">● Online</small>' +
            '</div>';
    });
    
    container.innerHTML = html || '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No chats</p>';
}

function openChatWindow(cid, uid, name, avt, ai) {
    chatId = cid;
    chatUser = { uid: uid, name: name, avt: avt, ai: ai || false };
    
    var win = document.getElementById('chatWindow');
    win.classList.add('show');
    document.getElementById('chatName').textContent = name;
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('msgInput').value = '';
    document.getElementById('typingIndicator').textContent = '';
    
    setTimeout(function() { document.getElementById('msgInput').focus(); }, 300);
    
    var avatarEl = document.getElementById('chatAvatar');
    if (ai) {
        avatarEl.style.display = 'none';
        document.getElementById('chatStatus').textContent = '● Active now';
        document.getElementById('chatStatus').style.color = '#2ED573';
    } else {
        avatarEl.style.display = '';
        avatarEl.src = avt || defaultAvatar(name);
        avatarEl.onerror = function() { this.src = defaultAvatar(name); };
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
                mc.innerHTML += '<div class="' + (sent ? 'msg-sent' : 'msg-rec') + '">' + m.text + '</div>';
            });
            mc.scrollTop = mc.scrollHeight;
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
    
    db.collection('chats').doc(chatId).collection('messages').add({
        senderId: currentUser.uid, text: t,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(), seen: false
    });
    
    db.collection('chats').doc(chatId).set({
        participants: [currentUser.uid, chatUser.uid],
        lastMessage: t,
        lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    input.value = '';
    input.focus();
    
    if (chatUser.ai) {
        document.getElementById('typingIndicator').textContent = chatUser.name + ' is typing...';
        setTimeout(function() {
            document.getElementById('typingIndicator').textContent = '';
            var replies = {
                annaya_ai: ["Hey! 😊", "That's cool! 💫", "Just painting 🎨"],
                tarun_ai: ["Yo! 👋", "Nice bro! 💻", "What games? 🎮"],
                chronox_ai: ["How can I help? 🕷️", "Ask me anything!"]
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
