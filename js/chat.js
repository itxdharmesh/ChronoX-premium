// ==================== CHATS ====================
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
        h += '<div class="chat-item" onclick="openChat(\'ai_' + currentUser.uid + '_' + x.id + '\',\'' + x.id + '\',\'' + x.n + '\',\'' + x.a + '\',true)"><div class="av">' + x.a + '</div><div style="flex:1"><b>' + x.n + '</b><br><small style="color:rgba(255,255,255,0.5)">Tap to chat</small></div><small style="color:#2ED573">● Online</small></div>';
    });
    
    document.getElementById('chatList').innerHTML = h || '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No chats</p>';
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
    
    // AI REPLY - REAL GEMINI API
    if (chatUser.ai) {
        setTimeout(function() {
            var reply;
            
            if (typeof GEMINI_KEY !== 'undefined' && GEMINI_KEY) {
                // REAL AI
                var personality = '';
                if (chatUser.uid === 'annaya_ai') {
                    personality = 'You are Annaya, a 22-year-old female artist. You love poetry, painting, and nature. Reply like a real human girl - warm, friendly, use occasional emojis. Keep it 1-2 sentences.';
                } else if (chatUser.uid === 'tarun_ai') {
                    personality = 'You are Tarun, a 24-year-old male coder and gamer. You love technology, gaming, and sports. Reply like a real human guy - cool, casual, use abbreviations sometimes. Keep it 1-2 sentences.';
                } else if (chatUser.uid === 'chronox_ai') {
                    personality = 'You are ChronoX AI, the helpful assistant for the ChronoX social app. Help users with app features, achievements, streaks, privacy, and navigation. Be professional and friendly. Keep it 1-2 sentences.';
                }
                
                fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_KEY, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: personality + '\n\nFriend says: "' + t + '"\n\nYour natural reply:'
                            }]
                        }]
                    })
                })
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data.candidates && data.candidates[0]) {
                        reply = data.candidates[0].content.parts[0].text;
                    } else {
                        reply = getFallback(chatUser.uid);
                    }
                    saveAIReply(reply);
                })
                .catch(function() {
                    reply = getFallback(chatUser.uid);
                    saveAIReply(reply);
                });
            } else {
                reply = getFallback(chatUser.uid);
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

function getFallback(uid) {
    var replies = {
        annaya_ai: ["Hey! How are you? 😊", "That's interesting! Tell me more 💫", "I was just painting something new 🎨", "Life's beautiful! What about you?"],
        tarun_ai: ["Yo! What's up? 👋", "Coding all day bro 💻", "That's cool! Tell me more", "What games do you play? 🎮"],
        chronox_ai: ["How can I help you? 🕷️", "ChronoX has many features! Ask me anything.", "I'm here to assist you with the app!"]
    };
    var r = replies[uid] || replies.chronox_ai;
    return r[Math.floor(Math.random() * r.length)];
}

console.log('Chat loaded - Real AI Ready');
