// ==================== CHAT SYSTEM ====================
var chatId = null;
var chatUser = null;
var chatListener = null;

function renderChats(c) {
    c.innerHTML = '<h2 style="color:var(--gold);margin-bottom:15px">💬 Messages</h2><div id="chatList">Loading...</div>';
    loadChats();
}

function loadChats() {
    var ai = [
        { id: 'annaya_ai', n: 'Annaya', a: '👩‍🦰' },
        { id: 'tarun_ai', n: 'Tarun', a: '👨‍💻' },
        { id: 'chronox_ai', n: 'ChronoX AI', a: '🕷️' }
    ];
    
    var h = '';
    
    ai.forEach(function(x) {
        h += '<div class="chat-item" onclick="openChat(\'ai_' + currentUser.uid + '_' + x.id + '\',\'' + x.id + '\',\'' + x.n + '\',\'' + x.a + '\',true)"><div class="av">' + x.a + '</div><div style="flex:1"><b>' + x.n + ' <span class="blue-tick">✓</span></b><br><small style="color:rgba(255,255,255,0.5)">Tap to chat</small></div><small style="color:#2ED573">● Online</small></div>';
    });
    
    document.getElementById('chatList').innerHTML = h || '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No chats yet</p>';
}

function openChat(cid, uid, name, avt, ai) {
    chatId = cid;
    chatUser = { uid: uid, name: name, avt: avt, ai: ai || false };
    
    document.getElementById('chatWindow').classList.add('show');
    document.getElementById('chatName').textContent = name;
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('msgInput').value = '';
    document.getElementById('typingIndicator').textContent = '';
    document.getElementById('msgInput').focus();
    
    if (chatListener) chatListener();
    
    chatListener = db.collection('chats').doc(cid).collection('messages').orderBy('timestamp', 'asc').onSnapshot(function(snap) {
        var mc = document.getElementById('chatMessages');
        if (!mc) return;
        mc.innerHTML = '';
        snap.forEach(function(doc) {
            var m = doc.data();
            var isSent = m.senderId === currentUser.uid;
            mc.innerHTML += '<div class="' + (isSent ? 'msg-sent' : 'msg-rec') + '">' +
                (m.mediaUrl ? '<img src="' + m.mediaUrl + '" style="max-width:200px;border-radius:10px;margin-bottom:5px" onclick="this.classList.toggle(\'full\')">' : '') +
                m.text +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">' +
                    '<small style="opacity:0.7">' + (m.timestamp ? formatTime(m.timestamp.toDate()) : '') + '</small>' +
                    (isSent ? '<small style="color:rgba(255,255,255,0.4)">' + (m.seen ? '✓✓' : '✓') + '</small>' : '') +
                '</div>' +
                '</div>';
        });
        mc.scrollTop = mc.scrollHeight;
    });
    
    // Mark messages as seen
    db.collection('chats').doc(cid).collection('messages')
        .where('senderId', '==', uid)
        .where('seen', '==', false)
        .get()
        .then(function(snap) {
            snap.forEach(function(doc) {
                doc.ref.update({ seen: true, seenAt: firebase.firestore.FieldValue.serverTimestamp() });
            });
        });
}

function closeChat() {
    document.getElementById('chatWindow').classList.remove('show');
    if (chatListener) chatListener();
    chatListener = null;
    chatId = null;
    chatUser = null;
}

function sendMessage() {
    var input = document.getElementById('msgInput');
    var t = input.value.trim();
    if (!t || !chatId || !chatUser) return;
    
    // Save user message
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
    
    // Update message count for XP
    if (t.split(' ').length >= 3) {
        db.collection('users').doc(currentUser.uid).update({
            'stats.totalMessages': firebase.firestore.FieldValue.increment(1)
        });
        addXP(5);
    }
    
    // AI Auto-Reply
    if (chatUser.ai) {
        document.getElementById('typingIndicator').textContent = chatUser.name + ' is typing...';
        
        setTimeout(function() {
            document.getElementById('typingIndicator').textContent = '';
            var reply;
            
            if (typeof GEMINI_KEY !== 'undefined' && GEMINI_KEY && GEMINI_KEY.length > 5) {
                var personality = '';
                if (chatUser.uid === 'annaya_ai') {
                    personality = 'You are Annaya, a 22-year-old female artist. Be warm, friendly, and use emojis. Reply in 1-2 sentences.';
                } else if (chatUser.uid === 'tarun_ai') {
                    personality = 'You are Tarun, a 24-year-old male coder and gamer. Be cool, casual. Reply in 1-2 sentences.';
                } else if (chatUser.uid === 'chronox_ai') {
                    personality = 'You are ChronoX AI, helpful app assistant. Be professional. Reply in 1-2 sentences.';
                }
                
                fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_KEY, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: personality + '\n\nUser says: "' + t + '"\nYour natural reply:' }] }]
                    })
                })
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data.candidates && data.candidates[0]) {
                        reply = data.candidates[0].content.parts[0].text;
                    } else {
                        reply = getFallbackReply(chatUser.uid);
                    }
                    saveAIReply(reply);
                })
                .catch(function() {
                    reply = getFallbackReply(chatUser.uid);
                    saveAIReply(reply);
                });
            } else {
                reply = getFallbackReply(chatUser.uid);
                saveAIReply(reply);
            }
        }, 1000 + Math.random() * 2000);
    }
}

function saveAIReply(reply) {
    db.collection('chats').doc(chatId).collection('messages').add({
        senderId: chatUser.uid,
        text: reply,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        seen: true
    });
    db.collection('chats').doc(chatId).update({
        lastMessage: reply,
        lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function getFallbackReply(uid) {
    var replies = {
        annaya_ai: ["Hey! How are you? 😊", "That's interesting! Tell me more 💫", "I was just painting something 🎨", "Life's good! What about you?"],
        tarun_ai: ["Yo! What's up? 👋", "Coding all day bro 💻", "That's cool! Tell me more", "What games do you play? 🎮"],
        chronox_ai: ["How can I help? 🕷️", "ChronoX has many features! Ask me anything.", "I'm here to assist you with the app!"]
    };
    var r = replies[uid] || replies.chronox_ai;
    return r[Math.floor(Math.random() * r.length)];
}

function attachMedia() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function() {
        var file = input.files[0];
        if (!file || !chatId) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            db.collection('chats').doc(chatId).collection('messages').add({
                senderId: currentUser.uid,
                text: '📷 Image',
                mediaUrl: e.target.result,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                seen: false
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

// Close modal on outside click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

console.log('✅ Chat system loaded');
