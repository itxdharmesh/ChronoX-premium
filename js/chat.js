// ==================== CHATS ====================
let chatId = null;
let chatUser = null;
let chatListener = null;

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
    
    // AI users
    ai.forEach(function(x) {
        db.collection('chats').doc('ai_' + currentUser.uid + '_' + x.id).get().then(function(d) {
            var dd = d.data() || {};
            h += '<div class="chat-item" onclick="openChat(\'ai_' + currentUser.uid + '_' + x.id + '\',\'' + x.id + '\',\'' + x.n + '\',\'' + x.a + '\',true)"><div style="width:52px;height:52px;border-radius:50%;border:2px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:28px;background:#1a1f4e">' + x.a + '</div><div style="flex:1"><b>' + x.n + ' <span style="display:inline-block;width:16px;height:16px;background:#1E90FF;border-radius:50%;text-align:center;line-height:16px;font-size:10px;color:#fff">✓</span></b><br><small style="color:rgba(255,255,255,0.6)">' + (dd.lastMessage || 'Tap to chat') + '</small></div><small style="color:#2ED573">● Online</small></div>';
            document.getElementById('chatList').innerHTML = h;
        });
    });
    
    // Real users
    db.collection('chats').where('participants', 'array-contains', currentUser.uid).orderBy('lastMessageTime', 'desc').onSnapshot(function(snap) {
        snap.forEach(function(doc) {
            var chat = doc.data();
            var oid = chat.participants.find(function(id) { return id !== currentUser.uid; });
            if (['annaya_ai', 'tarun_ai', 'chronox_ai'].includes(oid)) return;
            
            db.collection('users').doc(oid).get().then(function(ud) {
                var u = ud.data();
                if (!u || (currentUserData.blockedUsers || []).includes(oid)) return;
                h += '<div class="chat-item" onclick="openChat(\'' + doc.id + '\',\'' + oid + '\',\'' + u.name + '\',\'' + (u.avatar || '') + '\')"><img class="chat-avatar" src="' + (u.avatar || av(u.name)) + '" onerror="this.src=av(\'' + u.name + '\')"><div style="flex:1"><b>' + u.name + '</b><br><small style="color:rgba(255,255,255,0.6)">' + (chat.lastMessage || '') + '</small></div><small style="color:var(--gold-light)">' + (chat.lastMessageTime ? tf(chat.lastMessageTime.toDate()) : '') + '</small></div>';
                document.getElementById('chatList').innerHTML = h;
            });
        });
    });
}

function openChat(cid, uid, name, avt, ai) {
    chatId = cid;
    chatUser = { uid: uid, name: name, avt: avt, ai: ai || false };
    
    document.getElementById('chatWindow').classList.add('show');
    document.getElementById('chatName').textContent = name;
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('msgInput').value = '';
    
    if (chatListener) chatListener();
    
    chatListener = db.collection('chats').doc(cid).collection('messages').orderBy('timestamp', 'asc').onSnapshot(function(snap) {
        var mc = document.getElementById('chatMessages');
        mc.innerHTML = '';
        snap.forEach(function(doc) {
            var m = doc.data();
            mc.innerHTML += '<div class="' + (m.senderId === currentUser.uid ? 'msg-sent' : 'msg-rec') + '">' + m.text + '<br><small style="opacity:0.7">' + (m.timestamp ? tf(m.timestamp.toDate()) : '') + '</small></div>';
        });
        mc.scrollTop = mc.scrollHeight;
    });
}

function closeChat() {
    document.getElementById('chatWindow').classList.remove('show');
    if (chatListener) chatListener();
    chatListener = null;
    chatId = null;
    chatUser = null;
}

function sendMsg() {
    var t = document.getElementById('msgInput').value.trim();
    if (!t || !chatId || !chatUser) return;
    
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
    
    document.getElementById('msgInput').value = '';
    
    // Update message count
    if (t.split(' ').length >= 5) {
        db.collection('users').doc(currentUser.uid).update({
            'stats.totalMessages': firebase.firestore.FieldValue.increment(1)
        });
    }
    
    // AI reply
    if (chatUser.ai) {
    setTimeout(function() {
        var reply;
        
        if (typeof GEMINI_KEY !== 'undefined' && GEMINI_KEY) {
            fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_KEY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'You are ' + chatUser.name + ' on a social app called ChronoX. Reply naturally like a human in 1-2 sentences to: "' + t + '"' }] }]
                })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                reply = data.candidates[0].content.parts[0].text;
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
        annaya_ai: ["Hey! How are you? 😊", "That's interesting! Tell me more 💫", "Just painting something new 🎨", "Life's good! What about you?"],
        tarun_ai: ["Yo! What's up? 👋", "Coding all day bro 💻", "That's cool! Tell me more", "What games do you play? 🎮"],
        chronox_ai: ["How can I help you? 🕷️", "ChronoX has many features! Ask me anything.", "I can help with the app. What do you need?"]
    };
    var r = replies[uid] || replies.chronox_ai;
    return r[Math.floor(Math.random() * r.length)];
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
        annaya_ai: ["Hey! How are you? 😊", "That's interesting! 💫", "Just painting 🎨", "Life's good!"],
        tarun_ai: ["Yo! 👋", "Coding all day 💻", "Cool bro!", "What games? 🎮"],
        chronox_ai: ["How can I help? 🕷️", "ChronoX has features!", "Ask me anything!"]
    };
    var r = replies[uid] || replies.chronox_ai;
    return r[Math.floor(Math.random() * r.length)];
}

console.log('Chat loaded');
