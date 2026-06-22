var chatId = null;
var chatUser = null;
var chatListener = null;
var activeTab = 'chats';

function renderChats(c) {
    c.innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:10px">💬 Messages</h2>' +
        '<div style="display:flex;gap:5px;margin-bottom:12px">' +
            '<button class="btn-out" style="flex:1;' + (activeTab==='chats'?'background:rgba(212,175,55,0.2)':'') + '" onclick="activeTab=\'chats\';renderChats(document.getElementById(\'contentArea\'))">💬 Chats</button>' +
            '<button class="btn-out" style="flex:1;' + (activeTab==='requests'?'background:rgba(212,175,55,0.2)':'') + '" onclick="activeTab=\'requests\';renderChats(document.getElementById(\'contentArea\'))">📩 Requests</button>' +
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
    
    // AI Users always show
    var ai = [
        { id: 'annaya_ai', n: 'Annaya', a: '👩‍🦰' },
        { id: 'tarun_ai', n: 'Tarun', a: '👨‍💻' },
        { id: 'chronox_ai', n: 'ChronoX AI', a: '🕷️' }
    ];
    
    ai.forEach(function(x) {
        var cid = 'ai_' + currentUser.uid + '_' + x.id;
        db.collection('chats').doc(cid).get().then(function(d) {
            var dd = d.data() || {};
            html += '<div class="chat-item" onclick="openChatWindow(\'' + cid + '\',\'' + x.id + '\',\'' + x.n + '\',\'' + x.a + '\',true)">' +
                '<div class="av">' + x.a + '</div>' +
                '<div style="flex:1;min-width:0"><b>' + x.n + ' <span class="blue-tick">✓</span></b><br>' +
                '<small style="color:rgba(255,255,255,0.5)">' + (dd.lastMessage || 'Tap to chat') + '</small></div>' +
                '<div style="text-align:right"><small style="color:#2ED573">● Online</small><br><small style="color:var(--gold-light);font-size:10px">' + (dd.lastMessageTime?formatTime(dd.lastMessageTime.toDate()):'') + '</small></div>' +
                '</div>';
            container.innerHTML = html || '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No chats yet</p>';
        });
    });
    
    // Real users who have messages
    db.collection('chats')
        .where('participants', 'array-contains', currentUser.uid)
        .orderBy('lastMessageTime', 'desc')
        .onSnapshot(function(snap) {
            var promises = [];
            snap.forEach(function(doc) {
                var chat = doc.data();
                var otherId = chat.participants.find(function(id) { return id !== currentUser.uid; });
                if (!otherId || ['annaya_ai','tarun_ai','chronox_ai'].includes(otherId)) return;
                if (!chat.lastMessage) return;
                
                promises.push(
                    db.collection('users').doc(otherId).get().then(function(ud) {
                        var u = ud.data();
                        if (!u) return '';
                        if ((currentUserData.blockedUsers||[]).indexOf(otherId) !== -1) return '';
                        if ((u.blockedUsers||[]).indexOf(currentUser.uid) !== -1) return '';
                        
                        var isOnline = u.onlineStatus === 'online';
                        var lastSeen = u.lastSeen ? u.lastSeen.toDate() : null;
                        var statusText = isOnline ? '● Online' : getLastSeenText(lastSeen);
                        var statusColor = isOnline ? '#2ED573' : 'rgba(255,255,255,0.5)';
                        
                        return '<div class="chat-item" onclick="openChatWindow(\'' + doc.id + '\',\'' + otherId + '\',\'' + u.name + '\',\'' + (u.avatar||'') + '\',false)">' +
                            '<div style="position:relative;flex-shrink:0">' +
                                '<img src="' + (u.avatar || defaultAvatar(u.name)) + '" class="chat-avatar-img" onerror="this.src=\'' + defaultAvatar(u.name) + '\'">' +
                                '<span style="position:absolute;bottom:2px;right:2px;width:12px;height:12px;background:' + (isOnline?'#2ED573':'#888') + ';border-radius:50%;border:2px solid #0A0E27"></span>' +
                            '</div>' +
                            '<div style="flex:1;min-width:0"><b>' + u.name + '</b><br>' +
                            '<small style="color:rgba(255,255,255,0.5);display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + chat.lastMessage + '</small></div>' +
                            '<div style="text-align:right;flex-shrink:0"><small style="color:' + statusColor + ';font-size:11px">' + statusText + '</small><br><small style="color:var(--gold-light);font-size:10px">' + (chat.lastMessageTime?formatTime(chat.lastMessageTime.toDate()):'') + '</small></div>' +
                            '</div>';
                    })
                );
            });
            
            Promise.all(promises).then(function(results) {
                var realChats = results.filter(function(r) { return r; }).join('');
                container.innerHTML = html + realChats || '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No chats yet. Search and message someone!</p>';
            });
        });
}

function getLastSeenText(lastSeen) {
    if (!lastSeen) return 'Offline';
    var diff = Date.now() - lastSeen;
    var mins = Math.floor(diff / 60000);
    var hours = Math.floor(diff / 3600000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    if (hours < 24) return hours + 'h ago';
    return lastSeen.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
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
    
    var avatarImg = document.getElementById('chatAvatar');
    var avatarEmoji = document.getElementById('chatAvatarEmoji');
    
    if (ai) {
        avatarImg.style.display = 'none';
        avatarEmoji.style.display = 'inline';
        avatarEmoji.textContent = avt;
        document.getElementById('chatStatus').textContent = '● Active now';
        document.getElementById('chatStatus').style.color = '#2ED573';
    } else {
        avatarEmoji.style.display = 'none';
        avatarImg.style.display = 'inline';
        avatarImg.src = avt || defaultAvatar(name);
        avatarImg.onerror = function() { this.style.display = 'none'; };
        updateStatus(uid);
    }
    
    setTimeout(function() { document.getElementById('msgInput').focus(); }, 300);
    
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
                    '<div style="display:flex;justify-content:space-between;margin-top:3px">' +
                        '<small style="opacity:0.7;font-size:10px">' + (m.timestamp ? formatTime(m.timestamp.toDate()) : '') + '</small>' +
                        (sent ? '<small style="font-size:10px;color:rgba(255,255,255,0.4)">' + (m.seen ? '✓✓ Seen' : '✓ Sent') + '</small>' : '') +
                    '</div></div>';
            });
            mc.scrollTop = mc.scrollHeight;
        });
    
    if (!ai) {
        db.collection('chats').doc(cid).collection('messages')
            .where('senderId', '==', uid).where('seen', '==', false)
            .get().then(function(snap) {
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
            var ls = u && u.lastSeen ? u.lastSeen.toDate() : null;
            el.textContent = getLastSeenText(ls); el.style.color = 'rgba(255,255,255,0.5)';
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
    
    if (chatUser.ai) {
        document.getElementById('typingIndicator').textContent = chatUser.name + ' is typing...';
        setTimeout(function() {
            document.getElementById('typingIndicator').textContent = '';
            var replies = {
                annaya_ai: ["Hey! How are you? 😊", "That's interesting! 💫", "Just painting 🎨", "Life's good!"],
                tarun_ai: ["Yo! 👋", "Coding all day 💻", "Cool bro!", "What games? 🎮"],
                chronox_ai: ["How can I help? 🕷️", "Ask me anything!", "ChronoX is awesome!"]
            };
            var r = replies[chatUser.uid] || replies.chronox_ai;
            var reply = r[Math.floor(Math.random() * r.length)];
            
            if (typeof GEMINI_KEY !== 'undefined' && GEMINI_KEY && GEMINI_KEY.length > 5) {
                var p = chatUser.uid === 'annaya_ai' ? 'You are Annaya, 22yo female artist. Be warm.' :
                        chatUser.uid === 'tarun_ai' ? 'You are Tarun, 24yo male coder. Be cool.' : 'You are ChronoX AI. Be helpful.';
                fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_KEY, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: p + '\nReply in 1-2 sentences to: "' + t + '"' }] }] })
                }).then(function(r) { return r.json(); }).then(function(d) {
                    if (d.candidates && d.candidates[0]) reply = d.candidates[0].content.parts[0].text;
                    saveAIReply(reply);
                }).catch(function() { saveAIReply(reply); });
            } else { saveAIReply(reply); }
        }, 1000 + Math.random() * 2000);
    }
}

function saveAIReply(reply) {
    db.collection('chats').doc(chatId).collection('messages').add({
        senderId: chatUser.uid, text: reply,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(), seen: true
    });
    db.collection('chats').doc(chatId).update({
        lastMessage: reply, lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function attachMedia() {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = function() {
        var f = inp.files[0]; if (!f || !chatId) return;
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

console.log('✅ Chat ready');
