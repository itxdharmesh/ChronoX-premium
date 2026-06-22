// ==================== CHAT SYSTEM WITH REQUEST SYSTEM ====================
var chatId = null;
var chatUser = null;
var chatListener = null;
var activeTab = 'chats';

function renderChats(c) {
    c.innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:10px">💬 Messages</h2>' +
        '<div style="display:flex;gap:5px;margin-bottom:15px">' +
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
        loadChatRequests(container);
    } else {
        loadActiveChats(container);
    }
}

// ==================== ACTIVE CHATS ====================
function loadActiveChats(container) {
    var h = '';
    
    // AI Users at top
    var ai = [
        { id: 'annaya_ai', n: 'Annaya', a: '👩‍🦰' },
        { id: 'tarun_ai', n: 'Tarun', a: '👨‍💻' },
        { id: 'chronox_ai', n: 'ChronoX AI', a: '🕷️' }
    ];
    
    ai.forEach(function(x) {
        var aiChatId = 'ai_' + currentUser.uid + '_' + x.id;
        db.collection('chats').doc(aiChatId).get().then(function(d) {
            var dd = d.data() || {};
            h += '<div class="chat-item" onclick="openChatWindow(\'' + aiChatId + '\',\'' + x.id + '\',\'' + x.n + '\',\'' + x.a + '\',true)">' +
                '<div class="av">' + x.a + '</div>' +
                '<div style="flex:1;min-width:0"><b>' + x.n + ' <span class="blue-tick">✓</span></b><br>' +
                '<small style="color:rgba(255,255,255,0.5)">' + (dd.lastMessage || 'Tap to chat') + '</small></div>' +
                '<div style="text-align:right"><div style="color:#2ED573;font-size:11px">● Online</div>' +
                '<small style="color:var(--gold-light);font-size:10px">' + (dd.lastMessageTime ? formatTime(dd.lastMessageTime.toDate()) : '') + '</small></div>' +
                '</div>';
            container.innerHTML = h || '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No chats yet</p>';
        });
    });
    
    // Real user chats
    db.collection('chats')
        .where('participants', 'array-contains', currentUser.uid)
        .orderBy('lastMessageTime', 'desc')
        .onSnapshot(function(snap) {
            var promises = [];
            
            snap.forEach(function(doc) {
                var chat = doc.data();
                var otherId = chat.participants.find(function(id) { return id !== currentUser.uid; });
                if (!otherId || ['annaya_ai', 'tarun_ai', 'chronox_ai'].includes(otherId)) return;
                
                var promise = db.collection('users').doc(otherId).get().then(function(ud) {
                    var u = ud.data();
                    if (!u) return '';
                    if ((currentUserData.blockedUsers || []).indexOf(otherId) !== -1) return '';
                    if ((u.blockedUsers || []).indexOf(currentUser.uid) !== -1) return '';
                    
                    var isMutualFollow = (currentUserData.following || []).indexOf(otherId) !== -1 && 
                                        (currentUserData.followers || []).indexOf(otherId) !== -1;
                    var isApproved = chat.approved === true;
                    var iFollowedThem = (currentUserData.following || []).indexOf(otherId) !== -1;
                    var hasMessages = chat.lastMessage && chat.lastMessage.length > 0;
                    
                    // Show in chat list if: mutual follow, approved, or I followed + messaged
                    if (isMutualFollow || isApproved || (iFollowedThem && hasMessages)) {
                        return createChatItem(doc.id, otherId, u.name, u.avatar, false, chat.lastMessage, chat.lastMessageTime, u.onlineStatus === 'online');
                    }
                    return '';
                });
                promises.push(promise);
            });
            
            Promise.all(promises).then(function(results) {
                var realChats = results.filter(function(r) { return r !== ''; }).join('');
                container.innerHTML = h + realChats || '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No chats yet</p>';
            });
        });
}

// ==================== CHAT REQUESTS ====================
function loadChatRequests(container) {
    container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:20px">Loading requests...</p>';
    
    db.collection('chat_requests')
        .where('to', '==', currentUser.uid)
        .where('status', '==', 'pending')
        .orderBy('timestamp', 'desc')
        .get()
        .then(function(snap) {
            if (snap.empty) {
                container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No pending requests</p>';
                return;
            }
            
            var h = '';
            var promises = [];
            
            snap.forEach(function(doc) {
                var req = doc.data();
                var promise = db.collection('users').doc(req.from).get().then(function(ud) {
                    var u = ud.data();
                    if (!u) return '';
                    
                    return '<div class="card" style="padding:15px;margin-bottom:10px">' +
                        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">' +
                            '<img src="' + (u.avatar || defaultAvatar(u.name)) + '" style="width:48px;height:48px;border-radius:50%;border:2px solid var(--gold);object-fit:cover" onerror="this.src=\'' + defaultAvatar(u.name) + '\'">' +
                            '<div style="flex:1"><b>' + u.name + '</b><br><small style="color:var(--gold-light)">' + u.username + '</small></div>' +
                        '</div>' +
                        '<p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:12px">💬 ' + (req.message || 'No message') + '</p>' +
                        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">' +
                            '<button class="btn" style="font-size:12px;padding:10px" onclick="acceptChatRequest(\'' + doc.id + '\',\'' + req.from + '\',\'' + req.chatId + '\')">✅ Accept</button>' +
                            '<button class="btn-out" style="font-size:12px;padding:10px;color:#FF4757;border-color:#FF4757" onclick="rejectChatRequest(\'' + doc.id + '\')">❌ Reject</button>' +
                            '<button class="btn-out" style="font-size:12px;padding:10px" onclick="alert(\'Message: ' + (req.message || 'No message') + '\')">👁️ View</button>' +
                            '<button class="btn-out" style="font-size:12px;padding:10px" onclick="blockRequestUser(\'' + req.from + '\',\'' + doc.id + '\')">🚫 Block</button>' +
                        '</div>' +
                    '</div>';
                });
                promises.push(promise);
            });
            
            Promise.all(promises).then(function(results) {
                container.innerHTML = results.join('') || '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No pending requests</p>';
            });
        });
}

// ==================== CREATE CHAT ITEM ====================
function createChatItem(chatId, userId, name, avatar, isAI, lastMsg, lastTime, isOnline) {
    var dp = isAI ? '' : (avatar || defaultAvatar(name));
    var timeStr = lastTime ? formatTime(lastTime.toDate ? lastTime.toDate() : lastTime) : '';
    var msg = lastMsg || 'Tap to chat';
    var statusColor = isAI || isOnline ? '#2ED573' : '#888';
    var statusText = isAI || isOnline ? '● Online' : '●';
    
    return '<div class="chat-item" onclick="openChatWindow(\'' + chatId + '\',\'' + userId + '\',\'' + name + '\',\'' + (avatar || '') + '\',' + isAI + ')">' +
        '<div style="position:relative;flex-shrink:0">' +
            (isAI ? 
                '<div class="av">' + avatar + '</div>' :
                '<img src="' + dp + '" class="chat-avatar-img" style="width:52px;height:52px" onerror="this.src=\'' + defaultAvatar(name) + '\'">'
            ) +
            '<span style="position:absolute;bottom:2px;right:2px;width:14px;height:14px;background:' + statusColor + ';border-radius:50%;border:2px solid #0A0E27"></span>' +
        '</div>' +
        '<div style="flex:1;min-width:0">' +
            '<b>' + name + (isAI ? ' <span class="blue-tick">✓</span>' : '') + '</b><br>' +
            '<small style="color:rgba(255,255,255,0.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block">' + msg + '</small>' +
        '</div>' +
        '<div style="text-align:right;flex-shrink:0">' +
            '<div style="color:' + statusColor + ';font-size:11px">' + statusText + '</div>' +
            '<small style="color:var(--gold-light);font-size:10px">' + timeStr + '</small>' +
        '</div>' +
    '</div>';
}

// ==================== OPEN CHAT WINDOW ====================
function openChatWindow(cid, uid, name, avt, ai) {
    chatId = cid;
    chatUser = { uid: uid, name: name, avt: avt, ai: ai };
    
    var chatWin = document.getElementById('chatWindow');
    chatWin.classList.add('show');
    document.getElementById('chatName').textContent = name;
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('msgInput').value = '';
    document.getElementById('typingIndicator').textContent = '';
    
    setTimeout(function() {
        document.getElementById('msgInput').focus();
    }, 300);
    
    var avatarEl = document.getElementById('chatAvatar');
    if (ai) {
        avatarEl.style.display = 'none';
        document.getElementById('chatStatus').textContent = '● Active now';
        document.getElementById('chatStatus').style.color = '#2ED573';
    } else {
        avatarEl.style.display = '';
        avatarEl.src = avt || defaultAvatar(name);
        avatarEl.onerror = function() { this.src = defaultAvatar(name); };
        updateChatStatus(uid);
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
                var isSent = m.senderId === currentUser.uid;
                mc.innerHTML += '<div class="' + (isSent ? 'msg-sent' : 'msg-rec') + '">' +
                    (m.mediaUrl ? '<img src="' + m.mediaUrl + '" style="max-width:200px;border-radius:10px;margin-bottom:5px">' : '') +
                    m.text +
                    '<div style="margin-top:4px">' +
                        '<small style="opacity:0.7">' + (m.timestamp ? formatTime(m.timestamp.toDate()) : '') + '</small>' +
                        (isSent ? '<small style="color:rgba(255,255,255,0.4);margin-left:8px">' + (m.seen ? '✓✓ Seen' : '✓ Sent') + '</small>' : '') +
                    '</div>' +
                '</div>';
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
                snap.forEach(function(doc) {
                    doc.ref.update({ seen: true });
                });
            });
    }
}

// ==================== SEND MESSAGE ====================
function sendMessage() {
    var input = document.getElementById('msgInput');
    if (!input) return;
    
    var t = input.value.trim();
    if (!t || !chatId || !chatUser) return;
    
    // Save message
    db.collection('chats').doc(chatId).collection('messages').add({
        senderId: currentUser.uid,
        text: t,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        seen: false
    });
    
    db.collection('chats').doc(chatId).set({
        participants: [currentUser.uid, chatUser.uid],
        lastMessage: t,
        lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    // Clear input
    input.value = '';
    input.focus();
    
    // XP
    if (t.split(' ').length >= 3 && typeof addXP === 'function') {
        addXP(5);
    }
    
    // AI Reply
    if (chatUser.ai) {
        document.getElementById('typingIndicator').textContent = chatUser.name + ' is typing...';
        
        setTimeout(function() {
            document.getElementById('typingIndicator').textContent = '';
            var reply = getFallbackReply(chatUser.uid);
            
            if (typeof GEMINI_KEY !== 'undefined' && GEMINI_KEY && GEMINI_KEY.length > 5) {
                var personality = chatUser.uid === 'annaya_ai' ? 'You are Annaya, 22yo female artist. Be warm and friendly.' :
                                 chatUser.uid === 'tarun_ai' ? 'You are Tarun, 24yo male coder. Be cool and casual.' :
                                 'You are ChronoX AI assistant. Be helpful.';
                
                fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_KEY, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: personality + '\nReply in 1-2 sentences to: "' + t + '"' }] }] })
                })
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data.candidates && data.candidates[0]) reply = data.candidates[0].content.parts[0].text;
                    saveAIReply(reply);
                })
                .catch(function() { saveAIReply(reply); });
            } else {
                saveAIReply(reply);
            }
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

// ==================== REQUEST ACTIONS ====================
function acceptChatRequest(requestId, fromUid, chatId) {
    db.collection('chat_requests').doc(requestId).update({ status: 'accepted' });
    db.collection('chats').doc(chatId).update({ approved: true });
    showToast('Request accepted! ✅');
    activeTab = 'chats';
    loadChatList();
}

function rejectChatRequest(requestId) {
    db.collection('chat_requests').doc(requestId).update({ status: 'rejected' });
    showToast('Request rejected ❌');
    loadChatList();
}

function blockRequestUser(uid, requestId) {
    if (!confirm('Block this user?')) return;
    db.collection('users').doc(currentUser.uid).update({
        blockedUsers: firebase.firestore.FieldValue.arrayUnion(uid)
    });
    db.collection('chat_requests').doc(requestId).update({ status: 'blocked' });
    currentUserData.blockedUsers = currentUserData.blockedUsers || [];
    currentUserData.blockedUsers.push(uid);
    showToast('Blocked! 🚫');
    loadChatList();
}

// ==================== HELPERS ====================
function updateChatStatus(uid) {
    db.collection('users').doc(uid).onSnapshot(function(doc) {
        var u = doc.data();
        var statusEl = document.getElementById('chatStatus');
        if (!statusEl) return;
        if (u && u.onlineStatus === 'online') {
            statusEl.textContent = '● Active now'; statusEl.style.color = '#2ED573';
        } else {
            statusEl.textContent = 'Offline'; statusEl.style.color = 'rgba(255,255,255,0.5)';
        }
    });
}

function closeChat() {
    document.getElementById('chatWindow').classList.remove('show');
    if (chatListener) chatListener();
    chatListener = null; chatId = null; chatUser = null;
}

function getFallbackReply(uid) {
    var replies = {
        annaya_ai: ["Hey! How are you? 😊", "That's interesting! 💫", "Just painting 🎨", "Life's good!"],
        tarun_ai: ["Yo! 👋", "Coding all day 💻", "Cool bro!", "What games? 🎮"],
        chronox_ai: ["How can I help? 🕷️", "Ask me anything!", "ChronoX is awesome!"]
    };
    var r = replies[uid] || replies.chronox_ai;
    return r[Math.floor(Math.random() * r.length)];
}

function attachMedia() {
    var input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = function() {
        var file = input.files[0];
        if (!file || !chatId) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            db.collection('chats').doc(chatId).collection('messages').add({
                senderId: currentUser.uid, text: '📷 Image',
                mediaUrl: e.target.result,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(), seen: false
            });
            db.collection('chats').doc(chatId).set({
                lastMessage: '📷 Image',
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

// Enter key to send
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        var chatWin = document.getElementById('chatWindow');
        if (chatWin && chatWin.classList.contains('show')) {
            e.preventDefault();
            sendMessage();
        }
    }
});

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

console.log('✅ Chat system loaded');
